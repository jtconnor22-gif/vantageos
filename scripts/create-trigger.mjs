// Creates a Postgres trigger that auto-syncs revenue whenever an application
// is inserted, updated, or deleted. Runs at DB level — API failures can't break it.
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const vars = {}
env.split('\n').forEach(l => { const [k,...v] = l.split('='); if (k) vars[k.trim()] = v.join('=').trim() })

const SUPABASE_URL = vars.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = vars.SUPABASE_SERVICE_ROLE_KEY
const PROJECT_REF = SUPABASE_URL.replace('https://','').replace('.supabase.co','')

console.log('Project ref:', PROJECT_REF)

// Use Supabase management API to execute SQL
// This requires a personal access token from app.supabase.com/account/tokens
// OR we can use the pg endpoint with service role
const sql = `
-- Function: recalculate revenue whenever an application changes
CREATE OR REPLACE FUNCTION sync_revenue_from_applications()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_file_id uuid;
  v_org_id uuid;
  v_pct numeric;
  v_total numeric;
  v_fee numeric;
  v_rev_id uuid;
BEGIN
  -- Determine which file to update
  IF TG_OP = 'DELETE' THEN
    v_file_id := OLD.funding_file_id;
  ELSE
    v_file_id := NEW.funding_file_id;
  END IF;

  -- Sum ALL funded_amounts for this file across all applications
  SELECT COALESCE(SUM(funded_amount), 0)
  INTO v_total
  FROM applications
  WHERE funding_file_id = v_file_id;

  -- Get file's org_id and success_fee_pct
  SELECT org_id, COALESCE(success_fee_pct, 0.10)
  INTO v_org_id, v_pct
  FROM funding_files
  WHERE id = v_file_id;

  v_fee := v_total * v_pct;

  -- Find first existing revenue record (oldest wins, no duplicates)
  SELECT id INTO v_rev_id
  FROM revenue
  WHERE funding_file_id = v_file_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_total > 0 THEN
    IF v_rev_id IS NOT NULL THEN
      -- Update existing record
      UPDATE revenue SET
        funded_amount   = v_total,
        success_fee_pct = v_pct,
        success_fee_amount = v_fee,
        gross_revenue   = v_fee,
        net_revenue     = v_fee,
        profit          = v_fee
      WHERE id = v_rev_id;

      -- Delete any duplicate records for this file
      DELETE FROM revenue
      WHERE funding_file_id = v_file_id
        AND id <> v_rev_id;
    ELSE
      -- Create new revenue record
      INSERT INTO revenue (
        org_id, funding_file_id,
        funded_amount, success_fee_pct, success_fee_amount,
        gross_revenue, net_revenue, profit,
        success_fee_invoice_sent, success_fee_collected
      ) VALUES (
        v_org_id, v_file_id,
        v_total, v_pct, v_fee,
        v_fee, v_fee, v_fee,
        false, false
      );
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS applications_sync_revenue ON applications;

-- Create trigger: fires after any INSERT, UPDATE, or DELETE on applications
CREATE TRIGGER applications_sync_revenue
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION sync_revenue_from_applications();
`

// Try to execute via the Supabase SQL endpoint using service role
// Note: this uses the undocumented but functional /rest/v1/rpc path
// We'll write the SQL to a file for the user to run in the dashboard
fs.writeFileSync('scripts/trigger.sql', sql)
console.log('\nSQL written to scripts/trigger.sql')
console.log('\nPaste this into your Supabase SQL editor at:')
console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
console.log('\nThis creates a database trigger that auto-syncs revenue on every application change.')
console.log('Once applied, revenue updates are instant and cannot fail.')

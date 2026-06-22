// Run: node scripts/seed-revenue.mjs
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wkjiofzngsarchkwfzka.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndramlvZnpuZ3NhcmNoa3dmemthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjAxODQ2OSwiZXhwIjoyMDk3NTk0NDY5fQ.z4GmiqN1X87nnLL4kiHuO_P_uQYCNTN7X0DorquwDiM'
)

const ORG_ID = '00000000-0000-0000-0000-000000000001'

async function run() {
  // 1. Look up Christian's funding_file
  const { data: files, error: fetchErr } = await supabase
    .from('funding_files')
    .select('id, client_name, stage')
    .eq('org_id', ORG_ID)
    .ilike('client_name', '%christian%')

  if (fetchErr) { console.error('Error fetching files:', fetchErr); process.exit(1) }
  if (!files || files.length === 0) { console.error('No file found for Christian'); process.exit(1) }

  const file = files[0]
  console.log('Found funding file:', file.id, '-', file.client_name, '(stage:', file.stage + ')')

  // 2. Update stage to 'funded'
  const { error: stageErr } = await supabase
    .from('funding_files')
    .update({ stage: 'funded' })
    .eq('id', file.id)

  if (stageErr) { console.error('Error updating stage:', stageErr); process.exit(1) }
  console.log('✓ Stage updated to "funded"')

  // 3. Insert revenue record
  const { data: rev, error: revErr } = await supabase
    .from('revenue')
    .insert({
      org_id: ORG_ID,
      funding_file_id: file.id,
      funded_amount: 30000,
      success_fee_pct: 0.10,
      success_fee_amount: 3000,
      gross_revenue: 3000,
      net_revenue: 3000,
      profit: 3000,
      success_fee_invoice_sent: false,
      success_fee_collected: false,
    })
    .select()
    .single()

  if (revErr) { console.error('Error inserting revenue:', revErr); process.exit(1) }
  console.log('✓ Revenue record created:', rev.id)
  console.log('\n✅ Done! Christian Sifuentes revenue seeded successfully.')
}

run().catch(console.error)

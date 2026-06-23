import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wkjiofzngsarchkwfzka.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndramlvZnpuZ3NhcmNoa3dmemthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjAxODQ2OSwiZXhwIjoyMDk3NTk0NDY5fQ.z4GmiqN1X87nnLL4kiHuO_P_uQYCNTN7X0DorquwDiM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // First, check what's in profiles to understand the data
  const { data: allProfiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('full_name', ['Justin McNeil', 'Justin Connor', 'Grace McNeil']);

  if (fetchError) {
    console.error('Error fetching profiles:', fetchError);
    process.exit(1);
  }

  console.log('Current matching profiles:', allProfiles);

  // Update Justin McNeil (admin) -> Justin Connor
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: 'Justin Connor' })
    .eq('full_name', 'Justin McNeil')
    .eq('role', 'admin')
    .select();

  if (error) {
    console.error('Error updating profile:', error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log(`Successfully updated ${data.length} row(s):`);
    data.forEach(row => console.log(`  id=${row.id}, full_name=${row.full_name}, role=${row.role}`));
  } else {
    console.log('No rows matched the criteria (Justin McNeil with role=admin). Nothing was updated.');
  }
}

main();

// Run: node scripts/seed-clients.mjs
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wkjiofzngsarchkwfzka.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndramlvZnpuZ3NhcmNoa3dmemthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjAxODQ2OSwiZXhwIjoyMDk3NTk0NDY5fQ.z4GmiqN1X87nnLL4kiHuO_P_uQYCNTN7X0DorquwDiM'
)

async function run() {
  // 1. Get the org
  const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
  const org_id = orgs[0].id
  console.log('org_id:', org_id)

  // 2. Get Justin's profile (admin)
  const { data: profiles } = await supabase.from('profiles').select('id, full_name').eq('org_id', org_id)
  console.log('profiles:', profiles)
  const justin = profiles.find(p => p.full_name?.toLowerCase().includes('justin') || p.full_name?.toLowerCase().includes('mcneil'))
  const assigned_user_id = justin?.id ?? profiles[0]?.id
  console.log('assigned to:', justin?.full_name ?? profiles[0]?.full_name)

  // 3. Delete all test / placeholder funding files
  const { data: testFiles } = await supabase
    .from('funding_files')
    .select('id, client_name')
    .eq('org_id', org_id)
  console.log('existing files:', testFiles?.map(f => f.client_name))

  if (testFiles?.length) {
    const { error: delErr } = await supabase
      .from('funding_files')
      .delete()
      .eq('org_id', org_id)
    if (delErr) console.error('delete error:', delErr)
    else console.log('✓ Cleared', testFiles.length, 'test files')
  }

  // 4. Ensure lenders exist
  const lenderNames = ['American Express', 'Bank of America', 'Flagstar Bank']
  const lenderMap = {}
  for (const name of lenderNames) {
    const { data: existing } = await supabase.from('lenders').select('id').eq('org_id', org_id).eq('name', name).single()
    if (existing) {
      lenderMap[name] = existing.id
    } else {
      const { data: created } = await supabase.from('lenders').insert({ org_id, name }).select('id').single()
      lenderMap[name] = created.id
    }
    console.log(`lender: ${name} → ${lenderMap[name]}`)
  }

  // 5. Insert Christian Sifuentes
  const { data: christian, error: cErr } = await supabase
    .from('funding_files')
    .insert({
      org_id,
      client_name: 'Christian Sifuentes',
      business_name: null,
      email: null,
      phone: null,
      stage: 'submitted_for_funding',
      funding_goal: 30000,
      funding_type: 'Business Credit Cards',
      success_fee_pct: 10,
      assigned_user_id,
    })
    .select('id, file_code')
    .single()
  if (cErr) { console.error('christian insert error:', cErr); return }
  console.log('✓ Created Christian:', christian.file_code, christian.id)

  // 6. Add Christian's applications (from Master Funding Dashboard)
  const christianApps = [
    { lender: 'American Express', product_name: 'Blue Business Cash', status: 'approved', submitted_date: '2026-06-17', decision_date: '2026-06-19', approved_amount: 10000, notes: 'Nav.com affiliate | Experian pull' },
    { lender: 'Flagstar Bank',    product_name: 'Absolute Rewards',   status: 'submitted', submitted_date: '2026-06-17', notes: 'No affiliate link | Experian pull' },
    { lender: 'American Express', product_name: 'Blue Business Plus',  status: 'submitted', submitted_date: '2026-06-20', notes: 'Nav.com affiliate | Experian pull' },
    { lender: 'Bank of America',  product_name: 'Business Advantage Unlimited Cash Rewards', status: 'approved', submitted_date: '2026-06-17', decision_date: '2026-06-17', approved_amount: 9000,  notes: 'Nav.com affiliate | Experian pull' },
    { lender: 'Bank of America',  product_name: 'Business Travel Rewards', status: 'approved', submitted_date: '2026-06-17', decision_date: '2026-06-17', approved_amount: 4000,  notes: 'Nav.com affiliate | Experian pull' },
    { lender: 'Bank of America',  product_name: 'Business Customized Cash Rewards', status: 'approved', submitted_date: '2026-06-17', decision_date: '2026-06-17', approved_amount: 2000,  notes: 'Nav.com affiliate | Experian pull' },
    { lender: 'Bank of America',  product_name: 'Business Advantage Unlimited (Small)', status: 'approved', submitted_date: '2026-06-17', decision_date: '2026-06-17', approved_amount: 5000,  notes: 'Nav.com affiliate | Experian pull' },
  ]

  for (const app of christianApps) {
    const { error: aErr } = await supabase.from('applications').insert({
      org_id,
      funding_file_id: christian.id,
      lender_id: lenderMap[app.lender],
      product_name: app.product_name,
      status: app.status,
      submitted_date: app.submitted_date,
      decision_date: app.decision_date ?? null,
      approved_amount: app.approved_amount ?? null,
      notes: app.notes,
    })
    if (aErr) console.error(`app error (${app.product_name}):`, aErr)
    else console.log(`  ✓ App: ${app.lender} – ${app.product_name} [${app.status}]`)
  }

  // 7. Insert Priscilla (HELOC - Pending) — add details when available
  const { data: priscilla, error: pErr } = await supabase
    .from('funding_files')
    .insert({
      org_id,
      client_name: 'Priscilla',
      stage: 'application_submitted',
      funding_type: 'HELOC',
      success_fee_pct: 10,
      assigned_user_id,
    })
    .select('id, file_code')
    .single()
  if (pErr) console.error('priscilla error:', pErr)
  else console.log('✓ Created Priscilla:', priscilla.file_code)

  // 8. Insert Ramon (HELOC - Pending) — add details when available
  const { data: ramon, error: rErr } = await supabase
    .from('funding_files')
    .insert({
      org_id,
      client_name: 'Ramon',
      stage: 'application_submitted',
      funding_type: 'HELOC',
      success_fee_pct: 10,
      assigned_user_id,
    })
    .select('id, file_code')
    .single()
  if (rErr) console.error('ramon error:', rErr)
  else console.log('✓ Created Ramon:', ramon.file_code)

  console.log('\n✅ Seed complete. Refresh the app to see live data.')
}

run().catch(console.error)

// One-time script: recalculate revenue records from application funded_amounts.
// Run: node scripts/sync-revenue.mjs
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wkjiofzngsarchkwfzka.supabase.co'

// Read service role key from env or paste directly for one-time use
const fs = (await import('fs')).default
const envRaw = fs.readFileSync('.env.local', 'utf8')
const SERVICE_KEY = envRaw.split('\n')
  .find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))
  ?.split('=').slice(1).join('=').trim()

if (!SERVICE_KEY) { console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local'); process.exit(1) }

const admin = createClient(SUPABASE_URL, SERVICE_KEY)
const ORG_ID = '00000000-0000-0000-0000-000000000001'

const { data: files, error: filesErr } = await admin
  .from('funding_files')
  .select('id, client_name, success_fee_pct, org_id')
  .eq('org_id', ORG_ID)

if (filesErr) { console.error('files error:', filesErr); process.exit(1) }
console.log(`Found ${files.length} files\n`)

for (const file of files) {
  const { data: apps } = await admin
    .from('applications')
    .select('funded_amount, status, product_name')
    .eq('funding_file_id', file.id)

  const totalFunded = (apps ?? []).reduce((sum, a) => sum + (parseFloat(a.funded_amount) || 0), 0)

  console.log(`${file.client_name}:`)
  ;(apps ?? []).filter(a => a.funded_amount).forEach(a =>
    console.log(`  - ${a.product_name}: $${a.funded_amount} (${a.status})`)
  )
  console.log(`  → Total funded from apps: $${totalFunded}`)

  if (totalFunded <= 0) { console.log('  Skipping (no funded apps)\n'); continue }

  const pct = file.success_fee_pct ?? 0.10
  const fee = Math.round(totalFunded * pct * 100) / 100

  const { data: revRows } = await admin
    .from('revenue')
    .select('id, funded_amount')
    .eq('funding_file_id', file.id)
    .order('created_at', { ascending: true })

  if (revRows?.length > 0) {
    const keepId = revRows[0].id
    const { error } = await admin.from('revenue')
      .update({ funded_amount: totalFunded, success_fee_amount: fee, gross_revenue: fee, net_revenue: fee, profit: fee, success_fee_pct: pct })
      .eq('id', keepId)
    if (error) { console.error('  Update error:', error.message); continue }
    console.log(`  Updated: $${totalFunded} funded, $${fee} fee (pct: ${pct*100}%)`)

    if (revRows.length > 1) {
      await admin.from('revenue').delete().eq('funding_file_id', file.id).neq('id', keepId)
      console.log(`  Deleted ${revRows.length - 1} duplicate(s)`)
    }
  } else {
    const { error } = await admin.from('revenue').insert([{
      org_id: file.org_id, funding_file_id: file.id,
      funded_amount: totalFunded, success_fee_pct: pct,
      success_fee_amount: fee, gross_revenue: fee, net_revenue: fee, profit: fee,
      success_fee_invoice_sent: false, success_fee_collected: false,
    }])
    if (error) { console.error('  Insert error:', error.message); continue }
    console.log(`  Created: $${totalFunded} funded, $${fee} fee`)
  }
  console.log()
}
console.log('Done.')

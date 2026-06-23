import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function syncRevenue(fundingFileId: string): Promise<{ error?: string }> {
  const admin = getAdminClient()

  const { data: apps, error: appsErr } = await (admin as any)
    .from('applications')
    .select('funded_amount')
    .eq('funding_file_id', fundingFileId)

  if (appsErr) return { error: `apps query: ${appsErr.message}` }

  const totalFunded = (apps ?? []).reduce(
    (sum: number, a: any) => sum + (parseFloat(a.funded_amount) || 0),
    0
  )

  if (totalFunded <= 0) return {}

  const { data: file, error: fileErr } = await (admin as any)
    .from('funding_files')
    .select('org_id, success_fee_pct')
    .eq('id', fundingFileId)
    .single()

  if (fileErr || !file) return { error: `file query: ${fileErr?.message}` }

  const pct = file.success_fee_pct ?? 0.10
  const fee = totalFunded * pct

  const { data: existing, error: revErr } = await (admin as any)
    .from('revenue')
    .select('id')
    .eq('funding_file_id', fundingFileId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (revErr) return { error: `revenue select: ${revErr.message}` }

  const record = existing?.[0]

  if (record) {
    const { error: updErr } = await (admin as any)
      .from('revenue')
      .update({
        funded_amount: totalFunded,
        success_fee_pct: pct,
        success_fee_amount: fee,
        gross_revenue: fee,
        net_revenue: fee,
        profit: fee,
      })
      .eq('id', record.id)

    if (updErr) return { error: `revenue update: ${updErr.message}` }

    await (admin as any)
      .from('revenue')
      .delete()
      .eq('funding_file_id', fundingFileId)
      .neq('id', record.id)
  } else {
    const { error: insErr } = await (admin as any)
      .from('revenue')
      .insert([{
        org_id: file.org_id,
        funding_file_id: fundingFileId,
        funded_amount: totalFunded,
        success_fee_pct: pct,
        success_fee_amount: fee,
        gross_revenue: fee,
        net_revenue: fee,
        profit: fee,
        success_fee_invoice_sent: false,
        success_fee_collected: false,
      }])

    if (insErr) return { error: `revenue insert: ${insErr.message}` }
  }

  return {}
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: pd } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!pd) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const profile = pd as Profile

    const body = await request.json()
    const { funding_file_id, lender_id, product_name, category, notes, status, approved_amount, funded_amount, submitted_date, decision_date } = body

    if (!funding_file_id) return NextResponse.json({ error: 'funding_file_id required' }, { status: 400 })

    const qb = supabase.from('applications') as any
    const { data, error } = await qb.insert([{
      org_id: profile.org_id,
      funding_file_id,
      lender_id: lender_id || null,
      product_name: product_name || null,
      category: category || null,
      notes: notes || null,
      status: status || 'draft',
      approved_amount: approved_amount ?? null,
      funded_amount: funded_amount ?? null,
      submitted_date: submitted_date || null,
      decision_date: decision_date || null,
    }]).select().single()

    if (error) throw error

    // Sync revenue synchronously so errors are visible
    const syncErr = await syncRevenue(funding_file_id)
    if (syncErr.error) console.error('[POST syncRevenue]', syncErr.error)

    return NextResponse.json({ ...data, _syncError: syncErr.error ?? null }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

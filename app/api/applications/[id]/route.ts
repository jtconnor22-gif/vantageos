import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Create admin client inside functions — NOT at module level — so env vars
// are guaranteed to be populated in the Vercel runtime (not just at cold start).
function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Sum ALL applications.funded_amount for a file and update the revenue record.
// Uses .limit(1) + array index instead of .maybeSingle() to avoid the
// "multiple rows" error that occurs when duplicate revenue records exist.
async function syncRevenue(fundingFileId: string): Promise<{ error?: string }> {
  const admin = getAdminClient()

  // 1. Sum every application's funded_amount for this file
  const { data: apps, error: appsErr } = await (admin as any)
    .from('applications')
    .select('funded_amount')
    .eq('funding_file_id', fundingFileId)

  if (appsErr) return { error: `apps query: ${appsErr.message}` }

  const totalFunded = (apps ?? []).reduce(
    (sum: number, a: any) => sum + (parseFloat(a.funded_amount) || 0),
    0
  )

  if (totalFunded <= 0) return {} // no funded amounts yet

  // 2. Fetch the file for org_id + success_fee_pct
  const { data: file, error: fileErr } = await (admin as any)
    .from('funding_files')
    .select('org_id, success_fee_pct')
    .eq('id', fundingFileId)
    .single()

  if (fileErr || !file) return { error: `file query: ${fileErr?.message}` }

  const pct = file.success_fee_pct ?? 0.10
  const fee = totalFunded * pct

  // 3. Find existing revenue record (use limit(1) — NOT maybeSingle — to handle duplicates)
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

    // Remove any duplicate revenue records for this file
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

async function syncFileStage(fundingFileId: string, appStatus: string) {
  const admin = getAdminClient()

  const { data: file } = await (admin as any)
    .from('funding_files')
    .select('stage')
    .eq('id', fundingFileId)
    .single()

  if (!file) return

  const stage: string = file.stage

  if (appStatus === 'funded' && !['funded', 'success_fee_invoice_sent', 'success_fee_collected'].includes(stage)) {
    await (admin as any).from('funding_files').update({ stage: 'funded' }).eq('id', fundingFileId)
  } else if ((appStatus === 'submitted' || appStatus === 'in_review') &&
    ['lead_received', 'appointment_scheduled', 'consultation_completed', 'application_sent'].includes(stage)) {
    await (admin as any).from('funding_files').update({ stage: 'application_submitted' }).eq('id', fundingFileId)
  } else if (appStatus === 'approved' &&
    ['lead_received', 'appointment_scheduled', 'consultation_completed', 'application_sent',
      'application_submitted', 'documents_requested', 'documents_received'].includes(stage)) {
    await (admin as any).from('funding_files').update({ stage: 'conditions_before_submission' }).eq('id', fundingFileId)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const qb = supabase.from('applications') as any
    const { data, error } = await qb.update(body).eq('id', id).select().single()
    if (error) throw error

    // Run side effects synchronously so errors surface in the response
    const syncErr = await syncRevenue(data.funding_file_id)
    if (syncErr.error) {
      console.error('[PATCH syncRevenue]', syncErr.error)
      // Still return success for the app update — revenue sync failure is non-fatal
      // but log it so we can debug
    }
    await syncFileStage(data.funding_file_id, data.status)

    return NextResponse.json({ ...data, _syncError: syncErr.error ?? null })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

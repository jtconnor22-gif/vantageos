import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const adminClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Recalculate and sync the revenue record for a funding file by summing ALL
// funded applications for that file, not just the one being updated.
async function syncRevenue(fundingFileId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: apps } = await (adminClient as any)
    .from('applications')
    .select('funded_amount')
    .eq('funding_file_id', fundingFileId)

  const totalFunded = (apps ?? []).reduce((sum: number, a: any) =>
    sum + (parseFloat(a.funded_amount) || 0), 0)

  if (totalFunded <= 0) return // nothing to sync

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (adminClient as any)
    .from('revenue')
    .select('id, success_fee_pct')
    .eq('funding_file_id', fundingFileId)
    .maybeSingle()

  if (existing) {
    const pct = existing.success_fee_pct ?? 0.10
    const fee = totalFunded * pct
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from('revenue')
      .update({
        funded_amount: totalFunded,
        success_fee_amount: fee,
        gross_revenue: fee,
        net_revenue: fee,
        profit: fee,
      })
      .eq('id', existing.id)
  } else {
    // Need org_id to insert — fetch from the file
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: file } = await (adminClient as any)
      .from('funding_files')
      .select('org_id')
      .eq('id', fundingFileId)
      .single()

    if (!file) return

    const fee = totalFunded * 0.10
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from('revenue')
      .insert([{
        org_id: file.org_id,
        funding_file_id: fundingFileId,
        funded_amount: totalFunded,
        success_fee_pct: 0.10,
        success_fee_amount: fee,
        gross_revenue: fee,
        net_revenue: fee,
        profit: fee,
        success_fee_invoice_sent: false,
        success_fee_collected: false,
      }])
  }
}

async function runSideEffects(app: {
  id: string
  org_id: string
  funding_file_id: string
  status: string
  funded_amount: number | null
  approved_amount: number | null
}) {
  const { funding_file_id, status } = app

  // ── A. Revenue sync ───────────────────────────────────────────────────
  // Always re-sum ALL applications for the file so the revenue record is correct
  // regardless of how many applications have been funded.
  await syncRevenue(funding_file_id)

  // ── B. File stage sync ───────────────────────────────────────────────
  // Fetch current file stage once
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: file } = await (adminClient as any)
    .from('funding_files')
    .select('stage')
    .eq('id', funding_file_id)
    .single()

  if (!file) return

  const currentStage: string = file.stage

  if (status === 'funded') {
    // Move to funded unless already at/past funded
    if (!['funded', 'success_fee_invoice_sent', 'success_fee_collected'].includes(currentStage)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('funding_files')
        .update({ stage: 'funded' })
        .eq('id', funding_file_id)
    }
  } else if (status === 'submitted' || status === 'in_review') {
    // Only advance if file is still in early stages
    const forwardFrom = [
      'lead_received', 'appointment_scheduled', 'consultation_completed', 'application_sent',
    ]
    if (forwardFrom.includes(currentStage)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('funding_files')
        .update({ stage: 'application_submitted' })
        .eq('id', funding_file_id)
    }
  } else if (status === 'approved') {
    // Advance to conditions_before_submission if not already there or beyond
    const forwardFrom = [
      'lead_received', 'appointment_scheduled', 'consultation_completed',
      'application_sent', 'application_submitted', 'documents_requested', 'documents_received',
    ]
    if (forwardFrom.includes(currentStage)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('funding_files')
        .update({ stage: 'conditions_before_submission' })
        .eq('id', funding_file_id)
    }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qb = supabase.from('applications') as any
    const { data, error } = await qb.update(body).eq('id', id).select().single()
    if (error) throw error

    // Run side effects — fire and don't block the response
    runSideEffects(data).catch(err => console.error('[app PATCH side-effects]', err))

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

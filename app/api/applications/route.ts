import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

const adminClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function runSideEffects(app: {
  id: string
  org_id: string
  funding_file_id: string
  status: string
  funded_amount: number | null
  approved_amount: number | null
}) {
  const { org_id, funding_file_id, status, funded_amount } = app

  // ── A. Revenue upsert ───────────────────────────────────────────
  if (status === 'funded' && funded_amount && funded_amount > 0) {
    const success_fee_amount = funded_amount * 0.10
    const gross_revenue = success_fee_amount
    const net_revenue = success_fee_amount
    const profit = success_fee_amount

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingRevenue } = await (adminClient as any)
      .from('revenue')
      .select('id, success_fee_pct')
      .eq('funding_file_id', funding_file_id)
      .maybeSingle()

    if (existingRevenue) {
      const pct = existingRevenue.success_fee_pct ?? 0.10
      const fee = funded_amount * pct
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('revenue')
        .update({
          funded_amount,
          success_fee_amount: fee,
          gross_revenue: fee,
          net_revenue: fee,
          profit: fee,
        })
        .eq('id', existingRevenue.id)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('revenue')
        .insert([{
          org_id,
          funding_file_id,
          funded_amount,
          success_fee_pct: 0.10,
          success_fee_amount,
          gross_revenue,
          net_revenue,
          profit,
          success_fee_invoice_sent: false,
          success_fee_collected: false,
        }])
    }
  }

  // ── B. File stage sync ──────────────────────────────────────────
  if (status === 'funded') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: file } = await (adminClient as any)
      .from('funding_files')
      .select('stage')
      .eq('id', funding_file_id)
      .single()

    if (file && !['funded', 'success_fee_invoice_sent', 'success_fee_collected'].includes(file.stage)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('funding_files')
        .update({ stage: 'funded' })
        .eq('id', funding_file_id)
    }
  } else if (status === 'submitted' || status === 'in_review') {
    const forwardFromStages = [
      'lead_received', 'appointment_scheduled', 'consultation_completed',
      'application_sent',
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: file } = await (adminClient as any)
      .from('funding_files')
      .select('stage')
      .eq('id', funding_file_id)
      .single()

    if (file && forwardFromStages.includes(file.stage)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('funding_files')
        .update({ stage: 'application_submitted' })
        .eq('id', funding_file_id)
    }
  } else if (status === 'approved') {
    const approvedForwardFrom = [
      'lead_received', 'appointment_scheduled', 'consultation_completed',
      'application_sent', 'application_submitted', 'documents_requested', 'documents_received',
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: file } = await (adminClient as any)
      .from('funding_files')
      .select('stage')
      .eq('id', funding_file_id)
      .single()

    if (file && approvedForwardFrom.includes(file.stage)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('funding_files')
        .update({ stage: 'conditions_before_submission' })
        .eq('id', funding_file_id)
    }
  }
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Run side effects if initial status warrants it
    const initialStatus = status || 'draft'
    if (['funded', 'approved', 'submitted', 'in_review'].includes(initialStatus)) {
      runSideEffects(data).catch(err => console.error('[side-effects POST]', err))
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

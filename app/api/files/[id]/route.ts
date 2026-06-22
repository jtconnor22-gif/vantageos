import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const {
      client_name,
      business_name,
      email,
      phone,
      state,
      industry,
      time_in_business,
      monthly_revenue,
      funding_goal,
      funding_type,
      est_fico,
      current_status,
      next_follow_up,
      last_contact_date,
    } = body

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qb = supabase.from('funding_files') as any
    const { data, error } = await qb
      .update({
        client_name: client_name || undefined,
        business_name: business_name ?? null,
        email: email ?? null,
        phone: phone ?? null,
        state: state ?? null,
        industry: industry ?? null,
        time_in_business: time_in_business ?? null,
        monthly_revenue: monthly_revenue != null ? Number(monthly_revenue) : null,
        funding_goal: funding_goal != null ? Number(funding_goal) : null,
        funding_type: funding_type ?? null,
        est_fico: est_fico != null ? Number(est_fico) : null,
        current_status: current_status ?? null,
        next_followup_date: next_follow_up ?? null,
        last_contact_date: last_contact_date ?? null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

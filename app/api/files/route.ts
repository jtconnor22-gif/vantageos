import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const profile = profileData as Profile

    if (!['admin', 'funding_manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      client_name,
      business_name,
      email,
      phone,
      funding_goal,
      funding_type,
      referral_partner_id,
    } = body

    if (!client_name?.trim()) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qb = supabase.from('funding_files') as any
    const { data: file, error } = await qb.insert([{
        org_id: profile.org_id,
        client_name: client_name.trim(),
        business_name: business_name?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        funding_goal: funding_goal || null,
        funding_type: funding_type?.trim() || null,
        referral_partner_id: referral_partner_id || null,
        assigned_user_id: user.id,
        stage: 'lead_received',
      }])
      .select('id, file_code')
      .single()

    if (error) throw error

    return NextResponse.json(file, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

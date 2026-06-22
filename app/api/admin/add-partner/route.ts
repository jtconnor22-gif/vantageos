import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: pd } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!pd) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const profile = pd as Profile

    if (!['admin', 'funding_manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, company, email, phone, commission_pct, notes } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('referral_partners') as any).insert([{
      org_id: profile.org_id,
      name,
      company: company || null,
      email: email || null,
      phone: phone || null,
      commission_pct: commission_pct ?? 0,
      notes: notes || null,
    }]).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, partner: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

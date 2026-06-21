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

    const body = await request.json()
    const { funding_file_id, name, tier, status } = body
    if (!funding_file_id || !name) return NextResponse.json({ error: 'funding_file_id and name required' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qb = supabase.from('documents') as any
    const { data, error } = await qb.insert([{
      org_id: profile.org_id,
      funding_file_id,
      name: name.trim(),
      tier: tier ?? 'required',
      status: status ?? 'missing',
    }]).select().single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

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
    const { title, funding_file_id, due_date, priority, assigned_user_id, notes } = body
    if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qb = supabase.from('tasks') as any
    const { data, error } = await qb.insert([{
      org_id: profile.org_id,
      title: title.trim(),
      funding_file_id: funding_file_id || null,
      due_date: due_date || null,
      priority: priority ?? 'medium',
      assigned_user_id: assigned_user_id || user.id,
      notes: notes || null,
      status: 'open',
    }]).select().single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

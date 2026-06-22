import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: pd } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!pd) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const profile = pd as Profile

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can invite users' }, { status: 403 })
    }

    const body = await request.json()
    const { full_name, email, role } = body

    if (!full_name || !email || !role) {
      return NextResponse.json({ error: 'full_name, email, and role are required' }, { status: 400 })
    }

    if (!['funding_manager', 'virtual_assistant'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password: 'TempPass123!',
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (createError) throw createError
    if (!data.user) throw new Error('User creation failed')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (adminSupabase.from('profiles') as any).insert([{
      id: data.user.id,
      org_id: profile.org_id,
      full_name,
      email,
      role,
    }])

    if (profileError) {
      // Clean up the auth user if profile insert fails
      await adminSupabase.auth.admin.deleteUser(data.user.id)
      throw profileError
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

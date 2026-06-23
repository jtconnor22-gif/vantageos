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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Server configuration error: missing Supabase credentials' }, { status: 500 })
    }

    const adminSupabase = createAdminClient(url, serviceKey)

    // Use inviteUserByEmail — sends a proper invite email and is the
    // recommended Supabase pattern. The user clicks the link and sets their password.
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://vantageos-six.vercel.app'}/auth/callback`

    const { data, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { full_name },
    })

    if (inviteError) {
      // Surface the exact Supabase error so we can debug
      return NextResponse.json(
        { error: `Supabase invite error: ${inviteError.message}` },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Invite created but no user returned' }, { status: 500 })
    }

    // Pre-create the profile so the user has the right role/org on first login
    const { error: profileError } = await (adminSupabase.from('profiles') as any).upsert([{
      id: data.user.id,
      org_id: profile.org_id,
      full_name,
      email,
      role,
    }], { onConflict: 'id' })

    if (profileError) {
      // Don't fail — the invite email was sent. Log and continue.
      console.error('[invite-user] profile upsert error:', profileError.message)
    }

    return NextResponse.json({ success: true, userId: data.user.id }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[invite-user] caught error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

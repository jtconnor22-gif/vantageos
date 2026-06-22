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
      return NextResponse.json({ error: 'Only admins can reset passwords' }, { status: 403 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Ensure target is in same org
    const { data: targetPd } = await supabase.from('profiles').select('org_id, email').eq('id', userId).single()
    if (!targetPd || (targetPd as { org_id: string }).org_id !== profile.org_id) {
      return NextResponse.json({ error: 'User not found in your org' }, { status: 404 })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
      password: 'TempPass123!',
    })

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Password reset to TempPass123!' })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

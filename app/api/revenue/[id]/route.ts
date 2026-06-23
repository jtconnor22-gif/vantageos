import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const adminClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check role — only admin or funding_manager
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'funding_manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { fee_status } = body as { fee_status: 'pending' | 'invoiced' | 'collected' }

    if (!fee_status || !['pending', 'invoiced', 'collected'].includes(fee_status)) {
      return NextResponse.json({ error: 'fee_status must be pending | invoiced | collected' }, { status: 400 })
    }

    // Map fee_status string → boolean fields on the revenue table
    const update: Record<string, boolean | string | null> = {
      success_fee_invoice_sent: fee_status === 'invoiced' || fee_status === 'collected',
      success_fee_collected: fee_status === 'collected',
      collection_date: fee_status === 'collected' ? new Date().toISOString().split('T')[0] : null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminClient as any)
      .from('revenue')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

// Public intake — uses service role to bypass auth RLS
const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { full_name, business_name, email, phone, funding_goal, funding_type, monthly_revenue, time_in_business, notes } = body

    if (!full_name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Name, email, and phone are required.' }, { status: 400 })
    }

    const goalNum = funding_goal ? parseFloat(String(funding_goal).replace(/[^0-9.]/g, '')) : null

    const qb = adminClient.from('funding_files') as any
    const { data, error } = await qb
      .insert([{
        org_id: DEFAULT_ORG_ID,
        client_name: full_name.trim(),
        business_name: business_name?.trim() || null,
        email: email.trim(),
        phone: phone.trim(),
        funding_goal: goalNum || null,
        funding_type: funding_type || null,
        stage: 'lead_received',
        current_status: [
          time_in_business ? `Time in business: ${time_in_business}` : null,
          monthly_revenue ? `Monthly revenue: ${monthly_revenue}` : null,
          notes ? `Notes: ${notes}` : null,
        ].filter(Boolean).join(' | ') || null,
      }])
      .select('id, file_code')
      .single()

    if (error) {
      console.error('intake insert error:', error)
      return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, file_code: data.file_code }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

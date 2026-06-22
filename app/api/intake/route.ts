import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      first_name, last_name, dob, ssn_last4, email, phone,
      address, city, state, zip,
      business_name, business_type, ein, industry, time_in_business, num_employees,
      business_address_same, business_address,
      monthly_revenue, annual_revenue, funding_goal, funding_purpose, funding_type,
      primary_bank, bank_account_type,
      estimated_credit_score, any_negative_items, negative_details, existing_business_credit,
      bankruptcy_history,
      referral_source, referral_name, referral_partner_id,
    } = body

    if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'First name, last name, email, and phone are required.' }, { status: 400 })
    }

    const client_name = `${first_name.trim()} ${last_name.trim()}`
    const goalNum = funding_goal ? parseFloat(String(funding_goal).replace(/[^0-9.]/g, '')) : null

    // Build notes from all extra fields
    const noteLines = [
      dob ? `DOB: ${dob}` : null,
      ssn_last4 ? `SSN Last 4: ${ssn_last4}` : null,
      address ? `Home: ${[address, city, state, zip].filter(Boolean).join(', ')}` : null,
      business_type ? `Biz Type: ${business_type}` : null,
      ein ? `EIN: ${ein}` : null,
      industry ? `Industry: ${industry}` : null,
      time_in_business ? `Time in Business: ${time_in_business}` : null,
      num_employees ? `Employees: ${num_employees}` : null,
      business_address_same === 'no' && business_address ? `Biz Address: ${business_address}` : null,
      monthly_revenue ? `Monthly Revenue: ${monthly_revenue}` : null,
      annual_revenue ? `Annual Revenue: ${annual_revenue}` : null,
      funding_purpose ? `Purpose: ${funding_purpose}` : null,
      primary_bank ? `Bank: ${primary_bank}` : null,
      bank_account_type ? `Account Type: ${bank_account_type}` : null,
      estimated_credit_score ? `Credit Score Est: ${estimated_credit_score}` : null,
      any_negative_items === 'yes' ? `Negative Items: YES${negative_details ? ` — ${negative_details}` : ''}` : null,
      existing_business_credit === 'yes' ? `Existing Biz Credit: YES` : null,
      bankruptcy_history === 'yes' ? `Bankruptcy: YES` : null,
      referral_source ? `Source: ${referral_source}` : null,
      referral_name ? `Referred by: ${referral_name}` : null,
    ].filter(Boolean).join('\n')

    const qb = adminClient.from('funding_files') as any
    const { data, error } = await qb
      .insert([{
        org_id: DEFAULT_ORG_ID,
        client_name,
        business_name: business_name?.trim() || null,
        email: email.trim(),
        phone: phone.trim(),
        funding_goal: goalNum || null,
        funding_type: funding_type || null,
        stage: 'lead_received',
        current_status: noteLines || null,
        referral_partner_id: referral_partner_id || null,
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

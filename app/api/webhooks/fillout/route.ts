import { NextRequest, NextResponse } from 'next/server'

// Fillout webhook payload shape (Phase 2 will process these fully)
interface FilloutSubmission {
  submissionId: string
  submissionTime: string
  formId: string
  questions: Array<{
    id: string
    name: string
    type: string
    value: unknown
  }>
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.FILLOUT_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-fillout-signature')
      if (!signature || signature !== webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body: FilloutSubmission = await request.json()

    console.log('[Fillout Webhook] Received submission:', {
      submissionId: body.submissionId,
      formId: body.formId,
      submittedAt: body.submissionTime,
      fieldCount: body.questions?.length ?? 0,
    })

    // Phase 2: Parse Fillout fields → create funding_file record
    // Map common field names to funding_files columns:
    // - "Full Name" / "Client Name" → client_name
    // - "Business Name" → business_name
    // - "Email" → email
    // - "Phone" → phone
    // - "State" → state
    // - "Monthly Revenue" → monthly_revenue
    // - "Funding Goal" → funding_goal
    // etc.

    // For now, just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook received. Full processing coming in Phase 2.',
      submissionId: body.submissionId,
    })
  } catch (error) {
    console.error('[Fillout Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle GET for webhook verification (some services ping with GET)
export async function GET() {
  return NextResponse.json({ status: 'Fillout webhook endpoint active' })
}

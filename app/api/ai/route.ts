import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, fileId, context } = body

    // Phase 4: This will call the Claude API with file context
    // For now, return mock responses based on prompt type

    const mockResponses: Record<string, string> = {
      summary: `This file is progressing well through the pipeline. The client has submitted all required documents and is currently awaiting underwriting review. Next step: follow up with the lender within 2 business days.`,
      followup: `Hi [Client Name], I wanted to touch base regarding your funding application. We've received your documents and are currently working with our lending partners to find the best solution for your needs. I'll have an update for you by [Date]. Please don't hesitate to reach out if you have any questions.`,
      gap_analysis: `Missing documents: Business Tax Returns (2022, 2023), Personal Tax Returns (2022). These are required for the SBA application. Recommend sending a document request via email today.`,
      default: `AI analysis for file ${fileId ?? 'unknown'}. Full AI capabilities including status summaries, follow-up drafts, and pipeline insights will be available in Phase 4.`,
    }

    const responseText =
      prompt?.toLowerCase().includes('summary')
        ? mockResponses.summary
        : prompt?.toLowerCase().includes('follow')
        ? mockResponses.followup
        : prompt?.toLowerCase().includes('document') || prompt?.toLowerCase().includes('gap')
        ? mockResponses.gap_analysis
        : mockResponses.default

    return NextResponse.json({
      success: true,
      text: responseText,
      model: 'mock-phase1',
      tokens: { input: 0, output: 0 },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'AI service temporarily unavailable' },
      { status: 500 }
    )
  }
}

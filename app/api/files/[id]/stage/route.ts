import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { STAGE_ORDER } from '@/lib/stage-config'
import type { PipelineStage } from '@/lib/supabase/types'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { stage } = body as { stage: PipelineStage }

    if (!stage || !STAGE_ORDER.includes(stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qb = supabase.from('funding_files') as any
    const { data, error } = await qb.update({ stage }).eq('id', id).select().single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'File not found' }, { status: 404 })

    return NextResponse.json({ id: (data as { id: string }).id, stage })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { note } = await req.json()
    if (!note?.trim()) {
      return NextResponse.json({ error: 'Note cannot be empty' }, { status: 400 })
    }

    // Fetch existing notes
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('funding_files')
      .select('internal_notes')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
    const newEntry = `[${timestamp}] ${note.trim()}`
    const updated = existing?.internal_notes
      ? `${existing.internal_notes}\n\n${newEntry}`
      : newEntry

    const { error } = await (supabase as any)
      .from('funding_files')
      .update({ internal_notes: updated })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, internal_notes: updated })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

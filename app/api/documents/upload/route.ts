import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await request.formData()
    const file = form.get('file') as File | null
    const documentId = form.get('documentId') as string | null

    if (!file || !documentId) {
      return NextResponse.json({ error: 'file and documentId required' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const storagePath = `${user.id}/${documentId}.${ext}`

    // Upload to private bucket 'documents'
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, { upsert: true })

    if (uploadError) throw uploadError

    // Update document record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qb = supabase.from('documents') as any
    const { error: updateError } = await qb
      .update({
        storage_path: storagePath,
        status: 'uploaded',
        upload_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', documentId)

    if (updateError) throw updateError

    // Return a short-lived signed URL (15 min)
    const { data: signed } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 900)

    return NextResponse.json({ url: signed?.signedUrl, storagePath })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}

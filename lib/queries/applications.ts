import { createClient } from '@/lib/supabase/server'
import type { Application } from '@/lib/supabase/types'

export type Lender = { id: string; org_id: string; name: string; is_active: boolean }

export type ApplicationWithRelations = Application & {
  funding_files: { id: string; client_name: string; file_code: string } | null
  lenders: { id: string; name: string } | null
}

export async function getApplications(): Promise<ApplicationWithRelations[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await (supabase.from('profiles') as any).select('role').eq('id', user.id).single()
    : { data: null }

  const role: string = profile?.role ?? ''

  // Non-admins are restricted to applications belonging to their assigned files
  if ((role === 'virtual_assistant' || role === 'funding_manager') && user) {
    const { data: assignedFiles } = await (supabase.from('funding_files') as any)
      .select('id')
      .eq('assigned_user_id', user.id)

    const fileIds = (assignedFiles ?? []).map((f: any) => f.id)
    if (fileIds.length === 0) return []

    const { data } = await (supabase as any)
      .from('applications')
      .select('*, funding_files(id, client_name, file_code), lenders(id, name)')
      .in('funding_file_id', fileIds)
      .order('created_at', { ascending: false })

    return (data ?? []) as ApplicationWithRelations[]
  }

  const { data } = await supabase
    .from('applications')
    .select('*, funding_files(id, client_name, file_code), lenders(id, name)')
    .order('created_at', { ascending: false })
  return (data ?? []) as ApplicationWithRelations[]
}

export async function getLenders(): Promise<Lender[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lenders')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return (data ?? []) as Lender[]
}

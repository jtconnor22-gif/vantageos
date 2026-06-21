import { createClient } from '@/lib/supabase/server'
import type { Task } from '@/lib/supabase/types'

export type TaskWithRelations = Task & {
  funding_files: { id: string; client_name: string; file_code: string } | null
  assigned_profile: { id: string; full_name: string } | null
}

export async function getTasks(): Promise<TaskWithRelations[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('*, funding_files(id, client_name, file_code), assigned_profile:profiles!tasks_assigned_user_id_fkey(id, full_name)')
    .order('due_date', { ascending: true, nullsFirst: false })
  return (data ?? []) as TaskWithRelations[]
}

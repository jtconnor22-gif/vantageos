import { createClient } from '@/lib/supabase/server'
import type { Application } from '@/lib/supabase/types'

export type Lender = { id: string; org_id: string; name: string; is_active: boolean }

export type ApplicationWithRelations = Application & {
  funding_files: { id: string; client_name: string; file_code: string } | null
  lenders: { id: string; name: string } | null
}

export async function getApplications(): Promise<ApplicationWithRelations[]> {
  const supabase = await createClient()
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

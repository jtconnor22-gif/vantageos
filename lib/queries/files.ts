import { createClient } from '@/lib/supabase/server'
import type { FundingFile, ReferralPartner, Profile, PipelineStage } from '@/lib/supabase/types'

export type FileWithRelations = FundingFile & {
  referral_partners: Pick<ReferralPartner, 'id' | 'name' | 'company'> | null
  assigned_profile: Pick<Profile, 'id' | 'full_name'> | null
}

export async function getFiles(): Promise<FileWithRelations[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('funding_files')
    .select(`
      *,
      referral_partners ( id, name, company ),
      assigned_profile:profiles!funding_files_assigned_user_id_fkey ( id, full_name )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getFiles error:', error)
    return []
  }
  return (data ?? []) as unknown as FileWithRelations[]
}

export async function getFileById(id: string): Promise<FileWithRelations | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('funding_files')
    .select(`
      *,
      referral_partners ( id, name, company ),
      assigned_profile:profiles!funding_files_assigned_user_id_fkey ( id, full_name )
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as FileWithRelations
}

export async function getFilesByStage(): Promise<Record<PipelineStage, FileWithRelations[]>> {
  const files = await getFiles()
  const byStage: Record<string, FileWithRelations[]> = {}
  for (const file of files) {
    if (!byStage[file.stage]) byStage[file.stage] = []
    byStage[file.stage].push(file)
  }
  return byStage as Record<PipelineStage, FileWithRelations[]>
}

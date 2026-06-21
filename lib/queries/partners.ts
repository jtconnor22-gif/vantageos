import { createClient } from '@/lib/supabase/server'
import type { ReferralPartner } from '@/lib/supabase/types'

export async function getPartners(): Promise<ReferralPartner[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('referral_partners')
    .select('*')
    .order('name')
  return data ?? []
}

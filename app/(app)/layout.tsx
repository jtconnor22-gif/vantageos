import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isPartner } from '@/lib/rbac'
import { getPartners } from '@/lib/queries/partners'
import AppShell from '@/components/AppShell'
import type { UserRole, Profile } from '@/lib/supabase/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profileData) redirect('/login')

  const profile = profileData as Profile
  const role = profile.role as UserRole

  if (isPartner(role)) redirect('/portal/overview')

  // Fetch partners for the New File modal (runs in parallel with page)
  const partners = await getPartners()

  return (
    <AppShell
      role={role}
      fullName={profile.full_name}
      email={profile.email}
      partners={partners.map(p => ({ id: p.id, name: p.name }))}
    >
      {children}
    </AppShell>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isPartner } from '@/lib/rbac'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import type { UserRole, Profile } from '@/lib/supabase/types'

// Map pathnames to page titles
function getTitleFromPath(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/pipeline': 'Pipeline',
    '/files': 'Files',
    '/applications': 'Applications',
    '/documents': 'Documents',
    '/tasks': 'Tasks',
    '/partners': 'Partners',
    '/revenue': 'Revenue',
    '/ai': 'AI Updates',
    '/settings': 'Settings',
  }
  for (const [key, val] of Object.entries(map)) {
    if (pathname.startsWith(key)) return val
  }
  return 'Vantage'
}

// Server component wrapper that reads auth and passes to client shell
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profileData) {
    redirect('/login')
  }

  const profile = profileData as Profile
  const role = profile.role as UserRole

  // Referral partners go to the portal
  if (isPartner(role)) {
    redirect('/portal/overview')
  }

  return (
    <AppShell role={role} fullName={profile.full_name} email={profile.email}>
      {children}
    </AppShell>
  )
}

function AppShell({
  children,
  role,
  fullName,
  email,
}: {
  children: React.ReactNode
  role: UserRole
  fullName: string
  email: string
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar role={role} fullName={fullName} email={email} />
      <Topbar title="Vantage" role={role} />
      <main
        className="min-h-screen"
        style={{
          marginLeft: '248px',
          paddingTop: '66px',
        }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

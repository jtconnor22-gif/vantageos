import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { UserRole, Profile } from '@/lib/supabase/types'

export default async function PortalLayout({
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

  // Only referral partners should access the portal
  if (role !== 'referral_partner') {
    redirect('/dashboard')
  }

  return (
    <PortalShell fullName={profile.full_name} email={profile.email}>
      {children}
    </PortalShell>
  )
}

function PortalShell({
  children,
  fullName,
  email,
}: {
  children: React.ReactNode
  fullName: string
  email: string
}) {
  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Portal header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center px-8"
        style={{
          height: '66px',
          backgroundColor: '#0E1220',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mr-10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#4F46E5' }}
          >
            <span
              className="text-white font-bold text-sm"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              V
            </span>
          </div>
          <span
            className="font-semibold text-white text-sm"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Vantage Partner Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {[
            { label: 'Overview', href: '/portal/overview' },
            { label: 'My Clients', href: '/portal/clients' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: '#8891A8' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">{fullName}</div>
            <div className="text-xs" style={{ color: '#4F5A72' }}>
              Referral Partner
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: '#4F46E5' }}
          >
            {getInitials(fullName)}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-[66px]">
        <div className="max-w-5xl mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}

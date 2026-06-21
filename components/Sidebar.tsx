'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Columns2,
  FolderOpen,
  FileText,
  Files,
  CheckSquare,
  Users,
  DollarSign,
  Sparkles,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { navItemsForRole, ROLE_LABELS } from '@/lib/rbac'
import type { UserRole } from '@/lib/supabase/types'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Columns2,
  FolderOpen,
  FileText,
  Files,
  CheckSquare,
  Users,
  DollarSign,
  Sparkles,
  Settings,
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = [
  '#4F46E5',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

interface SidebarProps {
  role: UserRole
  fullName: string
  email: string
}

export default function Sidebar({ role, fullName, email }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = navItemsForRole(role)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-40"
      style={{
        width: '248px',
        backgroundColor: '#0E1220',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-3">
        <div
          className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#4F46E5' }}
        >
          <span
            className="text-white font-bold text-lg"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            V
          </span>
        </div>
        <div>
          <div
            className="font-semibold text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px' }}
          >
            Vantage
          </div>
          <div
            className="font-medium leading-tight tracking-wider uppercase"
            style={{ fontSize: '9px', color: '#4F5A72', letterSpacing: '0.08em' }}
          >
            Funding Operating System
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 20px' }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon]
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group"
              style={{
                color: isActive ? '#4F46E5' : '#8891A8',
                backgroundColor: isActive ? 'rgba(79,70,229,0.10)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = '#FFFFFF'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#8891A8'
                }
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: '3px',
                    height: '20px',
                    backgroundColor: '#4F46E5',
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              )}
              {Icon && (
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{ color: isActive ? '#4F46E5' : 'inherit' }}
                />
              )}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 20px' }} />

      {/* User footer */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-semibold"
            style={{ backgroundColor: avatarColor(fullName) }}
          >
            {getInitials(fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-semibold truncate text-white"
              style={{ lineHeight: '1.2' }}
            >
              {fullName}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: '#4F5A72', lineHeight: '1.3' }}
            >
              {ROLE_LABELS[role]}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-lg transition-all"
            style={{ color: '#4F5A72' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EF4444'
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.10)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4F5A72'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
        <div className="mt-2" style={{ color: '#2D3650', fontSize: '11px' }}>
          {email}
        </div>
      </div>
    </aside>
  )
}

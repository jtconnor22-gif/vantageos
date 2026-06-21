'use client'

import { Bell, Search, Plus } from 'lucide-react'
import { canCreateFile } from '@/lib/rbac'
import type { UserRole } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'

interface TopbarProps {
  title: string
  role: UserRole
}

export default function Topbar({ title, role }: TopbarProps) {
  const router = useRouter()

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center px-6"
      style={{
        left: '248px',
        height: '66px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Page title */}
      <h1
        className="font-semibold text-[18px] mr-auto"
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h1>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative" style={{ width: '230px' }}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search files, clients..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all"
            style={{
              backgroundColor: 'var(--subtle)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)'
              e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* New File — admin only */}
        {canCreateFile(role) && (
          <button
            onClick={() => router.push('/files/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4338CA'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)'
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            New File
          </button>
        )}

        {/* Bell */}
        <button
          className="relative p-2 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--subtle)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#EF4444', border: '1.5px solid white' }}
          />
        </button>
      </div>
    </header>
  )
}

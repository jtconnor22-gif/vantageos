'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import NewFileModal from './NewFileModal'
import type { UserRole, ReferralPartner } from '@/lib/supabase/types'

interface AppShellProps {
  children: React.ReactNode
  role: UserRole
  fullName: string
  email: string
  partners: Pick<ReferralPartner, 'id' | 'name'>[]
}

export default function AppShell({ children, role, fullName, email, partners }: AppShellProps) {
  const [newFileOpen, setNewFileOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar role={role} fullName={fullName} email={email} />
      <Topbar role={role} onNewFile={() => setNewFileOpen(true)} />
      <main
        className="min-h-screen"
        style={{ marginLeft: '248px', paddingTop: '66px' }}
      >
        <div className="p-6">{children}</div>
      </main>
      {newFileOpen && (
        <NewFileModal
          partners={partners}
          onClose={() => setNewFileOpen(false)}
        />
      )}
    </div>
  )
}

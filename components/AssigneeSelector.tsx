'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TeamMember {
  id: string
  full_name: string
  role: string
}

interface Props {
  fileId: string
  currentAssigneeId: string | null
  currentAssigneeName: string | null
  teamMembers: TeamMember[]
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  funding_manager: 'Funding Manager',
  virtual_assistant: 'VA',
}

export default function AssigneeSelector({ fileId, currentAssigneeId, currentAssigneeName, teamMembers }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [current, setCurrent] = useState({ id: currentAssigneeId, name: currentAssigneeName })

  async function assign(memberId: string | null, memberName: string | null) {
    setSaving(true)
    setOpen(false)
    try {
      await fetch(`/api/files/${fileId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_user_id: memberId }),
      })
      setCurrent({ id: memberId, name: memberName })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className="text-sm text-left transition-colors"
        style={{ color: current.name ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
        title="Click to reassign"
      >
        {saving ? 'Saving…' : (current.name ?? '— Unassigned')}
        <span className="ml-1.5 text-xs" style={{ color: 'var(--accent)', opacity: 0.7 }}>✎</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute left-0 top-6 z-50 bg-white rounded-xl py-1 min-w-[200px]"
            style={{ boxShadow: '0 8px 24px rgba(16,24,40,0.12)', border: '1px solid var(--border)' }}>
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Assign to
            </div>
            {teamMembers.map(m => (
              <button
                key={m.id}
                onClick={() => assign(m.id, m.full_name)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                style={{ color: m.id === current.id ? 'var(--accent)' : 'var(--text-primary)' }}
              >
                <span>{m.full_name}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                  {ROLE_LABELS[m.role] ?? m.role}
                </span>
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
            <button
              onClick={() => assign(null, null)}
              className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50"
              style={{ color: 'var(--text-muted)' }}
            >
              Unassign
            </button>
          </div>
        </>
      )}
    </div>
  )
}

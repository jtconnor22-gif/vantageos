'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Users, Pencil, X, Check } from 'lucide-react'
import InviteUserModal from '@/components/InviteUserModal'
import AddPartnerModal from '@/components/AddPartnerModal'
import { ROLE_LABELS } from '@/lib/rbac'
import type { Profile, ReferralPartner } from '@/lib/supabase/types'

interface Props {
  teamMembers: Profile[]
  partners: ReferralPartner[]
  currentUserRole: string
  currentUserId: string
}

// ─── Team Member Edit Panel ───────────────────────────────────────────────────
function MemberEditPanel({
  member,
  onClose,
  onSaved,
}: {
  member: Profile
  onClose: () => void
  onSaved: () => void
}) {
  const [role, setRole] = useState(member.role as string)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMsg, setResetMsg] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/update-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: member.id, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update')
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleResetPassword() {
    setResetMsg(null)
    setError(null)
    setResetting(true)
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: member.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to reset')
      setResetMsg('Password reset to TempPass123!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div
      className="px-5 py-4 space-y-3"
      style={{ backgroundColor: '#F8F9FC', borderTop: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Role
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border"
            style={{
              borderColor: 'var(--border)',
              background: 'white',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          >
            <option value="funding_manager">Funding Manager</option>
            <option value="virtual_assistant">Virtual Assistant</option>
          </select>
        </div>
        <div className="flex items-end gap-2 pb-0.5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ backgroundColor: saving ? '#818CF8' : 'var(--accent)', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            <Check size={13} />
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'white' }}
          >
            <X size={13} />
            Cancel
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleResetPassword}
          disabled={resetting}
          className="text-xs px-3 py-1.5 rounded-lg border transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'white', cursor: resetting ? 'not-allowed' : 'pointer' }}
        >
          {resetting ? 'Resetting…' : 'Reset Password'}
        </button>
        {resetMsg && <span className="text-xs" style={{ color: '#0EA968' }}>{resetMsg}</span>}
      </div>

      {error && (
        <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Partner Edit Panel ───────────────────────────────────────────────────────
function PartnerEditPanel({
  partner,
  onClose,
  onSaved,
}: {
  partner: ReferralPartner
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    name: partner.name,
    company: partner.company ?? '',
    email: partner.email ?? '',
    phone: partner.phone ?? '',
    commission_pct: partner.commission_pct != null ? String(Math.round(partner.commission_pct * 100)) : '0',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/update-partner', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: partner.id,
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          commission_pct: parseFloat(form.commission_pct) / 100,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update')
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '7px 10px',
    fontSize: '13px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--text-primary)',
    outline: 'none',
  }

  return (
    <div
      className="px-5 py-4 space-y-3"
      style={{ backgroundColor: '#F8F9FC', borderTop: '1px solid var(--border)' }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Company</label>
          <input
            type="text"
            value={form.company}
            onChange={e => set('company', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Commission %</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.commission_pct}
            onChange={e => set('commission_pct', e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all"
          style={{ backgroundColor: saving ? '#818CF8' : 'var(--accent)', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          <Check size={13} />
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'white' }}
        >
          <X size={13} />
          Cancel
        </button>
      </div>

      {error && (
        <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingsClient({ teamMembers, partners, currentUserRole, currentUserId }: Props) {
  const router = useRouter()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null)

  const isAdmin = currentUserRole === 'admin'
  const canManagePartners = currentUserRole === 'admin' || currentUserRole === 'funding_manager'

  function handleRefresh() {
    router.refresh()
  }

  return (
    <>
      {/* Team Members Section */}
      <div
        className="rounded-[14px] bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--subtle)' }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Team Members
          </span>
          {isAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <UserPlus size={13} />
              Invite Member
            </button>
          )}
        </div>

        {teamMembers.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No team members yet
          </div>
        ) : (
          teamMembers.map((member, idx) => {
            const isCurrentUser = member.id === currentUserId
            const isEditing = editingMemberId === member.id
            const isLast = idx === teamMembers.length - 1

            return (
              <div
                key={member.id}
                style={{ borderBottom: (!isLast || isEditing) ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{member.full_name}</span>
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{member.email}</span>
                    {isCurrentUser && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: 'var(--subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    >
                      {ROLE_LABELS[member.role] ?? member.role}
                    </span>
                    {isAdmin && !isCurrentUser && member.role !== 'admin' && (
                      <button
                        onClick={() => setEditingMemberId(isEditing ? null : member.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
                        style={{
                          borderColor: isEditing ? 'var(--accent)' : 'var(--border)',
                          color: isEditing ? 'var(--accent)' : 'var(--text-muted)',
                          background: isEditing ? '#EEF2FF' : 'transparent',
                        }}
                      >
                        <Pencil size={11} />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <MemberEditPanel
                    member={member}
                    onClose={() => setEditingMemberId(null)}
                    onSaved={handleRefresh}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Referral Partners Section */}
      {canManagePartners && (
        <div
          className="rounded-[14px] bg-white overflow-hidden"
          style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--subtle)' }}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Referral Partners
            </span>
            <button
              onClick={() => setShowPartnerModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Users size={13} />
              Add Partner
            </button>
          </div>

          {partners.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No referral partners yet
            </div>
          ) : (
            partners.map((partner, idx) => {
              const isEditing = editingPartnerId === partner.id
              const isLast = idx === partners.length - 1
              const commissionDisplay = partner.commission_pct != null
                ? `${Math.round(partner.commission_pct * 100)}%`
                : '0%'

              return (
                <div
                  key={partner.id}
                  style={{ borderBottom: (!isLast || isEditing) ? '1px solid var(--border)' : 'none' }}
                >
                  <div className="flex items-center justify-between px-5 py-3.5 text-sm">
                    <div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{partner.name}</span>
                      {partner.company && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{partner.company}</span>
                      )}
                      {partner.email && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{partner.email}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: 'var(--subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                      >
                        {commissionDisplay} commission
                      </span>
                      <button
                        onClick={() => setEditingPartnerId(isEditing ? null : partner.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
                        style={{
                          borderColor: isEditing ? 'var(--accent)' : 'var(--border)',
                          color: isEditing ? 'var(--accent)' : 'var(--text-muted)',
                          background: isEditing ? '#EEF2FF' : 'transparent',
                        }}
                      >
                        <Pencil size={11} />
                        Edit
                      </button>
                    </div>
                  </div>
                  {isEditing && (
                    <PartnerEditPanel
                      partner={partner}
                      onClose={() => setEditingPartnerId(null)}
                      onSaved={handleRefresh}
                    />
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleRefresh}
        />
      )}

      {showPartnerModal && (
        <AddPartnerModal
          onClose={() => setShowPartnerModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </>
  )
}

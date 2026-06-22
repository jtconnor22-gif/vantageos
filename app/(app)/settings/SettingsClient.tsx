'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Users } from 'lucide-react'
import InviteUserModal from '@/components/InviteUserModal'
import AddPartnerModal from '@/components/AddPartnerModal'
import { ROLE_LABELS } from '@/lib/rbac'
import type { Profile, ReferralPartner } from '@/lib/supabase/types'

interface Props {
  teamMembers: Profile[]
  partners: ReferralPartner[]
  currentUserRole: string
}

export default function SettingsClient({ teamMembers, partners, currentUserRole }: Props) {
  const router = useRouter()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)

  const isAdmin = currentUserRole === 'admin'
  const canManagePartners = currentUserRole === 'admin' || currentUserRole === 'funding_manager'

  function handleInviteSuccess() {
    router.refresh()
  }

  function handlePartnerSuccess() {
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
          teamMembers.map((member, idx) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-5 py-3.5 text-sm"
              style={{ borderBottom: idx < teamMembers.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{member.full_name}</span>
                <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{member.email}</span>
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: 'var(--subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                {ROLE_LABELS[member.role] ?? member.role}
              </span>
            </div>
          ))
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
            partners.map((partner, idx) => (
              <div
                key={partner.id}
                className="flex items-center justify-between px-5 py-3.5 text-sm"
                style={{ borderBottom: idx < partners.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{partner.name}</span>
                  {partner.company && (
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{partner.company}</span>
                  )}
                  {partner.email && (
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{partner.email}</span>
                  )}
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: 'var(--subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  {partner.commission_pct}% commission
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

      {showPartnerModal && (
        <AddPartnerModal
          onClose={() => setShowPartnerModal(false)}
          onSuccess={handlePartnerSuccess}
        />
      )}
    </>
  )
}

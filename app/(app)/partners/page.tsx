import { createClient } from '@/lib/supabase/server'
import { avatarColor, getInitials } from '@/lib/stage-config'
import type { ReferralPartner, Revenue, FundingFile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const supabase = await createClient()

  const { data: pd } = await supabase.from('referral_partners').select('*').order('name')
  const partners = (pd ?? []) as ReferralPartner[]

  const { data: fd } = await supabase.from('funding_files').select('id, referral_partner_id')
  const fileList = (fd ?? []) as Pick<FundingFile, 'id' | 'referral_partner_id'>[]

  const countMap: Record<string, number> = {}
  for (const f of fileList) {
    if (f.referral_partner_id) countMap[f.referral_partner_id] = (countMap[f.referral_partner_id] ?? 0) + 1
  }

  const { data: rd } = await supabase.from('revenue').select('referral_commission, funding_file_id')
  const revenues = (rd ?? []) as Pick<Revenue, 'referral_commission' | 'funding_file_id'>[]

  const fileToPartner: Record<string, string> = {}
  for (const f of fileList) {
    if (f.referral_partner_id) fileToPartner[f.id] = f.referral_partner_id
  }

  const commissionMap: Record<string, number> = {}
  for (const r of revenues) {
    const pid = fileToPartner[r.funding_file_id]
    if (pid) commissionMap[pid] = (commissionMap[pid] ?? 0) + (r.referral_commission ?? 0)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
            Referral Partners
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {partners.length} partners in your network
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Partners', value: partners.length },
          { label: 'Total Referred Files', value: Object.values(countMap).reduce((a, b) => a + b, 0) },
          { label: 'Total Commissions Paid', value: `$${Object.values(commissionMap).reduce((a, b) => a + b, 0).toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            <div className="text-2xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Partner cards */}
      <div className="grid gap-3">
        {partners.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            No referral partners yet.
          </div>
        ) : (
          partners.map(partner => {
            const color = avatarColor(partner.id)
            const initials = getInitials(partner.name)
            const files = countMap[partner.id] ?? 0
            const commission = commissionMap[partner.id] ?? 0

            return (
              <div
                key={partner.id}
                className="bg-white rounded-2xl p-5 flex items-center gap-4"
                style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{partner.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {[partner.company, partner.email].filter(Boolean).join(' · ')}
                  </div>
                  {partner.phone && (
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{partner.phone}</div>
                  )}
                </div>
                <div className="text-right px-5 border-r" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Commission</div>
                  <div className="text-base font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
                    {((partner.commission_pct ?? 0.10) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-right px-5 border-r" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Files</div>
                  <div className="text-base font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--accent)' }}>
                    {files}
                  </div>
                </div>
                <div className="text-right pl-5">
                  <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Commissions</div>
                  <div className="text-base font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: '#059669' }}>
                    ${commission.toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

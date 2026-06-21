import { Users } from 'lucide-react'

const PARTNERS = [
  { name: 'Sandra Kim', company: 'Partner Co LLC', email: 'sandra@partnerco.com', commission: '10%', files: 2 },
  { name: 'David Torres', company: 'Torres Brokerage', email: 'david@brokerage.net', commission: '8%', files: 1 },
  { name: 'Priya Patel', company: 'Capital Bridge', email: 'priya@capitalbridge.io', commission: '12%', files: 1 },
]

const AVATAR_COLORS = ['#4F46E5', '#0EA5E9', '#10B981']

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function PartnersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            Referral Partners
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage your referral network and commission structures
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 3
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {PARTNERS.map((partner, idx) => (
          <div
            key={partner.name}
            className="rounded-[14px] bg-white p-5 flex items-center gap-4"
            style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-semibold"
              style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
            >
              {getInitials(partner.name)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {partner.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {partner.company} · {partner.email}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Commission</div>
              <div
                className="text-sm font-semibold"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
              >
                {partner.commission}
              </div>
            </div>
            <div className="text-right ml-6">
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Files</div>
              <div
                className="text-sm font-semibold"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--accent)' }}
              >
                {partner.files}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

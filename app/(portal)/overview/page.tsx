import { LayoutDashboard } from 'lucide-react'

export default function PortalOverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Partner Overview
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Track the status of your referred clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Referrals', value: '3' },
          { label: 'Active Files', value: '2' },
          { label: 'Funded Deals', value: '1' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-[14px] bg-white p-5"
            style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              {label}
            </p>
            <p
              className="text-3xl font-semibold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-[14px] bg-white p-10 flex flex-col items-center text-center"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)' }}
        >
          <LayoutDashboard size={24} style={{ color: 'var(--accent)' }} />
        </div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Full Partner Dashboard
        </h3>
        <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
          Detailed pipeline visibility, stage-by-stage updates for your referred clients, and
          commission tracking are coming in Phase 3.
        </p>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mt-4"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 3
        </span>
      </div>
    </div>
  )
}

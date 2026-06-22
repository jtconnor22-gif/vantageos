import Link from 'next/link'
import { getApplications } from '@/lib/queries/applications'
import { formatMoney } from '@/lib/stage-config'

export const dynamic = 'force-dynamic'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  draft:      { label: 'Draft',      bg: '#F0F1F6', color: '#64748B' },
  submitted:  { label: 'Submitted',  bg: '#DBEAFE', color: '#2563EB' },
  in_review:  { label: 'In Review',  bg: '#FEF3C7', color: '#D97706' },
  approved:   { label: 'Approved',   bg: '#DCFCE7', color: '#16A34A' },
  declined:   { label: 'Declined',   bg: '#FEE2E2', color: '#DC2626' },
  funded:     { label: 'Funded',     bg: '#D1FAE5', color: '#059669' },
}

export default async function ApplicationsPage() {
  const applications = await getApplications()

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(s => [s, applications.filter(a => a.status === s).length])
  )

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
          Applications
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {applications.length} total across all files
        </p>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div
            key={key}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: `${cfg.color}20` }}
            >
              {counts[key] ?? 0}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
      >
        <div
          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1fr 1fr',
            gap: '12px',
            backgroundColor: '#FAFBFD',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span>Client / File</span>
          <span>Product / Lender</span>
          <span>Status</span>
          <span>Approved</span>
          <span>Funded</span>
          <span>Submitted</span>
        </div>

        {applications.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No applications yet. Open a file to add an application.
          </div>
        ) : (
          applications.map((app, idx) => {
            const sc = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.draft
            return (
              <Link key={app.id} href={`/files/${app.funding_file_id}`}>
                <div
                  className="px-5 py-3.5 items-center transition-colors hover:bg-[#FAFBFD]"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1fr 1fr',
                    gap: '12px',
                    borderBottom: idx < applications.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {app.funding_files?.client_name ?? '—'}
                    </div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--accent)' }}>
                      {app.funding_files?.file_code ?? '—'}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {app.product_name ?? app.category ?? '—'}
                    </div>
                    <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {app.lenders?.name ?? 'No lender'}
                    </div>
                  </div>
                  <div>
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: '#0EA968' }}>
                    {formatMoney(app.approved_amount)}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: '#16A34A' }}>
                    {formatMoney(app.funded_amount)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {app.submitted_date
                      ? new Date(app.submitted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : '—'}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

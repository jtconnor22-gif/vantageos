import { Files } from 'lucide-react'

const DOC_TIERS = [
  { tier: 'Required', color: '#EF4444', bg: '#FEF2F2', count: 8 },
  { tier: 'Preferred', color: '#F59E0B', bg: '#FFFBEB', count: 5 },
  { tier: 'Optional', color: '#10B981', bg: '#ECFDF5', count: 3 },
]

const SAMPLE_DOCS = [
  { name: '3 Months Bank Statements', tier: 'Required', status: 'uploaded' },
  { name: 'Business Tax Returns (2 years)', tier: 'Required', status: 'missing' },
  { name: 'Personal Tax Returns', tier: 'Required', status: 'requested' },
  { name: 'Voided Check', tier: 'Required', status: 'uploaded' },
  { name: 'Business License', tier: 'Preferred', status: 'missing' },
  { name: 'Accounts Receivable Aging', tier: 'Optional', status: 'not_applicable' },
]

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  uploaded: { color: '#10B981', bg: '#ECFDF5', label: 'Uploaded' },
  missing: { color: '#EF4444', bg: '#FEF2F2', label: 'Missing' },
  requested: { color: '#F59E0B', bg: '#FFFBEB', label: 'Requested' },
  not_applicable: { color: '#5A6172', bg: 'var(--subtle)', label: 'N/A' },
}

export default function DocumentsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            Documents
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Document checklists and uploads across all files
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 3
        </span>
      </div>

      {/* Tier summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {DOC_TIERS.map(({ tier, color, bg, count }) => (
          <div
            key={tier}
            className="rounded-[14px] bg-white p-4 flex items-center gap-3"
            style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: bg, color }}
            >
              {count}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {tier}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Documents
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sample doc list */}
      <div
        className="rounded-[14px] bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide grid grid-cols-3 gap-4"
          style={{ backgroundColor: 'var(--subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <span>Document Name</span>
          <span>Tier</span>
          <span>Status</span>
        </div>
        {SAMPLE_DOCS.map((doc, idx) => {
          const s = STATUS_STYLES[doc.status]
          return (
            <div
              key={doc.name}
              className="grid grid-cols-3 gap-4 px-5 py-3.5 text-sm"
              style={{ borderBottom: idx < SAMPLE_DOCS.length - 1 ? '1px solid var(--border)' : 'none', color: 'var(--text-primary)' }}
            >
              <span className="font-medium">{doc.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{doc.tier}</span>
              <span>
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: s.bg, color: s.color }}
                >
                  {s.label}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

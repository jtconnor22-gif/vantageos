import { FileText } from 'lucide-react'

const STATUSES = [
  { label: 'Draft', color: '#5A6172', bg: 'var(--subtle)' },
  { label: 'Submitted', color: '#0EA5E9', bg: '#F0F9FF' },
  { label: 'In Review', color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Approved', color: '#10B981', bg: '#ECFDF5' },
  { label: 'Declined', color: '#EF4444', bg: '#FEF2F2' },
  { label: 'Funded', color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
]

export default function ApplicationsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            Applications
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Track all lender applications across your files
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 3
        </span>
      </div>

      <div
        className="rounded-[14px] bg-white p-10 flex flex-col items-center text-center mb-6"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)' }}
        >
          <FileText size={28} style={{ color: 'var(--accent)' }} />
        </div>
        <h3
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Application Tracker
        </h3>
        <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
          Submit and track applications to multiple lenders per file, manage approval decisions,
          funded amounts, rate terms, and verification requirements — all in one place.
        </p>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(({ label, color, bg }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: bg, color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

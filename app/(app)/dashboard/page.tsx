import { LayoutDashboard } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div
        className="rounded-[14px] bg-white p-12 flex flex-col items-center text-center"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)' }}
        >
          <LayoutDashboard size={28} style={{ color: 'var(--accent)' }} />
        </div>
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Dashboard
        </h2>
        <p className="text-sm mb-6 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
          Your funding command center — KPIs, pipeline summary, revenue snapshot, and team task
          overview are coming in Phase 2.
        </p>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 2
        </span>
      </div>

      {/* Preview grid */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {['Total Files', 'Active Pipeline', 'Funded This Month'].map((label) => (
          <div
            key={label}
            className="rounded-[14px] bg-white p-5"
            style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              {label}
            </p>
            <div
              className="h-7 w-20 rounded"
              style={{ backgroundColor: 'var(--subtle)', border: '1px solid var(--border)' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

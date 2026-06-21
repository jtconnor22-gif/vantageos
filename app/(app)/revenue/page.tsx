import { DollarSign, TrendingUp } from 'lucide-react'

const METRICS = [
  { label: 'Total Funded', value: '$950,000', change: '+12%' },
  { label: 'Gross Revenue', value: '$76,000', change: '+8%' },
  { label: 'Net Profit', value: '$52,400', change: '+15%' },
  { label: 'Fees Collected', value: '$61,500', change: '+6%' },
]

export default function RevenuePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            Revenue
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Financial performance across all funded files
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 3
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {METRICS.map(({ label, value, change }) => (
          <div
            key={label}
            className="rounded-[14px] bg-white p-5"
            style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              {label}
            </p>
            <p
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              {value}
            </p>
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#10B981' }}>
              <TrendingUp size={11} />
              {change} vs last month
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-[14px] bg-white p-10 flex flex-col items-center text-center"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)' }}
        >
          <DollarSign size={28} style={{ color: 'var(--accent)' }} />
        </div>
        <h3
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Revenue Analytics
        </h3>
        <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
          Full revenue breakdown by file, success fee tracking, referral commission calculations,
          invoice management, and profit/loss reporting are coming in Phase 3.
        </p>
      </div>
    </div>
  )
}

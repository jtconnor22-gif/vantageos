import { createClient } from '@/lib/supabase/server'
import { formatMoney } from '@/lib/stage-config'
import { TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RevenuePage() {
  const supabase = await createClient()

  const { data: revenues } = await supabase
    .from('revenue')
    .select('*, funding_files(id, client_name, file_code, referral_partner_id), referral_partners:funding_files(referral_partners(name))')
    .order('created_at', { ascending: false })

  // Also get files with stage=funded for display
  const { data: revenueRows } = await supabase
    .from('revenue')
    .select('*, funding_files(id, client_name, file_code)')
    .order('created_at', { ascending: false })
  const rows = (revenueRows ?? []) as Array<{
    id: string
    funded_amount: number
    gross_revenue: number
    net_revenue: number
    success_fee_amount: number
    success_fee_pct: number
    referral_commission: number
    sales_rep_commission: number
    bank_fees: number
    profit: number
    success_fee_invoice_sent: boolean
    success_fee_collected: boolean
    collection_date: string | null
    created_at: string
    funding_files: { id: string; client_name: string; file_code: string } | null
  }>

  // Aggregate KPIs
  const totalFunded = rows.reduce((s, r) => s + (r.funded_amount ?? 0), 0)
  const totalGross = rows.reduce((s, r) => s + (r.gross_revenue ?? 0), 0)
  const totalNet = rows.reduce((s, r) => s + (r.net_revenue ?? 0), 0)
  const totalProfit = rows.reduce((s, r) => s + (r.profit ?? 0), 0)
  const totalCommissions = rows.reduce((s, r) => s + (r.referral_commission ?? 0), 0)
  const feesCollected = rows.filter(r => r.success_fee_collected).reduce((s, r) => s + (r.success_fee_amount ?? 0), 0)
  const feesPending = rows.filter(r => !r.success_fee_collected).reduce((s, r) => s + (r.success_fee_amount ?? 0), 0)

  const kpis = [
    { label: 'Total Funded', value: formatMoney(totalFunded), sub: `${rows.length} deals` },
    { label: 'Gross Revenue', value: formatMoney(totalGross), sub: `${totalFunded > 0 ? ((totalGross / totalFunded) * 100).toFixed(1) : 0}% avg rate` },
    { label: 'Net Profit', value: formatMoney(totalProfit), sub: `after all commissions` },
    { label: 'Fees Collected', value: formatMoney(feesCollected), sub: `${formatMoney(feesPending)} pending` },
  ]

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
          Revenue
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Financial performance across all funded files
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {kpis.map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
            <div className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
              {value}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
              <TrendingUp size={11} />
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Commission breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Referral Commissions', value: formatMoney(totalCommissions), color: '#EC4899' },
          { label: 'Sales Rep Commissions', value: formatMoney(rows.reduce((s, r) => s + (r.sales_rep_commission ?? 0), 0)), color: '#8B5CF6' },
          { label: 'Bank Fees', value: formatMoney(rows.reduce((s, r) => s + (r.bank_fees ?? 0), 0)), color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            <div className="w-2.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
              <div className="text-lg font-semibold mt-0.5" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
        <div
          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr .8fr',
            gap: '12px',
            backgroundColor: '#FAFBFD',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span>Client / File</span>
          <span>Funded</span>
          <span>Success Fee</span>
          <span>Referral Comm.</span>
          <span>Net Profit</span>
          <span>Fee Status</span>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No revenue records yet. Revenue is created when a file reaches the Funded stage.
          </div>
        ) : (
          rows.map((row, idx) => (
            <div
              key={row.id}
              className="px-5 py-3.5 items-center"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr .8fr',
                gap: '12px',
                borderBottom: idx < rows.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {row.funding_files?.client_name ?? '—'}
                </div>
                <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--accent)' }}>
                  {row.funding_files?.file_code ?? '—'}
                </div>
              </div>
              <div className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: '#0EA968' }}>
                {formatMoney(row.funded_amount)}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatMoney(row.success_fee_amount)}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {((row.success_fee_pct ?? 0) * 100).toFixed(0)}% rate
                </div>
              </div>
              <div className="text-sm" style={{ color: '#EC4899' }}>{formatMoney(row.referral_commission)}</div>
              <div className="text-sm font-semibold" style={{ color: '#16A34A' }}>{formatMoney(row.profit)}</div>
              <div>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: row.success_fee_collected ? '#D1FAE5' : row.success_fee_invoice_sent ? '#DBEAFE' : '#F0F1F6',
                    color: row.success_fee_collected ? '#059669' : row.success_fee_invoice_sent ? '#2563EB' : '#64748B',
                  }}
                >
                  {row.success_fee_collected ? 'Collected' : row.success_fee_invoice_sent ? 'Invoiced' : 'Pending'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

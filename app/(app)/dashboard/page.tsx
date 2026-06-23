import { createClient } from '@/lib/supabase/server'
import { STAGE_CONFIG, STAGE_ORDER, formatMoney } from '@/lib/stage-config'
import Link from 'next/link'
import type { PipelineStage } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

const FUNDED_STAGES: PipelineStage[] = ['funded', 'success_fee_invoice_sent', 'success_fee_collected']
// Stages that are "actively being worked" — everything except cold leads and completed
const ACTIVE_STAGES: PipelineStage[] = [
  'appointment_scheduled','consultation_completed','application_sent','application_submitted',
  'documents_requested','documents_received','conditions_before_submission',
  'submitted_for_funding','verification',
]
// Active clients = any file past the initial lead / referral stage
const EXCLUDED_FROM_ACTIVE: PipelineStage[] = ['lead_received', 'referral_request']
// Total pipeline = everything except fee collected (deal fully closed)
const EXCLUDED_FROM_PIPELINE: PipelineStage[] = ['success_fee_collected']

export default async function DashboardPage() {
  const supabase = await createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const todayStr = now.toISOString().split('T')[0]

  const [
    { data: allFiles },
    { data: revenueRows },
    { data: openTasks },
    { data: pendingApps },
    { data: docsRaw },
  ] = await Promise.all([
    (supabase as any).from('funding_files').select('id, client_name, business_name, stage, funding_type, next_followup_date, created_at').order('created_at', { ascending: false }),
    (supabase as any).from('revenue').select('funded_amount, success_fee_amount, success_fee_invoice_sent, success_fee_collected, profit, created_at'),
    (supabase as any).from('tasks').select('id, title, status, due_date, priority, funding_file_id').eq('status', 'open'),
    (supabase as any).from('applications').select('id, status, product_name, funding_file_id, funding_files(client_name, business_name)').in('status', ['submitted','in_review']),
    (supabase as any).from('documents').select('id, name, status, funding_file_id, funding_files(client_name, business_name)').eq('status', 'missing'),
  ])

  const files = (allFiles ?? []) as Array<{ id: string; client_name: string; business_name: string | null; stage: string; funding_type: string | null; next_followup_date: string | null; created_at: string }>
  const revenue = (revenueRows ?? []) as Array<{ funded_amount: number; success_fee_amount: number; success_fee_invoice_sent: boolean; success_fee_collected: boolean; profit: number; created_at: string }>
  const tasks = (openTasks ?? []) as Array<{ id: string; title: string; status: string; due_date: string | null; priority: string | null; funding_file_id: string }>
  const apps = (pendingApps ?? []) as Array<{ id: string; status: string; product_name: string; funding_file_id: string; funding_files: { client_name: string; business_name: string | null } | null }>
  const missingDocs = (docsRaw ?? []) as Array<{ id: string; name: string; status: string; funding_file_id: string; funding_files: { client_name: string; business_name: string | null } | null }>

  // Computed KPIs
  // Active Clients: files being actively worked (past lead_received / referral_request)
  const activeClients = files.filter(f => !EXCLUDED_FROM_ACTIVE.includes(f.stage as PipelineStage)).length
  // Total pipeline: all files that are not fully closed (fee_collected)
  const totalPipeline = files.filter(f => !EXCLUDED_FROM_PIPELINE.includes(f.stage as PipelineStage)).length
  const revenueThisMonthRows = revenue.filter(r => r.created_at >= startOfMonth)
  // "Funded This Month" shows all-time total funded across all revenue records.
  // Using a month filter on created_at would miss files funded before this month
  // whose revenue records were updated (not re-created) this month.
  const fundedThisMonth = revenue.length
  const fundedThisMonthAmount = revenue.reduce((s, r) => s + (r.funded_amount ?? 0), 0)
  const totalFundedAmount = fundedThisMonthAmount
  const revenueThisMonth = revenueThisMonthRows.reduce((s, r) => s + (r.success_fee_amount ?? 0), 0)
  const successFeesOutstanding = revenue.filter(r => r.success_fee_invoice_sent && !r.success_fee_collected).reduce((s, r) => s + (r.success_fee_amount ?? 0), 0)
  const overdueFollowUps = files.filter(f => f.next_followup_date && f.next_followup_date <= todayStr && !FUNDED_STAGES.includes(f.stage as PipelineStage))
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < todayStr)
  const inVerification = files.filter(f => f.stage === 'verification')
  const clientsFunded = files.filter(f => FUNDED_STAGES.includes(f.stage as PipelineStage))

  // Pipeline stage counts
  const stageCounts = STAGE_ORDER.reduce((acc, s) => {
    acc[s] = files.filter(f => f.stage === s).length
    return acc
  }, {} as Record<string, number>)
  const maxCount = Math.max(...Object.values(stageCounts), 1)

  // Needs follow-up (next_followup_date <= today, not funded)
  const needsFollowUp = files.filter(f => f.next_followup_date && f.next_followup_date <= todayStr && !FUNDED_STAGES.includes(f.stage as PipelineStage)).slice(0, 5)

  // Group missing docs by file
  const docsByFile = missingDocs.reduce((acc, d) => {
    const key = d.funding_file_id
    if (!acc[key]) acc[key] = { client: d.funding_files?.client_name ?? '—', biz: d.funding_files?.business_name ?? null, count: 0 }
    acc[key].count++
    return acc
  }, {} as Record<string, { client: string; biz: string | null; count: number }>)
  const missingDocFiles = Object.entries(docsByFile).slice(0, 4)

  // Group pending apps by file
  const appsByFile = apps.reduce((acc, a) => {
    const key = a.funding_file_id
    if (!acc[key]) acc[key] = { client: a.funding_files?.client_name ?? '—', biz: a.funding_files?.business_name ?? null, products: [] as string[] }
    acc[key].products.push(a.product_name ?? 'Unknown')
    return acc
  }, {} as Record<string, { client: string; biz: string | null; products: string[] }>)
  const pendingAppFiles = Object.entries(appsByFile).slice(0, 4)

  // Success fees to collect
  const feesToCollect = revenue.filter(r => r.success_fee_invoice_sent && !r.success_fee_collected).slice(0, 4)

  const recentFiles = files.slice(0, 5)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>CEO Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Your funding operation at a glance</p>
      </div>

      {/* KPI Row 1 */}
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Active Clients', value: activeClients, sub: `${files.length} total files in system`, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
          { label: 'Pending Applications', value: apps.length, sub: `${apps.length} in review`, color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)' },
          { label: 'Total Funded', value: `${fundedThisMonth} deals · ${formatMoney(fundedThisMonthAmount)}`, sub: `${clientsFunded.length} files at funded stage`, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Revenue This Month', value: formatMoney(revenueThisMonth), sub: `${formatMoney(totalFundedAmount)} total funded`, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
          { label: 'Success Fees Outstanding', value: formatMoney(successFeesOutstanding), sub: `${revenue.filter(r => r.success_fee_invoice_sent && !r.success_fee_collected).length} files awaiting`, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{k.label}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: k.color }}>{k.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* KPI Row 2 */}
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Follow-Ups Due', value: overdueFollowUps.length, sub: overdueFollowUps.length > 0 ? 'action needed' : 'all clear', color: overdueFollowUps.length > 0 ? '#EF4444' : '#10B981', urgent: overdueFollowUps.length > 0 },
          { label: 'Missing Documents', value: missingDocs.length, sub: `${missingDocFiles.length} files affected`, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          { label: 'In Verification', value: inVerification.length, sub: inVerification.length > 0 ? 'active now' : 'none active', color: '#8B5CF6' },
          { label: 'Tasks Overdue', value: overdueTasks.length, sub: overdueTasks.length > 0 ? 'action needed' : 'all on track', color: overdueTasks.length > 0 ? '#EF4444' : '#10B981' },
          { label: 'Total Pipeline', value: totalPipeline, sub: `${ACTIVE_STAGES.filter(s => stageCounts[s] > 0).length} active stages`, color: '#0EA5E9' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-4" style={{ border: `1px solid ${k.urgent ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`, boxShadow: '0 1px 2px rgba(16,24,40,0.04)', backgroundColor: k.urgent ? 'rgba(239,68,68,0.03)' : 'white' }}>
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{k.label}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: k.color }}>{k.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Content: Priorities + Pipeline */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 340px' }}>

        {/* Today's Priorities */}
        <div>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="w-1 h-5 rounded-full" style={{ backgroundColor: '#4F46E5', display: 'inline-block' }} />
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>Today&apos;s Priorities</h3>
            </div>
            <div className="grid grid-cols-2 gap-0">

              {/* Needs Follow-Up */}
              <div className="p-5" style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Needs Follow-Up</span>
                  </div>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#D97706' }}>{needsFollowUp.length}</span>
                </div>
                {needsFollowUp.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All follow-ups on track ✓</p>
                ) : needsFollowUp.map(f => (
                  <Link key={f.id} href={`/files/${f.id}`}>
                    <div className="mb-2 last:mb-0 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.client_name}</span>
                        <span className="text-xs font-medium" style={{ color: '#EF4444' }}>
                          {f.next_followup_date ? new Date(f.next_followup_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </span>
                      </div>
                      {f.business_name && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.business_name}</div>}
                    </div>
                  </Link>
                ))}
                {files.filter(f => f.next_followup_date && !FUNDED_STAGES.includes(f.stage as PipelineStage)).length > 5 && (
                  <Link href="/files" className="text-xs mt-2 block" style={{ color: '#4F46E5' }}>View all →</Link>
                )}
              </div>

              {/* Missing Required Docs */}
              <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Missing Required Docs</span>
                  </div>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#DC2626' }}>{missingDocFiles.length}</span>
                </div>
                {missingDocFiles.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No missing documents ✓</p>
                ) : missingDocFiles.map(([fileId, info]) => (
                  <Link key={fileId} href={`/files/${fileId}`}>
                    <div className="mb-2 last:mb-0 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{info.client}</span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.10)', color: '#DC2626' }}>{info.count} docs</span>
                      </div>
                      {info.biz && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{info.biz}</div>}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Applications Pending */}
              <div className="p-5" style={{ borderRight: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Applications Pending</span>
                  </div>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(14,165,233,0.12)', color: '#0284C7' }}>{pendingAppFiles.length}</span>
                </div>
                {pendingAppFiles.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No pending applications</p>
                ) : pendingAppFiles.map(([fileId, info]) => (
                  <Link key={fileId} href={`/files/${fileId}`}>
                    <div className="mb-2 last:mb-0 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{info.client}</span>
                        <span className="text-xs" style={{ color: '#0EA5E9' }}>pending</span>
                      </div>
                      {info.products.slice(0, 2).map(p => (
                        <div key={p} className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{p}</div>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Success Fees to Collect */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Success Fees to Collect</span>
                  </div>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#059669' }}>{feesToCollect.length}</span>
                </div>
                {feesToCollect.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No outstanding fees</p>
                ) : feesToCollect.map((r, i) => (
                  <div key={i} className="mb-2 last:mb-0 p-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Invoice sent</span>
                      <span className="text-sm font-bold" style={{ color: '#10B981' }}>{formatMoney(r.success_fee_amount)}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Success fee invoice sent</div>
                  </div>
                ))}
                {feesToCollect.length === 0 && successFeesOutstanding === 0 && (
                  <Link href="/revenue" className="text-xs mt-1 block" style={{ color: '#4F46E5' }}>View revenue →</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Snapshot */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="w-1 h-5 rounded-full" style={{ backgroundColor: '#10B981', display: 'inline-block' }} />
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>Pipeline Snapshot</h3>
          </div>
          <div className="px-5 py-3">
            {STAGE_ORDER.map(stage => {
              const cfg = STAGE_CONFIG[stage]
              const count = stageCounts[stage] ?? 0
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
              return (
                <div key={stage} className="flex items-center gap-3 py-1.5">
                  <div className="text-xs w-28 truncate shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {cfg.label.length > 17 ? cfg.label.slice(0, 17) + '…' : cfg.label}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color, minWidth: count > 0 ? '6px' : '0' }} />
                  </div>
                  <div className="text-xs font-semibold w-4 text-right" style={{ color: count > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{count}</div>
                </div>
              )
            })}
          </div>

          {/* Recent Files */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <div className="px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>RECENT FILES</span>
              <Link href="/files" className="text-xs" style={{ color: '#4F46E5' }}>View all →</Link>
            </div>
            {recentFiles.map(f => {
              const cfg = STAGE_CONFIG[f.stage as PipelineStage]
              return (
                <Link key={f.id} href={`/files/${f.id}`}>
                  <div className="px-5 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.client_name}</div>
                      {f.funding_type && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.funding_type}</div>}
                    </div>
                    {cfg && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

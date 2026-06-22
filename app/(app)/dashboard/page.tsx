import { createClient } from '@/lib/supabase/server'
import { STAGE_CONFIG } from '@/lib/stage-config'
import type { PipelineStage } from '@/lib/supabase/types'

const FUNDED_STAGES: PipelineStage[] = ['funded', 'success_fee_collected', 'success_fee_invoice_sent']
const INACTIVE_STAGES: PipelineStage[] = ['funded', 'success_fee_collected', 'success_fee_invoice_sent', 'lead_received']

const ORG_ID = '00000000-0000-0000-0000-000000000001'

export default async function DashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalFiles },
    { count: activePipeline },
    { count: fundedThisMonth },
    { data: recentFiles },
  ] = await Promise.all([
    supabase
      .from('funding_files')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ORG_ID),
    supabase
      .from('funding_files')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ORG_ID)
      .not('stage', 'in', `(${INACTIVE_STAGES.join(',')})`),
    supabase
      .from('funding_files')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', ORG_ID)
      .in('stage', FUNDED_STAGES)
      .gte('created_at', startOfMonth),
    (supabase as any)
      .from('funding_files')
      .select('id, client_name, stage, funding_type, created_at')
      .eq('org_id', ORG_ID)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const kpis = [
    { label: 'Total Files', value: totalFiles ?? 0 },
    { label: 'Active Pipeline', value: activePipeline ?? 0 },
    { label: 'Funded This Month', value: fundedThisMonth ?? 0 },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl bg-white p-5"
            style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              {label}
            </p>
            <p className="text-3xl font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Files */}
      <div
        className="rounded-2xl bg-white"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Recent Files
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {recentFiles && recentFiles.length > 0 ? (
            (recentFiles as Array<{ id: string; client_name: string; stage: string; funding_type: string | null; created_at: string }>).map((file) => {
              const stage = file.stage as PipelineStage
              const stageConfig = STAGE_CONFIG[stage]
              return (
                <div key={file.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {file.client_name}
                    </p>
                    {file.funding_type && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {file.funding_type}
                      </p>
                    )}
                  </div>
                  {stageConfig && (
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: stageConfig.color + '18',
                        color: stageConfig.color,
                      }}
                    >
                      {stageConfig.label}
                    </span>
                  )}
                </div>
              )
            })
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No files yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

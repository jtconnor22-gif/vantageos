import { createClient } from '@/lib/supabase/server'
import { STAGE_CONFIG } from '@/lib/stage-config'
import type { PipelineStage } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

type PartnerFileRow = {
  id: string | null
  org_id: string | null
  file_code: string | null
  client_name: string | null
  business_name: string | null
  stage: PipelineStage | null
  current_status: string | null
  referral_partner_id: string | null
  created_at: string | null
}

export default async function PortalClientsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('partner_files_view').select('*').order('created_at', { ascending: false })
  const rows = (data ?? []) as PartnerFileRow[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
          My Referred Clients
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Stage updates only · no financial data shown
        </p>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
        <div
          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{
            display: 'grid',
            gridTemplateColumns: '.9fr 1.1fr 1.2fr 1fr',
            gap: '12px',
            backgroundColor: '#FAFBFD',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span>File</span>
          <span>Client / Business</span>
          <span>Stage</span>
          <span>Status</span>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No referred clients yet.
          </div>
        ) : (
          rows.map((file, idx) => {
            const cfg = file.stage ? STAGE_CONFIG[file.stage] : null
            return (
              <div
                key={file.id ?? idx}
                className="px-5 py-3.5 items-center"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '.9fr 1.1fr 1.2fr 1fr',
                  gap: '12px',
                  borderBottom: idx < rows.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="text-xs font-mono font-semibold" style={{ color: 'var(--accent)' }}>
                  {file.file_code}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{file.client_name}</div>
                  {file.business_name && (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{file.business_name}</div>
                  )}
                </div>
                <div>
                  {cfg ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                      {cfg.label}
                    </span>
                  ) : '—'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{file.current_status ?? '—'}</div>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-4 px-4 py-3 rounded-xl text-xs flex items-start gap-2"
        style={{ backgroundColor: 'rgba(79,70,229,0.06)', color: '#6366F1', border: '1px solid rgba(79,70,229,0.12)' }}>
        <span className="mt-0.5 flex-shrink-0">🔒</span>
        <span>Revenue, fees, internal notes, and staff assignments are not visible in the partner portal.</span>
      </div>
    </div>
  )
}

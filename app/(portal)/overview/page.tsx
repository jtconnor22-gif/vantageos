import { createClient } from '@/lib/supabase/server'
import { STAGE_CONFIG } from '@/lib/stage-config'
import Link from 'next/link'
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

export default async function PortalOverviewPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('partner_files_view').select('*').order('stage')
  const rows = (data ?? []) as PartnerFileRow[]

  const FUNDED = ['funded', 'success_fee_collected', 'success_fee_invoice_sent'] as PipelineStage[]
  const funded = rows.filter(f => f.stage && FUNDED.includes(f.stage))
  const active = rows.filter(f => !f.stage || !FUNDED.includes(f.stage))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
          Partner Overview
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Track the status of your referred clients
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Referrals', value: rows.length },
          { label: 'Active Files', value: active.length },
          { label: 'Funded Deals', value: funded.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
            <div className="text-3xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>Your Referred Files</h3>
          <Link href="/portal/clients" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>View all →</Link>
        </div>
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No referred files yet. Your clients will appear here once they are added.
          </div>
        ) : (
          rows.slice(0, 6).map((file, idx) => {
            const cfg = file.stage ? STAGE_CONFIG[file.stage] : null
            return (
              <div key={file.id ?? idx} className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottom: idx < Math.min(rows.length, 6) - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{file.client_name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{file.business_name ?? file.file_code}</div>
                </div>
                {cfg && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    {cfg.label}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

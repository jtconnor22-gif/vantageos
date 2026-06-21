import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getFileById } from '@/lib/queries/files'
import { getLenders } from '@/lib/queries/applications'
import { STAGE_CONFIG, avatarColor, getInitials, formatMoney } from '@/lib/stage-config'
import StageSelector from '@/components/StageSelector'
import FileProfileActions from '@/components/FileProfileActions'
import type { Application, Document, Task } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function FileProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [file, supabase, lenders] = await Promise.all([
    getFileById(id),
    createClient(),
    getLenders(),
  ])

  if (!file) notFound()

  type AppRow = Application & { lenders: { name: string } | null }

  // Fetch applications for this file
  const { data: applicationsRaw } = await supabase
    .from('applications')
    .select('*, lenders(name)')
    .eq('funding_file_id', id)
    .order('created_at', { ascending: false })
  const applications = (applicationsRaw ?? []) as AppRow[]

  // Fetch documents
  const { data: documentsRaw } = await supabase
    .from('documents')
    .select('*')
    .eq('funding_file_id', id)
    .order('tier')
  const documents = (documentsRaw ?? []) as Document[]

  const { data: tasksRaw } = await supabase
    .from('tasks')
    .select('*')
    .eq('funding_file_id', id)
    .order('due_date', { ascending: true, nullsFirst: false })
  const tasks = (tasksRaw ?? []) as Task[]

  const cfg = STAGE_CONFIG[file.stage]
  const color = avatarColor(file.id)
  const initials = getInitials(file.client_name)

  const facts = [
    { label: 'Email',            value: file.email },
    { label: 'Phone',            value: file.phone },
    { label: 'State',            value: file.state },
    { label: 'Business Type',    value: file.business_type },
    { label: 'EIN (last 4)',     value: file.ein_last4 ? `••${file.ein_last4}` : null },
    { label: 'Industry',         value: file.industry },
    { label: 'Time in Business', value: file.time_in_business },
    { label: 'Monthly Revenue',  value: formatMoney(file.monthly_revenue) },
    { label: 'Est. FICO',        value: file.est_fico?.toString() },
    { label: 'Funding Goal',     value: formatMoney(file.funding_goal) },
    { label: 'Funding Type',     value: file.funding_type },
    { label: 'Referral Partner', value: file.referral_partners?.name },
    { label: 'Assigned To',      value: file.assigned_profile?.full_name },
    { label: 'Last Contact',     value: file.last_contact_date ? new Date(file.last_contact_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null },
    { label: 'Next Follow-Up',   value: file.next_followup_date ? new Date(file.next_followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null },
    { label: 'Status',           value: file.current_status },
  ]

  const APP_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    draft:      { bg: '#F0F1F6', text: '#64748B' },
    submitted:  { bg: '#DBEAFE', text: '#2563EB' },
    in_review:  { bg: '#F1ECFD', text: '#8B5CF6' },
    approved:   { bg: '#DCFCE7', text: '#16A34A' },
    declined:   { bg: '#FEE2E2', text: '#DC2626' },
    funded:     { bg: '#D1FAE5', text: '#059669' },
  }

  const DOC_STATUS_COLORS: Record<string, { dot: string; label: string }> = {
    uploaded:       { dot: '#10B981', label: 'Uploaded' },
    requested:      { dot: '#F59E0B', label: 'Requested' },
    missing:        { dot: '#E5484D', label: 'Missing' },
    not_applicable: { dot: '#94A3B8', label: 'N/A' },
  }

  const DOC_TIER_COLORS: Record<string, string> = {
    required:  '#E5484D',
    preferred: '#F59E0B',
    optional:  '#94A3B8',
  }

  return (
    <div className="max-w-6xl">
      {/* Back */}
      <Link
        href="/files"
        className="inline-flex items-center gap-1.5 text-sm mb-5 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={() => {}}
      >
        <ArrowLeft size={14} />
        All Files
      </Link>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">

          {/* Header card */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
          >
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
                style={{ backgroundColor: color, fontSize: '20px' }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold truncate" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
                  {file.client_name}
                </h1>
                <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {file.business_name && <span>{file.business_name} · </span>}
                  <span className="font-mono text-xs">{file.file_code}</span>
                </div>
              </div>
              <StageSelector fileId={file.id} currentStage={file.stage} />
            </div>

            {/* Stage pill + action buttons */}
            <div className="flex items-center justify-between gap-2 mb-5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </span>
              <FileProfileActions fileId={file.id} lenders={lenders.map(l => ({ id: l.id, name: l.name }))} />
            </div>

            {/* Facts grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {facts.map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                  <div className="text-sm font-medium" style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {value ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applications card */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
          >
            <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>
                Applications
              </h3>
            </div>
            {!applications?.length ? (
              <div className="px-5 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                No applications yet
              </div>
            ) : (
              applications.map((app, idx) => {
                const sc = APP_STATUS_COLORS[app.status] ?? { bg: '#F0F1F6', text: '#64748B' }
                return (
                  <div
                    key={app.id}
                    className="px-5 py-3.5 flex items-center justify-between"
                    style={{ borderBottom: idx < applications.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {app.product_name ?? app.category}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {app.lenders?.name ?? 'No lender'} · {app.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                      {app.approved_amount && (
                        <div className="text-xs font-semibold" style={{ color: '#0EA968' }}>
                          {formatMoney(app.approved_amount)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Internal Notes */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>
              Internal Notes
            </h3>
            <p className="text-sm" style={{ color: file.internal_notes ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: '1.6' }}>
              {file.internal_notes ?? 'No notes yet.'}
            </p>
          </div>

          {/* Tasks */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
          >
            <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>
                Tasks
              </h3>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {tasks.filter(t => t.status !== 'done').length} open
              </span>
            </div>
            {tasks.length === 0 ? (
              <div className="px-5 py-5 text-sm" style={{ color: 'var(--text-muted)' }}>No tasks yet</div>
            ) : (
              tasks.map((task, idx) => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date()
                const done = task.status === 'done'
                const PCOL: Record<string, string> = { high: '#DC2626', medium: '#D97706', low: '#16A34A' }
                return (
                  <div
                    key={task.id}
                    className="px-5 py-3 flex items-start gap-3"
                    style={{ borderBottom: idx < tasks.length - 1 ? '1px solid var(--border)' : 'none', opacity: done ? 0.55 : 1 }}
                  >
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: PCOL[task.priority] ?? '#94A3B8' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      {task.due_date && (
                        <div className="text-xs mt-0.5" style={{ color: isOverdue && !done ? '#DC2626' : 'var(--text-muted)' }}>
                          Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium flex-shrink-0 capitalize" style={{ color: 'var(--text-muted)' }}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">

          {/* Client Summary — dark card */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, #171B2E 0%, #0E1220 100%)',
              boxShadow: '0 8px 24px rgba(14,18,32,0.28)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk,sans-serif' }}>
                Client Summary
              </h3>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(79,70,229,0.3)', color: '#A5B4FC' }}
              >
                AI
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: file.client_summary ? '#C8CEDD' : '#4F5A72' }}
            >
              {file.client_summary ?? `No summary generated yet. Click "Generate" to create an AI summary for ${file.client_name}.`}
            </p>
            <button
              className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: 'rgba(79,70,229,0.25)', color: '#A5B4FC', border: '1px solid rgba(79,70,229,0.3)' }}
            >
              Generate Client Update
            </button>
          </div>

          {/* Documents */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
          >
            <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>
                Documents
              </h3>
              {documents && documents.length > 0 && (
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {documents.filter(d => d.status === 'uploaded').length}/{documents.length} uploaded
                </span>
              )}
            </div>

            {!documents?.length ? (
              <div className="px-5 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                No documents tracked for this file
              </div>
            ) : (
              documents.map((doc, idx) => {
                const ds = DOC_STATUS_COLORS[doc.status] ?? DOC_STATUS_COLORS.missing
                const tierColor = DOC_TIER_COLORS[doc.tier]
                return (
                  <div
                    key={doc.id}
                    className="px-5 py-3 flex items-center gap-3"
                    style={{ borderBottom: idx < documents.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ds.dot }} />
                    <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                      {doc.name}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `${tierColor}18`, color: tierColor }}
                    >
                      {doc.tier}
                    </span>
                    <span
                      className="text-xs font-medium flex-shrink-0"
                      style={{ color: ds.dot }}
                    >
                      {ds.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Quick stats */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk,sans-serif' }}>
              File Details
            </h3>
            <div className="space-y-3">
              <Row label="File Code" value={file.file_code} mono />
              <Row label="Success Fee" value={`${((file.success_fee_pct ?? 0.10) * 100).toFixed(0)}%`} />
              <Row label="Created" value={new Date(file.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
              <Row label="Last Updated" value={new Date(file.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span
        className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}

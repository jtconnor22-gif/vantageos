import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Document } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

type DocWithFile = Document & {
  funding_files: { id: string; client_name: string; file_code: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; color: string }> = {
  uploaded:       { label: 'Uploaded',  dot: '#10B981', bg: '#DCFCE7', color: '#059669' },
  requested:      { label: 'Requested', dot: '#F59E0B', bg: '#FEF3C7', color: '#D97706' },
  missing:        { label: 'Missing',   dot: '#E5484D', bg: '#FEE2E2', color: '#DC2626' },
  not_applicable: { label: 'N/A',       dot: '#94A3B8', bg: '#F0F1F6', color: '#64748B' },
}

const TIER_COLOR: Record<string, string> = {
  required:  '#E5484D',
  preferred: '#F59E0B',
  optional:  '#94A3B8',
}

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: raw } = await supabase
    .from('documents')
    .select('*, funding_files(id, client_name, file_code)')
    .order('tier')
    .order('name')
  const documents = (raw ?? []) as DocWithFile[]

  const uploaded = documents.filter(d => d.status === 'uploaded').length
  const missing = documents.filter(d => d.status === 'missing').length
  const requested = documents.filter(d => d.status === 'requested').length

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
          Documents
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {documents.length} total · {uploaded} uploaded · {missing} missing · {requested} requested
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Uploaded', value: uploaded, bg: '#DCFCE7', color: '#059669' },
          { label: 'Requested', value: requested, bg: '#FEF3C7', color: '#D97706' },
          { label: 'Missing', value: missing, bg: '#FEE2E2', color: '#DC2626' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 flex items-center gap-3"
            style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: s.bg, color: s.color }}
            >
              {s.value}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Documents</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
      >
        <div
          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr .7fr .8fr .7fr',
            gap: '12px',
            backgroundColor: '#FAFBFD',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span>Document Name</span>
          <span>File / Client</span>
          <span>Tier</span>
          <span>Status</span>
          <span>Uploaded</span>
        </div>

        {documents.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No documents yet. Open a file to add documents to its checklist.
          </div>
        ) : (
          documents.map((doc, idx) => {
            const sc = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.missing
            const tierColor = TIER_COLOR[doc.tier] ?? '#94A3B8'
            return (
              <Link key={doc.id} href={`/files/${doc.funding_file_id}`}>
                <div
                  className="px-5 py-3.5 items-center transition-colors"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr .7fr .8fr .7fr',
                    gap: '12px',
                    borderBottom: idx < documents.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFBFD' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.dot }} />
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {doc.name}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {doc.funding_files?.client_name ?? '—'}
                    </div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--accent)' }}>
                      {doc.funding_files?.file_code ?? ''}
                    </div>
                  </div>
                  <div>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                      style={{ backgroundColor: `${tierColor}18`, color: tierColor }}
                    >
                      {doc.tier}
                    </span>
                  </div>
                  <div>
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {doc.upload_date
                      ? new Date(doc.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : '—'}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

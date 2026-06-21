import Link from 'next/link'
import { getFiles } from '@/lib/queries/files'
import { STAGE_CONFIG, avatarColor, getInitials, formatMoney } from '@/lib/stage-config'

export const dynamic = 'force-dynamic'

export default async function FilesPage() {
  const files = await getFiles()

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
            Funding Files
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {files.length} total file{files.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
      >
        {/* Table header */}
        <div
          className="px-5 py-3 grid text-xs font-semibold uppercase tracking-wide"
          style={{
            gridTemplateColumns: '1.6fr 1fr .8fr 1fr 1fr .9fr',
            gap: '12px',
            backgroundColor: '#FAFBFD',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span>Client / Business</span>
          <span>Stage</span>
          <span>FICO</span>
          <span>Funding Goal</span>
          <span>Referral Partner</span>
          <span>Next Follow-Up</span>
        </div>

        {/* Rows */}
        {files.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No funding files yet. Click <strong>+ New File</strong> to create one.
          </div>
        ) : (
          files.map((file, idx) => {
            const cfg = STAGE_CONFIG[file.stage]
            const isOverdue = file.next_followup_date && new Date(file.next_followup_date) < new Date()
            const color = avatarColor(file.id)

            return (
              <Link key={file.id} href={`/files/${file.id}`}>
                <div
                  className="px-5 py-3.5 grid items-center transition-colors"
                  style={{
                    gridTemplateColumns: '1.6fr 1fr .8fr 1fr 1fr .9fr',
                    gap: '12px',
                    borderBottom: idx < files.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFBFD' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  {/* Client / Business */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {getInitials(file.client_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {file.client_name}
                      </div>
                      {file.business_name && (
                        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {file.business_name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage pill */}
                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${cfg.color}18`,
                        color: cfg.color,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {/* FICO */}
                  <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {file.est_fico ?? '—'}
                  </div>

                  {/* Funding Goal */}
                  <div className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: '#0EA968' }}>
                    {formatMoney(file.funding_goal)}
                  </div>

                  {/* Referral Partner */}
                  <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                    {file.referral_partners?.name ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </div>

                  {/* Next follow-up */}
                  <div
                    className="text-sm font-medium"
                    style={{ color: isOverdue ? '#E5484D' : 'var(--text-secondary)' }}
                  >
                    {file.next_followup_date
                      ? new Date(file.next_followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
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

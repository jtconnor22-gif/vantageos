import { FolderOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FileDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/files"
        className="inline-flex items-center gap-2 text-sm mb-5 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={15} />
        Back to Files
      </Link>

      <div
        className="rounded-[14px] bg-white p-10 flex flex-col items-center text-center"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)' }}
        >
          <FolderOpen size={28} style={{ color: 'var(--accent)' }} />
        </div>
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          File Detail
        </h2>
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          File ID: <span className="font-mono" style={{ color: 'var(--accent)' }}>{params.id}</span>
        </p>
        <p className="text-sm mb-6 max-w-md" style={{ color: 'var(--text-secondary)' }}>
          The full file detail view — including client info, pipeline stage manager, applications,
          document checklist, tasks, and activity timeline — is coming in Phase 2.
        </p>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 2
        </span>
      </div>

      {/* Preview sections */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {['Client Information', 'Pipeline Stage', 'Applications', 'Documents'].map((section) => (
          <div
            key={section}
            className="rounded-[14px] bg-white p-5"
            style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {section}
            </p>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 rounded"
                  style={{ backgroundColor: 'var(--subtle)', width: `${60 + i * 10}%`, border: '1px solid var(--border)' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

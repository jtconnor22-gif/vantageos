import { Columns2 } from 'lucide-react'

const STAGES = [
  'Lead Received',
  'Appointment Scheduled',
  'Consultation Completed',
  'Application Sent',
  'Submitted for Funding',
  'Funded',
]

export default function PipelinePage() {
  return (
    <div>
      <div
        className="rounded-[14px] bg-white p-10 flex flex-col items-center text-center mb-6"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)' }}
        >
          <Columns2 size={28} style={{ color: 'var(--accent)' }} />
        </div>
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Pipeline Board
        </h2>
        <p className="text-sm mb-4 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
          A full Kanban-style pipeline view with drag-and-drop stage management, file cards, and
          quick-action menus is coming in Phase 2.
        </p>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 2
        </span>
      </div>

      {/* Stage preview */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className="shrink-0 rounded-[14px] p-4"
            style={{
              width: '200px',
              backgroundColor: 'var(--subtle)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="text-xs font-semibold mb-3 uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              {stage}
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg"
                  style={{ backgroundColor: 'var(--border)' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

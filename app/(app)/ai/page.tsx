import { Sparkles } from 'lucide-react'

const AI_FEATURES = [
  {
    title: 'File Status Summaries',
    description: 'AI-generated plain-English summaries of each file\'s current status, next steps, and risk flags.',
    phase: 'Phase 4',
  },
  {
    title: 'Smart Follow-up Drafts',
    description: 'Auto-drafted emails and SMS messages personalized to each client\'s stage and last interaction.',
    phase: 'Phase 4',
  },
  {
    title: 'Document Gap Analysis',
    description: 'Automatically detect missing documents and generate tailored request messages.',
    phase: 'Phase 4',
  },
  {
    title: 'Pipeline Insights',
    description: 'Identify stalled files, predict funding probability, and surface action items proactively.',
    phase: 'Phase 4',
  },
]

export default function AIPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            AI Updates
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            AI-powered insights and automation for your funding pipeline
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 4
        </span>
      </div>

      <div
        className="rounded-[14px] p-8 mb-6 flex items-center gap-6"
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          boxShadow: '0 4px 20px rgba(79,70,229,0.25)',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <Sparkles size={28} color="white" />
        </div>
        <div>
          <h3
            className="text-xl font-semibold text-white mb-1"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            AI-Powered Funding Intelligence
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Vantage AI will help you close deals faster, follow up smarter, and never let a file
            fall through the cracks — powered by Claude.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {AI_FEATURES.map(({ title, description, phase }) => (
          <div
            key={title}
            className="rounded-[14px] bg-white p-6"
            style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <h4
                className="font-semibold text-sm"
                style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {title}
              </h4>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2"
                style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
              >
                {phase}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

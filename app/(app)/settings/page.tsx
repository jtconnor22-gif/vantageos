import { Settings } from 'lucide-react'

const SETTING_SECTIONS = [
  {
    title: 'Organization',
    items: ['Org name & branding', 'White-label config', 'Billing & plan'],
  },
  {
    title: 'Team',
    items: ['User management', 'Role permissions', 'Invite members'],
  },
  {
    title: 'Integrations',
    items: ['Fillout form webhook', 'Email / SMS provider', 'Lender connections'],
  },
  {
    title: 'Pipeline',
    items: ['Stage configuration', 'Default success fee', 'Product catalog'],
  },
]

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            Settings
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Configure your Vantage workspace
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Coming in Phase 3
        </span>
      </div>

      <div className="space-y-4">
        {SETTING_SECTIONS.map(({ title, items }) => (
          <div
            key={title}
            className="rounded-[14px] bg-white overflow-hidden"
            style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
          >
            <div
              className="px-5 py-3"
              style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--subtle)' }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {title}
              </span>
            </div>
            {items.map((item, idx) => (
              <div
                key={item}
                className="flex items-center justify-between px-5 py-4 text-sm"
                style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                <span
                  className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: 'var(--subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  Configure
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

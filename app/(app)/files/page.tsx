import { FolderOpen, Search } from 'lucide-react'

const MOCK_FILES = [
  { code: 'VF-1000', client: 'Maria Gonzalez', business: 'Gonzalez Grill LLC', stage: 'Documents Received', state: 'FL' },
  { code: 'VF-1001', client: 'James Carter', business: 'Carter Construction Inc', stage: 'Submitted for Funding', state: 'TX' },
  { code: 'VF-1002', client: 'Aisha Williams', business: 'Williams Tech Solutions', stage: 'Consultation Completed', state: 'GA' },
  { code: 'VF-1003', client: 'Robert Nguyen', business: 'Nguyen Auto Group', stage: 'Funded', state: 'CA' },
  { code: 'VF-1004', client: 'Tanya Brooks', business: 'Brooks Beauty Bar', stage: 'Lead Received', state: 'NY' },
]

export default function FilesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            Funding Files
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            All client files across your pipeline
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}
        >
          Full table coming in Phase 2
        </span>
      </div>

      <div
        className="rounded-[14px] bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-5 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: 'var(--subtle)',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span>File Code</span>
          <span>Client</span>
          <span>Business</span>
          <span>Stage</span>
          <span>State</span>
        </div>

        {MOCK_FILES.map((file, idx) => (
          <div
            key={file.code}
            className="grid grid-cols-5 gap-4 px-5 py-4 text-sm transition-colors cursor-pointer"
            style={{
              borderBottom: idx < MOCK_FILES.length - 1 ? '1px solid var(--border)' : 'none',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--subtle)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span
              className="font-semibold font-mono text-xs"
              style={{ color: 'var(--accent)' }}
            >
              {file.code}
            </span>
            <span className="font-medium">{file.client}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{file.business}</span>
            <span>
              <span
                className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                {file.stage}
              </span>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>{file.state}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

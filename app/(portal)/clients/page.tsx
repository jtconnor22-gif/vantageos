import { Users } from 'lucide-react'

const STAGE_LABELS: Record<string, string> = {
  lead_received: 'Lead Received',
  appointment_scheduled: 'Appointment Scheduled',
  consultation_completed: 'Consultation Completed',
  application_sent: 'Application Sent',
  application_submitted: 'Application Submitted',
  documents_requested: 'Documents Requested',
  documents_received: 'Documents Received',
  conditions_before_submission: 'Conditions Before Submission',
  submitted_for_funding: 'Submitted for Funding',
  verification: 'Verification',
  funded: 'Funded',
  success_fee_invoice_sent: 'Invoice Sent',
  success_fee_collected: 'Fee Collected',
  referral_request: 'Referral Request',
}

const STAGE_STYLES: Record<string, { color: string; bg: string }> = {
  funded: { color: '#10B981', bg: '#ECFDF5' },
  submitted_for_funding: { color: '#0EA5E9', bg: '#F0F9FF' },
  documents_received: { color: '#F59E0B', bg: '#FFFBEB' },
  lead_received: { color: '#5A6172', bg: 'var(--subtle)' },
}

function getStageStyle(stage: string) {
  return STAGE_STYLES[stage] ?? { color: '#5A6172', bg: 'var(--subtle)' }
}

// Mock data for partner's files (no financial info)
const PARTNER_FILES = [
  {
    file_code: 'VF-1000',
    client_name: 'Maria Gonzalez',
    business_name: 'Gonzalez Grill LLC',
    stage: 'documents_received',
    current_status: 'Awaiting underwriting review',
    created_at: '2026-05-10',
  },
  {
    file_code: 'VF-1004',
    client_name: 'Tanya Brooks',
    business_name: 'Brooks Beauty Bar',
    stage: 'lead_received',
    current_status: 'Initial intake complete',
    created_at: '2026-06-20',
  },
]

export default function PortalClientsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          My Referred Clients
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Status updates for clients you have referred to Vantage
        </p>
      </div>

      <div
        className="rounded-[14px] bg-white overflow-hidden mb-5"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide grid grid-cols-4 gap-4"
          style={{ backgroundColor: 'var(--subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <span>Client</span>
          <span>Business</span>
          <span>Stage</span>
          <span>Status</span>
        </div>

        {PARTNER_FILES.map((file, idx) => {
          const style = getStageStyle(file.stage)
          return (
            <div
              key={file.file_code}
              className="grid grid-cols-4 gap-4 px-5 py-4 text-sm items-center"
              style={{ borderBottom: idx < PARTNER_FILES.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {file.client_name}
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
                  {file.file_code}
                </div>
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>{file.business_name}</span>
              <span>
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: style.bg, color: style.color }}
                >
                  {STAGE_LABELS[file.stage] ?? file.stage}
                </span>
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {file.current_status}
              </span>
            </div>
          )
        })}
      </div>

      <div
        className="rounded-[14px] bg-white p-8 flex flex-col items-center text-center"
        style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(79,70,229,0.08)' }}
        >
          <Users size={22} style={{ color: 'var(--accent)' }} />
        </div>
        <h3
          className="text-base font-semibold mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Full Client Timeline Coming Soon
        </h3>
        <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
          Stage-by-stage progress tracking, milestone notifications, and document upload links for
          your clients are coming in Phase 3.
        </p>
      </div>
    </div>
  )
}

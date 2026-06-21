import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

type PillVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'muted'

const VARIANT_STYLES: Record<PillVariant, { color: string; bg: string }> = {
  default: { color: '#5A6172', bg: '#F4F5F8' },
  success: { color: '#10B981', bg: '#ECFDF5' },
  warning: { color: '#F59E0B', bg: '#FFFBEB' },
  danger: { color: '#EF4444', bg: '#FEF2F2' },
  info: { color: '#0EA5E9', bg: '#F0F9FF' },
  accent: { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
  muted: { color: '#7A8198', bg: '#F4F5F8' },
}

interface PillProps {
  label: string
  variant?: PillVariant
  dot?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function Pill({ label, variant = 'default', dot = false, className, style }: PillProps) {
  const { color, bg } = VARIANT_STYLES[variant]

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
          className
        )
      )}
      style={{ backgroundColor: bg, color, ...style }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </span>
  )
}

// Utility: map pipeline_stage to Pill variant
export function stageToPillVariant(stage: string): PillVariant {
  if (stage === 'funded' || stage === 'success_fee_collected') return 'success'
  if (stage === 'submitted_for_funding' || stage === 'verification') return 'info'
  if (stage === 'documents_requested' || stage === 'conditions_before_submission') return 'warning'
  if (stage === 'lead_received') return 'muted'
  return 'default'
}

// Utility: map app_status to Pill variant
export function appStatusToPillVariant(status: string): PillVariant {
  if (status === 'funded' || status === 'approved') return 'success'
  if (status === 'in_review' || status === 'submitted') return 'info'
  if (status === 'declined') return 'danger'
  if (status === 'draft') return 'muted'
  return 'default'
}

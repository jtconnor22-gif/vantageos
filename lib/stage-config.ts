import type { PipelineStage } from '@/lib/supabase/types'

export const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string }> = {
  lead_received:                 { label: 'Lead Received',               color: '#64748B' },
  appointment_scheduled:         { label: 'Appointment Scheduled',       color: '#0EA5E9' },
  consultation_completed:        { label: 'Consultation Completed',      color: '#06B6D4' },
  application_sent:              { label: 'Application Sent',            color: '#6366F1' },
  application_submitted:         { label: 'Application Submitted',       color: '#8B5CF6' },
  documents_requested:           { label: 'Documents Requested',         color: '#F59E0B' },
  documents_received:            { label: 'Documents Received',          color: '#84CC16' },
  conditions_before_submission:  { label: 'Conditions Before Submission',color: '#F97316' },
  submitted_for_funding:         { label: 'Submitted for Funding',       color: '#3B82F6' },
  verification:                  { label: 'Verification',                color: '#A855F7' },
  funded:                        { label: 'Funded',                      color: '#10B981' },
  success_fee_invoice_sent:      { label: 'Invoice Sent',                color: '#14B8A6' },
  success_fee_collected:         { label: 'Fee Collected',               color: '#16A34A' },
  referral_request:              { label: 'Referral Request',            color: '#EC4899' },
}

export const STAGE_ORDER: PipelineStage[] = [
  'lead_received',
  'appointment_scheduled',
  'consultation_completed',
  'application_sent',
  'application_submitted',
  'documents_requested',
  'documents_received',
  'conditions_before_submission',
  'submitted_for_funding',
  'verification',
  'funded',
  'success_fee_invoice_sent',
  'success_fee_collected',
  'referral_request',
]

export const AVATAR_COLORS = [
  '#6366F1', '#0EA5E9', '#F59E0B', '#EC4899',
  '#14B8A6', '#8B5CF6', '#10B981', '#F97316', '#3B82F6',
]

export function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash += seed.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export function formatMoney(n: number | null | undefined): string {
  if (n == null) return '—'
  return '$' + n.toLocaleString()
}

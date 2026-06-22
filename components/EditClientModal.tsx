'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

const TIME_IN_BUSINESS_OPTIONS = [
  'Less than 1 year',
  '1-2 years',
  '2-5 years',
  '5-10 years',
  '10+ years',
]

const FUNDING_TYPE_OPTIONS = [
  'Working Capital',
  'Equipment Financing',
  'Real Estate',
  'SBA Loan',
  'Line of Credit',
  'Invoice Factoring',
  'Revenue-Based Financing',
  'Other',
]

interface DefaultValues {
  client_name?: string | null
  business_name?: string | null
  email?: string | null
  phone?: string | null
  state?: string | null
  industry?: string | null
  time_in_business?: string | null
  monthly_revenue?: number | null
  funding_goal?: number | null
  funding_type?: string | null
  est_fico?: number | null
  current_status?: string | null
  next_followup_date?: string | null
  last_contact_date?: string | null
}

interface Props {
  fileId: string
  defaultValues: DefaultValues
  onClose: () => void
}

export default function EditClientModal({ fileId, defaultValues, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    client_name: defaultValues.client_name ?? '',
    business_name: defaultValues.business_name ?? '',
    email: defaultValues.email ?? '',
    phone: defaultValues.phone ?? '',
    state: defaultValues.state ?? '',
    industry: defaultValues.industry ?? '',
    time_in_business: defaultValues.time_in_business ?? '',
    monthly_revenue: defaultValues.monthly_revenue?.toString() ?? '',
    funding_goal: defaultValues.funding_goal?.toString() ?? '',
    funding_type: defaultValues.funding_type ?? '',
    est_fico: defaultValues.est_fico?.toString() ?? '',
    current_status: defaultValues.current_status ?? '',
    next_follow_up: defaultValues.next_followup_date ?? '',
    last_contact_date: defaultValues.last_contact_date ?? '',
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_name.trim()) { setError('Client name is required'); return }
    setError(null); setLoading(true)
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          monthly_revenue: form.monthly_revenue ? parseFloat(form.monthly_revenue) : null,
          funding_goal: form.funding_goal ? parseFloat(form.funding_goal) : null,
          est_fico: form.est_fico ? parseFloat(form.est_fico) : null,
          next_follow_up: form.next_follow_up || null,
          last_contact_date: form.last_contact_date || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onClose()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally { setLoading(false) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(14,18,32,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[560px] mx-4 max-h-[90vh] flex flex-col"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.25)', animation: 'vFade 0.18s ease' }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>Edit Client Info</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-3.5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Client Name *">
              <input type="text" value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Full name" className="fi" required />
            </FormField>
            <FormField label="Business Name">
              <input type="text" value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="DBA or legal name" className="fi" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email">
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" className="fi" />
            </FormField>
            <FormField label="Phone">
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" className="fi" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="State">
              <input type="text" value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. FL" maxLength={2} className="fi" />
            </FormField>
            <FormField label="Industry">
              <input type="text" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. Construction" className="fi" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Time in Business">
              <select value={form.time_in_business} onChange={e => set('time_in_business', e.target.value)} className="fi">
                <option value="">Select...</option>
                {TIME_IN_BUSINESS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </FormField>
            <FormField label="Est. FICO">
              <input type="number" min="300" max="850" value={form.est_fico} onChange={e => set('est_fico', e.target.value)} placeholder="e.g. 680" className="fi" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Monthly Revenue ($)">
              <input type="number" min="0" step="1" value={form.monthly_revenue} onChange={e => set('monthly_revenue', e.target.value)} placeholder="0" className="fi" />
            </FormField>
            <FormField label="Funding Goal ($)">
              <input type="number" min="0" step="1" value={form.funding_goal} onChange={e => set('funding_goal', e.target.value)} placeholder="0" className="fi" />
            </FormField>
          </div>

          <FormField label="Funding Type">
            <select value={form.funding_type} onChange={e => set('funding_type', e.target.value)} className="fi">
              <option value="">Select...</option>
              {FUNDING_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormField>

          <FormField label="Current Status">
            <input type="text" value={form.current_status} onChange={e => set('current_status', e.target.value)} placeholder="e.g. Awaiting bank statements" className="fi" />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Last Contact Date">
              <input type="date" value={form.last_contact_date} onChange={e => set('last_contact_date', e.target.value)} className="fi" />
            </FormField>
            <FormField label="Next Follow-Up">
              <input type="date" value={form.next_follow_up} onChange={e => set('next_follow_up', e.target.value)} className="fi" />
            </FormField>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: loading ? '#818CF8' : 'var(--accent)' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes vFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fi{width:100%;padding:7px 11px;font-size:13px;border:1px solid var(--border);border-radius:8px;background:var(--subtle);color:var(--text-primary);outline:none;}
        .fi:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,70,229,0.08);}
      `}</style>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}

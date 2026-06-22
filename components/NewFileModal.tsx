'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import type { ReferralPartner } from '@/lib/supabase/types'

interface Props {
  partners: Pick<ReferralPartner, 'id' | 'name'>[]
  onClose: () => void
}

const FUNDING_TYPES = [
  'Line of Credit',
  'Term Loan',
  'SBA Loan',
  'Equipment Finance',
  'Invoice Factoring',
  'Merchant Cash Advance',
  'Commercial Real Estate',
  'Revenue-Based Financing',
]

export default function NewFileModal({ partners, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    client_name: '',
    business_name: '',
    email: '',
    phone: '',
    funding_goal: '',
    funding_type: '',
    referral_partner_id: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          funding_goal: form.funding_goal ? parseFloat(form.funding_goal.replace(/,/g, '')) : null,
          referral_partner_id: form.referral_partner_id || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create file')

      onClose()
      router.push(`/files/${data.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(14,18,32,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[560px] mx-4 shadow-2xl"
        style={{
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          animation: 'vFade 0.2s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
              New Client
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Client will be created at Lead Received stage
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F1F6' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Client Name *" required>
              <input
                type="text"
                required
                value={form.client_name}
                onChange={e => set('client_name', e.target.value)}
                placeholder="Jane Smith"
                className="field-input"
              />
            </Field>
            <Field label="Business Name">
              <input
                type="text"
                value={form.business_name}
                onChange={e => set('business_name', e.target.value)}
                placeholder="Acme Corp"
                className="field-input"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="jane@acme.com"
                className="field-input"
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="(555) 000-0000"
                className="field-input"
              />
            </Field>
            <Field label="Funding Goal ($)">
              <input
                type="text"
                inputMode="numeric"
                value={form.funding_goal}
                onChange={e => set('funding_goal', e.target.value)}
                placeholder="150,000"
                className="field-input"
              />
            </Field>
            <Field label="Funding Type">
              <select
                value={form.funding_type}
                onChange={e => set('funding_type', e.target.value)}
                className="field-input"
              >
                <option value="">Select type...</option>
                {FUNDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Referral Partner">
            <select
              value={form.referral_partner_id}
              onChange={e => set('referral_partner_id', e.target.value)}
              className="field-input"
            >
              <option value="">No referral partner</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>

          {error && (
            <div className="px-3 py-2.5 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: loading ? '#818CF8' : 'var(--accent)', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes vFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .field-input {
          width: 100%;
          padding: 8px 12px;
          font-size: 13.5px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--subtle);
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(79,70,229,0.08);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

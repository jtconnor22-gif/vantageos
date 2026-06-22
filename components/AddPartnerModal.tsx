'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

export default function AddPartnerModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    commission_pct: '0',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/add-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          commission_pct: parseFloat(form.commission_pct) || 0,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add partner')

      setSuccess(true)
      onSuccess?.()
      setTimeout(() => onClose(), 1500)
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
        className="bg-white rounded-2xl w-full max-w-[520px] mx-4 shadow-2xl"
        style={{
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          animation: 'vFade 0.2s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>
              Add Referral Partner
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Add a new partner to your referral network
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <input
                type="text"
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="John Doe"
                className="field-input"
              />
            </Field>
            <Field label="Company">
              <input
                type="text"
                value={form.company}
                onChange={e => set('company', e.target.value)}
                placeholder="Acme LLC"
                className="field-input"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="john@example.com"
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
            <Field label="Commission %">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.commission_pct}
                onChange={e => set('commission_pct', e.target.value)}
                placeholder="0"
                className="field-input"
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="field-input"
              style={{ resize: 'vertical' }}
            />
          </Field>

          {error && (
            <div className="px-3 py-2.5 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="px-3 py-2.5 rounded-lg text-sm" style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
              Partner added successfully!
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
              disabled={loading || success}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: loading || success ? '#818CF8' : 'var(--accent)', cursor: loading || success ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Adding...' : success ? 'Added!' : 'Add Partner'}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

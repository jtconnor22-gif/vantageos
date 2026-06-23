'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface Lender { id: string; name: string }

interface Application {
  id: string
  product_name?: string | null
  lender_id?: string | null
  status: string
  approved_amount?: number | null
  funded_amount?: number | null
  submitted_date?: string | null
  decision_date?: string | null
  notes?: string | null
}

interface Props {
  application: Application
  lenders: Lender[]
  onClose: () => void
}

export default function EditApplicationModal({ application, lenders, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    product_name: application.product_name ?? '',
    lender_id: application.lender_id ?? '',
    status: application.status ?? 'draft',
    approved_amount: application.approved_amount?.toString() ?? '',
    funded_amount: application.funded_amount?.toString() ?? '',
    submitted_date: application.submitted_date?.slice(0, 10) ?? '',
    decision_date: application.decision_date?.slice(0, 10) ?? '',
    notes: application.notes ?? '',
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name.trim()) { setError('Product name is required'); return }
    setError(null); setLoading(true)
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: form.product_name,
          lender_id: form.lender_id || null,
          status: form.status,
          approved_amount: form.approved_amount ? parseFloat(form.approved_amount) : null,
          funded_amount: form.funded_amount ? parseFloat(form.funded_amount) : null,
          submitted_date: form.submitted_date || null,
          decision_date: form.decision_date || null,
          notes: form.notes || null,
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
        className="bg-white rounded-2xl w-full max-w-[480px] mx-4 max-h-[90vh] flex flex-col"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.25)', animation: 'vFade 0.18s ease' }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>Edit Application</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-3.5 overflow-y-auto flex-1">
          <FormField label="Product / Name *">
            <input
              type="text"
              value={form.product_name}
              onChange={e => set('product_name', e.target.value)}
              placeholder="e.g. Working Capital Term Loan"
              className="fi"
              required
            />
          </FormField>

          <FormField label="Lender">
            <select value={form.lender_id} onChange={e => set('lender_id', e.target.value)} className="fi">
              <option value="">No lender assigned</option>
              {lenders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </FormField>

          <FormField label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value)} className="fi">
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="funded">Funded</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Approved Amount ($)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.approved_amount}
                onChange={e => set('approved_amount', e.target.value)}
                placeholder="0.00"
                className="fi"
              />
            </FormField>
            <FormField label="Funded Amount ($)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.funded_amount}
                onChange={e => set('funded_amount', e.target.value)}
                placeholder="0.00"
                className="fi"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Submitted Date">
              <input type="date" value={form.submitted_date} onChange={e => set('submitted_date', e.target.value)} className="fi" />
            </FormField>
            <FormField label="Decision Date">
              <input type="date" value={form.decision_date} onChange={e => set('decision_date', e.target.value)} className="fi" />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className="fi"
              style={{ resize: 'none' }}
            />
          </FormField>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: loading ? '#818CF8' : 'var(--accent)' }}
            >
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

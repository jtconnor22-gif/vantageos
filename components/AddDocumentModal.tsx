'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload } from 'lucide-react'

interface Props {
  fileId: string
  onClose: () => void
}

const COMMON_DOCS = [
  '3 Months Bank Statements',
  '6 Months Bank Statements',
  'Business Tax Returns (2 yr)',
  'Personal Tax Returns (2 yr)',
  'Voided Check',
  'Business License',
  'Articles of Incorporation',
  'Accounts Receivable Aging',
  'Profit & Loss Statement',
  'Balance Sheet',
  'Driver\'s License',
  'Lease Agreement',
]

export default function AddDocumentModal({ fileId, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ name: '', tier: 'required', status: 'missing' })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Document name required'); return }
    setError(null); setLoading(true)

    try {
      // 1. Create document record
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, funding_file_id: fileId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // 2. If a file was selected, upload it
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('documentId', data.id)
        const upRes = await fetch('/api/documents/upload', { method: 'POST', body: fd })
        if (!upRes.ok) {
          const upData = await upRes.json()
          throw new Error(upData.error ?? 'Upload failed')
        }
      }

      onClose(); router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(14,18,32,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl w-full max-w-[480px] mx-4" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.25)', animation: 'vFade 0.18s ease' }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ fontFamily: 'Space Grotesk,sans-serif', color: 'var(--text-primary)' }}>Add Document</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Document Name *</label>
            <input
              type="text"
              list="common-docs"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. 3 Months Bank Statements"
              className="fi"
              required
            />
            <datalist id="common-docs">
              {COMMON_DOCS.map(d => <option key={d} value={d} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tier</label>
              <select value={form.tier} onChange={e => set('tier', e.target.value)} className="fi">
                <option value="required">Required</option>
                <option value="preferred">Preferred</option>
                <option value="optional">Optional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="fi">
                <option value="missing">Missing</option>
                <option value="requested">Requested</option>
                <option value="uploaded">Uploaded</option>
                <option value="not_applicable">N/A</option>
              </select>
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Upload File <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <label
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer border transition-colors"
              style={{ borderColor: file ? 'var(--accent)' : 'var(--border)', backgroundColor: file ? 'rgba(79,70,229,0.04)' : 'var(--subtle)' }}
            >
              <Upload size={14} style={{ color: file ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }} />
              <span className="text-sm truncate" style={{ color: file ? 'var(--accent)' : 'var(--text-muted)' }}>
                {file ? file.name : 'Choose file to upload...'}
              </span>
              <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          {error && <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: loading ? '#818CF8' : 'var(--accent)' }}>
              {loading ? 'Saving...' : 'Add Document'}
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

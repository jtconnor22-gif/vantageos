'use client'

import { useState } from 'react'

const FUNDING_TYPES = [
  'Business Credit Cards',
  'Business Line of Credit',
  'SBA Loan',
  'Equipment Financing',
  'HELOC',
  'Revenue-Based Financing',
  'Invoice Factoring',
  'Merchant Cash Advance',
  'Other',
]

export default function IntakePage() {
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    email: '',
    phone: '',
    funding_goal: '',
    funding_type: '',
    monthly_revenue: '',
    time_in_business: '',
    notes: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Submission failed')
      }
      setStatus('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F9]">
        <div className="max-w-md w-full mx-4 bg-white rounded-2xl p-10 text-center" style={{ boxShadow: '0 4px 24px rgba(16,24,40,0.08)' }}>
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111827' }}>
            We received your info!
          </h2>
          <p className="text-sm text-gray-500 mb-1">
            A funding specialist will reach out within 1 business day to discuss your options.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Questions? Email us at <a href="mailto:gracefulprosperityllc@gmail.com" className="text-indigo-600">gracefulprosperityllc@gmail.com</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F5F9] py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>V</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111827' }}>
            Business Funding Application
          </h1>
          <p className="text-sm text-gray-500">
            Fill out the form below and we'll match you with the best funding options.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5" style={{ boxShadow: '0 4px 24px rgba(16,24,40,0.08)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                placeholder="John Smith"
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
              <input
                type="text"
                placeholder="Acme LLC"
                value={form.business_name}
                onChange={e => set('business_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input
                required
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
              <input
                required
                type="tel"
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Funding Goal</label>
              <input
                type="text"
                placeholder="$50,000"
                value={form.funding_goal}
                onChange={e => set('funding_goal', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Revenue</label>
              <input
                type="text"
                placeholder="$10,000"
                value={form.monthly_revenue}
                onChange={e => set('monthly_revenue', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Funding Type Needed</label>
              <select
                value={form.funding_type}
                onChange={e => set('funding_type', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all"
              >
                <option value="">Select type…</option>
                {FUNDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time in Business</label>
              <select
                value={form.time_in_business}
                onChange={e => set('time_in_business', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all"
              >
                <option value="">Select…</option>
                <option>Less than 6 months</option>
                <option>6–12 months</option>
                <option>1–2 years</option>
                <option>2–5 years</option>
                <option>5+ years</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
              <textarea
                rows={3}
                placeholder="Anything else we should know about your situation or goals?"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all resize-none"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: status === 'loading' ? '#818CF8' : '#4F46E5', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
          >
            {status === 'loading' ? 'Submitting…' : 'Submit Application'}
          </button>

          <p className="text-xs text-center text-gray-400">
            Your information is kept confidential and never shared without your permission.
          </p>
        </form>
      </div>
    </div>
  )
}

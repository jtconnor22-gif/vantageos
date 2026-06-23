'use client'

import { useState, useEffect } from 'react'

type Partner = { id: string; name: string; company: string | null }

type FormState = {
  // Personal
  first_name: string
  last_name: string
  dob: string
  ssn_last4: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  // Business
  business_name: string
  business_type: string
  ein: string
  industry: string
  time_in_business: string
  num_employees: string
  business_address_same: string
  business_address: string
  // Financial
  monthly_revenue: string
  annual_revenue: string
  funding_goal: string
  funding_purpose: string
  funding_type: string
  // Credit
  estimated_credit_score: string
  any_negative_items: string
  negative_details: string
  existing_business_credit: string
  // Bank / Additional
  primary_bank: string
  bank_account_type: string
  bankruptcy_history: string
  // Referral
  referral_source: string
  referral_name: string
  referral_partner_id: string
  // Consent
  consent: boolean
}

const BLANK: FormState = {
  first_name: '', last_name: '', dob: '', ssn_last4: '', email: '', phone: '',
  address: '', city: '', state: '', zip: '',
  business_name: '', business_type: '', ein: '', industry: '', time_in_business: '',
  num_employees: '', business_address_same: 'yes', business_address: '',
  monthly_revenue: '', annual_revenue: '', funding_goal: '', funding_purpose: '',
  funding_type: '',
  estimated_credit_score: '', any_negative_items: 'no', negative_details: '',
  existing_business_credit: 'no',
  primary_bank: '', bank_account_type: '', bankruptcy_history: 'no',
  referral_source: '', referral_name: '', referral_partner_id: '',
  consent: false,
}

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const BUSINESS_TYPES = ['Sole Proprietorship','Single-Member LLC','Multi-Member LLC','S-Corp','C-Corp','Partnership','Non-Profit','Other']
const FUNDING_TYPES = ['Business Credit Cards','Business Line of Credit','SBA Loan (7a)','SBA Loan (504)','Equipment Financing','HELOC','Revenue-Based Financing','Invoice Factoring','Merchant Cash Advance','Real Estate Loan','Other']
const CREDIT_RANGES = ['Below 580','580–619','620–659','660–699','700–739','740–779','780+','Not sure']
const INDUSTRIES = ['Construction','Healthcare','Real Estate','Retail','Restaurant/Food Service','Transportation','Technology','Professional Services','Beauty/Salon','Auto Services','Cleaning Services','Landscaping','E-Commerce','Education','Entertainment','Other']

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  )
}

function Input({ value, onChange, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { value: string; onChange: (v: string) => void }) {
  return (
    <input
      {...props}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all"
      style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }}
      onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)' }}
      onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
    />
  )
}

function Select({ value, onChange, children, ...props }: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & { value: string; onChange: (v: string) => void }) {
  return (
    <select
      {...props}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all"
      style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }}
      onFocus={e => { e.target.style.borderColor = '#4F46E5' }}
      onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
    >
      {children}
    </select>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pb-3 mb-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
      <h3 className="text-base font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111827' }}>{title}</h3>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{subtitle}</p>}
    </div>
  )
}

export default function IntakePage() {
  const [form, setForm] = useState<FormState>(BLANK)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [partners, setPartners] = useState<Partner[]>([])

  useEffect(() => {
    fetch('/api/public/partners')
      .then(r => r.ok ? r.json() : [])
      .then((data: Partner[]) => setPartners(data))
      .catch(() => {})
  }, [])

  function set(field: keyof FormState, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.consent) { setErrorMsg('Please agree to the terms before submitting.'); setStatus('error'); return }
    setStatus('loading'); setErrorMsg('')
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Submission failed') }
      setStatus('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F5F9' }}>
        <div className="max-w-md w-full mx-4 bg-white rounded-2xl p-10 text-center" style={{ boxShadow: '0 4px 24px rgba(16,24,40,0.08)' }}>
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111827' }}>Application Received!</h2>
          <p className="text-sm mb-3" style={{ color: '#6B7280' }}>Thank you! A funding specialist will contact you within 1 business day to review your options.</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Questions? Reach out to your advisor and we&apos;ll be happy to help.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: '#F4F5F9' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>V</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111827' }}>Business Funding Application</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>Complete all sections so we can match you with the best funding options. Takes ~5 minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SECTION 1 — Personal Info */}
          <div className="bg-white rounded-2xl p-7" style={{ boxShadow: '0 1px 4px rgba(16,24,40,0.06)', border: '1px solid #F3F4F6' }}>
            <SectionHeader title="Personal Information" />
            <div className="grid grid-cols-2 gap-4">
              <div><Label required>First Name</Label><Input required value={form.first_name} onChange={v => set('first_name', v)} placeholder="John" /></div>
              <div><Label required>Last Name</Label><Input required value={form.last_name} onChange={v => set('last_name', v)} placeholder="Smith" /></div>
              <div><Label required>Date of Birth</Label><Input required type="date" value={form.dob} onChange={v => set('dob', v)} /></div>
              <div><Label>SSN Last 4 Digits</Label><Input value={form.ssn_last4} onChange={v => set('ssn_last4', v)} placeholder="1234" maxLength={4} /></div>
              <div><Label required>Email</Label><Input required type="email" value={form.email} onChange={v => set('email', v)} placeholder="john@email.com" /></div>
              <div><Label required>Phone</Label><Input required type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="(555) 000-0000" /></div>
              <div className="col-span-2"><Label>Home Address</Label><Input value={form.address} onChange={v => set('address', v)} placeholder="123 Main St" /></div>
              <div><Label>City</Label><Input value={form.city} onChange={v => set('city', v)} placeholder="Miami" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>State</Label>
                  <Select value={form.state} onChange={v => set('state', v)}>
                    <option value="">Select…</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </Select>
                </div>
                <div><Label>ZIP</Label><Input value={form.zip} onChange={v => set('zip', v)} placeholder="33101" maxLength={5} /></div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — Business Info */}
          <div className="bg-white rounded-2xl p-7" style={{ boxShadow: '0 1px 4px rgba(16,24,40,0.06)', border: '1px solid #F3F4F6' }}>
            <SectionHeader title="Business Information" />
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label required>Legal Business Name</Label><Input required value={form.business_name} onChange={v => set('business_name', v)} placeholder="Smith Holdings LLC" /></div>
              <div><Label>Business Type</Label>
                <Select value={form.business_type} onChange={v => set('business_type', v)}>
                  <option value="">Select…</option>
                  {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                </Select>
              </div>
              <div><Label>EIN (Federal Tax ID)</Label><Input value={form.ein} onChange={v => set('ein', v)} placeholder="XX-XXXXXXX" /></div>
              <div><Label>Industry</Label>
                <Select value={form.industry} onChange={v => set('industry', v)}>
                  <option value="">Select…</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </Select>
              </div>
              <div><Label>Time in Business</Label>
                <Select value={form.time_in_business} onChange={v => set('time_in_business', v)}>
                  <option value="">Select…</option>
                  <option>Less than 6 months</option>
                  <option>6–12 months</option>
                  <option>1–2 years</option>
                  <option>2–5 years</option>
                  <option>5–10 years</option>
                  <option>10+ years</option>
                </Select>
              </div>
              <div><Label>Number of Employees</Label>
                <Select value={form.num_employees} onChange={v => set('num_employees', v)}>
                  <option value="">Select…</option>
                  <option>Just me</option>
                  <option>2–5</option>
                  <option>6–10</option>
                  <option>11–25</option>
                  <option>26–50</option>
                  <option>50+</option>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Is business address the same as home address?</Label>
                <div className="flex gap-4 mt-1">
                  {['yes','no'].map(v => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#374151' }}>
                      <input type="radio" name="biz_addr_same" value={v} checked={form.business_address_same === v} onChange={() => set('business_address_same', v)} className="accent-indigo-600" />
                      {v === 'yes' ? 'Yes' : 'No — different address'}
                    </label>
                  ))}
                </div>
              </div>
              {form.business_address_same === 'no' && (
                <div className="col-span-2"><Label>Business Address</Label><Input value={form.business_address} onChange={v => set('business_address', v)} placeholder="456 Commerce Blvd, Miami FL 33101" /></div>
              )}
            </div>
          </div>

          {/* SECTION 3 — Financial Info */}
          <div className="bg-white rounded-2xl p-7" style={{ boxShadow: '0 1px 4px rgba(16,24,40,0.06)', border: '1px solid #F3F4F6' }}>
            <SectionHeader title="Financial Information" subtitle="Used to match you with the right funding products" />
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Gross Monthly Revenue</Label><Input value={form.monthly_revenue} onChange={v => set('monthly_revenue', v)} placeholder="$10,000" /></div>
              <div><Label>Gross Annual Revenue</Label><Input value={form.annual_revenue} onChange={v => set('annual_revenue', v)} placeholder="$120,000" /></div>
              <div><Label required>Funding Amount Requested</Label><Input required value={form.funding_goal} onChange={v => set('funding_goal', v)} placeholder="$50,000" /></div>
              <div><Label>Type of Funding Needed</Label>
                <Select value={form.funding_type} onChange={v => set('funding_type', v)}>
                  <option value="">Select…</option>
                  {FUNDING_TYPES.map(t => <option key={t}>{t}</option>)}
                </Select>
              </div>
              <div className="col-span-2"><Label>What will you use the funding for?</Label>
                <textarea rows={3} value={form.funding_purpose} onChange={e => set('funding_purpose', e.target.value)}
                  placeholder="e.g. Expand inventory, hire staff, purchase equipment, pay off debt…"
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }}
                  onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div><Label>Primary Business Bank</Label><Input value={form.primary_bank} onChange={v => set('primary_bank', v)} placeholder="Chase, Bank of America, etc." /></div>
              <div><Label>Account Type</Label>
                <Select value={form.bank_account_type} onChange={v => set('bank_account_type', v)}>
                  <option value="">Select…</option>
                  <option>Business Checking</option>
                  <option>Business Savings</option>
                  <option>Personal Checking (no business account yet)</option>
                </Select>
              </div>
            </div>
          </div>

          {/* SECTION 4 — Credit Profile */}
          <div className="bg-white rounded-2xl p-7" style={{ boxShadow: '0 1px 4px rgba(16,24,40,0.06)', border: '1px solid #F3F4F6' }}>
            <SectionHeader title="Credit Profile" subtitle="We use this to determine the best products for your profile" />
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Estimated Personal Credit Score</Label>
                <Select value={form.estimated_credit_score} onChange={v => set('estimated_credit_score', v)}>
                  <option value="">Select range…</option>
                  {CREDIT_RANGES.map(r => <option key={r}>{r}</option>)}
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Do you have any negative items on your credit report? (late payments, collections, charge-offs)</Label>
                <div className="flex gap-4 mt-1">
                  {['no','yes'].map(v => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#374151' }}>
                      <input type="radio" name="negative_items" value={v} checked={form.any_negative_items === v} onChange={() => set('any_negative_items', v)} className="accent-indigo-600" />
                      {v === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </div>
              {form.any_negative_items === 'yes' && (
                <div className="col-span-2"><Label>Please describe the negative items</Label>
                  <textarea rows={2} value={form.negative_details} onChange={e => set('negative_details', e.target.value)}
                    placeholder="e.g. 1 late payment from 2022, $800 medical collection"
                    className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }}
                    onFocus={e => { e.target.style.borderColor = '#4F46E5' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                  />
                </div>
              )}
              <div className="col-span-2">
                <Label>Do you have any existing business credit cards or lines of credit?</Label>
                <div className="flex gap-4 mt-1">
                  {['no','yes'].map(v => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#374151' }}>
                      <input type="radio" name="existing_biz_credit" value={v} checked={form.existing_business_credit === v} onChange={() => set('existing_business_credit', v)} className="accent-indigo-600" />
                      {v === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <Label>Have you ever filed for bankruptcy?</Label>
                <div className="flex gap-4 mt-1">
                  {['no','yes'].map(v => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#374151' }}>
                      <input type="radio" name="bankruptcy" value={v} checked={form.bankruptcy_history === v} onChange={() => set('bankruptcy_history', v)} className="accent-indigo-600" />
                      {v === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 — Referral */}
          <div className="bg-white rounded-2xl p-7" style={{ boxShadow: '0 1px 4px rgba(16,24,40,0.06)', border: '1px solid #F3F4F6' }}>
            <SectionHeader title="How did you hear about us?" />
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Referral Source</Label>
                <Select value={form.referral_source} onChange={v => set('referral_source', v)}>
                  <option value="">Select…</option>
                  <option>Referral Partner</option>
                  <option>Social Media (Instagram)</option>
                  <option>Social Media (Facebook)</option>
                  <option>Social Media (TikTok)</option>
                  <option>Google Search</option>
                  <option>Friend / Family</option>
                  <option>YouTube</option>
                  <option>Other</option>
                </Select>
              </div>
              <div><Label>Referred by (name)</Label><Input value={form.referral_name} onChange={v => set('referral_name', v)} placeholder="Partner or person's name" /></div>
              {partners.length > 0 && (
                <div className="col-span-2">
                  <Label>Referred by (Partner)</Label>
                  <Select value={form.referral_partner_id} onChange={v => set('referral_partner_id', v)}>
                    <option value="">Select a partner…</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.company ? ` — ${p.company}` : ''}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Consent */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 4px rgba(16,24,40,0.06)', border: '1px solid #F3F4F6' }}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)}
                className="mt-0.5 accent-indigo-600 w-4 h-4 flex-shrink-0" />
              <span className="text-sm" style={{ color: '#374151' }}>
                I authorize Vantage OS to pull a soft inquiry on my personal and/or business credit report for pre-qualification purposes. I confirm the information provided is accurate and I agree to be contacted regarding funding options. I understand this is not a guarantee of funding.
              </span>
            </label>
          </div>

          {status === 'error' && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={status === 'loading'}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: status === 'loading' ? '#818CF8' : '#4F46E5', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}>
            {status === 'loading' ? 'Submitting your application…' : 'Submit Application →'}
          </button>

          <p className="text-xs text-center pb-4" style={{ color: '#9CA3AF' }}>
            Your information is protected and never shared without your permission. · Vantage OS
          </p>
        </form>
      </div>
    </div>
  )
}

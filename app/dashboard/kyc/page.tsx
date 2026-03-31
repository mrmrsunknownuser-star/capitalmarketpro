'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function KYCPage() {
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState('none')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    country: '',
    address: '',
    city: '',
    zipCode: '',
    docType: 'passport',
    frontFile: null as File | null,
    backFile: null as File | null,
    selfieFile: null as File | null,
  })

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('kyc_status').eq('id', user.id).single()
      if (data) setStatus(data.kyc_status)
      if (data?.kyc_status === 'pending' || data?.kyc_status === 'approved') setSubmitted(true)
    }
    fetch()
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('users').update({ kyc_status: 'pending' }).eq('id', user.id)
    await supabase.from('kyc_documents').insert({
      user_id: user.id,
      doc_type: form.docType,
      status: 'pending',
    })
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: '📋 KYC Submitted Successfully',
      message: 'Your identity verification documents have been submitted. Our team will review them within 24-48 hours.',
      type: 'info',
    })

    setStatus('pending')
    setSubmitted(true)
    setLoading(false)
  }

  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Nigeria', 'South Africa', 'UAE', 'Singapore', 'Other']

  const statusConfig: Record<string, { color: string, bg: string, icon: string, title: string, desc: string }> = {
    none: { color: '#F7A600', bg: 'rgba(247,166,0,0.08)', icon: '🪪', title: 'Verify Your Identity', desc: 'Complete KYC to unlock full platform features including withdrawals.' },
    pending: { color: '#F7A600', bg: 'rgba(247,166,0,0.08)', icon: '⏳', title: 'Verification Pending', desc: 'Your documents are under review. This usually takes 24-48 hours.' },
    approved: { color: '#3fb950', bg: 'rgba(63,185,80,0.08)', icon: '✅', title: 'Identity Verified', desc: 'Your account is fully verified. All platform features are unlocked.' },
    rejected: { color: '#f85149', bg: 'rgba(248,81,73,0.08)', icon: '❌', title: 'Verification Rejected', desc: 'Your documents were rejected. Please resubmit with clearer images.' },
  }

  const config = statusConfig[status] || statusConfig.none

  if (submitted && status === 'pending') {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: config.bg, border: `1px solid ${config.color}33`, borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{config.icon}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{config.title}</div>
          <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 24, lineHeight: 1.7 }}>{config.desc}</div>
          <div style={{ background: '#0d1117', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            {[
              { label: 'Submission Date', value: new Date().toLocaleDateString() },
              { label: 'Document Type', value: form.docType.replace('_', ' ').toUpperCase() },
              { label: 'Review Time', value: '24-48 hours' },
              { label: 'Status', value: '⏳ Under Review' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22' }}>
                <span style={{ fontSize: 12, color: '#484f58' }}>{item.label}</span>
                <span style={{ fontSize: 12, color: '#e6edf3' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#484f58' }}>
            You will receive a notification once your verification is complete.
          </div>
        </div>
      </div>
    )
  }

  if (status === 'approved') {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3fb950', marginBottom: 8 }}>Identity Verified</div>
          <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 24 }}>Your account is fully verified. All features including withdrawals are unlocked.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {['✅ Deposits', '✅ Withdrawals', '✅ Trading', '✅ Signals', '✅ Affiliate', '✅ Full Access'].map(f => (
              <div key={f} style={{ background: '#0d1117', borderRadius: 8, padding: 12, fontSize: 12, color: '#3fb950' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Identity Verification</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Complete KYC to unlock all platform features</div>
      </div>

      {/* Why KYC banner */}
      <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 24, flexShrink: 0 }}>🔒</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#C9A84C', marginBottom: 4 }}>Why do we need this?</div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>
            As a regulated financial platform, we are required by law to verify the identity of all users. This protects you and ensures compliance with international financial regulations including AML and KYC standards.
          </div>
        </div>
      </div>

      {/* Steps progress */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {[{ n: 1, label: 'Personal Info' }, { n: 2, label: 'Address' }, { n: 3, label: 'Documents' }].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: step > s.n ? '#C9A84C' : step === s.n ? 'rgba(201,168,76,0.15)' : '#161b22', border: `2px solid ${step >= s.n ? '#C9A84C' : '#21262d'}`, color: step > s.n ? '#060a0f' : step === s.n ? '#C9A84C' : '#484f58' }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontSize: 11, color: step === s.n ? '#C9A84C' : '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? '#C9A84C' : '#21262d', margin: '0 12px' }} />}
          </div>
        ))}
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24 }}>

        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 20 }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>First Name</label>
                <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="John" style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Name</label>
                <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Country of Residence</label>
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                <option value="">Select country...</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={() => { if (form.firstName && form.lastName && form.dob && form.country) setStep(2) }} style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Continue →
            </button>
          </>
        )}

        {/* Step 2 — Address */}
        {step === 2 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 20 }}>Residential Address</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Street Address</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>City</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="New York" style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ZIP / Postal Code</label>
                <input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} placeholder="10001" style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ padding: '12px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 10, color: '#8b949e', fontSize: 12, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => { if (form.address && form.city) setStep(3) }} style={{ padding: '12px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Continue →</button>
            </div>
          </>
        )}

        {/* Step 3 — Documents */}
        {step === 3 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 20 }}>Identity Documents</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Document Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[{ value: 'passport', label: '🛂 Passport' }, { value: 'drivers_license', label: '🪪 Driver\'s License' }, { value: 'national_id', label: '🪪 National ID' }].map(d => (
                  <button key={d.value} onClick={() => setForm({ ...form, docType: d.value })}
                    style={{ padding: '10px 8px', borderRadius: 8, border: `1px solid ${form.docType === d.value ? '#C9A84C' : '#21262d'}`, background: form.docType === d.value ? 'rgba(201,168,76,0.1)' : 'transparent', color: form.docType === d.value ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer' }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: 'Front of Document', key: 'frontFile', desc: 'Clear photo of the front side' },
              { label: 'Back of Document', key: 'backFile', desc: 'Clear photo of the back side' },
              { label: 'Selfie with Document', key: 'selfieFile', desc: 'Hold document next to your face' },
            ].map(item => (
              <div key={item.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</label>
                <div style={{ background: '#161b22', border: `2px dashed ${(form as any)[item.key] ? '#C9A84C' : '#30363d'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                  <input type="file" accept="image/*" onChange={e => setForm({ ...form, [item.key]: e.target.files?.[0] || null })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  {(form as any)[item.key] ? (
                    <div style={{ fontSize: 13, color: '#3fb950' }}>✅ {((form as any)[item.key] as File).name}</div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>📎</div>
                      <div style={{ fontSize: 12, color: '#8b949e' }}>{item.desc}</div>
                      <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>Click to upload or drag & drop</div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.15)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7 }}>
                🔒 Your documents are encrypted and stored securely. They are only used for identity verification purposes and will never be shared with third parties.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ padding: '12px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 10, color: '#8b949e', fontSize: 12, cursor: 'pointer' }}>← Back</button>
              <button onClick={handleSubmit} disabled={loading} style={{ padding: '12px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Submitting...' : '✓ Submit for Review'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* What you unlock */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20, marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 12 }}>🔓 What you unlock after verification</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { icon: '💸', label: 'Withdrawals', desc: 'Withdraw funds to your wallet' },
            { icon: '📈', label: 'Higher Limits', desc: 'Increased trading limits' },
            { icon: '⚡', label: 'All Signals', desc: 'Access premium signals' },
            { icon: '🔗', label: 'Affiliate Pro', desc: 'Higher commission rates' },
            { icon: '🏆', label: 'Priority Support', desc: '24/7 dedicated support' },
            { icon: '💰', label: 'Full Access', desc: 'All platform features' },
          ].map(item => (
            <div key={item.label} style={{ background: '#161b22', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
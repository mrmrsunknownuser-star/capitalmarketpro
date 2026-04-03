'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type KYCStatus = 'none' | 'pending' | 'approved' | 'rejected'

export default function KYCPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [status, setStatus] = useState<KYCStatus>('none')
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  // Form fields
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [country, setCountry] = useState('')
  const [address, setAddress] = useState('')
  const [idType, setIdType] = useState('passport')
  const [idNumber, setIdNumber] = useState('')
  const [idFront, setIdFront] = useState<string | null>(null)
  const [idBack, setIdBack] = useState<string | null>(null)
  const [selfie, setSelfie] = useState<string | null>(null)
  const [idFrontName, setIdFrontName] = useState('')
  const [idBackName, setIdBackName] = useState('')
  const [selfieName, setSelfieName] = useState('')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('kyc_status, full_name, country, kyc_data')
        .eq('id', user.id)
        .single()

      setStatus((profile?.kyc_status as KYCStatus) || 'none')
      setFullName(profile?.full_name || '')
      setCountry(profile?.country || '')
      setLoading(false)

      // Realtime KYC status updates
      supabase
        .channel(`kyc-status-${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        }, payload => {
          const u = payload.new as any
          if (u.kyc_status) setStatus(u.kyc_status)
        })
        .subscribe()
    }
    init()
  }, [])

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
    nameSetter: (v: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMessage('⚠ File must be under 5MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setter(reader.result as string)
      nameSetter(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!idFront || !selfie || !fullName || !dob || !country || !address || !idNumber) {
      setMessage('⚠ Please complete all fields and upload required documents')
      return
    }
    setSubmitting(true)
    const supabase = createClient()

    await supabase.from('users').update({
      kyc_status: 'pending',
      full_name: fullName,
      country,
      kyc_data: {
        dob, address, idType, idNumber,
        idFront: idFront?.slice(0, 50) + '...',
        selfie: selfie?.slice(0, 50) + '...',
        submittedAt: new Date().toISOString(),
      },
    }).eq('id', userId)

    // Notify admin
    const { data: admin } = await supabase.from('users').select('id').eq('role', 'admin').single()
    if (admin?.id) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        title: '🪪 New KYC Submission',
        message: `${fullName} submitted KYC verification. ID Type: ${idType.toUpperCase()}. Requires review.`,
        type: 'info',
        is_read: false,
      })
    }

    await supabase.from('notifications').insert({
      user_id: userId,
      title: '🪪 KYC Submitted Successfully',
      message: 'Your identity verification documents have been received. Our team will review within 24-48 hours.',
      type: 'info',
      is_read: false,
    })

    setStatus('pending')
    setSubmitting(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#e6edf3',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
  }

  const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'UAE', 'Saudi Arabia', 'Nigeria', 'Singapore', 'Japan', 'India', 'Brazil', 'South Africa', 'Ghana', 'Kenya', 'Malaysia', 'Indonesia', 'Pakistan', 'Egypt', 'Other']

  if (loading) {
    return (
      <div style={{ padding: '24px 16px', fontFamily: 'monospace' }}>
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 20, padding: 40, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#161b22', margin: '0 auto 16px', animation: 'pulse 1.5s ease infinite' }} />
          <div style={{ height: 16, background: '#161b22', borderRadius: 8, width: '50%', margin: '0 auto 10px' }} />
          <div style={{ height: 12, background: '#161b22', borderRadius: 6, width: '35%', margin: '0 auto' }} />
          <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
        </div>
      </div>
    )
  }

  // ── APPROVED ──
  if (status === 'approved') {
    return (
      <div style={{ padding: '24px 16px 80px', fontFamily: 'monospace', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ background: 'rgba(63,185,80,0.06)', border: '2px solid rgba(63,185,80,0.3)', borderRadius: 20, padding: 36, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(63,185,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 20px' }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#3fb950', marginBottom: 10 }}>Identity Verified!</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 28 }}>
            Your identity has been fully verified. You now have access to all platform features including withdrawals.
          </div>
          <div style={{ background: '#0d1117', borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 14 }}>✅ Unlocked Features:</div>
            {[
              '💸 Withdrawals enabled',
              '💳 Pro Cards available',
              '📈 All investment plans',
              '🔗 Full affiliate program',
              '👑 VIP support access',
              '🌍 Global transfers',
            ].map(f => (
              <div key={f} style={{ fontSize: 13, color: '#3fb950', marginBottom: 8, display: 'flex', gap: 8 }}>
                {f}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="/dashboard/withdraw" style={{ flex: 1, textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                Withdraw Funds →
              </button>
            </a>
            <a href="/dashboard" style={{ flex: 1, textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '13px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
                Dashboard
              </button>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── PENDING ──
  if (status === 'pending') {
    return (
      <div style={{ padding: '24px 16px 80px', fontFamily: 'monospace', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ background: 'rgba(247,166,0,0.06)', border: '2px solid rgba(247,166,0,0.3)', borderRadius: 20, padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F7A600', marginBottom: 10 }}>Under Review</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 28 }}>
            Your documents are being reviewed by our compliance team. This typically takes <strong style={{ color: '#e6edf3' }}>24-48 hours</strong>.
          </div>
          <div style={{ background: '#0d1117', borderRadius: 14, padding: 20, marginBottom: 24 }}>
            {[
              { icon: '✅', label: 'Documents Submitted', done: true },
              { icon: '🔍', label: 'Under Compliance Review', done: false, active: true },
              { icon: '📧', label: 'Email Notification Sent', done: false },
              { icon: '🟢', label: 'Account Fully Verified', done: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid #161b22' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.done ? 'rgba(63,185,80,0.15)' : s.active ? 'rgba(247,166,0,0.15)' : '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 13, color: s.done ? '#3fb950' : s.active ? '#F7A600' : '#484f58', fontWeight: s.active ? 700 : 400 }}>
                  {s.label}
                  {s.active && <span style={{ fontSize: 11, marginLeft: 8, animation: 'pulse 1.5s ease infinite' }}>●</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#484f58', lineHeight: 1.8 }}>
            You'll receive a notification and email once your verification is complete. Contact support if you have questions.
          </div>
        </div>
      </div>
    )
  }

  // ── REJECTED ──
  if (status === 'rejected') {
    return (
      <div style={{ padding: '24px 16px 80px', fontFamily: 'monospace', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ background: 'rgba(248,81,73,0.06)', border: '2px solid rgba(248,81,73,0.3)', borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>❌</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f85149', marginBottom: 10 }}>Verification Failed</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 16 }}>
            Your documents could not be verified. Please resubmit with clearer, valid documents.
          </div>
          <div style={{ background: '#0d1117', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>
              <strong style={{ color: '#f85149' }}>Common reasons:</strong><br />
              • Document image was blurry or too dark<br />
              • Expired ID document<br />
              • Name didn't match account details<br />
              • Selfie was unclear or didn't match ID
            </div>
          </div>
          <button onClick={() => setStatus('none')}
            style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            Resubmit Documents →
          </button>
        </div>
      </div>
    )
  }

  // ── SUBMISSION FORM ──
  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace', maxWidth: 560, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Identity Verification</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Complete KYC to unlock withdrawals and full platform access</div>
      </div>

      {/* Why KYC */}
      <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>Why is KYC required?</div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>
            Identity verification protects you and complies with international financial regulations. It enables withdrawals, higher limits, and full platform access.
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        {[{ n: 1, l: 'Personal Info' }, { n: 2, l: 'ID Document' }, { n: 3, l: 'Selfie' }].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: step > s.n ? '#C9A84C' : step === s.n ? 'rgba(201,168,76,0.2)' : '#161b22', border: `2px solid ${step >= s.n ? '#C9A84C' : '#21262d'}`, color: step > s.n ? '#060a0f' : step === s.n ? '#C9A84C' : '#484f58' }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontSize: 10, color: step === s.n ? '#C9A84C' : '#484f58', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s.l}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? '#C9A84C' : '#21262d', margin: '0 6px' }} />}
          </div>
        ))}
      </div>

      {message && (
        <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: '#f85149', display: 'flex', justifyContent: 'space-between' }}>
          <span>{message}</span>
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* STEP 1 — Personal Info */}
      {step === 1 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Step 1 — Personal Information</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 22 }}>Enter your personal details exactly as they appear on your ID</div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Legal Name *</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="As shown on your ID document" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date of Birth *</label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Country of Residence *</label>
            <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'}>
              <option value="">Select your country...</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Residential Address *</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address including city, state/province, postal code" rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          </div>

          <button
            onClick={() => {
              if (!fullName || !dob || !country || !address) { setMessage('⚠ Please fill in all fields'); return }
              setMessage('')
              setStep(2)
            }}
            style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            Continue →
          </button>
        </div>
      )}

      {/* STEP 2 — ID Document */}
      {step === 2 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Step 2 — Identity Document</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 22 }}>Upload a clear photo of your government-issued ID</div>

          {/* ID Type selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Document Type *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { id: 'passport', label: '🛂 Passport', desc: 'Recommended' },
                { id: 'drivers_license', label: '🪪 Driver\'s License', desc: 'Front & Back' },
                { id: 'national_id', label: '🆔 National ID', desc: 'Front & Back' },
              ].map(t => (
                <button key={t.id} onClick={() => setIdType(t.id)}
                  style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${idType === t.id ? '#C9A84C' : '#21262d'}`, background: idType === t.id ? 'rgba(201,168,76,0.1)' : '#161b22', color: idType === t.id ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{t.label.split(' ')[0]}</div>
                  <div style={{ fontWeight: 700 }}>{t.label.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize: 9, color: idType === t.id ? '#C9A84C' : '#484f58', marginTop: 2 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ID Number */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Document Number *</label>
            <input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="Enter your ID number..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          </div>

          {/* Front upload */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {idType === 'passport' ? 'Photo Page *' : 'Front Side *'}
            </label>
            <label style={{ display: 'block', background: idFront ? 'rgba(63,185,80,0.06)' : '#161b22', border: `2px dashed ${idFront ? '#3fb950' : '#30363d'}`, borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
              <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload(e, setIdFront, setIdFrontName)} style={{ display: 'none' }} />
              {idFront ? (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 12, color: '#3fb950', fontWeight: 700 }}>{idFrontName}</div>
                  <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>Tap to change</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 600, marginBottom: 4 }}>Upload {idType === 'passport' ? 'passport page' : 'front of ID'}</div>
                  <div style={{ fontSize: 11, color: '#484f58' }}>JPG, PNG or PDF · Max 5MB</div>
                </div>
              )}
            </label>
          </div>

          {/* Back upload (not for passport) */}
          {idType !== 'passport' && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Back Side</label>
              <label style={{ display: 'block', background: idBack ? 'rgba(63,185,80,0.06)' : '#161b22', border: `2px dashed ${idBack ? '#3fb950' : '#30363d'}`, borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setIdBack, setIdBackName)} style={{ display: 'none' }} />
                {idBack ? (
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                    <div style={{ fontSize: 12, color: '#3fb950', fontWeight: 700 }}>{idBackName}</div>
                    <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>Tap to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                    <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 600, marginBottom: 4 }}>Upload back of ID</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>JPG or PNG · Max 5MB</div>
                  </div>
                )}
              </label>
            </div>
          )}

          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.8 }}>
              📌 Ensure document is <strong style={{ color: '#e6edf3' }}>clear, fully visible</strong> and <strong style={{ color: '#e6edf3' }}>not expired</strong>. All corners must be visible. No reflections or shadows.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
            <button onClick={() => {
              if (!idFront || !idNumber) { setMessage('⚠ Please upload your ID and enter document number'); return }
              setMessage('')
              setStep(3)
            }} style={{ padding: '13px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Selfie */}
      {step === 3 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Step 3 — Selfie Verification</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 22 }}>Take a clear selfie holding your ID document</div>

          {/* Selfie tips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
            {[
              { icon: '✅', tip: 'Face clearly visible', ok: true },
              { icon: '✅', tip: 'Holding your ID document', ok: true },
              { icon: '❌', tip: 'No sunglasses or hats', ok: false },
              { icon: '❌', tip: 'No filters or editing', ok: false },
            ].map(t => (
              <div key={t.tip} style={{ background: t.ok ? 'rgba(63,185,80,0.06)' : 'rgba(248,81,73,0.06)', border: `1px solid ${t.ok ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)'}`, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                <span style={{ fontSize: 11, color: '#8b949e' }}>{t.tip}</span>
              </div>
            ))}
          </div>

          {/* Selfie upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', background: selfie ? 'rgba(63,185,80,0.06)' : '#161b22', border: `2px dashed ${selfie ? '#3fb950' : '#30363d'}`, borderRadius: 16, padding: '32px 20px', textAlign: 'center', cursor: 'pointer' }}>
              <input type="file" accept="image/*" capture="user" onChange={e => handleFileUpload(e, setSelfie, setSelfieName)} style={{ display: 'none' }} />
              {selfie ? (
                <div>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
                  <div style={{ fontSize: 13, color: '#3fb950', fontWeight: 700, marginBottom: 4 }}>{selfieName}</div>
                  <div style={{ fontSize: 11, color: '#484f58' }}>Tap to retake selfie</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🤳</div>
                  <div style={{ fontSize: 14, color: '#e6edf3', fontWeight: 700, marginBottom: 6 }}>Take Selfie with ID</div>
                  <div style={{ fontSize: 12, color: '#484f58', lineHeight: 1.7 }}>
                    Hold your ID document next to your face<br />and take a clear photo
                  </div>
                  <div style={{ fontSize: 11, color: '#484f58', marginTop: 8 }}>JPG or PNG · Max 5MB</div>
                </div>
              )}
            </label>
          </div>

          {/* Summary */}
          <div style={{ background: '#161b22', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>📋 Submission Summary:</div>
            {[
              { l: 'Full Name', v: fullName },
              { l: 'Date of Birth', v: dob },
              { l: 'Country', v: country },
              { l: 'Document Type', v: idType.replace('_', ' ').toUpperCase() },
              { l: 'Document Number', v: idNumber },
              { l: 'ID Front', v: idFront ? '✅ Uploaded' : '❌ Missing' },
              { l: 'Selfie', v: selfie ? '✅ Ready' : '❌ Missing' },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #21262d', fontSize: 12 }}>
                <span style={{ color: '#484f58' }}>{item.l}</span>
                <span style={{ color: '#e6edf3', fontWeight: 500 }}>{item.v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#3fb950', lineHeight: 1.8 }}>
              🔒 Your documents are encrypted and stored securely. We comply with GDPR and international data protection laws.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
            <button onClick={handleSubmit} disabled={submitting || !selfie}
              style={{ padding: '13px 0', background: !selfie || submitting ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: !selfie || submitting ? '#484f58' : '#060a0f', fontSize: 13, fontWeight: 800, cursor: !selfie || submitting ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
              {submitting ? '⟳ Submitting...' : '✅ Submit Verification'}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved · Your data is encrypted and secure</div>
      </div>
    </div>
  )
}
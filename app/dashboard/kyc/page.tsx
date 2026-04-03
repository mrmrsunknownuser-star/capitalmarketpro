'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  { id: 1, title: 'Personal Information', icon: '👤', desc: 'Basic identity details' },
  { id: 2, title: 'Government ID', icon: '🪪', desc: 'Upload valid ID document' },
  { id: 3, title: 'Selfie Verification', icon: '🤳', desc: 'Take a live selfie' },
]

export default function KYCPage() {
  const [step, setStep] = useState(1)
  const [kycStatus, setKycStatus] = useState<string>('none')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const channelRef = useRef<any>(null)

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [country, setCountry] = useState('')
  const [idType, setIdType] = useState('passport')
  const [idFront, setIdFront] = useState<string | null>(null)
  const [idBack, setIdBack] = useState<string | null>(null)
  const [selfie, setSelfie] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('kyc_status, full_name')
        .eq('id', user.id)
        .single()

      setKycStatus(profile?.kyc_status || 'none')

      // Pre-fill name
      if (profile?.full_name) {
        const parts = profile.full_name.split(' ')
        setFirstName(parts[0] || '')
        setLastName(parts.slice(1).join(' ') || '')
      }

      setLoading(false)

      // ── REALTIME: listen for KYC status changes ──
      channelRef.current = supabase
        .channel(`kyc-watch-${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        }, (payload) => {
          const updated = payload.new as any
          if (updated.kyc_status) {
            setKycStatus(updated.kyc_status)
          }
        })
        .subscribe()
    }

    init()

    return () => {
      const supabase = createClient()
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.onerror = rej
      r.readAsDataURL(file)
    })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return }
    const base64 = await toBase64(file)
    setter(base64)
  }

  const handleSubmit = async () => {
    if (!userId || !firstName || !lastName || !dob || !country) return
    if (!idFront || !selfie) return
    setSubmitting(true)

    const supabase = createClient()
    await supabase.from('users').update({
      kyc_status: 'pending',
      full_name: `${firstName} ${lastName}`,
      kyc_data: {
        firstName, lastName, dob, country, idType,
        idFront: idFront?.slice(0, 100) + '...',
        idBack: idBack?.slice(0, 100) + '...',
        selfie: selfie?.slice(0, 100) + '...',
        submittedAt: new Date().toISOString(),
      },
    }).eq('id', userId)

    await supabase.from('notifications').insert({
      user_id: userId,
      title: '🪪 KYC Submitted Successfully',
      message: 'Your identity documents have been received. Our team will review them within 24-48 hours.',
      type: 'info',
      is_read: false,
    })

    try {
      await supabase.from('audit_logs').insert({
        action: 'KYC_SUBMITTED',
        target_user_id: userId,
        details: { firstName, lastName, dob, country, idType },
      })
    } catch {}

    setKycStatus('pending')
    setSubmitting(false)
    setSubmitted(true)
  }

  if (loading) {
  return (
    <div style={{ padding: '24px 16px', fontFamily: 'monospace', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 20, padding: 40, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#161b22', margin: '0 auto 16px', animation: 'pulse 1.5s ease infinite' }} />
        <div style={{ height: 16, background: '#161b22', borderRadius: 8, width: '60%', margin: '0 auto 10px' }} />
        <div style={{ height: 12, background: '#161b22', borderRadius: 8, width: '40%', margin: '0 auto' }} />
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
      </div>
    </div>
  )
}

  // ── APPROVED ──
  if (kycStatus === 'approved') {
    return (
      <div style={{ padding: '24px 16px', fontFamily: 'monospace', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.25)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(63,185,80,0.15)', border: '2px solid rgba(63,185,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px' }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#3fb950', marginBottom: 8 }}>Identity Verified!</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 24 }}>
            Your identity has been successfully verified. All platform features including withdrawals are now fully unlocked.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { icon: '💸', label: 'Withdrawals', status: 'Unlocked' },
              { icon: '💹', label: 'All Plans', status: 'Available' },
              { icon: '💳', label: 'Pro Cards', status: 'Available' },
              { icon: '🔗', label: 'Affiliate', status: 'Active' },
            ].map(item => (
              <div key={item.label} style={{ background: '#0d1117', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: '#e6edf3', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: '#3fb950' }}>✓ {item.status}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#0d1117', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3fb950', flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: '#8b949e' }}>KYC Level 1 · Verified Account · Full Access</div>
          </div>
        </div>
      </div>
    )
  }

  // ── PENDING ──
  if (kycStatus === 'pending' || submitted) {
    return (
      <div style={{ padding: '24px 16px', fontFamily: 'monospace', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ background: 'rgba(247,166,0,0.06)', border: '1px solid rgba(247,166,0,0.25)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(247,166,0,0.15)', border: '2px solid rgba(247,166,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px' }}>⏳</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#F7A600', marginBottom: 8 }}>Under Review</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 24 }}>
            Your identity documents have been submitted and are being reviewed by our compliance team. This typically takes <strong style={{ color: '#e6edf3' }}>24-48 hours</strong>.
          </div>
          <div style={{ background: '#0d1117', borderRadius: 12, padding: 18, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>What happens next?</div>
            {[
              { s: '✅', t: 'Documents submitted', c: '#3fb950' },
              { s: '🔄', t: 'Compliance team review (24-48hrs)', c: '#F7A600' },
              { s: '⬜', t: 'Identity confirmed', c: '#484f58' },
              { s: '⬜', t: 'Full access unlocked', c: '#484f58' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{item.s}</span>
                <span style={{ fontSize: 12, color: item.c }}>{item.t}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7 }}>
              💬 Need help? Message <strong style={{ color: '#C9A84C' }}>Joshua Elder</strong> in Support for expedited review.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── REJECTED ──
  if (kycStatus === 'rejected') {
    return (
      <div style={{ padding: '24px 16px', fontFamily: 'monospace', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#f85149', marginBottom: 8 }}>Verification Rejected</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 16 }}>
            Your documents were rejected. Please resubmit with clearer, valid documents.
          </div>
          <button
            onClick={() => setKycStatus('none')}
            style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            Resubmit Documents →
          </button>
        </div>
      </div>
    )
  }

  // ── FORM ──
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

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace', maxWidth: 560, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Identity Verification</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Complete KYC to unlock full platform access</div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: '100%', height: 3, borderRadius: 2, background: step > s.id ? '#C9A84C' : step === s.id ? 'rgba(201,168,76,0.4)' : '#161b22' }} />
            <div style={{ fontSize: 10, color: step >= s.id ? '#C9A84C' : '#484f58', textAlign: 'center', fontWeight: step === s.id ? 700 : 400 }}>
              {s.icon} {s.title}
            </div>
          </div>
        ))}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>👤 Personal Information</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Enter your legal name as it appears on your government ID</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date of Birth</label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Country of Residence</label>
            <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'}>
              <option value="">Select country...</option>
              {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'Spain', 'Italy', 'Japan', 'South Korea', 'Singapore', 'UAE', 'Saudi Arabia', 'Nigeria', 'South Africa', 'Brazil', 'Mexico', 'India', 'China', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!firstName || !lastName || !dob || !country}
            style={{ width: '100%', padding: '14px 0', background: !firstName || !lastName || !dob || !country ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: !firstName || !lastName || !dob || !country ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: !firstName || !lastName || !dob || !country ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>🪪 Government ID</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Upload a clear photo of your valid government-issued ID</div>

          {/* ID Type */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ID Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[{ id: 'passport', label: '🛂 Passport' }, { id: 'drivers_license', label: "🪪 Driver's License" }, { id: 'national_id', label: '🎫 National ID' }].map(t => (
                <div key={t.id} onClick={() => setIdType(t.id)}
                  style={{ background: idType === t.id ? 'rgba(201,168,76,0.1)' : '#161b22', border: `1px solid ${idType === t.id ? '#C9A84C' : '#21262d'}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', fontSize: 11, color: idType === t.id ? '#C9A84C' : '#8b949e', fontWeight: idType === t.id ? 700 : 400 }}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* ID Front */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Front of ID *</label>
            <label htmlFor="id-front" style={{ display: 'block', cursor: 'pointer' }}>
              <div style={{ background: idFront ? 'rgba(63,185,80,0.06)' : '#161b22', border: `2px dashed ${idFront ? '#3fb950' : '#30363d'}`, borderRadius: 12, padding: '24px', textAlign: 'center' }}>
                {idFront ? (
                  <div>
                    <img src={idFront} style={{ maxHeight: 100, maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
                    <div style={{ fontSize: 11, color: '#3fb950', fontWeight: 700 }}>✓ Uploaded</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                    <div style={{ fontSize: 12, color: '#8b949e' }}>Tap to upload front of ID</div>
                    <div style={{ fontSize: 10, color: '#484f58', marginTop: 4 }}>JPG, PNG · Max 5MB</div>
                  </div>
                )}
              </div>
            </label>
            <input id="id-front" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, setIdFront)} />
          </div>

          {/* ID Back */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Back of ID (optional)</label>
            <label htmlFor="id-back" style={{ display: 'block', cursor: 'pointer' }}>
              <div style={{ background: idBack ? 'rgba(63,185,80,0.06)' : '#161b22', border: `2px dashed ${idBack ? '#3fb950' : '#30363d'}`, borderRadius: 12, padding: '20px', textAlign: 'center' }}>
                {idBack ? (
                  <div>
                    <img src={idBack} style={{ maxHeight: 80, maxWidth: '100%', borderRadius: 8, marginBottom: 6 }} />
                    <div style={{ fontSize: 11, color: '#3fb950', fontWeight: 700 }}>✓ Uploaded</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>📷</div>
                    <div style={{ fontSize: 12, color: '#8b949e' }}>Tap to upload back of ID</div>
                  </div>
                )}
              </div>
            </label>
            <input id="id-back" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, setIdBack)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
            <button onClick={() => setStep(3)} disabled={!idFront}
              style={{ padding: '13px 0', background: !idFront ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: !idFront ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: !idFront ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>🤳 Selfie Verification</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Upload a clear selfie holding your ID document</div>

          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 14, marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C', marginBottom: 8 }}>📋 Selfie Requirements:</div>
            {['Hold your ID clearly visible next to your face', 'Ensure good lighting — no shadows or glare', 'Look directly at the camera', 'No sunglasses, hats, or face coverings'].map((req, i) => (
              <div key={i} style={{ fontSize: 11, color: '#8b949e', marginBottom: 5, display: 'flex', gap: 6 }}>
                <span style={{ color: '#C9A84C' }}>✓</span>{req}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="selfie" style={{ display: 'block', cursor: 'pointer' }}>
              <div style={{ background: selfie ? 'rgba(63,185,80,0.06)' : '#161b22', border: `2px dashed ${selfie ? '#3fb950' : '#30363d'}`, borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
                {selfie ? (
                  <div>
                    <img src={selfie} style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 10, marginBottom: 10 }} />
                    <div style={{ fontSize: 12, color: '#3fb950', fontWeight: 700 }}>✓ Selfie uploaded!</div>
                    <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>Tap to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 10 }}>🤳</div>
                    <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 600, marginBottom: 4 }}>Upload your selfie</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>Tap to take photo or upload</div>
                    <div style={{ fontSize: 10, color: '#484f58', marginTop: 4 }}>JPG, PNG · Max 5MB</div>
                  </div>
                )}
              </div>
            </label>
            <input id="selfie" type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={e => handleFileUpload(e, setSelfie)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
            <button onClick={handleSubmit} disabled={!selfie || submitting}
              style={{ padding: '13px 0', background: !selfie || submitting ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: !selfie || submitting ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: !selfie || submitting ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
              {submitting ? '⟳ Submitting...' : '✅ Submit Verification'}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58', lineHeight: 1.7 }}>
          🔒 Your documents are encrypted and stored securely<br />
          © 2025 CapitalMarket Pro · All Rights Reserved
        </div>
      </div>
    </div>
  )
}
// @ts-nocheck
'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function RegisterForm() {
  var router = useRouter()
  var searchParams = useSearchParams()
  var [fullName, setFullName] = useState('')
  var [email, setEmail] = useState('')
  var [password, setPassword] = useState('')
  var [confirmPassword, setConfirmPassword] = useState('')
  var [referralCode, setReferralCode] = useState('')
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState('')
  var [agreed, setAgreed] = useState(false)
  var [showPass, setShowPass] = useState(false)

  useEffect(function() {
    var ref = searchParams.get('ref')
    if (ref) setReferralCode(ref)
  }, [searchParams])

  var strengthScore = 0
  if (password.length >= 6) strengthScore++
  if (password.length >= 10) strengthScore++
  if (/[A-Z]/.test(password)) strengthScore++
  if (/[0-9]/.test(password)) strengthScore++
  if (/[^A-Za-z0-9]/.test(password)) strengthScore++
  var strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  var strengthColors = ['', '#f85149', '#F7A600', '#F7A600', '#3fb950', '#3fb950']
  var strengthLabel = strengthLabels[strengthScore]
  var strengthColor = strengthColors[strengthScore]

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (!fullName.trim()) { setError('Please enter your full name'); return }
    if (!email.trim()) { setError('Please enter your email'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (!agreed) { setError('Please agree to the terms and conditions'); return }

    setLoading(true)
    var supabase = createClient()

    var signUpResult = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          referred_by: referralCode.trim().toUpperCase() || null,
        },
      },
    })

    if (signUpResult.error) {
      setError(signUpResult.error.message)
      setLoading(false)
      return
    }

    if (signUpResult.data.user && referralCode.trim()) {
      await supabase
        .from('users')
        .update({ referred_by: referralCode.trim().toUpperCase() })
        .eq('id', signUpResult.data.user.id)
    }

    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          to: email.trim().toLowerCase(),
          data: { name: fullName.trim() },
        }),
      })
    } catch(err) {}

    try {
      var adminResult = await supabase.from('users').select('id').eq('role', 'admin').single()
      if (adminResult.data && adminResult.data.id) {
        await supabase.from('notifications').insert({
          recipient_role: 'admin',
          title: 'New User Registered',
          message: fullName.trim() + ' (' + email.trim() + ') just created an account.' + (referralCode ? ' Referred by: ' + referralCode : ''),
          type: 'info',
          is_read: false,
        })
      }
    } catch(err) {}

    setLoading(false)
    router.replace('/dashboard')
  }

  var inp = { width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '12px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }
  var lbl = { display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }
  function onF(e) { e.target.style.borderColor = '#C9A84C' }
  function onB(e) { e.target.style.borderColor = '#30363d' }

  return (
    <div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', fontFamily: 'monospace' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#060a0f', margin: '0 auto 14px', boxShadow: '0 0 30px rgba(201,168,76,0.35)' }}>C</div>
          </Link>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
            <span style={{ color: '#e6edf3' }}> Pro</span>
          </div>
          <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Create Your Account</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 11, color: '#8b949e' }}>Free to join</div>
          <div style={{ fontSize: 11, color: '#8b949e' }}>Instant access</div>
          <div style={{ fontSize: 11, color: '#8b949e' }}>Secure and private</div>
        </div>

        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 12, color: '#f85149', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              <button onClick={function() { setError('') }} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: 14 }}>X</button>
            </div>
          )}

          <form onSubmit={handleRegister}>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Full Name</label>
              <input value={fullName} onChange={function(e) { setFullName(e.target.value) }} placeholder="John Smith" required style={inp} onFocus={onF} onBlur={onB} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Email Address</label>
              <input type="email" value={email} onChange={function(e) { setEmail(e.target.value) }} placeholder="you@example.com" required style={inp} onFocus={onF} onBlur={onB} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={function(e) { setPassword(e.target.value) }}
                  placeholder="Min. 6 characters"
                  required
                  style={{ ...inp, padding: '12px 44px 12px 14px' }}
                  onFocus={onF}
                  onBlur={onB}
                />
                <button type="button" onClick={function() { setShowPass(!showPass) }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 16 }}>
                  {showPass ? 'H' : 'S'}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 3, background: '#161b22', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ width: (strengthScore / 5 * 100) + '%', height: '100%', background: strengthColor, borderRadius: 2, transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: strengthColor }}>{strengthLabel}</div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={function(e) { setConfirmPassword(e.target.value) }}
                placeholder="Repeat your password"
                required
                style={{ ...inp, borderColor: confirmPassword && confirmPassword !== password ? '#f85149' : confirmPassword && confirmPassword === password ? '#3fb950' : '#30363d' }}
                onFocus={onF}
                onBlur={function(e) { e.target.style.borderColor = confirmPassword && confirmPassword !== password ? '#f85149' : '#30363d' }}
              />
              {confirmPassword && confirmPassword !== password && <div style={{ fontSize: 11, color: '#f85149', marginTop: 4 }}>Passwords do not match</div>}
              {confirmPassword && confirmPassword === password && <div style={{ fontSize: 11, color: '#3fb950', marginTop: 4 }}>Passwords match</div>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Referral Code <span style={{ color: '#484f58', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
              <input
                value={referralCode}
                onChange={function(e) { setReferralCode(e.target.value.toUpperCase()) }}
                placeholder="e.g. CMP12345678"
                style={{ ...inp, background: referralCode ? 'rgba(63,185,80,0.05)' : '#161b22', borderColor: referralCode ? 'rgba(63,185,80,0.3)' : '#30363d', color: referralCode ? '#3fb950' : '#e6edf3' }}
                onFocus={onF}
                onBlur={function(e) { e.target.style.borderColor = referralCode ? 'rgba(63,185,80,0.3)' : '#30363d' }}
              />
              {referralCode && <div style={{ fontSize: 11, color: '#3fb950', marginTop: 4 }}>Referral code applied!</div>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div onClick={function() { setAgreed(!agreed) }} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: '2px solid ' + (agreed ? '#C9A84C' : '#30363d'), background: agreed ? '#C9A84C' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.2s' }}>
                  {agreed && <span style={{ fontSize: 11, color: '#060a0f', fontWeight: 800 }}>v</span>}
                </div>
                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>
                  I agree to the{' '}
                  <Link href="/terms" style={{ color: '#C9A84C', textDecoration: 'none' }} onClick={function(e) { e.stopPropagation() }}>Terms and Conditions</Link>
                  {' '}and{' '}
                  <Link href="/terms" style={{ color: '#C9A84C', textDecoration: 'none' }} onClick={function(e) { e.stopPropagation() }}>Privacy Policy</Link>
                  {' '}of CapitalMarket Pro
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px 0', background: loading ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: loading ? '#484f58' : '#060a0f', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'monospace', marginBottom: 16, boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.3)' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#21262d' }} />
            <span style={{ fontSize: 11, color: '#484f58' }}>Already have an account?</span>
            <div style={{ flex: 1, height: 1, background: '#21262d' }} />
          </div>

          <Link href="/login" style={{ textDecoration: 'none', display: 'block' }}>
            <button style={{ width: '100%', padding: '12px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}>
              Sign In Instead
            </button>
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 10, color: '#484f58' }}>256-bit SSL</div>
          <div style={{ fontSize: 10, color: '#484f58' }}>SOC2 Certified</div>
          <div style={{ fontSize: 10, color: '#484f58' }}>FCA Authorized</div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#C9A84C', fontFamily: 'monospace' }}>Loading...</div></div>}>
      <RegisterForm />
    </Suspense>
  )
}
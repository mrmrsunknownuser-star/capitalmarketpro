// @ts-nocheck
'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

var COUNTRIES = ['Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bolivia','Botswana','Brazil','Bulgaria','Cambodia','Cameroon','Canada','Chile','China','Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece','Guatemala','Guinea','Honduras','Hungary','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Latvia','Lebanon','Libya','Lithuania','Luxembourg','Malaysia','Mali','Malta','Mexico','Moldova','Mongolia','Morocco','Mozambique','Myanmar','Nepal','Netherlands','New Zealand','Nicaragua','Nigeria','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia','Sierra Leone','Singapore','Slovakia','Slovenia','Somalia','South Africa','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand','Togo','Trinidad and Tobago','Tunisia','Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States of America','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe']

function RegisterForm() {
  var router = useRouter()
  var searchParams = useSearchParams()
  var [step, setStep] = useState(1)
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState('')
  var [fullName, setFullName] = useState('')
  var [email, setEmail] = useState('')
  var [phone, setPhone] = useState('')
  var [username, setUsername] = useState('')
  var [country, setCountry] = useState('')
  var [referralCode, setReferralCode] = useState('')
  var [password, setPassword] = useState('')
  var [confirmPassword, setConfirmPassword] = useState('')
  var [agreed, setAgreed] = useState(false)
  var [showPass, setShowPass] = useState(false)

  useEffect(function() {
    var ref = searchParams.get('ref')
    if (ref) setReferralCode(ref.toUpperCase())
  }, [searchParams])

  var strengthScore = 0
  if (password.length >= 6) strengthScore++
  if (password.length >= 10) strengthScore++
  if (/[A-Z]/.test(password)) strengthScore++
  if (/[0-9]/.test(password)) strengthScore++
  if (/[^A-Za-z0-9]/.test(password)) strengthScore++
  var sLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  var sColors = ['', '#f85149', '#F7A600', '#F7A600', '#3fb950', '#3fb950']

  function validate1() {
    if (!username.trim() || username.length < 3) { setError('Username must be at least 3 characters'); return false }
    if (!fullName.trim()) { setError('Please enter your full name'); return false }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email'); return false }
    if (!phone.trim() || phone.length < 6) { setError('Please enter a valid phone number'); return false }
    return true
  }

  function validate2() {
    if (!country) { setError('Please select your country'); return false }
    return true
  }

  function validate3() {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return false }
    if (password !== confirmPassword) { setError('Passwords do not match'); return false }
    if (!agreed) { setError('Please agree to the terms and conditions'); return false }
    return true
  }

  function nextStep() {
    setError('')
    if (step === 1 && !validate1()) return
    if (step === 2 && !validate2()) return
    setStep(step + 1)
  }

  async function handleRegister() {
    setError('')
    if (!validate3()) return
    setLoading(true)
    var supabase = createClient()

    var result = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          phone: phone.trim(),
          country: country,
          referred_by: referralCode.trim().toUpperCase() || null,
        },
      },
    })

    if (result.error) { setError(result.error.message); setLoading(false); return }

    if (result.data.user && referralCode.trim()) {
      await supabase.from('users').update({ referred_by: referralCode.trim().toUpperCase() }).eq('id', result.data.user.id)
    }

    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'welcome', to: email.trim().toLowerCase(), data: { name: fullName.trim() } }),
      })
    } catch(e) {}

    try {
      await supabase.from('notifications').insert({
        recipient_role: 'admin',
        title: 'New User Registered',
        message: fullName.trim() + ' (@' + username.trim() + ') from ' + country + ' just created an account.' + (referralCode ? ' Ref: ' + referralCode : ''),
        type: 'info',
        is_read: false,
      })
    } catch(e) {}

    setLoading(false)
    router.replace('/dashboard')
  }

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'
  var inp = { width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '12px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }
  var lbl = { display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }
  function onF(e) { e.target.style.borderColor = '#C9A84C' }
  function onB(e) { e.target.style.borderColor = '#30363d' }

  return (
    <div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', fontFamily: 'monospace' }}>
      <style>{'* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #060a0f; } select option { background: #161b22; color: #e6edf3; } @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes spin { to { transform: rotate(360deg); } }'}</style>

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp .4s ease' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#060a0f', margin: '0 auto 12px', boxShadow: '0 0 30px rgba(201,168,76,0.35)' }}>C</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              <span style={{ color: G }}>CapitalMarket</span>
              <span style={{ color: '#e6edf3' }}> Pro</span>
            </div>
            <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>Start Your Professional Trading Journey</div>
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
          {[{ dot: '#3fb950', t: '1M+ Traders' }, { dot: G, t: 'SSL Secured' }, { dot: '#58a6ff', t: 'Regulated' }].map(function(b) {
            return (
              <div key={b.t} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.04)', border: '1px solid #21262d', borderRadius: 100, padding: '4px 12px', fontSize: 11, color: '#8b949e' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: b.dot, display: 'inline-block', animation: 'pulse 2s infinite' }} />
                {b.t}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          {[{ n: 1, l: 'Personal Info' }, { n: 2, l: 'Location' }, { n: 3, l: 'Security' }].map(function(s, i) {
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : undefined }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s.n ? GG : '#161b22', border: step >= s.n ? 'none' : '1.5px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: step >= s.n ? '#060a0f' : '#484f58', transition: 'all .3s' }}>
                    {step > s.n ? 'v' : s.n}
                  </div>
                  <div style={{ fontSize: 9, color: step >= s.n ? G : '#484f58', fontWeight: step >= s.n ? 700 : 400, whiteSpace: 'nowrap' }}>{s.l}</div>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.n ? GG : '#21262d', margin: '0 8px', marginBottom: 18, borderRadius: 1 }} />}
              </div>
            )
          })}
        </div>

        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, padding: 26, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 10, padding: '11px 14px', marginBottom: 18, fontSize: 12, color: '#f85149', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              <button onClick={function() { setError('') }} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}>X</button>
            </div>
          )}

          {step === 1 && (
            <div style={{ animation: 'fadeUp .3s ease' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Personal Information</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Create your trading profile</div>

              <div style={{ marginBottom: 13 }}>
                <label style={lbl}>Trading Username</label>
                <input style={inp} value={username} onChange={function(e) { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')) }} placeholder="e.g. trader_john" autoComplete="off" onFocus={onF} onBlur={onB} />
                {username.length > 0 && <div style={{ fontSize: 11, color: username.length >= 3 ? '#3fb950' : '#f85149', marginTop: 4 }}>{username.length >= 3 ? '@' + username + ' looks good' : 'Min. 3 characters'}</div>}
              </div>

              <div style={{ marginBottom: 13 }}>
                <label style={lbl}>Full Name</label>
                <input style={inp} value={fullName} onChange={function(e) { setFullName(e.target.value) }} placeholder="John Smith" onFocus={onF} onBlur={onB} />
              </div>

              <div style={{ marginBottom: 13 }}>
                <label style={lbl}>Email Address</label>
                <input style={inp} type="email" value={email} onChange={function(e) { setEmail(e.target.value) }} placeholder="you@example.com" onFocus={onF} onBlur={onB} />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={lbl}>Phone Number</label>
                <input style={inp} type="tel" value={phone} onChange={function(e) { setPhone(e.target.value) }} placeholder="+1 234 567 8900" onFocus={onF} onBlur={onB} />
              </div>

              <button onClick={nextStep} style={{ width: '100%', padding: '13px 0', background: GG, border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>Continue</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'fadeUp .3s ease' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Location</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Set your regional trading preferences</div>

              <div style={{ marginBottom: 13 }}>
                <label style={lbl}>Country</label>
                <select style={{ ...inp, appearance: 'none' }} value={country} onChange={function(e) { setCountry(e.target.value) }} onFocus={onF} onBlur={onB}>
                  <option value="">Select your country</option>
                  {COUNTRIES.map(function(c) { return <option key={c} value={c}>{c}</option> })}
                </select>
              </div>

              {country && <div style={{ background: 'rgba(63,185,80,.06)', border: '1px solid rgba(63,185,80,.18)', borderRadius: 10, padding: '11px 14px', marginBottom: 14, fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>Your location helps us provide region-specific features and optimal server connections.</div>}

              <div style={{ marginBottom: 22 }}>
                <label style={lbl}>Referral Code (optional)</label>
                <input style={{ ...inp, color: referralCode ? '#3fb950' : '#e6edf3', borderColor: referralCode ? 'rgba(63,185,80,0.4)' : '#30363d' }} value={referralCode} onChange={function(e) { setReferralCode(e.target.value.toUpperCase()) }} placeholder="e.g. CMP12345678" onFocus={onF} onBlur={function(e) { e.target.style.borderColor = referralCode ? 'rgba(63,185,80,0.4)' : '#30363d' }} />
                {referralCode && <div style={{ fontSize: 11, color: '#3fb950', marginTop: 4 }}>Referral code applied!</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={function() { setError(''); setStep(1) }} style={{ padding: '13px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}>Back</button>
                <button onClick={nextStep} style={{ padding: '13px 0', background: GG, border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: 'fadeUp .3s ease' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Account Security</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Secure your trading account</div>

              <div style={{ marginBottom: 13 }}>
                <label style={lbl}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inp, paddingRight: 48 }} type={showPass ? 'text' : 'password'} value={password} onChange={function(e) { setPassword(e.target.value) }} placeholder="Min. 6 characters" onFocus={onF} onBlur={onB} />
                  <button type="button" onClick={function() { setShowPass(!showPass) }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 14 }}>{showPass ? 'H' : 'S'}</button>
                </div>
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 3, background: '#161b22', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ width: (strengthScore / 5 * 100) + '%', height: '100%', background: sColors[strengthScore], borderRadius: 2, transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: 10, color: sColors[strengthScore] }}>{sLabels[strengthScore]}</div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Confirm Password</label>
                <input style={{ ...inp, borderColor: confirmPassword ? (confirmPassword === password ? '#3fb950' : '#f85149') : '#30363d' }} type="password" value={confirmPassword} onChange={function(e) { setConfirmPassword(e.target.value) }} placeholder="Repeat your password" onFocus={onF} onBlur={function(e) { e.target.style.borderColor = (confirmPassword && confirmPassword !== password) ? '#f85149' : '#30363d' }} />
                {confirmPassword && confirmPassword !== password && <div style={{ fontSize: 11, color: '#f85149', marginTop: 4 }}>Passwords do not match</div>}
                {confirmPassword && confirmPassword === password && <div style={{ fontSize: 11, color: '#3fb950', marginTop: 4 }}>Passwords match</div>}
              </div>

              <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: '#484f58', marginBottom: 8 }}>Password Requirements</div>
                {[{ ok: password.length >= 6, text: 'At least 6 characters' }, { ok: /[A-Z]/.test(password) && /[a-z]/.test(password), text: 'Uppercase and lowercase letters' }, { ok: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password), text: 'At least one number or special character' }].map(function(r) {
                  return <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: r.ok ? '#3fb950' : '#484f58', marginBottom: 4 }}><span>{r.ok ? 'v' : 'o'}</span>{r.text}</div>
                })}
              </div>

              <div style={{ marginBottom: 20, cursor: 'pointer' }} onClick={function() { setAgreed(!agreed) }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: '2px solid ' + (agreed ? G : '#30363d'), background: agreed ? G : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.2s' }}>
                    {agreed && <span style={{ fontSize: 11, color: '#060a0f', fontWeight: 800 }}>v</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>
                    I agree to the{' '}
                    <Link href="/terms" style={{ color: G, textDecoration: 'none' }} onClick={function(e) { e.stopPropagation() }}>Terms and Conditions</Link>
                    {' '}and{' '}
                    <Link href="/terms" style={{ color: G, textDecoration: 'none' }} onClick={function(e) { e.stopPropagation() }}>Privacy Policy</Link>
                    {' '}of CapitalMarket Pro. I confirm I am at least 18 years old.
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={function() { setError(''); setStep(2) }} style={{ padding: '13px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}>Back</button>
                <button onClick={handleRegister} disabled={loading} style={{ padding: '13px 0', background: loading ? '#161b22' : GG, border: 'none', borderRadius: 12, color: loading ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,.2)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />}
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
          <div style={{ flex: 1, height: 1, background: '#21262d' }} />
          <span style={{ fontSize: 11, color: '#484f58' }}>Already have an account?</span>
          <div style={{ flex: 1, height: 1, background: '#21262d' }} />
        </div>

        <Link href="/login" style={{ textDecoration: 'none', display: 'block' }}>
          <button style={{ width: '100%', padding: '12px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}>Sign In Instead</button>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 18, flexWrap: 'wrap' }}>
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
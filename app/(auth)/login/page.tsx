// @ts-nocheck
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  var router = useRouter()
  var [step, setStep] = useState(1)
  var [email, setEmail] = useState('')
  var [password, setPassword] = useState('')
  var [showPassword, setShowPassword] = useState(false)
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState('')
  var [remember, setRemember] = useState(false)
  var [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  var [otpLoading, setOtpLoading] = useState(false)
  var [otpError, setOtpError] = useState('')
  var [cooldown, setCooldown] = useState(0)
  var [savedUserId, setSavedUserId] = useState('')
  var [destination, setDestination] = useState('/dashboard')

  var r0 = useRef(null)
  var r1 = useRef(null)
  var r2 = useRef(null)
  var r3 = useRef(null)
  var r4 = useRef(null)
  var r5 = useRef(null)
  var boxes = [r0, r1, r2, r3, r4, r5]

  useEffect(function() {
    if (cooldown <= 0) return
    var t = setInterval(function() { setCooldown(function(c) { return c - 1 }) }, 1000)
    return function() { clearInterval(t) }
  }, [cooldown])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    var supabase = createClient()
    var result = await supabase.auth.signInWithPassword({ email: email, password: password })
    if (result.error) { setError(result.error.message); setLoading(false); return }
    var uid = result.data.user.id
    setSavedUserId(uid)
    var prof = await supabase.from('users').select('role').eq('id', uid).single()
    var dest = '/dashboard'
    if (prof.data && prof.data.role === 'admin') dest = '/admin/dashboard'
    setDestination(dest)
    fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'login_alert', to: email, data: { time: new Date().toLocaleString(), device: 'Browser' } }) }).catch(function() {})
    var otpRes = await fetch('/api/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', email: email, user_id: uid }) })
    setLoading(false)
    if (!otpRes.ok) { router.push(dest); return }
    setCooldown(60)
    setStep(2)
    setTimeout(function() { if (r0.current) r0.current.focus() }, 150)
  }

  function handleDigitChange(index, value) {
    if (value && !/^\d$/.test(value)) return
    var next = [...otpDigits]
    next[index] = value
    setOtpDigits(next)
    if (value && index < 5 && boxes[index + 1].current) boxes[index + 1].current.focus()
    if (next.every(function(d) { return d !== '' })) doVerify(next.join(''))
  }

  function handleDigitKeyDown(index, e) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && boxes[index - 1].current) boxes[index - 1].current.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    var text = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (text.length === 6) { setOtpDigits(text.split('')); if (r5.current) r5.current.focus(); doVerify(text) }
  }

  async function doVerify(code) {
    if (code.length !== 6) return
    setOtpLoading(true)
    setOtpError('')
    var res = await fetch('/api/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify', email: email, code: code }) })
    var data = await res.json()
    setOtpLoading(false)
    if (!res.ok || !data.success) { setOtpError(data.error || 'Invalid or expired code.'); setOtpDigits(['', '', '', '', '', '']); if (r0.current) r0.current.focus(); return }
    router.push(destination)
  }

  async function handleResend() {
    if (cooldown > 0) return
    setOtpError('')
    setOtpDigits(['', '', '', '', '', ''])
    var res = await fetch('/api/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', email: email, user_id: savedUserId }) })
    if (res.ok) { setCooldown(60); if (r0.current) r0.current.focus() }
  }

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'
  var field = { width: '100%', background: '#141920', border: '1.5px solid #1e2530', borderRadius: 11, padding: '13px 15px', color: '#e8edf5', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#060a0e', fontFamily: 'Inter, sans-serif' }}>
      <style>{'@import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap); * { box-sizing: border-box; margin: 0; padding: 0; } body { background: #060a0e; } @keyframes fadeup { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } } @keyframes turn { to { transform: rotate(360deg); } } @keyframes wobble { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } } .fi:focus { border-color: #C9A84C !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.1) !important; } .ob { width: 50px; height: 58px; background: #141920; border: 2px solid #1e2530; border-radius: 12px; font-size: 22px; font-weight: 800; text-align: center; color: #e8edf5; outline: none; font-family: monospace; } .ob:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.15); } .ob.v { border-color: rgba(201,168,76,0.5); color: #C9A84C; } .ob.er { border-color: rgba(231,76,60,0.6); animation: wobble 0.3s ease; } .lp { display: flex; } @media (max-width: 1023px) { .lp { display: none !important; } }'}</style>

      <div className="lp" style={{ flex: 1, background: '#0a0d12', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: '#060a0e' }}>C</div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#e8edf5' }}>CapitalMarket <span style={{ color: G }}>Pro</span></span>
          </Link>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 100, padding: '5px 14px', fontSize: 11, color: '#2ecc71', marginBottom: 28, fontWeight: 600 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'blink 2s infinite' }} />
              Markets Open - 24/7 Trading
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#e8edf5', lineHeight: 1.1, marginBottom: 16 }}>Your wealth,<br /><span style={{ background: GG, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>professionally</span><br />managed.</h2>
            <p style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8, maxWidth: 340, marginBottom: 36 }}>Access Tesla, Bitcoin, Gold and 200+ assets with AI-powered strategies and verified monthly returns.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ sym: 'TSLA', price: '$248.50', chg: '+3.42%', c: '#CC0000' }, { sym: 'BTC', price: '$94,820', chg: '+2.14%', c: '#F7931A' }, { sym: 'GOLD', price: '$2,318', chg: '+0.64%', c: G }].map(function(item) {
                return (
                  <div key={item.sym} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', flex: 1 }}>
                    <div style={{ fontSize: 10, color: item.c, fontWeight: 700, marginBottom: 5 }}>{item.sym}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>{item.price}</div>
                    <div style={{ fontSize: 10, color: '#2ecc71', marginTop: 2 }}>{item.chg}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 36 }}>
            {[['$4.2B+', 'Under Management'], ['180K+', 'Active Investors'], ['142+', 'Countries']].map(function(pair) {
              return (
                <div key={pair[1]}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: G }}>{pair[0]}</div>
                  <div style={{ fontSize: 10, color: '#4a5568', marginTop: 2 }}>{pair[1]}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '44px 40px', overflowY: 'auto', minHeight: '100vh' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 36, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#060a0e' }}>C</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#e8edf5' }}>CapitalMarket <span style={{ color: G }}>Pro</span></span>
        </Link>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {['Live - 24/7 Markets', 'Fast Execution', 'Secure Platform'].map(function(label) {
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2530', borderRadius: 100, padding: '4px 12px', fontSize: 11, color: '#8892a0' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: G, display: 'inline-block', animation: 'blink 2s infinite' }} />
                {label}
              </div>
            )
          })}
        </div>

        {step === 1 && (
          <div style={{ animation: 'fadeup 0.35s ease' }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#e8edf5', marginBottom: 6 }}>Welcome Back</h1>
            <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 28 }}>Access your trading dashboard</p>
            {error && (
              <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 10, padding: '11px 14px', marginBottom: 20, fontSize: 12, color: '#e74c3c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{error}</span>
                <button onClick={function() { setError('') }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 16 }}>x</button>
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email Address</label>
                <input className="fi" style={field} type="email" value={email} onChange={function(e) { setEmail(e.target.value) }} placeholder="you@example.com" required />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="fi" style={{ ...field, paddingRight: 60 }} type={showPassword ? 'text' : 'password'} value={password} onChange={function(e) { setPassword(e.target.value) }} placeholder="Enter your password" required />
                  <button type="button" onClick={function() { setShowPassword(!showPassword) }} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace' }}>{showPassword ? 'HIDE' : 'SHOW'}</button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#8892a0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={remember} onChange={function(e) { setRemember(e.target.checked) }} style={{ accentColor: G, width: 14, height: 14 }} />
                  Remember me
                </label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: G, textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, border: 'none', borderRadius: 12, background: loading ? '#141920' : GG, color: loading ? '#4a5568' : '#060a0e', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 6px 24px rgba(201,168,76,0.28)' }}>
                {loading && <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#060a0e', borderRadius: '50%', animation: 'turn 0.7s linear infinite', display: 'inline-block' }} />}
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </button>
            </form>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#8892a0', marginTop: 24 }}>
              New to trading? <Link href="/register" style={{ color: G, fontWeight: 700, textDecoration: 'none' }}>Create your account</Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeup 0.35s ease' }}>
            <button onClick={function() { setStep(1); setOtpDigits(['', '', '', '', '', '']); setOtpError('') }} style={{ background: 'none', border: 'none', color: '#8892a0', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif', marginBottom: 28, padding: 0 }}>
              Back to login
            </button>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🔐</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e8edf5', marginBottom: 6 }}>Security Verification</h1>
              <p style={{ fontSize: 13, color: '#8892a0', marginBottom: 4 }}>Enter the 6-digit code sent to</p>
              <p style={{ fontSize: 14, color: G, fontWeight: 700 }}>{email}</p>
            </div>
            {otpError && <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 10, padding: '11px 14px', margin: '16px 0', fontSize: 12, color: '#e74c3c', textAlign: 'center' }}>{otpError}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '28px 0' }} onPaste={handlePaste}>
              {otpDigits.map(function(digit, i) {
                return <input key={i} ref={boxes[i]} className={'ob' + (digit ? ' v' : '') + (otpError ? ' er' : '')} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={function(e) { handleDigitChange(i, e.target.value) }} onKeyDown={function(e) { handleDigitKeyDown(i, e) }} />
              })}
            </div>
            <button disabled={otpDigits.some(function(d) { return d === '' }) || otpLoading} onClick={function() { doVerify(otpDigits.join('')) }} style={{ width: '100%', padding: 14, border: 'none', borderRadius: 12, marginBottom: 20, background: (!otpDigits.some(function(d) { return d === '' }) && !otpLoading) ? GG : '#141920', color: (!otpDigits.some(function(d) { return d === '' }) && !otpLoading) ? '#060a0e' : '#4a5568', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {otpLoading && <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#060a0e', borderRadius: '50%', animation: 'turn 0.7s linear infinite', display: 'inline-block' }} />}
              {otpLoading ? 'Verifying...' : 'Verify and Sign In'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#8892a0', marginBottom: 20 }}>
              Did not receive it?{' '}
              {cooldown > 0 ? <span style={{ color: '#4a5568' }}>Resend in {cooldown}s</span> : <button onClick={handleResend} style={{ background: 'none', border: 'none', color: G, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Resend Code</button>}
            </div>
            <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 11, padding: '12px 14px', fontSize: 11, color: '#4a5568', textAlign: 'center', lineHeight: 1.7 }}>
              Code expires in 10 minutes. Never share your OTP with anyone.
            </div>
          </div>
        )}

        <div style={{ marginTop: 36, paddingTop: 22, borderTop: '1px solid #141920', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#4a5568' }}>SSL Secured</span>
            <span style={{ fontSize: 11, color: '#4a5568' }}>256-bit Encryption</span>
            <span style={{ fontSize: 11, color: '#4a5568' }}>Regulated</span>
          </div>
          <div style={{ fontSize: 10, color: '#2a3140' }}>2025 CapitalMarket Pro. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}
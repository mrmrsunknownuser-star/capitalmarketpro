'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : password.length < 14 ? 3 : 4
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', '#f85149', '#F7A600', '#0052FF', '#3fb950']

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')

  if (!fullName.trim()) { setError('Please enter your full name'); return }
  if (password.length < 6) { setError('Password must be at least 6 characters'); return }
  if (password !== confirm) { setError('Passwords do not match'); return }

  setLoading(true)

  const supabase = createClient()

  // Step 1 — Sign up with Supabase Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { full_name: fullName.trim() } }
  })

  if (signUpError) {
    setError(signUpError.message)
    setLoading(false)
    return
  }

  if (!data.user) {
    setError('Registration failed. Please try again.')
    setLoading(false)
    return
  }

  // Step 2 — Manually create user profile
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: data.user.id,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
    }, { onConflict: 'id' })

  if (userError) {
    console.error('User insert error:', userError)
    // Don't block — user is created in auth, profile might already exist
  }

  // Step 3 — Create balance record
  await supabase
    .from('balances')
    .upsert({
      user_id: data.user.id,
      total_balance: 0,
      available_balance: 0,
      trading_balance: 0,
      total_pnl: 0,
    }, { onConflict: 'user_id' })
    // Clear any old session first
  const supabase2 = createClient()
  await supabase2.auth.signOut()

  // Sign in as the new user
  await supabase2.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  router.replace('/dashboard')
}

  return (
    <div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', fontFamily: 'monospace' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#060a0f', margin: '0 auto 14px', boxShadow: '0 0 30px rgba(201,168,76,0.35)' }}>C</div>
          </Link>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
            <span style={{ color: '#e6edf3' }}> Pro</span>
          </div>
          <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Professional Trading Platform</div>
        </div>

        {/* Card */}
        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Create your account</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 24 }}>Join 150,000+ traders on CapitalMarket Pro</div>

          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 10, padding: '12px 14px', marginBottom: 18, fontSize: 12, color: '#f85149', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* Full Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Smith"
                required
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#30363d'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#30363d'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 50px 13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'}
                  onBlur={e => e.target.style.borderColor = '#30363d'}
                />
                <button type="button" onClick={() => setShow(!show)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace' }}>
                  {show ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColor[strength] : '#21262d', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: strengthColor[strength] }}>{strengthLabel[strength]}</div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                style={{ width: '100%', background: '#161b22', border: `1px solid ${confirm && confirm !== password ? '#f85149' : confirm && confirm === password ? '#3fb950' : '#30363d'}`, borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = confirm && confirm !== password ? '#f85149' : confirm && confirm === password ? '#3fb950' : '#30363d'}
              />
              {confirm && confirm !== password && (
                <div style={{ fontSize: 11, color: '#f85149', marginTop: 5 }}>⚠ Passwords do not match</div>
              )}
              {confirm && confirm === password && (
                <div style={{ fontSize: 11, color: '#3fb950', marginTop: 5 }}>✓ Passwords match</div>
              )}
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px 0', background: loading ? '#161b22' : 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 12, color: loading ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'monospace', boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.3)' }}>
              {loading ? '⟳ Creating account...' : 'Create Free Account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#484f58' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 700 }}>Sign In</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: '#484f58', lineHeight: 1.7 }}>
            By creating an account you agree to our{' '}
            <Link href="/terms" style={{ color: '#C9A84C', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: '#484f58' }}>
          🔒 256-bit SSL · © 2025 CapitalMarket Pro · All Rights Reserved
        </div>
      </div>
    </div>
  )
}
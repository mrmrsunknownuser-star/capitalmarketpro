'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://capitalmarket-pro.com/reset-password`,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', fontFamily: 'monospace' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#060a0f', margin: '0 auto 14px', boxShadow: '0 0 30px rgba(201,168,76,0.35)' }}>C</div>
          </Link>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            <span style={{ color: '#C9A84C' }}>CapitalMarket</span><span style={{ color: '#e6edf3' }}> Pro</span>
          </div>
          <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Reset Your Password</div>
        </div>

        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#3fb950', marginBottom: 10 }}>Email Sent!</div>
              <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 24 }}>
                We sent a password reset link to <strong style={{ color: '#e6edf3' }}>{email}</strong>. Check your inbox and click the link to reset your password.
              </div>
              <div style={{ background: '#161b22', borderRadius: 10, padding: 14, marginBottom: 20, textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>
                  📌 <strong style={{ color: '#e6edf3' }}>Didn't receive it?</strong><br />
                  Check your spam folder or request another link in 5 minutes.
                </div>
              </div>
              <button onClick={() => setSent(false)} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', marginBottom: 12 }}>
                Try Different Email
              </button>
              <Link href="/login">
                <button style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Back to Sign In
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Forgot Password?</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 24 }}>Enter your email and we'll send you a reset link</div>

              {error && (
                <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 10, padding: '12px 14px', marginBottom: 18, fontSize: 12, color: '#f85149' }}>
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                    style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                    onFocus={e => e.target.style.borderColor = '#C9A84C'}
                    onBlur={e => e.target.style.borderColor = '#30363d'} />
                </div>
                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '14px 0', background: loading ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: loading ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'monospace', marginBottom: 16 }}>
                  {loading ? '⟳ Sending...' : 'Send Reset Link →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', fontSize: 12, color: '#484f58' }}>
                Remember your password?{' '}
                <Link href="/login" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 700 }}>Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
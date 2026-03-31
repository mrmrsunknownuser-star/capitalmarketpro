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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : password.length < 12 ? 3 : 4
  const strengthColor = ['#21262d', '#f85149', '#F7A600', '#0052FF', '#3fb950'][strength]
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); setLoading(false); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return }
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (error) { setError(error.message); setLoading(false); return }
    try {
      await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'welcome', to: email, data: { name: fullName || email } }) })
    } catch {}
    router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060a0f; font-family: 'Courier New', monospace; }
        .reg-wrap {
          min-height: 100vh;
          background: #060a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
        }
        .reg-box { width: 100%; max-width: 420px; }
        .reg-logo { text-align: center; margin-bottom: 28px; }
        .logo-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg, #C9A84C, #E8D08C);
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 800; color: #060a0f;
          box-shadow: 0 0 40px rgba(201,168,76,0.35); margin-bottom: 12px;
        }
        .logo-name { font-size: 20px; font-weight: 800; color: #e6edf3; }
        .logo-name span { color: #C9A84C; }
        .logo-sub { font-size: 11px; color: #484f58; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 4px; }
        .reg-card {
          background: #0d1117; border: 1px solid #21262d;
          border-radius: 20px; padding: 32px 28px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
        }
        .card-title { font-size: 20px; font-weight: 800; color: #e6edf3; margin-bottom: 6px; }
        .card-sub { font-size: 13px; color: #484f58; margin-bottom: 24px; }
        .error-box {
          background: rgba(248,81,73,0.1); border: 1px solid rgba(248,81,73,0.25);
          border-radius: 10px; padding: 12px 16px; margin-bottom: 18px;
          font-size: 12px; color: #f85149;
        }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 11px; color: #8b949e; margin-bottom: 7px; letter-spacing: 0.08em; text-transform: uppercase; }
        .field input {
          width: 100%; background: #161b22; border: 1px solid #30363d;
          border-radius: 10px; padding: 13px 16px; color: #e6edf3;
          font-size: 14px; font-family: 'Courier New', monospace;
          outline: none; transition: border-color 0.15s;
        }
        .field input:focus { border-color: #C9A84C; }
        .field input::placeholder { color: #484f58; }
        .pw-wrap { position: relative; }
        .pw-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #484f58; cursor: pointer; font-size: 11px; font-family: monospace; }
        .strength-bars { display: flex; gap: 4px; margin-top: 8px; }
        .strength-bar { flex: 1; height: 3px; border-radius: 2px; transition: background 0.2s; }
        .strength-label { font-size: 10px; margin-top: 4px; }
        .terms-text { font-size: 11px; color: #484f58; margin-bottom: 20px; line-height: 1.7; }
        .terms-text a { color: #C9A84C; text-decoration: none; }
        .btn-primary {
          width: 100%; padding: 14px 0;
          background: linear-gradient(135deg, #C9A84C, #E8D08C);
          border: none; border-radius: 12px; color: #060a0f;
          font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Courier New', monospace; letter-spacing: 0.04em;
          box-shadow: 0 4px 20px rgba(201,168,76,0.3); transition: opacity 0.15s;
        }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
        .divider-line { flex: 1; height: 1px; background: #21262d; }
        .divider span { font-size: 11px; color: #484f58; }
        .bottom-text { text-align: center; font-size: 13px; color: #8b949e; }
        .bottom-text a { color: #C9A84C; text-decoration: none; font-weight: 700; }
        .trust-row { display: flex; justify-content: center; gap: 18px; margin-top: 20px; flex-wrap: wrap; }
        .trust-badge { font-size: 11px; color: #484f58; }
        @media (max-width: 480px) {
          .reg-card { padding: 24px 20px; border-radius: 16px; }
          .card-title { font-size: 18px; }
        }
      `}</style>

      <div className="reg-wrap">
        <div className="reg-box">

          {/* Logo */}
          <div className="reg-logo">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div className="logo-icon">C</div>
              <div className="logo-name"><span>CapitalMarket</span> Pro</div>
              <div className="logo-sub">Professional Trading Platform</div>
            </Link>
          </div>

          {/* Card */}
          <div className="reg-card">
            <div className="card-title">Create your account</div>
            <div className="card-sub">Join 150,000+ traders on CapitalMarket Pro</div>

            {error && <div className="error-box">⚠ {error}</div>}

            <form onSubmit={handleRegister}>
              <div className="field">
                <label>Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" required />
              </div>

              <div className="field">
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>

              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    style={{ paddingRight: 60 }}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShow(!show)}>
                    {show ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                {password.length > 0 && (
                  <>
                    <div className="strength-bars">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="strength-bar" style={{ background: i <= strength ? strengthColor : '#21262d' }} />
                      ))}
                    </div>
                    <div className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</div>
                  </>
                )}
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  style={{ borderColor: confirm && confirm !== password ? '#f85149' : '#30363d' }}
                />
              </div>

              <div className="terms-text">
                By creating an account you agree to our{' '}
                <Link href="/terms">Terms of Service</Link>{' '}and{' '}
                <Link href="/terms">Privacy Policy</Link>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span>OR</span>
              <div className="divider-line" />
            </div>

            <div className="bottom-text">
              Already have an account?{' '}
              <Link href="/login">Sign in</Link>
            </div>
          </div>

          <div className="trust-row">
            <span className="trust-badge">🔒 256-bit SSL</span>
            <span className="trust-badge">✅ KYC Verified</span>
            <span className="trust-badge">🏦 Regulated</span>
          </div>
        </div>
      </div>
    </>
  )
}
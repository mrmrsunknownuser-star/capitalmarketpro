'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
    if (profile?.role !== 'admin') { setError('Access denied. Admin only.'); await supabase.auth.signOut(); setLoading(false); return }
    router.replace('/admin/users')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'monospace' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #f85149, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(248,81,73,0.4)' }}>A</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Admin Panel</div>
          <div style={{ fontSize: 12, color: '#484f58' }}>CapitalMarket Pro · Authorized Access Only</div>
        </div>

        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 12, color: '#f85149' }}>
              ⚠ {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@capitalmarketpro.com" required
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 16px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#f85149'}
                onBlur={e => e.target.style.borderColor = '#30363d'}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 50px 13px 16px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = '#f85149'}
                  onBlur={e => e.target.style.borderColor = '#30363d'}
                />
                <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace' }}>
                  {show ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #f85149, #ff6b6b)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', opacity: loading ? 0.6 : 1, boxShadow: '0 4px 20px rgba(248,81,73,0.3)' }}>
              {loading ? 'Verifying...' : 'Access Admin Panel →'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#484f58' }}>
          🔒 Restricted Access · CapitalMarket Pro
        </div>
      </div>
    </div>
  )
}
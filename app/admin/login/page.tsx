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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) { setError(error.message); setLoading(false); return }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      setError('Access denied. Admin accounts only.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'monospace' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, #f85149, #ff6b6b)', marginBottom: 16 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>A</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3' }}>Admin Portal</div>
          <div style={{ fontSize: 12, color: '#484f58', marginTop: 4 }}>CapitalMarket Pro Control Center</div>
        </div>

        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 16, padding: 32 }}>
          <div style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#f85149' }}>⚠ Restricted Access — Authorized Personnel Only</div>
          </div>

          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#f85149' }}>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 8 }}>Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@capitalmarketpro.com"
                required
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 16px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 8 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 16px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #f85149, #ff6b6b)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: '#484f58', marginTop: 20 }}>
          🔒 All admin actions are logged and monitored
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<any>(null)
  const [btcAddress, setBtcAddress] = useState('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
  const [siteName, setSiteName] = useState('CapitalMarket Pro')
  const [minDeposit, setMinDeposit] = useState('100')
  const [withdrawFee, setWithdrawFee] = useState('5')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [joshuaPhoto, setJoshuaPhoto] = useState('')

useEffect(() => {
  const init = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setAdmin(user)
    
    // Get Joshua's photo
    const { data: joshuaData } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('email', 'admin@capitalmarketpro.com')
      .single()
    if (joshuaData?.avatar_url) setJoshuaPhoto(joshuaData.avatar_url)
  }
  init()
}, [])

  const save = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('audit_logs').insert({
      action: 'PLATFORM_SETTINGS_UPDATED',
      details: { btcAddress, siteName, minDeposit, withdrawFee },
    })
    setMessage('Settings saved successfully!')
    setTimeout(() => setMessage(''), 3000)
    setLoading(false)
  }

  const inputStyle = { width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }
  const labelStyle = { display: 'block' as const, fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Platform Settings</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Configure platform-wide settings</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>✅ {message}</div>
      )}

      {/* Admin Account */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>👤 Admin Account</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#161b22', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Email</div>
            <div style={{ fontSize: 13, color: '#C9A84C' }}>{admin?.email}</div>
          </div>
          <div style={{ background: '#161b22', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role</div>
            <div style={{ fontSize: 13, color: '#f85149' }}>Super Admin</div>
          </div>
        </div>
      </div>

      {/* Platform Config */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>⚙ Platform Configuration</div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Platform Name</label>
          <input value={siteName} onChange={e => setSiteName(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>₿ Master BTC Deposit Address</label>
          {/* Joshua Avatar Upload */}
<div style={{ marginBottom: 20 }}>
  <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>👤 Joshua Elder — Account Manager Photo</div>
  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 14 }}>This photo appears on the user dashboard and support chat</div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#060a0f', overflow: 'hidden', border: '3px solid rgba(201,168,76,0.4)', flexShrink: 0 }}>
      {joshuaPhoto ? <img src={joshuaPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
    </div>
    <div style={{ flex: 1 }}>
      <input type="file" accept="image/*" onChange={async e => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = async ev => {
          const base64 = ev.target?.result as string
          setJoshuaPhoto(base64)
          const supabase = createClient()
          await supabase.from('users').update({ avatar_url: base64 }).eq('email', 'admin@capitalmarketpro.com')
          setMessage('Joshua\'s photo updated!')
          setTimeout(() => setMessage(''), 3000)
        }
        reader.readAsDataURL(file)
      }} style={{ display: 'none' }} id="joshua-photo" />
      <label htmlFor="joshua-photo" style={{ display: 'inline-block', padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
        📷 Upload Photo
      </label>
      <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>JPG, PNG or WEBP · Max 2MB · Will show across platform</div>
    </div>
  </div>
</div>
          <input value={btcAddress} onChange={e => setBtcAddress(e.target.value)} style={{ ...inputStyle, color: '#C9A84C' }} />
          <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>This is the address shown to all users on the deposit page</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Minimum Deposit ($)</label>
            <input type="number" value={minDeposit} onChange={e => setMinDeposit(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Withdrawal Fee (%)</label>
            <input type="number" value={withdrawFee} onChange={e => setWithdrawFee(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <button onClick={save} disabled={loading} style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Saving...' : '💾 Save Settings'}
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ background: '#0d1117', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 14, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f85149', marginBottom: 16 }}>⚠ Danger Zone</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #161b22' }}>
          <div>
            <div style={{ fontSize: 13, color: '#e6edf3', marginBottom: 3 }}>Maintenance Mode</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>Block all user logins temporarily</div>
          </div>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>Enable</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: 13, color: '#e6edf3', marginBottom: 3 }}>Clear Audit Logs</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>Permanently delete all audit records</div>
          </div>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>Clear All</button>
        </div>
      </div>
    </div>
  )
}
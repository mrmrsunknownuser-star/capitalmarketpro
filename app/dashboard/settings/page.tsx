'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [notifSettings, setNotifSettings] = useState({
    deposits: true,
    withdrawals: true,
    kyc: true,
    promotions: true,
    support: true,
  })

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      setUser({ ...authUser, ...profile })
      setFullName(profile?.full_name || '')
      setPhone(profile?.phone || '')
      setCountry(profile?.country || '')
    }
    init()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    const supabase = createClient()
    const { error: err } = await supabase.from('users').update({ full_name: fullName, phone, country }).eq('id', user.id)
    if (err) { setError('Failed to save profile'); setSaving(false); return }
    setMessage('✅ Profile updated successfully')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const changePassword = async () => {
    setError('')
    setMessage('')
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setChangingPassword(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) { setError(err.message); setChangingPassword(false); return }
    setMessage('✅ Password changed successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setChangingPassword(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

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

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Settings</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Manage your account preferences</div>
      </div>

      {/* Profile summary */}
      <div style={{ background: 'linear-gradient(135deg,#0d1117,#161b22)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16, padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
          {(fullName || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 3 }}>{fullName || 'No name set'}</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 4 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 9, color: '#3fb950', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', padding: '2px 8px', borderRadius: 10 }}>✓ Active</span>
            <span style={{ fontSize: 9, color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', padding: '2px 8px', borderRadius: 10 }}>{user?.tier || 'Starter'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: '#f85149', display: 'flex', justifyContent: 'space-between' }}><span>⚠ {error}</span><button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}>✕</button></div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {[{ id: 'profile', label: '👤 Profile' }, { id: 'security', label: '🔒 Security' }, { id: 'notifications', label: '🔔 Alerts' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Personal Information</div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
            <input value={user?.email || ''} disabled style={{ ...inputStyle, color: '#484f58', cursor: 'not-allowed' }} />
            <div style={{ fontSize: 10, color: '#484f58', marginTop: 4 }}>Email cannot be changed</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Country</label>
            <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'}>
              <option value="">Select country...</option>
              {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'UAE', 'Saudi Arabia', 'Nigeria', 'Singapore', 'Japan', 'India', 'Brazil', 'South Africa', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button onClick={saveProfile} disabled={saving}
            style={{ width: '100%', padding: '13px 0', background: saving ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: saving ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
            {saving ? '⟳ Saving...' : '💾 Save Profile'}
          </button>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div>
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Change Password</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" style={{ ...inputStyle, borderColor: confirmPassword && confirmPassword !== newPassword ? '#f85149' : confirmPassword && confirmPassword === newPassword ? '#3fb950' : '#30363d' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = confirmPassword && confirmPassword !== newPassword ? '#f85149' : '#30363d'} />
              {confirmPassword && confirmPassword !== newPassword && <div style={{ fontSize: 11, color: '#f85149', marginTop: 4 }}>⚠ Passwords do not match</div>}
              {confirmPassword && confirmPassword === newPassword && <div style={{ fontSize: 11, color: '#3fb950', marginTop: 4 }}>✓ Passwords match</div>}
            </div>

            <button onClick={changePassword} disabled={changingPassword || !newPassword || !confirmPassword}
              style={{ width: '100%', padding: '13px 0', background: !newPassword || !confirmPassword || changingPassword ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: !newPassword || !confirmPassword || changingPassword ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: !newPassword || !confirmPassword || changingPassword ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
              {changingPassword ? '⟳ Changing...' : '🔒 Change Password'}
            </button>
          </div>

          {/* Account info */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 14 }}>Account Information</div>
            {[
              { l: 'Account ID', v: user?.id?.slice(0, 12) + '...' || '—' },
              { l: 'Account Status', v: user?.status || 'Active' },
              { l: 'KYC Status', v: user?.kyc_status || 'Pending' },
              { l: 'Member Since', v: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
              { l: 'Account Tier', v: user?.tier || 'Starter' },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #161b22' }}>
                <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500, textTransform: 'capitalize' }}>{item.v}</span>
              </div>
            ))}
          </div>

          {/* Sign out */}
          <button onClick={signOut}
            style={{ width: '100%', padding: '13px 0', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 12, color: '#f85149', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
            🚪 Sign Out
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Notification Preferences</div>
          {[
            { key: 'deposits', label: 'Deposit confirmations', desc: 'When your deposit is confirmed' },
            { key: 'withdrawals', label: 'Withdrawal updates', desc: 'Status updates on withdrawals' },
            { key: 'kyc', label: 'KYC updates', desc: 'Identity verification status' },
            { key: 'support', label: 'Support messages', desc: 'Messages from Joshua Elder' },
            { key: 'promotions', label: 'Promotions & news', desc: 'Platform updates and offers' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #161b22' }}>
              <div>
                <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{item.desc}</div>
              </div>
              <div onClick={() => setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                style={{ width: 44, height: 24, borderRadius: 12, background: notifSettings[item.key as keyof typeof notifSettings] ? '#C9A84C' : '#161b22', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', border: `1px solid ${notifSettings[item.key as keyof typeof notifSettings] ? '#C9A84C' : '#30363d'}` }}>
                <div style={{ position: 'absolute', top: 3, left: notifSettings[item.key as keyof typeof notifSettings] ? 22 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
              </div>
            </div>
          ))}
          <button onClick={() => { setMessage('✅ Notification preferences saved'); setTimeout(() => setMessage(''), 3000) }}
            style={{ width: '100%', marginTop: 20, padding: '13px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            💾 Save Preferences
          </button>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
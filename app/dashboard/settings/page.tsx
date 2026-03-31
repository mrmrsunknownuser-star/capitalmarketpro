'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({ full_name: '', phone: '' })
  const [avatar, setAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({ full_name: data.full_name || '', phone: data.phone || '' })
        setAvatar(data.avatar_url || null)
      }
    }
    fetch()
  }, [])

  const saveProfile = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('users').update(profile).eq('id', user.id)
    setMessage('Profile updated successfully!')
    setTimeout(() => setMessage(''), 3000)
    setLoading(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      setAvatar(base64)
      const supabase = createClient()
      await supabase.from('users').update({ avatar_url: base64 }).eq('id', user.id)
      setUploading(false)
      setMessage('Profile picture updated!')
      setTimeout(() => setMessage(''), 3000)
    }
    reader.readAsDataURL(file)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = profile.full_name ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : (user?.email?.[0] || 'U').toUpperCase()

  return (
    <div style={{ padding: '20px 16px 40px', maxWidth: 680, margin: '0 auto', fontFamily: 'monospace' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Settings</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Manage your account and preferences</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          ✅ {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {['profile', 'security', 'preferences'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: activeTab === tab ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeTab === tab ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', textTransform: 'capitalize', fontWeight: activeTab === tab ? 700 : 400 }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>

          {/* Avatar Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #161b22' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #C9A84C', cursor: 'pointer' }}
                onClick={() => fileRef.current?.click()}>
                {avatar ? (
                  <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#060a0f' }}>{initials}</span>
                )}
              </div>
              {/* Upload button */}
              <div onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, border: '2px solid #060a0f' }}>
                📷
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{profile.full_name || 'No name set'}</div>
              <div style={{ fontSize: 13, color: '#484f58', marginBottom: 10 }}>{user?.email}</div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #C9A84C', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                {uploading ? 'Uploading...' : '📷 Change Photo'}
              </button>
            </div>
          </div>

          {/* Form */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
            <input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="Your full name" style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input value={user?.email || ''} disabled style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#484f58', fontSize: 14, outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone Number</label>
            <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 234 567 8900" style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          </div>

          <button onClick={saveProfile} disabled={loading} style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Security Settings</div>
          {[
            { label: '🔐 Two-Factor Authentication', desc: 'Add extra security to your account', action: 'Enable 2FA', color: '#3fb950' },
            { label: '🔑 Change Password', desc: 'Update your account password', action: 'Change', color: '#C9A84C' },
            { label: '📱 Login Activity', desc: 'View recent login sessions', action: 'View', color: '#0052FF' },
            { label: '🪪 KYC Verification', desc: 'Verify identity to unlock all features', action: 'Verify →', color: '#F7A600', href: '/dashboard/kyc' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #161b22', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: '#e6edf3', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{item.desc}</div>
              </div>
              <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${item.color}33`, background: `${item.color}0d`, color: item.color, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {item.action}
              </button>
            </div>
          ))}
          <div style={{ marginTop: 24 }}>
            <button onClick={handleLogout} style={{ width: '100%', padding: '13px 0', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 12, color: '#f85149', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Preferences</div>
          {[
            { label: '🔔 Email Notifications', desc: 'Trade and account alerts via email', enabled: true },
            { label: '📊 Demo Mode', desc: 'Show demo data on dashboard', enabled: false },
            { label: '🌙 Dark Mode', desc: 'Dark theme (currently active)', enabled: true },
            { label: '💱 USD Display', desc: 'Show balances in USD', enabled: true },
          ].map((pref, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #161b22' }}>
              <div>
                <div style={{ fontSize: 13, color: '#e6edf3', marginBottom: 3 }}>{pref.label}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{pref.desc}</div>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: pref.enabled ? '#C9A84C' : '#21262d', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: pref.enabled ? 23 : 3, transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({ full_name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '' })
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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const tabs = ['profile', 'security', 'preferences']

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Settings</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Manage your account and preferences</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          ✅ {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              background: activeTab === tab ? 'rgba(201,168,76,0.15)' : 'transparent',
              color: activeTab === tab ? '#C9A84C' : '#8b949e',
              fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
              fontFamily: 'monospace',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 24 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #161b22' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#060a0f' }}>
              {(profile.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3' }}>{profile.full_name || 'No name set'}</div>
              <div style={{ fontSize: 12, color: '#484f58' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
            <input
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Your full name"
              style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input
              value={user?.email || ''}
              disabled
              style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 14px', color: '#484f58', fontSize: 13, outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone Number</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+1 234 567 8900"
              style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={loading}
            style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 20 }}>Security Settings</div>

          {[
            { label: '🔐 Two-Factor Authentication', desc: 'Add an extra layer of security to your account', action: 'Enable 2FA', color: '#3fb950' },
            { label: '🔑 Change Password', desc: 'Update your account password', action: 'Change', color: '#C9A84C' },
            { label: '📱 Login Activity', desc: 'View recent login sessions and devices', action: 'View', color: '#0052FF' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #161b22' }}>
              <div>
                <div style={{ fontSize: 13, color: '#e6edf3', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{item.desc}</div>
              </div>
              <button style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${item.color}33`, background: `${item.color}0d`, color: item.color, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {item.action}
              </button>
            </div>
          ))}

          <div style={{ marginTop: 24 }}>
            <button
              onClick={handleLogout}
              style={{ width: '100%', padding: '13px 0', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, color: '#f85149', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 20 }}>Preferences</div>
          {[
            { label: '🔔 Email Notifications', desc: 'Receive trade and account alerts via email', enabled: true },
            { label: '📊 Demo Mode', desc: 'Show demo data on dashboard', enabled: false },
            { label: '🌙 Dark Mode', desc: 'Dark theme (currently active)', enabled: true },
            { label: '💱 Currency Display', desc: 'Show balances in USD', enabled: true },
          ].map((pref, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #161b22' }}>
              <div>
                <div style={{ fontSize: 13, color: '#e6edf3', marginBottom: 3 }}>{pref.label}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{pref.desc}</div>
              </div>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: pref.enabled ? '#C9A84C' : '#21262d', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: pref.enabled ? 21 : 3, transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
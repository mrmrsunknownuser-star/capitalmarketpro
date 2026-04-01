'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [joshuaPhoto, setJoshuaPhoto] = useState<string | null>(null)

  // Platform config
  const [btcAddress, setBtcAddress] = useState('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
  const [siteName, setSiteName] = useState('CapitalMarket Pro')
  const [minDeposit, setMinDeposit] = useState('100')
  const [withdrawFee, setWithdrawFee] = useState('5')

  // Crypto addresses for manual trading
  const [cryptoAddrs, setCryptoAddrs] = useState({
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fA32',
    USDT: 'TXkz2rQLJm7TFb1qJJHvxBEaJiFzPGx8Gq',
    BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
  })

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

      // Get saved crypto addresses
      const { data: addrData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'crypto_addresses')
        .single()
      if (addrData?.value) setCryptoAddrs(addrData.value)

      // Get other settings
      const { data: settingsData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'general')
        .single()
      if (settingsData?.value) {
        setBtcAddress(settingsData.value.btcAddress || btcAddress)
        setSiteName(settingsData.value.siteName || siteName)
        setMinDeposit(settingsData.value.minDeposit || minDeposit)
        setWithdrawFee(settingsData.value.withdrawFee || withdrawFee)
      }
    }
    init()
  }, [])

  const save = async () => {
    setLoading(true)
    const supabase = createClient()

    // Save general settings
    await supabase.from('platform_settings').upsert({
      key: 'general',
      value: { btcAddress, siteName, minDeposit, withdrawFee },
      updated_at: new Date().toISOString(),
    })

    // Save crypto addresses
    await supabase.from('platform_settings').upsert({
      key: 'crypto_addresses',
      value: cryptoAddrs,
      updated_at: new Date().toISOString(),
    })

    // Log action
    try {
      await supabase.from('audit_logs').insert({
        action: 'PLATFORM_SETTINGS_UPDATED',
        details: { btcAddress, siteName, minDeposit, withdrawFee, cryptoAddrs },
      })
    } catch {}

    setMessage('Settings saved successfully!')
    setTimeout(() => setMessage(''), 3000)
    setLoading(false)
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
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    color: '#8b949e',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  }

  const sectionStyle: React.CSSProperties = {
    background: '#0d1117',
    border: '1px solid #161b22',
    borderRadius: 14,
    padding: 24,
    marginBottom: 20,
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Platform Settings</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Configure platform-wide settings and crypto addresses</div>
      </div>

      {/* Success message */}
      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#3fb950' }}>
          ✅ {message}
        </div>
      )}

      {/* Admin Account Info */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>👤 Admin Account</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#161b22', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Email</div>
            <div style={{ fontSize: 13, color: '#C9A84C' }}>{admin?.email || 'Loading...'}</div>
          </div>
          <div style={{ background: '#161b22', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role</div>
            <div style={{ fontSize: 13, color: '#f85149', fontWeight: 700 }}>🔴 Super Admin</div>
          </div>
        </div>
      </div>

      {/* Joshua Elder Photo */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>👤 Joshua C. Elder — Account Manager Photo</div>
        <div style={{ fontSize: 11, color: '#484f58', marginBottom: 16 }}>This photo appears on the user dashboard and support chat</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar preview */}
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#060a0f', overflow: 'hidden', border: '3px solid rgba(201,168,76,0.4)', flexShrink: 0 }}>
            {joshuaPhoto ? (
              <img src={joshuaPhoto} alt="Joshua" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : 'JE'}
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="file"
              accept="image/*"
              id="joshua-photo-input"
              style={{ display: 'none' }}
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = async ev => {
                  const base64 = ev.target?.result as string
                  setJoshuaPhoto(base64)
                  const supabase = createClient()
                  await supabase.from('users').update({ avatar_url: base64 }).eq('email', 'admin@capitalmarketpro.com')
                  setMessage("Joshua's photo updated successfully!")
                  setTimeout(() => setMessage(''), 3000)
                }
                reader.readAsDataURL(file)
              }}
            />
            <label htmlFor="joshua-photo-input" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
              📷 {joshuaPhoto ? 'Change Photo' : 'Upload Photo'}
            </label>
            <div style={{ fontSize: 11, color: '#484f58', marginTop: 8, lineHeight: 1.6 }}>
              JPG, PNG or WEBP · Max 2MB<br />
              Shows on user dashboard, support chat, and admin panel
            </div>
          </div>
        </div>
      </div>

      {/* Platform Config */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>⚙️ Platform Configuration</div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Platform Name</label>
          <input
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#30363d'}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>₿ Master BTC Deposit Address</label>
          <input
            value={btcAddress}
            onChange={e => setBtcAddress(e.target.value)}
            style={{ ...inputStyle, color: '#C9A84C' }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#30363d'}
          />
          <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>Shown to all users on the Deposit page</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Minimum Deposit ($)</label>
            <input
              type="number"
              value={minDeposit}
              onChange={e => setMinDeposit(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
          </div>
          <div>
            <label style={labelStyle}>Withdrawal Fee (%)</label>
            <input
              type="number"
              value={withdrawFee}
              onChange={e => setWithdrawFee(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
          </div>
        </div>
      </div>

      {/* Crypto Addresses for Manual Trading */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>₿ Manual Trading Crypto Addresses</div>
        <div style={{ fontSize: 11, color: '#484f58', marginBottom: 18 }}>
          These addresses appear on the Manual Trading fund page. Users will send crypto to these addresses.
        </div>

        {[
          { coin: 'BTC', label: 'Bitcoin (BTC) — Preferred', color: '#F7A600', placeholder: 'bc1q...' },
          { coin: 'ETH', label: 'Ethereum (ETH)', color: '#627EEA', placeholder: '0x...' },
          { coin: 'USDT', label: 'USDT (TRC20)', color: '#26A17B', placeholder: 'T...' },
          { coin: 'BNB', label: 'BNB (BEP20)', color: '#F7A600', placeholder: 'bnb1...' },
        ].map(addr => (
          <div key={addr.coin} style={{ marginBottom: 16 }}>
            <label style={{ ...labelStyle, color: addr.color }}>
              {addr.label}
            </label>
            <input
              value={cryptoAddrs[addr.coin as keyof typeof cryptoAddrs]}
              onChange={e => setCryptoAddrs(prev => ({ ...prev, [addr.coin]: e.target.value }))}
              placeholder={addr.placeholder}
              style={{ ...inputStyle, color: addr.color, borderColor: `${addr.color}33` }}
              onFocus={e => e.target.style.borderColor = addr.color}
              onBlur={e => e.target.style.borderColor = `${addr.color}33`}
            />
          </div>
        ))}

        <div style={{ background: 'rgba(247,166,0,0.06)', border: '1px solid rgba(247,166,0,0.2)', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: '#F7A600', lineHeight: 1.7 }}>
            ⚠️ Always double-check addresses before saving. Users will send real funds to these addresses.
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={save}
        disabled={loading}
        style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', opacity: loading ? 0.6 : 1, marginBottom: 20 }}>
        {loading ? '⟳ Saving...' : '💾 Save All Settings'}
      </button>

      {/* Danger Zone */}
      <div style={{ background: '#0d1117', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 14, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f85149', marginBottom: 16 }}>⚠️ Danger Zone</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #161b22', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: '#e6edf3', marginBottom: 3 }}>Maintenance Mode</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>Block all user logins temporarily</div>
          </div>
          <button style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
            Enable
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: '#e6edf3', marginBottom: 3 }}>Clear Audit Logs</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>Permanently delete all audit records</div>
          </div>
          <button
            onClick={async () => {
              if (!confirm('Are you sure? This cannot be undone.')) return
              const supabase = createClient()
              await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
              setMessage('Audit logs cleared')
              setTimeout(() => setMessage(''), 3000)
            }}
            style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
            Clear All
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#484f58' }}>
        © 2025 CapitalMarket Pro · All Rights Reserved
      </div>
    </div>
  )
}
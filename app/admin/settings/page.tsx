'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Platform settings
  const [btcAddress, setBtcAddress] = useState('')
  const [ethAddress, setEthAddress] = useState('')
  const [usdtAddress, setUsdtAddress] = useState('')
  const [bnbAddress, setBnbAddress] = useState('')
  const [platformName, setPlatformName] = useState('CapitalMarket Pro')
  const [supportEmail, setSupportEmail] = useState('support@capitalmarket-pro.com')
  const [withdrawalFee, setWithdrawalFee] = useState('5')
  const [minDeposit, setMinDeposit] = useState('100')
  const [minWithdrawal, setMinWithdrawal] = useState('100')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [joshuaPhoto, setJoshuaPhoto] = useState<string | null>(null)
  const [joshuaPhotoPreview, setJoshuaPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: cryptoAddr } = await supabase.from('platform_settings').select('value').eq('key', 'crypto_addresses').single()
      if (cryptoAddr?.value) {
        setBtcAddress(cryptoAddr.value.BTC || '')
        setEthAddress(cryptoAddr.value.ETH || '')
        setUsdtAddress(cryptoAddr.value.USDT || '')
        setBnbAddress(cryptoAddr.value.BNB || '')
      }
      const { data: general } = await supabase.from('platform_settings').select('value').eq('key', 'general').single()
      if (general?.value) {
        setPlatformName(general.value.platformName || 'CapitalMarket Pro')
        setSupportEmail(general.value.supportEmail || 'support@capitalmarket-pro.com')
        setWithdrawalFee(general.value.withdrawalFee?.toString() || '5')
        setMinDeposit(general.value.minDeposit?.toString() || '100')
        setMinWithdrawal(general.value.minWithdrawal?.toString() || '100')
        setMaintenanceMode(general.value.maintenanceMode || false)
      }
      const { data: adminUser } = await supabase.from('users').select('avatar_url').eq('role', 'admin').single()
      if (adminUser?.avatar_url) {
        setJoshuaPhoto(adminUser.avatar_url)
        setJoshuaPhotoPreview(adminUser.avatar_url)
      }
      setLoading(false)
    }
    init()
  }, [])

  const saveCryptoAddresses = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('platform_settings').upsert({
      key: 'crypto_addresses',
      value: { BTC: btcAddress, ETH: ethAddress, USDT: usdtAddress, BNB: bnbAddress },
    }, { onConflict: 'key' })
    setMessage('✅ Crypto addresses saved!')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const saveGeneralSettings = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('platform_settings').upsert({
      key: 'general',
      value: {
        platformName,
        supportEmail,
        withdrawalFee: parseFloat(withdrawalFee),
        minDeposit: parseFloat(minDeposit),
        minWithdrawal: parseFloat(minWithdrawal),
        maintenanceMode,
        btcAddress,
      },
    }, { onConflict: 'key' })
    setMessage('✅ General settings saved!')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setJoshuaPhotoPreview(base64)
      setJoshuaPhoto(base64)
    }
    reader.readAsDataURL(file)
  }

  const saveJoshuaPhoto = async () => {
    if (!joshuaPhoto) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ avatar_url: joshuaPhoto }).eq('role', 'admin')
    setMessage('✅ Joshua photo updated!')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
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

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#484f58', fontFamily: 'monospace' }}>Loading settings...</div>
  )

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Platform Settings</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Configure platform settings and crypto addresses</div>
      </div>

      {message && <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#f85149', display: 'flex', justifyContent: 'space-between' }}><span>⚠ {error}</span><button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}>✕</button></div>}

      {/* Crypto Addresses */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>₿ Crypto Deposit Addresses</div>
        <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>These addresses are shown to users when depositing funds</div>

        {[
          { label: '₿ Bitcoin (BTC)', value: btcAddress, setter: setBtcAddress, color: '#F7A600' },
          { label: 'Ξ Ethereum (ETH)', value: ethAddress, setter: setEthAddress, color: '#627EEA' },
          { label: '₮ USDT (TRC20)', value: usdtAddress, setter: setUsdtAddress, color: '#26A17B' },
          { label: '● BNB (BEP20)', value: bnbAddress, setter: setBnbAddress, color: '#F7A600' },
        ].map(item => (
          <div key={item.label} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: item.color, marginBottom: 7, fontWeight: 700 }}>{item.label}</label>
            <input
              value={item.value}
              onChange={e => item.setter(e.target.value)}
              placeholder={`Enter ${item.label} address...`}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = item.color}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
          </div>
        ))}

        <button onClick={saveCryptoAddresses} disabled={saving}
          style={{ width: '100%', padding: '13px 0', background: saving ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: saving ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
          {saving ? '⟳ Saving...' : '💾 Save Crypto Addresses'}
        </button>
      </div>

      {/* General Settings */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>⚙ General Settings</div>
        <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Platform configuration and fee settings</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {[
            { label: 'Platform Name', value: platformName, setter: setPlatformName },
            { label: 'Support Email', value: supportEmail, setter: setSupportEmail },
            { label: 'Withdrawal Fee (%)', value: withdrawalFee, setter: setWithdrawalFee },
            { label: 'Min Deposit ($)', value: minDeposit, setter: setMinDeposit },
            { label: 'Min Withdrawal ($)', value: minWithdrawal, setter: setMinWithdrawal },
          ].map(item => (
            <div key={item.label}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</label>
              <input
                value={item.value}
                onChange={e => item.setter(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#30363d'}
              />
            </div>
          ))}
        </div>

        {/* Maintenance mode toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid #161b22', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 600, marginBottom: 2 }}>🚧 Maintenance Mode</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>Temporarily restrict user access to platform</div>
          </div>
          <div onClick={() => setMaintenanceMode(!maintenanceMode)}
            style={{ width: 48, height: 26, borderRadius: 13, background: maintenanceMode ? '#f85149' : '#161b22', border: `1px solid ${maintenanceMode ? '#f85149' : '#30363d'}`, position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ position: 'absolute', top: 3, left: maintenanceMode ? 24 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
          </div>
        </div>

        <button onClick={saveGeneralSettings} disabled={saving}
          style={{ width: '100%', padding: '13px 0', background: saving ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: saving ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
          {saving ? '⟳ Saving...' : '💾 Save General Settings'}
        </button>
      </div>

      {/* Joshua Photo */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>👤 Account Manager Photo</div>
        <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Photo shown to users as Joshua C. Elder's profile picture</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#060a0f', overflow: 'hidden', border: '3px solid rgba(201,168,76,0.3)', flexShrink: 0 }}>
            {joshuaPhotoPreview ? <img src={joshuaPhotoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
          </div>
          <div style={{ flex: 1 }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #21262d', background: '#161b22', color: '#e6edf3', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', marginBottom: 8, display: 'block' }}>
              📷 Choose Photo
            </button>
            <div style={{ fontSize: 11, color: '#484f58' }}>JPG, PNG — Max 2MB · Displayed as 64×64px circle</div>
          </div>
        </div>

        <button onClick={saveJoshuaPhoto} disabled={saving || !joshuaPhoto}
          style={{ width: '100%', padding: '13px 0', background: !joshuaPhoto || saving ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: !joshuaPhoto || saving ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: !joshuaPhoto ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
          {saving ? '⟳ Saving...' : '💾 Save Photo'}
        </button>
      </div>

      {/* Platform Info */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 14 }}>ℹ Platform Info</div>
        {[
          { l: 'Platform Version', v: 'v2.0.0' },
          { l: 'Framework', v: 'Next.js 14 App Router' },
          { l: 'Database', v: 'Supabase PostgreSQL' },
          { l: 'Hosting', v: 'Vercel' },
          { l: 'Email Provider', v: 'Resend' },
          { l: 'Domain', v: 'capitalmarket-pro.com' },
        ].map(item => (
          <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #161b22' }}>
            <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
            <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>{item.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
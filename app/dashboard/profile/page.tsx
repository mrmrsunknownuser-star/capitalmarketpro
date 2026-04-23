// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  var router = useRouter()
  var [user, setUser] = useState(null)
  var [editing, setEditing] = useState(false)
  var [phone, setPhone] = useState('')
  var [saving, setSaving] = useState(false)
  var [showDelete, setShowDelete] = useState(false)

  useEffect(function() {
    var supabase = createClient()
    supabase.auth.getUser().then(function(res) {
      if (!res.data.user) { router.push('/login'); return }
      supabase.from('users').select('*').eq('id', res.data.user.id).single().then(function(r) {
        if (r.data) { setUser(r.data); setPhone(r.data.phone || '') }
      })
    })
  }, [])

  async function savePhone() {
    setSaving(true)
    var supabase = createClient()
    await supabase.from('users').update({ phone: phone }).eq('id', user.id)
    setUser(Object.assign({}, user, { phone: phone }))
    setSaving(false)
    setEditing(false)
  }

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#060a0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #1e2530', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>

      {/* Header */}
      <div style={{ padding: '52px 20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={function() { router.back() }} style={{ width: 38, height: 38, borderRadius: 12, background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#8892a0' }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5' }}>My Profile</div>
      </div>

      {/* Avatar */}
      <div style={{ textAlign: 'center', padding: '0 20px 28px' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, color: '#060a0e', boxShadow: '0 8px 24px rgba(201,168,76,.3)' }}>
            {(user.full_name || user.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: '#0d1117', border: '2px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer' }}>📷</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5', marginBottom: 4 }}>{user.full_name || user.username || 'User'}</div>
        <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 8 }}>{user.email}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0d1117', border: '1px solid #1e2530', borderRadius: 100, padding: '6px 14px' }}>
          <span style={{ fontSize: 11, color: '#4a5568' }}>Unique ID —</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: G }}>CMP{user.id ? user.id.slice(0, 8).toUpperCase() : '00000000'}</span>
        </div>
      </div>

      {/* Profile sections */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Phone */}
        <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Phone Number</div>
          {editing ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={phone} onChange={function(e) { setPhone(e.target.value) }} style={{ flex: 1, background: '#141920', border: '1.5px solid #C9A84C', borderRadius: 10, padding: '10px 14px', color: '#e8edf5', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }} placeholder="+1 555 000 0000" />
              <button onClick={savePhone} disabled={saving} style={{ padding: '10px 18px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                {saving ? '...' : 'Save'}
              </button>
              <button onClick={function() { setEditing(false) }} style={{ padding: '10px 14px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 10, color: '#8892a0', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e8edf5' }}>{user.phone || 'Not set'}</div>
              <button onClick={function() { setEditing(true) }} style={{ background: 'none', border: 'none', color: G, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Edit</button>
            </div>
          )}
        </div>

        {/* Country */}
        <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Country</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e8edf5' }}>{user.country || 'Not set'}</div>
        </div>

        {/* Username */}
        <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Username</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e8edf5' }}>@{user.username || user.full_name || 'user'}</div>
        </div>

        {/* KYC */}
        <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>KYC Details</div>
              <div style={{ fontSize: 13, color: '#4a5568' }}>
                {user.kyc_status === 'approved' ? 'Identity verified successfully' : 'KYC is required for withdrawals'}
              </div>
            </div>
            {user.kyc_status !== 'approved' && (
              <Link href="/dashboard/kyc" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(201,168,76,.4)', borderRadius: 10, color: G, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>Verify KYC</button>
              </Link>
            )}
            {user.kyc_status === 'approved' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: 'rgba(46,204,113,.15)', color: '#2ecc71' }}>Verified ✓</span>
            )}
          </div>
        </div>

        {/* Account manager */}
        <div style={{ background: 'linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.03))', border: '1px solid rgba(201,168,76,.2)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0e', flexShrink: 0 }}>J</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>Josh — Your Account Manager</div>
            <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>Available 24/7 for premium support</div>
          </div>
          <Link href="/dashboard/support" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 14px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Chat</button>
          </Link>
        </div>

        {/* Delete account */}
        <button onClick={function() { setShowDelete(true) }} style={{ width: '100%', padding: '15px', background: 'transparent', border: 'none', color: '#e74c3c', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left', marginTop: 8 }}>
          DELETE MY USER PROFILE ⚠
        </button>

        {showDelete && (
          <div style={{ background: 'rgba(231,76,60,.08)', border: '1px solid rgba(231,76,60,.25)', borderRadius: 16, padding: '20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e74c3c', marginBottom: 8 }}>Are you sure?</div>
            <div style={{ fontSize: 13, color: '#8892a0', lineHeight: 1.7, marginBottom: 16 }}>This action is permanent and cannot be undone. All your data, balance and investments will be lost.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={function() { setShowDelete(false) }} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 10, color: '#8892a0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              <button style={{ flex: 1, padding: '12px', background: 'rgba(231,76,60,.15)', border: '1px solid rgba(231,76,60,.3)', borderRadius: 10, color: '#e74c3c', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Delete Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
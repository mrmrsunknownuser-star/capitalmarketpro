'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [btcAddress, setBtcAddress] = useState('')
  const [message, setMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = async () => {
  setLoading(true)
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })

  if (error) console.error('Users error:', error)
  setUsers(data || [])
  setLoading(false)
}

  useEffect(() => { fetchUsers() }, [])

  const update = async (userId: string, fields: any, log: string) => {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('users').update(fields).eq('id', userId)
    try {
      await supabase.from('audit_logs').insert({
        action: log,
        target_user_id: userId,
        details: fields,
      })
    } catch {}
    setMessage('✅ Updated successfully')
    await fetchUsers()
    if (selected?.id === userId) setSelected((prev: any) => ({ ...prev, ...fields }))
    setTimeout(() => setMessage(''), 3000)
    setActionLoading(false)
  }

  const notify = async (userId: string, title: string, msg: string) => {
    const supabase = createClient()
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message: msg,
      type: 'info',
      is_read: false,
    })
  }

  const sendEmail = async (to: string, type: string, data: any) => {
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, to, data }),
      })
    } catch {}
  }

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const sc = (s: string) => ({ active: '#3fb950', suspended: '#f85149', pending: '#F7A600' }[s] || '#484f58')
  const kc = (s: string) => ({ approved: '#3fb950', rejected: '#f85149', pending: '#F7A600', none: '#484f58' }[s] || '#484f58')

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>User Management</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>{users.length} total users</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#3fb950' }}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Total Users', v: users.length, c: '#e6edf3' },
          { l: 'Active', v: users.filter(u => u.status === 'active').length, c: '#3fb950' },
          { l: 'KYC Pending', v: users.filter(u => u.kyc_status === 'pending').length, c: '#F7A600' },
          { l: 'Suspended', v: users.filter(u => u.status === 'suspended').length, c: '#f85149' },
        ].map(s => (
          <div key={s.l} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: '#484f58', marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#484f58' }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '11px 14px 11px 40px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
          onFocus={e => e.target.style.borderColor = '#C9A84C'}
          onBlur={e => e.target.style.borderColor = '#21262d'}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#0a0e14', borderBottom: '1px solid #161b22' }}>
                {['User', 'Status', 'KYC', 'Tier', 'Joined', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>No users found</td></tr>
              ) : filtered.map((user, i) => (
                <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #161b22' : 'none' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#060a0f', flexShrink: 0, overflow: 'hidden' }}>
                        {user.avatar_url
                          ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (user.full_name || user.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>{user.full_name || 'No name'}</div>
                        <div style={{ fontSize: 11, color: '#484f58', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: sc(user.status), background: `${sc(user.status)}18`, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: kc(user.kyc_status), background: `${kc(user.kyc_status)}18`, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                      {user.kyc_status || 'none'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#8b949e', textTransform: 'capitalize' }}>
                    {user.tier || 'starter'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#484f58' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => { setSelected(user); setBtcAddress(user.btc_address || '') }}
                      style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #21262d', background: 'transparent', color: '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto', fontFamily: 'monospace' }}>

            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0d1117', zIndex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>Manage User</div>
              <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px' }}>

              {/* Profile */}
              <div style={{ background: '#161b22', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0 }}>
                    {selected.avatar_url
                      ? <img src={selected.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (selected.full_name || selected.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>{selected.full_name || 'No name'}</div>
                    <div style={{ fontSize: 12, color: '#484f58' }}>{selected.email}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { l: 'Status', v: selected.status || 'active' },
                    { l: 'KYC', v: selected.kyc_status || 'none' },
                    { l: 'Tier', v: selected.tier || 'starter' },
                  ].map(item => (
                    <div key={item.l} style={{ background: '#0d1117', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#484f58', marginBottom: 3, textTransform: 'uppercase' }}>{item.l}</div>
                      <div style={{ fontSize: 11, color: '#e6edf3', textTransform: 'capitalize' }}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BTC Address */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>₿ Bitcoin Withdrawal Address</div>
                <div style={{ fontSize: 11, color: '#484f58', marginBottom: 8 }}>
                  Current: <span style={{ color: selected.btc_address ? '#3fb950' : '#f85149', fontFamily: 'monospace', fontSize: 10 }}>
                    {selected.btc_address || 'Not set'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={btcAddress}
                    onChange={e => setBtcAddress(e.target.value)}
                    placeholder="Enter BTC address..."
                    style={{ flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '10px 12px', color: '#e6edf3', fontSize: 12, outline: 'none', fontFamily: 'monospace' }}
                    onFocus={e => e.target.style.borderColor = '#F7A600'}
                    onBlur={e => e.target.style.borderColor = '#30363d'}
                  />
                  <button
                    onClick={async () => {
                      if (!btcAddress) return
                      await update(selected.id, { btc_address: btcAddress }, 'BTC_ADDRESS_UPDATED')
                      await notify(selected.id, '🔑 Withdrawal Address Updated', 'Your Bitcoin withdrawal address has been updated.')
                      setBtcAddress('')
                    }}
                    disabled={actionLoading || !btcAddress}
                    style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#F7A600', color: '#060a0f', fontSize: 11, fontWeight: 800, cursor: 'pointer', opacity: !btcAddress ? 0.5 : 1 }}>
                    Save
                  </button>
                </div>
              </div>

              {/* Account Status */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Account Status</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { l: '✅ Active', s: 'active', c: '#3fb950' },
                    { l: '⏳ Pending', s: 'pending', c: '#F7A600' },
                    { l: '🔴 Suspend', s: 'suspended', c: '#f85149' },
                  ].map(a => (
                    <button
                      key={a.s}
                      onClick={() => update(selected.id, { status: a.s }, `USER_${a.s.toUpperCase()}`)}
                      disabled={actionLoading || selected.status === a.s}
                      style={{ padding: '10px 0', borderRadius: 8, border: `1px solid ${a.c}33`, background: selected.status === a.s ? `${a.c}18` : 'transparent', color: a.c, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                      {a.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* KYC */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>KYC Verification</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={async () => {
                      const supabase = createClient()
                      await update(selected.id, { kyc_status: 'approved', status: 'active' }, 'KYC_APPROVED')
                      await notify(selected.id, '✅ KYC Approved', 'Your identity has been verified. All features are now unlocked.')
                      try {
                        const { data: userData } = await supabase
                          .from('users')
                          .select('email, full_name')
                          .eq('id', selected.id)
                          .single()
                        if (userData?.email) {
                          await sendEmail(userData.email, 'kyc_approved', { name: userData.full_name })
                        }
                      } catch {}
                    }}
                    disabled={actionLoading}
                    style={{ padding: '11px 0', borderRadius: 8, border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.08)', color: '#3fb950', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                    ✅ Approve KYC
                  </button>
                  <button
                    onClick={async () => {
                      const supabase = createClient()
                      await update(selected.id, { kyc_status: 'rejected' }, 'KYC_REJECTED')
                      await notify(selected.id, '❌ KYC Rejected', 'Your documents were rejected. Please resubmit clearer photos.')
                      try {
                        const { data: userData } = await supabase
                          .from('users')
                          .select('email')
                          .eq('id', selected.id)
                          .single()
                        if (userData?.email) {
                          await sendEmail(userData.email, 'kyc_rejected', {})
                        }
                      } catch {}
                    }}
                    disabled={actionLoading}
                    style={{ padding: '11px 0', borderRadius: 8, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                    ❌ Reject KYC
                  </button>
                </div>
              </div>

              {/* Tier */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Account Tier</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { t: 'starter', c: '#484f58' },
                    { t: 'silver', c: '#8b949e' },
                    { t: 'gold', c: '#C9A84C' },
                    { t: 'platinum', c: '#0052FF' },
                    { t: 'elite', c: '#7B2BF9' },
                    { t: 'black', c: '#e6edf3' },
                  ].map(item => (
                    <button
                      key={item.t}
                      onClick={() => update(selected.id, { tier: item.t }, 'TIER_UPDATED')}
                      disabled={actionLoading}
                      style={{ padding: '9px 0', borderRadius: 8, border: `1px solid ${item.c}33`, background: selected.tier === item.t ? `${item.c}18` : 'transparent', color: item.c, fontSize: 11, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'monospace' }}>
                      {item.t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <a href="/admin/balances" onClick={() => setSelected(null)} style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                    💰 Set Balance
                  </button>
                </a>
                <button
                  onClick={async () => {
                    await notify(
                      selected.id,
                      '📣 Message from Admin',
                      'Our team has reviewed your account. Please contact support for details.'
                    )
                    setMessage('✅ Notification sent')
                    setTimeout(() => setMessage(''), 3000)
                  }}
                  style={{ padding: '11px 0', borderRadius: 10, border: '1px solid rgba(0,82,255,0.3)', background: 'rgba(0,82,255,0.08)', color: '#0052FF', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                  📣 Notify User
                </button>
              </div>

              {/* Send custom email */}
              <div style={{ background: '#161b22', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>Quick Email Actions:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => sendEmail(selected.email, 'welcome', { name: selected.full_name })}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                    📧 Welcome Email
                  </button>
                  <button
                    onClick={() => sendEmail(selected.email, 'kyc_approved', { name: selected.full_name })}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(63,185,80,0.2)', background: 'transparent', color: '#3fb950', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                    ✅ KYC Email
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
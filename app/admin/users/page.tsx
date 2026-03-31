'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type User = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  status: string
  kyc_status: string
  tier: string
  role: string
  created_at: string
  btc_address?: string | null
  avatar_url?: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [btcAddress, setBtcAddress] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const updateField = async (userId: string, fields: Record<string, any>, logAction: string) => {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('users').update(fields).eq('id', userId)
    try { await supabase.from('audit_logs').insert({ action: logAction, target_user_id: userId, details: fields }) } catch {}
    setMessage(`✅ Updated successfully`)
    await fetchUsers()
    if (selected?.id === userId) setSelected(prev => prev ? { ...prev, ...fields } : null)
    setTimeout(() => setMessage(''), 3000)
    setActionLoading(false)
  }

  const sendNotif = async (userId: string, title: string, msg: string, type = 'info') => {
    const supabase = createClient()
    await supabase.from('notifications').insert({ user_id: userId, title, message: msg, type })
  }

  const approveKYC = async () => {
    if (!selected) return
    await updateField(selected.id, { kyc_status: 'approved', status: 'active' }, 'KYC_APPROVED')
    await sendNotif(selected.id, '✅ Identity Verified', 'Your KYC has been approved. All platform features are now unlocked.', 'success')
    try {
      const supabase = createClient()
      const { data } = await supabase.from('users').select('email').eq('id', selected.id).single()
      if (data?.email) await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'kyc_approved', to: data.email, data: {} }) })
    } catch {}
  }

  const rejectKYC = async () => {
    if (!selected) return
    await updateField(selected.id, { kyc_status: 'rejected' }, 'KYC_REJECTED')
    await sendNotif(selected.id, '❌ KYC Rejected', 'Your documents were rejected. Please resubmit clearer photos.', 'warning')
  }

  const updateBTC = async () => {
    if (!selected || !btcAddress) return
    await updateField(selected.id, { btc_address: btcAddress }, 'BTC_ADDRESS_UPDATED')
    await sendNotif(selected.id, '🔑 Withdrawal Address Updated', 'Your Bitcoin withdrawal address has been updated. Contact support if you did not request this.', 'warning')
    setBtcAddress('')
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      u.status === filter ||
      u.kyc_status === filter ||
      u.role === filter
    return matchSearch && matchFilter
  })

  const statusColor = (s: string) => ({ active: '#3fb950', suspended: '#f85149', pending: '#F7A600' }[s] || '#484f58')
  const kycColor = (s: string) => ({ approved: '#3fb950', rejected: '#f85149', pending: '#F7A600', none: '#484f58' }[s] || '#484f58')
  const tierColor = (t: string) => ({ black: '#e6edf3', elite: '#7B2BF9', platinum: '#0052FF', gold: '#C9A84C', silver: '#8b949e', starter: '#484f58' }[t] || '#484f58')

  return (
    <>
      <style>{`
        .users-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .users-table th { text-align: left; padding: 12px 14px; font-size: 10px; color: #484f58; letter-spacing: 0.08em; text-transform: uppercase; background: #0a0e14; border-bottom: 1px solid #161b22; }
        .users-table td { padding: 12px 14px; border-bottom: 1px solid #161b22; vertical-align: middle; }
        .users-table tr:hover td { background: rgba(255,255,255,0.01); }
        .badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; }
        .input { width: 100%; background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 10px 12px; color: #e6edf3; font-size: 12px; outline: none; font-family: monospace; box-sizing: border-box; }
        .input:focus { border-color: #C9A84C; }
        .btn { padding: 9px 0; border-radius: 8px; font-size: 11px; cursor: pointer; font-family: monospace; font-weight: 700; border: 1px solid; }
        @media (max-width: 768px) {
          .desktop-cols { display: none; }
        }
      `}</style>

      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>User Management</div>
          <div style={{ fontSize: 13, color: '#484f58' }}>
            {users.length} total · {users.filter(u => u.status === 'active').length} active · {users.filter(u => u.kyc_status === 'pending').length} pending KYC
          </div>
        </div>

        {message && (
          <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#3fb950' }}>{message}</div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Users', value: users.length, color: '#e6edf3' },
            { label: 'Active', value: users.filter(u => u.status === 'active').length, color: '#3fb950' },
            { label: 'KYC Pending', value: users.filter(u => u.kyc_status === 'pending').length, color: '#F7A600' },
            { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, color: '#f85149' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#484f58', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by name or email..."
            style={{ flex: 1, minWidth: 200, background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: '10px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'active', 'pending', 'suspended', 'approved', 'none'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${filter === f ? '#C9A84C' : '#21262d'}`, background: filter === f ? 'rgba(201,168,76,0.1)' : 'transparent', color: filter === f ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'monospace' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>KYC</th>
                  <th className="desktop-cols">Tier</th>
                  <th className="desktop-cols">BTC Address</th>
                  <th className="desktop-cols">Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading users...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                    No users found
                  </td></tr>
                ) : filtered.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', flexShrink: 0, overflow: 'hidden' }}>
                          {user.avatar_url ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.full_name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500, whiteSpace: 'nowrap' }}>{user.full_name || 'No name'}</div>
                          <div style={{ fontSize: 11, color: '#484f58', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ color: statusColor(user.status), background: `${statusColor(user.status)}18` }}>{user.status}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ color: kycColor(user.kyc_status), background: `${kycColor(user.kyc_status)}18` }}>{user.kyc_status}</span>
                    </td>
                    <td className="desktop-cols">
                      <span style={{ fontSize: 11, color: tierColor(user.tier), textTransform: 'capitalize' }}>{user.tier}</span>
                    </td>
                    <td className="desktop-cols">
                      <span style={{ fontSize: 10, color: user.btc_address ? '#3fb950' : '#484f58', fontFamily: 'monospace' }}>
                        {user.btc_address ? user.btc_address.slice(0, 14) + '...' : '—'}
                      </span>
                    </td>
                    <td className="desktop-cols">
                      <span style={{ fontSize: 11, color: '#484f58' }}>{new Date(user.created_at).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => { setSelected(user); setBtcAddress(user.btc_address || '') }}
                        style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #30363d', background: 'transparent', color: '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manage User Modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
            <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto', fontFamily: 'monospace' }}>

              {/* Modal Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0d1117', zIndex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>Manage User</div>
                <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {/* User Profile */}
                <div style={{ background: '#161b22', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0 }}>
                      {selected.avatar_url ? <img src={selected.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (selected.full_name || selected.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 3 }}>{selected.full_name || 'No name set'}</div>
                      <div style={{ fontSize: 12, color: '#484f58' }}>{selected.email}</div>
                      {selected.phone && <div style={{ fontSize: 11, color: '#484f58', marginTop: 2 }}>📱 {selected.phone}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[{ l: 'Status', v: selected.status }, { l: 'KYC', v: selected.kyc_status }, { l: 'Tier', v: selected.tier }].map(item => (
                      <div key={item.l} style={{ background: '#0d1117', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: '#484f58', marginBottom: 3, textTransform: 'uppercase' }}>{item.l}</div>
                        <div style={{ fontSize: 11, color: '#e6edf3', textTransform: 'capitalize' }}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BTC Address */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 6 }}>₿ Bitcoin Withdrawal Address</div>
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 8 }}>
                    Current: <span style={{ color: selected.btc_address ? '#3fb950' : '#f85149', fontFamily: 'monospace', fontSize: 10 }}>{selected.btc_address || 'Not set'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" value={btcAddress} onChange={e => setBtcAddress(e.target.value)} placeholder="Enter new BTC address..." />
                    <button onClick={updateBTC} disabled={actionLoading || !btcAddress} style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#F7A600', color: '#060a0f', fontSize: 11, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', opacity: !btcAddress ? 0.5 : 1 }}>
                      Update
                    </button>
                  </div>
                  <div style={{ fontSize: 10, color: '#484f58', marginTop: 5 }}>⚠ User will be notified of this change</div>
                </div>

                {/* Account Status */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Account Status</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { label: '✅ Active', s: 'active', color: '#3fb950' },
                      { label: '⏳ Pending', s: 'pending', color: '#F7A600' },
                      { label: '🔴 Suspend', s: 'suspended', color: '#f85149' },
                    ].map(a => (
                      <button key={a.s} onClick={() => updateField(selected.id, { status: a.s }, `USER_${a.s.toUpperCase()}`)} disabled={actionLoading || selected.status === a.s}
                        style={{ padding: '10px 0', borderRadius: 8, border: `1px solid ${a.color}33`, background: selected.status === a.s ? `${a.color}18` : 'transparent', color: a.color, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', opacity: actionLoading ? 0.5 : 1 }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KYC */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>KYC Verification</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={approveKYC} disabled={actionLoading} style={{ padding: '11px 0', borderRadius: 8, border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.08)', color: '#3fb950', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                      ✅ Approve KYC
                    </button>
                    <button onClick={rejectKYC} disabled={actionLoading} style={{ padding: '11px 0', borderRadius: 8, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                      ❌ Reject KYC
                    </button>
                  </div>
                </div>

                {/* Tier */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Account Tier</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { t: 'starter', color: '#484f58' },
                      { t: 'silver', color: '#8b949e' },
                      { t: 'gold', color: '#C9A84C' },
                      { t: 'platinum', color: '#0052FF' },
                      { t: 'elite', color: '#7B2BF9' },
                      { t: 'black', color: '#e6edf3' },
                    ].map(item => (
                      <button key={item.t} onClick={() => updateField(selected.id, { tier: item.t }, 'TIER_UPDATED')}
                        style={{ padding: '9px 0', borderRadius: 8, border: `1px solid ${item.color}33`, background: selected.tier === item.t ? `${item.color}18` : 'transparent', color: item.color, fontSize: 11, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'monospace' }}>
                        {item.t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <a href="/admin/balances" onClick={() => setSelected(null)} style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                      💰 Set Balance
                    </button>
                  </a>
                  <button onClick={() => { sendNotif(selected.id, '📣 Message from Support', 'Our team has reviewed your account. Please contact support for more details.'); setMessage('✅ Notification sent') }}
                    style={{ padding: '11px 0', borderRadius: 10, border: '1px solid rgba(0,82,255,0.3)', background: 'rgba(0,82,255,0.08)', color: '#0052FF', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                    📣 Notify User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
    const supabase = createClient()
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const updateStatus = async (userId: string, status: string) => {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({ status }).eq('id', userId)
    await supabase.from('audit_logs').insert({ action: `USER_${status.toUpperCase()}`, target_user_id: userId, details: { status } })
    setMessage(`User ${status} successfully`)
    fetchUsers()
    setTimeout(() => setMessage(''), 3000)
    setActionLoading(false)
  }

  const updateKYC = async (userId: string, kyc_status: string) => {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({ kyc_status, ...(kyc_status === 'approved' ? { status: 'active' } : {}) }).eq('id', userId)
    const { data: userData } = await supabase.from('users').select('email').eq('id', userId).single()
    if (userData?.email) {
      await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'kyc_approved', to: userData.email, data: {} }) })
    }
    await supabase.from('notifications').insert({ user_id: userId, title: kyc_status === 'approved' ? '✅ KYC Approved' : '❌ KYC Rejected', message: kyc_status === 'approved' ? 'Your identity has been verified. All features are now unlocked.' : 'Your KYC was rejected. Please resubmit clearer documents.', type: kyc_status === 'approved' ? 'success' : 'warning' })
    setMessage(`KYC ${kyc_status}`)
    fetchUsers()
    if (selected) setSelected({ ...selected, kyc_status })
    setTimeout(() => setMessage(''), 3000)
    setActionLoading(false)
  }

  const updateTier = async (userId: string, tier: string) => {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({ tier }).eq('id', userId)
    setMessage(`Tier updated to ${tier}`)
    fetchUsers()
    if (selected) setSelected({ ...selected, tier })
    setTimeout(() => setMessage(''), 3000)
    setActionLoading(false)
  }

  const updateBTCAddress = async () => {
    if (!selected) return
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({ btc_address: btcAddress }).eq('id', selected.id)
    await supabase.from('audit_logs').insert({ action: 'BTC_ADDRESS_UPDATED', target_user_id: selected.id, details: { btc_address: btcAddress } })
    await supabase.from('notifications').insert({ user_id: selected.id, title: '🔑 Withdrawal Address Updated', message: 'Your Bitcoin withdrawal address has been updated by our team. Contact support if this was not requested.', type: 'warning' })
    setMessage('BTC address updated successfully')
    setBtcAddress('')
    fetchUsers()
    setSelected({ ...selected, btc_address: btcAddress })
    setTimeout(() => setMessage(''), 3000)
    setActionLoading(false)
  }

  const impersonateUser = async (userId: string) => {
    window.open(`/dashboard?admin_view=${userId}`, '_blank')
  }

  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) || (u.full_name?.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'all' || u.status === filter || u.kyc_status === filter
    return matchSearch && matchFilter
  })

  const statusColor = (s: string) => s === 'active' ? '#3fb950' : s === 'suspended' ? '#f85149' : '#F7A600'
  const kycColor = (s: string) => s === 'approved' ? '#3fb950' : s === 'rejected' ? '#f85149' : s === 'pending' ? '#F7A600' : '#484f58'
  const tierColor = (t: string) => t === 'platinum' ? '#E8D08C' : t === 'gold' ? '#C9A84C' : t === 'silver' ? '#8b949e' : '#484f58'

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>User Management</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>{users.length} total users · {users.filter(u => u.status === 'active').length} active</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>✅ {message}</div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ flex: 1, minWidth: 200, background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: '10px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace' }} />
        {['all', 'pending', 'active', 'suspended', 'approved', 'none'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid', borderColor: filter === f ? '#C9A84C' : '#21262d', background: filter === f ? 'rgba(201,168,76,0.1)' : 'transparent', color: filter === f ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'monospace' }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #161b22', background: '#0a0e14' }}>
                {['User', 'Status', 'KYC', 'Tier', 'BTC Address', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>No users found</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #161b22' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
                        {(user.full_name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>{user.full_name || 'No name'}</div>
                        <div style={{ fontSize: 11, color: '#484f58' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(user.status), background: `${statusColor(user.status)}18`, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>{user.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: kycColor(user.kyc_status), background: `${kycColor(user.kyc_status)}18`, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>{user.kyc_status}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 11, color: tierColor(user.tier), textTransform: 'capitalize' }}>{user.tier}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, color: user.btc_address ? '#3fb950' : '#484f58', fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.btc_address ? user.btc_address.slice(0, 16) + '...' : 'Not set'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 11, color: '#484f58' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => { setSelected(user); setBtcAddress(user.btc_address || '') }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 520, padding: 28, maxHeight: '90vh', overflowY: 'auto', fontFamily: 'monospace' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>Manage User</div>
              <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 32, height: 32, fontSize: 16 }}>✕</button>
            </div>

            {/* User info */}
            <div style={{ background: '#161b22', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#060a0f' }}>
                  {(selected.full_name || selected.email)[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>{selected.full_name || 'No name'}</div>
                  <div style={{ fontSize: 12, color: '#484f58' }}>{selected.email}</div>
                  {selected.phone && <div style={{ fontSize: 11, color: '#484f58' }}>📱 {selected.phone}</div>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Status', value: selected.status },
                  { label: 'KYC', value: selected.kyc_status },
                  { label: 'Tier', value: selected.tier },
                  { label: 'Role', value: selected.role },
                ].map(item => (
                  <div key={item.label} style={{ background: '#0d1117', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 9, color: '#484f58', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#e6edf3', textTransform: 'capitalize' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* BTC Address — KEY FEATURE */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>₿ Bitcoin Withdrawal Address</div>
              <div style={{ fontSize: 11, color: '#484f58', marginBottom: 10 }}>
                Current: <span style={{ color: selected.btc_address ? '#3fb950' : '#f85149', fontFamily: 'monospace' }}>
                  {selected.btc_address || 'Not set'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={btcAddress}
                  onChange={e => setBtcAddress(e.target.value)}
                  placeholder="Enter new BTC address..."
                  style={{ flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '11px 14px', color: '#e6edf3', fontSize: 12, outline: 'none', fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = '#F7A600'}
                  onBlur={e => e.target.style.borderColor = '#30363d'}
                />
                <button onClick={updateBTCAddress} disabled={actionLoading || !btcAddress} style={{ padding: '0 16px', borderRadius: 8, border: 'none', background: '#F7A600', color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', opacity: !btcAddress ? 0.5 : 1 }}>
                  Update
                </button>
              </div>
              <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>
                ⚠ Changing this address will override the user's withdrawal destination. User will be notified.
              </div>
            </div>

            {/* Account Status */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Account Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: '✅ Activate', status: 'active', color: '#3fb950' },
                  { label: '🔴 Suspend', status: 'suspended', color: '#f85149' },
                  { label: '⏳ Pending', status: 'pending', color: '#F7A600' },
                ].map(a => (
                  <button key={a.status} onClick={() => updateStatus(selected.id, a.status)} disabled={actionLoading || selected.status === a.status} style={{ padding: '10px 0', borderRadius: 8, border: `1px solid ${a.color}33`, background: selected.status === a.status ? `${a.color}18` : 'transparent', color: a.color, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', opacity: actionLoading ? 0.5 : 1 }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* KYC */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>KYC Verification</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={() => updateKYC(selected.id, 'approved')} disabled={actionLoading} style={{ padding: '10px 0', borderRadius: 8, border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.08)', color: '#3fb950', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>✅ Approve KYC</button>
                <button onClick={() => updateKYC(selected.id, 'rejected')} disabled={actionLoading} style={{ padding: '10px 0', borderRadius: 8, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>❌ Reject KYC</button>
              </div>
            </div>

            {/* Tier */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Account Tier</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {['starter', 'silver', 'gold', 'platinum'].map(tier => (
                  <button key={tier} onClick={() => updateTier(selected.id, tier)} style={{ padding: '9px 0', borderRadius: 8, border: `1px solid ${tierColor(tier)}33`, background: selected.tier === tier ? `${tierColor(tier)}18` : 'transparent', color: tierColor(tier), fontSize: 11, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'monospace' }}>
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Link href={`/admin/balances`} style={{ textDecoration: 'none' }}>
                <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                  💰 Set Balance
                </button>
              </Link>
              <button onClick={() => impersonateUser(selected.id)} style={{ padding: '11px 0', borderRadius: 10, border: '1px solid rgba(0,82,255,0.3)', background: 'rgba(0,82,255,0.08)', color: '#0052FF', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                👁 View as User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
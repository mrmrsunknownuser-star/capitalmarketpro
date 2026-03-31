'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type User = {
  id: string
  email: string
  full_name: string | null
  status: string
  kyc_status: string
  tier: string
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const updateUserStatus = async (userId: string, status: string) => {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({ status }).eq('id', userId)
    setMessage(`User ${status} successfully`)
    fetchUsers()
    setSelectedUser(null)
    setActionLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const updateKYC = async (userId: string, kyc_status: string) => {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({ kyc_status }).eq('id', userId)
    if (kyc_status === 'approved') {
      await supabase.from('users').update({ status: 'active' }).eq('id', userId)
    }
    setMessage(`KYC ${kyc_status} successfully`)
    fetchUsers()
    setSelectedUser(null)
    setActionLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const filteredUsers = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name?.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'all' || u.status === filter
    return matchSearch && matchFilter
  })

  const statusColor = (s: string) => s === 'active' ? '#3fb950' : s === 'suspended' ? '#f85149' : '#F7A600'
  const kycColor = (s: string) => s === 'approved' ? '#3fb950' : s === 'rejected' ? '#f85149' : s === 'pending' ? '#F7A600' : '#484f58'
  const tierColor = (t: string) => t === 'platinum' ? '#E8D08C' : t === 'gold' ? '#C9A84C' : t === 'silver' ? '#8b949e' : '#484f58'

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>User Management</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>View, manage and control all platform users</div>
      </div>

      {/* Success message */}
      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          ✅ {message}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ flex: 1, background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: '10px 16px', color: '#e6edf3', fontSize: 13, outline: 'none' }}
        />
        {['all', 'pending', 'active', 'suspended'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid',
              borderColor: filter === f ? '#C9A84C' : '#21262d',
              background: filter === f ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: filter === f ? '#C9A84C' : '#8b949e',
              fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
            }}
          >{f}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #161b22', background: '#0a0e14' }}>
              {['User', 'Status', 'KYC', 'Tier', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#484f58', fontSize: 13 }}>Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#484f58', fontSize: 13 }}>No users found</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #161b22' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#060a0f', flexShrink: 0 }}>
                      {(user.full_name || user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>{user.full_name || 'No name'}</div>
                      <div style={{ fontSize: 11, color: '#484f58' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(user.status), background: `${statusColor(user.status)}18`, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: kycColor(user.kyc_status), background: `${kycColor(user.kyc_status)}18`, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                    {user.kyc_status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 11, color: tierColor(user.tier), textTransform: 'capitalize' }}>{user.tier}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 11, color: '#484f58' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => setSelectedUser(user)}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer' }}
                  >
                    Manage →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null) }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>Manage User</div>
              <button onClick={() => setSelectedUser(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 32, height: 32, fontSize: 14 }}>✕</button>
            </div>

            {/* User Info */}
            <div style={{ background: '#161b22', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#060a0f' }}>
                  {(selectedUser.full_name || selectedUser.email)[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{selectedUser.full_name || 'No name'}</div>
                  <div style={{ fontSize: 12, color: '#8b949e' }}>{selectedUser.email}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Status', value: selectedUser.status },
                  { label: 'KYC', value: selectedUser.kyc_status },
                  { label: 'Tier', value: selectedUser.tier },
                  { label: 'Role', value: selectedUser.role },
                ].map(item => (
                  <div key={item.label} style={{ background: '#0d1117', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: '#484f58', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#e6edf3', textTransform: 'capitalize' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Actions */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Account Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Activate', status: 'active', color: '#3fb950' },
                  { label: 'Suspend', status: 'suspended', color: '#f85149' },
                  { label: 'Pending', status: 'pending', color: '#F7A600' },
                ].map(action => (
                  <button
                    key={action.status}
                    onClick={() => updateUserStatus(selectedUser.id, action.status)}
                    disabled={actionLoading || selectedUser.status === action.status}
                    style={{
                      padding: '10px 0', borderRadius: 8,
                      border: `1px solid ${action.color}33`,
                      background: selectedUser.status === action.status ? `${action.color}18` : 'transparent',
                      color: action.color, fontSize: 12, cursor: 'pointer',
                      opacity: actionLoading ? 0.5 : 1,
                    }}
                  >{action.label}</button>
                ))}
              </div>
            </div>

            {/* KYC Actions */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>KYC Verification</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: '✅ Approve KYC', status: 'approved', color: '#3fb950' },
                  { label: '❌ Reject KYC', status: 'rejected', color: '#f85149' },
                ].map(action => (
                  <button
                    key={action.status}
                    onClick={() => updateKYC(selectedUser.id, action.status)}
                    disabled={actionLoading}
                    style={{
                      padding: '10px 0', borderRadius: 8,
                      border: `1px solid ${action.color}33`,
                      background: `${action.color}0d`,
                      color: action.color, fontSize: 12, cursor: 'pointer',
                      opacity: actionLoading ? 0.5 : 1,
                    }}
                  >{action.label}</button>
                ))}
              </div>
            </div>

            {/* Tier Update */}
            <div>
              <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Account Tier</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {['starter', 'silver', 'gold', 'platinum'].map(tier => (
                  <button
                    key={tier}
                    onClick={async () => {
                      const supabase = createClient()
                      await supabase.from('users').update({ tier }).eq('id', selectedUser.id)
                      setMessage(`Tier updated to ${tier}`)
                      fetchUsers()
                      setSelectedUser(null)
                      setTimeout(() => setMessage(''), 3000)
                    }}
                    style={{
                      padding: '8px 0', borderRadius: 8,
                      border: `1px solid ${tierColor(tier)}33`,
                      background: selectedUser.tier === tier ? `${tierColor(tier)}18` : 'transparent',
                      color: tierColor(tier), fontSize: 11, cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >{tier}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
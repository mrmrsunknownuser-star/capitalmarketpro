'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Withdrawal = {
  id: string
  request_id: string
  amount: number
  currency: string
  wallet_address: string
  network: string
  status: string
  admin_note: string | null
  created_at: string
  user: {
    email: string
    full_name: string | null
  }
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<Withdrawal | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchWithdrawals = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('withdrawal_requests')
      .select(`*, user:users(email, full_name)`)
      .order('created_at', { ascending: false })
    setWithdrawals(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchWithdrawals() }, [])

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selected) return
    setActionLoading(true)
    const supabase = createClient()

await supabase.from('withdrawal_requests').update({
  status,
  admin_note: adminNote || null,
  reviewed_at: new Date().toISOString(),
}).eq('id', selected.id)

// Send email notification to user
const { data: userData } = await supabase
  .from('users')
  .select('email')
  .eq('id', selected.id)
  .single()

if (userData?.email) {
  await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected',
      to: userData.email,
      data: {
        amount: selected.amount,
        requestId: selected.request_id,
        wallet: selected.wallet_address,
        network: selected.network,
        reason: adminNote || null,
      }
    })
  })
}

// Send notification to user
await supabase.from('notifications').insert({
  user_id: selected.id,
  title: status === 'approved' ? '✅ Withdrawal Approved' : '❌ Withdrawal Rejected',
  message: status === 'approved'
    ? `Your withdrawal of $${selected.amount} has been approved and is being processed.`
    : `Your withdrawal of $${selected.amount} was rejected. ${adminNote ? `Reason: ${adminNote}` : ''}`,
  type: status === 'approved' ? 'success' : 'warning',
})

    // Audit log
    await supabase.from('audit_logs').insert({
      action: `WITHDRAWAL_${status.toUpperCase()}`,
      target_user_id: selected.id,
      details: { amount: selected.amount, currency: selected.currency, admin_note: adminNote },
    })

    setMessage(`Withdrawal ${status} successfully!`)
    setSelected(null)
    setAdminNote('')
    fetchWithdrawals()
    setActionLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const filtered = withdrawals.filter(w => filter === 'all' || w.status === filter)

  const statusColor = (s: string) => s === 'approved' ? '#3fb950' : s === 'rejected' ? '#f85149' : '#F7A600'

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Withdrawal Requests</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Approve or reject user withdrawal requests</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          ✅ {message}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Pending', count: withdrawals.filter(w => w.status === 'pending').length, color: '#F7A600' },
          { label: 'Approved', count: withdrawals.filter(w => w.status === 'approved').length, color: '#3fb950' },
          { label: 'Rejected', count: withdrawals.filter(w => w.status === 'rejected').length, color: '#f85149' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d1117', border: `1px solid ${s.color}22`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.count}</div>
            <div style={{ fontSize: 12, color: '#8b949e' }}>{s.label} Withdrawals</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
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
              {['Request ID', 'User', 'Amount', 'Wallet', 'Network', 'Status', 'Date', 'Action'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>No withdrawals found</td></tr>
            ) : filtered.map((w) => (
              <tr key={w.id} style={{ borderBottom: '1px solid #161b22' }}>
                <td style={{ padding: '14px 16px', fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>{w.request_id}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, color: '#e6edf3' }}>{w.user?.full_name || 'No name'}</div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>{w.user?.email}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>
                  ${w.amount.toLocaleString()}
                  <div style={{ fontSize: 10, color: '#484f58' }}>{w.currency}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: '#8b949e', fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.wallet_address}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 11, color: '#8b949e' }}>{w.network}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(w.status), background: `${statusColor(w.status)}18`, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                    {w.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 11, color: '#484f58' }}>
                  {new Date(w.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {w.status === 'pending' && (
                    <button
                      onClick={() => { setSelected(w); setAdminNote('') }}
                      style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #F7A600', background: 'rgba(247,166,0,0.08)', color: '#F7A600', fontSize: 11, cursor: 'pointer' }}
                    >
                      Review →
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>Review Withdrawal</div>
              <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 32, height: 32, fontSize: 14 }}>✕</button>
            </div>

            {/* Details */}
            <div style={{ background: '#161b22', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              {[
                { label: 'Request ID', value: selected.request_id },
                { label: 'User', value: selected.user?.email },
                { label: 'Amount', value: `$${selected.amount.toLocaleString()} ${selected.currency}` },
                { label: 'Network', value: selected.network },
                { label: 'Wallet Address', value: selected.wallet_address },
                { label: 'Submitted', value: new Date(selected.created_at).toLocaleString() },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #21262d' }}>
                  <span style={{ fontSize: 11, color: '#484f58' }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: '#e6edf3', maxWidth: 260, textAlign: 'right', wordBreak: 'break-all' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Admin Note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Admin Note (optional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Reason for rejection or approval note..."
                rows={3}
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '10px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => handleAction('rejected')}
                disabled={actionLoading}
                style={{ padding: '13px 0', borderRadius: 10, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: actionLoading ? 0.6 : 1 }}
              >
                ❌ Reject
              </button>
              <button
                onClick={() => handleAction('approved')}
                disabled={actionLoading}
                style={{ padding: '13px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3fb950, #2ea043)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: actionLoading ? 0.6 : 1 }}
              >
                ✅ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
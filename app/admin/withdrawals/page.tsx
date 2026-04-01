'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('pending')

  const fetchRequests = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('withdrawal_requests')
      .select('*, user:users(email, full_name, btc_address)')
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchRequests() }, [])

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selected) return
    setActionLoading(true)
    const supabase = createClient()

    await supabase.from('withdrawal_requests').update({ status, admin_note: note, processed_at: new Date().toISOString() }).eq('id', selected.id)

    await supabase.from('notifications').insert({
      user_id: selected.user_id,
      title: status === 'approved' ? '✅ Withdrawal Approved' : '❌ Withdrawal Rejected',
      message: status === 'approved'
        ? `Your withdrawal of $${selected.amount} has been approved and is being processed.`
        : `Your withdrawal of $${selected.amount} was rejected. ${note ? 'Reason: ' + note : 'Please contact support.'}`,
      type: status === 'approved' ? 'success' : 'warning',
      is_read: false,
    })

    try {
      const { data: userData } = await supabase.from('users').select('email').eq('id', selected.user_id).single()
      if (userData?.email) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected',
            to: userData.email,
            data: { amount: selected.amount, requestId: selected.id, wallet: selected.wallet_address, network: selected.network, reason: note },
          })
        })
      }
    } catch {}

    try {
      await supabase.from('audit_logs').insert({ action: `WITHDRAWAL_${status.toUpperCase()}`, details: { id: selected.id, amount: selected.amount, note } })
    } catch {}

    setMessage(`✅ Withdrawal ${status}`)
    setTimeout(() => setMessage(''), 3000)
    setSelected(null)
    setNote('')
    setActionLoading(false)
    fetchRequests()
  }

  const filtered = requests.filter(r => filter === 'all' || r.status === filter)
  const statusColor = (s: string) => ({ pending: '#F7A600', approved: '#3fb950', rejected: '#f85149' }[s] || '#484f58')

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Withdrawal Requests</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>{requests.filter(r => r.status === 'pending').length} pending · {requests.length} total</div>
      </div>

      {message && <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#3fb950' }}>{message}</div>}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: filter === f ? 'rgba(201,168,76,0.15)' : 'transparent', color: filter === f ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', textTransform: 'capitalize', fontWeight: filter === f ? 700 : 400 }}>
            {f} {f === 'pending' && requests.filter(r => r.status === 'pending').length > 0 ? `(${requests.filter(r => r.status === 'pending').length})` : ''}
          </button>
        ))}
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#0a0e14', borderBottom: '1px solid #161b22' }}>
                {['User', 'Amount', 'Wallet', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>No {filter} requests</td></tr>
              ) : filtered.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #161b22' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>{req.user?.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>{req.user?.email}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C' }}>${req.amount?.toLocaleString()}</div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 10, color: '#484f58', fontFamily: 'monospace', maxWidth: 120 }}>
                    {req.wallet_address ? req.wallet_address.slice(0, 16) + '...' : req.user?.btc_address ? req.user.btc_address.slice(0, 16) + '...' : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(req.status), background: `${statusColor(req.status)}18`, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>{req.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#484f58' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => { setSelected(req); setNote('') }}
                      style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${req.status === 'pending' ? '#F7A600' : '#21262d'}`, background: 'transparent', color: req.status === 'pending' ? '#F7A600' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                      {req.status === 'pending' ? 'Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selected && (
        <div onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 460, padding: 28, fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>Review Withdrawal</div>
              <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
            </div>

            {[
              { l: 'User', v: selected.user?.email },
              { l: 'Amount', v: `$${selected.amount?.toLocaleString()}` },
              { l: 'Wallet', v: selected.wallet_address || selected.user?.btc_address || 'Not set' },
              { l: 'Network', v: selected.network || 'Bitcoin' },
              { l: 'Status', v: selected.status },
              { l: 'Requested', v: new Date(selected.created_at).toLocaleString() },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22' }}>
                <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500, maxWidth: 250, wordBreak: 'break-all', textAlign: 'right', fontFamily: item.l === 'Wallet' ? 'monospace' : 'inherit' }}>{item.v}</span>
              </div>
            ))}

            {selected.status === 'pending' && (
              <>
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Note (optional)</label>
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for the user..."
                    style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                    onFocus={e => e.target.style.borderColor = '#C9A84C'}
                    onBlur={e => e.target.style.borderColor = '#30363d'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => handleAction('rejected')} disabled={actionLoading}
                    style={{ padding: '13px 0', borderRadius: 12, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', opacity: actionLoading ? 0.5 : 1 }}>
                    ❌ Reject
                  </button>
                  <button onClick={() => handleAction('approved')} disabled={actionLoading}
                    style={{ padding: '13px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3fb950,#2ea043)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', opacity: actionLoading ? 0.5 : 1 }}>
                    ✅ Approve
                  </button>
                </div>
              </>
            )}

            {selected.status !== 'pending' && (
              <div style={{ marginTop: 16, background: `${statusColor(selected.status)}0d`, border: `1px solid ${statusColor(selected.status)}33`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: statusColor(selected.status) }}>
                  {selected.status === 'approved' ? '✅ This withdrawal was approved' : '❌ This withdrawal was rejected'}
                </div>
                {selected.admin_note && <div style={{ fontSize: 12, color: '#8b949e', marginTop: 6 }}>Note: {selected.admin_note}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
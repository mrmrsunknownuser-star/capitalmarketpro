'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<any>(null)
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  const fetchWithdrawals = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: wds, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Withdrawals fetch error:', error.message)
      setLoading(false)
      return
    }

    if (!wds || wds.length === 0) {
      setWithdrawals([])
      setLoading(false)
      return
    }

    // Fetch each user separately
    const withUsers = await Promise.all(
      wds.map(async wd => {
        try {
          const { data: user } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url, btc_address')
            .eq('id', wd.user_id)
            .single()
          return { ...wd, user: user || null }
        } catch {
          return { ...wd, user: null }
        }
      })
    )

    setWithdrawals(withUsers)
    setLoading(false)
  }

  useEffect(() => {
    fetchWithdrawals()
    const supabase = createClient()
    supabase.channel('admin-withdrawals-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, () => fetchWithdrawals())
      .subscribe()
  }, [])

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selected) return
    setActionLoading(true)
    const supabase = createClient()

    await supabase
      .from('withdrawal_requests')
      .update({ status, admin_note: note, updated_at: new Date().toISOString() })
      .eq('id', selected.id)

    if (status === 'rejected') {
      // Refund balance on rejection
      const { data: bal } = await supabase
        .from('balances')
        .select('total_balance, available_balance')
        .eq('user_id', selected.user_id)
        .single()

      await supabase.from('balances').update({
        total_balance: (bal?.total_balance || 0) + selected.amount,
        available_balance: (bal?.available_balance || 0) + selected.amount,
        updated_at: new Date().toISOString(),
      }).eq('user_id', selected.user_id)
    }

    await supabase.from('notifications').insert({
      user_id: selected.user_id,
      title: status === 'approved' ? '✅ Withdrawal Approved!' : '❌ Withdrawal Rejected',
      message: status === 'approved'
        ? `Your withdrawal of $${selected.amount?.toLocaleString()} has been approved and is being processed. Funds arrive within 24 hours.`
        : `Your withdrawal of $${selected.amount?.toLocaleString()} was rejected. ${note ? 'Reason: ' + note : ''} ${status === 'rejected' ? 'Your balance has been refunded.' : ''}`,
      type: status === 'approved' ? 'success' : 'warning',
      is_read: false,
      recipient_role: 'user',
    })

    // Send email
    try {
      if (selected.user?.email) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected',
            to: selected.user.email,
            data: { amount: selected.amount, network: selected.network, wallet: selected.wallet_address, reason: note },
          }),
        })
      }
    } catch {}

    try {
      await supabase.from('audit_logs').insert({
        action: `WITHDRAWAL_${status.toUpperCase()}`,
        target_user_id: selected.user_id,
        details: { amount: selected.amount, network: selected.network, note },
      })
    } catch {}

    setMessage(`✅ Withdrawal ${status}${status === 'rejected' ? ' — balance refunded' : ' — processing payment'}`)
    setTimeout(() => setMessage(''), 5000)
    setSelected(null)
    setNote('')
    setActionLoading(false)
    setTimeout(() => fetchWithdrawals(), 800)
  }

  const filtered = withdrawals.filter(w => {
    const matchFilter = filter === 'all' || w.status === filter
    const matchSearch = !search
      || (w.user?.email || '').toLowerCase().includes(search.toLowerCase())
      || (w.user?.full_name || '').toLowerCase().includes(search.toLowerCase())
      || (w.wallet_address || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const sc = (s: string) => ({ pending: '#F7A600', approved: '#3fb950', rejected: '#f85149' }[s] || '#484f58')
  const si = (s: string) => ({ pending: '⏳', approved: '✅', rejected: '❌' }[s] || '❓')
  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + (w.amount || 0), 0)
  const totalApproved = withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + (w.amount || 0), 0)

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Withdrawal Management</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>
          {withdrawals.filter(w => w.status === 'pending').length} pending · {withdrawals.length} total
        </div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Total', v: withdrawals.length, c: '#e6edf3', icon: '📋' },
          { l: 'Pending', v: withdrawals.filter(w => w.status === 'pending').length, c: '#F7A600', icon: '⏳' },
          { l: 'Pending Value', v: `$${totalPending.toLocaleString()}`, c: '#F7A600', icon: '💰' },
          { l: 'Total Paid Out', v: `$${totalApproved.toLocaleString()}`, c: '#3fb950', icon: '✅' },
        ].map(s => (
          <div key={s.l} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: '16px 14px' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#484f58' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user or wallet..."
            style={{ width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 14px 10px 36px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#21262d'} />
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4 }}>
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 14px', borderRadius: 7, border: 'none', background: filter === f ? 'rgba(201,168,76,0.15)' : 'transparent', color: filter === f ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', textTransform: 'capitalize', fontWeight: filter === f ? 700 : 400, whiteSpace: 'nowrap' }}>
              {f} {f === 'pending' && withdrawals.filter(w => w.status === 'pending').length > 0 ? `(${withdrawals.filter(w => w.status === 'pending').length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ background: '#0a0e14', borderBottom: '1px solid #161b22' }}>
                {['User', 'Amount', 'Network', 'Wallet', 'Fee', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#484f58' }}>Loading withdrawals...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>⬆</div>
                    <div style={{ fontSize: 13, color: '#484f58' }}>No {filter === 'all' ? '' : filter} withdrawals found</div>
                  </td>
                </tr>
              ) : filtered.map((wd, i) => (
                <tr key={wd.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #161b22' : 'none' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', flexShrink: 0, overflow: 'hidden' }}>
                        {wd.user?.avatar_url
                          ? <img src={wd.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (wd.user?.full_name || wd.user?.email || 'U')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>{wd.user?.full_name || 'Unknown'}</div>
                        <div style={{ fontSize: 10, color: '#484f58', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wd.user?.email || wd.user_id?.slice(0, 16) + '...'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#f85149' }}>${wd.amount?.toLocaleString()}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#F7A600', background: 'rgba(247,166,0,0.1)', padding: '3px 8px', borderRadius: 6 }}>
                      {wd.network || 'BTC'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 10, color: '#8b949e', fontFamily: 'monospace', maxWidth: 120 }}>
                    {wd.wallet_address ? wd.wallet_address.slice(0, 14) + '...' : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#484f58' }}>
                    ${(wd.fee || wd.amount * 0.05)?.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: sc(wd.status), background: `${sc(wd.status)}15`, border: `1px solid ${sc(wd.status)}33`, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {si(wd.status)} {wd.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#484f58', whiteSpace: 'nowrap' }}>
                    {new Date(wd.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => { setSelected(wd); setNote(wd.admin_note || '') }}
                      style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${wd.status === 'pending' ? 'rgba(248,81,73,0.4)' : '#21262d'}`, background: wd.status === 'pending' ? 'rgba(248,81,73,0.08)' : 'transparent', color: wd.status === 'pending' ? '#f85149' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: wd.status === 'pending' ? 700 : 400, whiteSpace: 'nowrap' }}>
                      {wd.status === 'pending' ? '⚡ Review' : 'View'}
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
        <div onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 480, fontFamily: 'monospace', maxHeight: '92vh', overflowY: 'auto' }}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0d1117' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>Review Withdrawal</div>
              <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px' }}>

              {/* User */}
              <div style={{ background: '#161b22', borderRadius: 12, padding: '14px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0 }}>
                  {selected.user?.avatar_url
                    ? <img src={selected.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (selected.user?.full_name || 'U')[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{selected.user?.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: 12, color: '#484f58' }}>{selected.user?.email || 'No email'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 2 }}>Amount</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f85149' }}>${selected.amount?.toLocaleString()}</div>
                </div>
              </div>

              {/* Details */}
              {[
                { l: 'Amount', v: `$${selected.amount?.toLocaleString()}` },
                { l: 'Processing Fee (5%)', v: `$${(selected.fee || selected.amount * 0.05)?.toFixed(2)}` },
                { l: 'User Receives', v: `$${(selected.amount - (selected.fee || selected.amount * 0.05))?.toFixed(2)}` },
                { l: 'Network', v: selected.network || 'Bitcoin (BTC)' },
                { l: 'Wallet Address', v: selected.wallet_address || 'Not provided' },
                { l: 'Status', v: selected.status },
                { l: 'Submitted', v: new Date(selected.created_at).toLocaleString() },
              ].map(item => (
                <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#484f58', flexShrink: 0 }}>{item.l}</span>
                  <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all', fontFamily: item.l === 'Wallet Address' ? 'monospace' : 'inherit' }}>{item.v}</span>
                </div>
              ))}

              {selected.status === 'pending' && (
                <>
                  <div style={{ marginTop: 16, marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Note (optional)</label>
                    <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for the user..."
                      style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                      onFocus={e => e.target.style.borderColor = '#C9A84C'}
                      onBlur={e => e.target.style.borderColor = '#30363d'} />
                  </div>

                  <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#f85149', lineHeight: 1.8 }}>
                      ⚠ Send <strong>${(selected.amount - (selected.fee || selected.amount * 0.05))?.toFixed(2)}</strong> to: <strong style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{selected.wallet_address}</strong>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(247,166,0,0.06)', border: '1px solid rgba(247,166,0,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, color: '#F7A600', lineHeight: 1.8 }}>
                      📋 Rejecting will automatically refund <strong>${selected.amount?.toLocaleString()}</strong> to the user's balance.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button onClick={() => handleAction('rejected')} disabled={actionLoading}
                      style={{ padding: '14px 0', borderRadius: 12, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', opacity: actionLoading ? 0.5 : 1 }}>
                      {actionLoading ? '⟳' : '❌ Reject & Refund'}
                    </button>
                    <button onClick={() => handleAction('approved')} disabled={actionLoading}
                      style={{ padding: '14px 0', borderRadius: 12, border: 'none', background: actionLoading ? '#161b22' : 'linear-gradient(135deg,#3fb950,#2ea043)', color: actionLoading ? '#484f58' : '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                      {actionLoading ? '⟳ Processing...' : '✅ Approve & Pay'}
                    </button>
                  </div>
                </>
              )}

              {selected.status !== 'pending' && (
                <div style={{ marginTop: 16, background: `${sc(selected.status)}0d`, border: `1px solid ${sc(selected.status)}33`, borderRadius: 12, padding: 18, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{selected.status === 'approved' ? '✅' : '❌'}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: sc(selected.status) }}>
                    {selected.status === 'approved' ? 'Withdrawal approved and paid' : 'Withdrawal rejected — balance refunded'}
                  </div>
                  {selected.admin_note && <div style={{ fontSize: 12, color: '#8b949e', marginTop: 8 }}>Note: {selected.admin_note}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
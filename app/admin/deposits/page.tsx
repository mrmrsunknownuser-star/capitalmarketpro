'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<any>(null)
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  const fetchDeposits = async () => {
  setLoading(true)
  const supabase = createClient()

  // Fetch deposits without join first
  const { data: deps, error } = await supabase
    .from('deposits')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Deposits error:', error)
    setLoading(false)
    return
  }

  // Fetch users separately
  const depsWithUsers = await Promise.all(
    (deps || []).map(async dep => {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .eq('id', dep.user_id)
        .single()
      return { ...dep, user }
    })
  )

  setDeposits(depsWithUsers)
  setLoading(false)
}

  useEffect(() => { fetchDeposits() }, [])

  const sendEmail = async (to: string, type: string, data: any) => {
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, to, data }),
      })
    } catch {}
  }

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selected) return
    setActionLoading(true)
    const supabase = createClient()

    // Update deposit status
    await supabase
      .from('deposits')
      .update({
        status,
        admin_note: note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selected.id)

    if (status === 'approved') {
      // Credit balance automatically
      const { data: bal } = await supabase
        .from('balances')
        .select('total_balance, available_balance, total_pnl')
        .eq('user_id', selected.user_id)
        .single()

      const newBalance = (bal?.total_balance || 0) + selected.amount

      await supabase
        .from('balances')
        .upsert({
          user_id: selected.user_id,
          total_balance: newBalance,
          available_balance: newBalance,
          total_pnl: bal?.total_pnl || 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      // Notify user
      await supabase.from('notifications').insert({
        user_id: selected.user_id,
        title: '✅ Deposit Confirmed!',
        message: `Your deposit of $${selected.amount?.toLocaleString()} via ${selected.crypto || 'BTC'} has been confirmed and credited to your account! Your new balance is $${newBalance.toLocaleString()}.`,
        type: 'success',
        is_read: false,
      })

      // Send email
      if (selected.user?.email) {
        await sendEmail(selected.user.email, 'deposit_confirmed', {
          amount: selected.amount,
          crypto: selected.crypto,
          newBalance,
        })
      }
    } else {
      // Notify rejection
      await supabase.from('notifications').insert({
        user_id: selected.user_id,
        title: '❌ Deposit Issue',
        message: `There was an issue with your deposit of $${selected.amount?.toLocaleString()}. ${note ? 'Reason: ' + note : 'Please contact support for assistance.'}`,
        type: 'warning',
        is_read: false,
      })
    }

    // Audit log
    try {
      await supabase.from('audit_logs').insert({
        action: `DEPOSIT_${status.toUpperCase()}`,
        target_user_id: selected.user_id,
        details: {
          amount: selected.amount,
          crypto: selected.crypto,
          tx_hash: selected.tx_hash,
          note,
        },
      })
    } catch {}

    setMessage(`✅ Deposit ${status}${status === 'approved' ? ` — $${selected.amount?.toLocaleString()} credited to account` : ''}`)
    setTimeout(() => setMessage(''), 5000)
    setSelected(null)
    setNote('')
    setActionLoading(false)
    fetchDeposits()
  }

  const filtered = deposits.filter(d => {
    const matchFilter = filter === 'all' || d.status === filter
    const matchSearch = !search ||
      d.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      (d.user?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.tx_hash || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const statusColor = (s: string) => ({
    pending: '#F7A600',
    approved: '#3fb950',
    rejected: '#f85149',
  }[s] || '#484f58')

  const statusIcon = (s: string) => ({
    pending: '⏳',
    approved: '✅',
    rejected: '❌',
  }[s] || '❓')

  const totalPending = deposits
    .filter(d => d.status === 'pending')
    .reduce((s, d) => s + (d.amount || 0), 0)

  const totalApproved = deposits
    .filter(d => d.status === 'approved')
    .reduce((s, d) => s + (d.amount || 0), 0)

  const totalToday = deposits
    .filter(d => {
      const today = new Date().toDateString()
      return new Date(d.created_at).toDateString() === today
    })
    .reduce((s, d) => s + (d.amount || 0), 0)

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Deposit Management</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>
          {deposits.filter(d => d.status === 'pending').length} pending · {deposits.length} total
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Total Deposits', v: deposits.length, c: '#e6edf3', icon: '📋' },
          { l: 'Pending Value', v: `$${totalPending.toLocaleString()}`, c: '#F7A600', icon: '⏳' },
          { l: 'Total Approved', v: `$${totalApproved.toLocaleString()}`, c: '#3fb950', icon: '✅' },
          { l: "Today's Volume", v: `$${totalToday.toLocaleString()}`, c: '#C9A84C', icon: '📈' },
        ].map(s => (
          <div key={s.l} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: '16px 14px' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#484f58', fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search user or TX hash..."
            style={{ width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 14px 10px 36px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#21262d'}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4 }}>
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 14px', borderRadius: 7, border: 'none', background: filter === f ? 'rgba(201,168,76,0.15)' : 'transparent', color: filter === f ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', textTransform: 'capitalize', fontWeight: filter === f ? 700 : 400, whiteSpace: 'nowrap' }}>
              {f} {f === 'pending' && deposits.filter(d => d.status === 'pending').length > 0
                ? `(${deposits.filter(d => d.status === 'pending').length})`
                : ''}
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
                {['User', 'Amount', 'Crypto', 'TX Hash', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#484f58' }}>Loading deposits...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>💰</div>
                    <div style={{ fontSize: 13, color: '#484f58' }}>No {filter === 'all' ? '' : filter} deposits found</div>
                  </td>
                </tr>
              ) : filtered.map((dep, i) => (
                <tr key={dep.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #161b22' : 'none' }}>

                  {/* User */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', flexShrink: 0, overflow: 'hidden' }}>
                        {dep.user?.avatar_url
                          ? <img src={dep.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (dep.user?.full_name || dep.user?.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>{dep.user?.full_name || 'Unknown'}</div>
                        <div style={{ fontSize: 10, color: '#484f58', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {dep.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#C9A84C' }}>
                      ${dep.amount?.toLocaleString()}
                    </div>
                  </td>

                  {/* Crypto */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#F7A600', background: 'rgba(247,166,0,0.12)', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(247,166,0,0.2)' }}>
                      {dep.crypto || 'BTC'}
                    </span>
                  </td>

                  {/* TX Hash */}
                  <td style={{ padding: '12px 14px' }}>
                    {dep.tx_hash ? (
                      <div style={{ fontSize: 10, color: '#8b949e', fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dep.tx_hash.slice(0, 18) + '...'}
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: '#484f58' }}>—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(dep.status), background: `${statusColor(dep.status)}15`, border: `1px solid ${statusColor(dep.status)}33`, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {statusIcon(dep.status)} {dep.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#484f58', whiteSpace: 'nowrap' }}>
                    {new Date(dep.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => { setSelected(dep); setNote(dep.admin_note || '') }}
                      style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${dep.status === 'pending' ? 'rgba(247,166,0,0.4)' : '#21262d'}`, background: dep.status === 'pending' ? 'rgba(247,166,0,0.08)' : 'transparent', color: dep.status === 'pending' ? '#F7A600' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: dep.status === 'pending' ? 700 : 400, whiteSpace: 'nowrap' }}>
                      {dep.status === 'pending' ? '⚡ Review' : 'View'}
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
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 480, fontFamily: 'monospace', maxHeight: '92vh', overflowY: 'auto' }}>

            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0d1117' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>Review Deposit</div>
              <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px' }}>

              {/* User Info */}
              <div style={{ background: '#161b22', borderRadius: 12, padding: '14px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0 }}>
                  {selected.user?.avatar_url
                    ? <img src={selected.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (selected.user?.full_name || 'U')[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{selected.user?.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: 12, color: '#484f58' }}>{selected.user?.email}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 2 }}>Amount</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#C9A84C' }}>${selected.amount?.toLocaleString()}</div>
                </div>
              </div>

              {/* Deposit Details */}
              <div style={{ marginBottom: 18 }}>
                {[
                  { l: 'Cryptocurrency', v: selected.crypto || 'Bitcoin (BTC)' },
                  { l: 'Amount (USD)', v: `$${selected.amount?.toLocaleString()}` },
                  { l: 'Transaction Hash', v: selected.tx_hash || 'Not provided' },
                  { l: 'Current Status', v: selected.status },
                  { l: 'Submitted', v: new Date(selected.created_at).toLocaleString() },
                ].map(item => (
                  <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#484f58', flexShrink: 0 }}>{item.l}</span>
                    <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all', fontFamily: item.l === 'Transaction Hash' ? 'monospace' : 'inherit' }}>
                      {item.v}
                    </span>
                  </div>
                ))}
              </div>

              {/* Blockchain Verify */}
              {selected.tx_hash && (
                <a
                  href={`https://blockchair.com/bitcoin/transaction/${selected.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#C9A84C', textDecoration: 'none', marginBottom: 18, padding: '10px 14px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10 }}>
                  <span>🔍</span>
                  <span>Verify on Blockchain Explorer →</span>
                </a>
              )}

              {selected.status === 'pending' && (
                <>
                  {/* Note */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Admin Note (optional)
                    </label>
                    <input
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Add a note for the user..."
                      style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                      onFocus={e => e.target.style.borderColor = '#C9A84C'}
                      onBlur={e => e.target.style.borderColor = '#30363d'}
                    />
                  </div>

                  {/* Info box */}
                  <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, color: '#3fb950', lineHeight: 1.8 }}>
                      ✅ Approving will automatically credit <strong>${selected.amount?.toLocaleString()}</strong> to the user's account balance in real-time.
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      onClick={() => handleAction('rejected')}
                      disabled={actionLoading}
                      style={{ padding: '14px 0', borderRadius: 12, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', opacity: actionLoading ? 0.5 : 1 }}>
                      {actionLoading ? '⟳' : '❌ Reject'}
                    </button>
                    <button
                      onClick={() => handleAction('approved')}
                      disabled={actionLoading}
                      style={{ padding: '14px 0', borderRadius: 12, border: 'none', background: actionLoading ? '#161b22' : 'linear-gradient(135deg,#3fb950,#2ea043)', color: actionLoading ? '#484f58' : '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                      {actionLoading ? '⟳ Processing...' : '✅ Approve & Credit'}
                    </button>
                  </div>
                </>
              )}

              {selected.status !== 'pending' && (
                <div style={{ background: `${statusColor(selected.status)}0d`, border: `1px solid ${statusColor(selected.status)}33`, borderRadius: 12, padding: 18, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>
                    {selected.status === 'approved' ? '✅' : '❌'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: statusColor(selected.status), marginBottom: 6 }}>
                    {selected.status === 'approved'
                      ? `Deposit approved — $${selected.amount?.toLocaleString()} credited`
                      : 'Deposit rejected'}
                  </div>
                  {selected.admin_note && (
                    <div style={{ fontSize: 12, color: '#8b949e', marginTop: 6 }}>
                      Note: {selected.admin_note}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
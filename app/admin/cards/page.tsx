'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminCardsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<any>(null)
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchApplications = async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch card applications
    const { data: apps, error } = await supabase
      .from('card_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Card apps error:', error)
      setLoading(false)
      return
    }

    // Fetch user details separately for each application
    const appsWithUsers = await Promise.all(
      (apps || []).map(async app => {
        const { data: user } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .eq('id', app.user_id)
          .single()
        return { ...app, user }
      })
    )

    setApplications(appsWithUsers)
    setLoading(false)
  }

  useEffect(() => {
    fetchApplications()

    const supabase = createClient()
    supabase.channel('admin-cards-live')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'card_applications',
      }, () => fetchApplications())
      .subscribe()
  }, [])

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selected) return
    setActionLoading(true)
    const supabase = createClient()

    await supabase
      .from('card_applications')
      .update({
        status,
        admin_note: note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selected.id)

    await supabase.from('notifications').insert({
      user_id: selected.user_id,
      title: status === 'approved'
        ? `✅ ${selected.card_name} Approved!`
        : `❌ ${selected.card_name} Rejected`,
      message: status === 'approved'
        ? `Congratulations! Your ${selected.card_name} application has been approved. Your card is now active and ready to use!`
        : `Your ${selected.card_name} application was not approved. ${note ? 'Reason: ' + note : 'Please contact support for more information.'}`,
      type: status === 'approved' ? 'success' : 'info',
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
            type: 'card_approved',
            to: selected.user.email,
            data: { cardName: selected.card_name, type: selected.card_type },
          }),
        })
      }
    } catch {}

    try {
      await supabase.from('audit_logs').insert({
        action: `CARD_${status.toUpperCase()}`,
        target_user_id: selected.user_id,
        details: { card: selected.card_name, note, fee: selected.card_price },
      })
    } catch {}

    setMessage(`✅ Card ${status} successfully`)
    setTimeout(() => setMessage(''), 3000)
    setSelected(null)
    setNote('')
    setActionLoading(false)
    fetchApplications()
  }

  const filtered = applications.filter(a =>
    filter === 'all' || a.status === filter
  )

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

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Card Applications</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>
          {applications.filter(a => a.status === 'pending').length} pending · {applications.length} total
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
          { l: 'Total', v: applications.length, c: '#e6edf3', icon: '💳' },
          { l: 'Pending', v: applications.filter(a => a.status === 'pending').length, c: '#F7A600', icon: '⏳' },
          { l: 'Approved', v: applications.filter(a => a.status === 'approved').length, c: '#3fb950', icon: '✅' },
          { l: 'Rejected', v: applications.filter(a => a.status === 'rejected').length, c: '#f85149', icon: '❌' },
        ].map(s => (
          <div key={s.l} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: '14px' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.c, marginBottom: 2 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: filter === f ? 'rgba(201,168,76,0.15)' : 'transparent', color: filter === f ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', textTransform: 'capitalize', fontWeight: filter === f ? 700 : 400 }}>
            {f} {f === 'pending' && applications.filter(a => a.status === 'pending').length > 0
              ? `(${applications.filter(a => a.status === 'pending').length})`
              : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#0a0e14', borderBottom: '1px solid #161b22' }}>
                {['User', 'Card', 'Type', 'Fee', 'Payment', 'Status', 'Applied', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#484f58' }}>
                    Loading applications...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>💳</div>
                    <div style={{ fontSize: 13, color: '#484f58' }}>No {filter === 'all' ? '' : filter} applications</div>
                  </td>
                </tr>
              ) : filtered.map((app, i) => (
                <tr key={app.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #161b22' : 'none' }}>

                  {/* User */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', flexShrink: 0, overflow: 'hidden' }}>
                        {app.user?.avatar_url
                          ? <img src={app.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (app.user?.full_name || app.user?.email || 'U')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>
                          {app.user?.full_name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: 10, color: '#484f58', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Card */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{app.card_name}</div>
                    <div style={{ fontSize: 10, color: '#484f58', textTransform: 'capitalize' }}>{app.card_tier}</div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: app.card_type === 'virtual' ? '#0052FF' : '#C9A84C', background: app.card_type === 'virtual' ? 'rgba(0,82,255,0.1)' : 'rgba(201,168,76,0.1)', padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                      {app.card_type}
                    </span>
                  </td>

                  {/* Fee */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#C9A84C' }}>
                      ${app.card_price?.toLocaleString()}
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#F7A600', fontWeight: 700 }}>
                      {app.payment_method || 'BTC'}
                    </div>
                    {app.tx_hash && (
                      <div style={{ fontSize: 9, color: '#484f58', fontFamily: 'monospace', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.tx_hash.slice(0, 10)}...
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(app.status), background: `${statusColor(app.status)}15`, border: `1px solid ${statusColor(app.status)}33`, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {statusIcon(app.status)} {app.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#484f58', whiteSpace: 'nowrap' }}>
                    {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => { setSelected(app); setNote(app.admin_note || '') }}
                      style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${app.status === 'pending' ? 'rgba(247,166,0,0.4)' : '#21262d'}`, background: app.status === 'pending' ? 'rgba(247,166,0,0.08)' : 'transparent', color: app.status === 'pending' ? '#F7A600' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: app.status === 'pending' ? 700 : 400, whiteSpace: 'nowrap' }}>
                      {app.status === 'pending' ? '⚡ Review' : 'View'}
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 500, fontFamily: 'monospace', maxHeight: '92vh', overflowY: 'auto' }}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0d1117', zIndex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>Review Card Application</div>
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
                  <div style={{ fontSize: 11, color: '#484f58' }}>{selected.user?.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 2 }}>Application Fee</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#C9A84C' }}>${selected.card_price?.toLocaleString()}</div>
                </div>
              </div>

              {/* Details */}
              {[
                { l: 'Card Name', v: selected.card_name },
                { l: 'Card Type', v: selected.card_type },
                { l: 'Card Tier', v: selected.card_tier },
                { l: 'Application Fee', v: `$${selected.card_price?.toLocaleString()}` },
                { l: 'Cashback', v: selected.cashback || '—' },
                { l: 'Monthly Limit', v: selected.monthly_limit || '—' },
                { l: 'Payment Method', v: selected.payment_method || 'BTC' },
                { l: 'Transaction Hash', v: selected.tx_hash || 'Not provided' },
                { l: 'Current Status', v: selected.status },
                { l: 'Applied', v: new Date(selected.created_at).toLocaleString() },
              ].map(item => (
                <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#484f58', flexShrink: 0 }}>{item.l}</span>
                  <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all', maxWidth: '60%', fontFamily: item.l === 'Transaction Hash' ? 'monospace' : 'inherit', textTransform: 'capitalize' }}>
                    {item.v}
                  </span>
                </div>
              ))}

              {selected.shipping_address && (
                <div style={{ padding: '10px 0', borderBottom: '1px solid #161b22' }}>
                  <div style={{ fontSize: 12, color: '#484f58', marginBottom: 6 }}>Shipping Address</div>
                  <div style={{ fontSize: 12, color: '#e6edf3', lineHeight: 1.7 }}>{selected.shipping_address}</div>
                </div>
              )}

              {/* Verify TX */}
              {selected.tx_hash && selected.tx_hash !== 'Not provided' && (
                <div style={{ marginTop: 12 }}>
                  <a href={`https://blockchair.com/bitcoin/transaction/${selected.tx_hash}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#C9A84C', textDecoration: 'none', padding: '10px 14px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10 }}>
                    <span>🔍</span>
                    <span>Verify Payment on Blockchain →</span>
                  </a>
                </div>
              )}

              {selected.status === 'pending' && (
                <>
                  <div style={{ marginTop: 18, marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Note (optional)</label>
                    <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for the user..."
                      style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                      onFocus={e => e.target.style.borderColor = '#C9A84C'}
                      onBlur={e => e.target.style.borderColor = '#30363d'} />
                  </div>

                  <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, color: '#3fb950', lineHeight: 1.8 }}>
                      ✅ Approving will activate the <strong>{selected.card_name}</strong> for this user immediately.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button onClick={() => handleAction('rejected')} disabled={actionLoading}
                      style={{ padding: '14px 0', borderRadius: 12, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.08)', color: '#f85149', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', opacity: actionLoading ? 0.5 : 1 }}>
                      {actionLoading ? '⟳' : '❌ Reject'}
                    </button>
                    <button onClick={() => handleAction('approved')} disabled={actionLoading}
                      style={{ padding: '14px 0', borderRadius: 12, border: 'none', background: actionLoading ? '#161b22' : 'linear-gradient(135deg,#3fb950,#2ea043)', color: actionLoading ? '#484f58' : '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                      {actionLoading ? '⟳ Processing...' : '✅ Approve Card'}
                    </button>
                  </div>
                </>
              )}

              {selected.status !== 'pending' && (
                <div style={{ marginTop: 16, background: `${statusColor(selected.status)}0d`, border: `1px solid ${statusColor(selected.status)}33`, borderRadius: 12, padding: 18, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>
                    {selected.status === 'approved' ? '✅' : '❌'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: statusColor(selected.status) }}>
                    {selected.status === 'approved' ? 'Card approved and activated' : 'Application rejected'}
                  </div>
                  {selected.admin_note && (
                    <div style={{ fontSize: 12, color: '#8b949e', marginTop: 8 }}>Note: {selected.admin_note}</div>
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
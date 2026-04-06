'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    const supabase = createClient()

    const [
      { data: auditData },
      { data: deposits },
      { data: withdrawals },
      { data: cards },
      { data: users },
    ] = await Promise.all([
      supabase.from('audit_logs')
        .select('*, user:users!audit_logs_target_user_id_fkey(id, email, full_name, avatar_url, kyc_status)')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('deposits')
        .select('*, user:users(id, email, full_name)')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('withdrawal_requests')
        .select('*, user:users(id, email, full_name)')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('card_applications')
        .select('*, user:users(id, email, full_name)')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('users')
        .select('id, email, full_name, kyc_status, kyc_data, country, phone, created_at')
        .neq('role', 'admin')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    const combined: any[] = [
      ...(auditData || []).map(l => ({
        ...l,
        sourceTable: 'audit',
      })),
      ...(deposits || []).map(d => ({
        id: `dep-${d.id}`,
        action: 'DEPOSIT_SUBMITTED',
        created_at: d.created_at,
        user: d.user,
        sourceTable: 'deposits',
        details: {
          amount: `$${d.amount?.toLocaleString()}`,
          crypto: d.crypto || 'BTC',
          tx_hash: d.tx_hash || 'Not provided',
          status: d.status,
        },
      })),
      ...(withdrawals || []).map(w => ({
        id: `wd-${w.id}`,
        action: 'WITHDRAWAL_SUBMITTED',
        created_at: w.created_at,
        user: w.user,
        sourceTable: 'withdrawals',
        details: {
          amount: `$${w.amount?.toLocaleString()}`,
          network: w.network || 'BTC',
          wallet_address: w.wallet_address || 'Not provided',
          fee: `$${(w.fee || w.amount * 0.05)?.toFixed(2)}`,
          status: w.status,
        },
      })),
      ...(cards || []).map(c => ({
        id: `card-${c.id}`,
        action: 'CARD_APPLICATION',
        created_at: c.created_at,
        user: c.user,
        sourceTable: 'cards',
        details: {
          card_name: c.card_name,
          card_type: c.card_type,
          application_fee: `$${c.card_price?.toLocaleString()}`,
          payment_method: c.payment_method || 'BTC',
          tx_hash: c.tx_hash || 'Not provided',
          shipping: c.shipping_address || 'N/A (Virtual)',
          status: c.status,
        },
      })),
      ...(users || []).map(u => ({
        id: `user-${u.id}`,
        action: 'USER_REGISTERED',
        created_at: u.created_at,
        user: { id: u.id, email: u.email, full_name: u.full_name },
        sourceTable: 'kyc',
        details: {
          full_name: u.full_name || 'Not provided',
          email: u.email || 'Not provided',
          country: u.country || 'Not provided',
          phone: u.phone || 'Not provided',
          kyc_status: u.kyc_status || 'none',
        },
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setLogs(combined)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()

    const supabase = createClient()
    const channels = [
      supabase.channel('al-deps').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deposits' }, fetchLogs).subscribe(),
      supabase.channel('al-wds').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'withdrawal_requests' }, fetchLogs).subscribe(),
      supabase.channel('al-cards').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'card_applications' }, fetchLogs).subscribe(),
      supabase.channel('al-users').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, fetchLogs).subscribe(),
      supabase.channel('al-audit').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, fetchLogs).subscribe(),
    ]
    return () => { channels.forEach(c => supabase.removeChannel(c)) }
  }, [])

  const ACTION_COLORS: Record<string, string> = {
    DEPOSIT_SUBMITTED: '#C9A84C',
    DEPOSIT_APPROVED: '#3fb950',
    DEPOSIT_REJECTED: '#f85149',
    WITHDRAWAL_SUBMITTED: '#F7A600',
    WITHDRAWAL_APPROVED: '#3fb950',
    WITHDRAWAL_REJECTED: '#f85149',
    CARD_APPLICATION: '#0052FF',
    CARD_APPROVED: '#3fb950',
    CARD_REJECTED: '#f85149',
    KYC_SUBMITTED: '#C9A84C',
    KYC_APPROVED: '#3fb950',
    KYC_REJECTED: '#f85149',
    USER_REGISTERED: '#7B2BF9',
    USER_ACTIVE: '#3fb950',
    USER_SUSPENDED: '#f85149',
    TIER_UPDATED: '#7B2BF9',
    BTC_ADDRESS_UPDATED: '#F7A600',
  }

  const ACTION_ICONS: Record<string, string> = {
    DEPOSIT_SUBMITTED: '💰',
    DEPOSIT_APPROVED: '✅',
    DEPOSIT_REJECTED: '❌',
    WITHDRAWAL_SUBMITTED: '⬆',
    WITHDRAWAL_APPROVED: '✅',
    WITHDRAWAL_REJECTED: '❌',
    CARD_APPLICATION: '💳',
    CARD_APPROVED: '✅',
    CARD_REJECTED: '❌',
    KYC_SUBMITTED: '🪪',
    KYC_APPROVED: '✅',
    KYC_REJECTED: '❌',
    USER_REGISTERED: '👤',
    USER_ACTIVE: '👤',
    USER_SUSPENDED: '🔴',
    TIER_UPDATED: '🏆',
    BTC_ADDRESS_UPDATED: '₿',
  }

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'deposits', label: '💰 Deposits' },
    { id: 'withdrawals', label: '⬆ Withdrawals' },
    { id: 'cards', label: '💳 Cards' },
    { id: 'kyc', label: '👤 Users/KYC' },
    { id: 'audit', label: '📋 Admin Actions' },
  ]

  const filtered = logs.filter(log => {
    const matchFilter = filter === 'all'
      || (filter === 'deposits' && log.action?.includes('DEPOSIT'))
      || (filter === 'withdrawals' && log.action?.includes('WITHDRAWAL'))
      || (filter === 'cards' && log.action?.includes('CARD'))
      || (filter === 'kyc' && (log.action?.includes('KYC') || log.action?.includes('USER')))
      || (filter === 'audit' && log.sourceTable === 'audit')

    const matchSearch = !search
      || log.action?.toLowerCase().includes(search.toLowerCase())
      || log.user?.email?.toLowerCase().includes(search.toLowerCase())
      || (log.user?.full_name || '').toLowerCase().includes(search.toLowerCase())
      || JSON.stringify(log.details || {}).toLowerCase().includes(search.toLowerCase())

    return matchFilter && matchSearch
  })

  const getColor = (action: string) => ACTION_COLORS[action] || '#C9A84C'
  const getIcon = (action: string) => ACTION_ICONS[action] || '📋'
  const getLabel = (action: string) => (action || 'Unknown').replace(/_/g, ' ')

  const getActionLink = (action: string) => {
    if (action?.includes('DEPOSIT')) return { href: '/admin/deposits', label: 'Review Deposit →', color: '#3fb950' }
    if (action?.includes('KYC')) return { href: '/admin/users', label: 'Review KYC →', color: '#C9A84C' }
    if (action?.includes('CARD')) return { href: '/admin/cards', label: 'Review Card →', color: '#0052FF' }
    if (action?.includes('WITHDRAWAL')) return { href: '/admin/withdrawals', label: 'Review Withdrawal →', color: '#f85149' }
    if (action?.includes('USER')) return { href: '/admin/users', label: 'View User →', color: '#7B2BF9' }
    return null
  }

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Live Audit Log</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950' }} />
            <span style={{ fontSize: 12, color: '#484f58' }}>Real-time · {logs.length} events</span>
          </div>
        </div>
        <button onClick={fetchLogs}
          style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Total', v: logs.length, c: '#e6edf3', icon: '📋' },
          { l: 'Deposits', v: logs.filter(l => l.action?.includes('DEPOSIT')).length, c: '#C9A84C', icon: '💰' },
          { l: 'Withdrawals', v: logs.filter(l => l.action?.includes('WITHDRAWAL')).length, c: '#f85149', icon: '⬆' },
          { l: 'KYC/Users', v: logs.filter(l => l.action?.includes('KYC') || l.action?.includes('USER')).length, c: '#3fb950', icon: '🪪' },
          { l: 'Cards', v: logs.filter(l => l.action?.includes('CARD')).length, c: '#0052FF', icon: '💳' },
        ].map(s => (
          <div key={s.l} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: '14px' }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.c, marginBottom: 2 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#484f58' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search user, action, TX hash, amount..."
            style={{ width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 14px 10px 36px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#21262d'} />
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding: '7px 12px', borderRadius: 7, border: 'none', background: filter === f.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: filter === f.id ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: filter === f.id ? 700 : 400, whiteSpace: 'nowrap' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log list */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading audit log...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(log => {
            const c = getColor(log.action)
            const actionLink = getActionLink(log.action)
            return (
              <div key={log.id}
                style={{ background: '#0d1117', border: `1px solid ${expanded === log.id ? c + '55' : '#161b22'}`, borderRadius: 14, overflow: 'hidden' }}>

                {/* Row */}
                <div onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12, cursor: 'pointer' }}>

                  {/* Icon */}
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${c}15`, border: `1px solid ${c}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {getIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: c, background: `${c}15`, padding: '2px 8px', borderRadius: 6 }}>
                        {getLabel(log.action)}
                      </span>
                      {log.sourceTable === 'deposits' && (
                        <span style={{ fontSize: 9, color: '#484f58', background: '#161b22', padding: '2px 6px', borderRadius: 4 }}>
                          Live
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500, marginBottom: 2 }}>
                      {log.user?.full_name || 'Unknown'} · {log.user?.email || '—'}
                    </div>
                    {log.details && (
                      <div style={{ fontSize: 11, color: '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        {Object.entries(log.details).slice(0, 2).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · ')}
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: '#484f58' }}>
                      {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>
                      {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: 12, color: '#484f58', marginTop: 4 }}>
                      {expanded === log.id ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {expanded === log.id && (
                  <div style={{ padding: '16px 18px 20px', borderTop: `1px solid ${c}22`, background: `${c}05` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                      {/* User card */}
                      <div>
                        <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>User Details</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0 }}>
                            {log.user?.avatar_url
                              ? <img src={log.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : (log.user?.full_name || log.user?.email || 'U')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{log.user?.full_name || 'No name'}</div>
                            <div style={{ fontSize: 11, color: '#484f58' }}>{log.user?.email}</div>
                          </div>
                        </div>

                        {log.user?.kyc_status && (
                          <div style={{ marginBottom: 12 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: log.user.kyc_status === 'approved' ? '#3fb950' : '#F7A600', background: log.user.kyc_status === 'approved' ? 'rgba(63,185,80,0.1)' : 'rgba(247,166,0,0.1)', padding: '3px 10px', borderRadius: 20 }}>
                              KYC: {log.user.kyc_status?.toUpperCase()}
                            </span>
                          </div>
                        )}

                        {actionLink && (
                          <a href={actionLink.href}
                            style={{ display: 'inline-block', fontSize: 12, color: actionLink.color, background: `${actionLink.color}15`, border: `1px solid ${actionLink.color}33`, padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
                            {actionLink.label}
                          </a>
                        )}
                      </div>

                      {/* Details */}
                      <div>
                        <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Submission Details</div>
                        <div style={{ background: '#161b22', borderRadius: 10, padding: 14 }}>
                          {log.details && Object.keys(log.details).length > 0 ? (
                            Object.entries(log.details).map(([k, v]) => (
                              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #21262d', gap: 10 }}>
                                <span style={{ fontSize: 11, color: '#484f58', textTransform: 'capitalize', flexShrink: 0 }}>
                                  {k.replace(/_/g, ' ')}
                                </span>
                                <span style={{ fontSize: 11, color: '#e6edf3', fontWeight: 600, textAlign: 'right', wordBreak: 'break-all', maxWidth: '60%', fontFamily: (k.includes('hash') || k.includes('address') || k.includes('wallet')) ? 'monospace' : 'inherit' }}>
                                  {String(v)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: 12, color: '#484f58' }}>No additional details</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && !loading && (
            <div style={{ padding: 48, textAlign: 'center', background: '#0d1117', border: '1px solid #161b22', borderRadius: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 13, color: '#484f58' }}>No events found</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
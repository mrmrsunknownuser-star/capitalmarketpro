'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('audit_logs')
        .select('*, user:users(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(200)
      setLogs(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const ACTION_GROUPS: Record<string, string[]> = {
    deposits: ['DEPOSIT_APPROVED', 'DEPOSIT_REJECTED'],
    withdrawals: ['WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED'],
    kyc: ['KYC_APPROVED', 'KYC_REJECTED'],
    users: ['USER_ACTIVE', 'USER_SUSPENDED', 'USER_PENDING', 'TIER_UPDATED', 'BTC_ADDRESS_UPDATED'],
    cards: ['CARD_APPROVED', 'CARD_REJECTED'],
  }

  const actionColor = (action: string) => {
    if (action.includes('APPROVED') || action.includes('ACTIVE')) return '#3fb950'
    if (action.includes('REJECTED') || action.includes('SUSPENDED')) return '#f85149'
    return '#C9A84C'
  }

  const actionIcon = (action: string) => {
    if (action.startsWith('DEPOSIT')) return '💰'
    if (action.startsWith('WITHDRAWAL')) return '⬆'
    if (action.startsWith('KYC')) return '🪪'
    if (action.startsWith('USER')) return '👤'
    if (action.startsWith('CARD')) return '💳'
    if (action.startsWith('TIER')) return '🏆'
    if (action.startsWith('BTC')) return '₿'
    return '📋'
  }

  const filtered = logs.filter(log => {
    const matchFilter = filter === 'all' || ACTION_GROUPS[filter]?.includes(log.action)
    const matchSearch = !search ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.full_name || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Audit Log</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>{logs.length} total actions logged</div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#484f58' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search actions or users..."
            style={{ width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 14px 10px 36px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#21262d'}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
          {['all', 'deposits', 'withdrawals', 'kyc', 'users', 'cards'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 12px', borderRadius: 7, border: 'none', background: filter === f ? 'rgba(201,168,76,0.15)' : 'transparent', color: filter === f ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', textTransform: 'capitalize', fontWeight: filter === f ? 700 : 400 }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Total', v: logs.length, c: '#e6edf3' },
          { l: 'Deposits', v: logs.filter(l => l.action?.startsWith('DEPOSIT')).length, c: '#C9A84C' },
          { l: 'Withdrawals', v: logs.filter(l => l.action?.startsWith('WITHDRAWAL')).length, c: '#f85149' },
          { l: 'KYC', v: logs.filter(l => l.action?.startsWith('KYC')).length, c: '#3fb950' },
          { l: 'User Actions', v: logs.filter(l => l.action?.startsWith('USER') || l.action?.startsWith('TIER')).length, c: '#7B2BF9' },
        ].map(s => (
          <div key={s.l} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c, marginBottom: 3 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Log list */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading audit log...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 13, color: '#484f58' }}>No audit logs found</div>
          </div>
        ) : filtered.map((log, i) => (
          <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${actionColor(log.action)}15`, border: `1px solid ${actionColor(log.action)}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {actionIcon(log.action)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: actionColor(log.action), background: `${actionColor(log.action)}15`, padding: '2px 8px', borderRadius: 6 }}>{log.action}</span>
              </div>
              <div style={{ fontSize: 12, color: '#e6edf3', marginBottom: 3 }}>
                {log.user?.full_name || log.user?.email || 'Unknown user'}
                <span style={{ color: '#484f58', marginLeft: 6 }}>{log.user?.email}</span>
              </div>
              {log.details && Object.keys(log.details).length > 0 && (
                <div style={{ fontSize: 10, color: '#484f58', fontFamily: 'monospace', background: '#161b22', padding: '6px 8px', borderRadius: 6, marginTop: 4, wordBreak: 'break-all' }}>
                  {Object.entries(log.details).map(([k, v]) => v ? `${k}: ${v}` : null).filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
            <div style={{ fontSize: 10, color: '#484f58', whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right' }}>
              <div>{new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              <div>{new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
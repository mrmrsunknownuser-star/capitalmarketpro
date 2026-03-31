'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('audit_logs')
        .select('*, target:users!audit_logs_target_user_id_fkey(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(100)
      setLogs(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const actionColor = (a: string) => {
    if (a.includes('APPROVED') || a.includes('ACTIVE')) return '#3fb950'
    if (a.includes('REJECTED') || a.includes('SUSPEND')) return '#f85149'
    if (a.includes('BALANCE') || a.includes('BTC')) return '#F7A600'
    if (a.includes('KYC')) return '#0052FF'
    return '#8b949e'
  }

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action.includes(filter.toUpperCase()))

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Audit Log</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Every admin action recorded and timestamped</div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'balance', 'kyc', 'withdrawal', 'user', 'btc'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid', borderColor: filter === f ? '#C9A84C' : '#21262d', background: filter === f ? 'rgba(201,168,76,0.1)' : 'transparent', color: filter === f ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'monospace' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            No audit logs yet
          </div>
        ) : filtered.map((log, i) => (
          <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #161b22' : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: actionColor(log.action), marginTop: 6, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: actionColor(log.action), background: `${actionColor(log.action)}15`, padding: '2px 8px', borderRadius: 4, marginRight: 8 }}>
                    {log.action}
                  </span>
                  {log.target?.email && (
                    <span style={{ fontSize: 12, color: '#8b949e' }}>→ {log.target.email}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#484f58', flexShrink: 0 }}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
              {log.details && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#484f58', fontFamily: 'monospace', background: '#161b22', padding: '6px 10px', borderRadius: 6, maxWidth: 500, wordBreak: 'break-all' }}>
                  {JSON.stringify(log.details)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
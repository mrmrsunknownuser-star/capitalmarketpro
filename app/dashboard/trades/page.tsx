'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setTrades(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const platformColor: Record<string, string> = {
    Coinbase: '#0052FF', Bybit: '#F7A600', IBKR: '#00B386', Amazon: '#FF9900',
  }

  const filtered = trades.filter(t => {
    const matchFilter = filter === 'all' || t.platform === filter || t.type === filter
    const matchSearch = t.asset?.toLowerCase().includes(search.toLowerCase()) || t.trade_id?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Trade History</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>All your trades across every platform</div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Trades', value: trades.length, color: '#C9A84C' },
          { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toLocaleString()}`, color: totalPnl >= 0 ? '#3fb950' : '#f85149' },
          { label: 'Win Rate', value: `${trades.length ? Math.round((trades.filter(t => (t.pnl || 0) > 0).length / trades.length) * 100) : 0}%`, color: '#0052FF' },
          { label: 'Platforms', value: '4', color: '#F7A600' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by asset or ID..."
          style={{ flex: 1, minWidth: 200, background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: '9px 14px', color: '#e6edf3', fontSize: 12, outline: 'none' }}
        />
        {['all', 'Coinbase', 'Bybit', 'IBKR', 'Amazon', 'BUY', 'SELL', 'EARN'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid',
              borderColor: filter === f ? '#C9A84C' : '#21262d',
              background: filter === f ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: filter === f ? '#C9A84C' : '#8b949e',
              fontSize: 11, cursor: 'pointer',
            }}
          >{f}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #161b22', background: '#0a0e14' }}>
              {['TXN ID', 'Platform', 'Asset', 'Type', 'Amount', 'P&L', 'Status', 'Date'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading trades...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center', color: '#484f58', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                No trades yet. Your trade history will appear here.
              </td></tr>
            ) : filtered.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #161b22' }}>
                <td style={{ padding: '14px 16px', fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>{t.trade_id}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: platformColor[t.platform] || '#8b949e', background: `${platformColor[t.platform] || '#8b949e'}18`, padding: '3px 8px', borderRadius: 4 }}>{t.platform}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>{t.asset}</td>
                <td style={{ padding: '14px 16px', fontSize: 11, fontWeight: 700, color: t.type === 'BUY' ? '#3fb950' : t.type === 'SELL' ? '#f85149' : '#C9A84C' }}>{t.type}</td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#e6edf3' }}>${parseFloat(t.amount).toLocaleString()}</td>
                <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: (t.pnl || 0) >= 0 ? '#3fb950' : '#f85149' }}>
                  {t.pnl ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toLocaleString()}` : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 10, color: '#3fb950', background: 'rgba(63,185,80,0.1)', padding: '3px 8px', borderRadius: 20 }}>● {t.status}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 11, color: '#484f58' }}>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
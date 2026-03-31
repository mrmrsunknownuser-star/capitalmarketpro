'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const monthlyData = [
  { month: 'Jan', crypto: 18000, stocks: 16000, affiliate: 8000 },
  { month: 'Feb', crypto: 21000, stocks: 17500, affiliate: 9000 },
  { month: 'Mar', crypto: 16000, stocks: 18200, affiliate: 9000 },
  { month: 'Apr', crypto: 26000, stocks: 20800, affiliate: 10000 },
  { month: 'May', crypto: 28000, stocks: 22200, affiliate: 11000 },
  { month: 'Jun', crypto: 25000, stocks: 22700, affiliate: 11000 },
  { month: 'Jul', crypto: 30000, stocks: 25400, affiliate: 12000 },
  { month: 'Aug', crypto: 32000, stocks: 27100, affiliate: 13000 },
  { month: 'Sep', crypto: 29000, stocks: 27800, affiliate: 13000 },
  { month: 'Oct', crypto: 34000, stocks: 30500, affiliate: 14000 },
  { month: 'Nov', crypto: 37000, stocks: 32200, affiliate: 15000 },
  { month: 'Dec', crypto: 41000, stocks: 34600, affiliate: 16000 },
]

const holdings = [
  { platform: 'Coinbase', asset: 'Bitcoin (BTC)', amount: '0.4820 BTC', value: '$18,400', change: '+8.2%', positive: true, color: '#F7A600' },
  { platform: 'Coinbase', asset: 'Ethereum (ETH)', amount: '3.42 ETH', value: '$12,200', change: '+4.1%', positive: true, color: '#627EEA' },
  { platform: 'Coinbase', asset: 'Solana (SOL)', amount: '48.2 SOL', value: '$10,680', change: '+12.4%', positive: true, color: '#9945FF' },
  { platform: 'Bybit', asset: 'USDT', amount: '14,000 USDT', value: '$14,000', change: '0.0%', positive: true, color: '#26A17B' },
  { platform: 'Bybit', asset: 'Ethereum (ETH)', amount: '3.12 ETH', value: '$11,200', change: '+4.1%', positive: true, color: '#627EEA' },
  { platform: 'IBKR', asset: 'NVIDIA (NVDA)', amount: '14 shares', value: '$12,800', change: '+3.2%', positive: true, color: '#76B900' },
  { platform: 'IBKR', asset: 'Apple (AAPL)', amount: '55 shares', value: '$10,400', change: '-0.6%', positive: false, color: '#8b949e' },
  { platform: 'IBKR', asset: 'Microsoft (MSFT)', amount: '42 shares', value: '$15,550', change: '+1.8%', positive: true, color: '#0078D4' },
]

export default function PortfolioPage() {
  const [balance, setBalance] = useState<any>(null)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('balances').select('*').eq('user_id', user.id).single()
      setBalance(data)
    }
    fetch()
  }, [])

  const total = balance?.total_balance || 130430

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Portfolio</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Complete breakdown of your holdings across all platforms</div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Value', value: `$${total.toLocaleString()}`, sub: 'All platforms', color: '#C9A84C' },
          { label: 'Total P&L', value: `+$${(balance?.total_pnl || 24680).toLocaleString()}`, sub: 'All time', color: '#3fb950' },
          { label: 'P&L %', value: `+${balance?.pnl_percentage || 23.3}%`, sub: 'Since inception', color: '#3fb950' },
          { label: 'Active Assets', value: '8', sub: 'Across 3 platforms', color: '#0052FF' },
        ].map(card => (
          <div key={card.label} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color, marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>Performance by Platform</div>
          <div style={{ fontSize: 11, color: '#484f58', marginBottom: 16 }}>Monthly breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                {[['crypto', '#0052FF'], ['stocks', '#00B386'], ['affiliate', '#FF9900']].map(([key, color]) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#161b22" />
              <XAxis dataKey="month" stroke="#484f58" tick={{ fontSize: 10, fill: '#484f58' }} />
              <YAxis stroke="#484f58" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="crypto" name="Crypto" stroke="#0052FF" strokeWidth={2} fill="url(#grad-crypto)" />
              <Area type="monotone" dataKey="stocks" name="Stocks" stroke="#00B386" strokeWidth={2} fill="url(#grad-stocks)" />
              <Area type="monotone" dataKey="affiliate" name="Affiliate" stroke="#FF9900" strokeWidth={2} fill="url(#grad-affiliate)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>Monthly Returns</div>
          <div style={{ fontSize: 11, color: '#484f58', marginBottom: 16 }}>Combined P&L per month</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#161b22" vertical={false} />
              <XAxis dataKey="month" stroke="#484f58" tick={{ fontSize: 10, fill: '#484f58' }} />
              <YAxis stroke="#484f58" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="crypto" name="Crypto" fill="#0052FF" radius={[3, 3, 0, 0]} />
              <Bar dataKey="stocks" name="Stocks" fill="#00B386" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holdings Table */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>All Holdings</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #161b22' }}>
              {['Asset', 'Platform', 'Amount', 'Value', '24h Change', 'Allocation'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #161b22' }}>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${h.color}18`, border: `1px solid ${h.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: h.color }}>
                      {h.asset.slice(0, 2)}
                    </div>
                    <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>{h.asset}</div>
                  </div>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ fontSize: 10, color: '#8b949e', background: '#161b22', padding: '3px 8px', borderRadius: 4 }}>{h.platform}</span>
                </td>
                <td style={{ padding: '14px 12px', fontSize: 12, color: '#8b949e' }}>{h.amount}</td>
                <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{h.value}</td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: h.positive ? '#3fb950' : '#f85149' }}>{h.change}</span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: '#161b22', borderRadius: 2, maxWidth: 80 }}>
                      <div style={{ width: `${(parseInt(h.value.replace(/\D/g, '')) / 41000) * 100}%`, height: '100%', background: h.color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#484f58' }}>{((parseInt(h.value.replace(/\D/g, '')) / 130430) * 100).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
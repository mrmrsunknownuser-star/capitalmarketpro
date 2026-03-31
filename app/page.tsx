'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const pnlData = [
  { date: 'Jan', value: 42000 }, { date: 'Feb', value: 47500 },
  { date: 'Mar', value: 43200 }, { date: 'Apr', value: 56800 },
  { date: 'May', value: 61200 }, { date: 'Jun', value: 58700 },
  { date: 'Jul', value: 67400 }, { date: 'Aug', value: 72100 },
  { date: 'Sep', value: 69800 }, { date: 'Oct', value: 78500 },
  { date: 'Nov', value: 84200 }, { date: 'Dec', value: 91600 },
]

const assets = [
  { name: 'Bitcoin (BTC)', amount: '0.4820 BTC', value: 18400, change: '+8.2%', positive: true, color: '#F7A600' },
  { name: 'Ethereum (ETH)', amount: '3.42 ETH', value: 12200, change: '+4.1%', positive: true, color: '#627EEA' },
  { name: 'Solana (SOL)', amount: '48.2 SOL', value: 10680, change: '+12.4%', positive: true, color: '#9945FF' },
  { name: 'Apple Inc (AAPL)', amount: '55 shares', value: 10400, change: '-0.6%', positive: false, color: '#8b949e' },
  { name: 'NVIDIA (NVDA)', amount: '14 shares', value: 12800, change: '+3.2%', positive: true, color: '#76B900' },
]

const recentActivity = [
  { id: 'TXN-8821', type: 'BUY', asset: 'BTC/USD', amount: '$12,400', pnl: '+$1,240', time: '2h ago' },
  { id: 'TXN-8820', type: 'SELL', asset: 'ETH/USDT', amount: '$4,800', pnl: '+$320', time: '4h ago' },
  { id: 'TXN-8819', type: 'BUY', asset: 'AAPL', amount: '$8,120', pnl: '-$180', time: '6h ago' },
  { id: 'TXN-8818', type: 'EARN', asset: 'Affiliate', amount: '$248', pnl: '+$248', time: '8h ago' },
  { id: 'TXN-8817', type: 'BUY', asset: 'SOL/USD', amount: '$2,200', pnl: '+$440', time: '12h ago' },
]

export default function DashboardPage() {
  const [balance, setBalance] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [showDeposit, setShowDeposit] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const { data } = await supabase.from('balances').select('*').eq('user_id', user.id).single()
      setBalance(data)
    }
    fetch()
  }, [])

  const totalBalance = balance?.total_balance || 130430
  const totalPnl = balance?.total_pnl || 24680
  const pnlPct = balance?.pnl_percentage || 23.3

  return (
    <div style={{ padding: 24 }}>

      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 13, color: '#484f58', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total Portfolio Value</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#e6edf3', letterSpacing: '-0.02em', lineHeight: 1 }}>
            ${totalBalance.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#3fb950', background: 'rgba(63,185,80,0.12)', border: '1px solid rgba(63,185,80,0.2)', padding: '4px 10px', borderRadius: 20 }}>
              ▲ +${totalPnl.toLocaleString()} all time
            </span>
            <span style={{ fontSize: 12, color: '#3fb950' }}>+{pnlPct}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowDeposit(true)}
            style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}>
            + Deposit
          </button>
          <Link href="/dashboard/withdraw">
            <button style={{ padding: '11px 24px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 13, cursor: 'pointer' }}>
              Withdraw
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Crypto Holdings', value: `$${(balance?.crypto_balance || 41280).toLocaleString()}`, icon: '₿', change: '+10.2%', positive: true },
          { label: 'Stock Portfolio', value: `$${(balance?.stocks_balance || 38750).toLocaleString()}`, icon: '📈', change: '-3.0%', positive: false },
          { label: 'Affiliate Income', value: `$${(balance?.affiliate_balance || 15480).toLocaleString()}`, icon: '🔗', change: '+13.5%', positive: true },
          { label: 'Active Signals', value: '12', icon: '⚡', change: '4 new today', positive: true },
        ].map((card, i) => (
          <div key={i} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 48, opacity: 0.06 }}>{card.icon}</div>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3', marginBottom: 6 }}>{card.value}</div>
            <div style={{ fontSize: 11, color: card.positive ? '#3fb950' : '#f85149' }}>{card.change}</div>
          </div>
        ))}
      </div>

      {/* Chart + Assets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Portfolio Chart */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>Portfolio Growth</div>
              <div style={{ fontSize: 11, color: '#484f58' }}>12 month performance</div>
            </div>
            <span style={{ fontSize: 11, color: '#3fb950', background: 'rgba(63,185,80,0.1)', padding: '4px 10px', borderRadius: 20 }}>▲ +118% YTD</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={pnlData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#161b22" />
              <XAxis dataKey="date" stroke="#484f58" tick={{ fontSize: 10, fill: '#484f58' }} />
              <YAxis stroke="#484f58" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, fontSize: 11 }} formatter={(v: any) => [`$${v.toLocaleString()}`, 'Portfolio Value']} />
              <Area type="monotone" dataKey="value" stroke="#C9A84C" strokeWidth={2.5} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Assets */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>Top Holdings</div>
          <div style={{ fontSize: 11, color: '#484f58', marginBottom: 16 }}>Your best performing assets</div>
          {assets.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < assets.length - 1 ? '1px solid #161b22' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${a.color}18`, border: `1px solid ${a.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: a.color, flexShrink: 0 }}>
                  {a.name.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>{a.name.split('(')[0].trim()}</div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>{a.amount}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>${a.value.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: a.positive ? '#3fb950' : '#f85149' }}>{a.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>⚡ Trading Signals Available</div>
          <div style={{ fontSize: 12, color: '#8b949e' }}>Get real-time buy/sell signals for crypto and stocks. Upgrade your plan to unlock all signals.</div>
        </div>
        <Link href="/dashboard/signals">
          <button style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid #C9A84C', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 20 }}>
            View Signals →
          </button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>Recent Activity</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>Your latest trades and transactions</div>
          </div>
          <Link href="/dashboard/trades">
            <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #C9A84C', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: 11, cursor: 'pointer' }}>
              View All →
            </button>
          </Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #161b22' }}>
              {['ID', 'Asset', 'Type', 'Amount', 'P&L', 'Time'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #161b22' }}>
                <td style={{ padding: '12px', fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>{t.id}</td>
                <td style={{ padding: '12px', fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>{t.asset}</td>
                <td style={{ padding: '12px', fontSize: 10, fontWeight: 700, color: t.type === 'BUY' ? '#3fb950' : t.type === 'SELL' ? '#f85149' : '#C9A84C' }}>{t.type}</td>
                <td style={{ padding: '12px', fontSize: 12, color: '#e6edf3' }}>{t.amount}</td>
                <td style={{ padding: '12px', fontSize: 12, fontWeight: 600, color: t.pnl.startsWith('+') ? '#3fb950' : '#f85149' }}>{t.pnl}</td>
                <td style={{ padding: '12px', fontSize: 11, color: '#484f58' }}>{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeposit(false) }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>Deposit Funds</div>
              <button onClick={() => setShowDeposit(false)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 32, height: 32, fontSize: 14 }}>✕</button>
            </div>
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#c9d1d9', lineHeight: 1.8, margin: 0 }}>
                To avoid <strong style={{ color: '#C9A84C' }}>loss of trades</strong> or missing <strong style={{ color: '#C9A84C' }}>profitable market signals</strong>, we make use of <strong style={{ color: '#C9A84C' }}>cryptocurrency (Bitcoin preferably)</strong> for funding. This ensures <strong style={{ color: '#C9A84C' }}>fast processing</strong> aligned with our <strong style={{ color: '#C9A84C' }}>automated strategy</strong>.
              </p>
            </div>
            <Link href="/dashboard/deposit" onClick={() => setShowDeposit(false)}>
              <button style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Continue to Deposit →
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
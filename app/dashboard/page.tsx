'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const pnlData = [
  { date: 'Jan', total: 42000 }, { date: 'Feb', total: 47500 },
  { date: 'Mar', total: 43200 }, { date: 'Apr', total: 56800 },
  { date: 'May', total: 61200 }, { date: 'Jun', total: 58700 },
  { date: 'Jul', total: 67400 }, { date: 'Aug', total: 72100 },
  { date: 'Sep', total: 69800 }, { date: 'Oct', total: 78500 },
  { date: 'Nov', total: 84200 }, { date: 'Dec', total: 91600 },
]

const allocation = [
  { name: 'Coinbase', value: 31, color: '#0052FF' },
  { name: 'Bybit', value: 27, color: '#F7A600' },
  { name: 'IBKR', value: 30, color: '#00B386' },
  { name: 'Amazon', value: 12, color: '#FF9900' },
]

const trades = [
  { id: 'TXN-8821', platform: 'Coinbase', asset: 'BTC/USD', type: 'BUY', amount: '$12,400', pnl: '+$1,240', time: '2h ago', color: '#0052FF' },
  { id: 'TXN-8820', platform: 'Bybit', asset: 'ETH/USDT', type: 'SELL', amount: '$4,800', pnl: '+$320', time: '4h ago', color: '#F7A600' },
  { id: 'TXN-8819', platform: 'IBKR', asset: 'AAPL', type: 'BUY', amount: '$8,120', pnl: '-$180', time: '6h ago', color: '#00B386' },
  { id: 'TXN-8818', platform: 'Amazon', asset: 'Affiliate', type: 'EARN', amount: '$248', pnl: '+$248', time: '8h ago', color: '#FF9900' },
  { id: 'TXN-8817', platform: 'Coinbase', asset: 'SOL/USD', type: 'BUY', amount: '$2,200', pnl: '+$440', time: '12h ago', color: '#0052FF' },
]

const platforms = [
  { name: 'Coinbase', icon: '◈', balance: '$41,280', pnl: '+$3,840', pct: '+10.2%', positive: true, color: '#0052FF' },
  { name: 'Bybit', icon: '◆', balance: '$34,920', pnl: '+$2,160', pct: '+6.6%', positive: true, color: '#F7A600' },
  { name: 'IBKR', icon: '◇', balance: '$38,750', pnl: '-$1,200', pct: '-3.0%', positive: false, color: '#00B386' },
  { name: 'Amazon', icon: '◉', balance: '$15,480', pnl: '+$1,840', pct: '+13.5%', positive: true, color: '#FF9900' },
]

export default function DashboardPage() {
  const [showDeposit, setShowDeposit] = useState(false)

  return (
    <>
    <div style={{ padding: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Total Net Worth</div>
          <div style={{ fontSize: 38, fontWeight: 700, color: '#e6edf3', letterSpacing: '-0.02em' }}>$130,430</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 11, color: '#3fb950', background: 'rgba(35,134,54,0.2)', padding: '3px 8px', borderRadius: 20 }}>▲ +$8,040 today</span>
            <span style={{ fontSize: 12, color: '#484f58' }}>+6.6% this month</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowDeposit(true)}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #C9A84C, #E8D08C)',
              color: '#060a0f', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.05em',
            }}>
            + DEPOSIT
          </button>
          <Link href="/dashboard/withdraw">
            <button style={{
              padding: '10px 20px', borderRadius: 8,
              border: '1px solid #21262d', background: 'transparent',
              color: '#e6edf3', fontSize: 12, cursor: 'pointer',
            }}>
              WITHDRAW
            </button>
          </Link>
        </div>
      </div>

      {/* Platform Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {platforms.map((p) => (
          <div key={p.name} style={{
            background: '#0d1117', border: `1px solid ${p.color}22`,
            borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderRadius: '0 12px 0 60px', background: `${p.color}11` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, color: p.color }}>{p.icon}</span>
                <span style={{ fontSize: 11, color: '#8b949e' }}>{p.name}</span>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 6px #3fb950' }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{p.balance}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: p.positive ? '#3fb950' : '#f85149', background: p.positive ? 'rgba(35,134,54,0.2)' : 'rgba(218,54,51,0.2)', padding: '3px 8px', borderRadius: 20 }}>{p.pnl}</span>
              <span style={{ fontSize: 11, color: p.positive ? '#3fb950' : '#f85149' }}>{p.pct}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* P&L Chart */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>Portfolio 
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>Performance</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>12 month overview</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={pnlData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#161b22" />
              <XAxis dataKey="date" stroke="#484f58" tick={{ fontSize: 10, fill: '#484f58' }} />
              <YAxis stroke="#484f58" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8 }} labelStyle={{ color: '#8b949e' }} />
              <Area type="monotone" dataKey="total" stroke="#C9A84C" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>Allocation</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>By platform</div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={allocation} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={0}>
                {allocation.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 8 }}>
            {allocation.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#8b949e', flex: 1 }}>{d.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#e6edf3' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
</div>

      {/* TradingView Chart */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>Live Market Chart</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>Real-time price data</div>
          </div>
          <span style={{ fontSize: 11, color: '#3fb950', background: 'rgba(63,185,80,0.1)', padding: '4px 10px', borderRadius: 20 }}>● LIVE</span>
        </div>
        <div style={{ borderRadius: 8, overflow: 'hidden' }}>
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=BINANCE:BTCUSDT&interval=60&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=0&toolbarbg=0d1117&theme=dark&style=1&timezone=Etc/UTC&withdateranges=1&showpopupbutton=0&studies=[]&locale=en"
            style={{ width: '100%', height: 300, border: 'none', borderRadius: 8 }}
            allowTransparency={true}
          />
        </div>
      </div>

      {/* Recent Trades */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #161b22' }}>
              {['TXN ID', 'Platform', 'Asset', 'Type', 'Amount', 'P&L', 'Time'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #0d1117' }}>
                <td style={{ padding: '12px', fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>{t.id}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.color, background: `${t.color}18`, padding: '2px 8px', borderRadius: 4 }}>{t.platform}</span>
                </td>
                <td style={{ padding: '12px', fontSize: 12, color: '#e6edf3' }}>{t.asset}</td>
                <td style={{ padding: '12px', fontSize: 10, fontWeight: 700, color: t.type === 'BUY' ? '#3fb950' : t.type === 'SELL' ? '#f85149' : '#C9A84C' }}>{t.type}</td>
                <td style={{ padding: '12px', fontSize: 12, color: '#e6edf3' }}>{t.amount}</td>
                <td style={{ padding: '12px', fontSize: 12, fontWeight: 600, color: t.pnl.startsWith('+') ? '#3fb950' : '#f85149' }}>{t.pnl}</td>
                <td style={{ padding: '12px', fontSize: 11, color: '#484f58' }}>{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeposit(false) }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>Deposit Funds</div>
              <button onClick={() => setShowDeposit(false)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 32, height: 32, fontSize: 14 }}>✕</button>
            </div>
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
              <p style={{ fontSize: 13, color: '#c9d1d9', lineHeight: 1.7, margin: 0 }}>
                To avoid <strong style={{ color: '#C9A84C' }}>loss of trades</strong> or missing <strong style={{ color: '#C9A84C' }}>profitable market signals</strong>, we make use of <strong style={{ color: '#C9A84C' }}>cryptocurrency (Bitcoin preferably)</strong> for funding brokerage accounts. This method ensures <strong style={{ color: '#C9A84C' }}>fast processing</strong> and aligns with the trading system's <strong style={{ color: '#C9A84C' }}>automated strategy</strong>.
              </p>
            </div>
            {[
              { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', desc: 'Buy crypto instantly with card or bank', url: 'https://www.moonpay.com/buy/btc' },
              { name: 'Binance', icon: '🔶', color: '#F7A600', desc: 'Use your Binance account to send BTC', url: 'https://www.binance.com/en/crypto/buy/USD/BTC' },
              { name: 'Paybis', icon: '💳', color: '#00C2FF', desc: 'Fast crypto purchase with 100+ methods', url: 'https://paybis.com/buy-bitcoin/' },
              { name: 'Coinbase', icon: '◈', color: '#0052FF', desc: "America's most trusted crypto platform", url: 'https://www.coinbase.com/buy-bitcoin' },
            ].map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: `${p.color}0d`, border: `1px solid ${p.color}33`, borderRadius: 10, marginBottom: 10, cursor: 'pointer' }}>
                  <span style={{ fontSize: 22 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#8b949e' }}>{p.desc}</div>
                  </div>
                  <span style={{ color: p.color, fontSize: 16 }}>→</span>
                </div>
              </a>
            ))}
            <button onClick={() => setShowDeposit(false)} style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 12, cursor: 'pointer', marginTop: 8 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
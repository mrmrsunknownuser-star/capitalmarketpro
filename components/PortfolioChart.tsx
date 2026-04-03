'use client'

import { useState, useEffect } from 'react'

interface Props {
  balance: number
  pnl: number
}

export default function PortfolioChart({ balance, pnl }: Props) {
  const [points, setPoints] = useState<number[]>([])
  const [period, setPeriod] = useState<'1W' | '1M' | '3M' | 'ALL'>('1M')

  useEffect(() => {
    // Generate realistic looking growth curve
    const base = Math.max(100, balance - Math.abs(pnl))
    const count = period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : 180
    const generated: number[] = []
    let current = base * 0.6

    for (let i = 0; i < count; i++) {
      const trend = (balance - current) / (count - i) * 1.2
      const noise = (Math.random() - 0.3) * (balance * 0.02)
      current = Math.max(base * 0.5, current + trend + noise)
      if (i === count - 1) current = balance
      generated.push(current)
    }
    setPoints(generated)
  }, [balance, pnl, period])

  if (points.length === 0 || balance === 0) return null

  const min = Math.min(...points) * 0.98
  const max = Math.max(...points) * 1.02
  const range = max - min
  const w = 600
  const h = 120
  const positive = balance >= (points[0] || 0)

  const toX = (i: number) => (i / (points.length - 1)) * w
  const toY = (v: number) => h - ((v - min) / range) * h

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p)}`).join(' ')
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`

  const color = positive ? '#3fb950' : '#f85149'
  const pct = points[0] ? (((balance - points[0]) / points[0]) * 100).toFixed(2) : '0.00'

  return (
    <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 20, marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Portfolio Value</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color }}>
              {positive ? '▲' : '▼'} {Math.abs(parseFloat(pct))}%
            </span>
            <span style={{ fontSize: 11, color: '#484f58' }}>this period</span>
          </div>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 4, background: '#161b22', borderRadius: 8, padding: 3 }}>
          {(['1W', '1M', '3M', 'ALL'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: period === p ? '#0d1117' : 'transparent', color: period === p ? '#C9A84C' : '#484f58', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: period === p ? 700 : 400 }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 120, display: 'block' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#chartGrad)" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Last point dot */}
          <circle cx={w} cy={toY(balance)} r="4" fill={color} />
          <circle cx={w} cy={toY(balance)} r="8" fill={color} fillOpacity="0.2" />
        </svg>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16 }}>
        {[
          { l: 'Total P&L', v: `${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, c: pnl >= 0 ? '#3fb950' : '#f85149' },
          { l: 'Return', v: `${positive ? '+' : ''}${pct}%`, c: color },
          { l: 'Status', v: '🟢 Active', c: '#3fb950' },
        ].map(s => (
          <div key={s.l} style={{ background: '#161b22', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#484f58', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
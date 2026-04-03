'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  { name: 'Starter', roi: 5, days: 7, min: 200, color: '#8b949e', icon: '🌱' },
  { name: 'Silver', roi: 8, days: 14, min: 1000, color: '#8b949e', icon: '🥈' },
  { name: 'Gold', roi: 12, days: 21, min: 5000, color: '#C9A84C', icon: '🥇', popular: true },
  { name: 'Platinum', roi: 15, days: 30, min: 20000, color: '#0052FF', icon: '💎' },
  { name: 'Elite', roi: 20, days: 30, min: 50000, color: '#7B2BF9', icon: '👑' },
  { name: 'Black', roi: 25, days: 30, min: 100000, color: '#e6edf3', icon: '🖤' },
]

export default function ROICalculator() {
  const [amount, setAmount] = useState('5000')
  const [selectedPlan, setSelectedPlan] = useState(PLANS[2])

  const dailyProfit = (parseFloat(amount) || 0) * (selectedPlan.roi / 100)
  const totalProfit = dailyProfit * selectedPlan.days
  const totalReturn = (parseFloat(amount) || 0) + totalProfit
  const roi = selectedPlan.roi * selectedPlan.days

  return (
    <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 22, marginBottom: 24, fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ fontSize: 24 }}>🧮</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>ROI Calculator</div>
          <div style={{ fontSize: 11, color: '#484f58' }}>See your potential returns before investing</div>
        </div>
      </div>

      {/* Plan selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {PLANS.map(plan => (
          <button key={plan.name} onClick={() => setSelectedPlan(plan)}
            style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${selectedPlan.name === plan.name ? plan.color : '#21262d'}`, background: selectedPlan.name === plan.name ? `${plan.color}18` : 'transparent', color: selectedPlan.name === plan.name ? plan.color : '#8b949e', fontSize: 11, fontWeight: selectedPlan.name === plan.name ? 700 : 400, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {plan.icon} {plan.name}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Investment Amount (USD)
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 800, color: '#484f58' }}>$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={`Min $${selectedPlan.min.toLocaleString()}`}
            style={{ width: '100%', background: '#161b22', border: `1px solid ${selectedPlan.color}44`, borderRadius: 10, padding: '13px 14px 13px 30px', color: selectedPlan.color, fontSize: 22, fontWeight: 800, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
            onFocus={e => e.target.style.borderColor = selectedPlan.color}
            onBlur={e => e.target.style.borderColor = `${selectedPlan.color}44`}
          />
        </div>
        {parseFloat(amount) > 0 && parseFloat(amount) < selectedPlan.min && (
          <div style={{ fontSize: 11, color: '#f85149', marginTop: 6 }}>
            ⚠ Min investment for {selectedPlan.name} plan is ${selectedPlan.min.toLocaleString()}
          </div>
        )}

        {/* Quick amounts */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {[selectedPlan.min, selectedPlan.min * 2, selectedPlan.min * 5].map(v => (
            <button key={v} onClick={() => setAmount(v.toString())}
              style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${selectedPlan.color}33`, background: 'transparent', color: selectedPlan.color, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
              ${v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ background: `${selectedPlan.color}08`, border: `1px solid ${selectedPlan.color}22`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
          {[
            { l: `Daily Profit (${selectedPlan.roi}%/day)`, v: `$${dailyProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, c: selectedPlan.color },
            { l: `Duration`, v: `${selectedPlan.days} Days`, c: '#8b949e' },
            { l: `Total Profit`, v: `$${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, c: '#3fb950' },
            { l: `ROI`, v: `${roi}%`, c: '#3fb950' },
          ].map(s => (
            <div key={s.l} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: '#484f58', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Total return highlight */}
        <div style={{ background: `${selectedPlan.color}15`, border: `1px solid ${selectedPlan.color}33`, borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#8b949e' }}>💰 Total Return after {selectedPlan.days} days</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: selectedPlan.color }}>
            ${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <Link href="/dashboard/deposit">
        <button style={{ width: '100%', padding: '14px 0', background: `linear-gradient(135deg,${selectedPlan.color},${selectedPlan.color}cc)`, border: 'none', borderRadius: 12, color: selectedPlan.color === '#e6edf3' ? '#060a0f' : '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', boxShadow: `0 4px 20px ${selectedPlan.color}33` }}>
          Start Earning ${dailyProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}/day →
        </button>
      </Link>
    </div>
  )
}
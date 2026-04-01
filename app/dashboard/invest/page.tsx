'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Starter',
    min: 200, max: 999,
    minLabel: '$200', maxLabel: '$999',
    roi: '5%', duration: '7 Days', total: '35%',
    color: '#8b949e', icon: '🌱',
    features: [
      'Minimum deposit $200',
      '5% daily returns',
      '7 day trading cycle',
      'Auto-compounding',
      'Email notifications',
      'Basic support',
    ],
  },
  {
    name: 'Silver',
    min: 1000, max: 4999,
    minLabel: '$1,000', maxLabel: '$4,999',
    roi: '8%', duration: '14 Days', total: '112%',
    color: '#8b949e', icon: '🥈',
    features: [
      'Minimum deposit $1,000',
      '8% daily returns',
      '14 day trading cycle',
      'Auto-compounding',
      'Priority notifications',
      'Live chat support',
      'Portfolio analytics',
    ],
  },
  {
    name: 'Gold',
    min: 5000, max: 19999,
    minLabel: '$5,000', maxLabel: '$19,999',
    roi: '12%', duration: '21 Days', total: '252%',
    color: '#C9A84C', icon: '🥇',
    popular: true,
    features: [
      'Minimum deposit $5,000',
      '12% daily returns',
      '21 day trading cycle',
      'Auto-compounding',
      'Real-time alerts',
      'Priority support',
      'Advanced analytics',
      'Trading signals included',
    ],
  },
  {
    name: 'Platinum',
    min: 20000, max: 49999,
    minLabel: '$20,000', maxLabel: '$49,999',
    roi: '15%', duration: '30 Days', total: '450%',
    color: '#0052FF', icon: '💎',
    features: [
      'Minimum deposit $20,000',
      '15% daily returns',
      '30 day trading cycle',
      'Auto-compounding',
      'Dedicated account manager',
      '24/7 VIP support',
      'Full signal access',
      'Weekly strategy calls',
      'Portfolio rebalancing',
    ],
  },
  {
    name: 'Elite',
    min: 50000, max: 99999,
    minLabel: '$50,000', maxLabel: '$99,999',
    roi: '20%', duration: '30 Days', total: '600%',
    color: '#7B2BF9', icon: '👑',
    features: [
      'Minimum deposit $50,000',
      '20% daily returns',
      '30 day trading cycle',
      'Auto-compounding',
      'Personal fund manager',
      'Priority withdrawals',
      'All signals unlimited',
      'Daily strategy sessions',
      'Custom portfolio plan',
      'VIP card included',
    ],
  },
  {
    name: 'Black',
    min: 100000, max: 999999999,
    minLabel: '$100,000', maxLabel: 'Unlimited',
    roi: '25%', duration: '30 Days', total: '750%',
    color: '#e6edf3', icon: '🖤',
    features: [
      'Minimum deposit $100,000',
      '25% daily returns',
      '30 day trading cycle',
      'Auto-compounding',
      'Senior fund manager',
      'Instant withdrawals',
      'All features unlocked',
      'Private trading desk',
      'Custom strategy',
      'Black card + concierge',
      'Tax optimization',
    ],
  },
]

export default function InvestPage() {
  const [selected, setSelected] = useState('')
  const [amount, setAmount] = useState('')
  const [showCalc, setShowCalc] = useState(false)

  const selectedPlan = PLANS.find(p => p.name === selected)

  const dailyProfit = selectedPlan && amount
    ? (parseFloat(amount) * parseFloat(selectedPlan.roi) / 100).toFixed(2)
    : '0.00'

  const totalProfit = selectedPlan && amount
    ? (parseFloat(amount) * parseFloat(selectedPlan.roi) / 100 * parseInt(selectedPlan.duration)).toFixed(2)
    : '0.00'

  const totalReturn = selectedPlan && amount
    ? (parseFloat(amount) + parseFloat(totalProfit)).toFixed(2)
    : '0.00'

  return (
    <div style={{ padding: '16px 16px 40px', fontFamily: 'monospace' }}>
      <style>{`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .calc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .plans-grid { grid-template-columns: 1fr !important; }
          .calc-grid { grid-template-columns: 1fr 1fr !important; }
          .trust-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f' }}>C</div>
          <div style={{ fontSize: 9, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CapitalMarket Pro · Automated Investment</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>Investment Plans</div>
        <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.7 }}>
          Fully automated AI trading — generates consistent daily returns 24/7. No experience required.
        </div>
      </div>

      {/* Automated system banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 14, padding: 18, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 28 }}>🤖</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 6 }}>100% Automated Trading System</div>
            <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>
              Your funds are managed by our AI algorithm that executes thousands of trades per second. Just deposit, choose a plan, and earn daily returns automatically.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
            {[{ v: '84%', l: 'Win Rate' }, { v: '24/7', l: 'Active' }, { v: '$2.4B+', l: 'Managed' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#C9A84C' }}>{s.v}</div>
                <div style={{ fontSize: 9, color: '#484f58' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="plans-grid" style={{ marginBottom: 24 }}>
        {PLANS.map(plan => (
          <div
            key={plan.name}
            onClick={() => { setSelected(plan.name); setShowCalc(true) }}
            style={{
              background: selected === plan.name
                ? `${plan.color}12`
                : plan.popular ? 'rgba(201,168,76,0.06)' : '#0d1117',
              border: `2px solid ${selected === plan.name ? plan.color : plan.popular ? `${plan.color}55` : `${plan.color}33`}`,
              borderRadius: 14,
              padding: 18,
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.15s',
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#060a0f', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                ⭐ MOST POPULAR
              </div>
            )}

            {selected === plan.name && (
              <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800 }}>✓</div>
            )}

            {/* Plan name */}
            <div style={{ fontSize: 12, fontWeight: 800, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              {plan.icon} {plan.name} Plan
            </div>

            {/* ROI */}
            <div style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}33`, borderRadius: 10, padding: '12px 14px', marginBottom: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: plan.color, lineHeight: 1 }}>{plan.roi}</div>
              <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>Daily Returns</div>
              <div style={{ fontSize: 11, color: plan.color, marginTop: 2, fontWeight: 600 }}>{plan.total} Total · {plan.duration}</div>
            </div>

            {/* Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ background: '#161b22', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#484f58', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Min</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{plan.minLabel}</div>
              </div>
              <div style={{ background: '#161b22', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#484f58', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{plan.maxLabel}</div>
              </div>
            </div>

            {/* Features */}
            <div style={{ marginBottom: 14 }}>
              {plan.features.slice(0, 5).map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, fontSize: 11, color: '#8b949e', alignItems: 'flex-start' }}>
                  <span style={{ color: plan.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
              {plan.features.length > 5 && (
                <div style={{ fontSize: 10, color: plan.color, marginTop: 4 }}>+{plan.features.length - 5} more features</div>
              )}
            </div>

            {/* Button */}
            <button
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 10,
                border: `1px solid ${plan.color}`,
                background: selected === plan.name ? plan.color : `${plan.color}0d`,
                color: selected === plan.name ? (plan.color === '#e6edf3' ? '#060a0f' : '#fff') : plan.color,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              {selected === plan.name ? '✓ Selected' : `Invest ${plan.minLabel}+`}
            </button>
          </div>
        ))}
      </div>

      {/* Calculator */}
      {showCalc && selectedPlan && (
        <div style={{ background: '#0d1117', border: `1px solid ${selectedPlan.color}33`, borderRadius: 14, padding: 22, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 20 }}>
            💰 Calculator — {selectedPlan.name} Plan
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Investment Amount (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Min. ${selectedPlan.minLabel}`}
              style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
              onFocus={e => e.target.style.borderColor = selectedPlan.color}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {[selectedPlan.min, selectedPlan.min * 2, selectedPlan.min * 5, selectedPlan.min * 10].map(v => (
              <button key={v} onClick={() => setAmount(v.toString())} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${selectedPlan.color}33`, background: 'transparent', color: selectedPlan.color, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                ${v.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="calc-grid" style={{ marginBottom: 18 }}>
            {[
              { label: 'Daily Profit', value: `$${parseFloat(dailyProfit).toLocaleString()}`, color: selectedPlan.color },
              { label: 'Total Profit', value: `$${parseFloat(totalProfit).toLocaleString()}`, color: '#3fb950' },
              { label: 'Total Return', value: `$${parseFloat(totalReturn).toLocaleString()}`, color: selectedPlan.color },
              { label: 'ROI', value: selectedPlan.total, color: '#3fb950' },
            ].map(s => (
              <div key={s.label} style={{ background: '#161b22', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#484f58', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {amount && parseFloat(amount) < selectedPlan.min && (
            <div style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#f85149' }}>⚠️ Minimum investment for {selectedPlan.name} plan is {selectedPlan.minLabel}</div>
            </div>
          )}

          <Link href="/dashboard/deposit">
            <button style={{ width: '100%', padding: '14px 0', background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}cc)`, border: 'none', borderRadius: 12, color: selectedPlan.color === '#e6edf3' ? '#060a0f' : '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              Activate {selectedPlan.name} Plan — Deposit Now →
            </button>
          </Link>
        </div>
      )}

      {/* Trust badges */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 16, textAlign: 'center' }}>
          Why traders trust CapitalMarket Pro
        </div>
        <div className="trust-grid">
          {[
            { icon: '🔒', title: 'Funds Protected', desc: '256-bit SSL + cold storage' },
            { icon: '🤖', title: 'Fully Automated', desc: 'AI trading 24/7/365' },
            { icon: '⚡', title: 'Instant Activation', desc: 'Start earning immediately' },
            { icon: '💸', title: 'Guaranteed Returns', desc: 'Fixed daily ROI rate' },
          ].map(item => (
            <div key={item.title} style={{ textAlign: 'center', padding: 14, background: '#161b22', borderRadius: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#484f58', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58', lineHeight: 1.7 }}>
          © 2025 CapitalMarket Pro Financial Services<br />
          All Rights Reserved · Past performance does not guarantee future results
        </div>
      </div>
    </div>
  )
}
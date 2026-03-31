'use client'

import { useState } from 'react'
import Link from 'next/link'

const INVESTMENT_PLANS = [
  {
    name: 'Starter',
    min: '$200',
    max: '$999',
    roi: '5%',
    period: 'Daily',
    duration: '7 Days',
    total: '35%',
    color: '#8b949e',
    bg: 'rgba(139,148,158,0.08)',
    features: [
      'Minimum deposit $200',
      '5% daily returns',
      '7 day trading cycle',
      'Auto-compounding',
      'Email notifications',
      'Basic support',
    ],
    recommended: false,
  },
  {
    name: 'Silver',
    min: '$1,000',
    max: '$4,999',
    roi: '8%',
    period: 'Daily',
    duration: '14 Days',
    total: '112%',
    color: '#8b949e',
    bg: 'rgba(139,148,158,0.08)',
    features: [
      'Minimum deposit $1,000',
      '8% daily returns',
      '14 day trading cycle',
      'Auto-compounding',
      'Priority notifications',
      'Live chat support',
      'Portfolio analytics',
    ],
    recommended: false,
  },
  {
    name: 'Gold',
    min: '$5,000',
    max: '$19,999',
    roi: '12%',
    period: 'Daily',
    duration: '21 Days',
    total: '252%',
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.08)',
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
    recommended: true,
  },
  {
    name: 'Platinum',
    min: '$20,000',
    max: '$49,999',
    roi: '15%',
    period: 'Daily',
    duration: '30 Days',
    total: '450%',
    color: '#0052FF',
    bg: 'rgba(0,82,255,0.08)',
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
    recommended: false,
  },
  {
    name: 'Elite',
    min: '$50,000',
    max: '$99,999',
    roi: '20%',
    period: 'Daily',
    duration: '30 Days',
    total: '600%',
    color: '#7B2BF9',
    bg: 'rgba(123,43,249,0.08)',
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
    recommended: false,
  },
  {
    name: 'Black',
    min: '$100,000',
    max: 'Unlimited',
    roi: '25%',
    period: 'Daily',
    duration: '30 Days',
    total: '750%',
    color: '#e6edf3',
    bg: 'rgba(230,237,243,0.04)',
    features: [
      'Minimum deposit $100,000',
      '25% daily returns',
      '30 day trading cycle',
      'Auto-compounding',
      'Dedicated senior manager',
      'Instant withdrawals',
      'All features unlocked',
      'Private trading desk',
      'Custom investment strategy',
      'Black card + concierge',
      'Tax optimization included',
    ],
    recommended: false,
  },
]

export default function InvestPage() {
  const [selected, setSelected] = useState('')
  const [amount, setAmount] = useState('')
  const [showCalc, setShowCalc] = useState(false)

  const selectedPlan = INVESTMENT_PLANS.find(p => p.name === selected)
  const calcReturn = selectedPlan && amount ? (parseFloat(amount) * parseFloat(selectedPlan.roi) / 100 * parseInt(selectedPlan.duration)).toFixed(2) : null

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f' }}>C</div>
          <div style={{ fontSize: 10, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CapitalMarket Pro · Automated Investment</div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>Investment Plans</div>
        <div style={{ fontSize: 13, color: '#8b949e', maxWidth: 600 }}>
          Our fully automated trading system works 24/7 to generate consistent daily returns. All plans include auto-compounding and are managed by our AI-powered trading engine.
        </div>
      </div>

      {/* Automated system banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 28 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>100% Automated Trading System</div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>
            Your funds are managed by our proprietary AI algorithm that executes thousands of trades per second across crypto and stock markets. No manual intervention required — just deposit and earn.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[{ v: '84%', l: 'Win Rate' }, { v: '24/7', l: 'Active' }, { v: '$2.4B+', l: 'Managed' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#C9A84C' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {INVESTMENT_PLANS.map(plan => (
          <div key={plan.name} style={{
            background: plan.recommended ? plan.bg : '#0d1117',
            border: `2px solid ${selected === plan.name ? plan.color : plan.recommended ? plan.color : plan.color + '33'}`,
            borderRadius: 14, padding: 22, position: 'relative', cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
            onClick={() => { setSelected(plan.name); setShowCalc(true) }}>
            {plan.recommended && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#060a0f', fontSize: 9, fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                ⭐ MOST POPULAR
              </div>
            )}
            {selected === plan.name && (
              <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>✓</div>
            )}

            <div style={{ fontSize: 12, fontWeight: 800, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{plan.name} Plan</div>

            {/* ROI */}
            <div style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}33`, borderRadius: 10, padding: '12px 16px', marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: plan.color, lineHeight: 1 }}>{plan.roi}</div>
              <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>Daily Returns</div>
              <div style={{ fontSize: 11, color: plan.color, marginTop: 2, fontWeight: 600 }}>{plan.total} Total · {plan.duration}</div>
            </div>

            {/* Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ background: '#161b22', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#484f58', marginBottom: 3 }}>MINIMUM</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{plan.min}</div>
              </div>
              <div style={{ background: '#161b22', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#484f58', marginBottom: 3 }}>MAXIMUM</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{plan.max}</div>
              </div>
            </div>

            {/* Features */}
            <div style={{ marginBottom: 16 }}>
              {plan.features.slice(0, 5).map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6, fontSize: 11, color: '#8b949e' }}>
                  <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
              {plan.features.length > 5 && (
                <div style={{ fontSize: 10, color: plan.color }}>+{plan.features.length - 5} more features</div>
              )}
            </div>

            <button
              onClick={() => { setSelected(plan.name); setShowCalc(true) }}
              style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: `1px solid ${plan.color}`, background: selected === plan.name ? plan.color : `${plan.color}0d`, color: selected === plan.name ? '#fff' : plan.color, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              {selected === plan.name ? '✓ Selected' : `Invest ${plan.min}+`}
            </button>
          </div>
        ))}
      </div>

      {/* Calculator */}
      {showCalc && selectedPlan && (
        <div style={{ background: '#0d1117', border: `1px solid ${selectedPlan.color}33`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>
            💰 Investment Calculator — {selectedPlan.name} Plan
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Investment Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Min. ${selectedPlan.min}`}
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Projected Return</label>
              <div style={{ background: `${selectedPlan.color}0d`, border: `1px solid ${selectedPlan.color}33`, borderRadius: 8, padding: '12px 14px', fontSize: 20, fontWeight: 800, color: selectedPlan.color }}>
                {calcReturn ? `$${parseFloat(calcReturn).toLocaleString()}` : '$0.00'}
              </div>
            </div>
          </div>
          {amount && calcReturn && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Daily Profit', value: `$${(parseFloat(amount) * parseFloat(selectedPlan.roi) / 100).toFixed(2)}` },
                { label: 'Total Profit', value: `$${calcReturn}` },
                { label: 'Total Return', value: `$${(parseFloat(amount) + parseFloat(calcReturn)).toFixed(2)}` },
                { label: 'ROI', value: selectedPlan.total },
              ].map(s => (
                <div key={s.label} style={{ background: '#161b22', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedPlan.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
          <Link href="/dashboard/deposit">
            <button style={{ width: '100%', padding: '13px 0', background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}cc)`, border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              Activate {selectedPlan.name} Plan — Deposit Now →
            </button>
          </Link>
        </div>
      )}

      {/* Trust badges */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 16, textAlign: 'center' }}>Why traders trust CapitalMarket Pro</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { icon: '🔒', title: 'Funds Protected', desc: '256-bit SSL + cold storage' },
            { icon: '🤖', title: 'Fully Automated', desc: 'AI trading 24/7/365' },
            { icon: '⚡', title: 'Instant Activation', desc: 'Start earning immediately' },
            { icon: '💸', title: 'Guaranteed Returns', desc: 'Fixed daily ROI rate' },
          ].map(item => (
            <div key={item.title} style={{ textAlign: 'center', padding: 14, background: '#161b22', borderRadius: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
'use client'
import Link from 'next/link'
import { useState } from 'react'

const plans = [
  {
    name: 'Basic',
    price: '$99',
    period: '/month',
    color: '#8b949e',
    bg: 'rgba(139,148,158,0.08)',
    border: 'rgba(139,148,158,0.2)',
    description: 'Perfect for beginners',
    signals: 5,
    features: [
      '5 signals per day',
      'Crypto signals only',
      'Entry & exit points',
      'Email alerts',
      'Basic market analysis',
    ],
    disabled: ['Stock signals', 'Priority alerts', 'VIP support', 'Risk management'],
  },
  {
    name: 'Pro',
    price: '$299',
    period: '/month',
    color: '#0052FF',
    bg: 'rgba(0,82,255,0.08)',
    border: 'rgba(0,82,255,0.3)',
    description: 'For active traders',
    signals: 15,
    popular: true,
    features: [
      '15 signals per day',
      'Crypto + Stock signals',
      'Entry, exit & stop loss',
      'Email + Push alerts',
      'Detailed market analysis',
      'Risk management tips',
    ],
    disabled: ['Priority alerts', 'VIP support'],
  },
  {
    name: 'Elite',
    price: '$492',
    period: '/month',
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.08)',
    border: 'rgba(201,168,76,0.3)',
    description: 'For serious traders',
    signals: 30,
    features: [
      '30 signals per day',
      'Crypto + Stock signals',
      'Entry, exit & stop loss',
      'Priority email + Push alerts',
      'Advanced market analysis',
      'Risk management system',
      'Weekly market outlook',
    ],
    disabled: ['VIP support'],
  },
  {
    name: 'VIP',
    price: '$845',
    period: '/month',
    color: '#7B2BF9',
    bg: 'rgba(123,43,249,0.08)',
    border: 'rgba(123,43,249,0.3)',
    description: 'The ultimate package',
    signals: 999,
    features: [
      'Unlimited signals',
      'Crypto + Stock signals',
      'Entry, exit & stop loss',
      '24/7 Priority alerts',
      'Professional analysis',
      'Full risk management',
      'Daily market outlook',
      'Dedicated VIP support',
      '1-on-1 strategy calls',
    ],
    disabled: [],
  },
]

const liveSignals = [
  { asset: 'BTC/USD', type: 'BUY', entry: '$67,200', target: '$71,500', stopLoss: '$65,800', strength: 92, time: '10 mins ago', status: 'active' },
  { asset: 'ETH/USD', type: 'BUY', entry: '$3,480', target: '$3,750', stopLoss: '$3,320', strength: 87, time: '25 mins ago', status: 'active' },
  { asset: 'NVDA', type: 'BUY', entry: '$875', target: '$920', stopLoss: '$850', strength: 78, time: '1h ago', status: 'active' },
  { asset: 'SOL/USD', type: 'SELL', entry: '$142', target: '$128', stopLoss: '$148', strength: 71, time: '2h ago', status: 'active' },
  { asset: 'AAPL', type: 'BUY', entry: '$189', target: '$198', stopLoss: '$184', strength: 65, time: '3h ago', status: 'closed' },
]

export default function SignalsPage() {
  const [selectedPlan, setSelectedPlan] = useState('')
  const [tab, setTab] = useState<'signals' | 'plans'>('signals')

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#060a0f' }}>C</div>
          <div>
            <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CapitalMarket Pro</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', lineHeight: 1 }}>Trading Signals</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Professional buy/sell signals for crypto and stocks — powered by our automated trading system</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[{ id: 'signals', label: '⚡ Live Signals' }, { id: 'plans', label: '💎 Signal Plans' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}
          >{t.label}</button>
        ))}
      </div>

      {/* Live Signals Tab */}
      {tab === 'signals' && (
        <>
          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Active Signals', value: '4', color: '#3fb950' },
              { label: 'Win Rate (30d)', value: '84%', color: '#C9A84C' },
              { label: 'Avg. Return', value: '+12.4%', color: '#0052FF' },
              { label: 'Signals Today', value: '12', color: '#F7A600' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Signals list */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>Live Signals</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>Updated every 15 minutes</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950' }} />
                <span style={{ fontSize: 11, color: '#3fb950' }}>Live</span>
              </div>
            </div>

            {liveSignals.map((signal, i) => (
              <div key={i} style={{ background: '#161b22', border: `1px solid ${signal.type === 'BUY' ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)'}`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ padding: '4px 12px', borderRadius: 6, background: signal.type === 'BUY' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)', color: signal.type === 'BUY' ? '#3fb950' : '#f85149', fontSize: 12, fontWeight: 800 }}>{signal.type}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>{signal.asset}</div>
                    <span style={{ fontSize: 10, color: signal.status === 'active' ? '#3fb950' : '#484f58', background: signal.status === 'active' ? 'rgba(63,185,80,0.1)' : '#21262d', padding: '2px 8px', borderRadius: 10 }}>● {signal.status}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>{signal.time}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                  {[
                    { label: 'Entry Price', value: signal.entry, color: '#e6edf3' },
                    { label: 'Take Profit', value: signal.target, color: '#3fb950' },
                    { label: 'Stop Loss', value: signal.stopLoss, color: '#f85149' },
                  ].map(d => (
                    <div key={d.label} style={{ background: '#0d1117', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{d.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: '#484f58' }}>Signal Strength</span>
                  <div style={{ flex: 1, height: 6, background: '#0d1117', borderRadius: 3 }}>
                    <div style={{ width: `${signal.strength}%`, height: '100%', background: signal.strength > 80 ? '#3fb950' : signal.strength > 60 ? '#F7A600' : '#f85149', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: signal.strength > 80 ? '#3fb950' : '#F7A600' }}>{signal.strength}%</span>
                </div>
              </div>
            ))}

            {/* Locked signals teaser */}
            <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px dashed rgba(201,168,76,0.2)', borderRadius: 10, padding: 20, textAlign: 'center', marginTop: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>8 more signals available today</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 16 }}>Upgrade to Pro, Elite or VIP to unlock all signals</div>
              <button onClick={() => setTab('plans')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                View Plans →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Plans Tab */}
      {tab === 'plans' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>Choose Your Signal Plan</div>
            <div style={{ fontSize: 13, color: '#484f58' }}>All plans include access to our automated trading signal system. Cancel anytime.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {plans.map(plan => (
              <div key={plan.name} style={{ background: plan.popular ? 'rgba(0,82,255,0.06)' : '#0d1117', border: `2px solid ${selectedPlan === plan.name ? plan.color : plan.border}`, borderRadius: 14, padding: 24, position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setSelectedPlan(plan.name)}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#0052FF', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{plan.name}</div>
                <div style={{ fontSize: 11, color: '#484f58', marginBottom: 16 }}>{plan.description}</div>

                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#e6edf3' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: '#484f58' }}>{plan.period}</span>
                </div>

                <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16 }}>
                  <strong style={{ color: plan.color }}>{plan.signals === 999 ? 'Unlimited' : plan.signals}</strong> signals/day
                </div>

                <div style={{ marginBottom: 20 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 11, color: '#8b949e' }}>
                      <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>
                      {f}
                    </div>
                  ))}
                  {plan.disabled.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 11, color: '#484f58', textDecoration: 'line-through' }}>
                      <span style={{ flexShrink: 0 }}>✕</span>
                      {f}
                    </div>
                  ))}
                </div>

                <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: `1px solid ${plan.color}`, background: selectedPlan === plan.name ? plan.color : `${plan.color}0d`, color: selectedPlan === plan.name ? '#fff' : plan.color, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {selectedPlan === plan.name ? '✓ Selected' : `Get ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div style={{ background: '#0d1117', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>Ready to activate {selectedPlan} plan?</div>
                <div style={{ fontSize: 12, color: '#484f58' }}>Deposit funds to your account and contact support to activate your signal plan.</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/dashboard/deposit">
                  <button style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Deposit & Activate →
                  </button>
                </Link>
                <Link href="/dashboard/support">
                  <button style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 12, cursor: 'pointer' }}>
                    Contact Support
                  </button>
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
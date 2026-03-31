'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const INVESTMENT_PLANS = [
  { name: 'Starter', min: '$200', roi: '5%', duration: '7 Days', total: '35%', color: '#8b949e', icon: '🌱' },
  { name: 'Silver', min: '$1,000', roi: '8%', duration: '14 Days', total: '112%', color: '#8b949e', icon: '🥈' },
  { name: 'Gold', min: '$5,000', roi: '12%', duration: '21 Days', total: '252%', color: '#C9A84C', icon: '🥇', popular: true },
  { name: 'Platinum', min: '$20,000', roi: '15%', duration: '30 Days', total: '450%', color: '#0052FF', icon: '💎' },
  { name: 'Elite', min: '$50,000', roi: '20%', duration: '30 Days', total: '600%', color: '#7B2BF9', icon: '👑' },
  { name: 'Black', min: '$100,000', roi: '25%', duration: '30 Days', total: '750%', color: '#e6edf3', icon: '🖤' },
]

const SIGNAL_PLANS = [
  { name: 'Basic', price: '$99', period: '/mo', color: '#8b949e', signals: '5/day', features: ['Crypto signals', 'Email alerts', 'Basic analysis'] },
  { name: 'Pro', price: '$199', period: '/mo', color: '#0052FF', signals: '15/day', popular: true, features: ['Crypto + Stocks', 'Push + Email', 'Risk management'] },
  { name: 'Elite', price: '$349', period: '/mo', color: '#C9A84C', signals: '30/day', features: ['All markets', 'Priority alerts', 'Weekly outlook'] },
  { name: 'VIP', price: '$599', period: '/mo', color: '#7B2BF9', signals: 'Unlimited', features: ['All markets', '24/7 alerts', '1-on-1 calls'] },
]

type ModalType = {
  title: string
  amount: string
  type: string
  color: string
} | null

function PurchaseModal({ modal, onClose }: { modal: ModalType, onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState<any>(null)

  const BTC_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  const [copied, setCopied] = useState(false)

  const providers = [
    { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', url: 'https://www.moonpay.com/buy/btc' },
    { name: 'Binance', icon: '🔶', color: '#F7A600', url: 'https://www.binance.com/en/crypto/buy/USD/BTC' },
    { name: 'Paybis', icon: '💳', color: '#00C2FF', url: 'https://paybis.com/buy-bitcoin/' },
    { name: 'Coinbase', icon: '🔵', color: '#0052FF', url: 'https://www.coinbase.com/buy-bitcoin' },
  ]

  if (!modal) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28, fontFamily: 'monospace', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Activate {modal.title}</div>
            <div style={{ fontSize: 12, color: '#484f58' }}>Minimum investment: {modal.amount}</div>
          </div>
          <button onClick={onClose} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 32, height: 32, fontSize: 16 }}>✕</button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          {[{ n: 1, label: 'Notice' }, { n: 2, label: 'Provider' }, { n: 3, label: 'Send BTC' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: step > s.n ? modal.color : step === s.n ? `${modal.color}22` : '#161b22', border: `2px solid ${step >= s.n ? modal.color : '#21262d'}`, color: step > s.n ? '#060a0f' : step === s.n ? modal.color : '#484f58', flexShrink: 0 }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 10, color: step === s.n ? modal.color : '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? modal.color : '#21262d' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <>
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
              <p style={{ fontSize: 13, color: '#c9d1d9', lineHeight: 1.9, margin: 0 }}>
                To avoid <strong style={{ color: '#C9A84C' }}>loss of trades</strong> or missing <strong style={{ color: '#C9A84C' }}>profitable market signals</strong>, we make use of <strong style={{ color: '#C9A84C' }}>cryptocurrency (Bitcoin preferably)</strong> for funding brokerage accounts. This method ensures <strong style={{ color: '#C9A84C' }}>fast processing</strong> and aligns with the trading system's <strong style={{ color: '#C9A84C' }}>automated strategy</strong>.
              </p>
            </div>
            <div style={{ marginBottom: 20 }}>
              {[
                { l: '⚡ Processing Time', v: 'Under 30 minutes' },
                { l: '🔒 Network', v: 'Bitcoin (BTC) — Recommended' },
                { l: '📋 Minimum', v: modal.amount },
                { l: '💰 Deposit Fee', v: '0% — Free' },
              ].map(item => (
                <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22' }}>
                  <span style={{ fontSize: 12, color: '#8b949e' }}>{item.l}</span>
                  <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>{item.v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{ width: '100%', padding: '13px 0', background: `linear-gradient(135deg, ${modal.color}, ${modal.color}cc)`, border: 'none', borderRadius: 12, color: modal.color === '#e6edf3' ? '#060a0f' : '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              I Understand — Continue →
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <p style={{ fontSize: 12, color: '#8b949e', marginBottom: 16 }}>Choose a platform to purchase Bitcoin, then send it to activate your plan.</p>
            {providers.map(p => (
              <div key={p.name} onClick={() => { setProvider(p); setStep(3) }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: `${p.color}0d`, border: `1px solid ${p.color}33`, borderRadius: 12, marginBottom: 10, cursor: 'pointer' }}>
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', flex: 1 }}>{p.name}</span>
                <span style={{ color: '#484f58' }}>›</span>
              </div>
            ))}
            <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: 8, padding: '11px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && provider && (
          <>
            <div style={{ background: `${provider.color}0d`, border: `1px solid ${provider.color}33`, borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{provider.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>Step 1 — Buy BTC on {provider.name}</div>
                <div style={{ fontSize: 11, color: '#8b949e' }}>Opens in new tab</div>
              </div>
              <a href={provider.url} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 14px', background: provider.color, border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>Open →</a>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>Step 2 — Send BTC to activate your plan</div>
              <div style={{ fontSize: 11, color: '#8b949e' }}>Send exactly {modal.amount}+ worth of BTC to the address below.</div>
            </div>
            <div onClick={() => { navigator.clipboard.writeText(BTC_ADDRESS); setCopied(true); setTimeout(() => setCopied(false), 2500) }}
              style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 14, marginBottom: 14, cursor: 'pointer' }}>
              <div style={{ fontSize: 10, color: '#484f58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bitcoin (BTC) Address</div>
              <div style={{ fontSize: 11, color: '#C9A84C', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.6 }}>{BTC_ADDRESS}</div>
              <div style={{ marginTop: 8, fontSize: 10, color: copied ? '#3fb950' : '#484f58' }}>{copied ? '✓ Copied!' : 'Click to copy'}</div>
            </div>
            <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#f85149' }}>⚠ Send Bitcoin (BTC) only. Wrong asset = permanent loss.</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ padding: '12px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
              <button onClick={onClose} style={{ padding: '12px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>✓ Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState<any>(null)
  const [modal, setModal] = useState<ModalType>(null)
  const [kycStatus, setKycStatus] = useState('none')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const { data: profile } = await supabase.from('users').select('full_name, kyc_status, tier').eq('id', user.id).single()
      const { data: bal } = await supabase.from('balances').select('*').eq('user_id', user.id).single()
      setBalance(bal)
      setKycStatus(profile?.kyc_status || 'none')
    }
    init()
  }, [])

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Trader'
  const totalBalance = balance?.total_balance || 0
  const totalPnl = balance?.total_pnl || 0

  return (
    <div style={{ padding: '20px 20px 40px', fontFamily: 'monospace' }}>

      {/* Welcome Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>
          Welcome back, {firstName} 👋
        </div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Here's your CapitalMarket Pro overview</div>
      </div>

      {/* KYC Banner */}
      {kycStatus !== 'approved' && (
        <div style={{ background: 'linear-gradient(135deg, rgba(248,81,73,0.1), rgba(248,81,73,0.04))', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f85149', marginBottom: 4 }}>🪪 Complete Identity Verification</div>
            <div style={{ fontSize: 12, color: '#8b949e' }}>Verify your identity to unlock withdrawals and full platform access.</div>
          </div>
          <Link href="/dashboard/kyc">
            <button style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid #f85149', background: 'rgba(248,81,73,0.1)', color: '#f85149', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              Verify Now →
            </button>
          </Link>
        </div>
      )}

      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Total Balance</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#C9A84C', marginBottom: 6 }}>${totalBalance.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#3fb950' }}>+${totalPnl.toLocaleString()} all time</div>
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/dashboard/deposit">
              <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>+ Deposit</button>
            </Link>
            <Link href="/dashboard/withdraw">
              <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>Withdraw</button>
            </Link>
            <Link href="/dashboard/support">
              <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>Support</button>
            </Link>
          </div>
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Active Signals</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#7B2BF9', marginBottom: 6 }}>12</div>
          <Link href="/dashboard/signals" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 12, color: '#C9A84C', cursor: 'pointer' }}>View signals →</div>
          </Link>
        </div>
      </div>

      {/* Automated System Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 36 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>100% Automated AI Trading System</div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>
            Our proprietary AI algorithm trades 24/7 across crypto and stock markets. Choose an investment plan below to activate automatic daily returns.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[{ v: '84%', l: 'Win Rate' }, { v: '24/7', l: 'Active' }, { v: '$2.4B+', l: 'Managed' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#C9A84C' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Plans */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', marginBottom: 3 }}>💹 Investment Plans</div>
            <div style={{ fontSize: 12, color: '#484f58' }}>Automated daily returns — activate with Bitcoin</div>
          </div>
          <Link href="/dashboard/invest" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 12, color: '#C9A84C', cursor: 'pointer' }}>View all →</span>
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {INVESTMENT_PLANS.map(plan => (
            <div
              key={plan.name}
              style={{ background: '#0d1117', border: `1px solid ${plan.color}33`, borderRadius: 14, padding: 20, cursor: 'pointer', position: 'relative', transition: 'transform 0.15s' }}
              onClick={() => setModal({ title: `${plan.name} Investment Plan`, amount: plan.min, type: 'investment', color: plan.color })}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#060a0f', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>⭐ POPULAR</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{plan.icon} {plan.name}</div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>Min. {plan.min}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: plan.color }}>{plan.roi}</div>
                  <div style={{ fontSize: 9, color: '#484f58' }}>Daily</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#484f58', marginBottom: 2 }}>Total ROI</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#3fb950' }}>{plan.total}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#484f58', marginBottom: 2 }}>Duration</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{plan.duration}</div>
                </div>
              </div>
              <button style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: `1px solid ${plan.color}`, background: `${plan.color}0d`, color: plan.color, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                Activate {plan.min}+ →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Plans */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', marginBottom: 3 }}>⚡ Signal Plans</div>
            <div style={{ fontSize: 12, color: '#484f58' }}>Professional buy/sell signals · 84% accuracy</div>
          </div>
          <Link href="/dashboard/signals" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 12, color: '#C9A84C', cursor: 'pointer' }}>View signals →</span>
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {SIGNAL_PLANS.map(plan => (
            <div
              key={plan.name}
              style={{ background: plan.popular ? 'rgba(0,82,255,0.06)' : '#0d1117', border: `2px solid ${plan.popular ? plan.color : plan.color + '33'}`, borderRadius: 14, padding: 20, cursor: 'pointer', position: 'relative' }}
              onClick={() => setModal({ title: `${plan.name} Signal Plan`, amount: plan.price + '/mo', type: 'signal', color: plan.color })}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#0052FF', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>POPULAR</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 800, color: plan.color, textTransform: 'uppercase', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#e6edf3' }}>{plan.price}</span>
                <span style={{ fontSize: 11, color: '#484f58' }}>{plan.period}</span>
              </div>
              <div style={{ fontSize: 12, color: plan.color, fontWeight: 700, marginBottom: 12 }}>{plan.signals} signals</div>
              {plan.features.map((f, i) => (
                <div key={i} style={{ fontSize: 11, color: '#8b949e', marginBottom: 5, display: 'flex', gap: 6 }}>
                  <span style={{ color: plan.color }}>✓</span>{f}
                </div>
              ))}
              <button style={{ width: '100%', marginTop: 14, padding: '10px 0', borderRadius: 10, border: `1px solid ${plan.color}`, background: plan.popular ? plan.color : `${plan.color}0d`, color: plan.popular ? '#fff' : plan.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                Subscribe →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Trading & Cards CTA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        {/* Manual Trading */}
        <div style={{ background: 'linear-gradient(135deg, rgba(63,185,80,0.08), rgba(63,185,80,0.02))', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📈</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>Manual Trading</div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8, marginBottom: 16 }}>
            Trade crypto markets manually with up to 100x leverage. Fund with Bitcoin or Apple Pay for maximum privacy.
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            {[{ v: '100x', l: 'Max Leverage' }, { v: '$500', l: 'Min Deposit' }, { v: 'Demo', l: 'Available' }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#3fb950' }}>{s.v}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/trade">
            <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.1)', color: '#3fb950', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              Start Trading →
            </button>
          </Link>
        </div>

        {/* Cards */}
        <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>💳</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>Pro Cards</div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8, marginBottom: 16 }}>
            Spend your trading profits anywhere in the world. Virtual and physical VISA cards with up to 7% cashback.
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            {[{ v: '7%', l: 'Max Cashback' }, { v: '200+', l: 'Countries' }, { v: 'VISA', l: 'Network' }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C' }}>{s.v}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/card">
            <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              Get Your Card →
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>Recent Activity</div>
          <Link href="/dashboard/trades" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 12, color: '#C9A84C', cursor: 'pointer' }}>View all →</span>
          </Link>
        </div>
        {[
          { id: 'TXN-8821', type: 'BUY', asset: 'BTC/USD', amount: '$12,400', pnl: '+$1,240', time: '2h ago' },
          { id: 'TXN-8820', type: 'SELL', asset: 'ETH/USDT', amount: '$4,800', pnl: '+$320', time: '4h ago' },
          { id: 'TXN-8819', type: 'BUY', asset: 'AAPL', amount: '$8,120', pnl: '-$180', time: '6h ago' },
          { id: 'TXN-8818', type: 'EARN', asset: 'Affiliate', amount: '$248', pnl: '+$248', time: '8h ago' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 3 ? '1px solid #161b22' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: t.type === 'BUY' ? '#3fb950' : t.type === 'SELL' ? '#f85149' : '#C9A84C', background: t.type === 'BUY' ? 'rgba(63,185,80,0.1)' : t.type === 'SELL' ? 'rgba(248,81,73,0.1)' : 'rgba(201,168,76,0.1)', padding: '3px 8px', borderRadius: 6 }}>{t.type}</span>
              <div>
                <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>{t.asset}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>{t.id} · {t.time}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#e6edf3' }}>{t.amount}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.pnl.startsWith('+') ? '#3fb950' : '#f85149' }}>{t.pnl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      <PurchaseModal modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}
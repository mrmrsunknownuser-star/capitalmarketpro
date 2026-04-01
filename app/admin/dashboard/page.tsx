'use client'

import { useState, useEffect, useRef } from 'react'
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
  { name: 'Basic', price: '$99', color: '#8b949e', signals: '5/day', features: ['Crypto signals', 'Email alerts'] },
  { name: 'Pro', price: '$199', color: '#0052FF', signals: '15/day', popular: true, features: ['Crypto + Stocks', 'Push alerts'] },
  { name: 'Elite', price: '$349', color: '#C9A84C', signals: '30/day', features: ['All markets', 'Priority'] },
  { name: 'VIP', price: '$599', color: '#7B2BF9', signals: '∞', features: ['Unlimited', '1-on-1 calls'] },
]

type ModalData = { title: string; amount: string; color: string } | null

function PurchaseModal({ modal, onClose }: { modal: ModalData; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const BTC = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

  if (!modal) return null

  const providers = [
    { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', url: 'https://www.moonpay.com/buy/btc' },
    { name: 'Binance', icon: '🔶', color: '#F7A600', url: 'https://www.binance.com/en/crypto/buy/USD/BTC' },
    { name: 'Coinbase', icon: '🔵', color: '#0052FF', url: 'https://www.coinbase.com/buy-bitcoin' },
    { name: 'Paybis', icon: '💳', color: '#00C2FF', url: 'https://paybis.com/buy-bitcoin/' },
  ]

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 460, padding: 28, fontFamily: 'monospace', maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>Activate {modal.title}</div>
            <div style={{ fontSize: 11, color: '#484f58', marginTop: 2 }}>Min. {modal.amount}</div>
          </div>
          <button onClick={onClose} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 22 }}>
          {[{ n: 1, l: 'Notice' }, { n: 2, l: 'Provider' }, { n: 3, l: 'Send BTC' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: step > s.n ? modal.color : step === s.n ? `${modal.color}22` : '#161b22', border: `2px solid ${step >= s.n ? modal.color : '#21262d'}`, color: step > s.n ? '#060a0f' : step === s.n ? modal.color : '#484f58', flexShrink: 0 }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 9, color: step === s.n ? modal.color : '#484f58', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{s.l}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? modal.color : '#21262d', margin: '0 6px' }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: 18, marginBottom: 18 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
              <p style={{ fontSize: 13, color: '#c9d1d9', lineHeight: 1.9, margin: 0 }}>
                To avoid <strong style={{ color: '#C9A84C' }}>loss of trades</strong> or missing <strong style={{ color: '#C9A84C' }}>profitable signals</strong>, we use <strong style={{ color: '#C9A84C' }}>Bitcoin</strong> for funding. This ensures <strong style={{ color: '#C9A84C' }}>fast processing</strong> aligned with our automated trading system.
              </p>
            </div>
            {[
              { l: '⚡ Processing', v: 'Under 30 minutes' },
              { l: '🔒 Network', v: 'Bitcoin (BTC)' },
              { l: '📋 Minimum', v: modal.amount },
              { l: '💰 Deposit Fee', v: '0% — Free' },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22' }}>
                <span style={{ fontSize: 12, color: '#8b949e' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 600 }}>{item.v}</span>
              </div>
            ))}
            <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: 18, padding: '13px 0', background: `linear-gradient(135deg, ${modal.color}, ${modal.color}cc)`, border: 'none', borderRadius: 12, color: modal.color === '#e6edf3' ? '#060a0f' : '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              I Understand — Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: 12, color: '#8b949e', marginBottom: 14 }}>Choose a provider to purchase Bitcoin:</p>
            {providers.map(p => (
              <div key={p.name} onClick={() => { setProvider(p); setStep(3) }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: `${p.color}0d`, border: `1px solid ${p.color}33`, borderRadius: 12, marginBottom: 10, cursor: 'pointer' }}>
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', flex: 1 }}>{p.name}</span>
                <span style={{ color: p.color, fontWeight: 700 }}>→</span>
              </div>
            ))}
            <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: 6, padding: '11px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
          </>
        )}

        {step === 3 && provider && (
          <>
            <a href={provider.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: `${provider.color}0d`, border: `1px solid ${provider.color}33`, borderRadius: 12 }}>
                <span style={{ fontSize: 22 }}>{provider.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>Step 1 — Buy BTC on {provider.name}</div>
                  <div style={{ fontSize: 11, color: '#484f58' }}>Opens in new tab</div>
                </div>
                <span style={{ fontSize: 13, color: provider.color, fontWeight: 700 }}>Open →</span>
              </div>
            </a>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>Step 2 — Send BTC to activate</div>
            <div onClick={() => { navigator.clipboard.writeText(BTC); setCopied(true); setTimeout(() => setCopied(false), 2500) }}
              style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: 14, marginBottom: 12, cursor: 'pointer' }}>
              <div style={{ fontSize: 10, color: '#484f58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bitcoin Address</div>
              <div style={{ fontSize: 11, color: '#C9A84C', wordBreak: 'break-all', lineHeight: 1.6 }}>{BTC}</div>
              <div style={{ marginTop: 8, fontSize: 10, color: copied ? '#3fb950' : '#484f58' }}>{copied ? '✓ Copied!' : '📋 Tap to copy'}</div>
            </div>

            <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#f85149' }}>⚠ Send BTC only. Wrong asset = permanent loss.</div>
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

export default function DashboardHomePage() {
  const [profileName, setProfileName] = useState('Trader')
  const [balance, setBalance] = useState<any>(null)
  const [kycStatus, setKycStatus] = useState('none')
  const [modal, setModal] = useState<ModalData>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('users').select('full_name, kyc_status').eq('id', user.id).single()
      const { data: bal } = await supabase.from('balances').select('*').eq('user_id', user.id).single()
      setBalance(bal)
      setKycStatus(profile?.kyc_status || 'none')
      const name = profile?.full_name || user?.user_metadata?.full_name || ''
      setProfileName(name ? name.split(' ')[0] : user.email?.split('@')[0] || 'Trader')
    }
    init()
  }, [])

  const totalBalance = balance?.total_balance || 0
  const totalPnl = balance?.total_pnl || 0

  return (
    <div style={{ padding: '20px 16px 40px', fontFamily: 'monospace', maxWidth: 1100, margin: '0 auto' }}>

      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>
          Welcome back, {profileName} 👋
        </div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Here's your CapitalMarket Pro overview</div>
      </div>

      {/* KYC Banner */}
      {kycStatus !== 'approved' && (
        <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f85149', marginBottom: 3 }}>🪪 Complete Identity Verification</div>
            <div style={{ fontSize: 12, color: '#8b949e' }}>Verify your identity to unlock withdrawals and full access.</div>
          </div>
          <Link href="/dashboard/kyc">
            <button style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #f85149', background: 'rgba(248,81,73,0.1)', color: '#f85149', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>Verify Now →</button>
          </Link>
        </div>
      )}

      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Total Balance</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#C9A84C', marginBottom: 4 }}>${totalBalance.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#3fb950' }}>+${totalPnl.toLocaleString()} all time</div>
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/dashboard/deposit">
              <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>+ Deposit</button>
            </Link>
            <Link href="/dashboard/withdraw">
              <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>Withdraw</button>
            </Link>
          </div>
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Active Signals</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#7B2BF9', marginBottom: 4 }}>12</div>
          <Link href="/dashboard/signals" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 12, color: '#C9A84C' }}>View signals →</div>
          </Link>
        </div>
      </div>

      {/* ── ACCOUNT MANAGER ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 14 }}>👤 Your Account Manager</div>
        <div style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#060a0f', border: '3px solid rgba(201,168,76,0.5)', boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
                JE
              </div>
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: '#3fb950', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, border: '2px solid #0d1117' }}>✓</div>
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3' }}>Joshua C. Elder</div>
                <div style={{ fontSize: 9, color: '#3fb950', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', padding: '3px 8px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>● ONLINE</div>
                <div style={{ fontSize: 9, color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', padding: '3px 8px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>👑 GENERAL MANAGER</div>
              </div>

              <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600, marginBottom: 12 }}>
                Senior Portfolio Manager · CapitalMarket Pro
              </div>

              <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 16 }}>
                Joshua C. Elder is a veteran financial strategist with over <strong style={{ color: '#e6edf3' }}>14 years of experience</strong> managing high-net-worth portfolios across cryptocurrency, equities, and alternative investments. Formerly a Vice President at <strong style={{ color: '#e6edf3' }}>Goldman Sachs Asset Management</strong>, Joshua has overseen portfolios totaling over <strong style={{ color: '#C9A84C' }}>$2.4 billion</strong> in assets. He holds a CFA designation and is a registered investment advisor. At CapitalMarket Pro, Joshua personally oversees all investment plans and ensures every client receives maximum returns from our automated trading system.
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { v: '14+', l: 'Yrs Experience', c: '#C9A84C' },
                  { v: '$2.4B+', l: 'Assets Managed', c: '#3fb950' },
                  { v: '4,800+', l: 'Clients', c: '#0052FF' },
                  { v: '84%', l: 'Win Rate', c: '#7B2BF9' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Credentials */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {['✓ CFA Certified', '✓ Goldman Sachs Alumni', '✓ SEC Registered', '✓ FINRA Licensed'].map(c => (
                  <div key={c} style={{ fontSize: 10, color: '#8b949e', background: '#161b22', border: '1px solid #21262d', padding: '4px 10px', borderRadius: 20 }}>{c}</div>
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/dashboard/support">
                  <button style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                    💬 Message Joshua
                  </button>
                </Link>
                <Link href="/dashboard/invest">
                  <button style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)', color: '#C9A84C', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                    💹 Investment Plans
                  </button>
                </Link>
              </div>
            </div>

            {/* Availability */}
            <div style={{ flexShrink: 0, minWidth: 150 }}>
              <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Availability</div>
                {[
                  { l: 'Response', v: '< 2 hours', c: '#3fb950' },
                  { l: 'Hours', v: '24/7', c: '#C9A84C' },
                  { l: 'Languages', v: 'EN, ES, FR', c: '#8b949e' },
                ].map(item => (
                  <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #161b22' }}>
                    <span style={{ fontSize: 10, color: '#484f58' }}>{item.l}</span>
                    <span style={{ fontSize: 10, color: item.c, fontWeight: 600 }}>{item.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#3fb950', fontWeight: 700, marginBottom: 2 }}>🟢 Available Now</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>Ready to assist</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Automated System Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '18px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 32 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>100% Automated AI Trading System — Active Now</div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>Our AI algorithm trades 24/7 across crypto and stock markets. Select a plan below to activate daily returns.</div>
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
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 2 }}>💹 Investment Plans</div>
            <div style={{ fontSize: 12, color: '#484f58' }}>Automated daily returns — activate with Bitcoin</div>
          </div>
          <Link href="/dashboard/invest" style={{ textDecoration: 'none', fontSize: 12, color: '#C9A84C' }}>View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {INVESTMENT_PLANS.map(plan => (
            <div key={plan.name} onClick={() => setModal({ title: `${plan.name} Plan`, amount: plan.min, color: plan.color })}
              style={{ background: '#0d1117', border: `1px solid ${plan.color}33`, borderRadius: 14, padding: 18, cursor: 'pointer', position: 'relative' }}>
              {(plan as any).popular && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#060a0f', fontSize: 8, fontWeight: 800, padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>⭐ POPULAR</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: plan.color, textTransform: 'uppercase', marginBottom: 2 }}>{plan.icon} {plan.name}</div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>Min. {plan.min}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: plan.color }}>{plan.roi}</div>
                  <div style={{ fontSize: 9, color: '#484f58' }}>Daily</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#484f58', marginBottom: 1 }}>Total ROI</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#3fb950' }}>{plan.total}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#484f58', marginBottom: 1 }}>Duration</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>{plan.duration}</div>
                </div>
              </div>
              <button style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: `1px solid ${plan.color}`, background: `${plan.color}0d`, color: plan.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                Activate {plan.min}+ →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Plans */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 2 }}>⚡ Signal Plans</div>
            <div style={{ fontSize: 12, color: '#484f58' }}>84% accuracy · Professional signals</div>
          </div>
          <Link href="/dashboard/signals" style={{ textDecoration: 'none', fontSize: 12, color: '#C9A84C' }}>View →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {SIGNAL_PLANS.map(plan => (
            <div key={plan.name} onClick={() => setModal({ title: `${plan.name} Signal Plan`, amount: plan.price + '/mo', color: plan.color })}
              style={{ background: (plan as any).popular ? 'rgba(0,82,255,0.06)' : '#0d1117', border: `2px solid ${(plan as any).popular ? plan.color : plan.color + '33'}`, borderRadius: 14, padding: 18, cursor: 'pointer', position: 'relative' }}>
              {(plan as any).popular && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#0052FF', color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>POPULAR</div>
              )}
              <div style={{ fontSize: 10, fontWeight: 800, color: plan.color, textTransform: 'uppercase', marginBottom: 6 }}>{plan.name}</div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3' }}>{plan.price}</span>
                <span style={{ fontSize: 10, color: '#484f58' }}>/mo</span>
              </div>
              <div style={{ fontSize: 11, color: plan.color, fontWeight: 700, marginBottom: 10 }}>{plan.signals} signals</div>
              {plan.features.map((f, i) => (
                <div key={i} style={{ fontSize: 10, color: '#8b949e', marginBottom: 4, display: 'flex', gap: 5 }}>
                  <span style={{ color: plan.color }}>✓</span>{f}
                </div>
              ))}
              <button style={{ width: '100%', marginTop: 12, padding: '9px 0', borderRadius: 8, border: `1px solid ${plan.color}`, background: (plan as any).popular ? plan.color : `${plan.color}0d`, color: (plan as any).popular ? '#fff' : plan.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                Subscribe →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Trading & Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
        <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>📈</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>Manual Trading</div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8, marginBottom: 14 }}>Trade crypto with up to 100x leverage. Fund with Bitcoin or Apple Pay for maximum privacy.</div>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            {[{ v: '100x', l: 'Leverage' }, { v: '$500', l: 'Min' }, { v: 'Demo', l: 'Available' }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#3fb950' }}>{s.v}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/trade">
            <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.1)', color: '#3fb950', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              Start Trading →
            </button>
          </Link>
        </div>

        <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>💳</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>Pro Cards</div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8, marginBottom: 14 }}>Spend profits anywhere worldwide. Virtual and physical VISA cards with up to 7% cashback.</div>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            {[{ v: '7%', l: 'Cashback' }, { v: '200+', l: 'Countries' }, { v: 'VISA', l: 'Network' }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C' }}>{s.v}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/card">
            <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              Get Your Card →
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>Recent Activity</div>
          <Link href="/dashboard/trades" style={{ textDecoration: 'none', fontSize: 12, color: '#C9A84C' }}>View all →</Link>
        </div>
        {[
          { type: 'BUY', asset: 'BTC/USD', amount: '$12,400', pnl: '+$1,240', time: '2h ago' },
          { type: 'SELL', asset: 'ETH/USDT', amount: '$4,800', pnl: '+$320', time: '4h ago' },
          { type: 'BUY', asset: 'AAPL', amount: '$8,120', pnl: '-$180', time: '6h ago' },
          { type: 'EARN', asset: 'Affiliate', amount: '$248', pnl: '+$248', time: '8h ago' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 3 ? '1px solid #161b22' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: t.type === 'BUY' ? '#3fb950' : t.type === 'SELL' ? '#f85149' : '#C9A84C', background: t.type === 'BUY' ? 'rgba(63,185,80,0.1)' : t.type === 'SELL' ? 'rgba(248,81,73,0.1)' : 'rgba(201,168,76,0.1)', padding: '3px 8px', borderRadius: 6 }}>{t.type}</span>
              <div style={{ fontSize: 12, color: '#e6edf3' }}>{t.asset}</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>{t.time}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#e6edf3' }}>{t.amount}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.pnl.startsWith('+') ? '#3fb950' : '#f85149' }}>{t.pnl}</div>
            </div>
          </div>
        ))}
      </div>

      <PurchaseModal modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}
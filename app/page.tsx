'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const POPUP_EVENTS = [
  // Deposits
  { type: 'deposit', name: 'James O.', country: 'United States 🇺🇸', amount: '$12,500' },
  { type: 'deposit', name: 'Sarah M.', country: 'United Kingdom 🇬🇧', amount: '$8,200' },
  { type: 'deposit', name: 'Carlos R.', country: 'Canada 🇨🇦', amount: '$25,000' },
  { type: 'deposit', name: 'Amina K.', country: 'Nigeria 🇳🇬', amount: '$5,500' },
  { type: 'deposit', name: 'David L.', country: 'Australia 🇦🇺', amount: '$18,750' },
  { type: 'deposit', name: 'Fatima A.', country: 'UAE 🇦🇪', amount: '$50,000' },
  { type: 'deposit', name: 'Michael T.', country: 'Germany 🇩🇪', amount: '$9,800' },
  { type: 'deposit', name: 'Priya S.', country: 'Singapore 🇸🇬', amount: '$33,000' },
  // Withdrawals
  { type: 'withdrawal', name: 'Ahmed H.', country: 'Saudi Arabia 🇸🇦', amount: '$62,400' },
  { type: 'withdrawal', name: 'Emma W.', country: 'France 🇫🇷', amount: '$28,750' },
  { type: 'withdrawal', name: 'Marcus J.', country: 'United States 🇺🇸', amount: '$41,300' },
  { type: 'withdrawal', name: 'Chioma E.', country: 'Nigeria 🇳🇬', amount: '$15,200' },
  { type: 'withdrawal', name: 'Yuki T.', country: 'Japan 🇯🇵', amount: '$38,000' },
  { type: 'withdrawal', name: 'Lisa C.', country: 'Netherlands 🇳🇱', amount: '$54,900' },
  { type: 'withdrawal', name: 'James O.', country: 'United States 🇺🇸', amount: '$87,500' },
  { type: 'withdrawal', name: 'Sarah M.', country: 'United Kingdom 🇬🇧', amount: '$23,600' },
  { type: 'deposit', name: 'Omar K.', country: 'Kuwait 🇰🇼', amount: '$100,000' },
  { type: 'withdrawal', name: 'Sofia R.', country: 'Brazil 🇧🇷', amount: '$19,400' },
  { type: 'deposit', name: 'Chen W.', country: 'Hong Kong 🇭🇰', amount: '$75,000' },
  { type: 'withdrawal', name: 'Amina K.', country: 'Nigeria 🇳🇬', amount: '$31,800' },
]

function WithdrawalPopup() {
  const [item, setItem] = useState<typeof POPUP_EVENTS[0] | null>(null)
  const timer = useRef<any>(null)

  useEffect(() => {
    const cycle = () => {
      setItem(POPUP_EVENTS[Math.floor(Math.random() * POPUP_EVENTS.length)])
      timer.current = setTimeout(() => {
        setItem(null)
        timer.current = setTimeout(cycle, 6000 + Math.random() * 5000)
      }, 5000)
    }
    timer.current = setTimeout(cycle, 3000)
    return () => clearTimeout(timer.current)
  }, [])

  if (!item) return null

  const isDeposit = item.type === 'deposit'

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, zIndex: 99999,
      maxWidth: 290, fontFamily: 'monospace',
      animation: 'wpSlide 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
    }}>
      <div style={{
        background: '#0d1117',
        border: `2px solid ${isDeposit ? '#0052FF' : '#C9A84C'}`,
        borderRadius: 14, padding: '12px 38px 12px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
        position: 'relative',
      }}>
        <div style={{ fontSize: 26, flexShrink: 0 }}>{isDeposit ? '💰' : '💸'}</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3', marginBottom: 1 }}>{item.name}</div>
          <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 3 }}>{item.country}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: isDeposit ? '#0052FF' : '#3fb950' }}>
            {isDeposit ? 'Deposited' : 'Withdrew'} {item.amount} {isDeposit ? '📥' : '✅'}
          </div>
        </div>
        <button onClick={() => setItem(null)} style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 14 }}>✕</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 4, fontSize: 9, color: '#484f58', letterSpacing: '0.1em' }}>
        VERIFIED · CAPITALMARKET PRO · AUTOMATED
      </div>
    </div>
  )
}

// ── DATA ──
const FEATURES = [
  { icon: '₿', title: 'Crypto Trading', desc: 'Trade Bitcoin, Ethereum, Solana and 100+ cryptocurrencies with real-time data.', color: '#F7A600' },
  { icon: '📈', title: 'Stock Brokerage', desc: 'Access global stock markets. Trade Apple, Tesla, NVIDIA and thousands of stocks.', color: '#00B386' },
  { icon: '🔗', title: 'Affiliate Earnings', desc: 'Earn passive income through our program. Track clicks, conversions and payouts.', color: '#FF9900' },
  { icon: '⚡', title: 'Trading Signals', desc: 'Professional buy/sell signals with 84% accuracy for crypto and stocks.', color: '#7B2BF9' },
  { icon: '🔒', title: 'Bank-Level Security', desc: '256-bit SSL, 2FA authentication and cold storage for maximum protection.', color: '#C9A84C' },
  { icon: '📊', title: 'Unified Dashboard', desc: 'All your investments in one place. Track P&L, portfolio and performance.', color: '#0052FF' },
]

const STATS = [
  { value: '$2.4B+', label: 'Total Volume Traded' },
  { value: '150K+', label: 'Active Traders' },
  { value: '99.9%', label: 'Uptime Guaranteed' },
  { value: '24/7', label: 'Live Support' },
]

const PLANS = [
  { name: 'Basic', price: '$29', color: '#8b949e', signals: '5', features: ['5 signals/day', 'Crypto only', 'Email alerts', 'Basic analysis'] },
  { name: 'Pro', price: '$79', color: '#0052FF', signals: '15', popular: true, features: ['15 signals/day', 'Crypto + Stocks', 'Push + Email', 'Risk management', 'Detailed analysis'] },
  { name: 'Elite', price: '$149', color: '#C9A84C', signals: '30', features: ['30 signals/day', 'Crypto + Stocks', 'Priority alerts', 'Advanced analysis', 'Weekly outlook', 'Risk system'] },
  { name: 'VIP', price: '$299', color: '#7B2BF9', signals: '∞', features: ['Unlimited signals', 'All markets', '24/7 Priority', 'Pro analysis', 'Daily outlook', '1-on-1 calls', 'VIP support'] },
]

const TESTIMONIALS = [
  { name: 'Michael R.', role: 'Professional Trader', text: 'CapitalMarket Pro changed how I manage my portfolio. Having crypto, stocks and affiliate income in one dashboard is a game changer.', avatar: 'M' },
  { name: 'Sarah K.', role: 'Crypto Investor', text: 'The platform is incredibly professional. Deposits are fast, charts are clean and the support team is always responsive.', avatar: 'S' },
  { name: 'James T.', role: 'Stock Trader', text: 'The trading signals alone are worth every penny. 84% accuracy rate has completely transformed my results.', avatar: 'J' },
]

const FAQS = [
  { q: 'How do I fund my account?', a: 'We accept Bitcoin deposits for fast and secure funding. Click Deposit, choose MoonPay, Binance or Paybis, then send BTC to your unique deposit address.' },
  { q: 'How long do withdrawals take?', a: 'Withdrawals are reviewed within 24-48 hours. Once approved, funds are sent directly to your crypto wallet.' },
  { q: 'Is my money safe?', a: 'Yes. We use 256-bit SSL encryption, two-factor authentication, and cold storage to protect all user funds.' },
  { q: 'What can I trade?', a: 'Cryptocurrencies (BTC, ETH, SOL, BNB+), global stocks (US, EU markets), and earn through our affiliate program.' },
  { q: 'What are the signal plans?', a: 'Basic ($29/mo), Pro ($79/mo), Elite ($149/mo) and VIP ($299/mo). Each includes different signal volumes and features.' },
  { q: 'How do I start?', a: 'Create a free account, complete KYC verification, deposit via Bitcoin, and start trading immediately.' },
]

const TICKER = [
  { s: 'BTC/USD', p: '$67,240', c: '+2.4%', u: true },
  { s: 'ETH/USD', p: '$3,480', c: '+1.8%', u: true },
  { s: 'SOL/USD', p: '$142.30', c: '+5.2%', u: true },
  { s: 'BNB/USD', p: '$412.80', c: '-0.8%', u: false },
  { s: 'AAPL', p: '$189.30', c: '-0.6%', u: false },
  { s: 'NVDA', p: '$875.40', c: '+3.2%', u: true },
  { s: 'MSFT', p: '$415.20', c: '+1.1%', u: true },
  { s: 'TSLA', p: '$248.60', c: '-1.4%', u: false },
  { s: 'XRP/USD', p: '$0.624', c: '+4.1%', u: true },
  { s: 'ADA/USD', p: '$0.482', c: '+2.8%', u: true },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(6,10,15,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #161b22', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f' }}>C</div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
            <span style={{ color: '#e6edf3' }}> Pro</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }} className="desktop-nav">
          {[{ l: 'Features', h: '#features' }, { l: 'Signals', h: '#signals' }, { l: 'Pricing', h: '#pricing' }, { l: 'FAQ', h: '#faq' }, { l: 'Terms', h: '/terms' }].map(item => (
            <a key={item.l} href={item.h} style={{ fontSize: 13, color: '#8b949e', textDecoration: 'none' }}>{item.l}</a>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/login">
            <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>Sign In</button>
          </Link>
          <Link href="/register">
            <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>Get Started</button>
          </Link>
          {/* Mobile menu button */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', color: '#8b949e', fontSize: 22, cursor: 'pointer', padding: 4 }}>☰</button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99, background: '#0d1117', borderBottom: '1px solid #161b22', padding: 20 }}>
          {[{ l: 'Features', h: '#features' }, { l: 'Signals', h: '#signals' }, { l: 'Pricing', h: '#pricing' }, { l: 'FAQ', h: '#faq' }, { l: 'Terms', h: '/terms' }].map(item => (
            <a key={item.l} href={item.h} onClick={() => setMobileMenu(false)} style={{ display: 'block', padding: '12px 0', fontSize: 14, color: '#8b949e', textDecoration: 'none', borderBottom: '1px solid #161b22' }}>{item.l}</a>
          ))}
          <Link href="/register" onClick={() => setMobileMenu(false)}>
            <button style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              Get Started Free →
            </button>
          </Link>
        </div>
      )}

      {/* ── TICKER BAR ── */}
      <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 98, background: '#0a0e14', borderBottom: '1px solid #161b22', overflow: 'hidden', height: 34, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap' }}>
          {[...TICKER, ...TICKER].map((p, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRight: '1px solid #161b22' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3' }}>{p.s}</span>
              <span style={{ fontSize: 11, color: '#8b949e' }}>{p.p}</span>
              <span style={{ fontSize: 10, color: p.u ? '#3fb950' : '#f85149' }}>{p.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '160px 20px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '80vw', maxWidth: 600, height: '60vw', maxHeight: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, fontSize: 11, color: '#C9A84C', letterSpacing: '0.1em' }}>
            ⚡ NEXT GENERATION TRADING PLATFORM
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 800, color: '#e6edf3', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Trade Smarter.<br />
            <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Faster.</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#8b949e', lineHeight: 1.8, maxWidth: 540, margin: '0 auto 36px' }}>
            The world's most professional all-in-one trading platform. Crypto, stocks, affiliate earnings and trading signals — unified in one powerful dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <Link href="/register">
              <button style={{ padding: '14px 32px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                Start Trading Free →
              </button>
            </Link>
            <Link href="/login">
              <button style={{ padding: '14px 32px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}>
                Sign In
              </button>
            </Link>
          </div>
          <p style={{ fontSize: 12, color: '#484f58' }}>No credit card required · Free to get started · Instant access</p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '50px 20px', background: '#0d1117', borderTop: '1px solid #161b22', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 40px' }} className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, color: '#C9A84C', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#484f58' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '70px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Everything You Need</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>Built for Serious Traders</h2>
            <p style={{ fontSize: 14, color: '#8b949e', maxWidth: 480, margin: '0 auto' }}>One platform. Every market. Complete control.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#0d1117', border: `1px solid ${f.color}22`, borderRadius: 14, padding: 22, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, borderRadius: '0 14px 0 70px', background: `${f.color}08` }} />
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGNALS ── */}
      <section id="signals" style={{ padding: '70px 20px', background: '#0d1117', borderTop: '1px solid #161b22', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center' }} className="signals-grid">
            <div>
              <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Trading Signals</div>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700, color: '#e6edf3', marginBottom: 14, lineHeight: 1.3 }}>
                Professional Signals.<br />
                <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real Results.</span>
              </h2>
              <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 20 }}>
                Our automated system analyzes markets 24/7 to generate high-accuracy buy and sell signals for crypto and stocks.
              </p>
              {['⚡ Up to unlimited signals per day (VIP)', '🎯 84% average signal accuracy', '📊 Crypto + Stock signals combined', '🔔 Real-time push and email alerts', '🛡 Built-in risk management'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13, color: '#8b949e' }}>{t}</div>
              ))}
              <Link href="/register">
                <button style={{ marginTop: 16, padding: '12px 26px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Get Signals Access →
                </button>
              </Link>
            </div>
            <div>
              {[
                { asset: 'BTC/USD', entry: '$67,200', target: '$71,500', strength: 92 },
                { asset: 'ETH/USD', entry: '$3,480', target: '$3,750', strength: 87 },
                { asset: 'NVDA', entry: '$875', target: '$920', strength: 78 },
              ].map((s, i) => (
                <div key={i} style={{ background: '#060a0f', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '3px 8px', borderRadius: 5, background: 'rgba(63,185,80,0.15)', color: '#3fb950', fontSize: 10, fontWeight: 800 }}>BUY</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{s.asset}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 6px #3fb950' }} />
                      <span style={{ fontSize: 9, color: '#3fb950' }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                    <div style={{ background: '#0d1117', borderRadius: 6, padding: '7px 10px' }}>
                      <div style={{ fontSize: 9, color: '#484f58', marginBottom: 2 }}>ENTRY</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>{s.entry}</div>
                    </div>
                    <div style={{ background: '#0d1117', borderRadius: 6, padding: '7px 10px' }}>
                      <div style={{ fontSize: 9, color: '#484f58', marginBottom: 2 }}>TARGET</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#3fb950' }}>{s.target}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, color: '#484f58' }}>Strength</span>
                    <div style={{ flex: 1, height: 3, background: '#161b22', borderRadius: 2 }}>
                      <div style={{ width: `${s.strength}%`, height: '100%', background: '#3fb950', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#3fb950' }}>{s.strength}%</span>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center', padding: 12, background: 'rgba(201,168,76,0.04)', border: '1px dashed rgba(201,168,76,0.2)', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#484f58' }}>🔒 More signals after signup</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '70px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Signal Plans</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>Choose Your Plan</h2>
            <p style={{ fontSize: 14, color: '#8b949e' }}>All plans include our automated signal system. Cancel anytime.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="plans-grid">
            {PLANS.map(plan => (
              <div key={plan.name} style={{ background: plan.popular ? 'rgba(0,82,255,0.06)' : '#0d1117', border: `2px solid ${plan.popular ? plan.color : plan.color + '33'}`, borderRadius: 14, padding: 20, position: 'relative' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#0052FF', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{plan.name}</div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#e6edf3' }}>{plan.price}</span>
                  <span style={{ fontSize: 11, color: '#484f58' }}>/mo</span>
                </div>
                <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 14 }}>
                  <strong style={{ color: plan.color }}>{plan.signals}</strong> signals/day
                </div>
                <div style={{ marginBottom: 18 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 7, fontSize: 11, color: '#8b949e' }}>
                      <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <Link href="/register">
                  <button style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: `1px solid ${plan.color}`, background: plan.popular ? plan.color : `${plan.color}0d`, color: plan.popular ? '#fff' : plan.color, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                    Get {plan.name} →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '70px 20px', background: '#0d1117', borderTop: '1px solid #161b22', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Testimonials</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#e6edf3' }}>Trusted by Thousands</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: '#060a0f', border: '1px solid #161b22', borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: 28, color: '#C9A84C', marginBottom: 14 }}>"</div>
                <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 18 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#060a0f' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '70px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>FAQ</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#e6edf3' }}>Frequently Asked Questions</h2>
          </div>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #161b22' }}>
              <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', cursor: 'pointer' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: openFaq === i ? '#C9A84C' : '#e6edf3', paddingRight: 16 }}>{faq.q}</div>
                <span style={{ color: '#484f58', fontSize: 20, flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <div style={{ padding: '0 0 16px', fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '70px 20px', textAlign: 'center', background: '#0d1117', borderTop: '1px solid #161b22' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#e6edf3', marginBottom: 14 }}>
            Ready to Start{' '}
            <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trading?</span>
          </h2>
          <p style={{ fontSize: 14, color: '#8b949e', marginBottom: 28 }}>
            Join 150,000+ traders on CapitalMarket Pro. Create your free account in minutes.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ flex: 1, minWidth: 200, maxWidth: 280, background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
            />
            <Link href={`/register${email ? `?email=${email}` : ''}`}>
              <button style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                Get Started →
              </button>
            </Link>
          </div>
          <p style={{ fontSize: 11, color: '#484f58' }}>Free forever · No credit card · Instant setup</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#060a0f', borderTop: '1px solid #161b22' }}>
        <div style={{ padding: '40px 20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 30, maxWidth: 1060, margin: '0 auto' }} className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f' }}>C</div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
                <span style={{ color: '#e6edf3' }}> Pro</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#484f58', lineHeight: 1.8, maxWidth: 260, marginBottom: 12 }}>
              Professional all-in-one trading platform. Crypto, stocks, and affiliate earnings unified.
            </p>
            <div style={{ fontSize: 11, color: '#484f58' }}>🔒 256-bit SSL · SOC 2 Compliant</div>
          </div>
          {[
            { title: 'Platform', items: [{ l: 'Dashboard', h: '/register' }, { l: 'Signals', h: '#pricing' }, { l: 'Affiliate', h: '/register' }, { l: 'Deposit', h: '/register' }] },
            { title: 'Company', items: [{ l: 'About', h: '#' }, { l: 'Terms', h: '/terms' }, { l: 'Privacy', h: '#' }, { l: 'Risk Disclosure', h: '/terms' }] },
            { title: 'Support', items: [{ l: '24/7 Live Chat', h: '/register' }, { l: 'FAQ', h: '#faq' }, { l: 'Signal Plans', h: '#pricing' }, { l: 'Contact', h: '#' }] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col.title}</div>
              {col.items.map(item => (
                <div key={item.l} style={{ marginBottom: 8 }}>
                  <a href={item.h} style={{ fontSize: 12, color: '#484f58', textDecoration: 'none' }}>{item.l}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #161b22', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1060, margin: '0 auto', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 11, color: '#484f58' }}>© 2025 CapitalMarket Pro. All rights reserved.</div>
          <div style={{ fontSize: 11, color: '#484f58' }}>⚠ Trading involves risk. Past performance is not indicative of future results.</div>
        </div>
      </footer>

      {/* ── WITHDRAWAL POPUP ── */}
      <WithdrawalPopup />

    </div>
  )
}
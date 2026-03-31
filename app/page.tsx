'use client'
import WithdrawalPopup from '@/components/WithdrawalPopup'
import { useState, useEffect } from 'react'
import Link from 'next/link'
// ── WITHDRAWAL POPUP ──
const withdrawals = [
  { name: 'Daniel R.', country: 'United States 🇺🇸', amount: '$120,000', time: 'Just now' },
  { name: 'Hassan A.', country: 'UAE 🇦🇪', amount: '$275,500', time: '1 min ago' },
  { name: 'Victor S.', country: 'Switzerland 🇨🇭', amount: '$498,200', time: '2 mins ago' },
  { name: 'Zhang L.', country: 'China 🇨🇳', amount: '$310,750', time: 'Just now' },
  { name: 'Oliver K.', country: 'United Kingdom 🇬🇧', amount: '$185,900', time: '3 mins ago' },
  { name: 'Noah P.', country: 'Canada 🇨🇦', amount: '$220,400', time: '1 min ago' },
  { name: 'Yousef M.', country: 'Saudi Arabia 🇸🇦', amount: '$405,000', time: 'Just now' },
  { name: 'Ethan J.', country: 'Australia 🇦🇺', amount: '$150,300', time: '4 mins ago' },
  { name: 'Fatima A.', country: 'UAE 🇦🇪', amount: '$18,500', time: '2 mins ago' },
  { name: 'Ahmed H.', country: 'Saudi Arabia 🇸🇦', amount: '$22,000', time: '2 mins ago' },
  { name: 'Lucas D.', country: 'Brazil 🇧🇷', amount: '$35,800', time: '1 min ago' },
  { name: 'Sophia M.', country: 'Germany 🇩🇪', amount: '$41,200', time: 'Just now' },
  { name: 'Arjun N.', country: 'India 🇮🇳', amount: '$28,400', time: '3 mins ago' },
  { name: 'Liam T.', country: 'Ireland 🇮🇪', amount: '$19,900', time: 'Just now' },
  { name: 'Chloe B.', country: 'France 🇫🇷', amount: '$24,700', time: '2 mins ago' },
  { name: 'Priya S.', country: 'Singapore 🇸🇬', amount: '$9,200', time: '1 min ago' },
  { name: 'David L.', country: 'Australia 🇦🇺', amount: '$6,300', time: 'Just now' },
  { name: 'Emma W.', country: 'France 🇫🇷', amount: '$7,400', time: 'Just now' },
  { name: 'Yuki T.', country: 'Japan 🇯🇵', amount: '$8,000', time: '3 mins ago' },
  { name: 'Mateo G.', country: 'Spain 🇪🇸', amount: '$10,600', time: '2 mins ago' },
  { name: 'Kevin O.', country: 'New Zealand 🇳🇿', amount: '$11,300', time: 'Just now' },
  { name: 'James O.', country: 'United States 🇺🇸', amount: '$4,200', time: '2 mins ago' },
  { name: 'Michael T.', country: 'Germany 🇩🇪', amount: '$3,800', time: '4 mins ago' },
  { name: 'Lisa C.', country: 'Netherlands 🇳🇱', amount: '$4,900', time: '1 min ago' },
  { name: 'John B.', country: 'South Africa 🇿🇦', amount: '$5,100', time: '3 mins ago' },
  { name: 'Elena V.', country: 'Spain 🇪🇸', amount: '$4,600', time: 'Just now' },
  { name: 'Marta K.', country: 'Poland 🇵🇱', amount: '$3,700', time: '2 mins ago' },
  { name: 'Carlos R.', country: 'Canada 🇨🇦', amount: '$2,500', time: '1 min ago' },
  { name: 'Chioma E.', country: 'Nigeria 🇳🇬', amount: '$3,200', time: '2 mins ago' },
  { name: 'Ivan P.', country: 'Russia 🇷🇺', amount: '$2,100', time: 'Just now' },
  { name: 'Kwame A.', country: 'Ghana 🇬🇭', amount: '$1,900', time: '3 mins ago' },
  { name: 'Maria L.', country: 'Philippines 🇵🇭', amount: '$2,300', time: '1 min ago' },
  { name: 'Tariq H.', country: 'Pakistan 🇵🇰', amount: '$1,600', time: 'Just now' },
  { name: 'Luis F.', country: 'Mexico 🇲🇽', amount: '$2,800', time: '2 mins ago' }
]
function WithdrawalPopupComponent() {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(0)
  const [animIn, setAnimIn] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const show = () => {
      const idx = Math.floor(Math.random() * withdrawals.length)
      setCurrent(idx)
      setVisible(true)
      setTimeout(() => setAnimIn(true), 50)
      timeout = setTimeout(() => {
        setAnimIn(false)
        setTimeout(() => {
          setVisible(false)
          timeout = setTimeout(show, 8000 + Math.random() * 7000)
        }, 500)
      }, 5000)
    }

    timeout = setTimeout(show, 4000)
    return () => clearTimeout(timeout)
  }, [])

  if (!visible) return null

  const item = withdrawals[current]

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 24, zIndex: 9999,
      transform: `translateX(${animIn ? '0%' : '-130%'})`,
      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      maxWidth: 300, fontFamily: 'monospace',
    }}>
      <div style={{
        background: '#0d1117',
        border: '1px solid rgba(201,168,76,0.4)',
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💸</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>{item.name}</div>
            <div style={{ fontSize: 10, color: '#484f58' }}>Just now</div>
          </div>
          <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>{item.country}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#3fb950' }}>Withdrew {item.amount} ✅</div>
        </div>
        <button onClick={() => { setAnimIn(false); setTimeout(() => setVisible(false), 500) }} style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 14, alignSelf: 'flex-start', padding: 0 }}>✕</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 5, fontSize: 9, color: '#484f58', letterSpacing: '0.06em' }}>
        VERIFIED · CAPITALMARKET PRO
      </div>
    </div>
  )
}

const features = [
  { icon: '₿', title: 'Crypto Trading', desc: 'Buy, sell and trade Bitcoin, Ethereum, Solana and 100+ cryptocurrencies with real-time market data.', color: '#F7A600' },
  { icon: '📈', title: 'Stock Brokerage', desc: 'Access global stock markets. Trade Apple, Tesla, NVIDIA and thousands of stocks and ETFs.', color: '#00B386' },
  { icon: '🔗', title: 'Affiliate Earnings', desc: 'Generate passive income through our affiliate program. Track clicks, conversions and payouts.', color: '#FF9900' },
  { icon: '⚡', title: 'Trading Signals', desc: 'Professional buy/sell signals with 84% accuracy. Crypto and stocks covered 24/7.', color: '#7B2BF9' },
  { icon: '🔒', title: 'Bank-Level Security', desc: '256-bit SSL encryption, 2FA authentication and cold storage for maximum fund protection.', color: '#C9A84C' },
  { icon: '📊', title: 'Unified Dashboard', desc: 'See all your investments in one place. Track P&L, portfolio allocation and performance charts.', color: '#0052FF' },
]

const stats = [
  { value: '$2.4B+', label: 'Total Volume Traded' },
  { value: '150K+', label: 'Active Traders' },
  { value: '99.9%', label: 'Uptime Guaranteed' },
  { value: '24/7', label: 'Live Support' },
]

const signalPlans = [
  { name: 'Basic', price: '$99', period: '/mo', color: '#8b949e', signals: '5', features: ['5 signals/day', 'Crypto only', 'Email alerts'] },
  { name: 'Pro', price: '$299', period: '/mo', color: '#0052FF', signals: '15', popular: true, features: ['15 signals/day', 'Crypto + Stocks', 'Push + Email alerts', 'Risk management'] },
  { name: 'Elite', price: '$492', period: '/mo', color: '#C9A84C', signals: '30', features: ['30 signals/day', 'Crypto + Stocks', 'Priority alerts', 'Weekly outlook'] },
  { name: 'VIP', price: '$845', period: '/mo', color: '#7B2BF9', signals: '∞', features: ['Unlimited signals', 'All markets', '24/7 Priority alerts', '1-on-1 strategy calls', 'Dedicated support'] },
]

const testimonials = [
  { name: 'Michael R.', role: 'Professional Trader', text: 'CapitalMarket Pro changed how I manage my portfolio. Having crypto, stocks and affiliate income in one dashboard is a game changer.', avatar: 'M' },
  { name: 'Sarah K.', role: 'Crypto Investor', text: 'The platform is incredibly professional. Deposits are fast, the charts are clean and the support team is always responsive.', avatar: 'S' },
  { name: 'James T.', role: 'Stock Trader', text: 'The trading signals alone are worth every penny. 84% accuracy rate has completely transformed my trading results.', avatar: 'J' },
]

const faqs = [
  { q: 'How do I fund my account?', a: 'We accept Bitcoin (BTC) deposits for fast and secure funding. Simply click Deposit, choose your preferred provider like MoonPay or Binance, and send BTC to your unique deposit address.' },
  { q: 'How long do withdrawals take?', a: 'Withdrawals are reviewed by our team within 24-48 hours. Once approved, funds are sent directly to your crypto wallet.' },
  { q: 'Is my money safe?', a: 'Yes. We use 256-bit SSL encryption, two-factor authentication, and cold storage to protect all user funds and data.' },
  { q: 'What markets can I trade?', a: 'You can trade cryptocurrencies (BTC, ETH, SOL, BNB and more), global stocks (US, EU markets), and earn through our affiliate program.' },
  { q: 'What are the trading signal plans?', a: 'We offer Basic ($29/mo), Pro ($79/mo), Elite ($149/mo), and VIP ($299/mo) plans. Each plan includes different signal volumes and features.' },
  { q: 'How do I get started?', a: 'Simply create a free account, complete your KYC verification, deposit funds via Bitcoin, and start trading immediately.' },
]

const ticker = [
  { symbol: 'BTC/USD', price: '$67,240', change: '+2.4%', up: true },
  { symbol: 'ETH/USD', price: '$3,480', change: '+1.8%', up: true },
  { symbol: 'SOL/USD', price: '$142.30', change: '+5.2%', up: true },
  { symbol: 'BNB/USD', price: '$412.80', change: '-0.8%', up: false },
  { symbol: 'AAPL', price: '$189.30', change: '-0.6%', up: false },
  { symbol: 'NVDA', price: '$875.40', change: '+3.2%', up: true },
  { symbol: 'MSFT', price: '$415.20', change: '+1.1%', up: true },
  { symbol: 'TSLA', price: '$248.60', change: '-1.4%', up: false },
  { symbol: 'XRP/USD', price: '$0.624', change: '+4.1%', up: true },
  { symbol: 'ADA/USD', price: '$0.482', change: '+2.8%', up: true },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState('')

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(6,10,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #161b22', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#060a0f' }}>C</div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C' }}>CapitalMarket</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}> Pro</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[{ label: 'Features', href: '#features' }, { label: 'Signals', href: '#signals' }, { label: 'Pricing', href: '#pricing' }, { label: 'FAQ', href: '#faq' }, { label: 'Terms', href: '/terms' }].map(item => (
            <a key={item.label} href={item.href} style={{ fontSize: 13, color: '#8b949e', textDecoration: 'none' }}>{item.label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login">
            <button style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>Sign In</button>
          </Link>
          <Link href="/register">
            <button style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>Get Started →</button>
          </Link>
        </div>
      </nav>

      {/* ── TICKER BAR ── */}
      <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99, background: '#0a0e14', borderBottom: '1px solid #161b22', overflow: 'hidden', height: 36, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap' }}>
          {[...ticker, ...ticker].map((p, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRight: '1px solid #161b22' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3' }}>{p.symbol}</span>
              <span style={{ fontSize: 11, color: '#8b949e' }}>{p.price}</span>
              <span style={{ fontSize: 10, color: p.up ? '#3fb950' : '#f85149' }}>{p.change}</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '160px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 28, fontSize: 11, color: '#C9A84C', letterSpacing: '0.1em' }}>
            ⚡ NEXT GENERATION TRADING PLATFORM
          </div>
          <h1 style={{ fontSize: 60, fontWeight: 800, color: '#e6edf3', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Trade Smarter.<br />
            <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Faster.</span>
          </h1>
          <p style={{ fontSize: 18, color: '#8b949e', lineHeight: 1.8, maxWidth: 580, margin: '0 auto 40px' }}>
            The world's most professional all-in-one trading platform. Crypto, stocks, affiliate earnings and trading signals — unified in one powerful dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Link href="/register">
              <button style={{ padding: '15px 36px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                Start Trading Free →
              </button>
            </Link>
            <Link href="/login">
              <button style={{ padding: '15px 36px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}>
                Sign In
              </button>
            </Link>
          </div>
          <div style={{ fontSize: 12, color: '#484f58' }}>No credit card required · Free to get started · Instant access</div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '60px 40px', borderTop: '1px solid #161b22', borderBottom: '1px solid #161b22', background: '#0d1117' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: '#C9A84C', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#484f58', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Everything You Need</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Built for Serious Traders</h2>
            <p style={{ fontSize: 15, color: '#8b949e', maxWidth: 500, margin: '0 auto' }}>One platform. Every market. Complete control over your financial future.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: '#0d1117', border: `1px solid ${f.color}22`, borderRadius: 14, padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 14px 0 80px', background: `${f.color}08` }} />
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGNALS SECTION ── */}
      <section id="signals" style={{ padding: '80px 40px', background: '#0d1117', borderTop: '1px solid #161b22', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Trading Signals</div>
              <h2 style={{ fontSize: 38, fontWeight: 700, color: '#e6edf3', marginBottom: 16, lineHeight: 1.3 }}>
                Professional Signals.<br />
                <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real Results.</span>
              </h2>
              <p style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.8, marginBottom: 24 }}>
                Our automated trading system analyzes market data 24/7 to generate high-accuracy buy and sell signals for crypto and stocks.
              </p>
              {[
                { icon: '⚡', text: 'Up to unlimited signals per day (VIP plan)' },
                { icon: '🎯', text: '84% average signal accuracy rate' },
                { icon: '📊', text: 'Crypto + Stock signals in one place' },
                { icon: '🔔', text: 'Real-time push and email alerts' },
                { icon: '🛡', text: 'Built-in risk management guidance' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: '#8b949e' }}>{item.text}</span>
                </div>
              ))}
              <Link href="/register">
                <button style={{ marginTop: 20, padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Get Signals Access →
                </button>
              </Link>
            </div>
            <div>
              {[
                { asset: 'BTC/USD', type: 'BUY', entry: '$67,200', target: '$71,500', strength: 92 },
                { asset: 'ETH/USD', type: 'BUY', entry: '$3,480', target: '$3,750', strength: 87 },
                { asset: 'NVDA', type: 'BUY', entry: '$875', target: '$920', strength: 78 },
              ].map((signal, i) => (
                <div key={i} style={{ background: '#060a0f', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(63,185,80,0.15)', color: '#3fb950', fontSize: 11, fontWeight: 800 }}>{signal.type}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{signal.asset}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 6px #3fb950' }} />
                      <span style={{ fontSize: 10, color: '#3fb950' }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div style={{ background: '#0d1117', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#484f58', marginBottom: 2 }}>ENTRY</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{signal.entry}</div>
                    </div>
                    <div style={{ background: '#0d1117', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#484f58', marginBottom: 2 }}>TARGET</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#3fb950' }}>{signal.target}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#484f58' }}>Strength</span>
                    <div style={{ flex: 1, height: 4, background: '#161b22', borderRadius: 2 }}>
                      <div style={{ width: `${signal.strength}%`, height: '100%', background: '#3fb950', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#3fb950' }}>{signal.strength}%</span>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center', padding: 16, background: 'rgba(201,168,76,0.04)', border: '1px dashed rgba(201,168,76,0.2)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: '#484f58' }}>🔒 More signals unlocked after signup</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIGNAL PRICING ── */}
      <section id="pricing" style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Signal Plans</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Choose Your Plan</h2>
            <p style={{ fontSize: 14, color: '#8b949e' }}>All plans include access to our automated signal system. Cancel anytime.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {signalPlans.map(plan => (
              <div key={plan.name} style={{ background: plan.popular ? 'rgba(0,82,255,0.06)' : '#0d1117', border: `2px solid ${plan.popular ? plan.color : plan.color + '33'}`, borderRadius: 14, padding: 24, position: 'relative' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#0052FF', color: '#fff', fontSize: 9, fontWeight: 700, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: plan.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{plan.name}</div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#e6edf3' }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: '#484f58' }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16 }}>
                  <strong style={{ color: plan.color }}>{plan.signals}</strong> signals/day
                </div>
                <div style={{ marginBottom: 20 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 11, color: '#8b949e' }}>
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
      <section style={{ padding: '80px 40px', background: '#0d1117', borderTop: '1px solid #161b22', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Testimonials</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: '#e6edf3' }}>Trusted by Thousands</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ background: '#060a0f', border: '1px solid #161b22', borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 28, color: '#C9A84C', marginBottom: 16 }}>"</div>
                <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 20 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#060a0f' }}>{t.avatar}</div>
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
      <section id="faq" style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: '#e6edf3' }}>Frequently Asked Questions</h2>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #161b22' }}>
              <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', cursor: 'pointer' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: openFaq === i ? '#C9A84C' : '#e6edf3' }}>{faq.q}</div>
                <span style={{ color: '#484f58', fontSize: 20, flexShrink: 0, marginLeft: 16 }}>{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <div style={{ padding: '0 0 18px', fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 40px', textAlign: 'center', background: '#0d1117', borderTop: '1px solid #161b22' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 42, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>
            Ready to Start{' '}
            <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trading?</span>
          </h2>
          <p style={{ fontSize: 15, color: '#8b949e', marginBottom: 32 }}>
            Join 150,000+ traders on CapitalMarket Pro. Create your free account in minutes.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ flex: 1, maxWidth: 300, background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '13px 16px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
            />
            <Link href={`/register${email ? `?email=${email}` : ''}`}>
              <button style={{ padding: '13px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                Get Started Free →
              </button>
            </Link>
          </div>
          <div style={{ fontSize: 11, color: '#484f58' }}>Free forever · No credit card · Instant setup</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#060a0f', borderTop: '1px solid #161b22' }}>
        <div style={{ padding: '48px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, maxWidth: 1100, margin: '0 auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#060a0f' }}>C</div>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
                <span style={{ color: '#e6edf3' }}> Pro</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#484f58', lineHeight: 1.8, maxWidth: 280, marginBottom: 16 }}>
              The world's most professional all-in-one trading platform. Crypto, stocks, and affiliate earnings unified in one powerful dashboard.
            </p>
            <div style={{ fontSize: 11, color: '#484f58' }}>🔒 256-bit SSL Encrypted · SOC 2 Compliant</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform</div>
            {['Dashboard', 'Trading Signals', 'Affiliate Program', 'Deposit', 'Withdraw'].map(item => (
              <div key={item} style={{ marginBottom: 10 }}>
                <a href="/register" style={{ fontSize: 12, color: '#484f58', textDecoration: 'none' }}>{item}</a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company</div>
            {[{ label: 'About Us', href: '#' }, { label: 'Terms & Conditions', href: '/terms' }, { label: 'Privacy Policy', href: '#' }, { label: 'Risk Disclosure', href: '/terms' }].map(item => (
              <div key={item.label} style={{ marginBottom: 10 }}>
                <a href={item.href} style={{ fontSize: 12, color: '#484f58', textDecoration: 'none' }}>{item.label}</a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Support</div>
            {[{ label: '24/7 Live Chat', href: '/register' }, { label: 'FAQ', href: '#faq' }, { label: 'Signal Plans', href: '#pricing' }, { label: 'Contact Us', href: '#' }].map(item => (
              <div key={item.label} style={{ marginBottom: 10 }}>
                <a href={item.href} style={{ fontSize: 12, color: '#484f58', textDecoration: 'none' }}>{item.label}</a>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #161b22', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1100, margin: '0 auto', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 11, color: '#484f58' }}>© 2025 CapitalMarket Pro. All rights reserved.</div>
          <div style={{ fontSize: 11, color: '#484f58' }}>⚠ Trading involves risk. Past performance is not indicative of future results.</div>
        </div>
      </footer>
    <WithdrawalPopup />
    </div>
  )
}
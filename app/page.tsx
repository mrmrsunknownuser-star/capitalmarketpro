'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const WITHDRAWALS = [
  { type: 'deposit', name: 'James O.', country: 'United States 🇺🇸', amount: '$12,500' },
  { type: 'withdrawal', name: 'Sarah M.', country: 'United Kingdom 🇬🇧', amount: '$28,750' },
  { type: 'deposit', name: 'Carlos R.', country: 'Canada 🇨🇦', amount: '$25,000' },
  { type: 'withdrawal', name: 'Amina K.', country: 'Nigeria 🇳🇬', amount: '$31,800' },
  { type: 'deposit', name: 'David L.', country: 'Australia 🇦🇺', amount: '$18,750' },
  { type: 'withdrawal', name: 'Fatima A.', country: 'UAE 🇦🇪', amount: '$62,400' },
  { type: 'deposit', name: 'Michael T.', country: 'Germany 🇩🇪', amount: '$9,800' },
  { type: 'withdrawal', name: 'Priya S.', country: 'Singapore 🇸🇬', amount: '$44,200' },
  { type: 'deposit', name: 'Ahmed H.', country: 'Saudi Arabia 🇸🇦', amount: '$100,000' },
  { type: 'withdrawal', name: 'Emma W.', country: 'France 🇫🇷', amount: '$28,750' },
  { type: 'deposit', name: 'Marcus J.', country: 'United States 🇺🇸', amount: '$41,300' },
  { type: 'withdrawal', name: 'Chioma E.', country: 'Nigeria 🇳🇬', amount: '$15,200' },
  { type: 'deposit', name: 'Omar K.', country: 'Kuwait 🇰🇼', amount: '$75,000' },
  { type: 'withdrawal', name: 'Yuki T.', country: 'Japan 🇯🇵', amount: '$38,000' },
]

function WithdrawalPopup() {
  const [item, setItem] = useState<typeof WITHDRAWALS[0] | null>(null)
  const timer = useRef<any>(null)

  useEffect(() => {
    const cycle = () => {
      setItem(WITHDRAWALS[Math.floor(Math.random() * WITHDRAWALS.length)])
      timer.current = setTimeout(() => {
        setItem(null)
        timer.current = setTimeout(cycle, 7000 + Math.random() * 5000)
      }, 5000)
    }
    timer.current = setTimeout(cycle, 3500)
    return () => clearTimeout(timer.current)
  }, [])

  if (!item) return null
  const isDeposit = item.type === 'deposit'

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 99999, maxWidth: 290, fontFamily: 'monospace', animation: 'wpSlide 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
      <div style={{ background: '#0d1117', border: `2px solid ${isDeposit ? '#0052FF' : '#C9A84C'}`, borderRadius: 14, padding: '12px 36px 12px 12px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.8)', position: 'relative' }}>
        <div style={{ fontSize: 24, flexShrink: 0 }}>{isDeposit ? '💰' : '💸'}</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3', marginBottom: 1 }}>{item.name}</div>
          <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 3 }}>{item.country}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: isDeposit ? '#0052FF' : '#3fb950' }}>{isDeposit ? 'Deposited' : 'Withdrew'} {item.amount} {isDeposit ? '📥' : '✅'}</div>
        </div>
        <button onClick={() => setItem(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 12 }}>✕</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 4, fontSize: 9, color: '#484f58', letterSpacing: '0.1em' }}>VERIFIED · CAPITALMARKET PRO · AUTOMATED</div>
    </div>
  )
}

const TICKER = [
  { s: 'BTC/USD', p: '$67,240', c: '+2.4%', u: true },
  { s: 'ETH/USD', p: '$3,480', c: '+1.8%', u: true },
  { s: 'SOL/USD', p: '$142', c: '+5.2%', u: true },
  { s: 'BNB/USD', p: '$412', c: '-0.8%', u: false },
  { s: 'AAPL', p: '$189', c: '-0.6%', u: false },
  { s: 'NVDA', p: '$875', c: '+3.2%', u: true },
  { s: 'MSFT', p: '$415', c: '+1.1%', u: true },
  { s: 'TSLA', p: '$248', c: '-1.4%', u: false },
  { s: 'XRP/USD', p: '$0.62', c: '+4.1%', u: true },
  { s: 'ADA/USD', p: '$0.48', c: '+2.8%', u: true },
]

const FEATURES = [
  { icon: '₿', title: 'Crypto Trading', desc: 'Trade Bitcoin, Ethereum, Solana and 100+ cryptocurrencies with real-time market data and AI-powered analysis.', color: '#F7A600' },
  { icon: '📈', title: 'Stock Brokerage', desc: 'Access global equity markets. Trade Apple, Tesla, NVIDIA and thousands of stocks and ETFs with zero complexity.', color: '#3fb950' },
  { icon: '🤖', title: 'AI Auto-Trading', desc: 'Our proprietary AI algorithm trades 24/7 across all markets — generating consistent daily returns with zero manual effort.', color: '#7B2BF9' },
  { icon: '⚡', title: 'Trading Signals', desc: 'Professional algorithmic buy/sell signals with 84% historical accuracy. Never miss a profitable trade again.', color: '#C9A84C' },
  { icon: '🔗', title: 'Affiliate Earnings', desc: 'Earn passive income by referring friends. Track conversions, clicks and commission payouts in real-time.', color: '#FF9900' },
  { icon: '🔒', title: 'Bank-Level Security', desc: '256-bit SSL encryption, 2FA, and cold storage for all funds. Your money is protected by military-grade security.', color: '#0052FF' },
]

const TOP_INVESTORS = [
  { initials: 'AM', name: 'Alexander M.', country: '🇺🇸 United States', profit: '+$284,500', roi: '+284%', plan: 'Black Plan', months: '8 months', color: '#C9A84C' },
  { initials: 'FK', name: 'Fatima K.', country: '🇦🇪 UAE', profit: '+$156,200', roi: '+156%', plan: 'Elite Plan', months: '6 months', color: '#7B2BF9' },
  { initials: 'JO', name: 'James O.', country: '🇬🇧 United Kingdom', profit: '+$98,400', roi: '+98%', plan: 'Platinum Plan', months: '5 months', color: '#0052FF' },
  { initials: 'PN', name: 'Priya N.', country: '🇸🇬 Singapore', profit: '+$72,100', roi: '+72%', plan: 'Gold Plan', months: '4 months', color: '#3fb950' },
  { initials: 'OR', name: 'Omar R.', country: '🇸🇦 Saudi Arabia', profit: '+$445,000', roi: '+445%', plan: 'Black Plan', months: '11 months', color: '#C9A84C' },
  { initials: 'SC', name: 'Sophie C.', country: '🇫🇷 France', profit: '+$61,800', roi: '+61%', plan: 'Gold Plan', months: '3 months', color: '#F7A600' },
]

const TEAM = [
  { initials: 'RK', name: 'Robert K. Hayes', role: 'Chief Executive Officer', dept: 'Executive Leadership', color: '#0052FF', badge: '🏛', exp: '18yr', track: '150K+', desc: 'Ex-BlackRock Managing Director. 18 years leading global investment platforms across 40+ countries.', tags: ['BlackRock Alumni', 'Harvard MBA', 'CFA'] },
  { initials: 'JE', name: 'Joshua C. Elder', role: 'Account Manager', dept: 'Client Portfolio Management', color: '#C9A84C', badge: '👑', exp: '14yr', track: '$2.4B+', desc: 'Former Goldman Sachs VP. CFA-certified strategist overseeing all client investment plans.', tags: ['Goldman Sachs', 'CFA', 'SEC Reg.'] },
  { initials: 'SC', name: 'Sophia C. Laurent', role: 'Chief Crypto Strategist', dept: 'Digital Asset Markets', color: '#F7A600', badge: '₿', exp: '11yr', track: '84% acc.', desc: 'Pioneer Bitcoin strategist. Built trading algorithms managing $800M+ in digital assets.', tags: ['MIT Alumni', 'CMT', 'DeFi Expert'] },
  { initials: 'MO', name: 'Marcus O. Sterling', role: 'Head of Stock Trading', dept: 'Equity & ETF Markets', color: '#3fb950', badge: '📈', exp: '9yr', track: '91% win', desc: 'Former Morgan Stanley equity analyst specializing in high-growth tech and emerging markets.', tags: ['Morgan Stanley', 'CFA', 'CMT'] },
  { initials: 'AL', name: 'Amanda L. Brooks', role: 'Affiliate Director', dept: 'Partner & Growth', color: '#7B2BF9', badge: '🔗', exp: '8yr', track: '$12M+ paid', desc: 'Built and scaled global affiliate networks generating $12M+ in partner payouts annually.', tags: ['Wharton MBA', 'Growth Expert'] },
  { initials: 'PP', name: 'Priya P. Sharma', role: 'Head of AI Signals', dept: 'Algorithmic Trading', color: '#00B386', badge: '⚡', exp: '7yr', track: '84% signals', desc: 'Quant researcher who built our AI signal engine using ML trained on 15+ years of market data.', tags: ['MIT PhD', 'ML Expert', 'Quant'] },
  { initials: 'DR', name: 'Daniel R. Okonkwo', role: 'Risk & Compliance', dept: 'Risk Management', color: '#f85149', badge: '🛡', exp: '12yr', track: '0% loss', desc: 'Former hedge fund risk officer ensuring 100% client fund protection and regulatory compliance.', tags: ['FRM', 'FINRA', 'AML Cert.'] },
  { initials: 'JF', name: 'James F. Whitmore', role: 'Platform Administrator', dept: 'Security & Infrastructure', color: '#8b949e', badge: '🔒', exp: '10yr', track: '99.9% uptime', desc: 'Cybersecurity veteran ensuring platform integrity, 24/7 uptime, and maximum fund security.', tags: ['CISSP', 'AWS', 'SOC2'] },
]

const SERVICES = [
  { icon: '🤖', title: 'Automated Investment', desc: 'Set your plan and let our AI do the rest. Daily returns credited automatically — no trading experience required.', color: '#C9A84C' },
  { icon: '📊', title: 'Portfolio Management', desc: 'Real-time portfolio tracking across crypto, stocks, and affiliate income — all in one unified dashboard.', color: '#0052FF' },
  { icon: '💳', title: 'CapitalMarket Pro Card', desc: 'Spend your trading profits anywhere in the world with our VISA-powered virtual and physical cards.', color: '#7B2BF9' },
  { icon: '🔔', title: 'Smart Alerts', desc: 'Never miss a trade. Get instant push notifications and email alerts for every market opportunity.', color: '#3fb950' },
]

const FAQS = [
  { q: 'How does the automated trading system work?', a: 'Our AI algorithm analyzes millions of data points per second across crypto and stock markets. It executes trades automatically 24/7, applying hedging strategies and arbitrage opportunities to generate consistent daily returns. You simply deposit, choose a plan, and earn.' },
  { q: 'How do I fund my account?', a: 'We accept Bitcoin deposits via trusted providers including MoonPay, Binance, Coinbase, Paybis and more. Minimum deposit is $100. Processing takes under 30 minutes after 1 blockchain confirmation.' },
  { q: 'How long do withdrawals take?', a: 'Withdrawals are reviewed by our compliance team within 24-48 hours. Once approved, funds are sent directly to your Bitcoin wallet. A 5% processing fee applies (minimum $100).' },
  { q: 'Is my money safe?', a: 'Yes. We use 256-bit SSL encryption, two-factor authentication, and 95% cold storage for all funds. Our platform has never experienced a security breach since inception.' },
  { q: 'What investment plans are available?', a: 'We offer 6 plans from Starter ($200 min, 5%/day for 7 days) to Black ($100k min, 25%/day for 30 days). All plans include auto-compounding and are fully managed by our AI trading system.' },
  { q: 'Can I trade manually?', a: 'Yes! Our Manual Trading feature allows you to trade crypto markets with up to 100x leverage. Fund your trading account via Bitcoin or Apple Pay (min $500) and start trading with full control.' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [email, setEmail] = useState('')
  const [activeNews, setActiveNews] = useState(0)

  const NEWS = [
    { tag: 'MARKET UPDATE', title: 'Bitcoin surges past $67K as institutional demand continues to grow', time: '2 hours ago', icon: '₿' },
    { tag: 'PLATFORM NEWS', title: 'CapitalMarket Pro processes $50M in withdrawals this week — fastest yet', time: '4 hours ago', icon: '🏆' },
    { tag: 'CRYPTO', title: 'Ethereum upgrade boosts network capacity by 300% — ETH up 12%', time: '6 hours ago', icon: 'Ξ' },
    { tag: 'STOCKS', title: 'NVIDIA hits new all-time high as AI chip demand remains insatiable', time: '8 hours ago', icon: '📈' },
  ]

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes wpSlide { from { transform: translateX(-110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .nav-link { font-size: 13px; color: #8b949e; text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: #C9A84C; }
        .team-card:hover { transform: translateY(-4px); transition: transform 0.2s ease; }
        .investor-card:hover { border-color: rgba(201,168,76,0.4) !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
          .hero-title { font-size: clamp(28px, 8vw, 52px) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .team-grid { grid-template-columns: 1fr 1fr !important; }
          .investors-grid { grid-template-columns: 1fr 1fr !important; }
          .services-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
          .nav-btns .signup-btn { display: none !important; }
        }
        @media (max-width: 480px) {
          .team-grid { grid-template-columns: 1fr !important; }
          .investors-grid { grid-template-columns: 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(6,10,15,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #161b22', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', boxShadow: '0 0 20px rgba(201,168,76,0.3)', flexShrink: 0 }}>C</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.1 }}>
              <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
              <span style={{ color: '#e6edf3' }}> Pro</span>
            </div>
            <div style={{ fontSize: 9, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Professional Trading</div>
          </div>
        </Link>

        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[{ l: 'Home', h: '#' }, { l: 'About', h: '#about' }, { l: 'Services', h: '#services' }, { l: 'Markets', h: '#markets' }, { l: 'Team', h: '#team' }, { l: 'FAQ', h: '#faq' }, { l: 'Terms', h: '/terms' }].map(item => (
            <a key={item.l} href={item.h} className="nav-link">{item.l}</a>
          ))}
        </div>

        <div className="nav-btns" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/login">
            <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>Sign In</button>
          </Link>
          <Link href="/register">
            <button className="signup-btn" style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>Get Started</button>
          </Link>
          <button className="mobile-hamburger" onClick={() => setMobileMenu(!mobileMenu)} style={{ display: 'none', background: 'none', border: 'none', color: '#8b949e', fontSize: 22, cursor: 'pointer', padding: 4 }}>☰</button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99, background: '#0d1117', borderBottom: '1px solid #161b22', padding: 20 }}>
          {[{ l: 'Home', h: '#' }, { l: 'About', h: '#about' }, { l: 'Services', h: '#services' }, { l: 'Markets', h: '#markets' }, { l: 'Team', h: '#team' }, { l: 'FAQ', h: '#faq' }, { l: 'Terms', h: '/terms' }].map(item => (
            <a key={item.l} href={item.h} onClick={() => setMobileMenu(false)} style={{ display: 'block', padding: '13px 0', fontSize: 14, color: '#8b949e', textDecoration: 'none', borderBottom: '1px solid #161b22' }}>{item.l}</a>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <Link href="/login" onClick={() => setMobileMenu(false)}>
              <button style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>Sign In</button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenu(false)}>
              <button style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>Get Started</button>
            </Link>
          </div>
        </div>
      )}

      {/* ── TICKER ── */}
      <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 98, background: '#0a0e14', borderBottom: '1px solid #161b22', overflow: 'hidden', height: 34, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap' }}>
          {[...TICKER, ...TICKER].map((p, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 18px', borderRight: '1px solid #161b22' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#e6edf3' }}>{p.s}</span>
              <span style={{ fontSize: 10, color: '#8b949e' }}>{p.p}</span>
              <span style={{ fontSize: 9, color: p.u ? '#3fb950' : '#f85149' }}>{p.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '160px 20px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '80vw', maxWidth: 600, aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, fontSize: 11, color: '#C9A84C', letterSpacing: '0.1em' }}>
            🤖 100% AUTOMATED AI TRADING PLATFORM
          </div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 800, color: '#e6edf3', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Trade Smarter.<br />
            <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Faster.</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#8b949e', lineHeight: 1.8, maxWidth: 580, margin: '0 auto 16px' }}>
            Our proprietary AI algorithm trades crypto and stocks <strong style={{ color: '#e6edf3' }}>24 hours a day, 7 days a week</strong> — generating consistent daily returns while you sleep. No experience required.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            {['⚡ Fully Automated', '🔒 Funds Protected', '💸 Daily Returns', '24/7 Support'].map(f => (
              <div key={f} style={{ fontSize: 12, color: '#8b949e' }}>{f}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28, marginBottom: 16 }}>
            <Link href="/register">
              <button style={{ padding: '14px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', boxShadow: '0 4px 24px rgba(201,168,76,0.4)' }}>
                Start Growing Wealth →
              </button>
            </Link>
            <Link href="/login">
              <button style={{ padding: '14px 32px', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}>
                Sign In
              </button>
            </Link>
          </div>
          <p style={{ fontSize: 11, color: '#484f58' }}>No credit card required · Free account · Instant access</p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '50px 20px', background: '#0d1117', borderTop: '1px solid #161b22', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 30px' }} className="stats-grid">
          {[{ v: '$2.4B+', l: 'Total Volume Traded' }, { v: '150K+', l: 'Active Traders' }, { v: '84%', l: 'AI Win Rate' }, { v: '24/7', l: 'Automated Trading' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, color: '#C9A84C', marginBottom: 6 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: '#484f58' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section style={{ padding: '22px 20px', background: '#0a0e14', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: '#161b22' }} />
            <span style={{ fontSize: 10, color: '#484f58', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Certifications & Compliance</span>
            <div style={{ flex: 1, height: 1, background: '#161b22' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🛡 256-bit SSL', '✅ KYC/AML Compliant', '🔐 GDPR Compliant', '🏦 Bank-Level Security', '⚖️ Regulated Platform', '🤖 AI-Powered', '💎 SOC 2 Certified', '🌍 Global Operations'].map(cert => (
              <div key={cert} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0d1117', border: '1px solid #161b22', borderRadius: 20, padding: '5px 12px' }}>
                <span style={{ fontSize: 11, color: '#8b949e', whiteSpace: 'nowrap' }}>{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT US ── */}
      <section id="about" style={{ padding: '70px 20px', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="two-col">
            <div>
              <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>About CapitalMarket Pro</div>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#e6edf3', marginBottom: 16, lineHeight: 1.3 }}>
                The Future of Investing<br />
                <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Is Automated</span>
              </h2>
              <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 16 }}>
                CapitalMarket Pro was founded by a team of Wall Street veterans, quant researchers, and blockchain engineers with a single mission: <strong style={{ color: '#e6edf3' }}>make professional-grade investing accessible to everyone.</strong>
              </p>
              <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 20 }}>
                Our proprietary AI trading system has been refined over 6 years using 15+ years of historical market data. Today, we manage over <strong style={{ color: '#C9A84C' }}>$2.4 billion</strong> in assets for <strong style={{ color: '#C9A84C' }}>150,000+</strong> traders across <strong style={{ color: '#C9A84C' }}>60+ countries</strong>. Our platform combines cryptocurrency trading, global stock markets, and affiliate income — all powered by a single intelligent engine.
              </p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[{ v: '2018', l: 'Founded' }, { v: '60+', l: 'Countries' }, { v: '6yr', l: 'Track Record' }, { v: '99.9%', l: 'Uptime' }].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#C9A84C' }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>🤖 How Our AI System Works</div>
                {[
                  { n: '01', title: 'You Deposit', desc: 'Send Bitcoin to your unique wallet. Funds confirmed in under 30 minutes.' },
                  { n: '02', title: 'AI Activates', desc: 'Our algorithm begins trading your funds across 200+ markets immediately.' },
                  { n: '03', title: 'Daily Returns', desc: 'Profits are credited to your dashboard every 24 hours automatically.' },
                  { n: '04', title: 'You Withdraw', desc: 'Request a withdrawal anytime. Funds sent to your wallet within 48 hours.' },
                ].map(step => (
                  <div key={step.n} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#C9A84C', flexShrink: 0 }}>{step.n}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 3 }}>{step.title}</div>
                      <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: '70px 20px', background: '#0d1117', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>What We Offer</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>Our Core Services</h2>
            <p style={{ fontSize: 14, color: '#8b949e', maxWidth: 480, margin: '0 auto' }}>Everything you need to grow your wealth — all in one professional platform.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="services-grid">
            {SERVICES.map(s => (
              <div key={s.title} style={{ background: '#060a0f', border: `1px solid ${s.color}22`, borderRadius: 14, padding: 22, textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 14px' }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="markets" style={{ padding: '70px 20px', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Platform Features</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>Built for Serious Traders</h2>
            <p style={{ fontSize: 14, color: '#8b949e', maxWidth: 480, margin: '0 auto' }}>One platform. Every market. Complete control over your financial future.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#0d1117', border: `1px solid ${f.color}22`, borderRadius: 14, padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 14px 0 80px', background: `${f.color}06` }} />
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP INVESTORS ── */}
      <section style={{ padding: '70px 20px', background: '#0d1117', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Community Success</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>Top Performing Investors</h2>
            <p style={{ fontSize: 14, color: '#8b949e', maxWidth: 480, margin: '0 auto' }}>Real results from our community of verified traders across the globe.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="investors-grid">
            {TOP_INVESTORS.map((inv, i) => (
              <div key={inv.name} className="investor-card" style={{ background: '#060a0f', border: '1px solid #161b22', borderRadius: 14, padding: 20, position: 'relative', transition: 'border-color 0.2s' }}>
                {i === 0 && <div style={{ position: 'absolute', top: -10, left: 20, background: '#C9A84C', color: '#060a0f', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>🏆 TOP EARNER</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${inv.color}, ${inv.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f', border: `2px solid ${inv.color}44`, flexShrink: 0 }}>{inv.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{inv.name}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>{inv.country}</div>
                  </div>
                </div>
                <div style={{ background: `${inv.color}0a`, border: `1px solid ${inv.color}22`, borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: inv.color, marginBottom: 2 }}>{inv.profit}</div>
                  <div style={{ fontSize: 11, color: '#8b949e' }}>Total profit earned</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[{ l: 'ROI', v: inv.roi, c: '#3fb950' }, { l: 'Plan', v: inv.plan, c: inv.color }, { l: 'Duration', v: inv.months, c: '#8b949e' }, { l: 'Status', v: '✅ Active', c: '#3fb950' }].map(item => (
                    <div key={item.l} style={{ background: '#0d1117', borderRadius: 8, padding: '7px 10px' }}>
                      <div style={{ fontSize: 9, color: '#484f58', marginBottom: 2, textTransform: 'uppercase' }}>{item.l}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: item.c }}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: 12, color: '#484f58', marginBottom: 16 }}>Join 150,000+ traders already growing their wealth on CapitalMarket Pro</p>
            <Link href="/register">
              <button style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>Join Our Community →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEWS ── */}
      <section style={{ padding: '70px 20px', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Latest Updates</div>
              <h2 style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 700, color: '#e6edf3' }}>Market News & Updates</h2>
            </div>
            <Link href="/register" style={{ textDecoration: 'none', fontSize: 12, color: '#C9A84C' }}>View all news →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="two-col">
            {NEWS.map((n, i) => (
              <div key={i} onClick={() => setActiveNews(i)} style={{ background: activeNews === i ? 'rgba(201,168,76,0.06)' : '#0d1117', border: `1px solid ${activeNews === i ? 'rgba(201,168,76,0.3)' : '#161b22'}`, borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{n.icon}</div>
                  <span style={{ fontSize: 9, color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', padding: '2px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.06em' }}>{n.tag}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', lineHeight: 1.5, marginBottom: 8 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>🕐 {n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" style={{ padding: '70px 20px', background: '#0d1117', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Our Leadership</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>World-Class Financial Professionals</h2>
            <p style={{ fontSize: 14, color: '#8b949e', maxWidth: 480, margin: '0 auto' }}>Our team brings decades of combined experience from the world's top financial institutions.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="team-grid">
            {TEAM.map(member => (
              <div key={member.name} className="team-card" style={{ background: `linear-gradient(135deg, ${member.color}12, ${member.color}05)`, border: `1px solid ${member.color}28`, borderRadius: 14, padding: 18 }}>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${member.color}, ${member.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#060a0f', border: `3px solid ${member.color}44` }}>{member.initials}</div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: '#3fb950', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, border: '2px solid #060a0f' }}>✓</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#e6edf3', marginBottom: 2 }}>{member.name} <span style={{ fontSize: 10 }}>{member.badge}</span></div>
                <div style={{ fontSize: 10, fontWeight: 700, color: member.color, marginBottom: 1 }}>{member.role}</div>
                <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{member.dept}</div>
                <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.6, marginBottom: 10 }}>{member.desc}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {member.tags.map(tag => (
                    <div key={tag} style={{ fontSize: 8, color: member.color, background: `${member.color}12`, border: `1px solid ${member.color}22`, padding: '2px 6px', borderRadius: 4 }}>{tag}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🏛 SEC Registered', '📜 CFA Institute', '🛡 FINRA Compliant', '🌍 FCA Authorized', '⚖️ AML Certified', '💎 SOC 2'].map(c => (
              <div key={c} style={{ fontSize: 11, color: '#8b949e', background: '#060a0f', border: '1px solid #161b22', padding: '5px 12px', borderRadius: 20 }}>{c}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '70px 20px', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Testimonials</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#e6edf3' }}>Trusted by Thousands</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="features-grid">
            {[
              { name: 'Michael R.', role: 'Professional Trader', text: 'CapitalMarket Pro completely changed how I invest. The AI system generated over $48,000 in profits in just 3 months. The automation is unreal.', avatar: 'M' },
              { name: 'Sarah K.', role: 'Crypto Investor', text: 'I was skeptical at first but the results speak for themselves. My Gold plan returned 252% in 21 days. The platform is incredibly professional.', avatar: 'S' },
              { name: 'James T.', role: 'Stock Trader', text: 'The account manager Joshua is exceptional. He helped me choose the right plan and I withdrew $34,000 profit last month. Highly recommend.', avatar: 'J' },
            ].map(t => (
              <div key={t.name} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: 28, color: '#C9A84C', marginBottom: 12 }}>"</div>
                <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 18 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '70px 20px', background: '#0d1117', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>FAQ</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#e6edf3' }}>Frequently Asked Questions</h2>
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
      <section style={{ padding: '80px 20px', textAlign: 'center', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#060a0f', boxShadow: '0 0 40px rgba(201,168,76,0.4)' }}>C</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
                <span style={{ color: '#e6edf3' }}> Pro</span>
              </div>
              <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Professional Trading Platform</div>
            </div>
          </div>

          <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, color: '#e6edf3', marginBottom: 16, lineHeight: 1.2 }}>
            Start Growing Your Wealth Today!
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#8b949e', lineHeight: 1.8, marginBottom: 32 }}>
            Join CapitalMarket Pro and let us help you achieve financial success with <strong style={{ color: '#C9A84C' }}>smart, strategic, automated investments.</strong> Your money works 24/7 — even while you sleep.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              style={{ flex: 1, minWidth: 220, maxWidth: 300, background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: '14px 16px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
            />
            <Link href={`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`}>
              <button style={{ padding: '14px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(201,168,76,0.35)' }}>
                Get Started Free →
              </button>
            </Link>
          </div>
          <p style={{ fontSize: 11, color: '#484f58' }}>No credit card required · Free account · Instant setup · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#060a0f', borderTop: '1px solid #161b22' }}>
        <div style={{ padding: '48px 20px 32px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32, maxWidth: 1060, margin: '0 auto' }} className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f' }}>C</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}><span style={{ color: '#C9A84C' }}>CapitalMarket</span><span style={{ color: '#e6edf3' }}> Pro</span></div>
                <div style={{ fontSize: 9, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Professional Trading</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#484f58', lineHeight: 1.8, maxWidth: 260, marginBottom: 14 }}>
              The world's most professional all-in-one automated trading platform. Crypto, stocks, and affiliate earnings unified.
            </p>
            <div style={{ fontSize: 11, color: '#484f58' }}>🔒 256-bit SSL · SOC 2 Certified · Regulated</div>
          </div>
          {[
            { title: 'Platform', items: [{ l: 'Dashboard', h: '/dashboard' }, { l: 'Investment Plans', h: '/register' }, { l: 'Trading Signals', h: '/register' }, { l: 'Affiliate Program', h: '/register' }, { l: 'Pro Cards', h: '/register' }] },
            { title: 'Company', items: [{ l: 'About Us', h: '#about' }, { l: 'Our Team', h: '#team' }, { l: 'Terms & Conditions', h: '/terms' }, { l: 'Privacy Policy', h: '/terms' }, { l: 'Risk Disclosure', h: '/terms' }] },
            { title: 'Support', items: [{ l: '24/7 Live Chat', h: '/dashboard/support' }, { l: 'FAQ', h: '#faq' }, { l: 'Market News', h: '#' }, { l: 'Contact Us', h: '#' }, { l: 'Careers', h: '#' }] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col.title}</div>
              {col.items.map(item => (
                <div key={item.l} style={{ marginBottom: 9 }}>
                  <a href={item.h} style={{ fontSize: 12, color: '#484f58', textDecoration: 'none' }}>{item.l}</a>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div style={{ borderTop: '1px solid #161b22', padding: '16px 20px', maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
            {[{ l: 'Home', h: '#' }, { l: 'Markets', h: '#markets' }, { l: 'News', h: '#' }, { l: 'About', h: '#about' }, { l: 'Team', h: '#team' }, { l: 'FAQ', h: '#faq' }, { l: 'Terms', h: '/terms' }].map(item => (
              <a key={item.l} href={item.h} style={{ fontSize: 12, color: '#484f58', textDecoration: 'none' }}>{item.l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 11, color: '#484f58' }}>© 2025 CapitalMarket Pro Financial Services. All Rights Reserved.</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>⚠ Trading involves risk. Past performance is not indicative of future results.</div>
          </div>
        </div>
      </footer>

      <WithdrawalPopup />
    </div>
  )
}
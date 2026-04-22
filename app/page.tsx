// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

var TICKER_DATA = [
  { sym: 'BTC/USD', price: '$94,820', chg: '+4.07%', up: true },
  { sym: 'ETH/USD', price: '$3,240', chg: '+1.87%', up: true },
  { sym: 'TSLA', price: '$248.50', chg: '+3.42%', up: true },
  { sym: 'AAPL', price: '$189.30', chg: '+1.21%', up: true },
  { sym: 'GOLD', price: '$2,318', chg: '+0.64%', up: true },
  { sym: 'NVDA', price: '$875.20', chg: '+4.11%', up: true },
  { sym: 'EUR/USD', price: '1.0842', chg: '+0.12%', up: true },
  { sym: 'GBP/USD', price: '1.2634', chg: '+0.08%', up: true },
  { sym: 'OIL', price: '$82.40', chg: '-0.31%', up: false },
  { sym: 'SPX', price: '$5,234', chg: '+0.92%', up: true },
  { sym: 'XRP/USD', price: '$0.612', chg: '+2.44%', up: true },
  { sym: 'BNB/USD', price: '$412.30', chg: '+1.33%', up: true },
  { sym: 'SOL/USD', price: '$148.20', chg: '+3.18%', up: true },
  { sym: 'ADA/USD', price: '$0.445', chg: '+1.92%', up: true },
  { sym: 'DOGE/USD', price: '$0.128', chg: '-0.54%', up: false },
  { sym: 'DOW', price: '$38,940', chg: '+0.44%', up: true },
]

var CRYPTO_COINS = [
  { sym: 'BTCUSDT', name: 'Bitcoin', short: 'BTC', price: '$94,820', chg: '+4.07%', up: true, color: '#F7931A', desc: 'Bitcoin is the first and largest decentralized digital currency operating without a central bank on the blockchain network. Created in 2008 by Satoshi Nakamoto, it pioneered the concept of peer-to-peer digital money.', icon: 'B' },
  { sym: 'ETHUSDT', name: 'Ethereum', short: 'ETH', price: '$3,240', chg: '+1.87%', up: true, color: '#627EEA', desc: 'Ethereum is a decentralized open-source blockchain with smart contract functionality. It is the largest programmable blockchain and second largest by market cap, powering DeFi, NFTs and Web3 applications.', icon: 'E' },
  { sym: 'XRPUSDT', name: 'Ripple', short: 'XRP', price: '$0.612', chg: '+2.44%', up: true, color: '#00AAE4', desc: 'Ripple is a real-time gross settlement system and remittance network. It uses XRP to facilitate fast, low-cost international transactions with settlement times of 3-5 seconds.', icon: 'X' },
  { sym: 'ADAUSDT', name: 'Cardano', short: 'ADA', price: '$0.445', chg: '+1.92%', up: true, color: '#0033AD', desc: 'Cardano is a proof-of-stake blockchain platform built with peer-reviewed research. Created by Ethereum co-founder Charles Hoskinson, it aims to provide a more scalable and sustainable blockchain.', icon: 'A' },
]

var PLANS = {
  crypto: [
    { name: 'Crypto Starter', roi: '2.0%', min: '$50', max: '$300', badge: '' },
    { name: 'Crypto Growth', roi: '3.5%', min: '$300', max: '$1,500', badge: 'POPULAR' },
    { name: 'Crypto Premium', roi: '5.5%', min: '$1,500', max: '$7,500', badge: '' },
    { name: 'Crypto Elite', roi: '8.0%', min: '$7,500', max: '$30,000', badge: 'BEST VALUE' },
  ],
  stock: [
    { name: 'Stock Starter', roi: '1.5%', min: '$100', max: '$500', badge: '' },
    { name: 'Stock Growth', roi: '2.5%', min: '$500', max: '$2,000', badge: 'POPULAR' },
    { name: 'Stock Premium', roi: '4.0%', min: '$2,000', max: '$10,000', badge: '' },
    { name: 'Stock Elite', roi: '6.0%', min: '$10,000', max: '$50,000', badge: '' },
  ],
  realestate: [
    { name: 'RE Starter', roi: '1.2%', min: '$200', max: '$1,000', badge: '' },
    { name: 'RE Growth', roi: '2.0%', min: '$1,000', max: '$5,000', badge: 'POPULAR' },
    { name: 'RE Premium', roi: '3.5%', min: '$5,000', max: '$25,000', badge: '' },
    { name: 'RE Elite', roi: '5.0%', min: '$25,000', max: '$100,000', badge: '' },
  ],
  forex: [
    { name: 'Forex Starter', roi: '1.0%', min: '$100', max: '$1,000', badge: '' },
    { name: 'Forex Growth', roi: '2.0%', min: '$1,000', max: '$5,000', badge: 'POPULAR' },
    { name: 'Forex Premium', roi: '3.1%', min: '$5,000', max: '$25,000', badge: '' },
    { name: 'Forex Elite', roi: '4.5%', min: '$25,000', max: '$100,000', badge: '' },
  ],
}

var TESTIMONIALS = [
  { name: 'Michael O.', role: 'Verified Trader', initials: 'MO', text: 'Since I started using CapitalMarket Pro I have been earning like never before. The AI signals and strategies are the best I have encountered on any trading platform.' },
  { name: 'Christy A.', role: 'Elite Investor', initials: 'CA', text: 'I already made more than $200,000 within a month investing here. Will invest again soon. The withdrawal process was smooth and funds arrived the same day.' },
  { name: 'James T.', role: 'Professional Trader', initials: 'JT', text: 'I was able to earn an additional $30,000 to my profit. The copy trading feature is incredible. I just follow top traders and earn passively every month.' },
  { name: 'Sarah K.', role: 'Premium Member', initials: 'SK', text: 'This was a very easy process and I received my funds quickly. The KYC was fast and customer support was very professional. Highly recommend CapitalMarket Pro.' },
  { name: 'Aisha M.', role: 'Active Trader', initials: 'AM', text: 'I rate CapitalMarket Pro five stars. You register online, upload your ID, deposit and withdraw after trades. The entire process is seamless and professional.' },
  { name: 'David R.', role: 'Long-term Client', initials: 'DR', text: 'I have invested here multiple times, always paid back on time. The investment plans are well-structured and the team is always available to assist.' },
  { name: 'Claudia V.', role: 'Satisfied Investor', initials: 'CV', text: 'I am very pleased with everything. The platform is intuitive, the returns are consistent and the customer service team is responsive and helpful.' },
  { name: 'Mike E.', role: 'Regular Investor', initials: 'ME', text: 'In difficult times it is good to know there are people who support you and help you grow your money. Thank you CapitalMarket Pro for this opportunity.' },
]

function CMLogo(props) {
  var s = props.size || 40
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9A84C" />
          <stop offset="1" stopColor="#F0D080" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#lg1)" />
      <polyline points="6,30 13,20 20,25 29,11 34,16" stroke="#060a0e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="29" cy="11" r="3" fill="#060a0e" />
      <line x1="6" y1="33" x2="34" y2="33" stroke="#060a0e" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

export default function LandingPage() {
  var [tradingDrop, setTradingDrop] = useState(false)
  var [systemDrop, setSystemDrop] = useState(false)
  var [companyDrop, setCompanyDrop] = useState(false)
  var [mobileOpen, setMobileOpen] = useState(false)
  var [planTab, setPlanTab] = useState('crypto')
  var [tickerX, setTickerX] = useState(0)
  var [expandedAnalysis, setExpandedAnalysis] = useState(null)
  var [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  var [contactSent, setContactSent] = useState(false)
  var [contactLoading, setContactLoading] = useState(false)
  var [eduTab, setEduTab] = useState('crypto')
  var [navScrolled, setNavScrolled] = useState(false)

  useEffect(function() {
    var t = setInterval(function() {
      setTickerX(function(x) { return x <= -3200 ? 0 : x - 0.7 })
    }, 16)
    return function() { clearInterval(t) }
  }, [])

  useEffect(function() {
    function onScroll() { setNavScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll)
    return function() { window.removeEventListener('scroll', onScroll) }
  }, [])

  async function handleContact(e) {
    e.preventDefault()
    setContactLoading(true)
    await new Promise(function(r) { setTimeout(r, 1500) })
    setContactLoading(false)
    setContactSent(true)
  }

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  return (
    <div style={{ minHeight: '100vh', background: '#060a0e', color: '#e8edf5', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060a0e; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(.8); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-link { color: #8892a0; font-size: 14px; font-weight: 500; cursor: pointer; transition: color .2s; white-space: nowrap; }
        .nav-link:hover { color: #C9A84C; }
        .dropdown { position: absolute; top: calc(100% + 10px); left: 0; background: #0d1117; border: 1px solid #1e2530; border-radius: 14px; padding: 8px; min-width: 210px; z-index: 9999; box-shadow: 0 20px 60px rgba(0,0,0,.6); animation: fadeIn .15s ease; }
        .dropdown a { display: block; padding: 10px 14px; color: #8892a0; font-size: 13px; border-radius: 9px; transition: all .15s; font-family: Inter, sans-serif; }
        .dropdown a:hover { background: rgba(201,168,76,.08); color: #C9A84C; }
        .feat-card { background: #0d1117; border: 1px solid #1e2530; border-radius: 18px; padding: 28px; transition: all .3s; }
        .feat-card:hover { border-color: rgba(201,168,76,.35); transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,.4); }
        .plan-card { background: #0d1117; border: 1px solid #1e2530; border-radius: 20px; padding: 28px 24px; transition: all .3s; position: relative; }
        .plan-card:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(0,0,0,.5); }
        .tab-btn { padding: 10px 20px; border-radius: 10px; border: 1px solid #1e2530; cursor: pointer; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; transition: all .2s; background: transparent; color: #8892a0; }
        .tab-btn.on { background: linear-gradient(135deg,#C9A84C,#E8D08C); color: #060a0e; border-color: transparent; }
        .tv-wrap { border-radius: 16px; overflow: hidden; border: 1px solid #1e2530; }
        .inp { width: 100%; background: #0d1117; border: 1.5px solid #1e2530; border-radius: 11px; padding: 13px 16px; color: #e8edf5; font-size: 14px; font-family: Inter, sans-serif; outline: none; transition: border-color .2s; }
        .inp:focus { border-color: #C9A84C; }
        .inp::placeholder { color: #4a5568; }
        select.inp option { background: #0d1117; }
        .crypto-card { background: #0d1117; border: 1px solid #1e2530; border-radius: 20px; overflow: hidden; transition: all .3s; }
        .crypto-card:hover { border-color: rgba(201,168,76,.4); transform: translateY(-5px); box-shadow: 0 24px 60px rgba(0,0,0,.4); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 3px; }

        /* MOBILE */
        .desk-nav { display: flex; align-items: center; gap: 28px; }
        .mob-btn { display: none; }
        .mob-menu { display: none; }
        @media (max-width: 1024px) {
          .desk-nav { display: none !important; }
          .mob-btn { display: flex !important; }
        }
        @media (max-width: 768px) {
          .mob-menu { display: block; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .three-col { grid-template-columns: 1fr !important; }
          .plans-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .copy-grid { grid-template-columns: 1fr !important; }
          .copy-inner { grid-template-columns: 1fr 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .crypto-grid { grid-template-columns: 1fr !important; }
          .course-grid { grid-template-columns: 1fr 1fr !important; }
          .trust-grid { grid-template-columns: 1fr 1fr !important; }
          .sec { padding: 56px 16px !important; }
          .h1 { font-size: 36px !important; letter-spacing: -1px !important; }
          .h2 { font-size: 26px !important; }
          .hero-sec { padding-top: 120px !important; padding-bottom: 56px !important; }
          .cta-inner { padding: 48px 24px !important; }
          .nav-wrap { padding: 0 16px !important; }
          .stat-row { gap: 24px !important; }
          .hero-btns { flex-direction: column !important; }
          .hero-btns a button { width: 100% !important; }
        }
      `}</style>

      {/* ── NAVIGATION ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: navScrolled ? 'rgba(6,10,14,0.98)' : 'rgba(6,10,14,0.85)', borderBottom: '1px solid ' + (navScrolled ? 'rgba(255,255,255,0.08)' : 'transparent'), backdropFilter: 'blur(24px)', transition: 'all .3s' }}>
        <div className="nav-wrap" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CMLogo size={38} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#e8edf5', letterSpacing: '-0.3px', lineHeight: 1.1 }}>CapitalMarket <span style={{ color: G }}>Pro</span></div>
              <div style={{ fontSize: 9, color: '#4a5568', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Global Trading Platform</div>
            </div>
          </Link>

          <div className="desk-nav">
            <div style={{ position: 'relative' }} onMouseEnter={function() { setTradingDrop(true) }} onMouseLeave={function() { setTradingDrop(false) }}>
              <div className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Trading <span style={{ fontSize: 9 }}>▾</span></div>
              {tradingDrop && (
                <div className="dropdown">
                  <div style={{ fontSize: 10, color: '#4a5568', fontWeight: 700, padding: '6px 14px', textTransform: 'uppercase', letterSpacing: '.1em' }}>Markets</div>
                  {[['Cryptocurrencies', '/dashboard'], ['Forex', '/dashboard'], ['Shares', '/dashboard'], ['Indices', '/dashboard'], ['ETFs', '/dashboard'], ['Commodities', '/dashboard']].map(function(item) {
                    return <Link key={item[0]} href={item[1]}>{item[0]}</Link>
                  })}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }} onMouseEnter={function() { setSystemDrop(true) }} onMouseLeave={function() { setSystemDrop(false) }}>
              <div className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>System <span style={{ fontSize: 9 }}>▾</span></div>
              {systemDrop && (
                <div className="dropdown">
                  {[['Trade Now', '/dashboard'], ['Copy Trading', '/dashboard'], ['Automated Trading', '/dashboard'], ['Portfolio', '/dashboard']].map(function(item) {
                    return <Link key={item[0]} href={item[1]}>{item[0]}</Link>
                  })}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }} onMouseEnter={function() { setCompanyDrop(true) }} onMouseLeave={function() { setCompanyDrop(false) }}>
              <div className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Company <span style={{ fontSize: 9 }}>▾</span></div>
              {companyDrop && (
                <div className="dropdown">
                  {[['About Us', '#about'], ['Why Choose Us', '#why'], ['FAQ', '#faq'], ['Legal and Regulation', '/terms']].map(function(item) {
                    return <a key={item[0]} href={item[1]}>{item[0]}</a>
                  })}
                </div>
              )}
            </div>
            <a href="#education" className="nav-link">Education</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/login">
              <button style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 10, color: '#8892a0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Log in</button>
            </Link>
            <Link href="/register">
              <button style={{ padding: '9px 20px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(201,168,76,.3)' }}>Sign up</button>
            </Link>
            <button className="mob-btn" onClick={function() { setMobileOpen(!mobileOpen) }} style={{ background: 'none', border: '1px solid #1e2530', borderRadius: 9, color: '#8892a0', cursor: 'pointer', width: 38, height: 38, fontSize: 16, alignItems: 'center', justifyContent: 'center' }}>☰</button>
          </div>
        </div>

        {mobileOpen && (
          <div style={{ background: '#0d1117', borderTop: '1px solid #1e2530', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[['Trading', '/dashboard'], ['Cryptocurrencies', '/dashboard'], ['Forex', '/dashboard'], ['Copy Trading', '/dashboard'], ['Investment Plans', '#plans'], ['About Us', '#about'], ['Education', '#education'], ['Contact', '#contact']].map(function(item) {
              return <a key={item[0]} href={item[1]} onClick={function() { setMobileOpen(false) }} style={{ padding: '13px 4px', color: '#8892a0', fontSize: 14, borderBottom: '1px solid rgba(30,37,48,.6)' }}>{item[0]}</a>
            })}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <Link href="/login" style={{ flex: 1, textAlign: 'center', padding: '12px', border: '1px solid #1e2530', borderRadius: 10, color: '#8892a0', fontSize: 13, fontWeight: 600 }}>Log in</Link>
              <Link href="/register" style={{ flex: 1, textAlign: 'center', padding: '12px', background: GG, borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800 }}>Sign up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── TICKER ── */}
      <div style={{ position: 'fixed', top: 70, left: 0, right: 0, zIndex: 999, background: '#0a0d12', borderBottom: '1px solid #1e2530', height: 38, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(90deg,#0a0d12,transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(270deg,#0a0d12,transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', transform: 'translateX(' + tickerX + 'px)', whiteSpace: 'nowrap', willChange: 'transform' }}>
          {[...TICKER_DATA, ...TICKER_DATA, ...TICKER_DATA].map(function(t, i) {
            return (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 22px', borderRight: '1px solid rgba(30,37,48,.7)', height: 38 }}>
                <span style={{ fontSize: 11, color: '#8892a0', fontWeight: 600 }}>{t.sym}</span>
                <span style={{ fontSize: 12, color: '#e8edf5', fontWeight: 700 }}>{t.price}</span>
                <span style={{ fontSize: 11, color: t.up ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>{t.chg}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero-sec" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 148, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.025) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 65%)', top: '50%', left: '35%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div style={{ animation: 'fadeUp .6s ease' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(46,204,113,.08)', border: '1px solid rgba(46,204,113,.2)', borderRadius: 100, padding: '6px 16px', fontSize: 12, color: '#2ecc71', marginBottom: 22, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Innovative Trading Platform
              </div>
              <h1 className="h1" style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.05, marginBottom: 20, letterSpacing: '-2px' }}>
                <span style={{ color: '#e8edf5' }}>Global Trading</span><br />
                <span style={{ background: GG, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Made Simple</span>
              </h1>
              <p style={{ fontSize: 17, color: '#8892a0', lineHeight: 1.8, marginBottom: 32, maxWidth: 500 }}>
                Access advanced trading tools for Forex, Cryptocurrencies, Commodities, Indices and more with competitive spreads and lightning-fast execution.
              </p>
              <div className="hero-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
                <Link href="/register">
                  <button style={{ padding: '15px 36px', background: GG, border: 'none', borderRadius: 13, color: '#060a0e', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 28px rgba(201,168,76,.35)' }}>Create Account</button>
                </Link>
                <Link href="/login">
                  <button style={{ padding: '15px 32px', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: 13, color: '#8892a0', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Login</button>
                </Link>
              </div>
              <div className="stat-row" style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {[['$4.2B+', 'Assets Managed'], ['180K+', 'Investors'], ['142+', 'Countries'], ['99.9%', 'Uptime']].map(function(s) {
                  return (
                    <div key={s[1]}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: G }}>{s[0]}</div>
                      <div style={{ fontSize: 11, color: '#4a5568', marginTop: 3 }}>{s[1]}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hero chart */}
            <div style={{ animation: 'fadeUp .8s ease' }}>
              <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 22, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,.6)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc71', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 11, color: '#2ecc71', fontWeight: 700 }}>LIVE</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginLeft: 6 }}>BTC/USD</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {['1D', '1W', '1M', '1Y'].map(function(t, i) {
                      return <button key={t} style={{ padding: '4px 10px', background: i === 0 ? 'rgba(201,168,76,.15)' : 'transparent', border: '1px solid ' + (i === 0 ? 'rgba(201,168,76,.4)' : '#1e2530'), borderRadius: 7, color: i === 0 ? G : '#4a5568', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{t}</button>
                    })}
                  </div>
                </div>
                <div style={{ padding: '14px 20px 6px' }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: G }}>$94,820.00</div>
                  <div style={{ fontSize: 13, color: '#2ecc71', fontWeight: 600, marginTop: 3 }}>+4.07% +$3,720 today</div>
                </div>
                <svg width="100%" height="130" viewBox="0 0 500 130" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,105 C40,95 70,90 100,78 S145,60 175,55 S215,62 245,48 S280,28 310,24 S350,34 375,20 S420,12 450,8 S485,10 500,7 L500,130 L0,130 Z" fill="url(#cg1)" />
                  <path d="M0,105 C40,95 70,90 100,78 S145,60 175,55 S215,62 245,48 S280,28 310,24 S350,34 375,20 S420,12 450,8 S485,10 500,7" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="500" cy="7" r="4" fill="#C9A84C" />
                </svg>
                <div style={{ padding: '10px 14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[{ l: 'ETH/USD', v: '$3,240', c: '+1.87%' }, { l: 'TSLA', v: '$248.50', c: '+3.42%' }, { l: 'GOLD', v: '$2,318', c: '+0.64%' }].map(function(item) {
                    return (
                      <div key={item.l} style={{ background: '#141920', borderRadius: 11, padding: '11px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 4 }}>{item.l}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5' }}>{item.v}</div>
                        <div style={{ fontSize: 10, color: '#2ecc71', fontWeight: 600 }}>{item.c}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY TRADE WITH US ── */}
      <section id="why" className="sec" style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.9)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Why Choose Us</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Why Trade With Us</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Everything you need for successful trading</p>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
            {[
              { icon: '📊', title: 'Trading Tools', desc: 'Plan your trades with our wide range of free professional trading tools including AI signals, real-time charts, heat maps, and expert market analysis from industry professionals.' },
              { icon: '🌍', title: 'Trading Products', desc: 'Diverse opportunities to optimize your portfolio across Cryptocurrencies, Stocks, Forex, Indices, Real Estate and Commodities all within one powerful platform.' },
              { icon: '⚡', title: 'Trading Platforms', desc: 'Powerful platforms that suit all trading styles and needs on any device. Trade from your browser, desktop or mobile app with the same full set of features.' },
              { icon: '💳', title: 'Funding Methods', desc: 'Multiple quick, easy and secure funding methods including Bitcoin, Ethereum, USDT and more. Deposits credited to your account within 30 minutes of confirmation.' },
            ].map(function(f) {
              return (
                <div key={f.title} className="feat-card">
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#e8edf5', marginBottom: 10 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.75 }}>{f.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── REAL-TIME INTELLIGENCE ── */}
      <section className="sec" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Real-Time Intelligence</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Market Analysis and Insights</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Stay ahead with real-time data, AI-powered insights, and expert analysis</p>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Live Market Overview</div>
              <div className="tv-wrap">
                <iframe src="https://s.tradingview.com/embed-widget/market-overview/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%221M%22%2C%22showChart%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22500%22%2C%22isTransparent%22%3Atrue%2C%22showSymbolLogo%22%3Atrue%2C%22tabs%22%3A%5B%7B%22title%22%3A%22Crypto%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22BINANCE%3ABTCUSDT%22%7D%2C%7B%22s%22%3A%22BINANCE%3AETHUSDT%22%7D%2C%7B%22s%22%3A%22BINANCE%3ASOLUSDT%22%7D%5D%7D%2C%7B%22title%22%3A%22Stocks%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22NASDAQ%3AAAPL%22%7D%2C%7B%22s%22%3A%22NASDAQ%3ATSLA%22%7D%2C%7B%22s%22%3A%22NASDAQ%3ANVDA%22%7D%5D%7D%2C%7B%22title%22%3A%22Forex%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FX%3AEURUSD%22%7D%2C%7B%22s%22%3A%22FX%3AGBPUSD%22%7D%2C%7B%22s%22%3A%22FX%3AUSDJPY%22%7D%5D%7D%5D%7D" width="100%" height="500" frameBorder="0" style={{ display: 'block' }} title="Market Overview" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Expert Market Analysis</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { title: 'Daily Market Updates', icon: '📰', text: 'Receive daily market analysis directly to your inbox. Our team of expert analysts provide actionable insights on market trends, price movements, and trading opportunities across all major asset classes including Crypto, Forex, Stocks and Commodities.' },
                  { title: 'Premium Trading Tools', icon: '🛠', text: 'Access advanced trading tools designed for all experience levels. Our platform offers AI-powered signals, customizable chart layouts, risk management calculators, and multi-language support for international traders from over 142 countries.' },
                  { title: 'Funds Protection', icon: '🛡', text: 'Your security is our priority. We provide industry-leading insurance protection for client funds up to $1,000,000. All client funds are held in segregated accounts with Tier 1 regulated financial institutions, completely separate from company funds.' },
                ].map(function(card, i) {
                  var isOpen = expandedAnalysis === i
                  return (
                    <div key={card.title} style={{ background: '#0d1117', border: '1px solid ' + (isOpen ? 'rgba(201,168,76,.4)' : '#1e2530'), borderRadius: 16, overflow: 'hidden', transition: 'all .3s' }}>
                      <div onClick={function() { setExpandedAnalysis(isOpen ? null : i) }} style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 20 }}>{card.icon}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{card.title}</span>
                        </div>
                        <span style={{ color: G, fontSize: 13, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .3s' }}>▾</span>
                      </div>
                      {isOpen && (
                        <div style={{ padding: '0 18px 16px', fontSize: 13, color: '#8892a0', lineHeight: 1.75, borderTop: '1px solid #1e2530', paddingTop: 14 }}>
                          {card.text}
                          <Link href="/register" style={{ display: 'inline-block', marginTop: 10, color: G, fontSize: 12, fontWeight: 600 }}>Learn more →</Link>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div style={{ background: 'linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.03))', border: '1px solid rgba(201,168,76,.2)', borderRadius: 16, padding: '20px 18px' }}>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.7, marginBottom: 14 }}>Our teams support you 24/7 in more than 20 languages. Our wide range of payment methods gives you greater flexibility for deposits and withdrawals.</div>
                  <Link href="/register">
                    <button style={{ padding: '11px 22px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Learn more about our services</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVERSE TRADING PRODUCTS ── */}
      <section className="sec" style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.9)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Markets</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Diverse Trading Products</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Access global markets with competitive conditions</p>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
            {[
              { icon: '💱', title: 'Forex', desc: 'Trade 70+ major, minor and exotic currency pairs with competitive spreads and top-tier liquidity available 24 hours a day, 5 days a week.', color: '#3498db' },
              { icon: '📈', title: 'Shares', desc: 'Access hundreds of public companies from the US, UK, Germany and more global exchanges. Trade Tesla, Apple, NVIDIA and more.', color: '#2ecc71' },
              { icon: '⛽', title: 'Energies', desc: 'Discover opportunities in UK and US Crude Oil, Natural Gas and other energy commodities with tight spreads and deep liquidity.', color: '#e67e22' },
              { icon: '📉', title: 'Indices', desc: 'Trade major and minor index CFDs from around the globe including S&P 500, NASDAQ, FTSE 100, DAX and many more.', color: '#9b59b6' },
            ].map(function(p) {
              return (
                <div key={p.title} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, padding: 26, transition: 'all .3s', cursor: 'pointer' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; e.currentTarget.style.transform = 'translateY(-5px)' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: p.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{p.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#e8edf5', marginBottom: 10 }}>{p.title}</div>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.75, marginBottom: 18 }}>{p.desc}</div>
                  <Link href="/dashboard" style={{ fontSize: 13, color: G, fontWeight: 600 }}>Explore {p.title} →</Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CRYPTOCURRENCY TRADING ── */}
      <section className="sec" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Popular Asset Class</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Cryptocurrency Trading</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Trade the world's most popular digital assets with competitive spreads and advanced tools</p>
          </div>
          <div className="crypto-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginBottom: 32 }}>
            {CRYPTO_COINS.map(function(coin) {
              return (
                <div key={coin.sym} className="crypto-card">
                  <div style={{ padding: '18px 18px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: coin.color + '20', border: '2px solid ' + coin.color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: coin.color }}>{coin.icon}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{coin.name}</div>
                          <div style={{ fontSize: 11, color: '#4a5568' }}>{coin.short}/USD</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5' }}>{coin.price}</div>
                        <div style={{ fontSize: 12, color: coin.up ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>{coin.chg}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.65, marginBottom: 12 }}>{coin.desc}</p>
                  </div>
                  <iframe src={'https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=en#%7B%22symbol%22%3A%22BINANCE%3A' + coin.sym + '%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22150%22%2C%22dateRange%22%3A%221M%22%2C%22colorTheme%22%3A%22dark%22%2C%22trendLineColor%22%3A%22rgba(201%2C168%2C76%2C1)%22%2C%22underLineColor%22%3A%22rgba(201%2C168%2C76%2C0.1)%22%2C%22isTransparent%22%3Atrue%2C%22autosize%22%3Atrue%7D'} width="100%" height="150" frameBorder="0" style={{ display: 'block' }} title={coin.name} />
                  <div style={{ padding: '12px 18px 16px' }}>
                    <Link href="/dashboard">
                      <button style={{ width: '100%', padding: '11px', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', borderRadius: 11, color: G, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s' }} onMouseEnter={function(e) { e.currentTarget.style.background = GG; e.currentTarget.style.color = '#060a0e' }} onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = G }}>
                        Trade {coin.short} Now →
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/dashboard">
              <button style={{ padding: '14px 40px', background: 'transparent', border: '2px solid rgba(201,168,76,.4)', borderRadius: 13, color: G, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s' }} onMouseEnter={function(e) { e.currentTarget.style.background = GG; e.currentTarget.style.color = '#060a0e' }} onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = G }}>
                View All Cryptocurrencies →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── EDUCATION CENTER ── */}
      <section id="education" className="sec" style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.9)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Education Center</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Learn From Market Experts</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Master trading from fundamentals to advanced strategies with our comprehensive learning center</p>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Featured: Introduction to Trading</div>
              <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid #1e2530', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
                <iframe width="100%" height="260" src="https://www.youtube.com/embed/ZCFkWDdmXG8?rel=0&modestbranding=1" title="How The Stock Exchange Works" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ display: 'block' }} />
              </div>
              <div style={{ marginTop: 14, fontSize: 13, color: '#4a5568', lineHeight: 1.7 }}>New to investing? This video explains how the stock exchange works, how prices move, and how you can profit from global financial markets. Perfect for beginners getting started on CapitalMarket Pro.</div>
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {[['crypto', 'Crypto'], ['forex', 'Forex'], ['stocks', 'Stocks'], ['basics', 'Basics']].map(function(t) {
                  return <button key={t[0]} className={'tab-btn' + (eduTab === t[0] ? ' on' : '')} onClick={function() { setEduTab(t[0]) }} style={{ padding: '7px 14px', fontSize: 12 }}>{t[1]}</button>
                })}
              </div>
              <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: 22, marginBottom: 16 }}>
                {eduTab === 'crypto' && (
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 10 }}>About Bitcoin</h3>
                    <p style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8, marginBottom: 14 }}>Bitcoin is the first decentralized digital currency that operates without a central authority. Transactions are verified by network nodes through cryptography and recorded on a public distributed ledger called a blockchain. Created in 2008 by Satoshi Nakamoto, Bitcoin pioneered the concept of cryptocurrencies.</p>
                    <p style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8 }}>At CapitalMarket Pro, our Crypto plans start from just $50 with returns of up to 8% monthly, making Bitcoin trading accessible to every type of investor.</p>
                  </div>
                )}
                {eduTab === 'forex' && (
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 10 }}>About Forex Trading</h3>
                    <p style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8, marginBottom: 14 }}>The Forex market is the largest financial market in the world with over $7.5 trillion traded daily. Currency pairs like EUR/USD, GBP/USD and USD/JPY offer continuous trading opportunities 24 hours a day, 5 days a week across global financial centers.</p>
                    <p style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8 }}>Our Forex plans offer competitive spreads from 0.0 pips with leverage options for experienced traders and conservative strategies for beginners.</p>
                  </div>
                )}
                {eduTab === 'stocks' && (
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 10 }}>About Stock Trading</h3>
                    <p style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8, marginBottom: 14 }}>Stock trading involves buying and selling shares of publicly listed companies. Giants like Tesla, Apple, NVIDIA and Amazon offer exposure to some of the world's most innovative businesses. Our AI-powered stock plans analyze company fundamentals and market sentiment to maximize returns.</p>
                    <p style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8 }}>Stock plans start from $100 with returns of up to 6% monthly, managed by our professional trading desk with decades of combined market experience.</p>
                  </div>
                )}
                {eduTab === 'basics' && (
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 10 }}>Trading Fundamentals</h3>
                    <p style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8, marginBottom: 14 }}>Trading is the process of buying and selling financial instruments to generate profit. You do not need to be a professional trader to make money. With the right tools, information and access to global markets, anyone can build wealth through disciplined investing.</p>
                    <p style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8 }}>At CapitalMarket Pro, we have simplified the process so you can invest confidently and withdraw your profits at any time.</p>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/register">
                  <button style={{ padding: '11px 20px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Explore Resources</button>
                </Link>
                <Link href="/register">
                  <button style={{ padding: '11px 20px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 10, color: '#8892a0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Join Free Webinars</button>
                </Link>
              </div>
            </div>
          </div>
          <div className="course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[
              { icon: '📘', title: 'Crypto for Beginners', level: 'Beginner', duration: '2 hours', lessons: 12, color: '#F7931A' },
              { icon: '📗', title: 'Forex Fundamentals', level: 'Beginner', duration: '3 hours', lessons: 18, color: '#3498db' },
              { icon: '📙', title: 'Technical Analysis', level: 'Intermediate', duration: '4 hours', lessons: 24, color: '#9b59b6' },
              { icon: '📕', title: 'Advanced Strategies', level: 'Advanced', duration: '6 hours', lessons: 32, color: '#e74c3c' },
            ].map(function(course) {
              return (
                <div key={course.title} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: 18, transition: 'border-color .3s', cursor: 'pointer' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{course.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 6 }}>{course.title}</div>
                  <span style={{ fontSize: 10, color: course.color, background: course.color + '15', padding: '3px 8px', borderRadius: 100, fontWeight: 600 }}>{course.level}</span>
                  <div style={{ fontSize: 11, color: '#4a5568', marginTop: 8, marginBottom: 10 }}>{course.duration} · {course.lessons} lessons</div>
                  <Link href="/register" style={{ fontSize: 12, color: G, fontWeight: 700 }}>Start Course →</Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SUPERIOR TRADING CONDITIONS ── */}
      <section className="sec" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 14 }}>Superior Trading Experience</div>
              <h2 className="h2" style={{ fontSize: 36, fontWeight: 800, color: '#e8edf5', marginBottom: 18, lineHeight: 1.15 }}>Tighter Spreads.<br />Faster Execution.</h2>
              <p style={{ fontSize: 15, color: '#8892a0', lineHeight: 1.8, marginBottom: 28 }}>Experience institutional-grade trading conditions designed for professional traders at every experience level.</p>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Premium Trading Conditions</div>
                {['Ultra-low spreads from 0.0 pips on major currency pairs', 'Lightning-fast execution from NY4 server with minimal slippage', 'Top-tier liquidity and market-leading pricing available 24/5', 'No dealing desk and no requotes guaranteed on all accounts', 'Negative balance protection for all retail clients', 'Advanced risk management including stop-loss and take-profit'].map(function(item) {
                  return (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 11 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(46,204,113,.15)', border: '1px solid rgba(46,204,113,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: '#2ecc71' }}>v</span>
                      </div>
                      <span style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.6 }}>{item}</span>
                    </div>
                  )
                })}
              </div>
              <Link href="/register">
                <button style={{ padding: '12px 26px', background: GG, border: 'none', borderRadius: 11, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>View Detailed Conditions</button>
              </Link>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Live Market Overview</div>
              <div className="tv-wrap">
                <iframe src="https://s.tradingview.com/widgetembed/?frameElementId=tw1&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=0&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=en" width="100%" height="400" frameBorder="0" allowFullScreen style={{ display: 'block' }} title="Live Chart" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COPY TRADING ── */}
      <section className="sec" style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.9)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Social Trading</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Copy Professional Traders</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Let experienced traders do the work for you with our advanced copy trading system</p>
          </div>
          <div className="copy-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
            <div className="copy-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: '📋', title: 'Copy 400+ Strategies', desc: 'Access hundreds of strategies for more than 1000 instruments across 7 different asset classes.' },
                { icon: '🏆', title: 'Select Top Performers', desc: 'Use our reporting tools to rank strategies by performance and select the most suitable for your goals.' },
                { icon: '🛡', title: 'Stay Protected', desc: 'Sophisticated risk calculations keep your exposure at an optimal level for your account at all times.' },
                { icon: '⚙', title: 'Combine Methods', desc: 'Combine copying with manual and automated trading depending on your experience and preferences.' },
              ].map(function(item) {
                return (
                  <div key={item.title} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: 18 }}>
                    <div style={{ fontSize: 26, marginBottom: 10 }}>{item.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 7 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.65 }}>{item.desc}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 22, padding: 26 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5', marginBottom: 5 }}>Top Copy Traders This Month</div>
              <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 18 }}>Live performance data. Updated every 24 hours.</div>
              {[
                { name: 'AlgoMaster_X', roi: '+142%', followers: '2,840', risk: 'Low', win: '87%' },
                { name: 'CryptoWolf99', roi: '+98%', followers: '1,920', risk: 'Medium', win: '79%' },
                { name: 'ForexPro_AI', roi: '+76%', followers: '3,100', risk: 'Low', win: '84%' },
                { name: 'GoldTrader_V', roi: '+54%', followers: '890', risk: 'Low', win: '91%' },
                { name: 'StockKing247', roi: '+48%', followers: '1,240', risk: 'Medium', win: '74%' },
              ].map(function(t, i) {
                var rankColors = ['#C9A84C', '#8892a0', '#CD7F32', '#3498db', '#2ecc71']
                return (
                  <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(30,37,48,.8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: rankColors[i] + '20', border: '1px solid ' + rankColors[i] + '50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: rankColors[i], flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#060a0e' }}>{t.name[0]}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>{t.name}</div>
                        <div style={{ fontSize: 10, color: '#4a5568' }}>{t.followers} followers · {t.win} win rate</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#2ecc71' }}>{t.roi}</div>
                      <div style={{ fontSize: 10, color: '#4a5568' }}>Risk: {t.risk}</div>
                    </div>
                  </div>
                )
              })}
              <Link href="/register" style={{ display: 'block', marginTop: 18 }}>
                <button style={{ width: '100%', padding: '13px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Start Copy Trading →</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT US ── */}
      <section id="about" className="sec" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 14 }}>Our Story</div>
              <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 18, lineHeight: 1.15 }}>About Us</h2>
              <p style={{ fontSize: 15, color: '#8892a0', lineHeight: 1.85, marginBottom: 18 }}>CapitalMarket Pro has become one of the most reputable investment platforms in the industry, offering traders and investors access to Cryptocurrencies, Forex, Equities, Commodities, Real Estate and Futures. Investing on the global market is a legitimate and straightforward way of generating consistent income.</p>
              <p style={{ fontSize: 15, color: '#8892a0', lineHeight: 1.85, marginBottom: 28 }}>The good news is that you do not have to be a professional trader in order to make money. All you need is the right platform and the right strategy. CapitalMarket Pro lets you invest in the way that best suits your goals and risk tolerance.</p>
              <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 7 }}>Personalized Trading</div>
                  <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.65 }}>Risk a little or a lot. Short-term gains or long-game investing. Day trader or passive investor — we have the right plan for you.</div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 7 }}>Complete Control</div>
                  <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.65 }}>With the right tools and access to all global markets, CapitalMarket Pro puts you in full control of your financial future.</div>
                </div>
              </div>
              <Link href="/register">
                <button style={{ padding: '12px 26px', background: GG, border: 'none', borderRadius: 11, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Learn More About Us →</button>
              </Link>
            </div>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { num: '$4.2B+', label: 'Assets Under Management', color: G },
                { num: '180K+', label: 'Active Investors Worldwide', color: '#3498db' },
                { num: '142+', label: 'Countries Supported', color: '#2ecc71' },
                { num: '40+', label: 'Industry Awards Won', color: '#9b59b6' },
                { num: '24/7', label: 'Customer Support', color: '#e67e22' },
                { num: '99.9%', label: 'Platform Uptime', color: '#1abc9c' },
              ].map(function(stat) {
                return (
                  <div key={stat.label} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, marginBottom: 6 }}>{stat.num}</div>
                    <div style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.5 }}>{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── INVESTMENT PLANS ── */}
      <section id="plans" className="sec" style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.9)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Trading Plans</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Investment Opportunities</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Choose the perfect plan that suits your investment strategy and financial goals</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
            {[['crypto', 'Crypto'], ['stock', 'Stocks'], ['realestate', 'Real Estate'], ['forex', 'Forex']].map(function(t) {
              return <button key={t[0]} className={'tab-btn' + (planTab === t[0] ? ' on' : '')} onClick={function() { setPlanTab(t[0]) }}>{t[1]}</button>
            })}
          </div>
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 28 }}>
            {PLANS[planTab].map(function(plan) {
              return (
                <div key={plan.name} className="plan-card" style={{ border: plan.badge ? '1px solid rgba(201,168,76,.5)' : '1px solid #1e2530' }}>
                  {plan.badge && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: GG, color: '#060a0e', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>{plan.badge}</div>}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontSize: 44, fontWeight: 900, color: plan.badge ? G : '#e8edf5', lineHeight: 1, marginBottom: 4 }}>{plan.roi}</div>
                  <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 22 }}>Per Trade</div>
                  <div style={{ borderTop: '1px solid #1e2530', paddingTop: 18, marginBottom: 20 }}>
                    {['Principal return', 'Instant Withdrawal', 'Pro Charts', '24/7 Support', 'Account Manager'].map(function(feat) {
                      return (
                        <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8892a0', marginBottom: 9 }}>
                          <span style={{ color: '#2ecc71', fontSize: 12 }}>v</span>
                          {feat}
                        </div>
                      )
                    })}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: '10px', background: '#141920', borderRadius: 9, fontSize: 12 }}>
                      <span style={{ color: '#4a5568' }}>Min: <strong style={{ color: G }}>{plan.min}</strong></span>
                      <span style={{ color: '#4a5568' }}>Max: <strong style={{ color: '#e8edf5' }}>{plan.max}</strong></span>
                    </div>
                  </div>
                  <Link href="/register" style={{ display: 'block' }}>
                    <button style={{ width: '100%', padding: '12px', background: plan.badge ? GG : 'transparent', border: plan.badge ? 'none' : '1px solid rgba(201,168,76,.3)', borderRadius: 11, color: plan.badge ? '#060a0e' : G, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Select Plan</button>
                  </Link>
                </div>
              )
            })}
          </div>
          <div style={{ background: 'linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.02))', border: '1px solid rgba(201,168,76,.2)', borderRadius: 18, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#e8edf5', marginBottom: 5 }}>Need a custom investment plan?</div>
              <div style={{ fontSize: 14, color: '#8892a0' }}>Our team creates tailored solutions for institutional clients and high-net-worth individuals.</div>
            </div>
            <a href="#contact">
              <button style={{ padding: '12px 26px', background: GG, border: 'none', borderRadius: 11, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>Contact Our Team</button>
            </a>
          </div>
        </div>
      </section>

      {/* ── COMPREHENSIVE SERVICES ── */}
      <section className="sec" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Comprehensive Services</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Start Trading with CapitalMarket Pro</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Everything you need for successful trading in one platform</p>
          </div>
          <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, marginBottom: 36 }}>
            {[
              { title: 'Market Analysis', icon: '📊', items: ['Daily Market Analysis Reports', 'Weekly Live Webinars', 'Live Q and A Sessions', 'AI Trading Signal Support', 'Sentiment Analysis Tools'] },
              { title: 'Award-Winning Platform', icon: '🏆', items: ['42+ Industry Awards Won', 'Top 100 FinTech Companies', 'Best Client Funds Security', 'Best Crypto Trading Platform', 'Most Trusted Broker 2024'] },
              { title: 'Investment Options', icon: '💡', items: ['Copy Trading System', 'Become a Follower Investor', 'PAMM Account Ranking', 'Automated Trading Bots', 'Become a Master Trader'] },
            ].map(function(col) {
              return (
                <div key={col.title} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, padding: 26 }}>
                  <div style={{ fontSize: 30, marginBottom: 12 }}>{col.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', marginBottom: 16 }}>{col.title}</div>
                  {col.items.map(function(item) {
                    return (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11, fontSize: 13, color: '#8892a0' }}>
                        <span style={{ color: G, fontSize: 12, flexShrink: 0 }}>•</span>
                        {item}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/register">
              <button style={{ padding: '15px 44px', background: GG, border: 'none', borderRadius: 13, color: '#060a0e', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 28px rgba(201,168,76,.3)' }}>Start Trading Now →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section className="sec" style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.9)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Platform Features</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Advanced Trading Tools</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Everything you need for successful trading in one powerful interface</p>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '⚡', title: 'Reliable Execution', desc: 'CapitalMarket Pro fills your orders in milliseconds without any requotes or price manipulation. Our NY4 servers guarantee sub-millisecond order processing 24/5.' },
                { icon: '🧠', title: 'Intelligent Analysis', desc: 'Make informed decisions with smart AI-powered market analysis, Live Sentiment data, in-platform insights and automated pattern recognition across all major asset classes.' },
                { icon: '📈', title: 'Transparent Reporting', desc: 'Access complete transaction statistics, equity charts, tax reports and detailed history of all investments for a crystal clear understanding of your performance.' },
                { icon: '🖥', title: 'Intuitive Interface', desc: 'Easy to navigate on any device. Built with real traders needs in mind. Trade from browser, Windows app, Android or iOS with identical features and performance.' },
              ].map(function(f) {
                return (
                  <div key={f.title} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 16, transition: 'border-color .3s' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530' }}>
                    <span style={{ fontSize: 26, flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 6 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.7 }}>{f.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Real-Time Market Analysis</div>
              <div className="tv-wrap">
                <iframe src="https://s.tradingview.com/embed-widget/market-overview/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%221D%22%2C%22showChart%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22520%22%2C%22isTransparent%22%3Atrue%2C%22tabs%22%3A%5B%7B%22title%22%3A%22Indices%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FOREXCOM%3ASPXUSD%22%2C%22d%22%3A%22S%26P%20500%22%7D%2C%7B%22s%22%3A%22FOREXCOM%3ANSXUSD%22%2C%22d%22%3A%22NASDAQ%22%7D%2C%7B%22s%22%3A%22FOREXCOM%3ADJI%22%2C%22d%22%3A%22Dow%20Jones%22%7D%5D%7D%2C%7B%22title%22%3A%22Commodities%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22CME_MINI%3AGC1%21%22%2C%22d%22%3A%22Gold%22%7D%2C%7B%22s%22%3A%22NYMEX%3ACL1%21%22%2C%22d%22%3A%22Crude%20Oil%22%7D%5D%7D%5D%7D" width="100%" height="520" frameBorder="0" style={{ display: 'block' }} title="Market Analysis" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GLOBAL TRUST ── */}
      <section className="sec" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Global Trust</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Why We Are One of the World's Most Trusted Platforms</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Experience the reliability and security our global clients have come to trust</p>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Forex Heat Map — Live</div>
              <div className="tv-wrap">
                <iframe src="https://s.tradingview.com/embed-widget/forex-heat-map/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22360%22%2C%22currencies%22%3A%5B%22EUR%22%2C%22USD%22%2C%22JPY%22%2C%22GBP%22%2C%22CHF%22%2C%22AUD%22%2C%22CAD%22%2C%22NZD%22%2C%22CNY%22%5D%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%7D" width="100%" height="360" frameBorder="0" style={{ display: 'block' }} title="Forex Heat Map" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 18 }}>Our Trusted Reputation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '🌐', title: 'Globally Regulated', desc: 'Operating under strict financial regulations to ensure maximum security and transparency for your assets at all times.' },
                  { icon: '🏆', title: '40+ International Awards', desc: 'Recognition for excellence in trading services, platform technology and outstanding customer support globally.' },
                  { icon: '🎧', title: '24/7 Multilingual Support', desc: 'Expert assistance available around the clock in more than 20 languages from dedicated account managers.' },
                  { icon: '🔒', title: 'Segregated Client Funds', desc: 'Your investments are always kept in fully segregated accounts completely separate from company operating funds.' },
                  { icon: '👤', title: 'Personal Account Managers', desc: 'Every premium client receives a dedicated account manager to guide their investment journey personally.' },
                ].map(function(item) {
                  return (
                    <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.65 }}>{item.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Link href="/register" style={{ display: 'inline-block', marginTop: 22 }}>
                <button style={{ padding: '11px 26px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Learn More →</button>
              </Link>
            </div>
          </div>
          <div className="trust-grid" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '🏅', label: 'Best Trading Platform 2024' },
              { icon: '⭐', label: '4.9 / 5 User Rating' },
              { icon: '✅', label: 'ISO 27001 Certified' },
              { icon: '🔐', label: 'PCI DSS Compliant' },
              { icon: '🌟', label: 'Forbes Recognized' },
            ].map(function(badge) {
              return (
                <div key={badge.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0d1117', border: '1px solid #1e2530', borderRadius: 100, padding: '10px 18px', fontSize: 12, color: '#8892a0', fontWeight: 500 }}>
                  <span style={{ fontSize: 16 }}>{badge.icon}</span>
                  {badge.label}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="sec" style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.9)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Simple Process</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>How It Works</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Get started with trading in three simple steps — takes less than 5 minutes</p>
          </div>
          <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
            {[
              { n: '1', icon: '💰', title: 'Deposit', desc: 'Create your free account and add funds. We accept Bitcoin, Ethereum, USDT, BNB and 20+ payment methods. Minimum deposit from just $50. Credited within 30 minutes.', btn: 'Get Started' },
              { n: '2', icon: '📊', title: 'Trade or Invest', desc: 'Choose any of 200+ assets and stocks or select one of our managed investment plans. Use AI signals, technical analysis or simply copy top traders for the best results.', btn: 'Explore Markets' },
              { n: '3', icon: '🏦', title: 'Withdraw Profits', desc: 'Withdraw your profits easily and securely to your crypto wallet anytime. Withdrawals are processed within 24 hours. No hidden fees, no surprises, ever.', btn: 'Start Earning' },
            ].map(function(step) {
              return (
                <div key={step.n} style={{ textAlign: 'center' }}>
                  <div style={{ width: 68, height: 68, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(201,168,76,.3)' }}>
                    <span style={{ fontSize: 26 }}>{step.icon}</span>
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0d1117', border: '2px solid ' + G, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '-13px auto 14px', fontSize: 11, fontWeight: 800, color: G }}>{step.n}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5', marginBottom: 10 }}>{step.title}</div>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.75, marginBottom: 20, maxWidth: 280, margin: '0 auto 20px' }}>{step.desc}</div>
                  <Link href="/register">
                    <button style={{ padding: '10px 22px', background: 'transparent', border: '1px solid rgba(201,168,76,.4)', borderRadius: 10, color: G, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{step.btn}</button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="sec" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Success Stories</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Client Testimonials</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Hear from our satisfied investors who have achieved impressive results</p>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
            {TESTIMONIALS.map(function(t) {
              return (
                <div key={t.name} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, padding: 22, transition: 'border-color .3s' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530' }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                    {[1,2,3,4,5].map(function(s) { return <span key={s} style={{ color: G, fontSize: 14 }}>★</span> })}
                  </div>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8, marginBottom: 18, fontStyle: 'italic' }}>"{t.text}"</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#060a0e' }}>{t.initials}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#4a5568' }}>{t.role}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: 10, color: '#2ecc71', fontWeight: 600 }}>Verified</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="sec" style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.9)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12 }}>Get In Touch</div>
            <h2 className="h2" style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Contact Us</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Our dedicated support team is available 24/7 to assist you with any questions</p>
          </div>
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 36 }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
                {[
                  { icon: '🏢', title: 'Head Office — United States', lines: ['350 Fifth Avenue, Suite 4200', 'New York, NY 10118, USA', '+1 (212) 555-0182'] },
                  { icon: '🏢', title: 'Branch Office — Canada', lines: ['100 King Street West, Suite 5600', 'Toronto, ON M5X 1C9, Canada', '+1 (416) 555-0247'] },
                  { icon: '🏢', title: 'Branch Office — Germany', lines: ['Bockenheimer Landstrasse 51-53', '60325 Frankfurt am Main', '+49 69 5050 60199'] },
                  { icon: '✉️', title: 'Email', lines: ['support@capitalmarket-pro.com', 'compliance@capitalmarket-pro.com'] },
                  { icon: '🕐', title: 'Business Hours', lines: ['Monday - Friday: 8:00 AM - 11:00 PM EST', 'Saturday - Sunday: 10:00 AM - 6:00 PM EST'] },
                ].map(function(info) {
                  return (
                    <div key={info.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{info.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>{info.title}</div>
                        {info.lines.map(function(line) {
                          return <div key={line} style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.65 }}>{line}</div>
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 12 }}>Follow Us</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[{ icon: '𝕏', color: '#1DA1F2' }, { icon: 'in', color: '#0077B5' }, { icon: '▶', color: '#FF0000' }, { icon: 'f', color: '#1877F2' }, { icon: '📷', color: '#E1306C' }].map(function(s, i) {
                    return (
                      <div key={i} style={{ width: 42, height: 42, borderRadius: 11, background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: s.color, cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = s.color + '60' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530' }}>{s.icon}</div>
                    )
                  })}
                </div>
              </div>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #1e2530' }}>
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2146293240444!2d-73.98702468459418!3d40.748440579327885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9aeb1c6b5%3A0x35b1cfbc89a6097f!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" width="100%" height="200" style={{ border: 0, display: 'block', filter: 'invert(90%) hue-rotate(180deg)' }} allowFullScreen loading="lazy" title="CapitalMarket Pro New York Office" />
              </div>
            </div>

            <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 22, padding: 32 }}>
              {contactSent ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: 52, marginBottom: 18 }}>✅</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#e8edf5', marginBottom: 10 }}>Message Sent!</div>
                  <div style={{ fontSize: 15, color: '#8892a0', lineHeight: 1.7 }}>Thank you for contacting us. Our support team will respond within 2-4 business hours.</div>
                  <button onClick={function() { setContactSent(false); setContactForm({ name: '', email: '', phone: '', subject: '', message: '' }) }} style={{ marginTop: 22, padding: '12px 26px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Send Another Message</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5', marginBottom: 5 }}>Send Us a Message</div>
                  <div style={{ fontSize: 14, color: '#4a5568', marginBottom: 26 }}>Fill out the form below and we will respond within 24 hours</div>
                  <form onSubmit={handleContact}>
                    <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.07em' }}>Full Name</label>
                        <input className="inp" value={contactForm.name} onChange={function(e) { setContactForm(Object.assign({}, contactForm, { name: e.target.value })) }} placeholder="John Smith" required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.07em' }}>Email Address</label>
                        <input className="inp" type="email" value={contactForm.email} onChange={function(e) { setContactForm(Object.assign({}, contactForm, { email: e.target.value })) }} placeholder="you@example.com" required />
                      </div>
                    </div>
                    <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.07em' }}>Phone Number</label>
                        <input className="inp" type="tel" value={contactForm.phone} onChange={function(e) { setContactForm(Object.assign({}, contactForm, { phone: e.target.value })) }} placeholder="+1 (555) 000-0000" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.07em' }}>Subject</label>
                        <select className="inp" value={contactForm.subject} onChange={function(e) { setContactForm(Object.assign({}, contactForm, { subject: e.target.value })) }} required>
                          <option value="">Select a topic</option>
                          <option value="account">Account Issue</option>
                          <option value="deposit">Deposit / Withdrawal</option>
                          <option value="investment">Investment Plans</option>
                          <option value="kyc">KYC Verification</option>
                          <option value="technical">Technical Support</option>
                          <option value="partnership">Partnership Inquiry</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 22 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.07em' }}>Message</label>
                      <textarea className="inp" rows={5} value={contactForm.message} onChange={function(e) { setContactForm(Object.assign({}, contactForm, { message: e.target.value })) }} placeholder="Describe your question or issue in detail. The more information you provide, the faster we can assist you..." required style={{ resize: 'vertical', minHeight: 110 }} />
                    </div>
                    <button type="submit" disabled={contactLoading} style={{ width: '100%', padding: '14px', background: contactLoading ? '#141920' : GG, border: 'none', borderRadius: 12, color: contactLoading ? '#4a5568' : '#060a0e', fontSize: 15, fontWeight: 800, cursor: contactLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: contactLoading ? 'none' : '0 6px 20px rgba(201,168,76,.25)', marginBottom: 14 }}>
                      {contactLoading ? (
                        <>
                          <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,.2)', borderTopColor: G, borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                          Sending...
                        </>
                      ) : 'Send Message →'}
                    </button>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#2ecc71' }}>●</span> Response within 2-4 hours</span>
                      <span style={{ fontSize: 11, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 5 }}>🔒 Your data is secure</span>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="sec" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div className="cta-inner" style={{ textAlign: 'center', background: 'linear-gradient(135deg,#0d1117,#141920)', border: '1px solid rgba(201,168,76,.25)', borderRadius: 28, padding: '72px 48px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(46,204,113,.08)', border: '1px solid rgba(46,204,113,.2)', borderRadius: 100, padding: '6px 16px', fontSize: 12, color: '#2ecc71', marginBottom: 22, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Live Now — Markets Are Open
              </div>
              <h2 className="h2" style={{ fontSize: 42, fontWeight: 900, color: '#e8edf5', marginBottom: 16, letterSpacing: '-1px' }}>Start Trading With CapitalMarket Pro Today</h2>
              <p style={{ fontSize: 16, color: '#8892a0', marginBottom: 36, lineHeight: 1.8, maxWidth: 540, margin: '0 auto 36px' }}>Join 180,000+ investors from 142 countries already growing their wealth. Create your free account in under 2 minutes.</p>
              <div className="hero-btns" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 26 }}>
                <Link href="/register">
                  <button style={{ padding: '17px 48px', background: GG, border: 'none', borderRadius: 14, color: '#060a0e', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 32px rgba(201,168,76,.35)' }}>Create Free Account →</button>
                </Link>
                <a href="#plans">
                  <button style={{ padding: '17px 36px', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, color: '#8892a0', fontSize: 17, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>View Plans</button>
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                {['No credit card required', 'Free to join', 'Withdraw anytime', '24/7 Support'].map(function(item) {
                  return <span key={item} style={{ fontSize: 13, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#2ecc71' }}>v</span>{item}</span>
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0a0d12', borderTop: '1px solid #1e2530', padding: '56px 24px 0' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 36, marginBottom: 44 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <CMLogo size={34} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#e8edf5' }}>CapitalMarket <span style={{ color: G }}>Pro</span></div>
                  <div style={{ fontSize: 9, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '.1em' }}>Global Trading Platform</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.75, marginBottom: 16 }}>CapitalMarket Pro offers professional trading on Cryptocurrencies, Forex, Stocks, Indices, Real Estate and Commodities with competitive spreads and AI-powered tools.</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {['𝕏', 'in', 'f', '▶'].map(function(icon) {
                  return <div key={icon} style={{ width: 32, height: 32, borderRadius: 9, background: '#141920', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#4a5568', cursor: 'pointer' }}>{icon}</div>
                })}
              </div>
              <div style={{ background: '#141920', border: '1px solid #1e2530', borderRadius: 11, padding: '12px', fontSize: 11, color: '#2a3140', lineHeight: 1.7 }}>
                RISK WARNING: Trading financial products carries a high level of risk. You should never invest money that you cannot afford to lose.
              </div>
            </div>
            {[
              { title: 'Quick Links', links: [['About Us', '#about'], ['Why Choose Us', '#why'], ['Education', '#education'], ['Contact', '#contact'], ['FAQ', '#faq']] },
              { title: 'Trading', links: [['Cryptocurrencies', '/dashboard'], ['Forex', '/dashboard'], ['Shares', '/dashboard'], ['Indices', '/dashboard'], ['Commodities', '/dashboard']] },
              { title: 'Platform', links: [['Trade Now', '/dashboard'], ['Copy Trading', '/dashboard'], ['Investment Plans', '#plans'], ['Affiliate Program', '/dashboard'], ['Demo Account', '/register']] },
              { title: 'Your Account', links: [['Log In', '/login'], ['Create Account', '/register'], ['KYC Verification', '/dashboard'], ['Deposit', '/dashboard'], ['Withdraw', '/dashboard']] },
            ].map(function(col) {
              return (
                <div key={col.title}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #1e2530' }}>{col.title}</div>
                  {col.links.map(function(item) {
                    return <Link key={item[0]} href={item[1]} style={{ display: 'block', fontSize: 13, color: '#4a5568', marginBottom: 10 }}>{item[0]}</Link>
                  })}
                </div>
              )
            })}
          </div>

          <div style={{ borderTop: '1px solid #1e2530', padding: '22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Available On</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[['🌐', 'Web'], ['🖥', 'Windows'], ['🤖', 'Android'], ['🍎', 'iOS']].map(function(p) {
                  return <div key={p[1]} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#141920', border: '1px solid #1e2530', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#8892a0', cursor: 'pointer' }}><span>{p[0]}</span><span>{p[1]}</span></div>
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <Link href="/terms" style={{ fontSize: 12, color: '#4a5568' }}>Terms and Conditions</Link>
              <Link href="/terms" style={{ fontSize: 12, color: '#4a5568' }}>Privacy Policy</Link>
              <Link href="/" style={{ fontSize: 12, color: '#4a5568' }}>Legal Documents</Link>
              <Link href="/" style={{ fontSize: 12, color: '#4a5568' }}>Cookie Policy</Link>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e2530', padding: '18px 0 24px', textAlign: 'center', fontSize: 12, color: '#2a3140' }}>
            2025 CapitalMarket Pro Financial Services LLC. All Rights Reserved. | Licensed and Regulated Investment Platform | Incorporated in Delaware, USA
          </div>
        </div>
      </footer>

    </div>
  )
}
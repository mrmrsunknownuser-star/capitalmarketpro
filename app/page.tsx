// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

var PLANS = {
  stock: [
    { name: 'Stock Starter', roi: '1.5%', min: '$100', max: '$500', badge: '' },
    { name: 'Stock Growth', roi: '2.5%', min: '$500', max: '$2,000', badge: 'POPULAR' },
    { name: 'Stock Premium', roi: '4.0%', min: '$2,000', max: '$10,000', badge: '' },
    { name: 'Stock Elite', roi: '6.0%', min: '$10,000', max: '$50,000', badge: '' },
  ],
  crypto: [
    { name: 'Crypto Starter', roi: '2.0%', min: '$50', max: '$300', badge: '' },
    { name: 'Crypto Growth', roi: '3.5%', min: '$300', max: '$1,500', badge: 'POPULAR' },
    { name: 'Crypto Premium', roi: '5.5%', min: '$1,500', max: '$7,500', badge: '' },
    { name: 'Crypto Elite', roi: '8.0%', min: '$7,500', max: '$30,000', badge: '' },
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
  { name: 'Michael O.', role: 'Verified Trader', text: 'Since I started using CapitalMarket Pro, I have been earning like never before. The signals and strategies are the best I have seen.', img: 'MO' },
  { name: 'Christy A.', role: 'Elite Investor', text: 'I already made more than $200,000 within a month investing here. The returns are consistent and withdrawals are always on time.', img: 'CA' },
  { name: 'James T.', role: 'Professional Trader', text: 'I was able to earn an additional $30,000 to my profit. It is amazing, the team is the best, keep it up.', img: 'JT' },
  { name: 'Sarah K.', role: 'Premium Member', text: 'This was a very easy process and I received my funds quickly as I needed them. Highly recommend CapitalMarket Pro.', img: 'SK' },
  { name: 'Aisha M.', role: 'Active Trader', text: 'I rate CapitalMarket Pro five stars. You register online, upload your ID, deposit and withdraw after trades. Very lovely.', img: 'AM' },
  { name: 'David R.', role: 'Long-term Client', text: 'I have invested here several times, always paid back on time. The entire process completes in just a few days. Very impressed.', img: 'DR' },
]

export default function LandingPage() {
  var [planTab, setPlanTab] = useState('crypto')
  var [tradingOpen, setTradingOpen] = useState(false)
  var [systemOpen, setSystemOpen] = useState(false)
  var [companyOpen, setCompanyOpen] = useState(false)
  var [mobileOpen, setMobileOpen] = useState(false)
  var [tickerPos, setTickerPos] = useState(0)

  var TICKER = [
    { sym: 'BTC/USD', price: '$94,820', chg: '+4.07%' },
    { sym: 'ETH/USD', price: '$3,240', chg: '+1.87%' },
    { sym: 'TSLA', price: '$248.50', chg: '+3.42%' },
    { sym: 'AAPL', price: '$189.30', chg: '+1.21%' },
    { sym: 'GOLD', price: '$2,318', chg: '+0.64%' },
    { sym: 'NVDA', price: '$875.20', chg: '+4.11%' },
    { sym: 'EUR/USD', price: '1.0842', chg: '+0.12%' },
    { sym: 'GBP/USD', price: '1.2634', chg: '+0.08%' },
    { sym: 'OIL', price: '$82.40', chg: '-0.31%' },
    { sym: 'SPX', price: '$5,234', chg: '+0.92%' },
    { sym: 'XRP/USD', price: '$0.612', chg: '+2.44%' },
    { sym: 'BNB/USD', price: '$412.30', chg: '+1.33%' },
  ]

  useEffect(function() {
    var t = setInterval(function() {
      setTickerPos(function(p) { return p <= -2000 ? 0 : p - 0.8 })
    }, 16)
    return function() { clearInterval(t) }
  }, [])

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'
  var BG = '#060a0e'

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#e8edf5', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{'@import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap); * { box-sizing: border-box; margin: 0; padding: 0; } body { background: #060a0e; overflow-x: hidden; } a { text-decoration: none; } @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } } @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } } @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } } .nav-a { color: #8892a0; font-size: 14px; font-weight: 500; cursor: pointer; transition: color .2s; padding: 4px 0; } .nav-a:hover { color: #C9A84C; } .dd { position: absolute; top: calc(100% + 8px); left: 0; background: #0d1117; border: 1px solid #1e2530; border-radius: 12px; padding: 8px; min-width: 200px; z-index: 999; box-shadow: 0 16px 48px rgba(0,0,0,0.5); } .dd a { display: block; padding: 10px 14px; color: #8892a0; font-size: 13px; border-radius: 8px; transition: all .15s; } .dd a:hover { background: rgba(201,168,76,0.08); color: #C9A84C; } .plan-card { background: #0d1117; border: 1px solid #1e2530; border-radius: 20px; padding: 28px 24px; transition: all .3s; position: relative; } .plan-card:hover { transform: translateY(-5px); border-color: rgba(201,168,76,0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.4); } .step-num { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg,#C9A84C,#E8D08C); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #060a0e; margin: 0 auto 20px; } .feat-card { background: #0d1117; border: 1px solid #1e2530; border-radius: 16px; padding: 28px; transition: all .3s; } .feat-card:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-3px); } .tab-btn { padding: 10px 22px; border-radius: 10px; border: 1px solid #1e2530; cursor: pointer; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; transition: all .2s; background: transparent; color: #8892a0; } .tab-btn.active { background: linear-gradient(135deg,#C9A84C,#E8D08C); color: #060a0e; border-color: transparent; } .tcard { background: #0d1117; border: 1px solid #1e2530; border-radius: 16px; padding: 24px; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 3px; }'}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(6,10,14,0.96)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0 }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: '#060a0e', letterSpacing: '-0.5px', lineHeight: 1.1 }}>CMP</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#e8edf5', letterSpacing: '-0.3px', lineHeight: 1 }}>CapitalMarket <span style={{ color: G }}>Pro</span></div>
              <div style={{ fontSize: 9, color: '#4a5568', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Global Trading Platform</div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {/* Trading dropdown */}
            <div style={{ position: 'relative' }} onMouseEnter={function() { setTradingOpen(true) }} onMouseLeave={function() { setTradingOpen(false) }}>
              <div className="nav-a" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Trading <span style={{ fontSize: 10 }}>▾</span></div>
              {tradingOpen && (
                <div className="dd">
                  {[['Cryptocurrencies', '/dashboard'], ['Forex', '/dashboard'], ['Shares', '/dashboard'], ['Indices', '/dashboard'], ['ETFs', '/dashboard']].map(function(item) {
                    return <Link key={item[0]} href={item[1]}>{item[0]}</Link>
                  })}
                </div>
              )}
            </div>

            {/* System dropdown */}
            <div style={{ position: 'relative' }} onMouseEnter={function() { setSystemOpen(true) }} onMouseLeave={function() { setSystemOpen(false) }}>
              <div className="nav-a" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>System <span style={{ fontSize: 10 }}>▾</span></div>
              {systemOpen && (
                <div className="dd">
                  {[['Trade', '/dashboard'], ['Copy Trading', '/dashboard'], ['Automated Trading', '/dashboard']].map(function(item) {
                    return <Link key={item[0]} href={item[1]}>{item[0]}</Link>
                  })}
                </div>
              )}
            </div>

            {/* Company dropdown */}
            <div style={{ position: 'relative' }} onMouseEnter={function() { setCompanyOpen(true) }} onMouseLeave={function() { setCompanyOpen(false) }}>
              <div className="nav-a" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Company <span style={{ fontSize: 10 }}>▾</span></div>
              {companyOpen && (
                <div className="dd">
                  {[['About Us', '/'], ['Why Us', '/'], ['FAQ', '/'], ['Legal & Regulation', '/terms']].map(function(item) {
                    return <Link key={item[0]} href={item[1]}>{item[0]}</Link>
                  })}
                </div>
              )}
            </div>

            <Link href="/" className="nav-a">Education</Link>
            <Link href="/" className="nav-a">Contact</Link>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/login">
              <button style={{ padding: '9px 22px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 10, color: '#8892a0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s' }}>Log in</button>
            </Link>
            <Link href="/register">
              <button style={{ padding: '9px 22px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}>Sign up</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── LIVE TICKER ── */}
      <div style={{ position: 'fixed', top: 70, left: 0, right: 0, zIndex: 999, background: '#0a0d13', borderBottom: '1px solid #1e2530', height: 38, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, transform: 'translateX(' + tickerPos + 'px)', whiteSpace: 'nowrap' }}>
          {[...TICKER, ...TICKER, ...TICKER].map(function(t, i) {
            return (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 28px', borderRight: '1px solid #1e2530', height: 38 }}>
                <span style={{ fontSize: 11, color: '#8892a0', fontWeight: 600 }}>{t.sym}</span>
                <span style={{ fontSize: 12, color: '#e8edf5', fontWeight: 700 }}>{t.price}</span>
                <span style={{ fontSize: 11, color: t.chg.startsWith('-') ? '#e74c3c' : '#2ecc71', fontWeight: 600 }}>{t.chg}</span>
              </div>
            )
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(90deg, #0a0d13, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(270deg, #0a0d13, transparent)', pointerEvents: 'none' }} />
      </div>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 140, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', top: '50%', left: '30%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div style={{ animation: 'fadeUp .6s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 100, padding: '6px 16px', fontSize: 12, color: '#2ecc71', marginBottom: 28, fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Innovative Trading Platform
            </div>
            <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-1.5px' }}>
              <span style={{ color: '#e8edf5' }}>Global Trading</span><br />
              <span style={{ background: GG, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Made Simple</span>
            </h1>
            <p style={{ fontSize: 17, color: '#8892a0', lineHeight: 1.8, marginBottom: 36, maxWidth: 500 }}>
              Access advanced trading tools for Forex, Cryptocurrencies, Commodities, Indices and more with competitive spreads and lightning-fast execution.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/register">
                <button style={{ padding: '15px 36px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 28px rgba(201,168,76,0.35)' }}>Create Account</button>
              </Link>
              <Link href="/login">
                <button style={{ padding: '15px 36px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 12, color: '#8892a0', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Login</button>
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
              {[['$4.2B+', 'Assets Under Management'], ['180K+', 'Active Investors'], ['142+', 'Countries'], ['99.9%', 'Platform Uptime']].map(function(s) {
                return (
                  <div key={s[1]}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: G }}>{s[0]}</div>
                    <div style={{ fontSize: 11, color: '#4a5568', marginTop: 3 }}>{s[1]}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hero chart card */}
          <div style={{ animation: 'fadeUp .8s ease' }}>
            <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 24, padding: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 11, color: '#2ecc71', fontWeight: 700 }}>LIVE</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5' }}>BTC/USD</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: G, marginTop: 4 }}>$94,820.00</div>
                  <div style={{ fontSize: 13, color: '#2ecc71', fontWeight: 600, marginTop: 2 }}>+4.07% today</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['1D', '1W', '1M', '1Y'].map(function(t) {
                    return <button key={t} style={{ padding: '5px 10px', background: t === '1D' ? 'rgba(201,168,76,0.15)' : 'transparent', border: '1px solid ' + (t === '1D' ? 'rgba(201,168,76,0.4)' : '#1e2530'), borderRadius: 8, color: t === '1D' ? G : '#4a5568', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{t}</button>
                  })}
                </div>
              </div>

              {/* Fake chart */}
              <svg width="100%" height="120" viewBox="0 0 400 120" style={{ marginBottom: 20 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,90 L40,75 L80,85 L120,60 L160,70 L200,45 L240,55 L280,30 L320,40 L360,20 L400,10 L400,120 L0,120 Z" fill="url(#chartGrad)" />
                <path d="M0,90 L40,75 L80,85 L120,60 L160,70 L200,45 L240,55 L280,30 L320,40 L360,20 L400,10" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
              </svg>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'ETH/USD', val: '$3,240', chg: '+1.87%' },
                  { label: 'TSLA', val: '$248.50', chg: '+3.42%' },
                  { label: 'GOLD', val: '$2,318', chg: '+0.64%' },
                ].map(function(item) {
                  return (
                    <div key={item.label} style={{ background: '#141920', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>{item.val}</div>
                      <div style={{ fontSize: 11, color: '#2ecc71', fontWeight: 600 }}>{item.chg}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY TRADE WITH US ── */}
      <section style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.8)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Why Choose Us</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Why Trade With Us</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Everything you need for successful trading</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginTop: 48 }}>
            {[
              { icon: '📊', title: 'Trading Tools', desc: 'Plan your trades with our wide range of free professional trading tools and real-time market data.' },
              { icon: '🌍', title: 'Trading Products', desc: 'Diverse opportunities to optimize your portfolio across Crypto, Stocks, Forex, Indices and more.' },
              { icon: '⚡', title: 'Trading Platforms', desc: 'Powerful platforms that suit all trading styles and needs on any device, anywhere in the world.' },
              { icon: '💳', title: 'Funding Methods', desc: 'Multiple quick, easy and secure methods to fund your account including BTC, ETH, USDT and more.' },
            ].map(function(f) {
              return (
                <div key={f.title} className="feat-card">
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', marginBottom: 10 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.7 }}>{f.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TRADING PRODUCTS ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Markets</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Diverse Trading Products</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Access global markets with competitive conditions</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: '💱', title: 'Forex', desc: 'Trade 70+ major, minor and exotic currency pairs with competitive spreads and conditions', color: '#3498db' },
              { icon: '📈', title: 'Shares', desc: 'Access hundreds of public companies from the US, UK, Germany and more global markets', color: '#2ecc71' },
              { icon: '⛽', title: 'Energies', desc: 'Discover opportunities on UK and US Crude Oil as well as Natural Gas with tight spreads', color: '#e67e22' },
              { icon: '📉', title: 'Indices', desc: 'Trade major and minor Index CFDs from around the globe with competitive conditions', color: '#9b59b6' },
            ].map(function(p) {
              return (
                <div key={p.title} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, padding: 28, transition: 'all .3s', cursor: 'pointer' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.transform = 'translateY(-5px)' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: p.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{p.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#e8edf5', marginBottom: 10 }}>{p.title}</div>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.7, marginBottom: 18 }}>{p.desc}</div>
                  <Link href="/register" style={{ fontSize: 13, color: G, fontWeight: 600 }}>Explore {p.title} →</Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── INVESTMENT PLANS ── */}
      <section style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.8)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Trading Plans</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Investment Opportunities</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Choose the perfect plan that suits your investment strategy</p>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
            {[['crypto', 'Crypto'], ['stock', 'Stocks'], ['realestate', 'Real Estate'], ['forex', 'Forex']].map(function(t) {
              return <button key={t[0]} className={'tab-btn' + (planTab === t[0] ? ' active' : '')} onClick={function() { setPlanTab(t[0]) }}>{t[1]}</button>
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {PLANS[planTab].map(function(plan, i) {
              return (
                <div key={plan.name} className="plan-card" style={{ border: plan.badge ? '1px solid rgba(201,168,76,0.5)' : '1px solid #1e2530' }}>
                  {plan.badge && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: GG, color: '#060a0e', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>{plan.badge}</div>}
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#8892a0', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontSize: 44, fontWeight: 900, color: G, lineHeight: 1, marginBottom: 4 }}>{plan.roi}</div>
                  <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 24 }}>Per Trade / Monthly</div>
                  <div style={{ borderTop: '1px solid #1e2530', paddingTop: 20, marginBottom: 24 }}>
                    {[['Principal return on maturity', true], ['Instant Withdrawal', true], ['Professional Charts', true], ['24/7 Support', true]].map(function(item) {
                      return (
                        <div key={item[0]} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8892a0', marginBottom: 10 }}>
                          <span style={{ color: '#2ecc71', fontSize: 14 }}>v</span>
                          {item[0]}
                        </div>
                      )
                    })}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 13 }}>
                      <span style={{ color: '#4a5568' }}>Min: <strong style={{ color: '#e8edf5' }}>{plan.min}</strong></span>
                      <span style={{ color: '#4a5568' }}>Max: <strong style={{ color: '#e8edf5' }}>{plan.max}</strong></span>
                    </div>
                  </div>
                  <Link href="/register" style={{ display: 'block' }}>
                    <button style={{ width: '100%', padding: '12px', background: plan.badge ? GG : 'transparent', border: plan.badge ? 'none' : '1px solid #1e2530', borderRadius: 12, color: plan.badge ? '#060a0e' : '#8892a0', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Select Plan</button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── COPY TRADING ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Social Trading</div>
              <h2 style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 20 }}>Copy Professional Traders</h2>
              <p style={{ fontSize: 16, color: '#8892a0', lineHeight: 1.8, marginBottom: 36 }}>Let experienced traders do the work for you with our advanced copy trading system. Access hundreds of strategies across multiple asset classes.</p>
              {[
                { title: 'Copy 400+ Strategies', desc: 'Access hundreds of strategies for more than 1000 instruments across 7 asset classes.' },
                { title: 'Select Top Performers', desc: 'Use our reporting tools to rank strategies by performance and select the most suitable for you.' },
                { title: 'Stay Protected', desc: 'The system uses sophisticated calculations to keep your exposure at an optimal level.' },
                { title: 'Combine Methods', desc: 'Combine copying with manual and automated trading depending on your preferences.' },
              ].map(function(item) {
                return (
                  <div key={item.title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 12, color: G }}>v</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5', marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: '#8892a0', lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 24, padding: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 20 }}>Top Copy Traders</div>
              {[
                { name: 'AlgoMaster_X', roi: '+142%', followers: '2,840', risk: 'Low' },
                { name: 'CryptoWolf', roi: '+98%', followers: '1,920', risk: 'Medium' },
                { name: 'ForexPro_AI', roi: '+76%', followers: '3,100', risk: 'Low' },
                { name: 'GoldTrader', roi: '+54%', followers: '890', risk: 'Low' },
              ].map(function(trader) {
                return (
                  <div key={trader.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1e2530' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#060a0e' }}>{trader.name[0]}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>{trader.name}</div>
                        <div style={{ fontSize: 11, color: '#4a5568' }}>{trader.followers} followers</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#2ecc71' }}>{trader.roi}</div>
                      <div style={{ fontSize: 10, color: '#4a5568' }}>Risk: {trader.risk}</div>
                    </div>
                  </div>
                )
              })}
              <Link href="/register" style={{ display: 'block', marginTop: 20 }}>
                <button style={{ width: '100%', padding: '13px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Start Copy Trading</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.8)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Simple Process</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>How It Works</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Get started with trading in three simple steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { n: '1', title: 'Deposit', desc: 'Open your account and add funds. We work with BTC, ETH, USDT and more payment methods for your convenience.', btn: 'Get Started' },
              { n: '2', title: 'Trade', desc: 'Trade any of 200+ assets and stocks. Use technical analysis and AI-powered signals for better results.', btn: 'Explore Markets' },
              { n: '3', title: 'Withdraw', desc: 'Get your funds easily to your crypto wallet with our fast and secure withdrawal process within 24 hours.', btn: 'Learn More' },
            ].map(function(step) {
              return (
                <div key={step.n} style={{ textAlign: 'center' }}>
                  <div className="step-num">{step.n}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>{step.title}</div>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.7, marginBottom: 24 }}>{step.desc}</div>
                  <Link href="/register">
                    <button style={{ padding: '10px 24px', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 10, color: G, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{step.btn}</button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TRUSTED ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Global Trust</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Why We Are One Of The World's Most Trusted Platforms</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { icon: '🌐', title: 'Globally Regulated', desc: 'Operating under strict financial regulations to ensure maximum security for your assets' },
              { icon: '🏆', title: '40+ International Awards', desc: 'Recognition for excellence in trading services, platform technology and customer support' },
              { icon: '🎧', title: '24/7 Multilingual Support', desc: 'Expert assistance available around the clock in multiple languages' },
              { icon: '🔒', title: 'Segregated Client Funds', desc: 'Your investments are kept in separate accounts for maximum security and protection' },
              { icon: '👤', title: 'Personal Account Managers', desc: 'Dedicated professionals to guide your trading journey every step of the way' },
            ].map(function(item) {
              return (
                <div key={item.title} className="feat-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', marginBottom: 8 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: '#8892a0', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.8)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Success Stories</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Client Testimonials</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Hear from our satisfied clients who have achieved impressive results</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map(function(t) {
              return (
                <div key={t.name} className="tcard">
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                    {[1,2,3,4,5].map(function(s) { return <span key={s} style={{ color: G, fontSize: 16 }}>★</span> })}
                  </div>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0e' }}>{t.img}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#4a5568' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', background: '#0d1117', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 28, padding: '68px 48px', boxShadow: '0 0 100px rgba(201,168,76,0.07)' }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, color: '#e8edf5', marginBottom: 18, letterSpacing: '-1px' }}>Start Trading With CapitalMarket Pro</h2>
          <p style={{ fontSize: 16, color: '#8892a0', marginBottom: 36, lineHeight: 1.8 }}>Everything you need for successful trading in one powerful platform. Join 180,000+ investors already growing their wealth.</p>
          <Link href="/register">
            <button style={{ padding: '18px 52px', background: GG, border: 'none', borderRadius: 14, color: '#060a0e', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 32px rgba(201,168,76,0.35)', marginBottom: 20 }}>
              Start Trading Now
            </button>
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#4a5568' }}>No credit card required</span>
            <span style={{ fontSize: 13, color: '#4a5568' }}>Free to join</span>
            <span style={{ fontSize: 13, color: '#4a5568' }}>Withdraw anytime</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #1e2530', padding: '60px 24px 32px', background: '#0a0d13' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: '#060a0e', letterSpacing: '-0.5px' }}>CMP</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#e8edf5' }}>CapitalMarket <span style={{ color: G }}>Pro</span></div>
                  <div style={{ fontSize: 9, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Global Trading Platform</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.7, marginBottom: 20 }}>CapitalMarket Pro offers trading on stocks, forex, indices, commodities and cryptocurrencies with competitive spreads and advanced tools.</p>
              <div style={{ fontSize: 11, color: '#2a3140', lineHeight: 1.7, padding: '14px', background: '#0d1117', borderRadius: 10, border: '1px solid #1e2530' }}>
                RISK WARNING: Trading CFDs carries a high level of risk since leverage can work both to your advantage and disadvantage. CFDs may not be suitable for all investors. You should never invest money that you cannot afford to lose.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 18 }}>Quick Links</div>
              {['About Us', 'Why Choose Us', 'Education', 'Contact', 'FAQ'].map(function(item) {
                return <div key={item} style={{ fontSize: 13, color: '#4a5568', marginBottom: 10, cursor: 'pointer', transition: 'color .2s' }}>{item}</div>
              })}
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 18 }}>Trading</div>
              {['Cryptocurrencies', 'Forex', 'Shares', 'Indices', 'Commodities'].map(function(item) {
                return <div key={item} style={{ fontSize: 13, color: '#4a5568', marginBottom: 10, cursor: 'pointer' }}>{item}</div>
              })}
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 18 }}>Your Account</div>
              {[['Log In', '/login'], ['Create Account', '/register'], ['Demo Account', '/register'], ['Help Center', '/']].map(function(item) {
                return <Link key={item[0]} href={item[1]} style={{ display: 'block', fontSize: 13, color: '#4a5568', marginBottom: 10 }}>{item[0]}</Link>
              })}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Available On</div>
                {['Web', 'Windows', 'Android', 'iOS'].map(function(p) {
                  return <div key={p} style={{ fontSize: 12, color: '#4a5568', marginBottom: 6 }}>{p}</div>
                })}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e2530', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: 12, color: '#2a3140' }}>2025 CapitalMarket Pro Financial Services. All Rights Reserved.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/terms" style={{ fontSize: 12, color: '#4a5568' }}>Terms and Conditions</Link>
              <Link href="/terms" style={{ fontSize: 12, color: '#4a5568' }}>Privacy Policy</Link>
              <Link href="/" style={{ fontSize: 12, color: '#4a5568' }}>Legal Documents</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
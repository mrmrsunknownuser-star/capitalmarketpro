// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

var ASSETS = [
  { sym: 'TSLA', name: 'Tesla', price: '$248.50', chg: '+3.42%', color: '#CC0000' },
  { sym: 'AAPL', name: 'Apple', price: '$189.30', chg: '+1.21%', color: '#555' },
  { sym: 'BTC', name: 'Bitcoin', price: '$94,820', chg: '+2.14%', color: '#F7931A' },
  { sym: 'ETH', name: 'Ethereum', price: '$3,240', chg: '+1.87%', color: '#627EEA' },
  { sym: 'GOLD', name: 'Gold', price: '$2,318', chg: '+0.64%', color: '#C9A84C' },
  { sym: 'NVDA', name: 'Nvidia', price: '$875.20', chg: '+4.11%', color: '#76B900' },
  { sym: 'SPX', name: 'S&P 500', price: '$5,234', chg: '+0.92%', color: '#3498db' },
  { sym: 'OIL', name: 'Crude Oil', price: '$82.40', chg: '-0.31%', color: '#8B4513' },
]

var PLANS = [
  { name: 'Starter', min: '$50', max: '$999', roi: '1.5%', period: 'monthly', assets: 'Crypto', color: '#3498db' },
  { name: 'Growth', min: '$1,000', max: '$4,999', roi: '3.5%', period: 'monthly', assets: 'Crypto + Stocks', color: '#C9A84C' },
  { name: 'Elite', min: '$5,000', max: '$24,999', roi: '5.5%', period: 'monthly', assets: 'All Assets', color: '#9b59b6' },
  { name: 'Institutional', min: '$25,000', max: 'Unlimited', roi: '8%', period: 'monthly', assets: 'All Assets + Custom', color: '#2ecc71' },
]

var TESTIMONIALS = [
  { name: 'Michael O.', country: 'Nigeria', text: 'I started with $500 and within 3 months I had tripled my investment. The platform is transparent and withdrawals are always on time.', stars: 5 },
  { name: 'Sarah K.', country: 'United Kingdom', text: 'Best investment platform I have used. The AI-powered strategies genuinely work and customer support is always responsive.', stars: 5 },
  { name: 'James T.', country: 'United States', text: 'I was skeptical at first but after my first withdrawal I was convinced. Now I manage $15,000 here and the returns are consistent.', stars: 5 },
  { name: 'Aisha M.', country: 'UAE', text: 'The copy trading feature alone is worth it. I just follow the top traders and earn passively every single month.', stars: 5 },
]

export default function LandingPage() {
  var [menuOpen, setMenuOpen] = useState(false)
  var [tickerPos, setTickerPos] = useState(0)
  var [activeTab, setActiveTab] = useState('crypto')

  useEffect(function() {
    var interval = setInterval(function() {
      setTickerPos(function(p) { return p <= -1600 ? 0 : p - 1 })
    }, 20)
    return function() { clearInterval(interval) }
  }, [])

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  return (
    <div style={{ minHeight: '100vh', background: '#060a0e', color: '#e8edf5', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{'@import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap); * { box-sizing: border-box; margin: 0; padding: 0; } body { background: #060a0e; overflow-x: hidden; } @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } } .nav-link { color: #8892a0; text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; } .nav-link:hover { color: #C9A84C; } .plan-card { background: #0d1117; border: 1px solid #1e2530; border-radius: 20px; padding: 28px; transition: all .3s; cursor: pointer; } .plan-card:hover { transform: translateY(-6px); border-color: rgba(201,168,76,0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.4); } .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; text-align: center; } .feature-card { background: #0d1117; border: 1px solid #1e2530; border-radius: 16px; padding: 24px; transition: all .3s; } .feature-card:hover { border-color: rgba(201,168,76,0.3); } .tab-btn { padding: 8px 20px; border-radius: 8px; border: none; cursor: pointer; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; transition: all .2s; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 3px; }'}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(6,10,14,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 68 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: '#060a0e' }}>C</div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#e8edf5' }}>CapitalMarket <span style={{ color: G }}>Pro</span></span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ display: 'flex', gap: 28 }}>
              {[['Markets', '#markets'], ['Plans', '#plans'], ['Features', '#features'], ['About', '#about']].map(function(item) {
                return <a key={item[0]} href={item[1]} className="nav-link">{item[0]}</a>
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/login">
                <button style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 10, color: '#8892a0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Sign In</button>
              </Link>
              <Link href="/register">
                <button style={{ padding: '9px 20px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Get Started</button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* TICKER */}
      <div style={{ position: 'fixed', top: 68, left: 0, right: 0, zIndex: 999, background: '#0a0d13', borderBottom: '1px solid #1e2530', overflow: 'hidden', height: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, transform: 'translateX(' + tickerPos + 'px)', whiteSpace: 'nowrap', height: '100%', paddingLeft: 20 }}>
          {[...ASSETS, ...ASSETS, ...ASSETS].map(function(a, i) {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ color: a.color, fontWeight: 700 }}>{a.sym}</span>
                <span style={{ color: '#e8edf5' }}>{a.price}</span>
                <span style={{ color: a.chg.startsWith('-') ? '#e74c3c' : '#2ecc71' }}>{a.chg}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 120, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 1, animation: 'fadeUp .6s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 100, padding: '6px 16px', fontSize: 12, color: '#2ecc71', marginBottom: 28, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Markets Open - 24/7 Global Trading
          </div>

          <h1 style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-2px' }}>
            <span style={{ color: '#e8edf5' }}>Professional Trading</span><br />
            <span style={{ background: GG, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Made Simple</span>
          </h1>

          <p style={{ fontSize: 18, color: '#8892a0', lineHeight: 1.8, maxWidth: 600, margin: '0 auto 40px' }}>
            Access Tesla, Bitcoin, Gold and 200+ global assets with AI-powered strategies delivering verified monthly returns from 1.5% to 8%.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link href="/register">
              <button style={{ padding: '16px 36px', background: GG, border: 'none', borderRadius: 14, color: '#060a0e', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 32px rgba(201,168,76,0.35)' }}>
                Start Trading Free
              </button>
            </Link>
            <a href="#plans">
              <button style={{ padding: '16px 36px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 14, color: '#8892a0', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                View Plans
              </button>
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[['$4.2B+', 'Assets Managed'], ['180K+', 'Active Investors'], ['142+', 'Countries'], ['99.9%', 'Uptime']].map(function(s) {
              return (
                <div key={s[1]} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: G }}>{s[0]}</div>
                  <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>{s[1]}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* MARKETS */}
      <section id="markets" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Live Markets</div>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Trade 200+ Assets</h2>
          <p style={{ fontSize: 16, color: '#8892a0' }}>Stocks, crypto, forex, commodities and more</p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          {['crypto', 'stocks', 'forex', 'commodities'].map(function(tab) {
            return <button key={tab} className="tab-btn" onClick={function() { setActiveTab(tab) }} style={{ background: activeTab === tab ? GG : 'transparent', color: activeTab === tab ? '#060a0e' : '#8892a0', border: activeTab === tab ? 'none' : '1px solid #1e2530', textTransform: 'capitalize' }}>{tab}</button>
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {ASSETS.map(function(asset) {
            return (
              <div key={asset.sym} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '20px', transition: 'all .3s', cursor: 'pointer' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: asset.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: asset.color }}>{asset.sym}</div>
                  <span style={{ fontSize: 12, color: asset.chg.startsWith('-') ? '#e74c3c' : '#2ecc71', fontWeight: 600 }}>{asset.chg}</span>
                </div>
                <div style={{ fontSize: 13, color: '#8892a0', marginBottom: 4 }}>{asset.name}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>{asset.price}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Investment Plans</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Plans For Every Budget</h2>
            <p style={{ fontSize: 16, color: '#8892a0' }}>Start from as little as $50 with verified monthly returns</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {PLANS.map(function(plan, i) {
              return (
                <div key={plan.name} className="plan-card" style={{ position: 'relative', border: i === 1 ? '1px solid rgba(201,168,76,0.5)' : '1px solid #1e2530' }}>
                  {i === 1 && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: GG, color: '#060a0e', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 100 }}>POPULAR</div>}
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: plan.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: plan.color, marginBottom: 16 }}>{plan.name[0]}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 20 }}>{plan.assets}</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: plan.color, marginBottom: 4 }}>{plan.roi}</div>
                  <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 24 }}>Monthly Returns</div>
                  <div style={{ borderTop: '1px solid #1e2530', paddingTop: 20, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: '#8892a0' }}>Min Deposit</span>
                      <span style={{ color: '#e8edf5', fontWeight: 700 }}>{plan.min}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#8892a0' }}>Max Deposit</span>
                      <span style={{ color: '#e8edf5', fontWeight: 700 }}>{plan.max}</span>
                    </div>
                  </div>
                  <Link href="/register" style={{ textDecoration: 'none', display: 'block' }}>
                    <button style={{ width: '100%', padding: '12px', background: i === 1 ? GG : 'transparent', border: i === 1 ? 'none' : '1px solid #1e2530', borderRadius: 12, color: i === 1 ? '#060a0e' : '#8892a0', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Get Started
                    </button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Why Choose Us</div>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>Built For Serious Investors</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[
            { icon: '🤖', title: 'AI-Powered Strategies', desc: 'Our algorithms analyze markets 24/7 and execute trades at optimal moments for maximum returns.' },
            { icon: '📊', title: 'Copy Trading', desc: 'Follow and copy top-performing traders automatically. Perfect for beginners and experienced investors.' },
            { icon: '🔒', title: 'Bank-Grade Security', desc: '256-bit SSL encryption, two-factor authentication and cold storage keep your funds safe at all times.' },
            { icon: '⚡', title: 'Instant Withdrawals', desc: 'Approved withdrawals are processed within 24 hours. Your money is always accessible when you need it.' },
            { icon: '🌍', title: 'Global Access', desc: 'Available in 142+ countries. Trade international markets from anywhere in the world.' },
            { icon: '📱', title: '24/7 Support', desc: 'Our dedicated support team is available around the clock to help with any questions or issues.' },
          ].map(function(f) {
            return (
              <div key={f.title} className="feature-card">
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Testimonials</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#e8edf5', marginBottom: 12 }}>What Our Investors Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map(function(t) {
              return (
                <div key={t.name} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: 24 }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                    {[1,2,3,4,5].map(function(s) { return <span key={s} style={{ color: G, fontSize: 14 }}>*</span> })}
                  </div>
                  <div style={{ fontSize: 14, color: '#8892a0', lineHeight: 1.8, marginBottom: 20 }}>{t.text}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0e' }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#4a5568' }}>{t.country}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', background: '#0d1117', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 28, padding: '60px 40px', boxShadow: '0 0 80px rgba(201,168,76,0.08)' }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: '#e8edf5', marginBottom: 16, letterSpacing: '-1px' }}>Ready to Start Earning?</h2>
          <p style={{ fontSize: 16, color: '#8892a0', marginBottom: 36, lineHeight: 1.7 }}>Join 180,000+ investors already growing their wealth on CapitalMarket Pro. Sign up free in under 2 minutes.</p>
          <Link href="/register">
            <button style={{ padding: '18px 48px', background: GG, border: 'none', borderRadius: 14, color: '#060a0e', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 32px rgba(201,168,76,0.35)' }}>
              Create Free Account
            </button>
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#4a5568' }}>No credit card required</span>
            <span style={{ fontSize: 12, color: '#4a5568' }}>Free to join</span>
            <span style={{ fontSize: 12, color: '#4a5568' }}>Withdraw anytime</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" style={{ borderTop: '1px solid #1e2530', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#060a0e' }}>C</div>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5' }}>CapitalMarket <span style={{ color: G }}>Pro</span></span>
              </div>
              <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.7 }}>Professional investment platform trusted by 180,000+ investors worldwide.</p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Platform</div>
              {['Markets', 'Investment Plans', 'Copy Trading', 'Affiliate Program'].map(function(item) {
                return <div key={item} style={{ fontSize: 13, color: '#4a5568', marginBottom: 8, cursor: 'pointer' }}>{item}</div>
              })}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Company</div>
              {['About Us', 'Blog', 'Careers', 'Press'].map(function(item) {
                return <div key={item} style={{ fontSize: 13, color: '#4a5568', marginBottom: 8, cursor: 'pointer' }}>{item}</div>
              })}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Legal</div>
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Compliance'].map(function(item) {
                return <div key={item} style={{ fontSize: 13, color: '#4a5568', marginBottom: 8, cursor: 'pointer' }}>{item}</div>
              })}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e2530', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#2a3140' }}>2025 CapitalMarket Pro Financial Services. All Rights Reserved. Licensed and regulated.</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 11, color: '#2a3140' }}>SSL Secured</span>
              <span style={{ fontSize: 11, color: '#2a3140' }}>FCA Authorized</span>
              <span style={{ fontSize: 11, color: '#2a3140' }}>SOC2 Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
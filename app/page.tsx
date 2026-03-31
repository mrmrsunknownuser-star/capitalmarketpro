'use client'

import { useState } from 'react'
import Link from 'next/link'

const features = [
  { icon: '◈', title: 'Crypto Trading', desc: 'Buy, sell and trade Bitcoin, Ethereum, Solana and 100+ cryptocurrencies with real-time market data.', color: '#0052FF' },
  { icon: '◇', title: 'Stock Brokerage', desc: 'Access global stock markets. Trade Apple, Tesla, NVIDIA and thousands of stocks and ETFs.', color: '#00B386' },
  { icon: '◉', title: 'Affiliate Earnings', desc: 'Generate passive income through our affiliate program. Track clicks, conversions and payouts.', color: '#FF9900' },
  { icon: '◆', title: 'Unified Dashboard', desc: 'See all your investments in one place. Track P&L, portfolio allocation and performance.', color: '#F7A600' },
  { icon: '🔒', title: 'Bank-Level Security', desc: '256-bit SSL encryption, 2FA authentication and cold storage for maximum fund protection.', color: '#C9A84C' },
  { icon: '⚡', title: 'Instant Processing', desc: 'Lightning-fast deposits via Bitcoin. Funds credited within 30 minutes of confirmation.', color: '#7B2BF9' },
]

const stats = [
  { value: '$2.4B+', label: 'Total Volume Traded' },
  { value: '150K+', label: 'Active Traders' },
  { value: '99.9%', label: 'Uptime Guaranteed' },
  { value: '24/7', label: 'Live Support' },
]

const testimonials = [
  { name: 'Michael R.', role: 'Professional Trader', text: 'CapitalMarket Pro changed how I manage my portfolio. Having crypto, stocks and affiliate income in one dashboard is a game changer.', avatar: 'M' },
  { name: 'Sarah K.', role: 'Crypto Investor', text: 'The platform is incredibly professional. Deposits are fast, the charts are clean and the support team is always responsive.', avatar: 'S' },
  { name: 'James T.', role: 'Stock Trader', text: 'I have tried many platforms but none match the level of professionalism and ease of use that CapitalMarket Pro offers.', avatar: 'J' },
]

const faqs = [
  { q: 'How do I fund my account?', a: 'We accept Bitcoin (BTC) deposits for fast and secure funding. Simply click Deposit, choose your preferred provider, and send BTC to your unique address.' },
  { q: 'How long do withdrawals take?', a: 'Withdrawals are reviewed by our team within 24-48 hours. Once approved, funds are sent directly to your crypto wallet.' },
  { q: 'Is my money safe?', a: 'Yes. We use 256-bit SSL encryption, two-factor authentication, and cold storage to protect all user funds and data.' },
  { q: 'What markets can I trade?', a: 'You can trade cryptocurrencies (BTC, ETH, SOL, BNB and more), global stocks (US, EU markets), and earn through our affiliate program.' },
  { q: 'How do I get started?', a: 'Simply create an account, complete your profile, deposit funds via Bitcoin, and start trading immediately.' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState('')

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(6,10,15,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #161b22', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#060a0f' }}>C</div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C' }}>CapitalMarket</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}> Pro</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'Markets', 'About', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: 13, color: '#8b949e', textDecoration: 'none' }}>{item}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login">
            <button style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 12, cursor: 'pointer' }}>
              Sign In
            </button>
          </Link>
          <Link href="/register">
            <button style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Get Started →
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, fontSize: 11, color: '#C9A84C', letterSpacing: '0.1em' }}>
            ⚡ NEXT GENERATION TRADING PLATFORM
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 800, color: '#e6edf3', lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Trade Smarter.<br />
            <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Grow Faster.
            </span>
          </h1>
          <p style={{ fontSize: 18, color: '#8b949e', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            The world's most professional all-in-one trading platform. Crypto, stocks, and affiliate earnings — unified in one powerful dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register">
              <button style={{ padding: '14px 32px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}>
                Start Trading Free →
              </button>
            </Link>
            <Link href="/login">
              <button style={{ padding: '14px 32px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 14, cursor: 'pointer' }}>
                Sign In
              </button>
            </Link>
          </div>
          <div style={{ marginTop: 24, fontSize: 12, color: '#484f58' }}>
            No credit card required · Free to get started · Instant access
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 40px', borderTop: '1px solid #161b22', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#C9A84C', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#484f58', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Everything You Need</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Built for Serious Traders</h2>
            <p style={{ fontSize: 15, color: '#8b949e', maxWidth: 500, margin: '0 auto' }}>One platform. Every market. Complete control over your financial future.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: '#0d1117', border: `1px solid ${f.color}22`, borderRadius: 14, padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 14px 0 80px', background: `${f.color}08` }} />
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets */}
      <section id="markets" style={{ padding: '80px 40px', background: '#0d1117', borderTop: '1px solid #161b22', borderBottom: '1px solid #161b22' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Live Markets</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#e6edf3' }}>Trade Any Market, Anytime</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { name: 'Bitcoin', symbol: 'BTC/USD', price: '$67,240', change: '+2.4%', positive: true, color: '#F7A600' },
              { name: 'Ethereum', symbol: 'ETH/USD', price: '$3,480', change: '+1.8%', positive: true, color: '#627EEA' },
              { name: 'Apple Inc.', symbol: 'AAPL', price: '$189.30', change: '-0.6%', positive: false, color: '#8b949e' },
              { name: 'NVIDIA Corp.', symbol: 'NVDA', price: '$875.40', change: '+3.2%', positive: true, color: '#76B900' },
            ].map(m => (
              <div key={m.symbol} style={{ background: '#060a0f', border: '1px solid #161b22', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${m.color}18`, border: `1px solid ${m.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: m.color }}>
                    {m.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>{m.symbol}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>{m.price}</div>
                  <div style={{ fontSize: 12, color: m.positive ? '#3fb950' : '#f85149' }}>{m.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Testimonials</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#e6edf3' }}>Trusted by Thousands</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 24, color: '#C9A84C', marginBottom: 16 }}>"</div>
                <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 20 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#060a0f' }}>
                    {t.avatar}
                  </div>
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

      {/* FAQ */}
      <section id="faq" style={{ padding: '80px 40px', background: '#0d1117', borderTop: '1px solid #161b22' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#e6edf3' }}>Frequently Asked Questions</h2>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #161b22' }}>
              <div
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: openFaq === i ? '#C9A84C' : '#e6edf3' }}>{faq.q}</div>
                <span style={{ color: '#484f58', fontSize: 18, flexShrink: 0, marginLeft: 16 }}>{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 0 18px', fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>
            Ready to Start <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trading?</span>
          </h2>
          <p style={{ fontSize: 15, color: '#8b949e', marginBottom: 32 }}>
            Join 150,000+ traders on CapitalMarket Pro. Create your account in minutes.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ flex: 1, maxWidth: 300, background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '13px 16px', color: '#e6edf3', fontSize: 13, outline: 'none' }}
            />
            <Link href={`/register${email ? `?email=${email}` : ''}`}>
              <button style={{ padding: '13px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Get Started →
              </button>
            </Link>
          </div>
          <div style={{ fontSize: 11, color: '#484f58' }}>Free forever · No credit card · Instant setup</div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', borderTop: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#060a0f' }}>C</div>
          <span style={{ fontSize: 13, color: '#484f58' }}>© 2025 CapitalMarket Pro. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Support'].map(item => (
            <a key={item} href="#" style={{ fontSize: 12, color: '#484f58', textDecoration: 'none' }}>{item}</a>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#484f58' }}>🔒 256-bit SSL · SOC 2 Compliant</div>
      </footer>
    </div>
  )
}
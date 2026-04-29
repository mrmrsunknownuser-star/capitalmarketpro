// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

var INVEST_TYPES = [
  {
    id: 'crypto',
    icon: '₿',
    label: 'Crypto',
    color: '#F7931A',
    bg: 'rgba(247,147,26,.12)',
    desc: 'Bitcoin, Ethereum, Solana & 50+ coins',
    returns: 'Up to 8%/mo',
    min: '$50',
    investors: '42,000+',
  },
  {
    id: 'stocks',
    icon: '📈',
    label: 'Stocks',
    color: '#2ecc71',
    bg: 'rgba(46,204,113,.12)',
    desc: 'Tesla, Apple, NVIDIA & global equities',
    returns: 'Up to 6%/mo',
    min: '$100',
    investors: '38,000+',
  },
  {
    id: 'forex',
    icon: '💱',
    label: 'Forex',
    color: '#3498db',
    bg: 'rgba(52,152,219,.12)',
    desc: 'EUR/USD, GBP/USD & 70+ currency pairs',
    returns: 'Up to 4.5%/mo',
    min: '$100',
    investors: '29,000+',
  },
  {
    id: 'realestate',
    icon: '🏠',
    label: 'Real Estate',
    color: '#9b59b6',
    bg: 'rgba(155,89,182,.12)',
    desc: 'Premium property portfolios & REITs',
    returns: 'Up to 5%/mo',
    min: '$200',
    investors: '18,000+',
  },
  {
    id: 'commodities',
    icon: '🥇',
    label: 'Commodities',
    color: '#e67e22',
    bg: 'rgba(230,126,34,.12)',
    desc: 'Gold, Silver, Oil & energy markets',
    returns: 'Up to 3.5%/mo',
    min: '$150',
    investors: '12,000+',
  },
  {
    id: 'indices',
    icon: '📉',
    label: 'Indices',
    color: '#1abc9c',
    bg: 'rgba(26,188,156,.12)',
    desc: 'S&P 500, NASDAQ, FTSE & global indices',
    returns: 'Up to 3%/mo',
    min: '$250',
    investors: '9,000+',
  },
  {
    id: 'etf',
    icon: '🗂',
    label: 'ETF Funds',
    color: '#e74c3c',
    bg: 'rgba(231,76,60,.12)',
    desc: 'Diversified exchange traded funds',
    returns: 'Up to 2.5%/mo',
    min: '$500',
    investors: '7,500+',
  },
  {
    id: 'defi',
    icon: '⛓',
    label: 'DeFi',
    color: '#8e44ad',
    bg: 'rgba(142,68,173,.12)',
    desc: 'Decentralized finance & yield farming',
    returns: 'Up to 12%/mo',
    min: '$100',
    investors: '15,000+',
  },
]

var SPECIAL_PROGRAMS = [
  {
    id: 'copy',
    icon: '📋',
    label: 'Copy Trading',
    color: '#C9A84C',
    bg: 'rgba(201,168,76,.12)',
    desc: 'Automatically mirror top traders',
    tag: 'PASSIVE INCOME',
    tagColor: '#C9A84C',
    href: '/dashboard/copy',
  },
  {
    id: 'affiliate',
    icon: '🤝',
    label: 'Affiliate Program',
    color: '#2ecc71',
    bg: 'rgba(46,204,113,.12)',
    desc: 'Earn 15% commission on referrals',
    tag: 'EARN FREE',
    tagColor: '#2ecc71',
    href: '/dashboard/affiliate',
  },
  {
    id: 'signal',
    icon: '📡',
    label: 'Trading Signals',
    color: '#3498db',
    bg: 'rgba(52,152,219,.12)',
    desc: 'AI-powered buy and sell signals',
    tag: 'AI POWERED',
    tagColor: '#3498db',
    href: '/dashboard/signal',
  },
  {
    id: 'portfolio',
    icon: '📊',
    label: 'Managed Portfolio',
    color: '#9b59b6',
    bg: 'rgba(155,89,182,.12)',
    desc: 'Let our experts manage your portfolio',
    tag: 'EXPERT MANAGED',
    tagColor: '#9b59b6',
    href: '/dashboard/portfolio',
  },
]

export default function InvestPage() {
  var router = useRouter()
  var [filter, setFilter] = useState('all')

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={function() { router.back() }} style={{ width: 38, height: 38, borderRadius: 12, background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#8892a0' }}>←</button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>All Investments</div>
          <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>Choose your investment type</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ margin: '0 16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Asset Types', val: '8+', color: G },
          { label: 'Max Returns', val: '12%/mo', color: '#2ecc71' },
          { label: 'Min. Deposit', val: '$50', color: '#3498db' },
        ].map(function(stat) {
          return (
            <div key={stat.label} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: stat.color }}>{stat.val}</div>
              <div style={{ fontSize: 10, color: '#4a5568', marginTop: 4 }}>{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ margin: '0 16px 20px', display: 'flex', gap: 8 }}>
        {[['all', 'All'], ['markets', 'Markets'], ['programs', 'Programs']].map(function(f) {
          return (
            <button key={f[0]} onClick={function() { setFilter(f[0]) }} style={{ flex: 1, padding: '10px', borderRadius: 11, border: filter === f[0] ? 'none' : '1px solid #1e2530', background: filter === f[0] ? GG : '#0d1117', color: filter === f[0] ? '#060a0e' : '#4a5568', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {f[1]}
            </button>
          )
        })}
      </div>

      {/* Market investments */}
      {(filter === 'all' || filter === 'markets') && (
        <div style={{ padding: '0 16px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
            Market Investments
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {INVEST_TYPES.map(function(type) {
              return (
                <Link key={type.id} href={'/dashboard/invest/' + type.id} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, padding: 18, transition: 'all .2s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = type.color + '40' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderRadius: '0 0 0 60px', background: type.color + '08' }} />
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: type.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>
                      {type.icon}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#e8edf5', marginBottom: 4 }}>{type.label}</div>
                    <div style={{ fontSize: 11, color: '#4a5568', lineHeight: 1.5, marginBottom: 10 }}>{type.desc}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#2ecc71' }}>{type.returns}</div>
                        <div style={{ fontSize: 9, color: '#4a5568', marginTop: 2 }}>From {type.min}</div>
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: type.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: type.color }}>→</div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Special programs */}
      {(filter === 'all' || filter === 'programs') && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
            Special Programs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SPECIAL_PROGRAMS.map(function(prog) {
              return (
                <Link key={prog.id} href={prog.href} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color .2s', cursor: 'pointer' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = prog.color + '40' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: prog.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {prog.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5' }}>{prog.label}</div>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 100, background: prog.tagColor + '20', color: prog.tagColor }}>{prog.tag}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#4a5568' }}>{prog.desc}</div>
                    </div>
                    <span style={{ fontSize: 18, color: '#4a5568' }}>›</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ margin: '24px 16px 0', background: 'linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.02))', border: '1px solid rgba(201,168,76,.2)', borderRadius: 18, padding: '20px' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5', marginBottom: 6 }}>Need help choosing?</div>
        <div style={{ fontSize: 13, color: '#8892a0', lineHeight: 1.7, marginBottom: 14 }}>Our account manager Josh is available 24/7 to help you pick the right investment plan for your goals and budget.</div>
        <Link href="/dashboard/support">
          <button style={{ width: '100%', padding: '13px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Chat with Josh →
          </button>
        </Link>
      </div>
    </div>
  )
}
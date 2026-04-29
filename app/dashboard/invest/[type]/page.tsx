// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

var INVEST_DATA = {
  crypto: {
    name: 'Crypto Investment',
    icon: '₿',
    color: '#F7931A',
    bg: 'rgba(247,147,26,.1)',
    desc: 'Invest in Bitcoin, Ethereum, Solana and 50+ top cryptocurrencies. Our AI-powered crypto strategies deliver consistent monthly returns with automatic rebalancing and 24/7 market monitoring.',
    stats: [{ label: 'Min. Investment', val: '$50' }, { label: 'Max. Returns', val: '8%/mo' }, { label: 'Active Investors', val: '42,000+' }, { label: 'Avg. Monthly ROI', val: '4.5%' }],
    plans: [
      { name: 'Crypto Starter', roi: '2.0', min: 50, max: 300, duration: '30 days', color: '#3498db', features: ['BTC & ETH exposure', 'Daily profit updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'Crypto Growth', roi: '3.5', min: 300, max: 1500, duration: '30 days', color: '#F7931A', popular: true, features: ['Top 10 crypto basket', 'Daily profit updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'Crypto Premium', roi: '5.5', min: 1500, max: 7500, duration: '30 days', color: '#9b59b6', features: ['Full crypto portfolio', 'Real-time analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Crypto Elite', roi: '8.0', min: 7500, max: 30000, duration: '30 days', color: '#C9A84C', features: ['Institutional grade', 'Custom strategy', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  stocks: {
    name: 'Stock Investment',
    icon: '📈',
    color: '#2ecc71',
    bg: 'rgba(46,204,113,.1)',
    desc: 'Invest in Tesla, Apple, NVIDIA, Amazon and 200+ global equities. Our professional stock desk manages your portfolio with proven long-term and short-term strategies backed by fundamental and technical analysis.',
    stats: [{ label: 'Min. Investment', val: '$100' }, { label: 'Max. Returns', val: '6%/mo' }, { label: 'Active Investors', val: '38,000+' }, { label: 'Avg. Monthly ROI', val: '3.5%' }],
    plans: [
      { name: 'Stock Starter', roi: '1.5', min: 100, max: 500, duration: '30 days', color: '#3498db', features: ['Top 5 US stocks', 'Weekly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'Stock Growth', roi: '2.5', min: 500, max: 2000, duration: '30 days', color: '#2ecc71', popular: true, features: ['Top 20 US stocks', 'Daily updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'Stock Premium', roi: '4.0', min: 2000, max: 10000, duration: '30 days', color: '#9b59b6', features: ['Global stock basket', 'Real-time analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Stock Elite', roi: '6.0', min: 10000, max: 50000, duration: '30 days', color: '#C9A84C', features: ['Institutional equity', 'Custom portfolio', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  forex: {
    name: 'Forex Investment',
    icon: '💱',
    color: '#3498db',
    bg: 'rgba(52,152,219,.1)',
    desc: 'Trade EUR/USD, GBP/USD, USD/JPY and 70+ currency pairs. Our expert forex desk uses AI-powered signals and technical analysis to maximize your currency trading returns with tight spreads and deep liquidity.',
    stats: [{ label: 'Min. Investment', val: '$100' }, { label: 'Max. Returns', val: '4.5%/mo' }, { label: 'Active Investors', val: '29,000+' }, { label: 'Avg. Monthly ROI', val: '2.5%' }],
    plans: [
      { name: 'Forex Starter', roi: '1.0', min: 100, max: 1000, duration: '30 days', color: '#3498db', features: ['Major pairs only', 'Weekly reports', 'Instant withdrawal', '24/7 support'] },
      { name: 'Forex Growth', roi: '2.0', min: 1000, max: 5000, duration: '30 days', color: '#2ecc71', popular: true, features: ['Major + minor pairs', 'Daily reports', 'Instant withdrawal', 'Account manager'] },
      { name: 'Forex Premium', roi: '3.1', min: 5000, max: 25000, duration: '30 days', color: '#9b59b6', features: ['All currency pairs', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Forex Elite', roi: '4.5', min: 25000, max: 100000, duration: '30 days', color: '#C9A84C', features: ['Institutional forex', 'Custom strategy', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  realestate: {
    name: 'Real Estate Investment',
    icon: '🏠',
    color: '#9b59b6',
    bg: 'rgba(155,89,182,.1)',
    desc: 'Invest in premium real estate portfolios without the complexity of property ownership. Our real estate fund provides stable, inflation-protected monthly returns from commercial and residential properties across the US and Europe.',
    stats: [{ label: 'Min. Investment', val: '$200' }, { label: 'Max. Returns', val: '5%/mo' }, { label: 'Active Investors', val: '18,000+' }, { label: 'Avg. Monthly ROI', val: '2.8%' }],
    plans: [
      { name: 'RE Starter', roi: '1.2', min: 200, max: 1000, duration: '30 days', color: '#3498db', features: ['Residential REITs', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'RE Growth', roi: '2.0', min: 1000, max: 5000, duration: '30 days', color: '#9b59b6', popular: true, features: ['Mixed property portfolio', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'RE Premium', roi: '3.5', min: 5000, max: 25000, duration: '30 days', color: '#e67e22', features: ['Commercial + residential', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'RE Elite', roi: '5.0', min: 25000, max: 100000, duration: '30 days', color: '#C9A84C', features: ['Institutional RE fund', 'Custom allocation', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  commodities: {
    name: 'Commodities Investment',
    icon: '🥇',
    color: '#e67e22',
    bg: 'rgba(230,126,34,.1)',
    desc: 'Invest in Gold, Silver, Crude Oil, Natural Gas and agricultural commodities. Commodities are historically the best hedge against inflation and market volatility, offering stable and consistent returns across all economic cycles.',
    stats: [{ label: 'Min. Investment', val: '$150' }, { label: 'Max. Returns', val: '3.5%/mo' }, { label: 'Active Investors', val: '12,000+' }, { label: 'Avg. Monthly ROI', val: '2.2%' }],
    plans: [
      { name: 'Commodity Starter', roi: '0.8', min: 150, max: 1000, duration: '30 days', color: '#e67e22', features: ['Gold & Silver exposure', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'Commodity Growth', roi: '1.5', min: 1000, max: 5000, duration: '30 days', color: '#C9A84C', popular: true, features: ['Full metals basket', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'Commodity Premium', roi: '2.5', min: 5000, max: 20000, duration: '30 days', color: '#e74c3c', features: ['Metals + Energy', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Commodity Elite', roi: '3.5', min: 20000, max: 100000, duration: '30 days', color: '#C9A84C', features: ['Full commodities fund', 'Custom allocation', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  indices: {
    name: 'Indices Investment',
    icon: '📉',
    color: '#1abc9c',
    bg: 'rgba(26,188,156,.1)',
    desc: 'Trade the world\'s most recognized indices including S&P 500, NASDAQ 100, FTSE 100, DAX 40 and Nikkei 225. Index investing gives you diversified exposure to entire economies with lower risk than individual stocks.',
    stats: [{ label: 'Min. Investment', val: '$250' }, { label: 'Max. Returns', val: '3%/mo' }, { label: 'Active Investors', val: '9,000+' }, { label: 'Avg. Monthly ROI', val: '1.8%' }],
    plans: [
      { name: 'Index Starter', roi: '0.7', min: 250, max: 1500, duration: '30 days', color: '#1abc9c', features: ['US indices only', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'Index Growth', roi: '1.3', min: 1500, max: 6000, duration: '30 days', color: '#3498db', popular: true, features: ['US + EU indices', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'Index Premium', roi: '2.0', min: 6000, max: 25000, duration: '30 days', color: '#9b59b6', features: ['Global indices basket', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Index Elite', roi: '3.0', min: 25000, max: 150000, duration: '30 days', color: '#C9A84C', features: ['Institutional index fund', 'Custom weighting', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  etf: {
    name: 'ETF Fund Investment',
    icon: '🗂',
    color: '#e74c3c',
    bg: 'rgba(231,76,60,.1)',
    desc: 'Exchange Traded Funds offer the ultimate in diversification. Our curated ETF portfolios cover technology, healthcare, energy, emerging markets and more. Perfect for investors who want broad market exposure with professional management.',
    stats: [{ label: 'Min. Investment', val: '$500' }, { label: 'Max. Returns', val: '2.5%/mo' }, { label: 'Active Investors', val: '7,500+' }, { label: 'Avg. Monthly ROI', val: '1.5%' }],
    plans: [
      { name: 'ETF Starter', roi: '0.6', min: 500, max: 2000, duration: '30 days', color: '#e74c3c', features: ['Core ETF basket', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'ETF Growth', roi: '1.2', min: 2000, max: 8000, duration: '30 days', color: '#C9A84C', popular: true, features: ['Diversified ETF mix', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'ETF Premium', roi: '1.8', min: 8000, max: 30000, duration: '30 days', color: '#9b59b6', features: ['Sector + thematic ETFs', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'ETF Elite', roi: '2.5', min: 30000, max: 200000, duration: '30 days', color: '#C9A84C', features: ['Institutional ETF fund', 'Custom sector mix', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  defi: {
    name: 'DeFi Investment',
    icon: '⛓',
    color: '#8e44ad',
    bg: 'rgba(142,68,173,.1)',
    desc: 'Decentralized Finance represents the future of money. Our DeFi strategies include yield farming, liquidity provision, staking and automated market making across the top protocols. Highest risk, highest reward category.',
    stats: [{ label: 'Min. Investment', val: '$100' }, { label: 'Max. Returns', val: '12%/mo' }, { label: 'Active Investors', val: '15,000+' }, { label: 'Avg. Monthly ROI', val: '6.5%' }],
    plans: [
      { name: 'DeFi Starter', roi: '3.0', min: 100, max: 500, duration: '30 days', color: '#3498db', features: ['Stablecoin farming', 'Daily updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'DeFi Growth', roi: '5.5', min: 500, max: 2500, duration: '30 days', color: '#8e44ad', popular: true, features: ['Multi-protocol farming', 'Daily updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'DeFi Premium', roi: '8.0', min: 2500, max: 10000, duration: '30 days', color: '#e74c3c', features: ['Advanced yield strategies', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'DeFi Elite', roi: '12.0', min: 10000, max: 50000, duration: '30 days', color: '#C9A84C', features: ['Institutional DeFi desk', 'Custom strategies', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  commodities: {
    name: 'Commodities Investment',
    icon: '🥇',
    color: '#e67e22',
    bg: 'rgba(230,126,34,.1)',
    desc: 'Invest in Gold, Silver, Crude Oil, Natural Gas and agricultural commodities.',
    stats: [{ label: 'Min. Investment', val: '$150' }, { label: 'Max. Returns', val: '3.5%/mo' }, { label: 'Active Investors', val: '12,000+' }, { label: 'Avg. Monthly ROI', val: '2.2%' }],
    plans: [
      { name: 'Commodity Starter', roi: '0.8', min: 150, max: 1000, duration: '30 days', color: '#e67e22', features: ['Gold & Silver', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'Commodity Growth', roi: '1.5', min: 1000, max: 5000, duration: '30 days', color: '#C9A84C', popular: true, features: ['Full metals basket', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'Commodity Premium', roi: '2.5', min: 5000, max: 20000, duration: '30 days', color: '#e74c3c', features: ['Metals + Energy', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Commodity Elite', roi: '3.5', min: 20000, max: 100000, duration: '30 days', color: '#C9A84C', features: ['Full commodities fund', 'Custom allocation', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
}

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
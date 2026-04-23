// @ts-nocheck
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

var INVEST_DATA = {
  crypto: {
    name: 'Crypto Investment',
    icon: '₿',
    color: '#F7931A',
    bg: 'rgba(247,147,26,.1)',
    desc: 'Invest in Bitcoin, Ethereum, Solana and 50+ top cryptocurrencies. Our AI-powered crypto strategies deliver consistent monthly returns with automatic rebalancing.',
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
    desc: 'Invest in Tesla, Apple, NVIDIA, Amazon and 200+ global equities. Our professional stock desk manages your portfolio with proven long-term and short-term strategies.',
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
    desc: 'Trade EUR/USD, GBP/USD, USD/JPY and 70+ currency pairs. Our expert forex desk uses AI-powered signals and technical analysis to maximize your currency trading returns.',
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
    desc: 'Invest in premium real estate portfolios without the complexity of property ownership. Our real estate fund provides stable, inflation-protected monthly returns.',
    stats: [{ label: 'Min. Investment', val: '$200' }, { label: 'Max. Returns', val: '5%/mo' }, { label: 'Active Investors', val: '18,000+' }, { label: 'Avg. Monthly ROI', val: '2.8%' }],
    plans: [
      { name: 'RE Starter', roi: '1.2', min: 200, max: 1000, duration: '30 days', color: '#3498db', features: ['Residential REITs', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'RE Growth', roi: '2.0', min: 1000, max: 5000, duration: '30 days', color: '#9b59b6', popular: true, features: ['Mixed property portfolio', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'RE Premium', roi: '3.5', min: 5000, max: 25000, duration: '30 days', color: '#e67e22', features: ['Commercial + residential', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'RE Elite', roi: '5.0', min: 25000, max: 100000, duration: '30 days', color: '#C9A84C', features: ['Institutional RE fund', 'Custom allocation', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
}

export default function InvestDetailPage() {
  var params = useParams()
  var router = useRouter()
  var type = params.type
  var data = INVEST_DATA[type]

  var [roiAmount, setRoiAmount] = useState('1000')
  var [roiPlan, setRoiPlan] = useState(0)
  var [roiMonths, setRoiMonths] = useState(1)
  var [activeTab, setActiveTab] = useState('plans')

  if (!data) {
    router.push('/dashboard')
    return null
  }

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  var selectedPlan = data.plans[roiPlan]
  var amount = parseFloat(roiAmount) || 0
  var monthlyReturn = amount * (parseFloat(selectedPlan.roi) / 100)
  var totalReturn = monthlyReturn * roiMonths
  var totalValue = amount + totalReturn

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={function() { router.back() }} style={{ width: 40, height: 40, borderRadius: 12, background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#8892a0' }}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: data.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{data.icon}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#e8edf5' }}>{data.name}</div>
            <div style={{ fontSize: 11, color: '#4a5568' }}>Returns up to {data.plans[data.plans.length - 1].roi}% monthly</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ margin: '0 16px 20px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        {data.stats.map(function(stat) {
          return (
            <div key={stat.label} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 5 }}>{stat.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: data.color }}>{stat.val}</div>
            </div>
          )
        })}
      </div>

      {/* Description */}
      <div style={{ margin: '0 16px 20px', background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '16px' }}>
        <div style={{ fontSize: 13, color: '#8892a0', lineHeight: 1.75 }}>{data.desc}</div>
      </div>

      {/* Tabs */}
      <div style={{ margin: '0 16px 20px', display: 'flex', gap: 8 }}>
        {['plans', 'calculator'].map(function(tab) {
          return (
            <button key={tab} onClick={function() { setActiveTab(tab) }} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: activeTab === tab ? GG : '#0d1117', color: activeTab === tab ? '#060a0e' : '#4a5568', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', border: activeTab === tab ? 'none' : '1px solid #1e2530' }}>
              {tab === 'plans' ? 'Investment Plans' : 'ROI Calculator'}
            </button>
          )
        })}
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.plans.map(function(plan, i) {
            return (
              <div key={plan.name} style={{ background: '#0d1117', border: '1px solid ' + (plan.popular ? 'rgba(201,168,76,.4)' : '#1e2530'), borderRadius: 20, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -1, right: 20, background: GG, color: '#060a0e', fontSize: 9, fontWeight: 800, padding: '4px 12px', borderRadius: '0 0 10px 10px' }}>POPULAR</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5', marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 11, color: '#4a5568' }}>${plan.min.toLocaleString()} — ${plan.max.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: plan.popular ? G : data.color }}>{plan.roi}%</div>
                    <div style={{ fontSize: 10, color: '#4a5568' }}>per month</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {plan.features.map(function(feat) {
                    return (
                      <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#8892a0' }}>
                        <span style={{ color: '#2ecc71', fontSize: 11, flexShrink: 0 }}>✓</span>
                        {feat}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, padding: '12px', background: '#141920', borderRadius: 12, fontSize: 13 }}>
                  <span style={{ color: '#4a5568' }}>Duration: <strong style={{ color: '#e8edf5' }}>{plan.duration}</strong></span>
                  <span style={{ color: '#4a5568' }}>Min: <strong style={{ color: G }}>${plan.min}</strong></span>
                </div>
                <Link href={'/dashboard/deposit?plan=' + plan.name.toLowerCase().replace(/\s/g, '-')}>
                  <button style={{ width: '100%', padding: '13px', background: plan.popular ? GG : 'transparent', border: plan.popular ? 'none' : '1px solid rgba(201,168,76,.3)', borderRadius: 12, color: plan.popular ? '#060a0e' : G, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Invest Now →
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* ROI Calculator Tab */}
      {activeTab === 'calculator' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, padding: '24px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5', marginBottom: 18 }}>ROI Calculator</div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Investment Amount (USD)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4a5568', fontSize: 16, fontWeight: 700 }}>$</span>
                <input
                  type="number"
                  value={roiAmount}
                  onChange={function(e) { setRoiAmount(e.target.value) }}
                  style={{ width: '100%', background: '#141920', border: '1.5px solid #1e2530', borderRadius: 12, padding: '13px 14px 13px 32px', color: '#e8edf5', fontSize: 18, fontWeight: 800, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  onFocus={function(e) { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={function(e) { e.target.style.borderColor = '#1e2530' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Select Plan</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.plans.map(function(plan, i) {
                  return (
                    <button key={i} onClick={function() { setRoiPlan(i) }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: roiPlan === i ? 'rgba(201,168,76,.1)' : '#141920', border: '1.5px solid ' + (roiPlan === i ? 'rgba(201,168,76,.5)' : '#1e2530'), borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: roiPlan === i ? '#e8edf5' : '#8892a0' }}>{plan.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: roiPlan === i ? G : '#4a5568' }}>{plan.roi}%/mo</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Duration: {roiMonths} Month{roiMonths > 1 ? 's' : ''}</label>
              <input type="range" min="1" max="12" value={roiMonths} onChange={function(e) { setRoiMonths(parseInt(e.target.value)) }} style={{ width: '100%', accentColor: G, height: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4a5568', marginTop: 4 }}>
                <span>1 month</span>
                <span>12 months</span>
              </div>
            </div>

            {/* Results */}
            <div style={{ background: 'linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.03))', border: '1px solid rgba(201,168,76,.2)', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>Estimated Returns</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#0d1117', borderRadius: 12, padding: '14px' }}>
                  <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 5 }}>Monthly Profit</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#2ecc71' }}>${monthlyReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div style={{ background: '#0d1117', borderRadius: 12, padding: '14px' }}>
                  <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 5 }}>Total Profit</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#2ecc71' }}>${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div style={{ background: '#0d1117', borderRadius: 12, padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 4 }}>Total Value After {roiMonths} Month{roiMonths > 1 ? 's' : ''}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: G }}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 4 }}>ROI</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2ecc71' }}>+{(parseFloat(selectedPlan.roi) * roiMonths).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <Link href={'/dashboard/deposit?plan=' + selectedPlan.name.toLowerCase().replace(/\s/g, '-')}>
              <button style={{ width: '100%', marginTop: 16, padding: '14px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 6px 20px rgba(201,168,76,.25)' }}>
                Start Investing ${amount > 0 ? amount.toLocaleString() : '0'} →
              </button>
            </Link>
          </div>
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#2a3140', lineHeight: 1.7 }}>Disclaimer: ROI calculations are estimates based on historical performance. Actual returns may vary. All investments carry risk.</div>
          </div>
        </div>
      )}
    </div>
  )
}
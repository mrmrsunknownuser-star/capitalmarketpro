// @ts-nocheck
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

var INVEST_DATA = {
  crypto: {
    name: 'Crypto Investment', icon: '₿', color: '#F7931A', bg: 'rgba(247,147,26,.1)',
    desc: 'Invest in Bitcoin, Ethereum, Solana and 50+ top cryptocurrencies. Our AI-powered crypto strategies deliver consistent monthly returns with automatic rebalancing and 24/7 market monitoring.',
    stats: [{ label: 'Min. Investment', val: '$50' }, { label: 'Max. Returns', val: '8%/mo' }, { label: 'Active Investors', val: '42,000+' }, { label: 'Avg. Monthly ROI', val: '4.5%' }],
    assets: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD', 'DOGE/USD'],
    plans: [
      { name: 'Crypto Starter', roi: '2.0', min: 50, max: 300, duration: '30 days', color: '#3498db', popular: false, features: ['BTC & ETH exposure', 'Daily profit updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'Crypto Growth', roi: '3.5', min: 300, max: 1500, duration: '30 days', color: '#F7931A', popular: true, features: ['Top 10 crypto basket', 'Daily profit updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'Crypto Premium', roi: '5.5', min: 1500, max: 7500, duration: '30 days', color: '#9b59b6', popular: false, features: ['Full crypto portfolio', 'Real-time analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Crypto Elite', roi: '8.0', min: 7500, max: 30000, duration: '30 days', color: '#C9A84C', popular: false, features: ['Institutional grade', 'Custom strategy', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  stocks: {
    name: 'Stock Investment', icon: '📈', color: '#2ecc71', bg: 'rgba(46,204,113,.1)',
    desc: 'Invest in Tesla, Apple, NVIDIA, Amazon and 200+ global equities. Our professional stock desk manages your portfolio with proven long-term and short-term strategies backed by fundamental and technical analysis.',
    stats: [{ label: 'Min. Investment', val: '$100' }, { label: 'Max. Returns', val: '6%/mo' }, { label: 'Active Investors', val: '38,000+' }, { label: 'Avg. Monthly ROI', val: '3.5%' }],
    assets: ['TSLA', 'AAPL', 'NVDA', 'AMZN', 'META', 'MSFT', 'GOOGL'],
    plans: [
      { name: 'Stock Starter', roi: '1.5', min: 100, max: 500, duration: '30 days', color: '#3498db', popular: false, features: ['Top 5 US stocks', 'Weekly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'Stock Growth', roi: '2.5', min: 500, max: 2000, duration: '30 days', color: '#2ecc71', popular: true, features: ['Top 20 US stocks', 'Daily updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'Stock Premium', roi: '4.0', min: 2000, max: 10000, duration: '30 days', color: '#9b59b6', popular: false, features: ['Global stock basket', 'Real-time analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Stock Elite', roi: '6.0', min: 10000, max: 50000, duration: '30 days', color: '#C9A84C', popular: false, features: ['Institutional equity', 'Custom portfolio', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  forex: {
    name: 'Forex Investment', icon: '💱', color: '#3498db', bg: 'rgba(52,152,219,.1)',
    desc: 'Trade EUR/USD, GBP/USD, USD/JPY and 70+ currency pairs. Our expert forex desk uses AI-powered signals and technical analysis to maximize your currency trading returns with tight spreads and deep liquidity.',
    stats: [{ label: 'Min. Investment', val: '$100' }, { label: 'Max. Returns', val: '4.5%/mo' }, { label: 'Active Investors', val: '29,000+' }, { label: 'Avg. Monthly ROI', val: '2.5%' }],
    assets: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'USD/CHF'],
    plans: [
      { name: 'Forex Starter', roi: '1.0', min: 100, max: 1000, duration: '30 days', color: '#3498db', popular: false, features: ['Major pairs only', 'Weekly reports', 'Instant withdrawal', '24/7 support'] },
      { name: 'Forex Growth', roi: '2.0', min: 1000, max: 5000, duration: '30 days', color: '#2ecc71', popular: true, features: ['Major + minor pairs', 'Daily reports', 'Instant withdrawal', 'Account manager'] },
      { name: 'Forex Premium', roi: '3.1', min: 5000, max: 25000, duration: '30 days', color: '#9b59b6', popular: false, features: ['All currency pairs', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Forex Elite', roi: '4.5', min: 25000, max: 100000, duration: '30 days', color: '#C9A84C', popular: false, features: ['Institutional forex', 'Custom strategy', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  realestate: {
    name: 'Real Estate Investment', icon: '🏠', color: '#9b59b6', bg: 'rgba(155,89,182,.1)',
    desc: 'Invest in premium real estate portfolios without the complexity of property ownership. Our real estate fund provides stable, inflation-protected monthly returns from commercial and residential properties across the US and Europe.',
    stats: [{ label: 'Min. Investment', val: '$200' }, { label: 'Max. Returns', val: '5%/mo' }, { label: 'Active Investors', val: '18,000+' }, { label: 'Avg. Monthly ROI', val: '2.8%' }],
    assets: ['US-REIT', 'EU-PROPERTY', 'COMMERCIAL', 'RESIDENTIAL', 'INDUSTRIAL'],
    plans: [
      { name: 'RE Starter', roi: '1.2', min: 200, max: 1000, duration: '30 days', color: '#3498db', popular: false, features: ['Residential REITs', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'RE Growth', roi: '2.0', min: 1000, max: 5000, duration: '30 days', color: '#9b59b6', popular: true, features: ['Mixed property portfolio', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'RE Premium', roi: '3.5', min: 5000, max: 25000, duration: '30 days', color: '#e67e22', popular: false, features: ['Commercial + residential', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'RE Elite', roi: '5.0', min: 25000, max: 100000, duration: '30 days', color: '#C9A84C', popular: false, features: ['Institutional RE fund', 'Custom allocation', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  commodities: {
    name: 'Commodities Investment', icon: '🥇', color: '#e67e22', bg: 'rgba(230,126,34,.1)',
    desc: 'Invest in Gold, Silver, Crude Oil, Natural Gas and agricultural commodities. Commodities are historically the best hedge against inflation and market volatility, offering stable returns across all economic cycles.',
    stats: [{ label: 'Min. Investment', val: '$150' }, { label: 'Max. Returns', val: '3.5%/mo' }, { label: 'Active Investors', val: '12,000+' }, { label: 'Avg. Monthly ROI', val: '2.2%' }],
    assets: ['GOLD', 'SILVER', 'OIL/WTI', 'OIL/BRENT', 'NAT GAS', 'WHEAT', 'COPPER'],
    plans: [
      { name: 'Commodity Starter', roi: '0.8', min: 150, max: 1000, duration: '30 days', color: '#e67e22', popular: false, features: ['Gold & Silver exposure', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'Commodity Growth', roi: '1.5', min: 1000, max: 5000, duration: '30 days', color: '#C9A84C', popular: true, features: ['Full metals basket', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'Commodity Premium', roi: '2.5', min: 5000, max: 20000, duration: '30 days', color: '#e74c3c', popular: false, features: ['Metals + Energy basket', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Commodity Elite', roi: '3.5', min: 20000, max: 100000, duration: '30 days', color: '#C9A84C', popular: false, features: ['Full commodities fund', 'Custom allocation', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  indices: {
    name: 'Indices Investment', icon: '📉', color: '#1abc9c', bg: 'rgba(26,188,156,.1)',
    desc: 'Trade the world\'s most recognized indices including S&P 500, NASDAQ 100, FTSE 100, DAX 40 and Nikkei 225. Index investing gives you diversified exposure to entire economies with lower risk than individual stocks.',
    stats: [{ label: 'Min. Investment', val: '$250' }, { label: 'Max. Returns', val: '3%/mo' }, { label: 'Active Investors', val: '9,000+' }, { label: 'Avg. Monthly ROI', val: '1.8%' }],
    assets: ['SPX500', 'NASDAQ100', 'FTSE100', 'DAX40', 'NIKKEI225', 'DOW JONES'],
    plans: [
      { name: 'Index Starter', roi: '0.7', min: 250, max: 1500, duration: '30 days', color: '#1abc9c', popular: false, features: ['US indices only', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'Index Growth', roi: '1.3', min: 1500, max: 6000, duration: '30 days', color: '#3498db', popular: true, features: ['US + EU indices', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'Index Premium', roi: '2.0', min: 6000, max: 25000, duration: '30 days', color: '#9b59b6', popular: false, features: ['Global indices basket', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'Index Elite', roi: '3.0', min: 25000, max: 150000, duration: '30 days', color: '#C9A84C', popular: false, features: ['Institutional index fund', 'Custom weighting', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  etf: {
    name: 'ETF Fund Investment', icon: '🗂', color: '#e74c3c', bg: 'rgba(231,76,60,.1)',
    desc: 'Exchange Traded Funds offer the ultimate in diversification. Our curated ETF portfolios cover technology, healthcare, energy and emerging markets. Perfect for broad market exposure with professional management.',
    stats: [{ label: 'Min. Investment', val: '$500' }, { label: 'Max. Returns', val: '2.5%/mo' }, { label: 'Active Investors', val: '7,500+' }, { label: 'Avg. Monthly ROI', val: '1.5%' }],
    assets: ['SPY', 'QQQ', 'VTI', 'ARKK', 'GLD', 'TLT', 'IWM'],
    plans: [
      { name: 'ETF Starter', roi: '0.6', min: 500, max: 2000, duration: '30 days', color: '#e74c3c', popular: false, features: ['Core ETF basket', 'Monthly updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'ETF Growth', roi: '1.2', min: 2000, max: 8000, duration: '30 days', color: '#C9A84C', popular: true, features: ['Diversified ETF mix', 'Weekly updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'ETF Premium', roi: '1.8', min: 8000, max: 30000, duration: '30 days', color: '#9b59b6', popular: false, features: ['Sector + thematic ETFs', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'ETF Elite', roi: '2.5', min: 30000, max: 200000, duration: '30 days', color: '#C9A84C', popular: false, features: ['Institutional ETF fund', 'Custom sector mix', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
  defi: {
    name: 'DeFi Investment', icon: '⛓', color: '#8e44ad', bg: 'rgba(142,68,173,.1)',
    desc: 'Decentralized Finance represents the future of money. Our DeFi strategies include yield farming, liquidity provision, staking and automated market making across the top protocols. Highest risk, highest reward category.',
    stats: [{ label: 'Min. Investment', val: '$100' }, { label: 'Max. Returns', val: '12%/mo' }, { label: 'Active Investors', val: '15,000+' }, { label: 'Avg. Monthly ROI', val: '6.5%' }],
    assets: ['UNI/USD', 'AAVE/USD', 'COMP/USD', 'MKR/USD', 'SNX/USD', 'YFI/USD'],
    plans: [
      { name: 'DeFi Starter', roi: '3.0', min: 100, max: 500, duration: '30 days', color: '#3498db', popular: false, features: ['Stablecoin farming', 'Daily updates', 'Instant withdrawal', '24/7 support'] },
      { name: 'DeFi Growth', roi: '5.5', min: 500, max: 2500, duration: '30 days', color: '#8e44ad', popular: true, features: ['Multi-protocol farming', 'Daily updates', 'Instant withdrawal', 'Account manager'] },
      { name: 'DeFi Premium', roi: '8.0', min: 2500, max: 10000, duration: '30 days', color: '#e74c3c', popular: false, features: ['Advanced yield strategies', 'Live analytics', 'Instant withdrawal', 'Priority support'] },
      { name: 'DeFi Elite', roi: '12.0', min: 10000, max: 50000, duration: '30 days', color: '#C9A84C', popular: false, features: ['Institutional DeFi desk', 'Custom strategies', 'Instant withdrawal', 'Dedicated manager'] },
    ],
  },
}

var LIVE_PRICES = {
  'BTC/USD': { price: '94,820.00', chg: '+4.07%', up: true },
  'ETH/USD': { price: '3,240.00', chg: '+1.87%', up: true },
  'SOL/USD': { price: '148.20', chg: '+3.18%', up: true },
  'BNB/USD': { price: '412.30', chg: '+1.33%', up: true },
  'XRP/USD': { price: '0.612', chg: '+2.44%', up: true },
  'ADA/USD': { price: '0.445', chg: '+1.92%', up: true },
  'DOGE/USD': { price: '0.128', chg: '-0.54%', up: false },
  'TSLA': { price: '248.50', chg: '+3.42%', up: true },
  'AAPL': { price: '189.30', chg: '+1.21%', up: true },
  'NVDA': { price: '875.20', chg: '+4.11%', up: true },
  'AMZN': { price: '182.40', chg: '+0.87%', up: true },
  'META': { price: '512.60', chg: '+2.34%', up: true },
  'MSFT': { price: '420.80', chg: '+0.92%', up: true },
  'GOOGL': { price: '164.30', chg: '+1.05%', up: true },
  'EUR/USD': { price: '1.0842', chg: '+0.12%', up: true },
  'GBP/USD': { price: '1.2634', chg: '+0.08%', up: true },
  'USD/JPY': { price: '151.42', chg: '-0.21%', up: false },
  'AUD/USD': { price: '0.6521', chg: '+0.15%', up: true },
  'USD/CAD': { price: '1.3612', chg: '-0.09%', up: false },
  'NZD/USD': { price: '0.6012', chg: '+0.22%', up: true },
  'USD/CHF': { price: '0.8941', chg: '-0.05%', up: false },
  'GOLD': { price: '2,318.40', chg: '+0.64%', up: true },
  'SILVER': { price: '27.82', chg: '+1.12%', up: true },
  'OIL/WTI': { price: '82.40', chg: '-0.31%', up: false },
  'OIL/BRENT': { price: '86.20', chg: '-0.18%', up: false },
  'NAT GAS': { price: '2.14', chg: '+0.94%', up: true },
  'WHEAT': { price: '548.00', chg: '-0.72%', up: false },
  'COPPER': { price: '4.42', chg: '+1.34%', up: true },
  'SPX500': { price: '5,234.00', chg: '+0.92%', up: true },
  'NASDAQ100': { price: '18,420.00', chg: '+1.14%', up: true },
  'FTSE100': { price: '7,842.00', chg: '+0.34%', up: true },
  'DAX40': { price: '17,890.00', chg: '+0.52%', up: true },
  'NIKKEI225': { price: '38,240.00', chg: '+0.88%', up: true },
  'DOW JONES': { price: '38,940.00', chg: '+0.44%', up: true },
  'SPY': { price: '524.30', chg: '+0.91%', up: true },
  'QQQ': { price: '448.70', chg: '+1.12%', up: true },
  'VTI': { price: '244.50', chg: '+0.78%', up: true },
  'ARKK': { price: '48.20', chg: '+2.14%', up: true },
  'GLD': { price: '213.40', chg: '+0.62%', up: true },
  'TLT': { price: '96.80', chg: '-0.34%', up: false },
  'IWM': { price: '198.60', chg: '+1.02%', up: true },
  'UNI/USD': { price: '8.42', chg: '+3.21%', up: true },
  'AAVE/USD': { price: '88.40', chg: '+2.87%', up: true },
  'COMP/USD': { price: '54.20', chg: '+1.54%', up: true },
  'MKR/USD': { price: '1840.00', chg: '+4.12%', up: true },
  'SNX/USD': { price: '2.84', chg: '+1.92%', up: true },
  'YFI/USD': { price: '6240.00', chg: '+2.44%', up: true },
  'US-REIT': { price: '42.80', chg: '+0.54%', up: true },
  'EU-PROPERTY': { price: '38.40', chg: '+0.32%', up: true },
  'COMMERCIAL': { price: '58.20', chg: '+0.48%', up: true },
  'RESIDENTIAL': { price: '31.60', chg: '+0.41%', up: true },
  'INDUSTRIAL': { price: '64.80', chg: '+0.62%', up: true },
}

export default function InvestDetailPage() {
  var params = useParams()
  var router = useRouter()
  var type = params.type
  var data = INVEST_DATA[type]

  var [activeTab, setActiveTab] = useState('plans')
  var [roiAmount, setRoiAmount] = useState('1000')
  var [roiPlan, setRoiPlan] = useState(0)
  var [roiMonths, setRoiMonths] = useState(1)
  var [tradeType, setTradeType] = useState('buy')
  var [selectedAsset, setSelectedAsset] = useState('')
  var [tradeAmount, setTradeAmount] = useState('')
  var [leverage, setLeverage] = useState('1')
  var [stopLoss, setStopLoss] = useState('')
  var [takeProfit, setTakeProfit] = useState('')
  var [placing, setPlacing] = useState(false)
  var [placed, setPlaced] = useState(false)

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#060a0e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 8 }}>Coming Soon</div>
        <div style={{ fontSize: 14, color: '#4a5568', marginBottom: 24, textAlign: 'center' }}>This investment type is being set up. Check back soon.</div>
        <button onClick={function() { router.back() }} style={{ padding: '12px 28px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Go Back</button>
      </div>
    )
  }

  var currentAsset = selectedAsset || (data.assets && data.assets[0]) || 'BTC/USD'
  var liveData = LIVE_PRICES[currentAsset] || { price: '0.00', chg: '+0.00%', up: true }
  var selectedPlan = data.plans[roiPlan]
  var roiInputAmount = parseFloat(roiAmount) || 0
  var monthlyReturn = roiInputAmount * (parseFloat(selectedPlan.roi) / 100)
  var totalReturn = monthlyReturn * roiMonths
  var totalValue = roiInputAmount + totalReturn
  var tradeInputAmount = parseFloat(tradeAmount) || 0
  var leverageNum = parseFloat(leverage) || 1
  var exposure = tradeInputAmount * leverageNum

  async function placeTrade() {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) return
    setPlacing(true)
    await new Promise(function(r) { setTimeout(r, 2500) })
    setPlacing(false)
    setPlaced(true)
  }

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}'}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,' + data.color + '15,' + data.color + '05)', borderBottom: '1px solid ' + data.color + '20', padding: '56px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <button onClick={function() { router.back() }} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#8892a0' }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: data.bg, border: '2px solid ' + data.color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{data.icon}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#e8edf5' }}>{data.name}</div>
              <div style={{ fontSize: 12, color: data.color, fontWeight: 600, marginTop: 2 }}>Returns up to {data.plans[data.plans.length - 1].roi}% monthly</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {data.stats.map(function(stat) {
            return (
              <div key={stat.label} style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 5 }}>{stat.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: data.color }}>{stat.val}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div style={{ margin: '14px 16px 0', background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '16px 18px' }}>
        <div style={{ fontSize: 13, color: '#8892a0', lineHeight: 1.8 }}>{data.desc}</div>
      </div>

      {/* Trust badges */}
      <div style={{ margin: '10px 16px 0', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {['🔒 Funds Protected', '⚡ Instant Withdrawal', '📊 Daily Reports', '👤 Account Manager'].map(function(badge) {
          return (
            <div key={badge} style={{ flexShrink: 0, background: '#0d1117', border: '1px solid #1e2530', borderRadius: 100, padding: '6px 12px', fontSize: 11, color: '#8892a0', whiteSpace: 'nowrap' }}>
              {badge}
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div style={{ margin: '14px 16px 0', display: 'flex', gap: 8 }}>
        {[['plans', '📋 Plans'], ['calculator', '🧮 Calculator'], ['trade', '📡 Live Trade']].map(function(tab) {
          return (
            <button key={tab[0]} onClick={function() { setActiveTab(tab[0]) }} style={{ flex: 1, padding: '11px 4px', borderRadius: 12, border: activeTab === tab[0] ? 'none' : '1px solid #1e2530', background: activeTab === tab[0] ? GG : '#0d1117', color: activeTab === tab[0] ? '#060a0e' : '#4a5568', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {tab[1]}
            </button>
          )
        })}
      </div>

      {/* ── PLANS TAB ── */}
      {activeTab === 'plans' && (
        <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.plans.map(function(plan) {
            return (
              <div key={plan.name} style={{ background: '#0d1117', border: '1px solid ' + (plan.popular ? 'rgba(201,168,76,.5)' : '#1e2530'), borderRadius: 20, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,' + plan.color + ',' + plan.color + '20)' }} />
                {plan.popular && <div style={{ position: 'absolute', top: -1, right: 20, background: GG, color: '#060a0e', fontSize: 9, fontWeight: 800, padding: '4px 14px', borderRadius: '0 0 10px 10px' }}>MOST POPULAR</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#e8edf5', marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 11, color: '#4a5568' }}>Min ${plan.min.toLocaleString()} — Max ${plan.max.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: plan.popular ? G : plan.color, lineHeight: 1 }}>{plan.roi}%</div>
                    <div style={{ fontSize: 10, color: '#4a5568', marginTop: 3 }}>per month</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {plan.features.map(function(feat) {
                    return (
                      <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#8892a0' }}>
                        <span style={{ color: '#2ecc71', fontSize: 12, flexShrink: 0 }}>✓</span>{feat}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, padding: '12px 14px', background: '#141920', borderRadius: 12, fontSize: 13 }}>
                  <span style={{ color: '#4a5568' }}>Duration: <strong style={{ color: '#e8edf5' }}>{plan.duration}</strong></span>
                  <span style={{ color: '#4a5568' }}>Min: <strong style={{ color: G }}>${plan.min.toLocaleString()}</strong></span>
                </div>
                <div style={{ background: plan.popular ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.02)', border: '1px solid ' + (plan.popular ? 'rgba(201,168,76,.15)' : 'rgba(255,255,255,.04)'), borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 3 }}>Monthly on min deposit</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#2ecc71' }}>+${(plan.min * parseFloat(plan.roi) / 100).toFixed(2)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 3 }}>After 3 months</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: G }}>${(plan.min + plan.min * parseFloat(plan.roi) / 100 * 3).toFixed(2)}</div>
                  </div>
                </div>
                <Link href={'/dashboard/deposit?plan=' + encodeURIComponent(plan.name)}>
                  <button style={{ width: '100%', padding: '14px', background: plan.popular ? GG : 'transparent', border: plan.popular ? 'none' : '1px solid rgba(201,168,76,.35)', borderRadius: 12, color: plan.popular ? '#060a0e' : G, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: plan.popular ? '0 6px 20px rgba(201,168,76,.25)' : 'none' }}>
                    {plan.popular ? '🚀 Invest Now →' : 'Invest Now →'}
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CALCULATOR TAB ── */}
      {activeTab === 'calculator' && (
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, padding: '24px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5', marginBottom: 18 }}>ROI Calculator</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Investment Amount (USD)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4a5568', fontSize: 18, fontWeight: 700 }}>$</span>
                <input type="number" value={roiAmount} onChange={function(e) { setRoiAmount(e.target.value) }} style={{ width: '100%', background: '#141920', border: '1.5px solid #1e2530', borderRadius: 12, padding: '14px 14px 14px 36px', color: '#e8edf5', fontSize: 20, fontWeight: 800, outline: 'none', fontFamily: 'Inter, sans-serif' }} onFocus={function(e) { e.target.style.borderColor = G }} onBlur={function(e) { e.target.style.borderColor = '#1e2530' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {['500', '1000', '5000', '10000'].map(function(val) {
                  return <button key={val} onClick={function() { setRoiAmount(val) }} style={{ flex: 1, padding: '7px 4px', borderRadius: 9, border: '1px solid ' + (roiAmount === val ? 'rgba(201,168,76,.4)' : '#1e2530'), background: roiAmount === val ? 'rgba(201,168,76,.1)' : '#141920', color: roiAmount === val ? G : '#4a5568', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>${parseInt(val).toLocaleString()}</button>
                })}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Select Plan</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.plans.map(function(plan, i) {
                  return (
                    <button key={i} onClick={function() { setRoiPlan(i) }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', background: roiPlan === i ? 'rgba(201,168,76,.08)' : '#141920', border: '1.5px solid ' + (roiPlan === i ? 'rgba(201,168,76,.5)' : '#1e2530'), borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: roiPlan === i ? '#e8edf5' : '#8892a0' }}>{plan.name}</span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: roiPlan === i ? G : '#4a5568' }}>{plan.roi}%/mo</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Duration: {roiMonths} Month{roiMonths > 1 ? 's' : ''}</label>
              <input type="range" min="1" max="12" value={roiMonths} onChange={function(e) { setRoiMonths(parseInt(e.target.value)) }} style={{ width: '100%', accentColor: G, height: 5 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4a5568', marginTop: 5 }}>
                <span>1 month</span><span>6 months</span><span>12 months</span>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,rgba(46,204,113,.06),rgba(201,168,76,.04))', border: '1px solid rgba(46,204,113,.15)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>📊 Estimated Returns</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ background: '#0d1117', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 5 }}>Monthly Profit</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#2ecc71' }}>${monthlyReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div style={{ background: '#0d1117', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 5 }}>Total Profit</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#2ecc71' }}>${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div style={{ background: '#0d1117', borderRadius: 12, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 5 }}>Total Value After {roiMonths} Month{roiMonths > 1 ? 's' : ''}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: G }}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 5 }}>Total ROI</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#2ecc71' }}>+{(parseFloat(selectedPlan.roi) * roiMonths).toFixed(1)}%</div>
                </div>
              </div>
            </div>
            <Link href={'/dashboard/deposit?plan=' + encodeURIComponent(selectedPlan.name)}>
              <button style={{ width: '100%', padding: '15px', background: roiInputAmount > 0 ? GG : '#141920', border: 'none', borderRadius: 12, color: roiInputAmount > 0 ? '#060a0e' : '#4a5568', fontSize: 15, fontWeight: 800, cursor: roiInputAmount > 0 ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', boxShadow: roiInputAmount > 0 ? '0 6px 20px rgba(201,168,76,.25)' : 'none' }}>
                {roiInputAmount > 0 ? 'Start Investing $' + roiInputAmount.toLocaleString() + ' →' : 'Enter an amount above'}
              </button>
            </Link>
          </div>
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#2a3140', lineHeight: 1.7 }}>⚠ Disclaimer: ROI calculations are estimates based on historical performance. Actual returns may vary. All investments carry risk.</div>
          </div>
        </div>
      )}

      {/* ── LIVE TRADE TAB ── */}
      {activeTab === 'trade' && (
        <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {placed ? (
            <div style={{ background: '#0d1117', border: '1px solid rgba(46,204,113,.3)', borderRadius: 20, padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{tradeType === 'buy' ? '📈' : '📉'}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5', marginBottom: 8 }}>Trade Placed Successfully!</div>
              <div style={{ fontSize: 13, color: '#8892a0', lineHeight: 1.7, marginBottom: 20 }}>Your {tradeType.toUpperCase()} order for {currentAsset} has been submitted and is being processed by our trading desk.</div>
              <div style={{ background: '#141920', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
                {[
                  { label: 'Asset', val: currentAsset },
                  { label: 'Direction', val: tradeType.toUpperCase(), color: tradeType === 'buy' ? '#2ecc71' : '#e74c3c' },
                  { label: 'Amount', val: '$' + parseFloat(tradeAmount).toLocaleString() },
                  { label: 'Leverage', val: leverage + 'x' },
                  { label: 'Exposure', val: '$' + exposure.toLocaleString('en-US', { minimumFractionDigits: 2 }) },
                  { label: 'Entry Price', val: '$' + liveData.price },
                ].map(function(item) {
                  return (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #1e2530', fontSize: 13 }}>
                      <span style={{ color: '#4a5568' }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.color || '#e8edf5' }}>{item.val}</span>
                    </div>
                  )
                })}
              </div>
              <button onClick={function() { setPlaced(false); setTradeAmount('') }} style={{ width: '100%', padding: '14px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Place Another Trade →
              </button>
            </div>
          ) : (
            <>
              {/* Asset selector with live prices */}
              <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>Select Asset</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 10, color: '#2ecc71', fontWeight: 600 }}>LIVE PRICES</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 14 }}>
                  {data.assets.map(function(a) {
                    var ld = LIVE_PRICES[a] || { price: '—', chg: '—', up: true }
                    return (
                      <div key={a} onClick={function() { setSelectedAsset(a) }} style={{ flexShrink: 0, background: currentAsset === a ? data.color + '20' : '#141920', border: '1.5px solid ' + (currentAsset === a ? data.color + '60' : '#1e2530'), borderRadius: 12, padding: '10px 14px', cursor: 'pointer', textAlign: 'center', minWidth: 90 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: currentAsset === a ? '#e8edf5' : '#8892a0', marginBottom: 3 }}>{a}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: ld.up ? '#2ecc71' : '#e74c3c' }}>{ld.chg}</div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#141920', borderRadius: 14, padding: '16px' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 5 }}>{currentAsset} — Live Price</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#e8edf5' }}>${liveData.price}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: liveData.up ? '#2ecc71' : '#e74c3c' }}>{liveData.chg}</div>
                    <div style={{ fontSize: 10, color: '#4a5568', marginTop: 3 }}>24h change</div>
                  </div>
                </div>
              </div>

              {/* Buy / Sell toggle */}
              <div style={{ display: 'flex', background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, overflow: 'hidden' }}>
                <button onClick={function() { setTradeType('buy') }} style={{ flex: 1, padding: '15px', border: 'none', background: tradeType === 'buy' ? 'rgba(46,204,113,.15)' : 'transparent', color: tradeType === 'buy' ? '#2ecc71' : '#4a5568', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', borderRight: '1px solid #1e2530', transition: 'all .2s' }}>
                  📈 BUY / LONG
                </button>
                <button onClick={function() { setTradeType('sell') }} style={{ flex: 1, padding: '15px', border: 'none', background: tradeType === 'sell' ? 'rgba(231,76,60,.15)' : 'transparent', color: tradeType === 'sell' ? '#e74c3c' : '#4a5568', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s' }}>
                  📉 SELL / SHORT
                </button>
              </div>

              {/* Trade form */}
              <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Amount */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Trade Amount (USD)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4a5568', fontSize: 18, fontWeight: 700 }}>$</span>
                    <input type="number" value={tradeAmount} onChange={function(e) { setTradeAmount(e.target.value) }} placeholder="0.00" style={{ width: '100%', background: '#141920', border: '1.5px solid #1e2530', borderRadius: 12, padding: '14px 14px 14px 36px', color: '#e8edf5', fontSize: 20, fontWeight: 800, outline: 'none', fontFamily: 'Inter, sans-serif' }} onFocus={function(e) { e.target.style.borderColor = tradeType === 'buy' ? '#2ecc71' : '#e74c3c' }} onBlur={function(e) { e.target.style.borderColor = '#1e2530' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {['100', '500', '1000', '5000'].map(function(val) {
                      return <button key={val} onClick={function() { setTradeAmount(val) }} style={{ flex: 1, padding: '7px 4px', borderRadius: 9, border: '1px solid #1e2530', background: '#141920', color: '#4a5568', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>${val}</button>
                    })}
                  </div>
                </div>

                {/* Leverage */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Leverage: {leverage}x</label>
                  <input type="range" min="1" max="100" value={leverage} onChange={function(e) { setLeverage(e.target.value) }} style={{ width: '100%', accentColor: tradeType === 'buy' ? '#2ecc71' : '#e74c3c', height: 5 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4a5568', marginTop: 5 }}>
                    <span>1x (No leverage)</span><span>50x</span><span>100x (Max)</span>
                  </div>
                </div>

                {/* Stop Loss & Take Profit */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Stop Loss ($)</label>
                    <input type="number" value={stopLoss} onChange={function(e) { setStopLoss(e.target.value) }} placeholder="Optional" style={{ width: '100%', background: '#141920', border: '1.5px solid #1e2530', borderRadius: 11, padding: '12px 14px', color: '#e8edf5', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }} onFocus={function(e) { e.target.style.borderColor = '#e74c3c' }} onBlur={function(e) { e.target.style.borderColor = '#1e2530' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8892a0', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Take Profit ($)</label>
                    <input type="number" value={takeProfit} onChange={function(e) { setTakeProfit(e.target.value) }} placeholder="Optional" style={{ width: '100%', background: '#141920', border: '1.5px solid #1e2530', borderRadius: 11, padding: '12px 14px', color: '#e8edf5', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }} onFocus={function(e) { e.target.style.borderColor = '#2ecc71' }} onBlur={function(e) { e.target.style.borderColor = '#1e2530' }} />
                  </div>
                </div>

                {/* Trade summary */}
                {tradeInputAmount > 0 && (
                  <div style={{ background: tradeType === 'buy' ? 'rgba(46,204,113,.06)' : 'rgba(231,76,60,.06)', border: '1px solid ' + (tradeType === 'buy' ? 'rgba(46,204,113,.2)' : 'rgba(231,76,60,.2)'), borderRadius: 14, padding: '16px' }}>
                    <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>Trade Summary</div>
                    {[
                      { label: 'Direction', val: tradeType.toUpperCase(), color: tradeType === 'buy' ? '#2ecc71' : '#e74c3c' },
                      { label: 'Amount', val: '$' + tradeInputAmount.toLocaleString() },
                      { label: 'Leverage', val: leverage + 'x' },
                      { label: 'Total Exposure', val: '$' + exposure.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: G },
                      { label: 'Entry Price', val: '$' + liveData.price },
                    ].map(function(item) {
                      return (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9, fontSize: 13 }}>
                          <span style={{ color: '#4a5568' }}>{item.label}</span>
                          <span style={{ fontWeight: 700, color: item.color || '#e8edf5' }}>{item.val}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Place trade button */}
                <button onClick={placeTrade} disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || placing} style={{ width: '100%', padding: '16px', background: !tradeAmount || parseFloat(tradeAmount) <= 0 ? '#141920' : tradeType === 'buy' ? 'linear-gradient(135deg,#27ae60,#2ecc71)' : 'linear-gradient(135deg,#c0392b,#e74c3c)', border: 'none', borderRadius: 14, color: !tradeAmount || parseFloat(tradeAmount) <= 0 ? '#4a5568' : '#fff', fontSize: 16, fontWeight: 800, cursor: !tradeAmount || parseFloat(tradeAmount) <= 0 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: tradeAmount && parseFloat(tradeAmount) > 0 ? '0 6px 20px rgba(0,0,0,.3)' : 'none' }}>
                  {placing ? (
                    <>
                      <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                      Placing Trade...
                    </>
                  ) : !tradeAmount || parseFloat(tradeAmount) <= 0 ? 'Enter amount to trade' : tradeType === 'buy' ? '📈 Place BUY Order →' : '📉 Place SELL Order →'}
                </button>
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: '#2a3140', lineHeight: 1.7 }}>⚠ Trading involves significant risk. Leverage amplifies both profits and losses. Never trade more than you can afford to lose. Past performance is not indicative of future results.</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

var SIGNALS = [
  { pair: 'BTC/USD', type: 'BUY', entry: '$94,200', tp: '$97,500', sl: '$92,800', confidence: 92, time: '2 mins ago', status: 'active', color: '#2ecc71', icon: '₿' },
  { pair: 'ETH/USD', type: 'BUY', entry: '$3,180', tp: '$3,420', sl: '$3,050', confidence: 88, time: '15 mins ago', status: 'active', color: '#2ecc71', icon: 'E' },
  { pair: 'EUR/USD', type: 'SELL', entry: '1.0862', tp: '1.0790', sl: '1.0910', confidence: 85, time: '32 mins ago', status: 'active', color: '#e74c3c', icon: '€' },
  { pair: 'TSLA', type: 'BUY', entry: '$246.50', tp: '$262.00', sl: '$238.00', confidence: 79, time: '1 hour ago', status: 'active', color: '#2ecc71', icon: 'T' },
  { pair: 'GBP/USD', type: 'SELL', entry: '1.2650', tp: '1.2540', sl: '1.2720', confidence: 83, time: '2 hours ago', status: 'closed', color: '#e74c3c', icon: '£' },
  { pair: 'GOLD', type: 'BUY', entry: '$2,308', tp: '$2,360', sl: '$2,280', confidence: 91, time: '3 hours ago', status: 'closed', color: '#2ecc71', icon: '🥇' },
  { pair: 'SOL/USD', type: 'BUY', entry: '$144.00', tp: '$158.00', sl: '$138.00', confidence: 76, time: '4 hours ago', status: 'closed', color: '#2ecc71', icon: 'S' },
  { pair: 'NVDA', type: 'BUY', entry: '$862.00', tp: '$910.00', sl: '$840.00', confidence: 87, time: '5 hours ago', status: 'closed', color: '#2ecc71', icon: 'N' },
]

export default function SignalPage() {
  var router = useRouter()
  var [filter, setFilter] = useState('all')
  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  var filtered = SIGNALS.filter(function(s) {
    if (filter === 'active') return s.status === 'active'
    if (filter === 'closed') return s.status === 'closed'
    return true
  })

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>

      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={function() { router.back() }} style={{ width: 38, height: 38, borderRadius: 12, background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#8892a0' }}>←</button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>Trading Signals</div>
          <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>AI-powered real-time signals</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ margin: '0 16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Active Signals', val: SIGNALS.filter(function(s) { return s.status === 'active' }).length, color: '#2ecc71' },
          { label: 'Win Rate', val: '84%', color: G },
          { label: 'Today\'s Signals', val: SIGNALS.length, color: '#3498db' },
        ].map(function(stat) {
          return (
            <div key={stat.label} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.val}</div>
              <div style={{ fontSize: 10, color: '#4a5568', marginTop: 4 }}>{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Alert banner */}
      <div style={{ margin: '0 16px 20px', background: 'rgba(46,204,113,.06)', border: '1px solid rgba(46,204,113,.2)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc71', flexShrink: 0, animation: 'pulse 2s infinite' }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2ecc71' }}>Signals are live and updating</div>
          <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>AI scans 200+ assets every 60 seconds for high-probability setups</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ margin: '0 16px 20px', display: 'flex', gap: 8 }}>
        {['all', 'active', 'closed'].map(function(f) {
          return (
            <button key={f} onClick={function() { setFilter(f) }} style={{ flex: 1, padding: '10px', borderRadius: 11, border: 'none', background: filter === f ? GG : '#0d1117', color: filter === f ? '#060a0e' : '#4a5568', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', border: filter === f ? 'none' : '1px solid #1e2530' }}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )
        })}
      </div>

      {/* Signals list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(function(sig, i) {
          return (
            <div key={i} style={{ background: '#0d1117', border: '1px solid ' + (sig.status === 'active' ? 'rgba(30,37,48,1)' : '#1e2530'), borderRadius: 18, padding: '18px', opacity: sig.status === 'closed' ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: sig.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: sig.color }}>
                    {sig.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5' }}>{sig.pair}</div>
                    <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>{sig.time}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, padding: '4px 12px', borderRadius: 100, background: sig.color + '20', color: sig.color }}>
                    {sig.type}
                  </div>
                  <div style={{ fontSize: 10, color: sig.status === 'active' ? '#2ecc71' : '#4a5568', fontWeight: 600 }}>
                    {sig.status === 'active' ? '● LIVE' : '○ Closed'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Entry', val: sig.entry, color: '#8892a0' },
                  { label: 'Take Profit', val: sig.tp, color: '#2ecc71' },
                  { label: 'Stop Loss', val: sig.sl, color: '#e74c3c' },
                ].map(function(item) {
                  return (
                    <div key={item.label} style={{ background: '#141920', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#4a5568', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{item.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.val}</div>
                    </div>
                  )
                })}
              </div>

              {/* Confidence bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
                  <span style={{ color: '#4a5568' }}>AI Confidence</span>
                  <span style={{ color: sig.confidence >= 85 ? '#2ecc71' : G, fontWeight: 700 }}>{sig.confidence}%</span>
                </div>
                <div style={{ height: 4, background: '#1e2530', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: sig.confidence + '%', height: '100%', background: sig.confidence >= 85 ? 'linear-gradient(90deg,#2ecc71,#27ae60)' : GG, borderRadius: 2 }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ margin: '20px 16px 0', background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, color: '#2a3140', lineHeight: 1.7 }}>Disclaimer: Trading signals are for informational purposes only. Past performance does not guarantee future results. Always trade responsibly.</div>
      </div>
      <style>{'@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }'}</style>
    </div>
  )
}
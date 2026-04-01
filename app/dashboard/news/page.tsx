'use client'

import { useState } from 'react'
import Link from 'next/link'

const NEWS = [
  { id: 1, tag: 'CRYPTO', title: 'Bitcoin surges past $67,000 as institutional demand reaches record levels', summary: 'Bitcoin has broken through the $67,000 resistance level as ETF inflows hit a new all-time high. Analysts predict continued upward momentum heading into Q2.', time: '2 hours ago', icon: '₿', color: '#F7A600', hot: true },
  { id: 2, tag: 'PLATFORM', title: 'CapitalMarket Pro processes $50M in client withdrawals this week', summary: 'Our automated system processed over $50 million in user withdrawals this week with an average processing time of 6 hours — a new platform record.', time: '4 hours ago', icon: '🏆', color: '#C9A84C', hot: false },
  { id: 3, tag: 'ETHEREUM', title: 'Ethereum upgrade boosts network capacity by 300%, ETH up 12%', summary: 'The latest Ethereum protocol upgrade has dramatically improved throughput and reduced gas fees, sparking a 12% price surge in the last 24 hours.', time: '6 hours ago', icon: 'Ξ', color: '#627EEA', hot: false },
  { id: 4, tag: 'STOCKS', title: 'NVIDIA hits new all-time high as AI chip demand remains insatiable', summary: "NVIDIA's stock closed at a new record high as data centers worldwide continue to expand AI infrastructure. The company's revenue grew 265% year-over-year.", time: '8 hours ago', icon: '📈', color: '#76B900', hot: false },
  { id: 5, tag: 'DEFI', title: 'DeFi total value locked surpasses $100 billion for first time in 2025', summary: 'The decentralized finance ecosystem has reclaimed the $100B TVL milestone, driven by new liquid staking protocols and institutional DeFi adoption.', time: '12 hours ago', icon: '🔗', color: '#7B2BF9', hot: false },
  { id: 6, tag: 'MACRO', title: 'Federal Reserve signals rate cuts as inflation cools to 2.1%', summary: 'Fed Chair signals potential rate cuts following inflation dropping to 2.1%, the lowest level since 2021. Markets rallied on the news with S&P 500 up 1.8%.', time: '1 day ago', icon: '🏦', color: '#0052FF', hot: false },
  { id: 7, tag: 'SOLANA', title: 'Solana network processes 100,000 TPS milestone in live test', summary: 'Solana developers have demonstrated 100,000 transactions per second in a controlled environment, paving the way for mass blockchain adoption.', time: '1 day ago', icon: '◎', color: '#9945FF', hot: false },
  { id: 8, tag: 'REGULATION', title: 'EU approves new crypto framework bringing clarity for 2025', summary: 'The European Union has passed comprehensive crypto regulation that provides clear guidelines for exchanges, DeFi platforms, and institutional investors.', time: '2 days ago', icon: '⚖️', color: '#3fb950', hot: false },
]

const CATEGORIES = ['All', 'Crypto', 'Stocks', 'Platform', 'DeFi', 'Macro', 'Regulation']

export default function NewsPage() {
  const [selectedCat, setSelectedCat] = useState('All')
  const [selectedNews, setSelectedNews] = useState<typeof NEWS[0] | null>(null)

  const filtered = NEWS.filter(n => selectedCat === 'All' || n.tag.toLowerCase() === selectedCat.toLowerCase())

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#060a0f' }}>C</div>
          <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CapitalMarket Pro News</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Market News</div>
        <div style={{ fontSize: 12, color: '#484f58' }}>Latest updates from global financial markets</div>
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, padding: '10px 14px', background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950' }} />
        <span style={{ fontSize: 11, color: '#3fb950', fontWeight: 700 }}>LIVE</span>
        <span style={{ fontSize: 11, color: '#8b949e' }}>Markets open · Updated every 5 minutes</span>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCat(cat)}
            style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${selectedCat === cat ? '#C9A84C' : '#21262d'}`, background: selectedCat === cat ? 'rgba(201,168,76,0.1)' : 'transparent', color: selectedCat === cat ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap', fontWeight: selectedCat === cat ? 700 : 400 }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Selected article */}
      {selectedNews && (
        <div style={{ background: '#0d1117', border: `1px solid ${selectedNews.color}33`, borderRadius: 16, padding: 22, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <span style={{ fontSize: 9, color: selectedNews.color, background: `${selectedNews.color}15`, border: `1px solid ${selectedNews.color}33`, padding: '3px 10px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.06em' }}>
              {selectedNews.tag}
            </span>
            <button onClick={() => setSelectedNews(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 6, color: '#8b949e', cursor: 'pointer', padding: '3px 8px', fontSize: 11 }}>✕ Close</button>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', lineHeight: 1.4, marginBottom: 14 }}>{selectedNews.title}</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 14 }}>{selectedNews.summary}</div>
          <div style={{ fontSize: 11, color: '#484f58' }}>🕐 {selectedNews.time} · CapitalMarket Pro News</div>
        </div>
      )}

      {/* News list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(item => (
          <div key={item.id} onClick={() => setSelectedNews(selectedNews?.id === item.id ? null : item)}
            style={{ background: '#0d1117', border: `1px solid ${selectedNews?.id === item.id ? item.color + '44' : '#161b22'}`, borderRadius: 14, padding: 18, cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' }}>
            {item.hot && (
              <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 9, color: '#f85149', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>🔥 HOT</div>
            )}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}18`, border: `1px solid ${item.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 9, color: item.color, background: `${item.color}15`, padding: '2px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.06em' }}>{item.tag}</span>
                  <span style={{ fontSize: 10, color: '#484f58' }}>{item.time}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', lineHeight: 1.4, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{selectedNews?.id === item.id ? '▲ Collapse' : '▼ Read more'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>📰 CapitalMarket Pro News</div>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved · News is for informational purposes only</div>
      </div>
    </div>
  )
}
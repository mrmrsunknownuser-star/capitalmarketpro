'use client'

import { useState } from 'react'

const NEWS = [
  {
    id: 1, category: 'crypto', tag: '🔥 Breaking', tagColor: '#f85149',
    title: 'Bitcoin Surges Past $67,000 as Institutional Demand Reaches All-Time High',
    summary: 'Bitcoin has broken through the $67,000 resistance level as institutional investors continue to pour capital into crypto ETFs. BlackRock and Fidelity Bitcoin ETFs collectively saw over $2.1 billion in inflows this week alone.',
    body: 'The crypto market is experiencing a significant bull run driven by institutional adoption at unprecedented scale. Major asset managers including BlackRock, Fidelity, and Vanguard have collectively accumulated over $48 billion in Bitcoin holdings through their newly approved ETFs. Analysts from Goldman Sachs project that Bitcoin could reach $100,000 by end of year if current institutional adoption rates continue. Our AI trading system has been capitalizing on this trend, generating exceptional returns for investors on our Gold and Platinum plans.',
    author: 'Marcus O. Sterling', time: '2 hours ago', readTime: '3 min', image: '₿',
  },
  {
    id: 2, category: 'platform', tag: '📢 Platform', tagColor: '#C9A84C',
    title: 'CapitalMarket Pro Achieves Record $2.4 Billion in Assets Under Management',
    summary: 'CapitalMarket Pro has reached a new milestone with over $2.4 billion in total assets under management, cementing our position as a leading AI-powered investment platform.',
    body: 'We are proud to announce that CapitalMarket Pro has surpassed $2.4 billion in assets under management across 150,000+ active traders in 60+ countries. This milestone reflects the trust our community places in our AI trading system and the consistent returns we\'ve delivered. Our top performers on the Black tier plan have seen returns exceeding 750% over their investment period. We continue to invest in our technology infrastructure to ensure the fastest execution speeds and most accurate signals in the industry.',
    author: 'Robert K. Hayes', time: '5 hours ago', readTime: '4 min', image: '🏆',
  },
  {
    id: 3, category: 'crypto', tag: '📈 Analysis', tagColor: '#3fb950',
    title: 'Ethereum ETH 2.0 Staking Yields Make It the Top Investment of 2025',
    summary: 'Ethereum staking yields have reached 12% annually as network adoption grows exponentially. Smart money is positioning heavily in ETH ahead of the next major protocol upgrade.',
    body: 'Ethereum continues to outperform expectations as the world\'s leading smart contract platform. With over 30 million ETH staked representing approximately 25% of total supply, the reduced circulating supply combined with growing DeFi demand is creating a supply squeeze. Our AI signals have identified ETH as a top momentum play with a 87% signal strength BUY rating. Investors on our Elite and Black plans have seen ETH positions return 45%+ over the past 90 days.',
    author: 'Sophia C. Laurent', time: '8 hours ago', readTime: '5 min', image: 'Ξ',
  },
  {
    id: 4, category: 'stocks', tag: '📊 Stocks', tagColor: '#0052FF',
    title: 'NVIDIA Breaks $900 as AI Infrastructure Spending Accelerates',
    summary: 'NVIDIA\'s stock has crossed $900 as hyperscalers announce another wave of GPU infrastructure spending totaling over $200 billion for 2025-2026.',
    body: 'The AI infrastructure boom shows no signs of slowing as NVIDIA continues to dominate the GPU market with over 85% market share in AI training chips. Microsoft, Google, Meta, and Amazon have all announced significant capital expenditure increases focused on AI infrastructure. Our stock trading signals have had NVIDIA as a strong BUY since $650, delivering over 38% returns to signal subscribers. The company\'s next earnings report is expected to show record revenues driven by continued demand for H100 and new B100 chips.',
    author: 'Marcus O. Sterling', time: '12 hours ago', readTime: '4 min', image: '🟢',
  },
  {
    id: 5, category: 'crypto', tag: '⚡ DeFi', tagColor: '#7B2BF9',
    title: 'Solana DeFi Volume Hits $48 Billion, Challenging Ethereum Dominance',
    summary: 'Solana\'s DeFi ecosystem has exploded with $48 billion in monthly trading volume, attracting a new wave of institutional DeFi activity away from Ethereum.',
    body: 'Solana has emerged as a serious contender to Ethereum\'s DeFi dominance with lightning-fast transaction speeds and sub-cent fees attracting billions in liquidity. Major protocols including Jupiter, Raydium, and Orca are posting record volumes. Our AI has assigned SOL a 92% signal strength BUY rating based on on-chain metrics showing accelerating active wallets and transaction volumes. Investors who entered SOL positions based on our signals in January are currently up over 180%.',
    author: 'Priya P. Sharma', time: '1 day ago', readTime: '3 min', image: '◎',
  },
  {
    id: 6, category: 'platform', tag: '💳 Feature', tagColor: '#C9A84C',
    title: 'New CapitalMarket Pro VISA Cards Now Available — Up to 7% Cashback',
    summary: 'We\'re excited to launch our new range of CapitalMarket Pro VISA cards featuring industry-leading cashback rates and worldwide acceptance.',
    body: 'CapitalMarket Pro is proud to launch our exclusive VISA card lineup, offering industry-leading cashback rates of up to 7% on all purchases worldwide. Our new card tiers — Standard Virtual, Premium Virtual, Elite Virtual, Gold Physical, and Titanium Physical — cater to every investor level. The Titanium card comes with unlimited spending, airport lounge access worldwide, and a personal banker. Card applications are now open — eligible investors can apply directly from the Cards section in your dashboard.',
    author: 'Amanda L. Brooks', time: '2 days ago', readTime: '3 min', image: '💳',
  },
  {
    id: 7, category: 'market', tag: '🌍 Macro', tagColor: '#8b949e',
    title: 'Federal Reserve Signals Potential Rate Cuts, Markets Rally 3.4%',
    summary: 'Fed Chair signals a more dovish stance, with markets pricing in three rate cuts for 2025. Both crypto and equity markets surged on the news.',
    body: 'Global markets rallied sharply after Federal Reserve statements signaled a potential shift toward rate cuts in 2025. Lower interest rates are historically bullish for both risk assets including crypto and growth stocks. Bitcoin jumped 8% while the NASDAQ gained 3.4% on the news. Our AI immediately adjusted portfolio positioning to capitalize on rate-sensitive assets, increasing exposure to tech stocks and crypto while reducing bond allocations. This is exactly the kind of macro event our AI is designed to identify and act on faster than human traders.',
    author: 'Daniel R. Okonkwo', time: '3 days ago', readTime: '5 min', image: '🌍',
  },
  {
    id: 8, category: 'platform', tag: '🎓 Education', tagColor: '#3fb950',
    title: 'How Our AI Generated 284% Returns for Top Investors in Q1 2025',
    summary: 'A deep dive into how CapitalMarket Pro\'s AI trading system achieved exceptional returns in Q1, including the specific strategies that drove alpha.',
    body: 'Q1 2025 was exceptional for CapitalMarket Pro investors, with our top Black tier investors achieving returns of up to 284%. The AI system executed over 2.4 million trades across crypto, stocks, and commodities — with a win rate of 84.2%. Key alpha drivers included early positioning in Bitcoin before the ETF approval surge, NVIDIA ahead of AI spending announcements, and tactical SOL positions during the DeFi volume explosion. Our risk management system prevented drawdowns from exceeding 12% even during volatile periods, protecting capital while maximizing upside capture.',
    author: 'Joshua C. Elder', time: '4 days ago', readTime: '6 min', image: '🤖',
  },
]

const CATEGORIES = [
  { id: 'all', label: '📰 All News' },
  { id: 'crypto', label: '₿ Crypto' },
  { id: 'stocks', label: '📈 Stocks' },
  { id: 'platform', label: '🏢 Platform' },
  { id: 'market', label: '🌍 Markets' },
]

export default function NewsPage() {
  const [category, setCategory] = useState('all')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = NEWS.filter(n => {
    const matchCat = category === 'all' || n.category === category
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Market News</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Curated financial news and platform updates</div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#484f58' }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news..."
          style={{ width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 14px 10px 38px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
          onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#21262d'} />
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${category === c.id ? '#C9A84C' : '#21262d'}`, background: category === c.id ? 'rgba(201,168,76,0.1)' : 'transparent', color: category === c.id ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: category === c.id ? 700 : 400, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Featured article */}
      {category === 'all' && !search && (
        <div onClick={() => setExpanded(expanded === NEWS[0].id ? null : NEWS[0].id)}
          style={{ background: 'linear-gradient(135deg,#0d1117,#161b22)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 18, padding: 24, marginBottom: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(201,168,76,0.06)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#f85149', background: 'rgba(248,81,73,0.15)', padding: '3px 10px', borderRadius: 20 }}>
              {NEWS[0].tag}
            </span>
            <span style={{ fontSize: 10, color: '#484f58' }}>FEATURED</span>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(247,166,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              {NEWS[0].image}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', lineHeight: 1.4, marginBottom: 8 }}>{NEWS[0].title}</div>
              <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7, marginBottom: 12 }}>{NEWS[0].summary}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ fontSize: 11, color: '#484f58' }}>By {NEWS[0].author} · {NEWS[0].time}</div>
                <div style={{ fontSize: 11, color: '#C9A84C' }}>{NEWS[0].readTime} read · {expanded === NEWS[0].id ? '▲ Less' : '▼ Read more'}</div>
              </div>
            </div>
          </div>

          {expanded === NEWS[0].id && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #21262d', fontSize: 13, color: '#8b949e', lineHeight: 1.9 }}>
              {NEWS[0].body}
            </div>
          )}
        </div>
      )}

      {/* News list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.slice(category === 'all' && !search ? 1 : 0).map(article => (
          <div key={article.id}
            onClick={() => setExpanded(expanded === article.id ? null : article.id)}
            style={{ background: '#0d1117', border: `1px solid ${expanded === article.id ? 'rgba(201,168,76,0.3)' : '#161b22'}`, borderRadius: 14, padding: 18, cursor: 'pointer' }}>

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Icon */}
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${article.tagColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {article.image}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: article.tagColor, background: `${article.tagColor}15`, padding: '2px 8px', borderRadius: 20 }}>
                    {article.tag}
                  </span>
                  <span style={{ fontSize: 10, color: '#484f58' }}>{article.time}</span>
                  <span style={{ fontSize: 10, color: '#484f58' }}>· {article.readTime} read</span>
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', lineHeight: 1.4, marginBottom: 8 }}>
                  {article.title}
                </div>

                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7, marginBottom: 10 }}>
                  {article.summary}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontSize: 11, color: '#484f58' }}>By {article.author}</div>
                  <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700 }}>
                    {expanded === article.id ? '▲ Show less' : '▼ Read full article'}
                  </div>
                </div>
              </div>
            </div>

            {/* Full article */}
            {expanded === article.id && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #161b22' }}>
                <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 16 }}>
                  {article.body}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button style={{ padding: '7px 16px', borderRadius: 20, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)', color: '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                    🔗 Share
                  </button>
                  <button style={{ padding: '7px 16px', borderRadius: 20, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                    🔖 Save
                  </button>
                  <a href="/dashboard/market" style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '7px 16px', borderRadius: 20, border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.06)', color: '#3fb950', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                      📈 Trade Now →
                    </button>
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
          <div style={{ fontSize: 14, color: '#484f58' }}>No articles found for "{search}"</div>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved · News for informational purposes only</div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const INITIAL_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: '#F7A600', price: 67240, change: 2.4, volume: '48.2B', mktCap: '1.32T', category: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627EEA', price: 3480, change: 1.8, volume: '22.1B', mktCap: '418B', category: 'crypto' },
  { symbol: 'SOL', name: 'Solana', icon: '◎', color: '#9945FF', price: 142.30, change: 5.2, volume: '6.8B', mktCap: '62B', category: 'crypto' },
  { symbol: 'BNB', name: 'BNB', icon: '●', color: '#F7A600', price: 412.80, change: -0.8, volume: '2.1B', mktCap: '63B', category: 'crypto' },
  { symbol: 'XRP', name: 'XRP', icon: '✕', color: '#346AA9', price: 0.624, change: 4.1, volume: '3.4B', mktCap: '35B', category: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', icon: '◆', color: '#0033AD', price: 0.482, change: 2.8, volume: '1.2B', mktCap: '17B', category: 'crypto' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð', color: '#C3A634', price: 0.162, change: 7.3, volume: '2.8B', mktCap: '23B', category: 'crypto' },
  { symbol: 'AVAX', name: 'Avalanche', icon: '▲', color: '#E84142', price: 38.40, change: -1.2, volume: '0.8B', mktCap: '15B', category: 'crypto' },
  { symbol: 'LINK', name: 'Chainlink', icon: '⬡', color: '#2A5ADA', price: 14.82, change: 3.5, volume: '0.6B', mktCap: '9B', category: 'crypto' },
  { symbol: 'DOT', name: 'Polkadot', icon: '●', color: '#E6007A', price: 7.24, change: 1.9, volume: '0.4B', mktCap: '10B', category: 'crypto' },
  { symbol: 'AAPL', name: 'Apple Inc.', icon: '🍎', color: '#555', price: 189.30, change: 0.8, volume: '58M', mktCap: '2.94T', category: 'stocks' },
  { symbol: 'TSLA', name: 'Tesla', icon: '⚡', color: '#CC0000', price: 248.50, change: -2.1, volume: '112M', mktCap: '790B', category: 'stocks' },
  { symbol: 'NVDA', name: 'NVIDIA', icon: '🟢', color: '#76B900', price: 875.40, change: 3.2, volume: '45M', mktCap: '2.16T', category: 'stocks' },
  { symbol: 'MSFT', name: 'Microsoft', icon: '🟦', color: '#00A4EF', price: 378.90, change: 1.1, volume: '22M', mktCap: '2.81T', category: 'stocks' },
  { symbol: 'AMZN', name: 'Amazon', icon: '📦', color: '#FF9900', price: 192.40, change: 2.4, volume: '32M', mktCap: '2.02T', category: 'stocks' },
  { symbol: 'GOOGL', name: 'Google', icon: '🔍', color: '#4285F4', price: 164.20, change: 1.7, volume: '18M', mktCap: '2.04T', category: 'stocks' },
  { symbol: 'META', name: 'Meta', icon: '👤', color: '#0668E1', price: 524.80, change: -0.5, volume: '14M', mktCap: '1.34T', category: 'stocks' },
  { symbol: 'GOLD', name: 'Gold', icon: '🥇', color: '#C9A84C', price: 2342.50, change: 0.4, volume: '142B', mktCap: '—', category: 'commodities' },
  { symbol: 'OIL', name: 'Crude Oil', icon: '🛢', color: '#333', price: 82.40, change: -1.3, volume: '78B', mktCap: '—', category: 'commodities' },
  { symbol: 'SILVER', name: 'Silver', icon: '🥈', color: '#8b949e', price: 27.80, change: 1.2, volume: '24B', mktCap: '—', category: 'commodities' },
]

export default function MarketPage() {
  const [assets, setAssets] = useState(INITIAL_ASSETS)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | 'crypto' | 'stocks' | 'commodities'>('all')
  const [sort, setSort] = useState<'default' | 'gainers' | 'losers' | 'volume'>('default')
  const [selected, setSelected] = useState<typeof INITIAL_ASSETS[0] | null>(null)
  const [tradeTab, setTradeTab] = useState<'buy' | 'sell'>('buy')
  const [tradeAmount, setTradeAmount] = useState('')
  const [leverage, setLeverage] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [tradeSuccess, setTradeSuccess] = useState('')
  const [balance, setBalance] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [cryptoAddresses, setCryptoAddresses] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: bal } = await supabase.from('balances').select('total_balance').eq('user_id', user.id).single()
      setBalance(bal?.total_balance || 0)
      const { data: addr } = await supabase.from('platform_settings').select('value').eq('key', 'crypto_addresses').single()
      if (addr?.value) setCryptoAddresses(addr.value)
    }
    init()

    // Live price updates
    intervalRef.current = setInterval(() => {
      setAssets(prev => prev.map(a => ({
        ...a,
        price: a.price * (1 + (Math.random() - 0.5) * 0.003),
        change: a.change + (Math.random() - 0.5) * 0.15,
      })))
    }, 2500)
    return () => clearInterval(intervalRef.current)
  }, [])

  const executeTrade = async () => {
    if (!selected || !tradeAmount || !userId) return
    const amt = parseFloat(tradeAmount)
    if (isNaN(amt) || amt <= 0) return
    setSubmitting(true)

    const supabase = createClient()
    const isWin = Math.random() > 0.38
    const profit = isWin ? amt * (0.08 + Math.random() * 0.12) : -(amt * (0.03 + Math.random() * 0.07))
    const profitFixed = parseFloat(profit.toFixed(2))

    await supabase.from('trades').insert({
      user_id: userId,
      asset: `${selected.symbol}/USD`,
      direction: tradeTab.toUpperCase(),
      amount: amt,
      leverage,
      profit: profitFixed,
      entry_price: selected.price,
      exit_price: selected.price * (1 + profit / amt),
      status: 'closed',
    }).select()

    const { data: bal } = await supabase.from('balances').select('total_balance, total_pnl').eq('user_id', userId).single()
    await supabase.from('balances').update({
      total_pnl: (bal?.total_pnl || 0) + profitFixed,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)

    setBalance(prev => prev + profitFixed)
    setTradeSuccess(isWin
      ? `✅ Trade closed: +$${profitFixed.toFixed(2)} profit!`
      : `📉 Trade closed: -$${Math.abs(profitFixed).toFixed(2)} loss`)
    setSubmitting(false)
    setTradeAmount('')
    setTimeout(() => setTradeSuccess(''), 4000)
  }

  let filtered = assets.filter(a => {
    const matchCat = category === 'all' || a.category === category
    const matchSearch = !search || a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (sort === 'gainers') filtered = [...filtered].sort((a, b) => b.change - a.change)
  if (sort === 'losers') filtered = [...filtered].sort((a, b) => a.change - b.change)

  const topGainers = [...assets].sort((a, b) => b.change - a.change).slice(0, 3)
  const btcAddr = cryptoAddresses.BTC || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>
      <style>{`
        .assets-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
        @media (min-width: 700px) { .assets-grid { grid-template-columns: repeat(3,1fr); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Markets</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950' }} />
            <span style={{ fontSize: 12, color: '#484f58' }}>Live prices · Updates every 2.5s</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#484f58', marginBottom: 2 }}>Balance</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#C9A84C' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Top gainers */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>🔥 Top Gainers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {topGainers.map(a => (
            <div key={a.symbol} onClick={() => setSelected(a)}
              style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: a.color }}>{a.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#3fb950' }}>+{a.change.toFixed(2)}%</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>{a.symbol}</div>
              <div style={{ fontSize: 11, color: '#484f58' }}>${a.price < 10 ? a.price.toFixed(4) : a.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade success */}
      {tradeSuccess && (
        <div style={{ background: tradeSuccess.startsWith('✅') ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', border: `1px solid ${tradeSuccess.startsWith('✅') ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: tradeSuccess.startsWith('✅') ? '#3fb950' : '#f85149', fontWeight: 700 }}>
          {tradeSuccess}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#484f58' }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..."
          style={{ width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 14px 10px 38px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
          onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#21262d'} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {[{ id: 'all', label: '🌐 All' }, { id: 'crypto', label: '₿ Crypto' }, { id: 'stocks', label: '📈 Stocks' }, { id: 'commodities', label: '🥇 Commodities' }].map(c => (
          <button key={c.id} onClick={() => setCategory(c.id as any)}
            style={{ padding: '7px 16px', borderRadius: 20, border: `1px solid ${category === c.id ? '#C9A84C' : '#21262d'}`, background: category === c.id ? 'rgba(201,168,76,0.1)' : 'transparent', color: category === c.id ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: category === c.id ? 700 : 400, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {c.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexShrink: 0 }}>
          {[{ id: 'gainers', l: '▲ Gainers' }, { id: 'losers', l: '▼ Losers' }].map(s => (
            <button key={s.id} onClick={() => setSort(sort === s.id ? 'default' : s.id as any)}
              style={{ padding: '7px 12px', borderRadius: 20, border: `1px solid ${sort === s.id ? '#C9A84C' : '#21262d'}`, background: sort === s.id ? 'rgba(201,168,76,0.1)' : 'transparent', color: sort === s.id ? '#C9A84C' : '#8b949e', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {s.l}
            </button>
          ))}
        </div>
      </div>

      {/* Assets list */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
        {filtered.map((asset, i) => (
          <div key={asset.symbol} onClick={() => setSelected(asset)}
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid #161b22' : 'none', gap: 12, cursor: 'pointer', background: selected?.symbol === asset.symbol ? 'rgba(201,168,76,0.04)' : 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = selected?.symbol === asset.symbol ? 'rgba(201,168,76,0.04)' : 'transparent'}>

            <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${asset.color}18`, border: `1px solid ${asset.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: asset.color, flexShrink: 0 }}>
              {asset.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{asset.symbol}</div>
              <div style={{ fontSize: 11, color: '#484f58' }}>{asset.name}</div>
            </div>

            <div style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontSize: 10, color: '#484f58', marginBottom: 2 }}>Vol</div>
              <div style={{ fontSize: 11, color: '#8b949e' }}>{asset.volume}</div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 3 }}>
                ${asset.price < 10 ? asset.price.toFixed(4) : asset.price.toFixed(2)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: asset.change >= 0 ? '#3fb950' : '#f85149', background: asset.change >= 0 ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', padding: '2px 8px', borderRadius: 20 }}>
                {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.change).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fund account / Manual trading section */}
      <div style={{ background: '#0d1117', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>💰 Fund Your Trading Account</div>
        <div style={{ fontSize: 12, color: '#484f58', marginBottom: 18 }}>Send Bitcoin to start trading with leverage up to 100x</div>

        <div onClick={() => { navigator.clipboard.writeText(btcAddr); setCopied(true); setTimeout(() => setCopied(false), 3000) }}
          style={{ background: '#161b22', border: `1px solid ${copied ? '#3fb950' : '#21262d'}`, borderRadius: 12, padding: 16, cursor: 'pointer', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>₿ Bitcoin Deposit Address</div>
          <div style={{ fontSize: 11, color: '#C9A84C', wordBreak: 'break-all', lineHeight: 1.7, fontFamily: 'monospace' }}>{btcAddr}</div>
          <div style={{ fontSize: 11, color: copied ? '#3fb950' : '#484f58', marginTop: 8, fontWeight: copied ? 700 : 400 }}>
            {copied ? '✅ Copied to clipboard!' : '📋 Tap to copy address'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Link href="/dashboard/deposit" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '12px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              ⬇ Deposit Funds
            </button>
          </Link>
          <Link href="/dashboard/invest" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '12px 0', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 12, color: '#C9A84C', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
              💹 Invest Plans
            </button>
          </Link>
        </div>
      </div>

      {/* Trade Modal */}
      {selected && (
        <div onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, fontFamily: 'monospace', maxHeight: '85vh', overflowY: 'auto', paddingBottom: 16 }}>

            {/* Asset header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #161b22' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${selected.color}18`, border: `1px solid ${selected.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: selected.color }}>
                    {selected.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3' }}>{selected.symbol}/USD</div>
                    <div style={{ fontSize: 12, color: '#484f58' }}>{selected.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3' }}>
                    ${selected.price < 10 ? selected.price.toFixed(4) : selected.price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: selected.change >= 0 ? '#3fb950' : '#f85149' }}>
                    {selected.change >= 0 ? '▲' : '▼'} {Math.abs(selected.change).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
                {[
                  { l: 'Market Cap', v: selected.mktCap },
                  { l: '24h Volume', v: selected.volume },
                  { l: 'Category', v: selected.category },
                ].map(s => (
                  <div key={s.l} style={{ background: '#161b22', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#484f58', marginBottom: 3, textTransform: 'uppercase' }}>{s.l}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', textTransform: 'capitalize' }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade form */}
            <div style={{ padding: '16px 20px' }}>

              {/* Buy/Sell tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 18, background: '#161b22', borderRadius: 12, padding: 4 }}>
                {['buy', 'sell'].map(t => (
                  <button key={t} onClick={() => setTradeTab(t as any)}
                    style={{ padding: '12px 0', borderRadius: 9, border: 'none', background: tradeTab === t ? (t === 'buy' ? '#3fb950' : '#f85149') : 'transparent', color: tradeTab === t ? '#fff' : '#484f58', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t === 'buy' ? '▲ Buy / Long' : '▼ Sell / Short'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trade Amount (USD)</label>
                <input type="number" value={tradeAmount} onChange={e => setTradeAmount(e.target.value)} placeholder="Enter amount..."
                  style={{ width: '100%', background: '#161b22', border: `1px solid ${tradeTab === 'buy' ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, borderRadius: 10, padding: '14px', color: tradeTab === 'buy' ? '#3fb950' : '#f85149', fontSize: 20, fontWeight: 800, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }} />
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {[100, 500, 1000, 5000].filter(v => v <= balance).map(v => (
                    <button key={v} onClick={() => setTradeAmount(v.toString())}
                      style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${tradeTab === 'buy' ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, background: 'transparent', color: tradeTab === 'buy' ? '#3fb950' : '#f85149', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leverage */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 11, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leverage</label>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#C9A84C' }}>{leverage}x</span>
                </div>
                <input type="range" min="1" max="100" value={leverage} onChange={e => setLeverage(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#C9A84C' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#484f58', marginTop: 4 }}>
                  <span>1x</span><span>25x</span><span>50x</span><span>100x</span>
                </div>
              </div>

              {/* Estimated */}
              {tradeAmount && parseFloat(tradeAmount) > 0 && (
                <div style={{ background: '#161b22', borderRadius: 10, padding: 14, marginBottom: 18 }}>
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 8, textTransform: 'uppercase' }}>Order Summary</div>
                  {[
                    { l: 'Position Size', v: `$${(parseFloat(tradeAmount) * leverage).toLocaleString()}` },
                    { l: 'Entry Price', v: `$${selected.price.toFixed(2)}` },
                    { l: 'Direction', v: tradeTab === 'buy' ? '▲ LONG' : '▼ SHORT' },
                    { l: 'Est. Profit (10%)', v: `+$${(parseFloat(tradeAmount) * leverage * 0.1).toFixed(2)}` },
                  ].map(item => (
                    <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #21262d' }}>
                      <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                      <span style={{ fontSize: 12, color: item.l.includes('Profit') ? '#3fb950' : '#e6edf3', fontWeight: 600 }}>{item.v}</span>
                    </div>
                  ))}
                </div>
              )}

              {tradeSuccess && (
                <div style={{ background: tradeSuccess.startsWith('✅') ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', border: `1px solid ${tradeSuccess.startsWith('✅') ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: tradeSuccess.startsWith('✅') ? '#3fb950' : '#f85149', fontWeight: 700 }}>
                  {tradeSuccess}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <button onClick={() => setSelected(null)} style={{ padding: '14px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>Cancel</button>
                <button onClick={executeTrade} disabled={submitting || !tradeAmount || parseFloat(tradeAmount) <= 0}
                  style={{ padding: '14px 0', borderRadius: 12, border: 'none', background: !tradeAmount || parseFloat(tradeAmount) <= 0 || submitting ? '#161b22' : tradeTab === 'buy' ? 'linear-gradient(135deg,#3fb950,#2ea043)' : 'linear-gradient(135deg,#f85149,#da3633)', color: !tradeAmount || parseFloat(tradeAmount) <= 0 || submitting ? '#484f58' : '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                  {submitting ? '⟳ Executing...' : tradeTab === 'buy' ? `▲ Buy ${selected.symbol}` : `▼ Sell ${selected.symbol}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
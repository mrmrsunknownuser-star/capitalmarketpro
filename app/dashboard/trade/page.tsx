'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const ASSETS = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 67240, icon: '₿', color: '#F7A600' },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 3480, icon: 'Ξ', color: '#627EEA' },
  { symbol: 'SOL/USD', name: 'Solana', price: 142.30, icon: '◎', color: '#9945FF' },
  { symbol: 'BNB/USD', name: 'BNB', price: 412.80, icon: '🟡', color: '#F7A600' },
  { symbol: 'XRP/USD', name: 'Ripple', price: 0.624, icon: '✕', color: '#346AA9' },
]

export default function TradePage() {
  const [tradeBalance, setTradeBalance] = useState(0)
  const [asset, setAsset] = useState(ASSETS[0])
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY')
  const [leverage, setLeverage] = useState(1)
  const [isTrading, setIsTrading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [tradeResult, setTradeResult] = useState<any>(null)
  const [prices, setPrices] = useState(ASSETS.map(a => ({ ...a, current: a.price, change: 0 })))
  const [history, setHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'trade' | 'fund'>('trade')
  const [fundAmount, setFundAmount] = useState('')
  const [fundMethod, setFundMethod] = useState('crypto')
  const [funded, setFunded] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState('BTC')
  const [copied, setCopied] = useState('')
  const [cryptoAddresses, setCryptoAddresses] = useState({
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fA32',
    USDT: 'TXkz2rQLJm7TFb1qJJHvxBEaJiFzPGx8Gq',
    BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
  })
  const timerRef = useRef<any>(null)
  const countRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bal } = await supabase.from('balances').select('*').eq('user_id', user.id).single()
      setTradeBalance(bal?.trading_balance || 0)
      const { data: addrData } = await supabase.from('platform_settings').select('value').eq('key', 'crypto_addresses').single()
      if (addrData?.value) setCryptoAddresses(addrData.value)
    }
    init()

    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => {
        const change = (Math.random() - 0.5) * 0.003
        const newPrice = p.current * (1 + change)
        return { ...p, current: newPrice, change: change * 100 }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const currentPrice = prices.find(p => p.symbol === asset.symbol)?.current || asset.price

  const handleFund = async () => {
    if (!fundAmount) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: '⏳ Trading Account Funding Request',
      message: `Your request to fund your trading account with $${fundAmount} via ${fundMethod === 'crypto' ? selectedCrypto : 'Apple Pay'} is pending admin approval.`,
      type: 'info',
    })
    setFunded(true)
  }

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > tradeBalance) return
    setIsTrading(true)
    setTradeResult(null)
    setCountdown(10)

    countRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    timerRef.current = setTimeout(() => {
      clearInterval(countRef.current)
      const won = Math.random() < 0.30
      const tradeAmt = parseFloat(amount) * leverage
      const profit = won
        ? tradeAmt * (0.05 + Math.random() * 0.15)
        : -(tradeAmt * (0.15 + Math.random() * 0.35))

      setTradeBalance(prev => Math.max(0, prev + profit))
      setHistory(prev => [{
        asset: asset.symbol,
        direction,
        amount: tradeAmt,
        profit,
        won,
        time: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 9)])

      setTradeResult({ won, profit, message: won ? `Trade successful! Your ${direction} position closed in profit.` : `Market moved against your position. Stop loss triggered.` })
      setIsTrading(false)
      setAmount('')
    }, 10000)
  }

  return (
    <div style={{ padding: '16px 16px 40px', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Manual Trading</div>
        <div style={{ fontSize: 12, color: '#484f58' }}>Trade crypto markets with leverage</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {[{ id: 'trade', label: '📊 Trade' }, { id: 'fund', label: '💰 Fund Account' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: activeTab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeTab === t.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: activeTab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TRADE TAB ── */}
      {activeTab === 'trade' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Live Prices */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Live Prices</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {prices.map(p => (
                <div key={p.symbol} onClick={() => setAsset(ASSETS.find(a => a.symbol === p.symbol) || asset)}
                  style={{ background: asset.symbol === p.symbol ? 'rgba(201,168,76,0.1)' : '#161b22', border: `1px solid ${asset.symbol === p.symbol ? '#C9A84C' : '#21262d'}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', flexShrink: 0, minWidth: 100, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>{p.symbol.split('/')[0]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>${p.current.toFixed(p.current < 10 ? 4 : 2)}</div>
                  <div style={{ fontSize: 10, color: p.change >= 0 ? '#3fb950' : '#f85149', marginTop: 2 }}>{p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{asset.symbol}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#C9A84C' }}>${currentPrice.toFixed(asset.price < 10 ? 4 : 2)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950' }} />
                <span style={{ fontSize: 11, color: '#3fb950', fontWeight: 700 }}>LIVE</span>
              </div>
            </div>
            <iframe
              src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${asset.symbol.replace('/', '')}&interval=1&hidesidetoolbar=1&hidetoptoolbar=0&theme=dark&style=1&locale=en&toolbar_bg=0d1117`}
              style={{ width: '100%', height: 260, border: 'none', display: 'block' }}
            />
          </div>

          {/* Trade Panel */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>

            {/* Balance */}
            <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Trading Balance</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#C9A84C' }}>${tradeBalance.toFixed(2)}</div>
              {tradeBalance === 0 && <div style={{ fontSize: 11, color: '#f85149', marginTop: 4 }}>Fund your account to start trading</div>}
            </div>

            {/* Direction */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {(['BUY', 'SELL'] as const).map(d => (
                <button key={d} onClick={() => setDirection(d)} style={{ padding: '13px 0', borderRadius: 10, border: `2px solid ${direction === d ? d === 'BUY' ? '#3fb950' : '#f85149' : '#21262d'}`, background: direction === d ? d === 'BUY' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)' : 'transparent', color: direction === d ? d === 'BUY' ? '#3fb950' : '#f85149' : '#484f58', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                  {d === 'BUY' ? '▲ BUY' : '▼ SELL'}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trade Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#30363d'}
              />
            </div>

            {/* Quick % */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['25%', '50%', '75%', '100%'].map(pct => (
                <button key={pct} onClick={() => setAmount((tradeBalance * parseInt(pct) / 100).toFixed(2))}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                  {pct}
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

            {/* Summary */}
            {amount && (
              <div style={{ background: '#161b22', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                {[
                  { l: 'Position Size', v: `$${(parseFloat(amount) * leverage).toFixed(2)}` },
                  { l: 'Asset', v: asset.symbol },
                  { l: 'Entry Price', v: `$${currentPrice.toFixed(2)}` },
                  { l: 'Direction', v: direction },
                ].map(item => (
                  <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#484f58' }}>{item.l}</span>
                    <span style={{ fontSize: 11, color: '#e6edf3', fontWeight: 600 }}>{item.v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trade Button */}
            <button
              onClick={handleTrade}
              disabled={isTrading || !amount || parseFloat(amount) <= 0 || tradeBalance === 0}
              style={{ width: '100%', padding: '15px 0', background: isTrading ? '#161b22' : direction === 'BUY' ? 'linear-gradient(135deg, #3fb950, #2ea043)' : 'linear-gradient(135deg, #f85149, #da3633)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 800, cursor: isTrading || !amount || tradeBalance === 0 ? 'not-allowed' : 'pointer', fontFamily: 'monospace', opacity: !amount || tradeBalance === 0 ? 0.4 : 1 }}>
              {isTrading ? (
                <span>⟳ Processing... {countdown}s</span>
              ) : tradeBalance === 0 ? 'Fund Account to Trade' : `${direction === 'BUY' ? '▲ Place BUY Order' : '▼ Place SELL Order'}`}
            </button>
          </div>

          {/* Trade Result */}
          {tradeResult && (
            <div style={{ background: tradeResult.won ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)', border: `1px solid ${tradeResult.won ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`, borderRadius: 14, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{tradeResult.won ? '🎯' : '📉'}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: tradeResult.won ? '#3fb950' : '#f85149', marginBottom: 6 }}>
                {tradeResult.won ? 'Trade Won!' : 'Trade Closed'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: tradeResult.won ? '#3fb950' : '#f85149', marginBottom: 8 }}>
                {tradeResult.profit >= 0 ? '+' : ''}{tradeResult.profit.toFixed(2)} USD
              </div>
              <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>{tradeResult.message}</div>
            </div>
          )}

          {/* Trade History */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Trade History</div>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#484f58', fontSize: 13 }}>No trades yet. Place your first trade!</div>
            ) : history.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < history.length - 1 ? '1px solid #161b22' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: h.direction === 'BUY' ? '#3fb950' : '#f85149', background: h.direction === 'BUY' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', padding: '3px 8px', borderRadius: 5 }}>{h.direction}</span>
                  <div>
                    <div style={{ fontSize: 12, color: '#e6edf3' }}>{h.asset}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>Size: ${h.amount.toFixed(2)} · {h.time}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: h.won ? '#3fb950' : '#f85149' }}>
                    {h.profit >= 0 ? '+' : ''}{h.profit.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>{h.won ? 'Win' : 'Loss'}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Demo note */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>
              📊 <strong style={{ color: '#e6edf3' }}>Demo Mode Active:</strong> Practice trading with simulated funds. Fund your account via the Fund Account tab to access real markets with real returns.
            </div>
          </div>
        </div>
      )}

      {/* ── FUND ACCOUNT TAB ── */}
      {activeTab === 'fund' && (
        <div>
          {funded ? (
            <div style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 14, padding: 32, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>⏳</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#3fb950', marginBottom: 10 }}>Funding Request Submitted!</div>
              <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 20 }}>
                Your request of <strong style={{ color: '#e6edf3' }}>${fundAmount}</strong> is pending admin approval.<br />
                You'll be notified within 1-2 hours once your trading account is funded and ready.
              </div>
              <div style={{ background: '#0d1117', borderRadius: 12, padding: 18, marginBottom: 20, textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C', marginBottom: 12 }}>⚠️ Important Next Steps:</div>
                {[
                  '1. Purchase the exact amount of crypto you specified',
                  '2. Send it to the address shown on this page',
                  '3. Keep your transaction ID / receipt',
                  '4. Admin will verify and approve within 1-2 hours',
                  '5. You will receive a notification when approved',
                  '6. Once approved, return here to start trading!',
                ].map((s, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#8b949e', marginBottom: 8, lineHeight: 1.6, display: 'flex', gap: 8 }}>
                    <span style={{ color: '#C9A84C', flexShrink: 0 }}>→</span>{s}
                  </div>
                ))}
              </div>
              <button onClick={() => setFunded(false)} style={{ padding: '11px 28px', borderRadius: 10, border: '1px solid #3fb950', background: 'transparent', color: '#3fb950', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
                ← Submit Another Request
              </button>
            </div>
          ) : (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>Fund Your Trading Account</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Select payment method and follow the steps below</div>

              {/* Method selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { id: 'crypto', label: '₿ Cryptocurrency', desc: 'BTC preferred · Most private', color: '#F7A600' },
                  { id: 'apple', label: '🍎 Apple Pay', desc: 'Instant · Encrypted', color: '#e6edf3' },
                ].map(m => (
                  <div key={m.id} onClick={() => setFundMethod(m.id)} style={{ background: fundMethod === m.id ? `${m.color}12` : '#161b22', border: `2px solid ${fundMethod === m.id ? m.color : '#21262d'}`, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: fundMethod === m.id ? m.color : '#e6edf3', marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>{m.desc}</div>
                  </div>
                ))}
              </div>

              {/* Privacy notice */}
              <div style={{ background: fundMethod === 'crypto' ? 'rgba(247,166,0,0.06)' : 'rgba(230,237,243,0.04)', border: `1px solid ${fundMethod === 'crypto' ? 'rgba(247,166,0,0.2)' : 'rgba(230,237,243,0.1)'}`, borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>
                  🔒 <strong style={{ color: '#e6edf3' }}>Why only {fundMethod === 'crypto' ? 'crypto' : 'Apple Pay'}?</strong> These payment methods ensure your trading activity is fully private and encrypted — your financial transactions cannot be monitored by banks or third parties.
                </div>
              </div>

              {/* Crypto section */}
              {fundMethod === 'crypto' && (
                <div>
                  <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Select Cryptocurrency:</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                    {Object.keys(cryptoAddresses).map(coin => (
                      <button key={coin} onClick={() => setSelectedCrypto(coin)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${selectedCrypto === coin ? '#C9A84C' : '#21262d'}`, background: selectedCrypto === coin ? 'rgba(201,168,76,0.1)' : 'transparent', color: selectedCrypto === coin ? '#C9A84C' : '#8b949e', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                        {coin} {coin === 'BTC' ? '⭐' : ''}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8, fontWeight: 600 }}>
                    Step 1 — Send {selectedCrypto} to this address:
                  </div>
                  <div onClick={() => { navigator.clipboard.writeText(cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]); setCopied(selectedCrypto); setTimeout(() => setCopied(''), 3000) }}
                    style={{ background: '#161b22', border: `1px solid ${copied === selectedCrypto ? '#3fb950' : '#21262d'}`, borderRadius: 12, padding: 16, marginBottom: 12, cursor: 'pointer' }}>
                    <div style={{ fontSize: 10, color: '#484f58', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {selectedCrypto} Deposit Address {selectedCrypto === 'BTC' ? '— Preferred' : ''}
                    </div>
                    <div style={{ fontSize: 12, color: '#C9A84C', wordBreak: 'break-all', lineHeight: 1.7, fontFamily: 'monospace' }}>
                      {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: copied === selectedCrypto ? '#3fb950' : '#C9A84C', fontWeight: 700 }}>
                      {copied === selectedCrypto ? '✅ Copied to clipboard!' : '📋 Tap to copy address'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, color: '#f85149', lineHeight: 1.7 }}>
                      ⚠️ Only send <strong>{selectedCrypto}</strong> to this address. Sending other assets = permanent loss.
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Buy {selectedCrypto} from:</div>
                  {[
                    { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', url: 'https://www.moonpay.com', tag: 'Popular' },
                    { name: 'Binance', icon: '🔶', color: '#F7A600', url: 'https://www.binance.com', tag: 'Low Fees' },
                    { name: 'Coinbase', icon: '🔵', color: '#0052FF', url: 'https://www.coinbase.com', tag: 'Trusted' },
                    { name: 'Paybis', icon: '💳', color: '#00C2FF', url: 'https://paybis.com', tag: 'Fast' },
                  ].map(p => (
                    <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: `${p.color}0a`, border: `1px solid ${p.color}33`, borderRadius: 10 }}>
                        <span style={{ fontSize: 20 }}>{p.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{p.name}</div>
                        </div>
                        <span style={{ fontSize: 9, color: p.color, background: `${p.color}18`, padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>{p.tag}</span>
                        <span style={{ fontSize: 12, color: p.color }}>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* Apple Pay section */}
              {fundMethod === 'apple' && (
                <div style={{ marginBottom: 20 }}>
                  {[
                    { name: 'Apple.com', icon: '🍎', color: '#e6edf3', url: 'https://www.apple.com/apple-pay/', desc: 'Official Apple Pay' },
                    { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', url: 'https://www.moonpay.com', desc: 'Crypto via Apple Pay' },
                    { name: 'Transak', icon: '🌐', color: '#C9A84C', url: 'https://transak.com', desc: 'Global Apple Pay gateway' },
                  ].map(p => (
                    <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: `${p.color}0a`, border: `1px solid ${p.color}33`, borderRadius: 10 }}>
                        <span style={{ fontSize: 20 }}>{p.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#484f58' }}>{p.desc}</div>
                        </div>
                        <span style={{ fontSize: 12, color: p.color }}>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* Step 2 notice */}
              <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C', marginBottom: 8 }}>Step 2 — Submit Funding Request</div>
                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>
                  After making your deposit, enter the exact USD amount you sent below and submit. Our admin team will verify your transaction and approve your trading account within 1-2 hours.
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount Deposited (USD equivalent)</label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={e => setFundAmount(e.target.value)}
                  placeholder="Min. $500 — Enter exact amount sent"
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'}
                  onBlur={e => e.target.style.borderColor = '#30363d'}
                />
              </div>

              <button onClick={handleFund} disabled={!fundAmount} style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', opacity: !fundAmount ? 0.5 : 1 }}>
                Submit Funding Request →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 32, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58', lineHeight: 1.7 }}>
          © 2025 CapitalMarket Pro Financial Services<br />
          All Rights Reserved · Trading involves risk
        </div>
      </div>

    </div>
  )
}
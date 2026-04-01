'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: '#F7A600', price: 67240 },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627EEA', price: 3480 },
  { symbol: 'SOL', name: 'Solana', icon: '◎', color: '#9945FF', price: 142.30 },
  { symbol: 'BNB', name: 'BNB', icon: '●', color: '#F7A600', price: 412.80 },
  { symbol: 'USDT', name: 'Tether', icon: '₮', color: '#26A17B', price: 1 },
  { symbol: 'ADA', name: 'Cardano', icon: '◆', color: '#0033AD', price: 0.482 },
]

const SIGNALS = [
  { asset: 'BTC/USD', type: 'BUY', entry: '$67,200', target: '$71,500', stop: '$65,000', strength: 92, time: '2m ago', status: 'active' },
  { asset: 'ETH/USD', type: 'BUY', entry: '$3,480', target: '$3,750', stop: '$3,300', strength: 87, time: '8m ago', status: 'active' },
  { asset: 'SOL/USD', type: 'SELL', entry: '$142', target: '$128', stop: '$148', strength: 74, time: '15m ago', status: 'active' },
  { asset: 'NVDA', type: 'BUY', entry: '$875', target: '$920', stop: '$850', strength: 78, time: '1h ago', status: 'active' },
  { asset: 'AAPL', type: 'HOLD', entry: '$189', target: '$195', stop: '$185', strength: 65, time: '2h ago', status: 'pending' },
  { asset: 'BNB/USD', type: 'BUY', entry: '$412', target: '$440', stop: '$395', strength: 81, time: '3h ago', status: 'active' },
]

export default function TradePage() {
  const [tab, setTab] = useState<'swap' | 'signals' | 'market'>('swap')
  const [fromAsset, setFromAsset] = useState(ASSETS[4]) // USDT
  const [toAsset, setToAsset] = useState(ASSETS[0]) // BTC
  const [fromAmount, setFromAmount] = useState('')
  const [swapping, setSwapping] = useState(false)
  const [swapDone, setSwapDone] = useState(false)
  const [prices, setPrices] = useState(ASSETS)

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(a => ({
        ...a,
        price: a.symbol === 'USDT' ? 1 : a.price * (1 + (Math.random() - 0.5) * 0.002),
      })))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const fromPrice = prices.find(a => a.symbol === fromAsset.symbol)?.price || fromAsset.price
  const toPrice = prices.find(a => a.symbol === toAsset.symbol)?.price || toAsset.price
  const toAmount = fromAmount ? ((parseFloat(fromAmount) * fromPrice) / toPrice).toFixed(6) : ''
  const exchangeRate = (fromPrice / toPrice).toFixed(6)

  const handleSwap = () => {
    if (!fromAmount) return
    setSwapping(true)
    setTimeout(() => {
      setSwapping(false)
      setSwapDone(true)
      setFromAmount('')
      setTimeout(() => setSwapDone(false), 4000)
    }, 2000)
  }

  const flipAssets = () => {
    const tmp = fromAsset
    setFromAsset(toAsset)
    setToAsset(tmp)
    setFromAmount('')
  }

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>
      <style>{`
        .trade-tab { padding: 9px 0; border-radius: 8px; border: none; font-size: 12px; cursor: pointer; font-family: monospace; flex: 1; }
      `}</style>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Trade</div>
        <div style={{ fontSize: 12, color: '#484f58' }}>Swap · Signals · Market</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {[{ id: 'swap', label: '🔄 Swap' }, { id: 'signals', label: '⚡ Signals' }, { id: 'market', label: '📊 Market' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className="trade-tab"
            style={{ background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SWAP ── */}
      {tab === 'swap' && (
        <div>
          {swapDone && (
            <div style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#3fb950', marginBottom: 2 }}>Swap Successful!</div>
                <div style={{ fontSize: 11, color: '#8b949e' }}>Transaction confirmed and processed</div>
              </div>
            </div>
          )}

          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#484f58', marginBottom: 16, textAlign: 'center' }}>Swap between assets instantly</div>

            {/* From */}
            <div style={{ background: '#161b22', borderRadius: 14, padding: '16px', marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>Balance: $0.00</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={e => setFromAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#e6edf3', fontSize: 26, fontWeight: 800, outline: 'none', fontFamily: 'monospace' }}
                  />
                  {fromAmount && <div style={{ fontSize: 11, color: '#484f58' }}>≈ ${(parseFloat(fromAmount) * fromPrice).toFixed(2)}</div>}
                </div>
                <select
                  value={fromAsset.symbol}
                  onChange={e => setFromAsset(ASSETS.find(a => a.symbol === e.target.value) || ASSETS[0])}
                  style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 14px', color: '#e6edf3', fontSize: 14, fontWeight: 700, outline: 'none', cursor: 'pointer', fontFamily: 'monospace' }}>
                  {ASSETS.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                </select>
              </div>
            </div>

            {/* Flip button */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <button onClick={flipAssets} style={{ width: 40, height: 40, borderRadius: '50%', background: '#161b22', border: '2px solid #21262d', color: '#C9A84C', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ⇅
              </button>
            </div>

            {/* To */}
            <div style={{ background: '#161b22', borderRadius: 14, padding: '16px', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</div>
                <div style={{ fontSize: 11, color: '#3fb950' }}>You receive</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#3fb950' }}>{toAmount || '0.00'}</div>
                  {toAmount && <div style={{ fontSize: 11, color: '#484f58' }}>≈ ${(parseFloat(toAmount) * toPrice).toFixed(2)}</div>}
                </div>
                <select
                  value={toAsset.symbol}
                  onChange={e => setToAsset(ASSETS.find(a => a.symbol === e.target.value) || ASSETS[1])}
                  style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 14px', color: '#e6edf3', fontSize: 14, fontWeight: 700, outline: 'none', cursor: 'pointer', fontFamily: 'monospace' }}>
                  {ASSETS.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                </select>
              </div>
            </div>

            {/* Rate */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #21262d', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#484f58' }}>Exchange Rate</span>
              <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 600 }}>1 {fromAsset.symbol} = {exchangeRate} {toAsset.symbol}</span>
            </div>

            <button onClick={handleSwap} disabled={swapping || !fromAmount}
              style={{ width: '100%', padding: '15px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 14, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: !fromAmount ? 'not-allowed' : 'pointer', fontFamily: 'monospace', opacity: !fromAmount ? 0.5 : 1 }}>
              {swapping ? '⟳ Processing Swap...' : `Swap ${fromAsset.symbol} → ${toAsset.symbol}`}
            </button>
          </div>

          {/* Fee info */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 16 }}>
            {[
              { l: 'Network Fee', v: '~$2.50' },
              { l: 'Platform Fee', v: '0.5%' },
              { l: 'Settlement', v: 'Instant' },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #161b22' }}>
                <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: '#e6edf3' }}>{item.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SIGNALS ── */}
      {tab === 'signals' && (
        <div>
          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C', marginBottom: 2 }}>Live Trading Signals</div>
              <div style={{ fontSize: 11, color: '#8b949e' }}>84% historical accuracy · Updated every minute</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950' }} />
              <span style={{ fontSize: 10, color: '#3fb950', fontWeight: 700 }}>LIVE</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SIGNALS.map((signal, i) => (
              <div key={i} style={{ background: '#0d1117', border: `1px solid ${signal.type === 'BUY' ? 'rgba(63,185,80,0.2)' : signal.type === 'SELL' ? 'rgba(248,81,73,0.2)' : 'rgba(247,166,0,0.2)'}`, borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, background: signal.type === 'BUY' ? 'rgba(63,185,80,0.15)' : signal.type === 'SELL' ? 'rgba(248,81,73,0.15)' : 'rgba(247,166,0,0.15)', color: signal.type === 'BUY' ? '#3fb950' : signal.type === 'SELL' ? '#f85149' : '#F7A600', fontSize: 11, fontWeight: 800 }}>{signal.type}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>{signal.asset}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>{signal.time}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                  {[{ l: 'ENTRY', v: signal.entry, c: '#e6edf3' }, { l: 'TARGET', v: signal.target, c: '#3fb950' }, { l: 'STOP', v: signal.stop, c: '#f85149' }].map(item => (
                    <div key={item.l} style={{ background: '#161b22', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#484f58', marginBottom: 4, letterSpacing: '0.08em' }}>{item.l}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: item.c }}>{item.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#484f58' }}>Signal Strength</span>
                  <div style={{ flex: 1, height: 4, background: '#161b22', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${signal.strength}%`, height: '100%', background: signal.strength >= 80 ? '#3fb950' : signal.strength >= 60 ? '#F7A600' : '#f85149', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: signal.strength >= 80 ? '#3fb950' : signal.strength >= 60 ? '#F7A600' : '#f85149' }}>{signal.strength}%</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 6 }}>🔒 More Signals with Premium Plans</div>
            <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 14 }}>Get up to unlimited signals with our VIP plan</div>
            <Link href="/dashboard/signals">
              <button style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                View Signal Plans →
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ── MARKET tab ── */}
      {tab === 'market' && (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>Full Market Access</div>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 20 }}>View all live prices and trade directly from the Markets page</div>
          <Link href="/dashboard/market">
            <button style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              Go to Markets →
            </button>
          </Link>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
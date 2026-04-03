'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface MarketPair {
  symbol: string
  icon: string
  color: string
  price: number
  change: number
}

interface SignalItem {
  pair: string
  type: 'BUY' | 'SELL'
  strength: number
  entry: string
  target: string
  stop: string
  timeframe: string
  risk: 'Low' | 'Medium' | 'High'
  pnl: string
}

interface HistoryTrade {
  id: string
  asset: string
  direction: 'BUY' | 'SELL'
  amount: number
  leverage: number | null
  profit: number
  created_at: string
}

const PAIRS: MarketPair[] = [
  { symbol: 'BTC/USD', icon: '₿', color: '#F7A600', price: 67240, change: 2.4 },
  { symbol: 'ETH/USD', icon: 'Ξ', color: '#627EEA', price: 3480, change: 1.8 },
  { symbol: 'SOL/USD', icon: '◎', color: '#9945FF', price: 142.3, change: 5.2 },
  { symbol: 'BNB/USD', icon: '●', color: '#F7A600', price: 412.8, change: -0.8 },
  { symbol: 'XRP/USD', icon: '✕', color: '#346AA9', price: 0.624, change: 4.1 },
  { symbol: 'DOGE/USD', icon: 'Ð', color: '#C3A634', price: 0.162, change: 7.3 },
]

const SIGNALS: SignalItem[] = [
  { pair: 'BTC/USD', type: 'BUY', strength: 92, entry: '$67,200', target: '$71,500', stop: '$65,000', timeframe: '4H', risk: 'Low', pnl: '+4.8%' },
  { pair: 'ETH/USD', type: 'BUY', strength: 87, entry: '$3,480', target: '$3,750', stop: '$3,300', timeframe: '4H', risk: 'Low', pnl: '+7.7%' },
  { pair: 'SOL/USD', type: 'SELL', strength: 74, entry: '$142', target: '$128', stop: '$148', timeframe: '1H', risk: 'Medium', pnl: '-9.8%' },
  { pair: 'DOGE/USD', type: 'BUY', strength: 81, entry: '$0.162', target: '$0.195', stop: '$0.148', timeframe: '1D', risk: 'High', pnl: '+20.4%' },
]

const ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'USDT', 'USDC'] as const

type TabType = 'swap' | 'signals' | 'history'

export default function TradePage() {
  const [tab, setTab] = useState<TabType>('swap')
  const [fromAsset, setFromAsset] = useState<string>('BTC')
  const [toAsset, setToAsset] = useState<string>('USDT')
  const [fromAmount, setFromAmount] = useState<string>('')
  const [swapping, setSwapping] = useState<boolean>(false)
  const [swapSuccess, setSwapSuccess] = useState<string>('')
  const [balance, setBalance] = useState<number>(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [trades, setTrades] = useState<HistoryTrade[]>([])
  const [pairs, setPairs] = useState<MarketPair[]>(PAIRS)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !mounted) return

      setUserId(user.id)

      const { data: bal } = await supabase
        .from('balances')
        .select('total_balance')
        .eq('user_id', user.id)
        .single()

      if (mounted) {
        setBalance(Number(bal?.total_balance ?? 0))
      }

      const { data: tr } = await supabase
        .from('trades')
        .select('id, asset, direction, amount, leverage, profit, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (mounted) {
        const normalized: HistoryTrade[] = (tr ?? []).map((item) => ({
          id: String(item.id),
          asset: String(item.asset ?? 'BTC/USD'),
          direction: item.direction === 'SELL' ? 'SELL' : 'BUY',
          amount: Number(item.amount ?? 0),
          leverage: item.leverage == null ? null : Number(item.leverage),
          profit: Number(item.profit ?? 0),
          created_at: String(item.created_at ?? new Date().toISOString()),
        }))

        setTrades(normalized)
      }
    }

    init()

    const interval = setInterval(() => {
      setPairs((prev) =>
        prev.map((p) => ({
          ...p,
          price: p.price * (1 + (Math.random() - 0.5) * 0.003),
          change: p.change + (Math.random() - 0.5) * 0.1,
        }))
      )
    }, 2500)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const rate = useMemo(() => 0.98 + Math.random() * 0.04, [fromAsset, toAsset, fromAmount])
  const parsedFromAmount = parseFloat(fromAmount)
  const toAmount =
    fromAmount && !Number.isNaN(parsedFromAmount)
      ? (parsedFromAmount * rate).toFixed(6)
      : ''

  const executeSwap = async () => {
    if (!userId) return
    if (!fromAmount) return

    const amount = parseFloat(fromAmount)
    if (Number.isNaN(amount) || amount <= 0) return

    setSwapping(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSwapSuccess(
      `✅ Swapped ${amount.toFixed(4)} ${fromAsset} → ${parseFloat(toAmount || '0').toFixed(4)} ${toAsset}`
    )
    setFromAmount('')
    setSwapping(false)

    setTimeout(() => setSwapSuccess(''), 4000)
  }

  const typeColor = (t: 'BUY' | 'SELL') =>
    ({ BUY: '#3fb950', SELL: '#f85149' }[t] ?? '#C9A84C')

  const totalPnl = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0)

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>
          Trade
        </div>
        <div style={{ fontSize: 13, color: '#484f58' }}>
          Swap assets, view signals, track history
        </div>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg,#0d1117,#161b22)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#484f58', marginBottom: 3 }}>
            Available Balance
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#C9A84C' }}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <Link href="/dashboard/market">
          <button
            style={{
              padding: '9px 16px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg,#C9A84C,#E8D08C)',
              color: '#060a0f',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            📈 Markets →
          </button>
        </Link>
      </div>

      <div
        style={{
          background: '#0d1117',
          border: '1px solid #161b22',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 20,
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', minWidth: 'max-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#3fb950',
                boxShadow: '0 0 8px #3fb950',
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: '#484f58',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Live
            </span>
          </div>

          {pairs.map((p) => (
            <div
              key={p.symbol}
              style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
            >
              <span style={{ fontSize: 11, color: p.color, fontWeight: 700 }}>{p.symbol}</span>
              <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 600 }}>
                ${p.price < 10 ? p.price.toFixed(4) : p.price.toFixed(2)}
              </span>
              <span style={{ fontSize: 10, color: p.change >= 0 ? '#3fb950' : '#f85149' }}>
                {p.change >= 0 ? '▲' : '▼'}
                {Math.abs(p.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          background: '#0d1117',
          border: '1px solid #161b22',
          borderRadius: 12,
          padding: 4,
        }}
      >
        {[
          { id: 'swap', label: '🔄 Swap' },
          { id: 'signals', label: '⚡ Signals' },
          { id: 'history', label: '📋 History' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as TabType)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              background: tab === item.id ? 'rgba(201,168,76,0.15)' : 'transparent',
              color: tab === item.id ? '#C9A84C' : '#8b949e',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: tab === item.id ? 700 : 400,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'swap' && (
        <div>
          <div
            style={{
              background: '#0d1117',
              border: '1px solid #161b22',
              borderRadius: 16,
              padding: 22,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#e6edf3',
                marginBottom: 18,
              }}
            >
              🔄 Instant Swap
            </div>

            {swapSuccess && (
              <div
                style={{
                  background: 'rgba(63,185,80,0.1)',
                  border: '1px solid rgba(63,185,80,0.3)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#3fb950',
                  fontWeight: 700,
                }}
              >
                {swapSuccess}
              </div>
            )}

            <div style={{ background: '#161b22', borderRadius: 12, padding: 16, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase' }}>
                  From
                </span>
                <span style={{ fontSize: 11, color: '#484f58' }}>
                  Balance: ${balance.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select
                  value={fromAsset}
                  onChange={(e) => setFromAsset(e.target.value)}
                  style={{
                    background: '#0d1117',
                    border: '1px solid #21262d',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#C9A84C',
                    fontSize: 14,
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                >
                  {ASSETS.filter((a) => a !== toAsset).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#e6edf3',
                    fontSize: 22,
                    fontWeight: 800,
                    outline: 'none',
                    fontFamily: 'monospace',
                    textAlign: 'right',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setFromAmount(((balance * pct) / 100).toFixed(2))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #21262d',
                      background: 'transparent',
                      color: '#8b949e',
                      fontSize: 10,
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <button
                onClick={() => {
                  const temp = fromAsset
                  setFromAsset(toAsset)
                  setToAsset(temp)
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid #21262d',
                  background: '#161b22',
                  color: '#C9A84C',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⇅
              </button>
            </div>

            <div
              style={{
                background: '#161b22',
                borderRadius: 12,
                padding: 16,
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase' }}>
                  To
                </span>
                <span style={{ fontSize: 10, color: '#484f58' }}>Rate: ~{rate.toFixed(4)}</span>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select
                  value={toAsset}
                  onChange={(e) => setToAsset(e.target.value)}
                  style={{
                    background: '#0d1117',
                    border: '1px solid #21262d',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#3fb950',
                    fontSize: 14,
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                >
                  {ASSETS.filter((a) => a !== fromAsset).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                <div
                  style={{
                    flex: 1,
                    textAlign: 'right',
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#3fb950',
                  }}
                >
                  {toAmount || '0.000000'}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 8,
                marginBottom: 18,
              }}
            >
              {[
                { l: 'Fee', v: '0.1%' },
                { l: 'Slippage', v: '0.5%' },
                { l: 'Route', v: 'Best Rate' },
              ].map((s) => (
                <div
                  key={s.l}
                  style={{
                    background: '#161b22',
                    borderRadius: 8,
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      color: '#484f58',
                      marginBottom: 3,
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.l}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C' }}>{s.v}</div>
                </div>
              ))}
            </div>

            <button
              onClick={executeSwap}
              disabled={swapping || !fromAmount || Number.isNaN(parsedFromAmount) || parsedFromAmount <= 0}
              style={{
                width: '100%',
                padding: '14px 0',
                background:
                  !fromAmount || Number.isNaN(parsedFromAmount) || parsedFromAmount <= 0 || swapping
                    ? '#161b22'
                    : 'linear-gradient(135deg,#C9A84C,#E8D08C)',
                border: 'none',
                borderRadius: 12,
                color:
                  !fromAmount || Number.isNaN(parsedFromAmount) || parsedFromAmount <= 0 || swapping
                    ? '#484f58'
                    : '#060a0f',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              {swapping ? '⟳ Swapping...' : `Swap ${fromAsset} → ${toAsset}`}
            </button>
          </div>
        </div>
      )}

      {tab === 'signals' && (
        <div>
          <div
            style={{
              background: 'rgba(63,185,80,0.06)',
              border: '1px solid rgba(63,185,80,0.2)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#3fb950',
                  boxShadow: '0 0 8px #3fb950',
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#3fb950' }}>
                LIVE Signals
              </span>
            </div>

            {[
              { l: 'Win Rate', v: '84%' },
              { l: 'Avg Return', v: '+12.4%' },
            ].map((s) => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#C9A84C' }}>{s.v}</div>
                <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase' }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SIGNALS.map((signal, i) => {
              const riskColor =
                signal.risk === 'Low'
                  ? '#3fb950'
                  : signal.risk === 'Medium'
                    ? '#F7A600'
                    : '#f85149'

              const riskBg =
                signal.risk === 'Low'
                  ? 'rgba(63,185,80,0.1)'
                  : signal.risk === 'Medium'
                    ? 'rgba(247,166,0,0.1)'
                    : 'rgba(248,81,73,0.1)'

              return (
                <div
                  key={i}
                  style={{
                    background: '#0d1117',
                    border: `1px solid ${typeColor(signal.type)}22`,
                    borderRadius: 14,
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          padding: '5px 14px',
                          borderRadius: 20,
                          background: `${typeColor(signal.type)}15`,
                          color: typeColor(signal.type),
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {signal.type}
                      </span>

                      <span style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>
                        {signal.pair}
                      </span>

                      <span
                        style={{
                          fontSize: 10,
                          color: '#484f58',
                          background: '#161b22',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {signal.timeframe}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: parseFloat(signal.pnl) >= 0 ? '#3fb950' : '#f85149',
                        }}
                      >
                        {signal.pnl}
                      </span>

                      <span
                        style={{
                          fontSize: 10,
                          color: riskColor,
                          background: riskBg,
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {signal.risk}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3,1fr)',
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      { l: 'ENTRY', v: signal.entry, c: '#e6edf3' },
                      { l: 'TARGET', v: signal.target, c: '#3fb950' },
                      { l: 'STOP LOSS', v: signal.stop, c: '#f85149' },
                    ].map((item) => (
                      <div
                        key={item.l}
                        style={{
                          background: '#161b22',
                          borderRadius: 8,
                          padding: '10px',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: '#484f58',
                            marginBottom: 4,
                            letterSpacing: '0.08em',
                          }}
                        >
                          {item.l}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: item.c }}>
                          {item.v}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#484f58' }}>Signal Strength</span>
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        background: '#161b22',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${signal.strength}%`,
                          height: '100%',
                          background: signal.strength >= 80 ? '#3fb950' : '#F7A600',
                          borderRadius: 2,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: signal.strength >= 80 ? '#3fb950' : '#F7A600',
                      }}
                    >
                      {signal.strength}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              marginTop: 16,
              background: '#0d1117',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 12,
              padding: 18,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 6 }}>
              Get More Signals Daily
            </div>
            <div style={{ fontSize: 12, color: '#484f58', marginBottom: 14 }}>
              Subscribe for up to unlimited signals + push alerts
            </div>

            <Link href="/dashboard/signals">
              <button
                style={{
                  padding: '11px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg,#C9A84C,#E8D08C)',
                  color: '#060a0f',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                View Signal Plans →
              </button>
            </Link>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div>
          {trades.length === 0 ? (
            <div
              style={{
                background: '#0d1117',
                border: '1px solid #161b22',
                borderRadius: 14,
                padding: 48,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
                No trades yet
              </div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>
                Go to Markets to place your first trade
              </div>

              <Link href="/dashboard/market">
                <button
                  style={{
                    padding: '11px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg,#C9A84C,#E8D08C)',
                    color: '#060a0f',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  Go to Markets →
                </button>
              </Link>
            </div>
          ) : (
            <div
              style={{
                background: '#0d1117',
                border: '1px solid #161b22',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #161b22',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>
                  {trades.length} Trades
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: totalPnl >= 0 ? '#3fb950' : '#f85149',
                  }}
                >
                  P&amp;L: {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
                </div>
              </div>

              {trades.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '13px 16px',
                    borderBottom: i < trades.length - 1 ? '1px solid #161b22' : 'none',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background:
                        t.direction === 'BUY'
                          ? 'rgba(63,185,80,0.1)'
                          : 'rgba(248,81,73,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {t.direction === 'BUY' ? '▲' : '▼'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>
                        {t.asset || 'BTC/USD'}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: t.direction === 'BUY' ? '#3fb950' : '#f85149',
                          background:
                            t.direction === 'BUY'
                              ? 'rgba(63,185,80,0.1)'
                              : 'rgba(248,81,73,0.1)',
                          padding: '1px 7px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        {t.direction}
                      </span>
                    </div>

                    <div style={{ fontSize: 10, color: '#484f58' }}>
                      ${t.amount.toLocaleString()} ·{' '}
                      {t.leverage ? `${t.leverage}x leverage · ` : ''}
                      {new Date(t.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: t.profit >= 0 ? '#3fb950' : '#f85149',
                        marginBottom: 2,
                      }}
                    >
                      {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: t.profit >= 0 ? '#3fb950' : '#f85149',
                      }}
                    >
                      {t.profit >= 0 ? 'WIN' : 'LOSS'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: 24,
          textAlign: 'center',
          padding: '16px 0',
          borderTop: '1px solid #161b22',
        }}
      >
        <div style={{ fontSize: 10, color: '#484f58' }}>
          ©️ 2025 CapitalMarket Pro · All Rights Reserved · Trading involves risk
        </div>
      </div>
    </div>
  )
}
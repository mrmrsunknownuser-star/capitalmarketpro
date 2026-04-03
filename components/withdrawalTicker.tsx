'use client'

import { useState, useEffect, useRef } from 'react'

const WITHDRAWALS = [
  { name: 'James O.', country: '🇺🇸', amount: '$12,500', type: 'withdrawal', time: '2m ago' },
  { name: 'Sarah M.', country: '🇬🇧', amount: '$28,750', type: 'withdrawal', time: '4m ago' },
  { name: 'Carlos R.', country: '🇨🇦', amount: '$25,000', type: 'deposit', time: '5m ago' },
  { name: 'Amina K.', country: '🇳🇬', amount: '$31,800', type: 'withdrawal', time: '7m ago' },
  { name: 'David L.', country: '🇦🇺', amount: '$18,750', type: 'deposit', time: '9m ago' },
  { name: 'Fatima A.', country: '🇦🇪', amount: '$62,400', type: 'withdrawal', time: '11m ago' },
  { name: 'Michael T.', country: '🇩🇪', amount: '$9,800', type: 'deposit', time: '13m ago' },
  { name: 'Priya S.', country: '🇸🇬', amount: '$44,200', type: 'withdrawal', time: '15m ago' },
  { name: 'Ahmed H.', country: '🇸🇦', amount: '$100,000', type: 'deposit', time: '18m ago' },
  { name: 'Emma W.', country: '🇫🇷', amount: '$28,750', type: 'withdrawal', time: '20m ago' },
  { name: 'Marcus J.', country: '🇺🇸', amount: '$41,300', type: 'deposit', time: '22m ago' },
  { name: 'Chioma E.', country: '🇳🇬', amount: '$15,200', type: 'withdrawal', time: '25m ago' },
  { name: 'Omar K.', country: '🇰🇼', amount: '$75,000', type: 'deposit', time: '28m ago' },
  { name: 'Yuki T.', country: '🇯🇵', amount: '$38,000', type: 'withdrawal', time: '30m ago' },
  { name: 'Alex P.', country: '🇧🇷', amount: '$22,500', type: 'deposit', time: '33m ago' },
]

export default function WithdrawalTicker() {
  const [current, setCurrent] = useState<typeof WITHDRAWALS[0] | null>(null)
  const [visible, setVisible] = useState(false)
  const timer = useRef<any>(null)
  const idx = useRef(0)

  useEffect(() => {
    const show = () => {
      const item = WITHDRAWALS[idx.current % WITHDRAWALS.length]
      idx.current++
      setCurrent(item)
      setVisible(true)

      timer.current = setTimeout(() => {
        setVisible(false)
        timer.current = setTimeout(show, 4000 + Math.random() * 4000)
      }, 5000)
    }

    timer.current = setTimeout(show, 3000)
    return () => clearTimeout(timer.current)
  }, [])

  if (!current) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 16,
      zIndex: 9999,
      maxWidth: 280,
      fontFamily: 'monospace',
      transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(-110%) scale(0.9)',
      opacity: visible ? 1 : 0,
    }}>
      <div style={{
        background: '#0d1117',
        border: `1px solid ${current.type === 'withdrawal' ? 'rgba(63,185,80,0.4)' : 'rgba(0,82,255,0.4)'}`,
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: current.type === 'withdrawal' ? 'rgba(63,185,80,0.15)' : 'rgba(0,82,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {current.type === 'withdrawal' ? '💸' : '💰'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>
            {current.name} {current.country}
          </div>
          <div style={{ fontSize: 11, color: current.type === 'withdrawal' ? '#3fb950' : '#0052FF', fontWeight: 700 }}>
            {current.type === 'withdrawal' ? '✅ Withdrew' : '💰 Deposited'} {current.amount}
          </div>
          <div style={{ fontSize: 9, color: '#484f58', marginTop: 2 }}>
            {current.time} · CapitalMarket Pro
          </div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950', flexShrink: 0 }} />
      </div>
    </div>
  )
}
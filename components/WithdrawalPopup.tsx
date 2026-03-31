'use client'

import { useState, useEffect } from 'react'

interface Withdrawal {
  name: string
  country: string
  amount: string
  time: string
}

const withdrawals: Withdrawal[] = [
  { name: 'Daniel R.', country: 'United States 🇺🇸', amount: '$120,000', time: 'Just now' },
  { name: 'Hassan A.', country: 'UAE 🇦🇪', amount: '$275,500', time: '1 min ago' },
  { name: 'Victor S.', country: 'Switzerland 🇨🇭', amount: '$498,200', time: '2 mins ago' },
  { name: 'Zhang L.', country: 'China 🇨🇳', amount: '$310,750', time: 'Just now' },
  { name: 'Oliver K.', country: 'United Kingdom 🇬🇧', amount: '$185,900', time: '3 mins ago' },
  { name: 'Noah P.', country: 'Canada 🇨🇦', amount: '$220,400', time: '1 min ago' },
  { name: 'Yousef M.', country: 'Saudi Arabia 🇸🇦', amount: '$405,000', time: 'Just now' },
  { name: 'Ethan J.', country: 'Australia 🇦🇺', amount: '$150,300', time: '4 mins ago' },
  { name: 'Fatima A.', country: 'UAE 🇦🇪', amount: '$18,500', time: '2 mins ago' },
  { name: 'Ahmed H.', country: 'Saudi Arabia 🇸🇦', amount: '$22,000', time: '2 mins ago' },
  { name: 'Lucas D.', country: 'Brazil 🇧🇷', amount: '$35,800', time: '1 min ago' },
  { name: 'Sophia M.', country: 'Germany 🇩🇪', amount: '$41,200', time: 'Just now' },
  { name: 'Arjun N.', country: 'India 🇮🇳', amount: '$28,400', time: '3 mins ago' },
  { name: 'Liam T.', country: 'Ireland 🇮🇪', amount: '$19,900', time: 'Just now' },
  { name: 'Chloe B.', country: 'France 🇫🇷', amount: '$24,700', time: '2 mins ago' },
  { name: 'Priya S.', country: 'Singapore 🇸🇬', amount: '$9,200', time: '1 min ago' },
  { name: 'David L.', country: 'Australia 🇦🇺', amount: '$6,300', time: 'Just now' },
  { name: 'Emma W.', country: 'France 🇫🇷', amount: '$7,400', time: 'Just now' },
  { name: 'Yuki T.', country: 'Japan 🇯🇵', amount: '$8,000', time: '3 mins ago' },
  { name: 'Mateo G.', country: 'Spain 🇪🇸', amount: '$10,600', time: '2 mins ago' },
  { name: 'Kevin O.', country: 'New Zealand 🇳🇿', amount: '$11,300', time: 'Just now' },
  { name: 'James O.', country: 'United States 🇺🇸', amount: '$4,200', time: '2 mins ago' },
  { name: 'Michael T.', country: 'Germany 🇩🇪', amount: '$3,800', time: '4 mins ago' },
  { name: 'Lisa C.', country: 'Netherlands 🇳🇱', amount: '$4,900', time: '1 min ago' },
  { name: 'John B.', country: 'South Africa 🇿🇦', amount: '$5,100', time: '3 mins ago' },
  { name: 'Elena V.', country: 'Spain 🇪🇸', amount: '$4,600', time: 'Just now' },
  { name: 'Marta K.', country: 'Poland 🇵🇱', amount: '$3,700', time: '2 mins ago' },
  { name: 'Carlos R.', country: 'Canada 🇨🇦', amount: '$2,500', time: '1 min ago' },
  { name: 'Chioma E.', country: 'Nigeria 🇳🇬', amount: '$3,200', time: '2 mins ago' },
  { name: 'Ivan P.', country: 'Russia 🇷🇺', amount: '$2,100', time: 'Just now' },
  { name: 'Kwame A.', country: 'Ghana 🇬🇭', amount: '$1,900', time: '3 mins ago' },
  { name: 'Maria L.', country: 'Philippines 🇵🇭', amount: '$2,300', time: '1 min ago' },
  { name: 'Tariq H.', country: 'Pakistan 🇵🇰', amount: '$1,600', time: 'Just now' },
  { name: 'Luis F.', country: 'Mexico 🇲🇽', amount: '$2,800', time: '2 mins ago' }
]

export default function WithdrawalPopup() {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(0)
  const [animIn, setAnimIn] = useState(false)

  useEffect(() => {
    // First popup after 4 seconds
    const firstTimer = setTimeout(() => showNext(), 4000)
    return () => clearTimeout(firstTimer)
  }, [])

  const showNext = () => {
    const idx = Math.floor(Math.random() * withdrawals.length)
    setCurrent(idx)
    setVisible(true)
    setAnimIn(true)

    // Auto hide after 5 seconds
    setTimeout(() => {
      setAnimIn(false)
      setTimeout(() => {
        setVisible(false)
        // Show next popup after random 8-15 seconds
        const nextDelay = 8000 + Math.random() * 7000
        setTimeout(() => showNext(), nextDelay)
      }, 400)
    }, 5000)
  }

  if (!visible) return null

  const item = withdrawals[current]

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 24, zIndex: 9998,
      transform: `translateX(${animIn ? 0 : -120}%)`,
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      maxWidth: 320,
    }}>
      <div style={{
        background: '#0d1117',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #C9A84C, #E8D08C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>💸</div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', fontFamily: 'monospace' }}>{item.name}</div>
            <div style={{ fontSize: 10, color: '#484f58', fontFamily: 'monospace', marginLeft: 8, flexShrink: 0 }}>{item.time}</div>
          </div>
          <div style={{ fontSize: 11, color: '#8b949e', fontFamily: 'monospace', marginBottom: 4 }}>{item.country}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#3fb950', fontFamily: 'monospace' }}>
            Withdrew {item.amount} ✅
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => { setAnimIn(false); setTimeout(() => setVisible(false), 400) }}
          style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 14, padding: 0, flexShrink: 0, alignSelf: 'flex-start' }}
        >✕</button>
      </div>

      {/* Bottom label */}
      <div style={{ textAlign: 'center', marginTop: 6, fontSize: 9, color: '#484f58', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
        VERIFIED WITHDRAWAL · CAPITALMARKET PRO
      </div>
    </div>
  )
}
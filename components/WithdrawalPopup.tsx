'use client'

import { useState, useEffect, useRef } from 'react'

const LIST = [
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
  const [item, setItem] = useState<typeof LIST[0] | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const showNext = () => {
    const next = LIST[Math.floor(Math.random() * LIST.length)]
    setItem(next)
    timerRef.current = setTimeout(() => {
      setItem(null)
      timerRef.current = setTimeout(showNext, 8000 + Math.random() * 6000)
    }, 5000)
  }

  useEffect(() => {
    timerRef.current = setTimeout(showNext, 4000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (!item) return null

  return (
    <div style={{
      position: 'fixed', bottom: 28, left: 28,
      zIndex: 99999, maxWidth: 295,
      fontFamily: 'monospace',
      animation: 'wpSlide 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
    }}>
      <style>{`
        @keyframes wpSlide {
          from { transform: translateX(-110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div style={{
        background: '#0d1117',
        border: '2px solid #C9A84C',
        borderRadius: 14, padding: '14px 40px 14px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        position: 'relative',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💸</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{item.name}</div>
          <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>{item.country}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#3fb950' }}>Withdrew {item.amount} ✅</div>
        </div>
        <button onClick={() => setItem(null)} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 5, fontSize: 9, color: '#484f58', letterSpacing: '0.1em' }}>
        VERIFIED WITHDRAWAL · CAPITALMARKET PRO
      </div>
    </div>
  )
}
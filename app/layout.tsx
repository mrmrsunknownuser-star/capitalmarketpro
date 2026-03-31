'use client'
import WithdrawalPopup from '@/components/WithdrawalPopup'
import { useState, useEffect } from 'react'
import './globals.css'

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 900)
    const t3 = setTimeout(() => setPhase(3), 1600)
    const t4 = setTimeout(() => onDone(), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#060a0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: phase === 3 ? 0 : 1,
      transition: phase === 3 ? 'opacity 0.8s ease' : 'none',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
        transform: `scale(${phase >= 1 ? 1 : 0})`,
        transition: 'transform 0.6s ease',
      }} />

      {/* Logo box */}
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: 'linear-gradient(135deg, #C9A84C, #E8D08C)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, fontWeight: 800, color: '#060a0f',
        transform: `scale(${phase >= 1 ? 1 : 0}) rotate(${phase >= 1 ? 0 : -180}deg)`,
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: phase >= 1 ? '0 0 60px rgba(201,168,76,0.4)' : 'none',
        marginBottom: 20, position: 'relative', zIndex: 1,
      }}>C</div>

      {/* Name */}
      <div style={{
        opacity: phase >= 2 ? 1 : 0,
        transform: `translateY(${phase >= 2 ? 0 : 20}px)`,
        transition: 'all 0.5s ease',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace' }}>
          <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
          <span style={{ color: '#e6edf3' }}> Pro</span>
        </div>
        <div style={{ fontSize: 12, color: '#484f58', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 6, fontFamily: 'monospace' }}>
          Professional Trading Platform
        </div>
      </div>

      {/* Loading bar */}
      <div style={{
        marginTop: 40, width: 120, height: 2,
        background: '#161b22', borderRadius: 2,
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 0.3s ease',
        position: 'relative', zIndex: 1,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg, #C9A84C, #E8D08C)',
          width: phase >= 2 ? '100%' : '0%',
          transition: 'width 1.2s ease',
        }} />
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <html lang="en">
      <head>
        <title>CapitalMarket Pro</title>
        <meta name="description" content="Professional Trading Platform" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#060a0f' }}>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
        <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease' }}>
          {children}
       <WithdrawalPopup />
        </div>
      </body>
    </html>
  )
}
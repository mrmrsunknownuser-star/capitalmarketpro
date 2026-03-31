'use client'

import { useState, useEffect } from 'react'
import './globals.css'

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    setTimeout(() => setPhase(1), 400)
    setTimeout(() => setPhase(2), 1000)
    setTimeout(() => setPhase(3), 1800)
    setTimeout(() => onDone(), 2800)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#060a0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: phase === 3 ? 0 : 1,
      transition: 'opacity 0.8s ease',
      fontFamily: 'monospace',
    }}>
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
        transform: `scale(${phase >= 1 ? 1 : 0})`,
        transition: 'transform 0.8s ease',
      }} />
      <div style={{
        width: 88, height: 88, borderRadius: 22,
        background: 'linear-gradient(135deg, #C9A84C, #E8D08C)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 42, fontWeight: 800, color: '#060a0f',
        transform: `scale(${phase >= 1 ? 1 : 0}) rotate(${phase >= 1 ? 0 : -180}deg)`,
        transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: phase >= 1 ? '0 0 80px rgba(201,168,76,0.5)' : 'none',
        marginBottom: 24, position: 'relative', zIndex: 1,
      }}>C</div>
      <div style={{
        opacity: phase >= 2 ? 1 : 0,
        transform: `translateY(${phase >= 2 ? 0 : 20}px)`,
        transition: 'all 0.5s ease',
        textAlign: 'center', zIndex: 1,
      }}>
        <div style={{ fontSize: 28, fontWeight: 800 }}>
          <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
          <span style={{ color: '#e6edf3' }}> Pro</span>
        </div>
        <div style={{ fontSize: 12, color: '#484f58', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8 }}>
          Professional Trading Platform
        </div>
      </div>
      <div style={{
        marginTop: 40, width: 140, height: 3,
        background: '#161b22', borderRadius: 3,
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 0.3s ease',
        zIndex: 1, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: 'linear-gradient(90deg, #C9A84C, #E8D08C)',
          width: phase >= 2 ? '100%' : '0%',
          transition: 'width 1.4s ease',
        }} />
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [splash, setSplash] = useState(true)

  return (
    <html lang="en">
      <head>
        <title>CapitalMarket Pro — Professional Trading Platform</title>
        <meta name="description" content="Trade crypto, stocks, earn affiliate income and get real-time trading signals in one professional dashboard." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#C9A84C" />
        <meta property="og:title" content="CapitalMarket Pro" />
        <meta property="og:description" content="Professional Trading Platform" />
        <meta property="og:url" content="https://capitalmarket-pro.com" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#060a0f' }}>
        {splash && <SplashScreen onDone={() => setSplash(false)} />}
        <div style={{
          opacity: splash ? 0 : 1,
          transition: 'opacity 0.6s ease',
        }}>
          {children}
        </div>
      </body>
    </html>
  )
}
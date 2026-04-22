'use client'

import { useState, useEffect } from 'react'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/Toast'
import { ThemeProvider } from '@/components/ThemeToggle'
import ChatBubble from '@/components/ChatBubble'


const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1800)
    const t2 = setTimeout(() => onDone(), 2300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#060a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      zIndex: 99999,
      fontFamily: 'monospace',
      opacity: fade ? 0 : 1,
      transition: 'opacity 0.5s ease',
      pointerEvents: fade ? 'none' : 'all',
    }}>
      <style>{`
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(201,168,76,0.4); transform: scale(1); }
          50% { box-shadow: 0 0 80px rgba(201,168,76,0.8); transform: scale(1.05); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Logo */}
      <div style={{
        width: 88,
        height: 88,
        borderRadius: 24,
        background: 'linear-gradient(135deg, #C9A84C, #E8D08C)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 46,
        fontWeight: 800,
        color: '#060a0f',
        marginBottom: 24,
        animation: 'logoPulse 2s ease infinite',
      }}>C</div>

      {/* Brand name */}
      <div style={{
        fontSize: 24,
        fontWeight: 800,
        marginBottom: 6,
        animation: 'fadeUp 0.6s ease 0.3s both',
      }}>
        <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
        <span style={{ color: '#e6edf3' }}> Pro</span>
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        marginBottom: 48,
        animation: 'fadeUp 0.6s ease 0.5s both',
        background: 'linear-gradient(90deg, #484f58, #C9A84C, #484f58)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animationName: 'fadeUp, shimmer',
        animationDuration: '0.6s, 2.5s',
        animationDelay: '0.5s, 1s',
        animationTimingFunction: 'ease, linear',
        animationFillMode: 'both, none',
        animationIterationCount: '1, infinite',
      }}>
        Professional Trading Platform
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 10, animation: 'fadeUp 0.6s ease 0.7s both' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: '#C9A84C',
            animation: `dotBounce 1.3s ease infinite`,
            animationDelay: `${i * 0.18}s`,
          }} />
        ))}
      </div>

      {/* Version */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        fontSize: 10,
        color: '#21262d',
        letterSpacing: '0.1em',
        animation: 'fadeUp 0.6s ease 1s both',
      }}>
        v2.0 · EST. 2018
      </div>
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Only show splash on first visit per session
    const seen = sessionStorage.getItem('splash_seen')
    if (seen) setShowSplash(false)
    else sessionStorage.setItem('splash_seen', '1')
  }, [])

  return (
    <html lang="en">
      <head>
        <title>CapitalMarket Pro — Professional Trading Platform</title>
        <meta name="description" content="Earn daily returns with AI-powered automated trading. Join 150,000+ traders on CapitalMarket Pro." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#060a0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CapitalMarket Pro" />

        {/* Open Graph */}
        <meta property="og:title" content="CapitalMarket Pro — Professional Trading Platform" />
        <meta property="og:description" content="Earn daily returns with AI-powered automated trading." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://capitalmarket-pro.com" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={geistMono.variable} style={{
        margin: 0,
        padding: 0,
        background: '#060a0f',
        color: '#e6edf3',
        fontFamily: 'var(--font-geist-mono), monospace',
        overscrollBehavior: 'none',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {mounted && showSplash && (
          <SplashScreen onDone={() => setShowSplash(false)} />
        )}
        <ThemeProvider>
          <ToastProvider>
            <div style={{
              opacity: showSplash ? 0 : 1,
              transition: 'opacity 0.4s ease 0.1s',
            }}>
              {children}
            </div>
          </ToastProvider>
        </ThemeProvider>
        <ChatBubble />
      </body>
    </html>
  )
}
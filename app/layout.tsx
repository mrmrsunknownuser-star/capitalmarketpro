// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import './globals.css'
import { ToastProvider } from '@/components/Toast'
import { ThemeProvider } from '@/components/ThemeToggle'
import VisitorTracker from '@/components/VisitorTracker'

function SplashScreen({ onDone }) {
  var [fade, setFade] = useState(false)

  useEffect(function() {
    var t1 = setTimeout(function() { setFade(true) }, 1800)
    var t2 = setTimeout(function() { onDone() }, 2300)
    return function() { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060a0e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: 99999, fontFamily: 'Inter, sans-serif', opacity: fade ? 0 : 1, transition: 'opacity 0.5s ease', pointerEvents: fade ? 'none' : 'all' }}>
      <style>{`
        @keyframes logoPulse { 0%,100%{box-shadow:0 0 40px rgba(201,168,76,0.4);transform:scale(1)}50%{box-shadow:0 0 80px rgba(201,168,76,0.8);transform:scale(1.05)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes dotBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-10px);opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }
      `}</style>

      <div style={{ width: 88, height: 88, borderRadius: 24, background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 900, color: '#060a0e', marginBottom: 24, animation: 'logoPulse 2s ease infinite' }}>C</div>

      <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, animation: 'fadeUp 0.6s ease 0.3s both' }}>
        <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
        <span style={{ color: '#e8edf5' }}> Pro</span>
      </div>

      <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 48, animation: 'fadeUp 0.6s ease 0.5s both', background: 'linear-gradient(90deg,#484f58,#C9A84C,#484f58)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Professional Trading Platform
      </div>

      <div style={{ display: 'flex', gap: 10, animation: 'fadeUp 0.6s ease 0.7s both' }}>
        {[0, 1, 2].map(function(i) {
          return <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: '#C9A84C', animation: 'dotBounce 1.3s ease infinite', animationDelay: (i * 0.18) + 's' }} />
        })}
      </div>

      <div style={{ position: 'absolute', bottom: 32, fontSize: 10, color: '#21262d', letterSpacing: '0.1em', animation: 'fadeUp 0.6s ease 1s both' }}>
        v2.0 · Trusted Since 2018
      </div>
    </div>
  )
}

export default function RootLayout({ children }) {
  var [showSplash, setShowSplash] = useState(true)
  var [mounted, setMounted] = useState(false)

  useEffect(function() {
    setMounted(true)
    var seen = sessionStorage.getItem('splash_seen')
    if (seen) setShowSplash(false)
    else sessionStorage.setItem('splash_seen', '1')
  }, [])

  return (
    <html lang="en">
      <head>
        <title>CapitalMarket Pro — Professional Trading Platform</title>
        <meta name="description" content="Earn daily returns with AI-powered automated trading. Join 180,000+ traders on CapitalMarket Pro." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#060a0e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CapitalMarket Pro" />
        <meta property="og:title" content="CapitalMarket Pro — Professional Trading Platform" />
        <meta property="og:description" content="Earn daily returns with AI-powered automated trading." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://capitalmarket-pro.com" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#060a0e', color: '#e8edf5', fontFamily: 'Inter, sans-serif', overscrollBehavior: 'none', WebkitFontSmoothing: 'antialiased' }}>

        {mounted && showSplash && (
          <SplashScreen onDone={function() { setShowSplash(false) }} />
        )}

        <ThemeProvider>
          <ToastProvider>
            <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.4s ease 0.1s' }}>
              {children}
            </div>
          </ToastProvider>
        </ThemeProvider>

        <VisitorTracker />

        {/* Tawk.to Live Chat */}
        <Script
          id="tawk"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `var Tawk_API=Tawk_API||{},Tawk_LoadStart=new Date();(function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];s1.async=true;s1.src='https://embed.tawk.to/69f077185bff621c33f83298/1jn9l2erc';s1.charset='UTF-8';s1.setAttribute('crossorigin','*');s0.parentNode.insertBefore(s1,s0);})();`
          }}
        />

      </body>
    </html>
  )
}
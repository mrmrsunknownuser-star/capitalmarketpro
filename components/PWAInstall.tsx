'use client'

import { useState, useEffect } from 'react'

export default function PWAInstall() {
  const [prompt, setPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e: any) => {
      e.preventDefault()
      setPrompt(e)
      const dismissed = sessionStorage.getItem('pwa_dismissed')
      if (!dismissed) setTimeout(() => setShow(true), 8000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') setInstalled(true)
    setShow(false)
  }

  const dismiss = () => {
    setShow(false)
    sessionStorage.setItem('pwa_dismissed', '1')
  }

  if (!show || installed) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 90,
      left: 16,
      right: 16,
      zIndex: 9990,
      maxWidth: 380,
      margin: '0 auto',
      background: '#0d1117',
      border: '1px solid rgba(201,168,76,0.35)',
      borderRadius: 18,
      padding: '18px 20px',
      boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
      fontFamily: 'monospace',
      animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
          C
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 3 }}>
            Install CapitalMarket Pro
          </div>
          <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.6 }}>
            Add to your home screen for instant access and faster loading
          </div>
        </div>
        <button onClick={dismiss}
          style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 18, flexShrink: 0, padding: 4 }}>
          ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginTop: 16 }}>
        <button onClick={dismiss}
          style={{ padding: '11px 0', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
          Not now
        </button>
        <button onClick={install}
          style={{ padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
          📱 Install App
        </button>
      </div>
    </div>
  )
}
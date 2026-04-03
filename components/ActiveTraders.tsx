'use client'

import { useState, useEffect } from 'react'

export default function ActiveTraders() {
  const [count, setCount] = useState(1247)
  const [profit, setProfit] = useState(284750)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3) - 1)
      setProfit(prev => prev + Math.floor(Math.random() * 500))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(63,185,80,0.06),rgba(63,185,80,0.02))', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 10px #3fb950', animation: 'pulse 2s infinite' }} />
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        <div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#3fb950' }}>{count.toLocaleString()}</span>
          <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 6 }}>traders active right now</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: '#484f58' }}>Platform profit today:</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#C9A84C' }}>${profit.toLocaleString()}</span>
      </div>
    </div>
  )
}
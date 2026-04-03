'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  balance: number
}

const MILESTONES = [
  { amount: 1000, title: '🎉 $1K Milestone!', msg: "You've reached $1,000! You're on your way to financial freedom.", color: '#C9A84C' },
  { amount: 5000, title: '🚀 $5K Milestone!', msg: "Incredible! $5,000 in your portfolio. Keep compounding!", color: '#0052FF' },
  { amount: 10000, title: '💎 $10K Milestone!', msg: "You're now a $10K investor! Elite status incoming.", color: '#7B2BF9' },
  { amount: 50000, title: '👑 $50K Milestone!', msg: "Extraordinary! $50,000 portfolio. You're in the top 1%!", color: '#C9A84C' },
  { amount: 100000, title: '🏆 $100K MILESTONE!', msg: "LEGENDARY! You've hit $100,000! Welcome to Black tier!", color: '#3fb950' },
]

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles: any[] = []
    const colors = ['#C9A84C', '#E8D08C', '#3fb950', '#0052FF', '#7B2BF9', '#f85149']
    for (let i = 0; i < 150; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height, size: Math.random() * 8 + 4, color: colors[Math.floor(Math.random() * colors.length)], speed: Math.random() * 3 + 2, angle: Math.random() * 360, spin: Math.random() * 4 - 2 })
    }
    let running = true
    const animate = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.y += p.speed
        p.angle += p.spin
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.angle * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
        if (p.y > canvas.height) p.y = -20
      })
      requestAnimationFrame(animate)
    }
    animate()
    return () => { running = false }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }} />
}

export default function MilestonePopup({ balance }: Props) {
  const [milestone, setMilestone] = useState<typeof MILESTONES[0] | null>(null)
  const shown = useRef<Set<number>>(new Set())

  useEffect(() => {
    const hit = MILESTONES.filter(m => balance >= m.amount && !shown.current.has(m.amount)).pop()
    if (hit) { shown.current.add(hit.amount); setMilestone(hit) }
  }, [balance])

  if (!milestone) return null

  return (
    <>
      <Confetti />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
        <div style={{ background: '#0d1117', border: `2px solid ${milestone.color}`, borderRadius: 24, padding: 36, textAlign: 'center', maxWidth: 360, fontFamily: 'monospace', boxShadow: `0 0 60px ${milestone.color}44` }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎊</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: milestone.color, marginBottom: 10 }}>{milestone.title}</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 28 }}>{milestone.msg}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#e6edf3', marginBottom: 24 }}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <button onClick={() => setMilestone(null)}
            style={{ width: '100%', padding: '14px 0', background: `linear-gradient(135deg,${milestone.color},${milestone.color}cc)`, border: 'none', borderRadius: 14, color: '#060a0f', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            🚀 Keep Growing!
          </button>
        </div>
      </div>
    </>
  )
}
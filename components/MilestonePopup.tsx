'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  balance: number
}

const MILESTONES = [
  { amount: 1000, title: '🎉 $1,000 Milestone!', msg: "You've crossed $1,000! Your journey to financial freedom has begun.", color: '#C9A84C' },
  { amount: 5000, title: '🚀 $5,000 Milestone!', msg: "Amazing! You've grown your portfolio to $5,000. Keep compounding!", color: '#0052FF' },
  { amount: 10000, title: '💎 $10,000 Milestone!', msg: "Incredible! $10,000 portfolio. You're in elite investor territory.", color: '#7B2BF9' },
  { amount: 25000, title: '👑 $25,000 Milestone!', msg: "Phenomenal! $25,000 and growing. Our AI is working hard for you!", color: '#F7A600' },
  { amount: 50000, title: '🏆 $50,000 Milestone!', msg: "Extraordinary! Half a million on the way. You're a top trader!", color: '#3fb950' },
  { amount: 100000, title: '🖤 $100,000 MILESTONE!', msg: "LEGENDARY! You've hit $100,000! Welcome to the Black tier elite!", color: '#e6edf3' },
]

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#C9A84C', '#E8D08C', '#3fb950', '#0052FF', '#7B2BF9', '#f85149', '#F7A600']
    const particles = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 9 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 2,
      angle: Math.random() * 360,
      spin: Math.random() * 4 - 2,
      opacity: 1,
    }))

    let running = true
    let frame = 0

    const animate = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      particles.forEach(p => {
        p.y += p.speedY
        p.x += p.speedX
        p.angle += p.spin
        if (frame > 80) p.opacity = Math.max(0, p.opacity - 0.008)
        if (p.y > canvas.height) { p.y = -20; p.opacity = 1 }

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate((p.angle * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()
    return () => { running = false }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}
    />
  )
}

export default function MilestonePopup({ balance }: Props) {
  const [milestone, setMilestone] = useState<typeof MILESTONES[0] | null>(null)
  const prevBalance = useRef<number | null>(null)

  useEffect(() => {
    // Skip on first load — only trigger on balance INCREASE
    if (prevBalance.current === null) {
      prevBalance.current = balance
      return
    }

    // Only trigger if balance went UP
    if (balance <= prevBalance.current) {
      prevBalance.current = balance
      return
    }

    const prev = prevBalance.current
    prevBalance.current = balance

    // Check if we crossed a new milestone
    const crossed = MILESTONES.find(m => prev < m.amount && balance >= m.amount)
    if (!crossed) return

    // Check if already shown this session
    const sessionKey = `milestone_shown_${crossed.amount}`
    if (sessionStorage.getItem(sessionKey)) return

    sessionStorage.setItem(sessionKey, '1')
    setMilestone(crossed)
  }, [balance])

  if (!milestone) return null

  return (
    <>
      <Confetti />
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}>
        <div style={{
          background: '#0d1117',
          border: `2px solid ${milestone.color}55`,
          borderRadius: 24,
          padding: '36px 32px',
          textAlign: 'center',
          maxWidth: 380,
          width: '100%',
          fontFamily: 'monospace',
          boxShadow: `0 0 80px ${milestone.color}33`,
          animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <style>{`
            @keyframes popIn {
              from { transform: scale(0.7); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>

          <div style={{ fontSize: 72, marginBottom: 16, animation: 'float 2s ease infinite' }}>🎊</div>

          <div style={{ fontSize: 22, fontWeight: 800, color: milestone.color, marginBottom: 10, lineHeight: 1.3 }}>
            {milestone.title}
          </div>

          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 24 }}>
            {milestone.msg}
          </div>

          {/* Balance display */}
          <div style={{
            background: `${milestone.color}0d`,
            border: `1px solid ${milestone.color}33`,
            borderRadius: 14,
            padding: '16px',
            marginBottom: 28,
          }}>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Current Portfolio Value
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: milestone.color }}>
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Next milestone hint */}
          {MILESTONES.find(m => m.amount > balance) && (
            <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>
              🎯 Next milestone:{' '}
              <strong style={{ color: '#8b949e' }}>
                ${MILESTONES.find(m => m.amount > balance)?.amount.toLocaleString()}
              </strong>
            </div>
          )}

          <button
            onClick={() => setMilestone(null)}
            style={{
              width: '100%',
              padding: '14px 0',
              background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}cc)`,
              border: 'none',
              borderRadius: 14,
              color: milestone.color === '#e6edf3' ? '#060a0f' : '#060a0f',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'monospace',
              boxShadow: `0 4px 24px ${milestone.color}44`,
            }}>
            🚀 Keep Growing!
          </button>
        </div>
      </div>
    </>
  )
}
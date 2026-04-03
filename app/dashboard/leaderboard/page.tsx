'use client'

import { useState } from 'react'

const LEADERBOARD = [
  { rank: 1, name: 'Alexander M.', country: '🇺🇸', profit: 284500, roi: 284, plan: 'Black', months: 8, avatar: 'AM' },
  { rank: 2, name: 'Omar R.', country: '🇸🇦', profit: 245000, roi: 245, plan: 'Black', months: 7, avatar: 'OR' },
  { rank: 3, name: 'Fatima K.', country: '🇦🇪', profit: 156200, roi: 156, plan: 'Elite', months: 6, avatar: 'FK' },
  { rank: 4, name: 'James O.', country: '🇬🇧', profit: 98400, roi: 98, plan: 'Platinum', months: 5, avatar: 'JO' },
  { rank: 5, name: 'Priya N.', country: '🇸🇬', profit: 72100, roi: 72, plan: 'Gold', months: 4, avatar: 'PN' },
  { rank: 6, name: 'Sophie C.', country: '🇫🇷', profit: 61800, roi: 61, plan: 'Gold', months: 3, avatar: 'SC' },
  { rank: 7, name: 'Marcus T.', country: '🇺🇸', profit: 54300, roi: 54, plan: 'Gold', months: 4, avatar: 'MT' },
  { rank: 8, name: 'Aisha B.', country: '🇳🇬', profit: 48900, roi: 48, plan: 'Silver', months: 5, avatar: 'AB' },
  { rank: 9, name: 'David L.', country: '🇦🇺', profit: 41200, roi: 41, plan: 'Silver', months: 3, avatar: 'DL' },
  { rank: 10, name: 'Yuki T.', country: '🇯🇵', profit: 38000, roi: 38, plan: 'Gold', months: 2, avatar: 'YT' },
]

const rankColors = ['#F7A600', '#8b949e', '#CD7F32']
const rankIcons = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'month' | 'alltime'>('alltime')

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>🏆 Leaderboard</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Top performing traders on CapitalMarket Pro</div>
      </div>

      {/* Period */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 3, width: 'fit-content' }}>
        {[{ id: 'month', l: 'This Month' }, { id: 'alltime', l: 'All Time' }].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id as any)}
            style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: period === p.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: period === p.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: period === p.id ? 700 : 400 }}>
            {p.l}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24, alignItems: 'flex-end' }}>
        {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((trader, i) => {
          const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3
          const heights = [140, 170, 120]
          return (
            <div key={trader.rank} style={{ background: `linear-gradient(135deg, ${rankColors[actualRank - 1]}18, ${rankColors[actualRank - 1]}08)`, border: `2px solid ${rankColors[actualRank - 1]}44`, borderRadius: 16, padding: 16, textAlign: 'center', height: heights[i], display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{rankIcons[actualRank - 1]}</div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${rankColors[actualRank - 1]},${rankColors[actualRank - 1]}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', margin: '0 auto 8px', border: `2px solid ${rankColors[actualRank - 1]}` }}>
                {trader.avatar}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{trader.name}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: rankColors[actualRank - 1] }}>+${(trader.profit / 1000).toFixed(0)}K</div>
            </div>
          )
        })}
      </div>

      {/* Full list */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span>Trader</span>
          <span>Total Profit</span>
        </div>
        {LEADERBOARD.map((trader, i) => (
          <div key={trader.rank} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < LEADERBOARD.length - 1 ? '1px solid #161b22' : 'none', gap: 12, background: trader.rank <= 3 ? `${rankColors[trader.rank - 1]}05` : 'transparent' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: trader.rank <= 3 ? `${rankColors[trader.rank - 1]}22` : '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: trader.rank <= 3 ? 14 : 12, fontWeight: 800, color: trader.rank <= 3 ? rankColors[trader.rank - 1] : '#484f58', flexShrink: 0 }}>
              {trader.rank <= 3 ? rankIcons[trader.rank - 1] : trader.rank}
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: trader.rank <= 3 ? `linear-gradient(135deg,${rankColors[trader.rank - 1]},${rankColors[trader.rank - 1]}88)` : 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
              {trader.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{trader.name} {trader.country}</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>{trader.plan} Plan · {trader.months} months · {trader.roi}% ROI</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#3fb950' }}>+${trader.profit.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 20, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>🚀 Start Your Journey Today</div>
        <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16 }}>Join these top traders. Your name could be next on the leaderboard.</div>
        <a href="/dashboard/invest" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            View Investment Plans →
          </button>
        </a>
      </div>

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
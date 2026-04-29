// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

var ALL_ACHIEVEMENTS = [
  {
    category: 'Getting Started',
    items: [
      { id: 'first_login', icon: '👋', title: 'Welcome Aboard', desc: 'Created your CapitalMarket Pro account', xp: 50, condition: 'always' },
      { id: 'kyc_done', icon: '✅', title: 'Identity Verified', desc: 'Completed KYC verification', xp: 200, condition: 'kyc' },
      { id: 'first_deposit', icon: '💰', title: 'First Deposit', desc: 'Made your first deposit', xp: 150, condition: 'deposit' },
      { id: 'profile_complete', icon: '👤', title: 'Profile Complete', desc: 'Added phone number to your profile', xp: 75, condition: 'phone' },
    ]
  },
  {
    category: 'Investor Milestones',
    items: [
      { id: 'invest_100', icon: '🌱', title: 'Seedling Investor', desc: 'Invested $100 or more', xp: 100, condition: 'invest_100' },
      { id: 'invest_500', icon: '📈', title: 'Rising Trader', desc: 'Invested $500 or more', xp: 250, condition: 'invest_500' },
      { id: 'invest_1000', icon: '💎', title: 'Diamond Hands', desc: 'Invested $1,000 or more', xp: 500, condition: 'invest_1000' },
      { id: 'invest_5000', icon: '🏆', title: 'Elite Investor', desc: 'Invested $5,000 or more', xp: 1000, condition: 'invest_5000' },
      { id: 'invest_10000', icon: '👑', title: 'Market King', desc: 'Invested $10,000 or more', xp: 2000, condition: 'invest_10000' },
    ]
  },
  {
    category: 'Trading Activity',
    items: [
      { id: 'first_withdraw', icon: '🏦', title: 'First Withdrawal', desc: 'Made your first withdrawal', xp: 200, condition: 'withdraw' },
      { id: 'copy_trader', icon: '📋', title: 'Copy Cat', desc: 'Started copying a top trader', xp: 150, condition: 'copy' },
      { id: 'multi_invest', icon: '🌍', title: 'Diversified', desc: 'Invested in 2+ different asset types', xp: 300, condition: 'multi' },
      { id: 'signal_user', icon: '📡', title: 'Signal Hunter', desc: 'Used trading signals', xp: 100, condition: 'signal' },
    ]
  },
  {
    category: 'Loyalty',
    items: [
      { id: 'week_1', icon: '📅', title: 'One Week In', desc: 'Account active for 7 days', xp: 100, condition: 'days_7' },
      { id: 'month_1', icon: '🗓', title: 'One Month Strong', desc: 'Account active for 30 days', xp: 300, condition: 'days_30' },
      { id: 'month_3', icon: '🎖', title: 'Loyal Trader', desc: 'Account active for 90 days', xp: 750, condition: 'days_90' },
      { id: 'referral', icon: '🤝', title: 'Team Builder', desc: 'Referred your first friend', xp: 500, condition: 'referral' },
    ]
  },
]

var RANKS = [
  { name: 'Bronze', min: 0, max: 499, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver', min: 500, max: 1499, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold', min: 1500, max: 3499, color: '#C9A84C', icon: '🥇' },
  { name: 'Platinum', min: 3500, max: 6999, color: '#3498db', icon: '💎' },
  { name: 'Diamond', min: 7000, max: 99999, color: '#9b59b6', icon: '👑' },
]

export default function AchievementsPage() {
  var router = useRouter()
  var [user, setUser] = useState(null)
  var [deposits, setDeposits] = useState([])
  var [withdrawals, setWithdrawals] = useState([])
  var [loading, setLoading] = useState(true)
  var [activeCategory, setActiveCategory] = useState('all')

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  useEffect(function() {
    var supabase = createClient()
    supabase.auth.getUser().then(function(res) {
      if (!res.data.user) { router.push('/login'); return }
      var uid = res.data.user.id

      supabase.from('users').select('*').eq('id', uid).single().then(function(r) {
        if (r.data) setUser(r.data)
      })

      supabase.from('deposits').select('*').eq('user_id', uid).eq('status', 'approved').then(function(r) {
        if (r.data) setDeposits(r.data)
      }).catch(function() {})

      supabase.from('withdrawal_requests').select('*').eq('user_id', uid).then(function(r) {
        if (r.data) setWithdrawals(r.data)
        setLoading(false)
      }).catch(function() { setLoading(false) })
    })
  }, [])

  function isUnlocked(condition) {
    if (!user) return false
    if (condition === 'always') return true
    if (condition === 'kyc') return user.kyc_status === 'approved'
    if (condition === 'deposit') return deposits.length > 0
    if (condition === 'phone') return !!user.phone
    if (condition === 'withdraw') return withdrawals.length > 0
    if (condition === 'copy') return false
    if (condition === 'multi') return false
    if (condition === 'signal') return false
    if (condition === 'referral') return false

    var totalDeposited = deposits.reduce(function(s, d) { return s + parseFloat(d.amount || 0) }, 0)
    if (condition === 'invest_100') return totalDeposited >= 100
    if (condition === 'invest_500') return totalDeposited >= 500
    if (condition === 'invest_1000') return totalDeposited >= 1000
    if (condition === 'invest_5000') return totalDeposited >= 5000
    if (condition === 'invest_10000') return totalDeposited >= 10000

    if (user.created_at) {
      var days = (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
      if (condition === 'days_7') return days >= 7
      if (condition === 'days_30') return days >= 30
      if (condition === 'days_90') return days >= 90
    }

    return false
  }

  var allItems = ALL_ACHIEVEMENTS.flatMap(function(cat) { return cat.items })
  var totalXP = allItems.filter(function(a) { return isUnlocked(a.condition) }).reduce(function(s, a) { return s + a.xp }, 0)
  var totalPossibleXP = allItems.reduce(function(s, a) { return s + a.xp }, 0)
  var unlockedCount = allItems.filter(function(a) { return isUnlocked(a.condition) }).length

  var currentRank = RANKS[0]
  for (var i = 0; i < RANKS.length; i++) {
    if (totalXP >= RANKS[i].min) currentRank = RANKS[i]
  }
  var nextRank = RANKS[RANKS.indexOf(currentRank) + 1]
  var rankProgress = nextRank ? ((totalXP - currentRank.min) / (nextRank.min - currentRank.min)) * 100 : 100

  var categories = ['all'].concat(ALL_ACHIEVEMENTS.map(function(c) { return c.category }))

  var displayedCategories = activeCategory === 'all'
    ? ALL_ACHIEVEMENTS
    : ALL_ACHIEVEMENTS.filter(function(c) { return c.category === activeCategory })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060a0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #1e2530', borderTopColor: G, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}} @keyframes unlock{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}'}</style>

      {/* Header */}
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={function() { router.back() }} style={{ width: 38, height: 38, borderRadius: 12, background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#8892a0' }}>←</button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>Achievements</div>
          <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>{unlockedCount} of {allItems.length} unlocked</div>
        </div>
      </div>

      {/* Rank card */}
      <div style={{ margin: '0 16px 20px', background: 'linear-gradient(135deg,' + currentRank.color + '15,' + currentRank.color + '05)', border: '1px solid ' + currentRank.color + '30', borderRadius: 22, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Current Rank</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 32 }}>{currentRank.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: currentRank.color }}>{currentRank.name}</div>
                <div style={{ fontSize: 12, color: '#4a5568' }}>{totalXP.toLocaleString()} XP total</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 4 }}>Achievements</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#e8edf5' }}>{unlockedCount}<span style={{ fontSize: 14, color: '#4a5568' }}>/{allItems.length}</span></div>
          </div>
        </div>

        {/* Rank progress */}
        {nextRank && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
              <span style={{ color: currentRank.color, fontWeight: 600 }}>{currentRank.name}</span>
              <span style={{ color: '#4a5568' }}>{(nextRank.min - totalXP).toLocaleString()} XP to {nextRank.name} {nextRank.icon}</span>
            </div>
            <div style={{ height: 8, background: '#1e2530', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: rankProgress + '%', height: '100%', background: 'linear-gradient(90deg,' + currentRank.color + ',' + (nextRank ? nextRank.color : currentRank.color) + ')', borderRadius: 4, transition: 'width .5s ease' }} />
            </div>
          </div>
        )}

        {/* XP breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16 }}>
          {[
            { label: 'Total XP', val: totalXP.toLocaleString(), color: G },
            { label: 'Max XP', val: totalPossibleXP.toLocaleString(), color: '#4a5568' },
            { label: 'Completion', val: Math.round((unlockedCount / allItems.length) * 100) + '%', color: '#2ecc71' },
          ].map(function(item) {
            return (
              <div key={item.label} style={{ background: 'rgba(0,0,0,.2)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.val}</div>
                <div style={{ fontSize: 9, color: '#4a5568', marginTop: 3 }}>{item.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* All ranks */}
      <div style={{ margin: '0 16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5', marginBottom: 12 }}>All Ranks</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {RANKS.map(function(rank) {
            var achieved = totalXP >= rank.min
            return (
              <div key={rank.name} style={{ flexShrink: 0, background: achieved ? rank.color + '15' : '#0d1117', border: '1px solid ' + (achieved ? rank.color + '40' : '#1e2530'), borderRadius: 14, padding: '12px 16px', textAlign: 'center', minWidth: 80, opacity: achieved ? 1 : 0.4 }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{rank.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: achieved ? rank.color : '#4a5568' }}>{rank.name}</div>
                <div style={{ fontSize: 9, color: '#4a5568', marginTop: 2 }}>{rank.min.toLocaleString()} XP</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category filter */}
      <div style={{ margin: '0 16px 20px', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map(function(cat) {
          var active = activeCategory === cat
          return (
            <button key={cat} onClick={function() { setActiveCategory(cat) }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, border: active ? 'none' : '1px solid #1e2530', background: active ? GG : '#0d1117', color: active ? '#060a0e' : '#4a5568', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: cat === 'all' ? 'capitalize' : 'none', whiteSpace: 'nowrap' }}>
              {cat === 'all' ? 'All' : cat}
            </button>
          )
        })}
      </div>

      {/* Achievements list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {displayedCategories.map(function(category) {
          return (
            <div key={category.category}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>{category.category}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {category.items.map(function(achievement) {
                  var unlocked = isUnlocked(achievement.condition)
                  return (
                    <div key={achievement.id} style={{ background: '#0d1117', border: '1px solid ' + (unlocked ? 'rgba(201,168,76,.25)' : '#1e2530'), borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 14, opacity: unlocked ? 1 : 0.5, position: 'relative', overflow: 'hidden' }}>
                      {unlocked && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#C9A84C,transparent)' }} />}

                      <div style={{ width: 52, height: 52, borderRadius: 16, background: unlocked ? 'rgba(201,168,76,.15)' : '#141920', border: '2px solid ' + (unlocked ? 'rgba(201,168,76,.3)' : '#1e2530'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, filter: unlocked ? 'none' : 'grayscale(1)' }}>
                        {achievement.icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: unlocked ? '#e8edf5' : '#4a5568' }}>{achievement.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: unlocked ? 'rgba(201,168,76,.1)' : 'rgba(30,37,48,.5)', borderRadius: 8, padding: '3px 8px' }}>
                            <span style={{ fontSize: 10, color: unlocked ? G : '#2a3140', fontWeight: 700 }}>+{achievement.xp} XP</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#4a5568', marginTop: 3 }}>{achievement.desc}</div>
                        {unlocked && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', display: 'inline-block' }} />
                            <span style={{ fontSize: 10, color: '#2ecc71', fontWeight: 600 }}>Unlocked</span>
                          </div>
                        )}
                        {!unlocked && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                            <span style={{ fontSize: 10, color: '#2a3140' }}>🔒 Locked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
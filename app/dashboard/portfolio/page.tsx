// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PortfolioPage() {
  var router = useRouter()
  var [user, setUser] = useState(null)
  var [deposits, setDeposits] = useState([])
  var [balanceData, setBalanceData] = useState(null)
  var [loading, setLoading] = useState(true)
  var [tick, setTick] = useState(0)

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

      supabase.from('balances').select('*').eq('user_id', uid).single().then(function(r) {
        if (r.data) setBalanceData(r.data)
      }).catch(function() {})

      supabase.from('deposits').select('*').eq('user_id', uid).eq('status', 'approved').order('created_at', { ascending: false }).then(function(r) {
        if (r.data) setDeposits(r.data)
        setLoading(false)
      }).catch(function() { setLoading(false) })
    })

    // Live ROI tick every 10 seconds
    var t = setInterval(function() { setTick(function(n) { return n + 1 }) }, 10000)
    return function() { clearInterval(t) }
  }, [])

  // Calculate live ROI for each investment
  function getLiveROI(deposit) {
    if (!deposit.created_at || !deposit.amount) return { earned: 0, percent: 0, daily: 0 }
    var amount = parseFloat(deposit.amount)
    var roi = parseFloat(deposit.roi_percent || deposit.roi || 3.5)
    var created = new Date(deposit.created_at)
    var now = new Date()
    var daysElapsed = (now - created) / (1000 * 60 * 60 * 24)
    var monthlyRate = roi / 100
    var dailyRate = monthlyRate / 30
    var earned = amount * dailyRate * daysElapsed
    var percent = (earned / amount) * 100
    return {
      earned: earned,
      percent: percent,
      daily: amount * dailyRate,
      daysElapsed: Math.floor(daysElapsed),
    }
  }

  var totalInvested = deposits.reduce(function(s, d) { return s + parseFloat(d.amount || 0) }, 0)
  var totalEarned = deposits.reduce(function(s, d) { return s + getLiveROI(d).earned }, 0)
  var totalValue = totalInvested + totalEarned
  var overallROI = totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0
  var dailyEarnings = deposits.reduce(function(s, d) { return s + getLiveROI(d).daily }, 0)

  var PLAN_COLORS = {
    crypto: '#F7931A',
    stock: '#2ecc71',
    stocks: '#2ecc71',
    forex: '#3498db',
    realestate: '#9b59b6',
    real: '#9b59b6',
  }

  function getPlanColor(plan) {
    if (!plan) return G
    var lower = plan.toLowerCase()
    for (var key in PLAN_COLORS) {
      if (lower.includes(key)) return PLAN_COLORS[key]
    }
    return G
  }

  function getPlanIcon(plan) {
    if (!plan) return '📈'
    var lower = plan.toLowerCase()
    if (lower.includes('crypto') || lower.includes('btc')) return '₿'
    if (lower.includes('stock')) return '📈'
    if (lower.includes('forex')) return '💱'
    if (lower.includes('real') || lower.includes('estate')) return '🏠'
    return '💰'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060a0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #1e2530', borderTopColor: G, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}'}</style>

      {/* Header */}
      <div style={{ padding: '52px 20px 20px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>Portfolio</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', animation: 'pulse 2s infinite' }} />
          <div style={{ fontSize: 12, color: '#2ecc71', fontWeight: 600 }}>Live ROI Tracking</div>
        </div>
      </div>

      {/* Total portfolio card */}
      <div style={{ margin: '0 16px 20px', background: 'linear-gradient(135deg,#0d1117,#141920)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 22, padding: '24px 20px', boxShadow: '0 8px 32px rgba(201,168,76,.08)' }}>
        <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Total Portfolio Value</div>
        <div style={{ fontSize: 38, fontWeight: 900, color: G, marginBottom: 4, animation: 'countUp .3s ease' }}>
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <span style={{ fontSize: 13, color: '#2ecc71', fontWeight: 700 }}>
            +${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} earned
          </span>
          <span style={{ fontSize: 11, color: '#4a5568' }}>({overallROI.toFixed(2)}% ROI)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: 'Invested', val: '$' + totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: '#8892a0' },
            { label: 'Total Profit', val: '$' + totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), color: '#2ecc71' },
            { label: 'Daily Earnings', val: '$' + dailyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), color: G },
          ].map(function(item) {
            return (
              <div key={item.label} style={{ background: '#141920', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.val}</div>
                <div style={{ fontSize: 9, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '.06em' }}>{item.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress bar */}
      {totalInvested > 0 && (
        <div style={{ margin: '0 16px 20px', background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
            <span style={{ color: '#8892a0', fontWeight: 600 }}>Portfolio Growth</span>
            <span style={{ color: '#2ecc71', fontWeight: 700 }}>+{overallROI.toFixed(3)}%</span>
          </div>
          <div style={{ height: 8, background: '#1e2530', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: Math.min(overallROI * 10, 100) + '%', height: '100%', background: 'linear-gradient(90deg,#C9A84C,#2ecc71)', borderRadius: 4, transition: 'width .5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#4a5568' }}>
            <span>0%</span>
            <span>Target: 8%</span>
          </div>
        </div>
      )}

      {/* Active investments */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>
          Active Investments ({deposits.length})
        </div>

        {deposits.length === 0 ? (
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8edf5', marginBottom: 8 }}>No Active Investments</div>
            <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 22 }}>Start investing to see your live portfolio here</div>
            <button onClick={function() { router.push('/dashboard/invest/crypto') }} style={{ padding: '13px 32px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Start Investing →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {deposits.map(function(dep) {
              var roi = getLiveROI(dep)
              var planColor = getPlanColor(dep.plan)
              var amount = parseFloat(dep.amount || 0)
              var currentValue = amount + roi.earned
              var progressPercent = Math.min((roi.percent / 8) * 100, 100)

              return (
                <div key={dep.id} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, padding: '20px', overflow: 'hidden', position: 'relative' }}>
                  {/* Glow accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,' + planColor + '60,transparent)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: planColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {getPlanIcon(dep.plan)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#e8edf5' }}>{dep.plan || 'Investment Plan'}</div>
                        <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>
                          {roi.daysElapsed} days active
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginBottom: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: 10, color: '#2ecc71', fontWeight: 700 }}>LIVE</span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#2ecc71' }}>
                        +${roi.earned.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                      </div>
                    </div>
                  </div>

                  {/* Value breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'Invested', val: '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: '#8892a0' },
                      { label: 'Profit', val: '+$' + roi.earned.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }), color: '#2ecc71' },
                      { label: 'Current Value', val: '$' + currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }), color: G },
                    ].map(function(item) {
                      return (
                        <div key={item.label} style={{ background: '#141920', borderRadius: 11, padding: '10px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: item.color, fontWeight: 700, marginBottom: 3 }}>{item.val}</div>
                          <div style={{ fontSize: 9, color: '#4a5568' }}>{item.label}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* ROI progress */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
                      <span style={{ color: '#4a5568' }}>ROI Progress</span>
                      <span style={{ color: planColor, fontWeight: 700 }}>{roi.percent.toFixed(4)}%</span>
                    </div>
                    <div style={{ height: 5, background: '#1e2530', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: progressPercent + '%', height: '100%', background: 'linear-gradient(90deg,' + planColor + ',#2ecc71)', borderRadius: 3, transition: 'width .3s ease' }} />
                    </div>
                  </div>

                  {/* Daily rate */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#141920', borderRadius: 11 }}>
                    <span style={{ fontSize: 12, color: '#4a5568' }}>Daily earnings rate</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: G }}>
                      +${roi.daily.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/day
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add more investment button */}
      {deposits.length > 0 && (
        <div style={{ padding: '20px 16px 0' }}>
          <button onClick={function() { router.push('/dashboard') }} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', borderRadius: 14, color: G, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            + Add New Investment
          </button>
        </div>
      )}
    </div>
  )
}
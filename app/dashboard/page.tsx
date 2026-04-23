// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardHome() {
  var router = useRouter()
  var [user, setUser] = useState(null)
  var [balance, setBalance] = useState(0)
  var [showBalance, setShowBalance] = useState(false)
  var [transactions, setTransactions] = useState([])
  var [notifications, setNotifications] = useState(0)
  var [bannerIndex, setBannerIndex] = useState(0)
  var [loading, setLoading] = useState(true)

  var BANNERS = [
    { bg: 'linear-gradient(135deg,#1a2a1a,#0d2010)', accent: '#2ecc71', icon: '📈', title: 'Earn Up to 8% Monthly', sub: 'Our Crypto Elite plan returns up to 8% every month. Start from just $50.' },
    { bg: 'linear-gradient(135deg,#1a1a2a,#0d1020)', accent: '#3498db', icon: '📊', title: 'Copy Top Traders', sub: 'Follow 400+ expert strategies and earn passively with zero effort.' },
    { bg: 'linear-gradient(135deg,#2a1a10,#201008)', accent: '#C9A84C', icon: '🏆', title: 'Refer and Earn 15%', sub: 'Invite friends and earn up to 15% commission on every deposit they make.' },
    { bg: 'linear-gradient(135deg,#1a102a,#100820)', accent: '#9b59b6', icon: '🏠', title: 'Real Estate Returns', sub: 'Invest in real estate from $200 and earn stable monthly returns.' },
  ]

  useEffect(function() {
    var supabase = createClient()
    supabase.auth.getUser().then(function(res) {
      if (!res.data.user) { router.push('/login'); return }
      var uid = res.data.user.id
      supabase.from('users').select('*').eq('id', uid).single().then(function(r) {
  if (r.data) setUser(r.data)
})

supabase.from('balances').select('*').eq('user_id', uid).single().then(function(r) {
  if (r.data) setUser(function(prev) {
    return Object.assign({}, prev, {
      balance: r.data.available_balance || 0,
      trading_balance: r.data.trading_balance || 0,
      crypto_balance: r.data.crypto_balance || 0,
      stocks_balance: r.data.stocks_balance || 0,
      affiliate_balance: r.data.affiliate_balance || 0,
      total_pnl: r.data.total_pnl || 0,
      pnl_percentage: r.data.pnl_percentage || 0,
    })
  })

      })
      supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(5).then(function(r) {
        if (r.data) setTransactions(r.data)
      }).catch(function() {})
      supabase.from('notifications').select('id').eq('user_id', uid).eq('is_read', false).then(function(r) {
        if (r.data) setNotifications(r.data.length)
      }).catch(function() {})
      setLoading(false)
    })

    var t = setInterval(function() {
      setBannerIndex(function(i) { return (i + 1) % 4 })
    }, 4000)
    return function() { clearInterval(t) }
  }, [])

  var INVEST_TYPES = [
    { id: 'crypto', icon: '₿', label: 'Crypto', color: '#F7931A', bg: 'rgba(247,147,26,.12)' },
    { id: 'stocks', icon: '📈', label: 'Stocks', color: '#2ecc71', bg: 'rgba(46,204,113,.12)' },
    { id: 'forex', icon: '💱', label: 'Forex', color: '#3498db', bg: 'rgba(52,152,219,.12)' },
    { id: 'realestate', icon: '🏠', label: 'Real Estate', color: '#9b59b6', bg: 'rgba(155,89,182,.12)' },
  ]

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060a0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #1e2530', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 20 }}>

      {/* ── HEADER ── */}
      <div style={{ padding: '52px 20px 16px' }}>
  {/* Company name top */}
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C9A84C" />
            <stop offset="1" stopColor="#F0D080" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#lg1)" />
        <polyline points="6,30 13,20 20,25 29,11 34,16" stroke="#060a0e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="29" cy="11" r="3" fill="#060a0e" />
        <line x1="6" y1="33" x2="34" y2="33" stroke="#060a0e" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
      <div>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#e8edf5', letterSpacing: '-0.3px', lineHeight: 1 }}>CapitalMarket <span style={{ color: '#C9A84C' }}>Pro</span></div>
        <div style={{ fontSize: 9, color: '#4a5568', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Global Trading Platform</div>
      </div>
    </div>
  </div>

  {/* User greeting row */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Link href="/dashboard/profile">
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0e', cursor: 'pointer', flexShrink: 0 }}>
          {user ? (user.full_name || user.username || 'U')[0].toUpperCase() : 'U'}
        </div>
      </Link>
      <div>
        <div style={{ fontSize: 14, color: '#8892a0' }}>
          Hey <span style={{ color: '#e8edf5', fontWeight: 700 }}>{user ? (user.full_name || user.username || 'Trader').split(' ')[0] : 'Trader'}</span> 👋
        </div>
        <Link href="/dashboard/kyc" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ fontSize: 11, color: '#8892a0' }}>KYC</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: user && user.kyc_status === 'approved' ? 'rgba(46,204,113,.15)' : 'rgba(231,76,60,.15)', color: user && user.kyc_status === 'approved' ? '#2ecc71' : '#e74c3c' }}>
              {user && user.kyc_status === 'approved' ? 'Verified' : 'Not Verified'}
            </span>
          </div>
        </Link>
      </div>
    </div>
    <Link href="/dashboard/more?tab=notifications">
      <div style={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <span style={{ fontSize: 20 }}>🔔</span>
        {notifications > 0 && (
          <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', border: '2px solid #060a0e' }}>
            {notifications > 9 ? '9+' : notifications}
          </div>
        )}
      </div>
    </Link>
  </div>
        <Link href="/dashboard/more?tab=notifications">
          <div style={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            {notifications > 0 && (
              <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', border: '2px solid #060a0e' }}>
                {notifications > 9 ? '9+' : notifications}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* ── BALANCE CARD ── */}
      <div style={{ margin: '0 16px 20px', background: 'linear-gradient(135deg,#0d1117,#141920)', border: '1px solid #1e2530', borderRadius: 20, padding: '22px 20px', boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Available Balance</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#141920', border: '1px solid #1e2530', borderRadius: 8, padding: '4px 10px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e8edf5' }}>USD</span>
            <span style={{ fontSize: 9, color: '#4a5568' }}>▾</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#e8edf5', letterSpacing: '-1px' }}>
            {showBalance ? '$' + (user && user.balance ? parseFloat(user.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00') : '$••••••••'}
          </div>
          <button onClick={function() { setShowBalance(!showBalance) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#4a5568', padding: 4 }}>
            {showBalance ? '🙈' : '👁'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            { icon: '↓', label: 'Deposit', href: '/dashboard/deposit', color: '#2ecc71' },
            { icon: '↑', label: 'Withdraw', href: '/dashboard/withdraw', color: '#e74c3c' },
            { icon: '◈', label: 'Signal', href: '/dashboard/signal', color: '#C9A84C' },
            { icon: '⇄', label: 'Convert', href: '/dashboard/convert', color: '#3498db' },
          ].map(function(action) {
            return (
              <Link key={action.label} href={action.href} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: action.color + '18', border: '1px solid ' + action.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: action.color, fontWeight: 800 }}>
                    {action.icon}
                  </div>
                  <span style={{ fontSize: 11, color: '#8892a0', fontWeight: 600 }}>{action.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── INVESTMENT TYPES ── */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5' }}>Investment Types</span>
          <Link href="/dashboard/invest" style={{ fontSize: 12, color: G, fontWeight: 600, textDecoration: 'none' }}>View All</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {INVEST_TYPES.map(function(type) {
            return (
              <Link key={type.id} href={'/dashboard/invest/' + type.id} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, transition: 'all .2s', cursor: 'pointer' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: type.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {type.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#8892a0', textAlign: 'center' }}>{type.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── BANNER CAROUSEL ── */}
      <div style={{ padding: '0 16px 20px', overflow: 'hidden' }}>
        <div style={{ background: BANNERS[bannerIndex].bg, borderRadius: 18, padding: '20px 22px', border: '1px solid rgba(255,255,255,.06)', transition: 'all .5s ease', minHeight: 110 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{BANNERS[bannerIndex].icon}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5', marginBottom: 5 }}>{BANNERS[bannerIndex].title}</div>
          <div style={{ fontSize: 12, color: '#8892a0', lineHeight: 1.6, marginBottom: 12 }}>{BANNERS[bannerIndex].sub}</div>
          <Link href="/register" style={{ fontSize: 12, color: BANNERS[bannerIndex].accent, fontWeight: 700, textDecoration: 'none' }}>Learn More →</Link>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
          {BANNERS.map(function(_, i) {
            return <div key={i} style={{ width: i === bannerIndex ? 20 : 6, height: 6, borderRadius: 3, background: i === bannerIndex ? G : '#1e2530', transition: 'all .3s' }} />
          })}
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS ── */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5' }}>Transactions</span>
          <Link href="/dashboard/history" style={{ fontSize: 12, color: G, fontWeight: 600, textDecoration: 'none' }}>View All</Link>
        </div>

        {transactions.length === 0 ? (
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '36px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14, color: '#4a5568' }}>No transactions yet</div>
            <div style={{ fontSize: 12, color: '#2a3140', marginTop: 6 }}>Make your first deposit to get started</div>
            <Link href="/dashboard/deposit">
              <button style={{ marginTop: 16, padding: '10px 24px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Deposit Now</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {transactions.map(function(tx) {
              var isCredit = tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral'
              return (
                <div key={tx.id} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isCredit ? 'rgba(46,204,113,.12)' : 'rgba(231,76,60,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {isCredit ? '↓' : '↑'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5', textTransform: 'capitalize' }}>{tx.type || 'Transaction'}</div>
                      <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isCredit ? '#2ecc71' : '#e74c3c' }}>
                      {isCredit ? '+' : '-'}${parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, color: tx.status === 'approved' ? '#2ecc71' : tx.status === 'pending' ? '#C9A84C' : '#e74c3c' }}>
                      {tx.status || 'pending'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
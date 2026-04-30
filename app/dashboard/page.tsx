// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardHome() {
  var router = useRouter()
  var [user, setUser] = useState(null)
  var [balances, setBalances] = useState(null)
  var [showBalance, setShowBalance] = useState(false)
  var [transactions, setTransactions] = useState([])
  var [notifications, setNotifications] = useState(0)
  var [bannerIndex, setBannerIndex] = useState(0)
  var [loading, setLoading] = useState(true)

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  var BANNERS = [
    { bg: 'linear-gradient(135deg,#1a2a1a,#0d2010)', accent: '#2ecc71', icon: '📈', title: 'Earn Up to 8% Monthly', sub: 'Our Crypto Elite plan returns up to 8% every month. Start from just $50.' },
    { bg: 'linear-gradient(135deg,#1a1a2a,#0d1020)', accent: '#3498db', icon: '📊', title: 'Copy Top Traders', sub: 'Follow 400+ expert strategies and earn passively with zero effort.' },
    { bg: 'linear-gradient(135deg,#2a1a10,#201008)', accent: '#C9A84C', icon: '🏆', title: 'Refer and Earn 15%', sub: 'Invite friends and earn up to 15% commission on every deposit they make.' },
    { bg: 'linear-gradient(135deg,#1a102a,#100820)', accent: '#9b59b6', icon: '🏠', title: 'Real Estate Returns', sub: 'Invest in real estate from $200 and earn stable monthly returns.' },
    { bg: 'linear-gradient(135deg,#1a1a10,#10100a)', accent: '#e67e22', icon: '🥇', title: 'Trade Gold and Oil', sub: 'Access global commodities markets with returns up to 3.5% monthly.' },
    { bg: 'linear-gradient(135deg,#10201a,#081510)', accent: '#1abc9c', icon: '⛓', title: 'DeFi Yields Up to 12%', sub: 'Earn the highest returns with our DeFi yield farming strategies.' },
  ]

  var INVEST_TYPES = [
    { id: 'crypto', icon: '₿', label: 'Crypto', color: '#F7931A', bg: 'rgba(247,147,26,.12)', href: '/dashboard/invest/crypto' },
    { id: 'stocks', icon: '📈', label: 'Stocks', color: '#2ecc71', bg: 'rgba(46,204,113,.12)', href: '/dashboard/invest/stocks' },
    { id: 'forex', icon: '💱', label: 'Forex', color: '#3498db', bg: 'rgba(52,152,219,.12)', href: '/dashboard/invest/forex' },
    { id: 'realestate', icon: '🏠', label: 'Real Estate', color: '#9b59b6', bg: 'rgba(155,89,182,.12)', href: '/dashboard/invest/realestate' },
    { id: 'commodities', icon: '🥇', label: 'Commodities', color: '#e67e22', bg: 'rgba(230,126,34,.12)', href: '/dashboard/invest/commodities' },
    { id: 'indices', icon: '📉', label: 'Indices', color: '#1abc9c', bg: 'rgba(26,188,156,.12)', href: '/dashboard/invest/indices' },
    { id: 'defi', icon: '⛓', label: 'DeFi', color: '#8e44ad', bg: 'rgba(142,68,173,.12)', href: '/dashboard/invest/defi' },
    { id: 'etf', icon: '🗂', label: 'ETF Funds', color: '#e74c3c', bg: 'rgba(231,76,60,.12)', href: '/dashboard/invest/etf' },
    { id: 'copy', icon: '📋', label: 'Copy Trade', color: '#C9A84C', bg: 'rgba(201,168,76,.12)', href: '/dashboard/copy' },
    { id: 'affiliate', icon: '🤝', label: 'Affiliate', color: '#2ecc71', bg: 'rgba(46,204,113,.12)', href: '/dashboard/affiliate' },
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
        if (r.data) setBalances(r.data)
      }).catch(function() {})
    // Realtime balance updates
supabase.channel('dashboard-balance-' + uid)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'balances',
    filter: 'user_id=eq.' + uid,
  }, function(payload) {
    if (payload.new) {
      setBalances(payload.new)
    }
  })
  .subscribe()

      supabase.from('deposits').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(5).then(function(r) {
        if (r.data) setTransactions(r.data)
      }).catch(function() {})

      supabase.from('notifications').select('id').eq('user_id', uid).eq('is_read', false).then(function(r) {
        if (r.data) setNotifications(r.data.length)
      }).catch(function() {})

      setLoading(false)
    })

    var t = setInterval(function() {
      setBannerIndex(function(i) { return (i + 1) % BANNERS.length })
    }, 4000)
    return function() { clearInterval(t) }
  }, [])

  var availableBalance = parseFloat(balances && balances.available_balance || 0)
  var tradingBalance = parseFloat(balances && balances.trading_balance || 0)
  var totalPnl = parseFloat(balances && balances.total_pnl || 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060a0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #1e2530', borderTopColor: G, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 20 }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}'}</style>

      {/* ── HEADER ── */}
      <div style={{ background: 'linear-gradient(135deg,#0d1117,#141920)', borderRadius: '0 0 28px 28px', padding: '56px 20px 24px', marginBottom: 20, borderBottom: '1px solid #1e2530' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard/profile">
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#060a0e', cursor: 'pointer', flexShrink: 0 }}>
                {user ? (user.full_name || user.username || 'U')[0].toUpperCase() : 'U'}
              </div>
            </Link>
            <div>
              <div style={{ fontSize: 16, color: '#8892a0' }}>
                Hey <span style={{ color: '#e8edf5', fontWeight: 800 }}>{user ? (user.full_name || user.username || 'Trader').split(' ')[0] : 'Trader'}</span> 👋
              </div>
              <Link href="/dashboard/kyc" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#8892a0' }}>KYC</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: user && user.kyc_status === 'approved' ? 'rgba(46,204,113,.15)' : 'rgba(231,76,60,.15)', color: user && user.kyc_status === 'approved' ? '#2ecc71' : '#e74c3c' }}>
                    {user && user.kyc_status === 'approved' ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </Link>
            </div>
          </div>
          <Link href="/dashboard/more">
            <div style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.05)', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 22 }}>🔔</span>
              {notifications > 0 && (
                <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', border: '2px solid #060a0e' }}>
                  {notifications > 9 ? '9+' : notifications}
                </div>
              )}
            </div>
          </Link>
        </div>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#e8edf5', letterSpacing: '-1px' }}>
            {showBalance
              ? '$' + availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })
              : '$••••••••'}
          </div>
          <button onClick={function() { setShowBalance(!showBalance) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#4a5568', padding: 4 }}>
            {showBalance ? '🙈' : '👁'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 18 }}>
          {[
            { label: 'Trading', val: showBalance ? '$' + tradingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••', color: G },
            { label: 'PnL', val: showBalance ? (totalPnl >= 0 ? '+' : '') + '$' + totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••', color: totalPnl >= 0 ? '#2ecc71' : '#e74c3c' },
            { label: 'Affiliate', val: showBalance ? '$' + parseFloat(balances && balances.affiliate_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••', color: '#3498db' },
          ].map(function(item) {
            return (
              <div key={item.label} style={{ background: '#141920', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.val}</div>
                <div style={{ fontSize: 9, color: '#4a5568', marginTop: 3 }}>{item.label}</div>
              </div>
            )
          })}
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
    <Link href="/dashboard/invests" style={{ fontSize: 12, color: '#3498db', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
    {[
      { icon: '📡', label: 'Live Trade', color: '#2ecc71', bg: 'rgba(46,204,113,.12)', href: '/dashboard/trading' },
      { icon: '📈', label: 'Stocks', color: '#3498db', bg: 'rgba(52,152,219,.12)', href: '/dashboard/invest/stocks' },
      { icon: '🏠', label: 'Real Estate', color: '#9b59b6', bg: 'rgba(155,89,182,.12)', href: '/dashboard/invest/realestate' },
      { icon: '🤝', label: 'Affiliate', color: '#C9A84C', bg: 'rgba(201,168,76,.12)', href: '/dashboard/affiliate' },
    ].map(function(type) {
      return (
        <Link key={type.label} href={type.href} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 6px', background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, cursor: 'pointer' }}
            onMouseEnter={function(e) { e.currentTarget.style.borderColor = type.color + '50' }}
            onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530' }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 14, background: type.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {type.icon}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#8892a0', textAlign: 'center', lineHeight: 1.3 }}>{type.label}</span>
          </div>
        </Link>
      )
    })}
  </div>
</div>
      {/* ── BANNER CAROUSEL ── */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ background: BANNERS[bannerIndex].bg, borderRadius: 18, padding: '20px 22px', border: '1px solid rgba(255,255,255,.06)', transition: 'all .5s ease', minHeight: 110 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{BANNERS[bannerIndex].icon}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5', marginBottom: 5 }}>{BANNERS[bannerIndex].title}</div>
          <div style={{ fontSize: 12, color: '#8892a0', lineHeight: 1.6, marginBottom: 12 }}>{BANNERS[bannerIndex].sub}</div>
          <Link href="/dashboard/invest" style={{ fontSize: 12, color: BANNERS[bannerIndex].accent, fontWeight: 700, textDecoration: 'none' }}>Learn More →</Link>
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
              <button style={{ marginTop: 16, padding: '10px 24px', background: GG, border: 'none', borderRadius: 10, color: '#060a0e', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Deposit Now
              </button>
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
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5', textTransform: 'capitalize' }}>{tx.type || 'Deposit'}</div>
                      <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isCredit ? '#2ecc71' : '#e74c3c' }}>
                      {isCredit ? '+' : '-'}${parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, color: tx.status === 'approved' ? '#2ecc71' : tx.status === 'pending' ? G : '#e74c3c' }}>
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
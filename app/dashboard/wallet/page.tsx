// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function WalletPage() {
  var router = useRouter()
  var [user, setUser] = useState(null)
  var [deposits, setDeposits] = useState([])
  var [showBalance, setShowBalance] = useState(true)

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
    })
  }, [])

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  var balance = user ? parseFloat(user.balance || 0) : 0
  var invested = user ? parseFloat(user.invested_amount || 0) : 0
  var profit = user ? parseFloat(user.total_profit || 0) : 0

  var CRYPTO_ASSETS = [
    { name: 'Bitcoin', sym: 'BTC', icon: '₿', color: '#F7931A', price: '$94,820', change: '+4.07%', up: true },
    { name: 'Ethereum', sym: 'ETH', icon: 'E', color: '#627EEA', price: '$3,240', change: '+1.87%', up: true },
    { name: 'Solana', sym: 'SOL', icon: 'S', color: '#9945FF', price: '$148.20', change: '+3.18%', up: true },
    { name: 'USDT', sym: 'USDT', icon: '₮', color: '#26A17B', price: '$1.00', change: '0.00%', up: true },
  ]

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>

      <div style={{ padding: '52px 20px 20px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>My Wallet</div>
        <div style={{ fontSize: 13, color: '#4a5568', marginTop: 3 }}>Your portfolio overview</div>
      </div>

      {/* Main balance */}
      <div style={{ margin: '0 16px 20px', background: 'linear-gradient(135deg,#0d1117,#141920)', border: '1px solid #1e2530', borderRadius: 20, padding: '24px 20px' }}>
        <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Total Portfolio Value</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#e8edf5' }}>
            {showBalance ? '$' + balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$••••••••'}
          </div>
          <button onClick={function() { setShowBalance(!showBalance) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#4a5568' }}>
            {showBalance ? '🙈' : '👁'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: 'Available', val: '$' + balance.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: '#2ecc71' },
            { label: 'Invested', val: '$' + invested.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: G },
            { label: 'Total Profit', val: '$' + profit.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: '#3498db' },
          ].map(function(item) {
            return (
              <div key={item.label} style={{ background: '#141920', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 5 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: item.color }}>
                  {showBalance ? item.val : '••••'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ margin: '0 16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Link href="/dashboard/deposit" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', padding: '14px', background: GG, border: 'none', borderRadius: 14, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>↓</span> Deposit
          </button>
        </Link>
        <Link href="/dashboard/withdraw" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(231,76,60,.4)', borderRadius: 14, color: '#e74c3c', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>↑</span> Withdraw
          </button>
        </Link>
      </div>

      {/* Crypto Assets */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Crypto Assets</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CRYPTO_ASSETS.map(function(asset) {
            return (
              <div key={asset.sym} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: asset.color + '20', border: '2px solid ' + asset.color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: asset.color }}>
                    {asset.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{asset.name}</div>
                    <div style={{ fontSize: 11, color: '#4a5568' }}>{asset.sym}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{asset.price}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: asset.up ? '#2ecc71' : '#e74c3c' }}>{asset.change}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent deposits */}
      {deposits.length > 0 && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5', marginBottom: 14 }}>Active Investments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {deposits.slice(0, 3).map(function(dep) {
              return (
                <div key={dep.id} style={{ background: '#0d1117', border: '1px solid rgba(46,204,113,.15)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5' }}>{dep.plan || 'Investment'}</div>
                    <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>{new Date(dep.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: G }}>${parseFloat(dep.amount).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: '#2ecc71', fontWeight: 600, marginTop: 2 }}>Active</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
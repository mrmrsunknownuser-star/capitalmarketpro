// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function HistoryPage() {
  var router = useRouter()
  var [deposits, setDeposits] = useState([])
  var [withdrawals, setWithdrawals] = useState([])
  var [loading, setLoading] = useState(true)
  var [tab, setTab] = useState('all')

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  useEffect(function() {
    var supabase = createClient()
    supabase.auth.getUser().then(function(res) {
      if (!res.data.user) { router.push('/login'); return }
      var uid = res.data.user.id

      // Fetch all deposits and trades
      supabase.from('deposits').select('*').eq('user_id', uid).order('created_at', { ascending: false }).then(function(r) {
        if (r.data) setDeposits(r.data)
      }).catch(function() {})

      // Fetch withdrawals
      supabase.from('withdrawal_requests').select('*').eq('user_id', uid).order('created_at', { ascending: false }).then(function(r) {
        if (r.data) setWithdrawals(r.data)
        setLoading(false)
      }).catch(function() { setLoading(false) })

      // Realtime new deposits and trades
      supabase.channel('history-deposits-' + uid)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'deposits',
          filter: 'user_id=eq.' + uid,
        }, function(payload) {
          if (payload.new) {
            setDeposits(function(prev) { return [payload.new, ...prev] })
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'deposits',
          filter: 'user_id=eq.' + uid,
        }, function(payload) {
          if (payload.new) {
            setDeposits(function(prev) {
              return prev.map(function(d) { return d.id === payload.new.id ? payload.new : d })
            })
          }
        })
        .subscribe()

      // Realtime withdrawals
      supabase.channel('history-withdrawals-' + uid)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'withdrawal_requests',
          filter: 'user_id=eq.' + uid,
        }, function(payload) {
          if (payload.new) {
            setWithdrawals(function(prev) { return [payload.new, ...prev] })
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'withdrawal_requests',
          filter: 'user_id=eq.' + uid,
        }, function(payload) {
          if (payload.new) {
            setWithdrawals(function(prev) {
              return prev.map(function(w) { return w.id === payload.new.id ? payload.new : w })
            })
          }
        })
        .subscribe()
    })
  }, [])

  // Build unified transaction list
  var allTx = []
  deposits.forEach(function(d) {
    var txType = d.type === 'profit' ? 'profit' : d.type === 'loss' ? 'loss' : 'deposit'
    allTx.push(Object.assign({}, d, { tx_type: txType }))
  })
  withdrawals.forEach(function(w) {
    allTx.push(Object.assign({}, w, { tx_type: 'withdrawal' }))
  })
  allTx.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at) })

  var filtered = allTx.filter(function(tx) {
    if (tab === 'deposits') return tx.tx_type === 'deposit'
    if (tab === 'trades') return tx.tx_type === 'profit' || tx.tx_type === 'loss'
    if (tab === 'withdrawals') return tx.tx_type === 'withdrawal'
    return true
  })

  // Summary stats
  var totalDeposited = deposits.filter(function(d) { return d.status === 'approved' && d.type !== 'profit' && d.type !== 'loss' }).reduce(function(s, d) { return s + parseFloat(d.amount || 0) }, 0)
  var totalWithdrawn = withdrawals.filter(function(w) { return w.status === 'approved' }).reduce(function(s, w) { return s + parseFloat(w.amount || 0) }, 0)
  var totalProfit = deposits.filter(function(d) { return d.type === 'profit' }).reduce(function(s, d) { return s + parseFloat(d.amount || 0) }, 0)
  var totalLoss = deposits.filter(function(d) { return d.type === 'loss' }).reduce(function(s, d) { return s + parseFloat(d.amount || 0) }, 0)
  var tradePnl = totalProfit - totalLoss

  function getTxIcon(tx) {
    if (tx.tx_type === 'profit') return '📈'
    if (tx.tx_type === 'loss') return '📉'
    if (tx.tx_type === 'withdrawal') return '↑'
    return '↓'
  }

  function getTxColor(tx) {
    if (tx.tx_type === 'profit') return 'rgba(46,204,113,.12)'
    if (tx.tx_type === 'loss') return 'rgba(231,76,60,.12)'
    if (tx.tx_type === 'withdrawal') return 'rgba(231,76,60,.12)'
    return 'rgba(46,204,113,.12)'
  }

  function isCredit(tx) {
    return tx.tx_type === 'deposit' || tx.tx_type === 'profit'
  }

  function getAmountColor(tx) {
    if (tx.tx_type === 'profit') return '#2ecc71'
    if (tx.tx_type === 'loss') return '#e74c3c'
    if (tx.tx_type === 'withdrawal') return '#e74c3c'
    return '#2ecc71'
  }

  function getStatusColor(status) {
    if (status === 'approved') return '#2ecc71'
    if (status === 'pending') return '#C9A84C'
    if (status === 'rejected') return '#e74c3c'
    return '#4a5568'
  }

  function getTxLabel(tx) {
    if (tx.tx_type === 'profit') return 'Trade Win'
    if (tx.tx_type === 'loss') return 'Trade Loss'
    if (tx.tx_type === 'withdrawal') return 'Withdrawal'
    return 'Deposit'
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30, fontFamily: 'Inter, sans-serif' }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}'}</style>

      {/* Header */}
      <div style={{ padding: '52px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>History</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', animation: 'pulse 2s infinite' }} />
              <div style={{ fontSize: 12, color: '#2ecc71', fontWeight: 600 }}>Live updating</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#4a5568' }}>{allTx.length} transactions</div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ margin: '0 16px 20px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        {[
          { label: 'Total Deposited', val: '$' + totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: '#2ecc71', icon: '↓' },
          { label: 'Total Withdrawn', val: '$' + totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: '#e74c3c', icon: '↑' },
          { label: 'Trade Profit', val: '$' + totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: '#2ecc71', icon: '📈' },
          { label: 'Trade P&L', val: (tradePnl >= 0 ? '+' : '') + '$' + tradePnl.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: tradePnl >= 0 ? '#2ecc71' : '#e74c3c', icon: '📊' },
        ].map(function(stat) {
          return (
            <div key={stat.label} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: '14px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{stat.icon}</span>
                <span style={{ fontSize: 10, color: '#4a5568' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.val}</div>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ margin: '0 16px 20px', display: 'flex', gap: 8 }}>
        {[['all', 'All'], ['deposits', 'Deposits'], ['trades', 'Trades'], ['withdrawals', 'Withdrawals']].map(function(t) {
          return (
            <button key={t[0]} onClick={function() { setTab(t[0]) }} style={{ flex: 1, padding: '9px 4px', borderRadius: 11, border: tab === t[0] ? 'none' : '1px solid #1e2530', background: tab === t[0] ? GG : '#0d1117', color: tab === t[0] ? '#060a0e' : '#4a5568', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {t[1]}
            </button>
          )
        })}
      </div>

      {/* Transaction list */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #1e2530', borderTopColor: G, borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5', marginBottom: 6 }}>No transactions yet</div>
            <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 20 }}>Your transaction history will appear here in real time</div>
            <button onClick={function() { router.push('/dashboard/deposit') }} style={{ padding: '12px 28px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Make First Deposit
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(function(tx) {
              return (
                <div key={tx.id + tx.tx_type} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>

                  {/* Left accent line for trades */}
                  {(tx.tx_type === 'profit' || tx.tx_type === 'loss') && (
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: tx.tx_type === 'profit' ? '#2ecc71' : '#e74c3c', borderRadius: '3px 0 0 3px' }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: getTxColor(tx), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {getTxIcon(tx)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{getTxLabel(tx)}</div>
                      {tx.plan && (
                        <div style={{ fontSize: 10, color: G, marginTop: 2, fontWeight: 600 }}>{tx.plan}</div>
                      )}
                      <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>{formatDate(tx.created_at)}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: getAmountColor(tx) }}>
                      {isCredit(tx) ? '+' : '-'}${parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, padding: '2px 8px', borderRadius: 100, display: 'inline-block', background: getStatusColor(tx.status) + '20', color: getStatusColor(tx.status) }}>
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
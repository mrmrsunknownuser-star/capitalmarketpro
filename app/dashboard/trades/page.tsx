'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function TradesPage() {
  const [balance, setBalance] = useState<any>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [deposits, setDeposits] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [tab, setTab] = useState<'overview' | 'trades' | 'deposits' | 'withdrawals'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bal } = await supabase.from('balances').select('*').eq('user_id', user.id).single()
      const { data: tr } = await supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
      const { data: dep } = await supabase.from('deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      const { data: wd } = await supabase.from('withdrawal_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setBalance(bal)
      setTrades(tr || [])
      setDeposits(dep || [])
      setWithdrawals(wd || [])
      setLoading(false)
    }
    init()
  }, [])

  const totalDeposited = deposits.filter(d => d.status === 'approved').reduce((s, d) => s + (d.amount || 0), 0)
  const totalWithdrawn = withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + (w.amount || 0), 0)
  const totalBalance = balance?.total_balance || 0
  const totalPnl = balance?.total_pnl || 0
  const statusColor = (s: string) => ({ pending: '#F7A600', approved: '#3fb950', rejected: '#f85149' }[s] || '#484f58')

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Portfolio</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Track your investments and trading history</div>
      </div>

      {/* Portfolio Summary */}
      <div style={{ background: 'linear-gradient(135deg,#0d1117,#161b22)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: 24, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%)' }} />
        <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Total Portfolio Value</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: totalPnl >= 0 ? '#3fb950' : '#f85149', fontWeight: 700 }}>
            {totalPnl >= 0 ? '▲' : '▼'} ${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: 11, color: '#484f58' }}>all time profit</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { l: 'Total Deposited', v: `$${totalDeposited.toLocaleString()}`, c: '#C9A84C' },
            { l: 'Total Withdrawn', v: `$${totalWithdrawn.toLocaleString()}`, c: '#f85149' },
            { l: 'Net Profit', v: `$${totalPnl.toLocaleString()}`, c: '#3fb950' },
          ].map(s => (
            <div key={s.l} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        <Link href="/dashboard/deposit" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>⬇</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#3fb950' }}>Deposit</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>Add funds</div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/withdraw" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>⬆</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f85149' }}>Withdraw</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>Send to wallet</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'trades', label: '🔄 Trades' },
          { id: 'deposits', label: '⬇ Deposits' },
          { id: 'withdrawals', label: '⬆ Withdrawals' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { icon: '💰', label: 'Main Balance', value: `$${(balance?.total_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#C9A84C' },
              { icon: '🔄', label: 'Trading Balance', value: `$${(balance?.trading_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#0052FF' },
              { icon: '📈', label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: totalPnl >= 0 ? '#3fb950' : '#f85149' },
              { icon: '📋', label: 'Total Trades', value: trades.length.toString(), color: '#7B2BF9' },
            ].map(item => (
              <div key={item.label} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>Recent Activity</div>
            {[...deposits.slice(0, 3).map(d => ({ ...d, kind: 'deposit' })), ...withdrawals.slice(0, 3).map(w => ({ ...w, kind: 'withdrawal' }))]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 6)
              .map((item, i, arr) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < arr.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: item.kind === 'deposit' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {item.kind === 'deposit' ? '⬇' : '⬆'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2, textTransform: 'capitalize' }}>{item.kind}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.kind === 'deposit' ? '#3fb950' : '#f85149' }}>
                      {item.kind === 'deposit' ? '+' : '-'}${item.amount?.toLocaleString()}
                    </div>
                    <span style={{ fontSize: 9, color: statusColor(item.status), background: `${statusColor(item.status)}18`, padding: '2px 7px', borderRadius: 10 }}>{item.status}</span>
                  </div>
                </div>
              ))}
            {deposits.length === 0 && withdrawals.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#484f58', fontSize: 13 }}>No activity yet. Make your first deposit!</div>
            )}
          </div>
        </div>
      )}

      {/* Trades */}
      {tab === 'trades' && (
        <div>
          {trades.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>No trades yet</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Start trading on the Markets page</div>
              <Link href="/dashboard/market">
                <button style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Go to Markets →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
              {trades.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < trades.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.direction === 'BUY' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                    {t.direction === 'BUY' ? '▲' : '▼'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{t.asset || 'BTC/USD'}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{t.direction} · {new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: (t.profit || 0) >= 0 ? '#3fb950' : '#f85149' }}>
                      {(t.profit || 0) >= 0 ? '+' : ''}${(t.profit || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>${(t.amount || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deposits */}
      {tab === 'deposits' && (
        <div>
          {deposits.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
              <div style={{ fontSize: 14, color: '#484f58', marginBottom: 20 }}>No deposits yet</div>
              <Link href="/dashboard/deposit">
                <button style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Make a Deposit →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
              {deposits.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < deposits.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(63,185,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>₿</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>Deposit · {d.crypto || 'BTC'}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{new Date(d.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#3fb950' }}>+${d.amount?.toLocaleString()}</div>
                    <span style={{ fontSize: 9, color: statusColor(d.status), background: `${statusColor(d.status)}18`, padding: '2px 7px', borderRadius: 10 }}>{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdrawals */}
      {tab === 'withdrawals' && (
        <div>
          {withdrawals.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⬆</div>
              <div style={{ fontSize: 14, color: '#484f58', marginBottom: 20 }}>No withdrawals yet</div>
              <Link href="/dashboard/withdraw">
                <button style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Withdraw Funds →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
              {withdrawals.map((w, i) => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < withdrawals.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⬆</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>Withdrawal · {w.network || 'BTC'}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{new Date(w.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f85149' }}>-${w.amount?.toLocaleString()}</div>
                    <span style={{ fontSize: 9, color: statusColor(w.status), background: `${statusColor(w.status)}18`, padding: '2px 7px', borderRadius: 10 }}>{w.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
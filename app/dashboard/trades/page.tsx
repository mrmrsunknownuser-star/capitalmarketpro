'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function TradesPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [balance, setBalance] = useState<any>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [deposits, setDeposits] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [activePlans, setActivePlans] = useState<any[]>([])
  const [tab, setTab] = useState<'overview' | 'plans' | 'trades' | 'deposits' | 'withdrawals'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [
        { data: bal },
        { data: tr },
        { data: dep },
        { data: wd },
        { data: plans },
      ] = await Promise.all([
        supabase.from('balances').select('*').eq('user_id', user.id).single(),
        supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('withdrawal_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('investment_plans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      setBalance(bal)
      setTrades(tr || [])
      setDeposits(dep || [])
      setWithdrawals(wd || [])
      setActivePlans(plans || [])
      setLoading(false)

      // Realtime balance
      supabase.channel(`trades-balance-${user.id}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'balances',
          filter: `user_id=eq.${user.id}`,
        }, payload => setBalance(payload.new))
        .subscribe()
    }
    init()
  }, [])

  const totalDeposited = deposits.filter(d => d.status === 'approved').reduce((s, d) => s + (d.amount || 0), 0)
  const totalWithdrawn = withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + (w.amount || 0), 0)
  const totalBalance = balance?.total_balance || 0
  const tradingBalance = balance?.trading_balance || 0
  const totalPnl = balance?.total_pnl || 0
  const activePlanCount = activePlans.filter(p => p.status === 'active').length
  const totalInvested = activePlans.filter(p => p.status === 'active').reduce((s, p) => s + (p.amount || 0), 0)
  const dailyEarnings = activePlans.filter(p => p.status === 'active').reduce((s, p) => s + (p.daily_profit || 0), 0)
  const tradeWins = trades.filter(t => (t.profit || 0) > 0).length
  const tradeLosses = trades.filter(t => (t.profit || 0) < 0).length
  const tradeWinRate = trades.length > 0 ? Math.round((tradeWins / trades.length) * 100) : 0

  const statusColor = (s: string) => ({
    pending: '#F7A600', approved: '#3fb950', rejected: '#f85149',
    active: '#3fb950', completed: '#0052FF',
  }[s] || '#484f58')

  const statusIcon = (s: string) => ({
    pending: '⏳', approved: '✅', rejected: '❌',
    active: '🟢', completed: '🏁',
  }[s] || '❓')

  const exportCSV = () => {
    const rows = [
      ['Type', 'Description', 'Amount (USD)', 'Status', 'Date'],
      ...deposits.map(d => ['Deposit', d.crypto || 'BTC', d.amount, d.status, new Date(d.created_at).toLocaleDateString()]),
      ...withdrawals.map(w => ['Withdrawal', w.network || 'BTC', w.amount, w.status, new Date(w.created_at).toLocaleDateString()]),
      ...trades.map(t => ['Trade', `${t.direction || 'BUY'} ${t.asset || 'BTC/USD'}`, t.amount, (t.profit || 0) >= 0 ? 'Win' : 'Loss', new Date(t.created_at).toLocaleDateString()]),
      ...activePlans.map(p => ['Investment', `${p.plan_name} Plan`, p.amount, p.status, new Date(p.created_at).toLocaleDateString()]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `capitalmarket-statement-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>
        <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
        <div style={{ height: 28, background: '#161b22', borderRadius: 8, width: '40%', marginBottom: 8, animation: 'pulse 1.5s ease infinite' }} />
        <div style={{ height: 14, background: '#161b22', borderRadius: 6, width: '25%', marginBottom: 24, animation: 'pulse 1.5s ease infinite' }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 12, animation: 'pulse 1.5s ease infinite' }}>
            <div style={{ height: 16, background: '#161b22', borderRadius: 6, width: '60%', marginBottom: 10 }} />
            <div style={{ height: 32, background: '#161b22', borderRadius: 6, width: '40%' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Portfolio</div>
          <div style={{ fontSize: 13, color: '#484f58' }}>Your complete investment history</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
            📥 CSV
          </button>
          <button onClick={async () => {
            const res = await fetch('/api/receipt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'statement',
                data: { amount: totalBalance, date: new Date().toISOString(), email: 'Your Account', status: 'approved' },
              }),
            })
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `statement-${new Date().toISOString().split('T')[0]}.html`
            a.click()
            URL.revokeObjectURL(url)
          }}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)', color: '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
            📄 Statement
          </button>
        </div>
      </div>

      {/* Portfolio Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0d1117,#161b22)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: 24, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Total Portfolio Value</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: '#e6edf3', lineHeight: 1, marginBottom: 8 }}>
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: 14, color: totalPnl >= 0 ? '#3fb950' : '#f85149', fontWeight: 700 }}>
            {totalPnl >= 0 ? '▲' : '▼'} ${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: 12, color: '#484f58' }}>all time profit</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            { l: 'Deposited', v: `$${totalDeposited.toLocaleString()}`, c: '#C9A84C' },
            { l: 'Withdrawn', v: `$${totalWithdrawn.toLocaleString()}`, c: '#f85149' },
            { l: 'Net Profit', v: `$${totalPnl.toLocaleString()}`, c: '#3fb950' },
            { l: 'Trading Bal', v: `$${tradingBalance.toLocaleString()}`, c: '#0052FF' },
          ].map(s => (
            <div key={s.l} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active investment banner */}
      {activePlanCount > 0 && (
        <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 10px #3fb950' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>
                {activePlanCount} Active Investment Plan{activePlanCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 11, color: '#484f58' }}>Total invested: ${totalInvested.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#484f58', marginBottom: 2 }}>Earning daily</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#3fb950' }}>+${dailyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { icon: '⬇', label: 'Deposit', href: '/dashboard/deposit', color: '#3fb950' },
          { icon: '⬆', label: 'Withdraw', href: '/dashboard/withdraw', color: '#f85149' },
          { icon: '💹', label: 'Invest', href: '/dashboard/invest', color: '#C9A84C' },
          { icon: '🎯', label: 'Trade', href: '/dashboard/trading', color: '#7B2BF9' },
        ].map(a => (
          <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: `${a.color}0d`, border: `1px solid ${a.color}33`, borderRadius: 12, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: a.color }}>{a.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'plans', label: `💹 Plans${activePlanCount > 0 ? ` (${activePlanCount})` : ''}` },
          { id: 'trades', label: `🎯 Trades${trades.length > 0 ? ` (${trades.length})` : ''}` },
          { id: 'deposits', label: `⬇ Deposits${deposits.length > 0 ? ` (${deposits.length})` : ''}` },
          { id: 'withdrawals', label: `⬆ Withdrawals${withdrawals.length > 0 ? ` (${withdrawals.length})` : ''}` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flexShrink: 0, padding: '9px 12px', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === t.id ? 700 : 400, whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { icon: '💰', label: 'Main Balance', value: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#C9A84C' },
              { icon: '🔄', label: 'Trading Balance', value: `$${tradingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#0052FF' },
              { icon: '📈', label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: totalPnl >= 0 ? '#3fb950' : '#f85149' },
              { icon: '💹', label: 'Active Plans', value: activePlanCount.toString(), color: '#3fb950' },
              { icon: '🎯', label: 'Total Trades', value: trades.length.toString(), color: '#7B2BF9' },
              { icon: '📊', label: 'Win Rate', value: `${tradeWinRate}%`, color: tradeWinRate >= 50 ? '#3fb950' : '#f85149' },
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

          {/* Trade stats */}
          {trades.length > 0 && (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 14 }}>🎯 Trading Statistics</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {[
                  { l: 'Total Trades', v: trades.length, c: '#e6edf3' },
                  { l: 'Wins', v: tradeWins, c: '#3fb950' },
                  { l: 'Losses', v: tradeLosses, c: '#f85149' },
                  { l: 'Win Rate', v: `${tradeWinRate}%`, c: tradeWinRate >= 50 ? '#3fb950' : '#f85149' },
                ].map(s => (
                  <div key={s.l} style={{ background: '#161b22', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#484f58', marginBottom: 4, textTransform: 'uppercase' }}>{s.l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>
              Recent Activity
            </div>
            {[
              ...deposits.slice(0, 3).map(d => ({ ...d, kind: 'deposit', icon: '⬇', color: '#3fb950' })),
              ...withdrawals.slice(0, 2).map(w => ({ ...w, kind: 'withdrawal', icon: '⬆', color: '#f85149' })),
              ...activePlans.slice(0, 2).map(p => ({ ...p, kind: 'plan', icon: '💹', color: '#C9A84C', amount: p.amount })),
              ...trades.slice(0, 3).map(t => ({ ...t, kind: 'trade', icon: t.direction === 'BUY' ? '▲' : '▼', color: (t.profit || 0) >= 0 ? '#3fb950' : '#f85149' })),
            ]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 8)
              .map((item, i, arr) => (
                <div key={`${item.kind}-${item.id || i}`} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < arr.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2, textTransform: 'capitalize' }}>
                      {item.kind === 'plan' ? `${(item as any).plan_name} Plan` : item.kind === 'trade' ? `${(item as any).direction} ${(item as any).asset || 'BTC/USD'}` : item.kind}
                    </div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.kind === 'withdrawal' ? '#f85149' : item.kind === 'trade' ? ((item as any).profit >= 0 ? '#3fb950' : '#f85149') : item.color }}>
                      {item.kind === 'withdrawal' ? '-' : item.kind === 'trade' ? ((item as any).profit >= 0 ? '+' : '') : '+'}
                      ${item.kind === 'trade' ? Math.abs((item as any).profit || 0).toFixed(2) : (item.amount || 0).toLocaleString()}
                    </div>
                    {item.kind !== 'plan' && item.kind !== 'trade' && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: statusColor((item as any).status), background: `${statusColor((item as any).status)}18`, padding: '2px 7px', borderRadius: 10 }}>
                        {(item as any).status}
                      </span>
                    )}
                  </div>
                </div>
              ))}

            {deposits.length === 0 && withdrawals.length === 0 && trades.length === 0 && activePlans.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 13, color: '#484f58', marginBottom: 20 }}>No activity yet. Make your first deposit!</div>
                <Link href="/dashboard/deposit">
                  <button style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                    Deposit Now →
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PLANS TAB ── */}
      {tab === 'plans' && (
        <div>
          {activePlans.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>💹</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>No investment plans yet</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Activate a plan to start earning daily returns</div>
              <Link href="/dashboard/invest">
                <button style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  View Investment Plans →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activePlans.map(plan => {
                const planColors: Record<string, string> = {
                  Starter: '#8b949e', Silver: '#8b949e', Gold: '#C9A84C',
                  Platinum: '#0052FF', Elite: '#7B2BF9', Black: '#e6edf3',
                }
                const color = planColors[plan.plan_name] || '#C9A84C'
                const daysLeft = Math.max(0, Math.ceil((new Date(plan.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                const daysCompleted = plan.duration_days - daysLeft
                const progress = Math.min(100, (daysCompleted / plan.duration_days) * 100)
                const earned = plan.daily_profit * daysCompleted

                return (
                  <div key={plan.id} style={{ background: '#0d1117', border: `1px solid ${color}33`, borderRadius: 16, padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color, textTransform: 'uppercase', marginBottom: 4 }}>{plan.plan_name} Plan</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#e6edf3' }}>${plan.amount?.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: '#484f58', marginTop: 2 }}>Invested · {new Date(plan.started_at).toLocaleDateString()}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: plan.status === 'active' ? '#3fb950' : '#0052FF', background: plan.status === 'active' ? 'rgba(63,185,80,0.1)' : 'rgba(0,82,255,0.1)', padding: '5px 12px', borderRadius: 20 }}>
                        {plan.status === 'active' ? '🟢 ACTIVE' : '🏁 COMPLETE'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
                      {[
                        { l: 'Daily ROI', v: `${plan.roi_percent}%`, c: color },
                        { l: 'Daily Profit', v: `$${plan.daily_profit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, c: '#3fb950' },
                        { l: 'Earned', v: `$${earned.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, c: '#C9A84C' },
                        { l: 'Total ROI', v: `$${plan.total_profit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, c: '#3fb950' },
                      ].map(s => (
                        <div key={s.l} style={{ background: '#161b22', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                          <div style={{ fontSize: 8, color: '#484f58', marginBottom: 4, textTransform: 'uppercase' }}>{s.l}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: s.c }}>{s.v}</div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#484f58', marginBottom: 6 }}>
                        <span>Day {daysCompleted} of {plan.duration_days}</span>
                        <span>{plan.status === 'completed' ? '✅ Completed' : `${daysLeft} days left`}</span>
                      </div>
                      <div style={{ height: 6, background: '#161b22', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${color},${color}cc)`, borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#484f58' }}>
                        <span>Started: {new Date(plan.started_at).toLocaleDateString()}</span>
                        <span>Ends: {new Date(plan.ends_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TRADES TAB ── */}
      {tab === 'trades' && (
        <div>
          {trades.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🎯</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>No trades yet</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Start trading on our live terminal</div>
              <Link href="/dashboard/trading">
                <button style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Open Live Trading →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{trades.length} Trades</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, color: '#3fb950' }}>✅ {tradeWins} wins</span>
                  <span style={{ fontSize: 11, color: '#f85149' }}>❌ {tradeLosses} losses</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: trades.reduce((s, t) => s + (t.profit || 0), 0) >= 0 ? '#3fb950' : '#f85149' }}>
                    {trades.reduce((s, t) => s + (t.profit || 0), 0) >= 0 ? '+' : ''}${trades.reduce((s, t) => s + (t.profit || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
              {trades.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < trades.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: (t.profit || 0) >= 0 ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {t.direction === 'BUY' ? '▲' : '▼'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{t.asset || 'BTC/USD'}</span>
                      <span style={{ fontSize: 10, color: t.direction === 'BUY' ? '#3fb950' : '#f85149', background: t.direction === 'BUY' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>{t.direction || 'BUY'}</span>
                      {t.leverage && t.leverage > 1 && (
                        <span style={{ fontSize: 10, color: '#7B2BF9', background: 'rgba(123,43,249,0.1)', padding: '1px 7px', borderRadius: 4 }}>{t.leverage}x</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>
                      ${(t.amount || 0).toLocaleString()} · {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: (t.profit || 0) >= 0 ? '#3fb950' : '#f85149', marginBottom: 2 }}>
                      {(t.profit || 0) >= 0 ? '+' : ''}${(t.profit || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: (t.profit || 0) >= 0 ? '#3fb950' : '#f85149' }}>
                      {(t.profit || 0) >= 0 ? 'WIN' : 'LOSS'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DEPOSITS TAB ── */}
      {tab === 'deposits' && (
        <div>
          {deposits.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>💰</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>No deposits yet</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Make your first deposit to start investing</div>
              <Link href="/dashboard/deposit">
                <button style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Deposit Now →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{deposits.length} Deposits</div>
                <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 700 }}>Total: ${totalDeposited.toLocaleString()}</div>
              </div>
              {deposits.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < deposits.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>₿</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>Deposit · {d.crypto || 'BTC'}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>
                      {d.tx_hash ? `TX: ${d.tx_hash.slice(0, 14)}...` : 'No TX hash'} · {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#3fb950', marginBottom: 4 }}>+${d.amount?.toLocaleString()}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: statusColor(d.status), background: `${statusColor(d.status)}18`, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>
                        {statusIcon(d.status)} {d.status}
                      </span>
                      {d.status === 'approved' && (
                        <button
                          onClick={async () => {
                            const res = await fetch('/api/receipt', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                type: 'deposit',
                                data: { amount: d.amount, crypto: d.crypto, txHash: d.tx_hash, date: d.created_at, email: 'Your Account', status: 'approved' },
                              }),
                            })
                            const blob = await res.blob()
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `receipt-${(d.id || '').slice(0, 8)}.html`
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                          style={{ fontSize: 9, color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontFamily: 'monospace' }}>
                          📄 Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── WITHDRAWALS TAB ── */}
      {tab === 'withdrawals' && (
        <div>
          {withdrawals.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>⬆</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>No withdrawals yet</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Withdraw your profits to your crypto wallet</div>
              <Link href="/dashboard/withdraw">
                <button style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Withdraw Now →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{withdrawals.length} Withdrawals</div>
                <div style={{ fontSize: 12, color: '#f85149', fontWeight: 700 }}>Total: ${totalWithdrawn.toLocaleString()}</div>
              </div>
              {withdrawals.map((w, i) => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < withdrawals.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⬆</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>Withdrawal · {w.network || 'BTC'}</div>
                    <div style={{ fontSize: 10, color: '#484f58' }}>
                      {w.wallet_address ? `To: ${w.wallet_address.slice(0, 14)}...` : 'No wallet'} · {new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f85149', marginBottom: 4 }}>-${w.amount?.toLocaleString()}</div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: statusColor(w.status), background: `${statusColor(w.status)}18`, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>
                      {statusIcon(w.status)} {w.status}
                    </span>
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
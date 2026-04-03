'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0, newUsersToday: 0,
    totalDeposits: 0, pendingDeposits: 0,
    totalWithdrawals: 0, pendingWithdrawals: 0,
    totalBalance: 0, kycPending: 0,
    totalCards: 0, pendingCards: 0,
    supportMessages: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentDeposits, setRecentDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const [
        { count: totalUsers },
        { count: newUsersToday },
        { data: deposits },
        { data: withdrawals },
        { data: balances },
        { count: kycPending },
        { count: pendingCards },
        { count: supportMessages },
        { data: recentU },
        { data: recentD },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('deposits').select('amount, status'),
        supabase.from('withdrawal_requests').select('amount, status'),
        supabase.from('balances').select('total_balance'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
        supabase.from('card_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('support_messages').select('*', { count: 'exact', head: true }).eq('sender_role', 'user').eq('is_read', false),
        supabase.from('users').select('id, email, full_name, created_at, kyc_status').order('created_at', { ascending: false }).limit(5),
        supabase.from('deposits').select('amount, status, created_at, user:users(email)').order('created_at', { ascending: false }).limit(5),
      ])

      const totalDep = deposits?.reduce((s, d) => s + (d.amount || 0), 0) || 0
      const pendingDep = deposits?.filter(d => d.status === 'pending').reduce((s, d) => s + (d.amount || 0), 0) || 0
      const totalWd = withdrawals?.reduce((s, w) => s + (w.amount || 0), 0) || 0
      const pendingWd = withdrawals?.filter(w => w.status === 'pending').reduce((s, w) => s + (w.amount || 0), 0) || 0
      const totalBal = balances?.reduce((s, b) => s + (b.total_balance || 0), 0) || 0

      setStats({
        totalUsers: totalUsers || 0, newUsersToday: newUsersToday || 0,
        totalDeposits: totalDep, pendingDeposits: pendingDep,
        totalWithdrawals: totalWd, pendingWithdrawals: pendingWd,
        totalBalance: totalBal, kycPending: kycPending || 0,
        totalCards: 0, pendingCards: pendingCards || 0,
        supportMessages: supportMessages || 0,
      })
      setRecentUsers(recentU || [])
      setRecentDeposits(recentD || [])
      setLoading(false)
    }
    init()
  }, [])

  const cards = [
    { icon: '👥', label: 'Total Users', value: stats.totalUsers, sub: `+${stats.newUsersToday} today`, color: '#C9A84C', href: '/admin/users' },
    { icon: '💰', label: 'Total Deposits', value: `$${stats.totalDeposits.toLocaleString()}`, sub: `$${stats.pendingDeposits.toLocaleString()} pending`, color: '#3fb950', href: '/admin/deposits' },
    { icon: '⬆', label: 'Total Withdrawals', value: `$${stats.totalWithdrawals.toLocaleString()}`, sub: `$${stats.pendingWithdrawals.toLocaleString()} pending`, color: '#f85149', href: '/admin/withdrawals' },
    { icon: '💼', label: 'Assets Under Mgmt', value: `$${stats.totalBalance.toLocaleString()}`, sub: 'Total user balances', color: '#7B2BF9', href: '/admin/balances' },
    { icon: '🪪', label: 'KYC Pending', value: stats.kycPending, sub: 'Awaiting review', color: '#F7A600', href: '/admin/users' },
    { icon: '💳', label: 'Card Applications', value: stats.pendingCards, sub: 'Pending approval', color: '#0052FF', href: '/admin/cards' },
    { icon: '💬', label: 'Unread Messages', value: stats.supportMessages, sub: 'Support inbox', color: '#7B2BF9', href: '/admin/support' },
    { icon: '📈', label: 'Platform Revenue', value: `$${(stats.totalDeposits * 0.05).toLocaleString()}`, sub: '5% processing fees', color: '#C9A84C', href: '/admin/deposits' },
  ]

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Admin Overview</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Platform performance at a glance</div>
      </div>

      {/* Alert bar */}
      {(stats.kycPending > 0 || stats.pendingCards > 0 || stats.pendingDeposits > 0) && (
        <div style={{ background: 'rgba(247,166,0,0.08)', border: '1px solid rgba(247,166,0,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#F7A600', marginBottom: 4 }}>Actions Required</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {stats.kycPending > 0 && <Link href="/admin/users" style={{ textDecoration: 'none', fontSize: 12, color: '#8b949e' }}>{stats.kycPending} KYC pending →</Link>}
              {stats.pendingCards > 0 && <Link href="/admin/cards" style={{ textDecoration: 'none', fontSize: 12, color: '#8b949e' }}>{stats.pendingCards} card applications →</Link>}
              {stats.pendingDeposits > 0 && <Link href="/admin/deposits" style={{ textDecoration: 'none', fontSize: 12, color: '#8b949e' }}>${stats.pendingDeposits.toLocaleString()} deposits pending →</Link>}
              {stats.supportMessages > 0 && <Link href="/admin/support" style={{ textDecoration: 'none', fontSize: 12, color: '#8b949e' }}>{stats.supportMessages} unread messages →</Link>}
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {cards.map(card => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#0d1117', border: `1px solid ${card.color}22`, borderRadius: 14, padding: '18px 16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = card.color + '66')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = card.color + '22')}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: card.color, marginBottom: 4 }}>{loading ? '...' : card.value}</div>
              <div style={{ fontSize: 11, color: '#e6edf3', fontWeight: 600, marginBottom: 3 }}>{card.label}</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>{card.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Recent Users */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>👥 Recent Users</div>
            <Link href="/admin/users" style={{ fontSize: 11, color: '#C9A84C', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentUsers.map((user, i) => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: i < recentUsers.length - 1 ? '1px solid #161b22' : 'none', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
                {(user.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name || 'No name'}</div>
                <div style={{ fontSize: 10, color: '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
              <span style={{ fontSize: 9, color: user.kyc_status === 'approved' ? '#3fb950' : '#F7A600', background: user.kyc_status === 'approved' ? 'rgba(63,185,80,0.1)' : 'rgba(247,166,0,0.1)', padding: '2px 7px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
                {user.kyc_status}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Deposits */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>💰 Recent Deposits</div>
            <Link href="/admin/deposits" style={{ fontSize: 11, color: '#C9A84C', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentDeposits.map((dep, i) => (
            <div key={dep.id || i} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: i < recentDeposits.length - 1 ? '1px solid #161b22' : 'none', gap: 10 }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>₿</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(dep.user as any)?.email || 'Unknown'}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>{new Date(dep.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C' }}>${dep.amount?.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: dep.status === 'approved' ? '#3fb950' : dep.status === 'pending' ? '#F7A600' : '#f85149', fontWeight: 700 }}>{dep.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 14 }}>⚡ Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
  { label: '💰 Set Balance', href: '/admin/balances' },
  { label: '✅ Review KYC', href: '/admin/users' },
  { label: '⬆ Withdrawals', href: '/admin/withdrawals' },
  { label: '💳 Card Apps', href: '/admin/cards' },
  { label: '📢 Notify Users', href: '/admin/notifications' },
  { label: '💬 Support', href: '/admin/support' },
  { label: '⚙ Settings', href: '/admin/settings' },
  { label: '💰 Credit Daily Profits', href: '#', onClick: async () => {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('credit_daily_profits')
  if (error) alert('Error: ' + error.message)
  else alert('✅ ' + data)
}}
].map(a => (
  <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
    <button style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
      {a.label}
    </button>
  </Link>
))}
{/* Credit profits button */}
<button
  onClick={async () => {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('credit_daily_profits')
    if (error) alert('Error: ' + error.message)
    else { alert('✅ ' + data); window.location.reload() }
  }}
  style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.08)', color: '#3fb950', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
  💰 Credit Daily Profits
</button>
        </div>
      </div>
    </div>
  )
}
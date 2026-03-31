'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingWithdrawals: 0,
    pendingKYC: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const { count: activeUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active')
      const { count: pendingWithdrawals } = await supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      const { count: pendingKYC } = await supabase.from('kyc_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        pendingWithdrawals: pendingWithdrawals || 0,
        pendingKYC: pendingKYC || 0,
      })
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#0052FF', href: '/admin/users' },
    { label: 'Active Users', value: stats.activeUsers, icon: '✅', color: '#3fb950', href: '/admin/users' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: '⏳', color: '#F7A600', href: '/admin/withdrawals' },
    { label: 'Pending KYC', value: stats.pendingKYC, icon: '🪪', color: '#f85149', href: '/admin/users' },
  ]

  const quickActions = [
    { label: 'Manage Users', desc: 'View, activate, suspend accounts', icon: '👥', href: '/admin/users', color: '#0052FF' },
    { label: 'Set Balances', desc: 'Update user balances & P&L', icon: '💰', href: '/admin/balances', color: '#C9A84C' },
    { label: 'Withdrawals', desc: 'Approve or reject requests', icon: '⬆', href: '/admin/withdrawals', color: '#F7A600' },
    { label: 'Notifications', desc: 'Send alerts to users', icon: '🔔', href: '/admin/notifications', color: '#00B386' },
    { label: 'Support Chat', desc: 'Respond to user messages', icon: '💬', href: '/admin/support', color: '#7B2BF9' },
  ]

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Admin Dashboard</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Platform overview and control center</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#0d1117', border: `1px solid ${s.color}22`, borderRadius: 12, padding: 20, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#8b949e' }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: `${a.color}0d`, border: `1px solid ${a.color}33`, borderRadius: 10, padding: 16, cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.4 }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Recent Admin Activity</div>
        {[
          { action: 'Balance updated', user: 'john@example.com', detail: 'Set balance to $5,000', time: '2m ago', color: '#C9A84C' },
          { action: 'Withdrawal approved', user: 'sarah@example.com', detail: '$1,200 BTC withdrawal', time: '15m ago', color: '#3fb950' },
          { action: 'User activated', user: 'mike@example.com', detail: 'KYC approved', time: '1h ago', color: '#0052FF' },
          { action: 'Notification sent', user: 'All users', detail: 'System maintenance alert', time: '2h ago', color: '#F7A600' },
          { action: 'Withdrawal rejected', user: 'alex@example.com', detail: 'Insufficient verification', time: '3h ago', color: '#f85149' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 4 ? '1px solid #161b22' : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#e6edf3', marginBottom: 2 }}>
                <strong>{item.action}</strong> — {item.user}
              </div>
              <div style={{ fontSize: 11, color: '#484f58' }}>{item.detail}</div>
            </div>
            <div style={{ fontSize: 11, color: '#484f58' }}>{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
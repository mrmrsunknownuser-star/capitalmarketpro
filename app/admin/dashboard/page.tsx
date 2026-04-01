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

     {/* Account Manager */}
<div style={{ marginBottom: 28 }}>
  <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>
    👤 Your Account Manager
  </div>
  <div style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>

    {/* Background glow */}
    <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

    {/* Avatar */}
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#060a0f', border: '3px solid rgba(201,168,76,0.5)', boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
        JE
      </div>
      <div style={{ position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: '50%', background: '#3fb950', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, border: '2px solid #0d1117', boxShadow: '0 0 8px rgba(63,185,80,0.5)' }}>✓</div>
    </div>

    {/* Info */}
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3' }}>Joshua C. Elder</div>
        <div style={{ fontSize: 10, color: '#3fb950', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.25)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>● ONLINE</div>
        <div style={{ fontSize: 10, color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>👑 GENERAL MANAGER</div>
      </div>

      <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600, marginBottom: 10 }}>
        Senior Portfolio Manager · CapitalMarket Pro
      </div>

      <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 16, maxWidth: 600 }}>
        Joshua C. Elder is a veteran financial strategist with over 14 years of experience managing high-net-worth portfolios across cryptocurrency, equities, and alternative investments. Formerly a Vice President at Goldman Sachs Asset Management, Joshua has overseen portfolios totaling over <strong style={{ color: '#C9A84C' }}>$2.4 billion</strong> in assets. He holds a CFA designation and is a registered investment advisor. At CapitalMarket Pro, Joshua personally oversees all investment plans and ensures every client receives maximum returns from our automated trading system.
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        {[
          { v: '14+', l: 'Years Experience', color: '#C9A84C' },
          { v: '$2.4B+', l: 'Assets Managed', color: '#3fb950' },
          { v: '4,800+', l: 'Clients Served', color: '#0052FF' },
          { v: '84%', l: 'Avg Win Rate', color: '#7B2BF9' },
        ].map(s => (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 10, color: '#484f58' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Credentials */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {['CFA Certified', 'Goldman Sachs Alumni', 'SEC Registered', 'FINRA Licensed'].map(c => (
          <div key={c} style={{ fontSize: 10, color: '#8b949e', background: '#161b22', border: '1px solid #21262d', padding: '4px 10px', borderRadius: 20 }}>✓ {c}</div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link href="/dashboard/support">
          <button style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            💬 Message Joshua
          </button>
        </Link>
        <Link href="/dashboard/invest">
          <button style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)', color: '#C9A84C', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
            💹 View Investment Plans
          </button>
        </Link>
      </div>
    </div>

    {/* Right side — availability card */}
    <div style={{ flexShrink: 0, minWidth: 160 }}>
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Availability</div>
        {[
          { label: 'Response Time', value: '< 2 hours', color: '#3fb950' },
          { label: 'Working Hours', value: '24/7', color: '#C9A84C' },
          { label: 'Languages', value: 'EN, ES, FR', color: '#8b949e' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #161b22' }}>
            <span style={{ fontSize: 10, color: '#484f58' }}>{item.label}</span>
            <span style={{ fontSize: 10, color: item.color, fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#3fb950', fontWeight: 700, marginBottom: 3 }}>🟢 Available Now</div>
        <div style={{ fontSize: 10, color: '#484f58' }}>Ready to assist you</div>
      </div>
    </div>
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
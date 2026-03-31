'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { icon: '▦', label: 'Dashboard', href: '/admin/dashboard' },
  { icon: '👥', label: 'Users', href: '/admin/users' },
  { icon: '💰', label: 'Balances', href: '/admin/balances' },
  { icon: '⬆', label: 'Withdrawals', href: '/admin/withdrawals' },
  { icon: '🔔', label: 'Notifications', href: '/admin/notifications' },
  { icon: '💬', label: 'Support', href: '/admin/support' },
  { icon: '📋', label: 'Audit Log', href: '/admin/audit' },
  { icon: '⚙', label: 'Settings', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [stats, setStats] = useState({ users: 0, pending: 0 })

  useEffect(() => {
    if (pathname === '/admin/login') return
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/admin/login'); return }
      const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user')
      const { count: pending } = await supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      setStats({ users: users || 0, pending: pending || 0 })
    }
    check()
  }, [pathname])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh', display: 'flex' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 998 }} />
      )}

      {/* Sidebar */}
      <div style={{
        width: 220, background: '#0d1117', borderRight: '1px solid #161b22',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, height: '100vh', zIndex: 999, overflowY: 'auto',
        transition: 'transform 0.3s ease',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }} className="admin-sidebar">

        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #161b22' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #f85149, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#fff', flexShrink: 0 }}>A</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f85149', lineHeight: 1.2 }}>ADMIN PANEL</div>
              <div style={{ fontSize: 9, color: '#484f58', letterSpacing: '0.08em' }}>CapitalMarket Pro</div>
            </div>
          </div>
          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: '#161b22', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>{stats.users}</div>
              <div style={{ fontSize: 9, color: '#484f58' }}>Users</div>
            </div>
            <div style={{ background: '#161b22', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#F7A600' }}>{stats.pending}</div>
              <div style={{ fontSize: 9, color: '#484f58' }}>Pending</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, marginBottom: 2, background: active ? 'rgba(248,81,73,0.1)' : 'transparent', borderLeft: active ? '2px solid #f85149' : '2px solid transparent' }}>
                  <span style={{ fontSize: 15, flexShrink: 0, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: active ? '#e6edf3' : '#8b949e' }}>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* View Site + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #161b22', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/" target="_blank" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '9px 12px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, fontSize: 12, color: '#C9A84C', textAlign: 'center', cursor: 'pointer' }}>
              🌐 View Site
            </div>
          </Link>
          <button onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/admin/login')
          }} style={{ padding: '9px 12px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, color: '#f85149', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 220, minWidth: 0 }} className="admin-main">
        {/* Topbar */}
        <div style={{ background: '#0d1117', borderBottom: '1px solid #161b22', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="admin-hamburger" style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: 22, cursor: 'pointer', display: 'none' }}>☰</button>
            <div style={{ fontSize: 12, color: '#484f58' }}>Admin Control Panel</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 10, color: '#f85149', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', padding: '4px 12px', borderRadius: 20 }}>🔴 ADMIN</div>
            {stats.pending > 0 && (
              <Link href="/admin/withdrawals" style={{ textDecoration: 'none' }}>
                <div style={{ fontSize: 10, color: '#F7A600', background: 'rgba(247,166,0,0.1)', border: '1px solid rgba(247,166,0,0.2)', padding: '4px 12px', borderRadius: 20, cursor: 'pointer' }}>
                  ⏳ {stats.pending} pending
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#060a0f' }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-hamburger { display: block !important; }
          .admin-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
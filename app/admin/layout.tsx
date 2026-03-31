'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { icon: '▦', label: 'Dashboard', href: '/admin/dashboard' },
  { icon: '👥', label: 'Users', href: '/admin/users' },
  { icon: '💰', label: 'Balances', href: '/admin/balances' },
  { icon: '⬆', label: 'Withdrawals', href: '/admin/withdrawals' },
  { icon: '🔔', label: 'Notifications', href: '/admin/notifications' },
  { icon: '💬', label: 'Support', href: '/admin/support' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: open ? 220 : 68, background: '#0d1117', borderRight: '1px solid #161b22', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #f85149, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>A</div>
          {open && <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f85149', letterSpacing: '0.08em' }}>ADMIN</div>
            <div style={{ fontSize: 10, color: '#484f58' }}>VaultFlow Control</div>
          </div>}
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, marginBottom: 2, background: active ? 'rgba(248,81,73,0.1)' : 'transparent', borderLeft: active ? '2px solid #f85149' : '2px solid transparent', cursor: 'pointer' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center' }}>{item.icon}</span>
                  {open && <span style={{ fontSize: 13, color: active ? '#e6edf3' : '#8b949e', whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Collapse */}
        <div onClick={() => setOpen(!open)} style={{ padding: '12px 16px', borderTop: '1px solid #161b22', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#484f58', fontSize: 14 }}>{open ? '◁' : '▷'}</span>
          {open && <span style={{ fontSize: 12, color: '#484f58' }}>Collapse</span>}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ background: '#0d1117', borderBottom: '1px solid #161b22', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: '#8b949e' }}>Admin Control Panel</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 11, color: '#484f58', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', padding: '4px 10px', borderRadius: 20 }}>
              🔴 ADMIN
            </div>
            <Link href="/admin/login" style={{ textDecoration: 'none' }}>
              <div style={{ fontSize: 12, color: '#8b949e', cursor: 'pointer' }}>Logout →</div>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#060a0f' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
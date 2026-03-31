'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { icon: '▦', label: 'Overview', href: '/dashboard' },
  { icon: '📊', label: 'Portfolio', href: '/dashboard/portfolio' },
  { icon: '↕', label: 'Trades', href: '/dashboard/trades' },
  { icon: '⚡', label: 'Signals', href: '/dashboard/signals' },
  { icon: '⬇', label: 'Deposit', href: '/dashboard/deposit' },
  { icon: '⬆', label: 'Withdraw', href: '/dashboard/withdraw' },
  { icon: '🔗', label: 'Affiliate', href: '/dashboard/affiliate' },
  { icon: '🔔', label: 'Notifications', href: '/dashboard/notifications' },
  { icon: '💬', label: 'Support', href: '/dashboard/support' },
  { icon: '⚙', label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 68,
        background: '#0d1117',
        borderRight: '1px solid #161b22',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #C9A84C, #E8D08C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#060a0f', flexShrink: 0,
          }}>V</div>
          {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.08em' }}>VAULTFLOW</span>}
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                  background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
                  borderLeft: active ? '2px solid #C9A84C' : '2px solid transparent',
                  cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 16, color: active ? '#C9A84C' : '#484f58', flexShrink: 0, width: 20, textAlign: 'center' }}>
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <span style={{ fontSize: 13, color: active ? '#e6edf3' : '#8b949e', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Collapse */}
        <div
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ padding: '12px 16px', borderTop: '1px solid #161b22', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span style={{ color: '#484f58', fontSize: 14 }}>{sidebarOpen ? '◁' : '▷'}</span>
          {sidebarOpen && <span style={{ fontSize: 12, color: '#484f58' }}>Collapse</span>}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          background: '#0d1117', borderBottom: '1px solid #161b22',
          padding: '0 24px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, color: '#8b949e' }}>
            Welcome back 👋
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/dashboard/notifications" style={{ textDecoration: 'none' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <span style={{ fontSize: 18, color: '#8b949e' }}>🔔</span>
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#C9A84C', fontSize: 9, fontWeight: 700,
                  color: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>3</div>
              </div>
            </Link>
            <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9A84C, #E8D08C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#060a0f', cursor: 'pointer',
              }}>U</div>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#060a0f' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
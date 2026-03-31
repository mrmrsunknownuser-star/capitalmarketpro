'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { icon: '▦', label: 'Overview', href: '/dashboard' },
  { icon: '📊', label: 'Portfolio', href: '/dashboard/portfolio' },
  { icon: '💹', label: 'Invest', href: '/dashboard/invest' },
  { icon: '📈', label: 'Manual Trade', href: '/dashboard/trade' },
  { icon: '↕', label: 'Trades', href: '/dashboard/trades' },
  { icon: '⚡', label: 'Signals', href: '/dashboard/signals' },
  { icon: '💳', label: 'Cards', href: '/dashboard/card' },
  { icon: '⬇', label: 'Deposit', href: '/dashboard/deposit' },
  { icon: '⬆', label: 'Withdraw', href: '/dashboard/withdraw' },
  { icon: '🔗', label: 'Affiliate', href: '/dashboard/affiliate' },
  { icon: '🔔', label: 'Notifications', href: '/dashboard/notifications' },
  { icon: '💬', label: 'Support', href: '/dashboard/support' },
  { icon: '🪪', label: 'Verification', href: '/dashboard/kyc' },
  { icon: '⚙', label: 'Settings', href: '/dashboard/settings' },
]

const TICKER = [
  { s: 'BTC', p: '$67,240', c: '+2.4%', u: true },
  { s: 'ETH', p: '$3,480', c: '+1.8%', u: true },
  { s: 'SOL', p: '$142', c: '+5.2%', u: true },
  { s: 'BNB', p: '$412', c: '-0.8%', u: false },
  { s: 'AAPL', p: '$189', c: '-0.6%', u: false },
  { s: 'NVDA', p: '$875', c: '+3.2%', u: true },
  { s: 'MSFT', p: '$415', c: '+1.1%', u: true },
  { s: 'XRP', p: '$0.62', c: '+4.1%', u: true },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('U')
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
      if (data?.full_name) setUserName(data.full_name[0].toUpperCase())
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false)
      setUnread(count || 0)
    }
    init()
  }, [])

  // Close sidebar when route changes on mobile
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh', display: 'flex' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 998, display: 'none' }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 220,
          background: '#0d1117',
          borderRight: '1px solid #161b22',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 999,
          overflowY: 'auto',
          transition: 'transform 0.3s ease',
        }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>C</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C', lineHeight: 1.2 }}>CapitalMarket</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#484f58', letterSpacing: '0.1em' }}>PRO</div>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="sidebar-close"
            style={{ background: 'none', border: 'none', color: '#484f58', fontSize: 18, cursor: 'pointer', display: 'none' }}>
            ✕
          </button>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                  background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                  borderLeft: active ? '2px solid #C9A84C' : '2px solid transparent',
                }}>
                  <span style={{ fontSize: 14, color: active ? '#C9A84C' : '#484f58', flexShrink: 0, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: active ? '#e6edf3' : '#8b949e', whiteSpace: 'nowrap' }}>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #161b22' }}>
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              router.push('/login')
            }}
            style={{ width: '100%', padding: '9px 12px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, color: '#f85149', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', textAlign: 'left' }}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 220, minWidth: 0, transition: 'margin-left 0.3s ease' }} className="main-content">

        {/* Topbar */}
        <div style={{ background: '#0d1117', borderBottom: '1px solid #161b22', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="hamburger"
              style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: 22, cursor: 'pointer', display: 'none', padding: 4, lineHeight: 1 }}>
              ☰
            </button>
            <div style={{ fontSize: 12, color: '#484f58' }}>Welcome back 👋</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/dashboard/notifications" style={{ textDecoration: 'none', position: 'relative' }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              {unread > 0 && (
                <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#C9A84C', fontSize: 9, fontWeight: 700, color: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</div>
              )}
            </Link>
            <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#060a0f', cursor: 'pointer' }}>{userName}</div>
            </Link>
          </div>
        </div>

        {/* Ticker */}
        <div style={{ background: '#0a0e14', borderBottom: '1px solid #161b22', overflow: 'hidden', height: 32, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', animation: 'ticker 25s linear infinite', whiteSpace: 'nowrap' }}>
            {[...TICKER, ...TICKER].map((p, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px', borderRight: '1px solid #161b22' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#e6edf3' }}>{p.s}</span>
                <span style={{ fontSize: 10, color: '#8b949e' }}>{p.p}</span>
                <span style={{ fontSize: 9, color: p.u ? '#3fb950' : '#f85149' }}>{p.c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#060a0f' }}>
          {children}
        </div>
      </div>

      {/* Mobile CSS */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
          .sidebar-close {
            display: block !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .hamburger {
            display: block !important;
          }
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
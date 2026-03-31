'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
  { icon: '🪪', label: 'Verification', href: '/dashboard/kyc' },
  { icon: '⚙', label: 'Settings', href: '/dashboard/settings' },
]

const TickerBar = () => {
  const prices = [
    { symbol: 'BTC', price: '$67,240', change: '+2.4%', positive: true },
    { symbol: 'ETH', price: '$3,480', change: '+1.8%', positive: true },
    { symbol: 'SOL', price: '$142.30', change: '+5.2%', positive: true },
    { symbol: 'BNB', price: '$412.80', change: '-0.8%', positive: false },
    { symbol: 'AAPL', price: '$189.30', change: '-0.6%', positive: false },
    { symbol: 'NVDA', price: '$875.40', change: '+3.2%', positive: true },
    { symbol: 'MSFT', price: '$415.20', change: '+1.1%', positive: true },
    { symbol: 'TSLA', price: '$248.60', change: '-1.4%', positive: false },
    { symbol: 'XRP', price: '$0.624', change: '+4.1%', positive: true },
    { symbol: 'ADA', price: '$0.482', change: '+2.8%', positive: true },
  ]

  return (
    <div style={{ background: '#0a0e14', borderBottom: '1px solid #161b22', overflow: 'hidden', height: 36, display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap' }}>
        {[...prices, ...prices].map((p, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 24px', borderRight: '1px solid #161b22' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3' }}>{p.symbol}</span>
            <span style={{ fontSize: 11, color: '#8b949e' }}>{p.price}</span>
            <span style={{ fontSize: 10, color: p.positive ? '#3fb950' : '#f85149' }}>{p.change}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userName, setUserName] = useState('U')
  const [unread, setUnread] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh', display: 'flex' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99 }} />
      )}

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 68,
        background: '#0d1117',
        borderRight: '1px solid #161b22',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        position: 'fixed', top: 0, left: mobileOpen ? 0 : undefined,
        height: '100vh', zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>C</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', lineHeight: 1.2 }}>CapitalMarket</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#8b949e', letterSpacing: '0.06em' }}>PRO</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                  background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                  borderLeft: active ? '2px solid #C9A84C' : '2px solid transparent',
                  cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 15, color: active ? '#C9A84C' : '#484f58', flexShrink: 0, width: 20, textAlign: 'center' }}>{item.icon}</span>
                  {sidebarOpen && <span style={{ fontSize: 13, color: active ? '#e6edf3' : '#8b949e', whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Collapse */}
        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '12px 16px', borderTop: '1px solid #161b22', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#484f58', fontSize: 14 }}>{sidebarOpen ? '◁' : '▷'}</span>
          {sidebarOpen && <span style={{ fontSize: 12, color: '#484f58' }}>Collapse</span>}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: sidebarOpen ? 220 : 68, transition: 'margin-left 0.3s ease' }}>
        {/* Topbar */}
        <div style={{ background: '#0d1117', borderBottom: '1px solid #161b22', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', background: 'none', border: 'none', color: '#8b949e', fontSize: 20, cursor: 'pointer' }} className="mobile-menu-btn">☰</button>
            <div style={{ fontSize: 12, color: '#484f58' }}>Welcome back 👋</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/dashboard/notifications" style={{ textDecoration: 'none', position: 'relative' }}>
              <span style={{ fontSize: 20, cursor: 'pointer' }}>🔔</span>
              {unread > 0 && (
                <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#C9A84C', fontSize: 9, fontWeight: 700, color: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</div>
              )}
            </Link>
            <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#060a0f', cursor: 'pointer' }}>{userName}</div>
            </Link>
          </div>
        </div>

        {/* Ticker */}
        <TickerBar />

        {/* Page */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#060a0f' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
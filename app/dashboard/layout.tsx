'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggleButton } from '@/components/ThemeToggle'
import PWAInstall from '@/components/PWAInstall'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home', href: '/dashboard' },
  { icon: '📊', label: 'Portfolio', href: '/dashboard/trades' },
  { icon: '📈', label: 'Market', href: '/dashboard/market' },
  { icon: '🎯', label: 'Live Trade', href: '/dashboard/trading' },
  { icon: '🔄', label: 'Trade', href: '/dashboard/trade' },
  { icon: '⚡', label: 'Signals', href: '/dashboard/signals' },
  { icon: '💹', label: 'Invest', href: '/dashboard/invest' },
  { icon: '📰', label: 'News', href: '/dashboard/news' },
  { icon: '⬇', label: 'Deposit', href: '/dashboard/deposit' },
  { icon: '⬆', label: 'Withdraw', href: '/dashboard/withdraw' },
  { icon: '💳', label: 'Cards', href: '/dashboard/card' },
  { icon: '🔗', label: 'Affiliate', href: '/dashboard/affiliate' },
  { icon: '🏆', label: 'Leaderboard', href: '/dashboard/leaderboard' },
  { icon: '🔔', label: 'Notifications', href: '/dashboard/notifications' },
  { icon: '💬', label: 'Support', href: '/dashboard/support' },
  { icon: '🪪', label: 'KYC', href: '/dashboard/kyc' },
  { icon: 'ℹ', label: 'About Us', href: '/dashboard/about' },
  { icon: '⚙', label: 'Settings', href: '/dashboard/settings' },
]

const BOTTOM_NAV = [
  { icon: '🏠', label: 'Home', href: '/dashboard' },
  { icon: '📈', label: 'Market', href: '/dashboard/market' },
  { icon: '🎯', label: 'Trade', href: '/dashboard/trading' },
  { icon: '💹', label: 'Invest', href: '/dashboard/invest' },
  { icon: '⚙', label: 'More', href: '#more' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [joshuaPhoto, setJoshuaPhoto] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)

  // Page transition
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.replace('/login'); return }

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, avatar_url, kyc_status, tier, status')
        .eq('id', authUser.id)
        .single()

      const { data: bal } = await supabase
        .from('balances')
        .select('total_balance')
        .eq('user_id', authUser.id)
        .single()

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id)
        .eq('is_read', false)

      const { data: adminUser } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('role', 'admin')
        .single()

      setUser({ ...authUser, ...profile })
      setBalance(bal?.total_balance || 0)
      setUnreadCount(count || 0)
      if (adminUser?.avatar_url) setJoshuaPhoto(adminUser.avatar_url)

      // Realtime balance
      supabase.channel(`layout-balance-${authUser.id}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'balances',
          filter: `user_id=eq.${authUser.id}`,
        }, payload => {
          setBalance((payload.new as any).total_balance || 0)
        })
        .subscribe()

      // Realtime notifications
      supabase.channel(`layout-notifs-${authUser.id}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${authUser.id}`,
        }, () => {
          setUnreadCount(prev => prev + 1)
        })
        .subscribe()
    }
    init()
  }, [])

  // Hide layout on trading page (full screen)
  if (pathname === '/dashboard/trading') {
    return <>{children}</>
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Trader'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060a0f', fontFamily: 'monospace' }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <div style={{
        width: 240,
        background: '#0a0e14',
        borderRight: '1px solid #161b22',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflowY: 'auto',
        flexShrink: 0,
      }} className="desktop-sidebar">

        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #161b22' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>C</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#e6edf3', lineHeight: 1.2 }}>
                <span style={{ color: '#C9A84C' }}>Capital</span>Market Pro
              </div>
              <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Professional Trading</div>
            </div>
          </Link>
        </div>

        {/* User profile */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(201,168,76,0.3)' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : firstName[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstName}</div>
              <div style={{ fontSize: 10, color: '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ marginTop: 10, background: '#161b22', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Balance</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#C9A84C' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 9, color: user?.kyc_status === 'approved' ? '#3fb950' : '#F7A600', background: user?.kyc_status === 'approved' ? 'rgba(63,185,80,0.1)' : 'rgba(247,166,0,0.1)', padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', fontWeight: 700 }}>
              {user?.kyc_status === 'approved' ? '✓ Verified' : '⚠ KYC Pending'}
            </span>
            <span style={{ fontSize: 9, color: '#C9A84C', background: 'rgba(201,168,76,0.1)', padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', fontWeight: 700 }}>
              {user?.tier || 'Starter'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 2,
                background: isActive(item.href) ? 'rgba(201,168,76,0.12)' : 'transparent',
                borderLeft: isActive(item.href) ? '3px solid #C9A84C' : '3px solid transparent',
                cursor: 'pointer',
                position: 'relative',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: isActive(item.href) ? '#C9A84C' : '#8b949e', fontWeight: isActive(item.href) ? 700 : 400 }}>
                  {item.label}
                </span>
                {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                  <div style={{ marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9, background: '#f85149', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', padding: '0 4px' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
                {item.label === 'Live Trade' && (
                  <div style={{ marginLeft: 'auto', fontSize: 9, color: '#3fb950', background: 'rgba(63,185,80,0.15)', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>LIVE</div>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* Joshua footer */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #161b22' }}>
          <Link href="/dashboard/support" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 12, cursor: 'pointer' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', overflow: 'hidden' }}>
                  {joshuaPhoto ? <img src={joshuaPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#3fb950', border: '2px solid #0a0e14' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3' }}>Joshua C. Elder</div>
                <div style={{ fontSize: 10, color: '#3fb950' }}>● Online · Chat now</div>
              </div>
              <span style={{ fontSize: 14 }}>→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 280,
        background: '#0a0e14',
        borderRight: '1px solid #161b22',
        zIndex: 201,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }} className="mobile-sidebar">

        {/* Mobile sidebar header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f' }}>C</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>
              <span style={{ color: '#C9A84C' }}>Capital</span><span style={{ color: '#e6edf3' }}>Market Pro</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
        </div>

        {/* Mobile user */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', overflow: 'hidden', border: '2px solid rgba(201,168,76,0.3)' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : firstName[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{firstName}</div>
              <div style={{ fontSize: 11, color: '#484f58' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ background: '#161b22', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 9, color: '#484f58', marginBottom: 2 }}>BALANCE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#C9A84C' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Mobile nav */}
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                marginBottom: 2,
                background: isActive(item.href) ? 'rgba(201,168,76,0.12)' : 'transparent',
                borderLeft: isActive(item.href) ? '3px solid #C9A84C' : '3px solid transparent',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: isActive(item.href) ? '#C9A84C' : '#8b949e', fontWeight: isActive(item.href) ? 700 : 400 }}>
                  {item.label}
                </span>
                {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                  <div style={{ marginLeft: 'auto', minWidth: 20, height: 20, borderRadius: 10, background: '#f85149', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', padding: '0 5px' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
                {item.label === 'Live Trade' && (
                  <div style={{ marginLeft: 'auto', fontSize: 9, color: '#3fb950', background: 'rgba(63,185,80,0.15)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>LIVE</div>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* Mobile Joshua */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #161b22' }}>
          <Link href="/dashboard/support" style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 12 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', overflow: 'hidden' }}>
                  {joshuaPhoto ? <img src={joshuaPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#3fb950', border: '2px solid #0a0e14' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>Joshua C. Elder</div>
                <div style={{ fontSize: 10, color: '#3fb950' }}>● Online · Chat now</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="main-content">

        {/* ── TOP BAR ── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 90, background: '#0a0e14', borderBottom: '1px solid #161b22', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="hamburger"
            style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, color: '#8b949e', cursor: 'pointer', width: 38, height: 38, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ☰
          </button>

          {/* Page title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {NAV_ITEMS.find(n => isActive(n.href))?.label || 'Dashboard'}
            </div>
            <div style={{ fontSize: 10, color: '#484f58' }}>
              Welcome back, <span style={{ color: '#C9A84C' }}>{firstName}</span>
            </div>
          </div>

          {/* Quick deposit */}
          <Link href="/dashboard/deposit" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
              + Deposit
            </button>
          </Link>

          {/* Theme toggle */}
          <ThemeToggleButton />

          {/* Notifications bell */}
          <Link href="/dashboard/notifications" style={{ textDecoration: 'none', position: 'relative', flexShrink: 0 }} onClick={() => setUnreadCount(0)}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#161b22', border: '1px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>
              🔔
            </div>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, background: '#f85149', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', padding: '0 4px', border: '2px solid #0a0e14' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </Link>
        </div>

        {/* ── PAGE CONTENT ── */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 70,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}>
          {children}
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#0a0e14',
          borderTop: '1px solid #161b22',
          display: 'flex',
          zIndex: 90,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }} className="bottom-nav">
          {BOTTOM_NAV.map(item => (
            item.href === '#more' ? (
              <button key={item.href}
                onClick={() => setSidebarOpen(true)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px', border: 'none', background: 'transparent', cursor: 'pointer', gap: 3 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 9, color: '#484f58', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{item.label}</span>
              </button>
            ) : (
              <Link key={item.href} href={item.href} style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px', gap: 3, position: 'relative' }}>
                {isActive(item.href) && (
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: '#C9A84C', borderRadius: '0 0 3px 3px' }} />
                )}
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 9, color: isActive(item.href) ? '#C9A84C' : '#484f58', fontFamily: 'monospace', fontWeight: isActive(item.href) ? 700 : 400 }}>
                  {item.label}
                </span>
                {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: 6, right: '25%', width: 8, height: 8, borderRadius: '50%', background: '#f85149', border: '2px solid #0a0e14' }} />
                )}
              </Link>
            )
          ))}
        </div>
      </div>

      {/* PWA Install prompt */}
      <PWAInstall />

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        @media (min-width: 768px) {
          .main-content { margin-left: 240px; }
          .hamburger { display: none !important; }
          .mobile-sidebar { display: none !important; }
          .bottom-nav { display: none !important; }
          .desktop-sidebar { display: flex !important; }
        }
        @media (max-width: 767px) {
          .main-content { margin-left: 0 !important; }
          .desktop-sidebar { display: none !important; }
          .hamburger { display: flex !important; }
          .bottom-nav { display: flex !important; }
        }
        * { scrollbar-width: thin; scrollbar-color: #21262d transparent; }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: #21262d; border-radius: 2px; }
      `}</style>
    </div>
  )
}
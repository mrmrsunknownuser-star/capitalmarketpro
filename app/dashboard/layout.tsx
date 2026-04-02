'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { icon: '🏠', label: 'Home', href: '/dashboard' },
  { icon: '📊', label: 'Market', href: '/dashboard/market' },
  { icon: '🔄', label: 'Trade', href: '/dashboard/trade' },
  { icon: '📰', label: 'News', href: '/dashboard/news' },
  { icon: '⚡', label: 'Signals', href: '/dashboard/signals' },
  { icon: '💳', label: 'Cards', href: '/dashboard/card' },
  { icon: '⬇', label: 'Deposit', href: '/dashboard/deposit' },
  { icon: '⬆', label: 'Withdraw', href: '/dashboard/withdraw' },
  { icon: '💹', label: 'Invest', href: '/dashboard/invest' },
  { icon: '🔗', label: 'Affiliate', href: '/dashboard/affiliate' },
  { icon: '🔔', label: 'Notifications', href: '/dashboard/notifications' },
  { icon: '💬', label: 'Support', href: '/dashboard/support' },
  { icon: '🪪', label: 'Verification', href: '/dashboard/kyc' },
  { icon: '⚙', label: 'Settings', href: '/dashboard/settings' },
  { icon: 'ℹ', label: 'About Us', href: '/dashboard/about' },
]

const TICKER = [
  { s: 'BTC', p: '$67,240', c: '+2.4%', u: true },
  { s: 'ETH', p: '$3,480', c: '+1.8%', u: true },
  { s: 'SOL', p: '$142', c: '+5.2%', u: true },
  { s: 'BNB', p: '$412', c: '-0.8%', u: false },
  { s: 'AAPL', p: '$189', c: '-0.6%', u: false },
  { s: 'NVDA', p: '$875', c: '+3.2%', u: true },
  { s: 'XRP', p: '$0.62', c: '+4.1%', u: true },
  { s: 'ADA', p: '$0.48', c: '+2.8%', u: true },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [userName, setUserName] = useState('U')
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.replace('/login'); return }
        const { data } = await supabase.from('users').select('full_name').eq('id', session.user.id).single()
        if (data?.full_name) setUserName(data.full_name[0].toUpperCase())
        const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('is_read', false)
        setUnread(count || 0)
        setReady(true)
      } catch {
        router.replace('/login')
      }
    }
    init()
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#060a0f', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}>C</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginBottom: 6 }}>Loading...</div>
          <div style={{ fontSize: 11, color: '#484f58' }}>CapitalMarket Pro</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .dash-sidebar { transform: translateX(-100%); transition: transform 0.28s cubic-bezier(0.4,0,0.2,1); }
        .dash-sidebar.open { transform: translateX(0) !important; }
        .dash-main { margin-left: 0; }
        @media (min-width: 769px) {
          .dash-sidebar { transform: translateX(0) !important; position: fixed; }
          .dash-main { margin-left: 220px; }
          .hamburger { display: none !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 997 }} />
      )}

      {/* Sidebar */}
      <div className={`dash-sidebar${mobileOpen ? ' open' : ''}`} style={{ width: 220, background: '#0d1117', borderRight: '1px solid #161b22', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 998, overflowY: 'auto' }}>

        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #161b22', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#060a0f', flexShrink: 0, boxShadow: '0 0 16px rgba(201,168,76,0.25)' }}>C</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#C9A84C', lineHeight: 1.2 }}>CapitalMarket</div>
                <div style={{ fontSize: 9, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pro</div>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#484f58', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 2, background: active ? 'rgba(201,168,76,0.12)' : 'transparent', borderLeft: `2px solid ${active ? '#C9A84C' : 'transparent'}` }}>
                  <span style={{ fontSize: 15, flexShrink: 0, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: active ? '#e6edf3' : '#8b949e', fontWeight: active ? 700 : 400 }}>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid #161b22', flexShrink: 0 }}>
          <button onClick={async () => { const s = createClient(); await s.auth.signOut(); router.replace('/login') }}
            style={{ width: '100%', padding: '9px 12px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.15)', borderRadius: 8, color: '#f85149', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', marginBottom: 10 }}>
            🚪 Sign Out
          </button>
          <div style={{ textAlign: 'center', fontSize: 9, color: '#484f58', lineHeight: 1.7 }}>
            © 2025 CapitalMarket Pro<br />All Rights Reserved
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="dash-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{ background: '#0d1117', borderBottom: '1px solid #161b22', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }}>☰</button>
            <div style={{ fontSize: 12, color: '#484f58' }}>Welcome back 👋</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/dashboard/notifications" style={{ textDecoration: 'none', position: 'relative' }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              {unread > 0 && <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#C9A84C', fontSize: 9, fontWeight: 800, color: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</div>}
            </Link>
            <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#060a0f' }}>{userName}</div>
            </Link>
          </div>
        </div>

        {/* Ticker */}
        <div style={{ background: '#0a0e14', borderBottom: '1px solid #161b22', overflow: 'hidden', height: 32, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', animation: 'ticker 25s linear infinite', whiteSpace: 'nowrap' }}>
            {[...TICKER, ...TICKER].map((p, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRight: '1px solid #161b22' }}>
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

        {/* Mobile Bottom Nav */}
        <div style={{ background: '#0d1117', borderTop: '1px solid #161b22', display: 'flex', padding: '8px 0 12px', flexShrink: 0 }} className="mobile-bottom-nav">
          <style>{`
            .mobile-bottom-nav { display: none; }
            @media (max-width: 768px) { .mobile-bottom-nav { display: flex !important; } }
          `}</style>
          {[
{ icon: '🏠', label: 'Home', href: '/dashboard' },
  { icon: '💳', label: 'Cards', href: '/dashboard/card' },
  { icon: '📰', label: 'News', href: '/dashboard/news' },
  { icon: '🔗', label: 'Affiliate', href: '/dashboard/affiliate' },
  { icon: '☰', label: 'More', href: '#', onClick: () => setMobileOpen(true) },
          ].map(item => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
              {item.onClick ? (
                <button onClick={item.onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: '100%', padding: '4px 0' }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 9, color: '#484f58', letterSpacing: '0.04em' }}>{item.label}</span>
                </button>
              ) : (
                <Link href={item.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0' }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 9, color: pathname === item.href ? '#C9A84C' : '#484f58', letterSpacing: '0.04em', fontWeight: pathname === item.href ? 700 : 400 }}>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
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
  const [ready, setReady] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pending, setPending] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [bellOpen, setBellOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setReady(true)
      return
    }

    const init = async () => {
      try {
        const supabase = createClient()

        // Auth check
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.replace('/admin/login'); return }

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (!profile || profile.role !== 'admin') {
          router.replace('/admin/login')
          return
        }

        // Fetch stats
        const { count: uc } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
        const { count: pc } = await supabase
          .from('withdrawal_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        setUserCount(uc || 0)
        setPending(pc || 0)

        // Fetch initial notifications
        const notifs: any[] = []

        const { data: ws } = await supabase
          .from('withdrawal_requests')
          .select('id, amount, created_at, user:users(email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5)

        const { data: nu } = await supabase
          .from('users')
          .select('email, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        const { data: msgs } = await supabase
          .from('support_messages')
          .select('id, message, created_at, chat_id')
          .eq('sender_role', 'user')
          .order('created_at', { ascending: false })
          .limit(5)

        ws?.forEach(w => notifs.push({
          icon: '⬆', color: '#F7A600',
          title: 'Pending Withdrawal',
          desc: `${(w.user as any)?.email} — $${w.amount}`,
          time: w.created_at,
          href: '/admin/withdrawals',
        }))

        nu?.forEach(u => notifs.push({
          icon: '👤', color: '#3fb950',
          title: 'New User Registered',
          desc: u.email,
          time: u.created_at,
          href: '/admin/users',
        }))

        msgs?.forEach(m => notifs.push({
          icon: '💬', color: '#7B2BF9',
          title: 'Support Message',
          desc: (m.message as string)?.slice(0, 50) + '...',
          time: m.created_at,
          href: '/admin/support',
        }))

        notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        setNotifications(notifs.slice(0, 10))

        // ── REALTIME: New support messages ──
        supabase
          .channel('admin-support-watch')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: 'sender_role=eq.user',
          }, async (payload) => {
            const { data: chatData } = await supabase
              .from('support_chats')
              .select('user:users(email, full_name)')
              .eq('id', (payload.new as any).chat_id)
              .single()

            const userName = (chatData?.user as any)?.full_name
              || (chatData?.user as any)?.email
              || 'A user'

            const newNotif = {
              icon: '💬',
              color: '#7B2BF9',
              title: 'New Support Message',
              desc: `${userName}: "${(payload.new as any).message?.slice(0, 50)}"`,
              time: new Date().toISOString(),
              href: '/admin/support',
            }

            setNotifications(prev => [newNotif, ...prev].slice(0, 10))

            // Browser push notification
            if (typeof window !== 'undefined' && Notification.permission === 'granted') {
              new Notification('💬 New Support Message', {
                body: `${userName}: ${(payload.new as any).message?.slice(0, 60)}`,
                icon: '/favicon.ico',
              })
            }
          })
          .subscribe()

        // ── REALTIME: New users ──
        supabase
          .channel('admin-users-watch')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'users',
          }, (payload) => {
            const newUser = payload.new as any
            if (newUser.role === 'admin') return

            const newNotif = {
              icon: '👤',
              color: '#3fb950',
              title: 'New User Registered',
              desc: newUser.email || 'New trader joined',
              time: new Date().toISOString(),
              href: '/admin/users',
            }

            setNotifications(prev => [newNotif, ...prev].slice(0, 10))
            setUserCount(prev => prev + 1)

            if (typeof window !== 'undefined' && Notification.permission === 'granted') {
              new Notification('👤 New User Registered', {
                body: `${newUser.email} just joined CapitalMarket Pro`,
                icon: '/favicon.ico',
              })
            }
          })
          .subscribe()

        // ── REALTIME: New withdrawals ──
        supabase
          .channel('admin-withdrawals-watch')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'withdrawal_requests',
          }, (payload) => {
            const w = payload.new as any
            setNotifications(prev => [{
              icon: '⬆',
              color: '#F7A600',
              title: 'New Withdrawal Request',
              desc: `$${w.amount} withdrawal pending`,
              time: new Date().toISOString(),
              href: '/admin/withdrawals',
            }, ...prev].slice(0, 10))
            setPending(prev => prev + 1)

            if (typeof window !== 'undefined' && Notification.permission === 'granted') {
              new Notification('⬆ New Withdrawal Request', {
                body: `$${w.amount} withdrawal needs approval`,
                icon: '/favicon.ico',
              })
            }
          })
          .subscribe()

        // Request browser notification permission
        if (typeof window !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission()
        }

        setReady(true)
      } catch (err) {
        console.error(err)
        router.replace('/admin/login')
      }
    }

    init()
  }, [pathname])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  if (pathname === '/admin/login') return <>{children}</>

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #f85149, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(248,81,73,0.3)' }}>A</div>
          <div style={{ fontSize: 14, color: '#C9A84C', marginBottom: 8 }}>Loading Admin Panel...</div>
          <div style={{ fontSize: 11, color: '#484f58' }}>Verifying credentials</div>
          <div style={{ marginTop: 20, width: 120, height: 2, background: '#161b22', borderRadius: 2, margin: '20px auto 0', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #f85149, #ff6b6b)', borderRadius: 2, animation: 'load 1.5s ease infinite' }} />
          </div>
        </div>
        <style>{`@keyframes load { 0%{width:0%} 50%{width:100%} 100%{width:0%} }`}</style>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh', display: 'flex', position: 'relative' }}>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 997 }} />
      )}

      {/* Sidebar */}
      <div style={{
        width: 220,
        background: '#0d1117',
        borderRight: '1px solid #161b22',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 998,
        overflowY: 'auto',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>

        {/* Logo */}
        <div style={{ padding: '16px', borderBottom: '1px solid #161b22', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #f85149, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0 }}>A</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#f85149', lineHeight: 1.2 }}>ADMIN PANEL</div>
                <div style={{ fontSize: 9, color: '#484f58' }}>CapitalMarket Pro</div>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#484f58', fontSize: 18, cursor: 'pointer', padding: '4px 6px', lineHeight: 1 }}>✕</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: '#161b22', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>{userCount}</div>
              <div style={{ fontSize: 9, color: '#484f58' }}>Users</div>
            </div>
            <div style={{ background: '#161b22', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: pending > 0 ? '#F7A600' : '#e6edf3' }}>{pending}</div>
              <div style={{ fontSize: 9, color: '#484f58' }}>Pending</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                  background: active ? 'rgba(248,81,73,0.1)' : 'transparent',
                  borderLeft: `2px solid ${active ? '#f85149' : 'transparent'}`,
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: active ? '#e6edf3' : '#8b949e', fontWeight: active ? 700 : 400 }}>{item.label}</span>
                  {item.href === '/admin/withdrawals' && pending > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 9, color: '#060a0f', background: '#F7A600', padding: '2px 6px', borderRadius: 10, fontWeight: 800 }}>{pending}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid #161b22', flexShrink: 0 }}>
          <Link href="/" target="_blank" style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
            <div style={{ padding: '9px 12px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, fontSize: 12, color: '#C9A84C', textAlign: 'center' }}>
              🌐 View Site
            </div>
          </Link>
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              router.replace('/admin/login')
            }}
            style={{ width: '100%', padding: '9px 12px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, color: '#f85149', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{
          background: '#0d1117',
          borderBottom: '1px solid #161b22',
          padding: '0 16px',
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
              ☰
            </button>
            <div style={{ fontSize: 12, color: '#484f58' }}>Admin Panel</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 10, color: '#f85149', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
              🔴 ADMIN
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setBellOpen(!bellOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, position: 'relative', display: 'flex' }}>
                <span style={{ fontSize: 18 }}>🔔</span>
                {notifications.length > 0 && (
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 15, height: 15, borderRadius: '50%', background: '#f85149', fontSize: 8, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </div>
                )}
              </button>

              {bellOpen && (
                <>
                  <div onClick={() => setBellOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
                  <div style={{ position: 'absolute', top: 40, right: 0, width: 300, background: '#0d1117', border: '1px solid #21262d', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.7)', zIndex: 99, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>Admin Notifications</div>
                      <div style={{ fontSize: 10, color: '#484f58' }}>{notifications.length} items</div>
                    </div>
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: '#484f58', fontSize: 12 }}>All clear! No pending items.</div>
                      ) : notifications.map((n, i) => (
                        <Link key={i} href={n.href} onClick={() => setBellOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
                          <div style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: '1px solid #161b22' }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${n.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{n.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: n.color, marginBottom: 2 }}>{n.title}</div>
                              <div style={{ fontSize: 11, color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.desc}</div>
                              <div style={{ fontSize: 10, color: '#484f58', marginTop: 2 }}>{new Date(n.time).toLocaleString()}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div style={{ padding: '10px 16px', borderTop: '1px solid #161b22', textAlign: 'center' }}>
                      <button onClick={() => { setNotifications([]); setBellOpen(false) }} style={{ fontSize: 11, color: '#484f58', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}>
                        Clear all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#060a0f' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
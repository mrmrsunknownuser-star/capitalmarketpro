// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({ children }) {
  var pathname = usePathname()
  var router = useRouter()
  var [user, setUser] = useState(null)

  useEffect(function() {
    var supabase = createClient()
    supabase.auth.getUser().then(function(res) {
      if (!res.data.user) { router.push('/login'); return }
      supabase.from('users').select('*').eq('id', res.data.user.id).single().then(function(r) {
        if (r.data) setUser(r.data)
      })
    })
  }, [])

  var tabs = [
  { href: '/dashboard', icon: '⌂', label: 'Home' },
  { href: '/dashboard/wallet', icon: '◈', label: 'Wallet' },
  { href: '/dashboard/portfolio', icon: '📊', label: 'Portfolio' },
  { href: '/dashboard/history', icon: '≡', label: 'History' },
  { href: '/dashboard/more', icon: '···', label: 'More' },
]

  var isActive = function(href) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a0e', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060a0e; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }
      `}</style>

      <div style={{ animation: 'fadeUp .3s ease' }}>
        {children}
      </div>

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0d1117', borderTop: '1px solid #1e2530', zIndex: 1000, display: 'flex', height: 72, paddingBottom: 8 }}>
        {tabs.map(function(tab) {
          var active = isActive(tab.href)
          return (
            <Link key={tab.href} href={tab.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textDecoration: 'none' }}>
              <div style={{ width: active ? 48 : 36, height: active ? 32 : 'auto', background: active ? 'rgba(201,168,76,.15)' : 'transparent', borderRadius: active ? 20 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                <span style={{ fontSize: tab.label === 'More' ? 18 : 20, color: active ? '#C9A84C' : '#4a5568' }}>{tab.icon}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? '#C9A84C' : '#4a5568' }}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
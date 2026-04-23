// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MorePage() {
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

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  var MENU_ITEMS = [
    {
      section: 'Account',
      items: [
        { icon: '👤', label: 'My Profile', href: '/dashboard/profile', color: '#3498db' },
        { icon: '🔑', label: 'KYC Verification', href: '/dashboard/kyc', color: '#2ecc71', badge: user && user.kyc_status !== 'approved' ? 'Action Required' : null },
        { icon: '💳', label: 'Pro Card', href: '/dashboard/card', color: '#C9A84C' },
        { icon: '🏆', label: 'Achievements', href: '/dashboard/achievements', color: '#F7931A' },
        { icon: '🤝', label: 'Affiliate Program', href: '/dashboard/affiliate', color: '#9b59b6' },
      ],
    },
    {
      section: 'Tools',
      items: [
        { icon: '📊', label: 'Trading Signals', href: '/dashboard/signal', color: '#2ecc71' },
        { icon: '📰', label: 'Market News', href: '/dashboard/news', color: '#3498db' },
        { icon: '🏅', label: 'Leaderboard', href: '/dashboard/leaderboard', color: '#C9A84C' },
        { icon: '👥', label: 'Copy Trading', href: '/dashboard/copy', color: '#e67e22' },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: '💬', label: 'Live Support', href: '/dashboard/support', color: '#2ecc71' },
        { icon: '🔔', label: 'Notifications', href: '/dashboard/notifications', color: '#e74c3c' },
        { icon: 'ℹ', label: 'About Us', href: '/dashboard/about', color: '#3498db' },
        { icon: '⚙', label: 'Settings', href: '/dashboard/settings', color: '#8892a0' },
      ],
    },
  ]

  async function handleLogout() {
    var supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>

      <div style={{ padding: '52px 20px 20px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>More</div>
      </div>

      {/* Profile card */}
      <Link href="/dashboard/profile" style={{ textDecoration: 'none' }}>
        <div style={{ margin: '0 16px 24px', background: 'linear-gradient(135deg,#0d1117,#141920)', border: '1px solid #1e2530', borderRadius: 20, padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#060a0e', flexShrink: 0 }}>
            {user ? (user.full_name || user.username || 'U')[0].toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#e8edf5' }}>{user ? (user.full_name || user.username || 'User') : 'Loading...'}</div>
            <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>{user ? user.email : ''}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: user && user.kyc_status === 'approved' ? 'rgba(46,204,113,.15)' : 'rgba(231,76,60,.15)', color: user && user.kyc_status === 'approved' ? '#2ecc71' : '#e74c3c' }}>
                {user && user.kyc_status === 'approved' ? 'KYC Verified' : 'KYC Not Verified'}
              </span>
            </div>
          </div>
          <span style={{ color: '#4a5568', fontSize: 18 }}>›</span>
        </div>
      </Link>

      {/* Menu sections */}
      {MENU_ITEMS.map(function(section) {
        return (
          <div key={section.section} style={{ padding: '0 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>{section.section}</div>
            <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, overflow: 'hidden' }}>
              {section.items.map(function(item, i) {
                return (
                  <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', borderBottom: i < section.items.length - 1 ? '1px solid #1e2530' : 'none', transition: 'background .15s' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: item.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#e8edf5' }}>{item.label}</div>
                      </div>
                      {item.badge && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: 'rgba(231,76,60,.15)', color: '#e74c3c' }}>{item.badge}</span>
                      )}
                      <span style={{ color: '#4a5568', fontSize: 16 }}>›</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Logout */}
      <div style={{ padding: '0 16px' }}>
        <button onClick={handleLogout} style={{ width: '100%', padding: '15px', background: 'transparent', border: '1px solid rgba(231,76,60,.25)', borderRadius: 14, color: '#e74c3c', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span>⏻</span> Sign Out
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#2a3140' }}>
        CapitalMarket Pro v2.0 · All rights reserved
      </div>
    </div>
  )
}
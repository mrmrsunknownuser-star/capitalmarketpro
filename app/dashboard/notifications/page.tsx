'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)

    // Mark all as read
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
  }

  useEffect(() => { fetchNotifications() }, [])

  const typeConfig: Record<string, { color: string, icon: string, bg: string }> = {
    info: { color: '#0052FF', icon: 'ℹ', bg: 'rgba(0,82,255,0.08)' },
    success: { color: '#3fb950', icon: '✅', bg: 'rgba(63,185,80,0.08)' },
    warning: { color: '#F7A600', icon: '⚠', bg: 'rgba(247,166,0,0.08)' },
    alert: { color: '#f85149', icon: '🚨', bg: 'rgba(248,81,73,0.08)' },
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Notifications</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>{notifications.filter(n => !n.is_read).length} unread notifications</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#484f58' }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 14, color: '#484f58' }}>No notifications yet</div>
        </div>
      ) : notifications.map((n) => {
        const config = typeConfig[n.type] || typeConfig.info
        return (
          <div key={n.id} style={{ background: n.is_read ? '#0d1117' : config.bg, border: `1px solid ${n.is_read ? '#161b22' : config.color + '33'}`, borderRadius: 12, padding: 16, marginBottom: 10, display: 'flex', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: config.bg, border: `1px solid ${config.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {config.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: n.is_read ? '#8b949e' : '#e6edf3' }}>{n.title}</div>
                <div style={{ fontSize: 10, color: '#484f58', flexShrink: 0, marginLeft: 12 }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>{n.message}</div>
              {!n.is_read && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: config.color, marginTop: 6 }} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
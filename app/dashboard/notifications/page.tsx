'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

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
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  }

  useEffect(() => { fetchNotifications() }, [])

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications
  const unreadCount = notifications.filter(n => !n.is_read).length

  const typeIcon = (type: string) => ({
    success: '✅', warning: '⚠️', info: 'ℹ️', support: '💬', error: '❌'
  }[type] || '🔔')

  const typeColor = (type: string) => ({
    success: '#3fb950', warning: '#F7A600', info: '#0052FF', support: '#7B2BF9', error: '#f85149'
  }[type] || '#C9A84C')

  const deleteAll = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').delete().eq('user_id', user.id)
    setNotifications([])
  }

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace', maxWidth: 600, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: 10, fontSize: 13, color: '#060a0f', background: '#C9A84C', padding: '2px 8px', borderRadius: 20, fontWeight: 800 }}>{unreadCount}</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#484f58' }}>{notifications.length} total notifications</div>
        </div>
        {notifications.length > 0 && (
          <button onClick={deleteAll}
            style={{ fontSize: 11, color: '#484f58', background: 'none', border: '1px solid #21262d', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>
            Clear All
          </button>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 3, width: 'fit-content' }}>
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)}
            style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: filter === f ? 'rgba(201,168,76,0.15)' : 'transparent', color: filter === f ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: filter === f ? 700 : 400, textTransform: 'capitalize' }}>
            {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#484f58', fontSize: 13 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🔔</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </div>
          <div style={{ fontSize: 12, color: '#484f58' }}>
            {filter === 'unread' ? "You're all caught up!" : "We'll notify you of important account updates here"}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((notif, i) => (
            <div key={notif.id} style={{ background: notif.is_read ? '#0d1117' : 'rgba(201,168,76,0.04)', border: `1px solid ${notif.is_read ? '#161b22' : 'rgba(201,168,76,0.2)'}`, borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative' }}>
              {!notif.is_read && (
                <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: '#C9A84C' }} />
              )}
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${typeColor(notif.type)}15`, border: `1px solid ${typeColor(notif.type)}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {typeIcon(notif.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{notif.title}</div>
                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7, marginBottom: 6 }}>{notif.message}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>
                  {new Date(notif.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
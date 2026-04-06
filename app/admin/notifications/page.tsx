'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [adminId, setAdminId] = useState<string | null>(null)
  const [sendTo, setSendTo] = useState('all')
  const [users, setUsers] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState('')
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setAdminId(user.id)

      await fetchNotifications(user.id)

      const { data: userList } = await supabase
        .from('users')
        .select('id, email, full_name')
        .neq('role', 'admin')
        .order('created_at', { ascending: false })
      setUsers(userList || [])

      // Realtime new notifications
      channelRef.current = supabase
        .channel('admin-notifications-live')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, async payload => {
          const n = payload.new as any
          // Fetch full details
          setNotifications(prev => [n, ...prev])
        })
        .subscribe()
    }
    init()
    return () => {
      const supabase = createClient()
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  const fetchNotifications = async (uid: string) => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(200)
    setNotifications(data || [])
    setLoading(false)
  }

  const markAllRead = async () => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', adminId)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const deleteAll = async () => {
    if (!confirm('Delete all notifications?')) return
    const supabase = createClient()
    await supabase.from('notifications').delete().eq('user_id', adminId)
    setNotifications([])
  }

  const sendNotification = async () => {
    if (!title || !message) return
    setSending(true)
    const supabase = createClient()

    if (sendTo === 'all') {
      for (const user of users) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title,
          message,
          type: 'info',
          is_read: false,
          recipient_role: 'user',
        })
      }
      setSent(`✅ Sent to all ${users.length} users`)
    } else {
      await supabase.from('notifications').insert({
        user_id: sendTo,
        title,
        message,
        type: 'info',
        is_read: false,
        recipient_role: 'user',
      })
      setSent('✅ Notification sent!')
    }

    setTitle('')
    setMessage('')
    setSending(false)
    setTimeout(() => setSent(''), 3000)
  }

  const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'card', label: '💳 Cards' },
    { id: 'deposit', label: '💰 Deposits' },
    { id: 'kyc', label: '🪪 KYC' },
    { id: 'withdrawal', label: '⬆ Withdrawals' },
    { id: 'user', label: '👤 Users' },
    { id: 'support', label: '💬 Support' },
  ]

  const filterMap: Record<string, string[]> = {
    card: ['Card', 'card'],
    deposit: ['Deposit', 'deposit'],
    kyc: ['KYC', 'kyc', 'KYC'],
    withdrawal: ['Withdrawal', 'withdrawal'],
    user: ['User Registered', 'user'],
    support: ['Support', 'Message', 'support'],
  }

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true
    const keys = filterMap[filter] || []
    return keys.some(k => n.title?.toLowerCase().includes(k.toLowerCase()) || n.message?.toLowerCase().includes(k.toLowerCase()))
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const typeIcon = (title: string) => {
    if (title?.includes('Card') || title?.includes('card')) return '💳'
    if (title?.includes('Deposit') || title?.includes('deposit')) return '💰'
    if (title?.includes('KYC') || title?.includes('kyc')) return '🪪'
    if (title?.includes('Withdrawal') || title?.includes('withdrawal')) return '⬆'
    if (title?.includes('User') || title?.includes('user')) return '👤'
    if (title?.includes('Support') || title?.includes('Message')) return '💬'
    if (title?.includes('Signal')) return '⚡'
    if (title?.includes('Investment') || title?.includes('Plan')) return '💹'
    return '🔔'
  }

  const typeColor = (title: string) => {
    if (title?.includes('Card')) return '#0052FF'
    if (title?.includes('Deposit')) return '#3fb950'
    if (title?.includes('KYC')) return '#C9A84C'
    if (title?.includes('Withdrawal')) return '#f85149'
    if (title?.includes('User')) return '#7B2BF9'
    if (title?.includes('Support') || title?.includes('Message')) return '#F7A600'
    return '#C9A84C'
  }

  const TEMPLATES = [
    { label: '💰 Daily Profit', t: '💰 Your Daily Profit is Ready!', m: 'Your investment plan has generated profits today. Log in to check your updated balance and consider reinvesting for compounded returns.' },
    { label: '📈 Market Alert', t: '📈 Major Market Opportunity!', m: 'Our AI has detected a significant market opportunity. Your automated system is capitalizing on this move. Check your dashboard for updates.' },
    { label: '🎁 Special Offer', t: '🎉 Exclusive Bonus — Just for You!', m: "As a valued member, you've been selected for an exclusive offer. Contact Joshua Elder in support to claim your bonus." },
    { label: '⚡ Upgrade Plan', t: '⚡ Unlock Higher Returns Today', m: 'Your current plan is performing well! Upgrading to Gold or Platinum could multiply your daily returns significantly. See Joshua for details.' },
    { label: '🔒 KYC Reminder', t: '🪪 Complete Identity Verification', m: 'Your KYC verification is still pending. Completing it unlocks withdrawals and full platform access. Takes only 2 minutes.' },
    { label: '💸 Deposit Prompt', t: '💸 Amplify Your Daily Returns', m: 'Our AI is performing exceptionally right now. Adding more funds could significantly boost your daily profits. Deposit now to maximize gains.' },
  ]

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>
            Admin Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: 10, fontSize: 13, background: '#f85149', color: '#fff', padding: '2px 8px', borderRadius: 20, fontWeight: 800 }}>{unreadCount} new</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#484f58' }}>{notifications.length} total · Live updates enabled</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={markAllRead}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
            ✓ Mark All Read
          </button>
          <button onClick={deleteAll}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.06)', color: '#f85149', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
            🗑 Clear All
          </button>
        </div>
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 16px', background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950', animation: 'pulse 2s infinite' }} />
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        <span style={{ fontSize: 12, color: '#3fb950', fontWeight: 700 }}>LIVE — New notifications appear instantly</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

        {/* LEFT — Notifications list */}
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { l: 'Total', v: notifications.length, c: '#e6edf3', icon: '📋' },
              { l: 'Unread', v: unreadCount, c: '#f85149', icon: '🔴' },
              { l: 'Cards', v: notifications.filter(n => n.title?.includes('Card')).length, c: '#0052FF', icon: '💳' },
              { l: 'Deposits', v: notifications.filter(n => n.title?.includes('Deposit')).length, c: '#3fb950', icon: '💰' },
            ].map(s => (
              <div key={s.l} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setFilter(c.id)}
                style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${filter === c.id ? '#C9A84C' : '#21262d'}`, background: filter === c.id ? 'rgba(201,168,76,0.1)' : 'transparent', color: filter === c.id ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: filter === c.id ? 700 : 400, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Notification list */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#484f58' }}>Loading notifications...</div>
          ) : filtered.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
              <div style={{ fontSize: 13, color: '#484f58' }}>No notifications in this category</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(notif => (
                <div key={notif.id}
                  style={{ background: notif.is_read ? '#0d1117' : 'rgba(201,168,76,0.04)', border: `1px solid ${notif.is_read ? '#161b22' : 'rgba(201,168,76,0.2)'}`, borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative', cursor: 'default' }}>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: '#f85149' }} />
                  )}

                  {/* Icon */}
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `${typeColor(notif.title)}18`, border: `1px solid ${typeColor(notif.title)}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {typeIcon(notif.title)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 5, paddingRight: 16 }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7, marginBottom: 8 }}>
                      {notif.message}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, color: '#484f58' }}>
                        {new Date(notif.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {/* Action links based on type */}
                      {notif.title?.includes('Card') && (
                        <a href="/admin/cards" style={{ fontSize: 10, color: '#0052FF', textDecoration: 'none', background: 'rgba(0,82,255,0.1)', padding: '2px 8px', borderRadius: 10 }}>Review Card →</a>
                      )}
                      {notif.title?.includes('Deposit') && (
                        <a href="/admin/deposits" style={{ fontSize: 10, color: '#3fb950', textDecoration: 'none', background: 'rgba(63,185,80,0.1)', padding: '2px 8px', borderRadius: 10 }}>Review Deposit →</a>
                      )}
                      {notif.title?.includes('KYC') && (
                        <a href="/admin/users" style={{ fontSize: 10, color: '#C9A84C', textDecoration: 'none', background: 'rgba(201,168,76,0.1)', padding: '2px 8px', borderRadius: 10 }}>Review KYC →</a>
                      )}
                      {notif.title?.includes('Withdrawal') && (
                        <a href="/admin/withdrawals" style={{ fontSize: 10, color: '#f85149', textDecoration: 'none', background: 'rgba(248,81,73,0.1)', padding: '2px 8px', borderRadius: 10 }}>Review Withdrawal →</a>
                      )}
                      {notif.title?.includes('Support') && (
                        <a href="/admin/support" style={{ fontSize: 10, color: '#F7A600', textDecoration: 'none', background: 'rgba(247,166,0,0.1)', padding: '2px 8px', borderRadius: 10 }}>Open Chat →</a>
                      )}
                      {notif.title?.includes('User') && (
                        <a href="/admin/users" style={{ fontSize: 10, color: '#7B2BF9', textDecoration: 'none', background: 'rgba(123,43,249,0.1)', padding: '2px 8px', borderRadius: 10 }}>View User →</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Send notification panel */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 22, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>📢 Send Notification</div>
            <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Broadcast to users</div>

            {sent && (
              <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#3fb950' }}>
                {sent}
              </div>
            )}

            {/* Recipient */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Send To</label>
              <select value={sendTo} onChange={e => setSendTo(e.target.value)}
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '11px 12px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', cursor: 'pointer', boxSizing: 'border-box' as const }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#30363d'}>
                <option value="all">📢 All Users ({users.length})</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..."
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '11px 12px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#30363d'} />
            </div>

            {/* Message */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Notification message..." rows={4}
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '11px 12px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' as const }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#30363d'} />
            </div>

            <button onClick={sendNotification} disabled={!title || !message || sending}
              style={{ width: '100%', padding: '13px 0', background: !title || !message || sending ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: !title || !message || sending ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: !title || !message || sending ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
              {sending ? '⟳ Sending...' : `📢 Send${sendTo === 'all' ? ` to All (${users.length})` : ' to User'}`}
            </button>
          </div>

          {/* Quick templates */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 14 }}>⚡ Quick Templates</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TEMPLATES.map(tmpl => (
                <button key={tmpl.label} onClick={() => { setTitle(tmpl.t); setMessage(tmpl.m) }}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', textAlign: 'left' }}>
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
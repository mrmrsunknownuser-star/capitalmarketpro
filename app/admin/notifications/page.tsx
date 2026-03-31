'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type User = {
  id: string
  email: string
  full_name: string | null
}

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [target, setTarget] = useState<'all' | 'single'>('all')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'alert'>('info')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
      setUsers(usersData || [])

      const { data: notifData } = await supabase
        .from('notifications')
        .select('*, user:users(email)')
        .order('created_at', { ascending: false })
        .limit(20)
      setHistory(notifData || [])
    }
    fetch()
  }, [success])

  const sendNotification = async () => {
    if (!title || !message) return
    setLoading(true)
    const supabase = createClient()

    if (target === 'all') {
      // Send to all users
      const inserts = users.map(u => ({
        user_id: u.id,
        title,
        message,
        type,
      }))
      await supabase.from('notifications').insert(inserts)
      setSuccess(`Notification sent to all ${users.length} users!`)
    } else {
      if (!selectedUserId) { setLoading(false); return }
      await supabase.from('notifications').insert({
        user_id: selectedUserId,
        title,
        message,
        type,
      })
      setSuccess('Notification sent successfully!')
    }

    setTitle('')
    setMessage('')
    setLoading(false)
    setTimeout(() => setSuccess(''), 4000)
  }

  const typeConfig = {
    info: { color: '#0052FF', label: 'ℹ Info', bg: 'rgba(0,82,255,0.1)' },
    success: { color: '#3fb950', label: '✅ Success', bg: 'rgba(63,185,80,0.1)' },
    warning: { color: '#F7A600', label: '⚠ Warning', bg: 'rgba(247,166,0,0.1)' },
    alert: { color: '#f85149', label: '🚨 Alert', bg: 'rgba(248,81,73,0.1)' },
  }

  const inputStyle = {
    width: '100%',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#e6edf3',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Send Notifications</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Send alerts and messages to users</div>
      </div>

      {success && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          ✅ {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Compose */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 20 }}>📨 Compose Notification</div>

          {/* Target */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Send To</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { value: 'all', label: `📢 All Users (${users.length})` },
                { value: 'single', label: '👤 Specific User' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setTarget(t.value as 'all' | 'single')}
                  style={{
                    padding: '10px 0', borderRadius: 8, border: '1px solid',
                    borderColor: target === t.value ? '#C9A84C' : '#21262d',
                    background: target === t.value ? 'rgba(201,168,76,0.1)' : 'transparent',
                    color: target === t.value ? '#C9A84C' : '#8b949e',
                    fontSize: 12, cursor: 'pointer',
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>

          {/* User selector */}
          {target === 'single' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Choose a user...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                ))}
              </select>
            </div>
          )}

          {/* Type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notification Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: '8px 4px', borderRadius: 8, border: '1px solid',
                    borderColor: type === t ? typeConfig[t].color : '#21262d',
                    background: type === t ? typeConfig[t].bg : 'transparent',
                    color: type === t ? typeConfig[t].color : '#8b949e',
                    fontSize: 10, cursor: 'pointer',
                  }}
                >{typeConfig[t].label}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Your deposit has been confirmed"
              style={inputStyle}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message here..."
              rows={4}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Preview */}
          {title && message && (
            <div style={{ background: typeConfig[type].bg, border: `1px solid ${typeConfig[type].color}33`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#484f58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preview</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: typeConfig[type].color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>{message}</div>
            </div>
          )}

          <button
            onClick={sendNotification}
            disabled={loading || !title || !message}
            style={{
              width: '100%', padding: '13px 0',
              background: 'linear-gradient(135deg, #C9A84C, #E8D08C)',
              border: 'none', borderRadius: 10,
              color: '#060a0f', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', opacity: loading || !title || !message ? 0.5 : 1,
            }}
          >
            {loading ? 'Sending...' : `🔔 Send ${target === 'all' ? `to All ${users.length} Users` : 'Notification'}`}
          </button>
        </div>

        {/* History */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>📋 Recent Notifications</div>
          <div style={{ maxHeight: 580, overflowY: 'auto' }}>
            {history.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#484f58', fontSize: 13 }}>No notifications sent yet</div>
            ) : history.map((n) => (
              <div key={n.id} style={{ padding: '12px 0', borderBottom: '1px solid #161b22' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: typeConfig[n.type as keyof typeof typeConfig]?.color || '#8b949e' }}>{n.title}</div>
                  <div style={{ fontSize: 10, color: '#484f58', flexShrink: 0, marginLeft: 8 }}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4, lineHeight: 1.4 }}>{n.message}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>→ {n.user?.email || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
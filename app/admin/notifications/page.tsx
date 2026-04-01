'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [selectedUser, setSelectedUser] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('users').select('id, email, full_name').order('created_at', { ascending: false })
      setUsers(data || [])
    }
    fetch()
  }, [])

  const send = async () => {
    if (!title || !message) return
    setSending(true)
    const supabase = createClient()

    if (target === 'all') {
      const inserts = users.map(u => ({ user_id: u.id, title, message, type: 'info', is_read: false }))
      await supabase.from('notifications').insert(inserts)
      setDone(`✅ Sent to all ${users.length} users`)
    } else if (selectedUser) {
      await supabase.from('notifications').insert({ user_id: selectedUser, title, message, type: 'info', is_read: false })
      const user = users.find(u => u.id === selectedUser)
      setDone(`✅ Sent to ${user?.email}`)
    }

    setTitle('')
    setMessage('')
    setSending(false)
    setTimeout(() => setDone(''), 4000)
  }

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Send Notifications</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Send messages to users or broadcast to everyone</div>
      </div>

      {done && <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>{done}</div>}

      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        {/* Target */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Send To</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ id: 'all', label: '📢 All Users' }, { id: 'specific', label: '👤 Specific User' }].map(t => (
              <button key={t.id} onClick={() => setTarget(t.id)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1px solid ${target === t.id ? '#C9A84C' : '#21262d'}`, background: target === t.id ? 'rgba(201,168,76,0.1)' : 'transparent', color: target === t.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: target === t.id ? 700 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {target === 'specific' && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select User</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user..."
              style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', marginBottom: 8, boxSizing: 'border-box' as const }}
            />
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, maxHeight: 200, overflowY: 'auto' }}>
              {filtered.slice(0, 20).map(u => (
                <div key={u.id} onClick={() => { setSelectedUser(u.id); setSearch(u.email) }}
                  style={{ padding: '10px 14px', cursor: 'pointer', background: selectedUser === u.id ? 'rgba(201,168,76,0.1)' : 'transparent', borderBottom: '1px solid #21262d' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#e6edf3' }}>{u.full_name || 'No name'}</div>
                  <div style={{ fontSize: 11, color: '#484f58' }}>{u.email}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notification Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 🎉 Special Announcement"
            style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#30363d'}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message..." rows={4}
            style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.7 }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#30363d'}
          />
        </div>

        <button onClick={send} disabled={sending || !title || !message || (target === 'specific' && !selectedUser)}
          style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', opacity: (!title || !message) ? 0.5 : 1 }}>
          {sending ? '⟳ Sending...' : target === 'all' ? `📢 Send to All ${users.length} Users` : '📬 Send to User'}
        </button>
      </div>
    </div>
  )
}
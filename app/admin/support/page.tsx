'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSupportPage() {
  const [chats, setChats] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [joshuaAvatar, setJoshuaAvatar] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: joshuaData } = await supabase.from('users').select('avatar_url').eq('email', 'admin@capitalmarketpro.com').single()
      if (joshuaData?.avatar_url) setJoshuaAvatar(joshuaData.avatar_url)
      fetchChats()
    }
    init()
  }, [])

  const fetchChats = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('support_chats')
      .select('*, user:users(email, full_name, avatar_url)')
      .order('updated_at', { ascending: false })
    setChats(data || [])
    setLoading(false)
  }

  const openChat = async (chat: any) => {
    setSelected(chat)
    const supabase = createClient()
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true })
    setMessages(data || [])

    // Mark as read
    await supabase.from('support_messages').update({ is_read: true }).eq('chat_id', chat.id).eq('sender_role', 'user')

    // Realtime
    supabase.channel(`admin-chat-${chat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `chat_id=eq.${chat.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as any])
      })
      .subscribe()
  }

  const sendReply = async () => {
    if (!input.trim() || !selected) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const msg = input.trim()
    setInput('')
    await supabase.from('support_messages').insert({
      chat_id: selected.id,
      sender_id: user.id,
      sender_role: 'admin',
      message: msg,
    })

    // Notify user
    await supabase.from('notifications').insert({
      user_id: selected.user_id,
      title: '💬 New Message from Joshua Elder',
      message: msg.slice(0, 100) + (msg.length > 100 ? '...' : ''),
      type: 'info',
    })

    setMessages(prev => [...prev, { id: Date.now(), sender_role: 'admin', message: msg, created_at: new Date().toISOString() }])
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div style={{ height: 'calc(100vh - 54px)', display: 'flex', fontFamily: 'monospace' }}>
      {/* Chat List */}
      <div style={{ width: 280, background: '#0d1117', borderRight: '1px solid #161b22', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #161b22' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 2 }}>Support Inbox</div>
          <div style={{ fontSize: 11, color: '#484f58' }}>{chats.length} conversations</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#484f58', fontSize: 12 }}>Loading...</div>
          ) : chats.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#484f58', fontSize: 12 }}>No chats yet</div>
          ) : chats.map(chat => (
            <div key={chat.id} onClick={() => openChat(chat)}
              style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', cursor: 'pointer', background: selected?.id === chat.id ? 'rgba(201,168,76,0.08)' : 'transparent', borderLeft: selected?.id === chat.id ? '2px solid #C9A84C' : '2px solid transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
                  {(chat.user?.full_name || chat.user?.email || 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.user?.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: 10, color: '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.user?.email}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: chat.status === 'open' ? '#3fb950' : '#484f58', flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {!selected ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060a0f' }}>
          <div style={{ textAlign: 'center', color: '#484f58' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14, marginBottom: 6, color: '#8b949e' }}>Select a conversation</div>
            <div style={{ fontSize: 12 }}>Choose a chat from the left to start replying as Joshua Elder</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#060a0f' }}>
          {/* Chat header */}
          <div style={{ padding: '14px 20px', background: '#0d1117', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f' }}>
              {(selected.user?.full_name || selected.user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{selected.user?.full_name || 'Unknown User'}</div>
              <div style={{ fontSize: 11, color: '#484f58' }}>{selected.user?.email}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 10, color: '#3fb950', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', padding: '4px 10px', borderRadius: 20 }}>● Open</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.sender_role === 'admin' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: msg.sender_role === 'admin' ? 'linear-gradient(135deg, #C9A84C, #E8D08C)' : '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#060a0f', border: `2px solid ${msg.sender_role === 'admin' ? 'rgba(201,168,76,0.3)' : '#21262d'}` }}>
                  {msg.sender_role === 'admin' ? (joshuaAvatar ? <img src={joshuaAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE') : (selected.user?.full_name || 'U')[0].toUpperCase()}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ fontSize: 10, color: '#484f58', marginBottom: 3, textAlign: msg.sender_role === 'admin' ? 'right' : 'left' }}>
                    {msg.sender_role === 'admin' ? 'Joshua Elder (You)' : selected.user?.full_name || 'User'} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: msg.sender_role === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.sender_role === 'admin' ? 'linear-gradient(135deg, #C9A84C, #E8D08C)' : '#161b22', color: msg.sender_role === 'admin' ? '#060a0f' : '#e6edf3', fontSize: 13, lineHeight: 1.7, border: msg.sender_role === 'admin' ? 'none' : '1px solid #21262d' }}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          <div style={{ padding: '12px 16px', background: '#0d1117', borderTop: '1px solid #161b22', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
              {joshuaAvatar ? <img src={joshuaAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
            </div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Reply as Joshua Elder..."
              style={{ flex: 1, background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#21262d'}
            />
            <button onClick={sendReply} style={{ width: 42, height: 42, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>➤</button>
          </div>
        </div>
      )}
    </div>
  )
}
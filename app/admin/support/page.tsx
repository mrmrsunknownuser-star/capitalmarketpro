'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSupportPage() {
  const [chats, setChats] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [adminId, setAdminId] = useState<string | null>(null)
  const [joshuaAvatar, setJoshuaAvatar] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setAdminId(user.id)

      const { data: jd } = await supabase.from('users').select('avatar_url').eq('email', 'admin@capitalmarketpro.com').single()
      if (jd?.avatar_url) setJoshuaAvatar(jd.avatar_url)

      const { data, error } = await supabase
  .from('support_chats')
  .select('*')
  .order('created_at', { ascending: false })

if (error) console.error('Chats error:', error)

// Fetch user info separately
if (data && data.length > 0) {
  const userIds = data.map(c => c.user_id).filter(Boolean)
  const { data: users } = await supabase
    .from('users')
    .select('id, email, full_name, avatar_url')
    .in('id', userIds)

  const chatsWithUsers = data.map(chat => ({
    ...chat,
    user: users?.find(u => u.id === chat.user_id) || null,
  }))
  setChats(chatsWithUsers)
} else {
  setChats(data || [])
}

setLoading(false)
    }
    init()
  }, [])

  const openChat = async (chat: any) => {
    setSelected(chat)
    setMessages([])
    const supabase = createClient()

    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true })

    setMessages(data || [])

    // Mark user messages as read
    await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('chat_id', chat.id)
      .eq('sender_role', 'user')

    // Remove old channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Subscribe to new messages in this chat
    channelRef.current = supabase
      .channel(`admin-chat-${chat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `chat_id=eq.${chat.id}`,
      }, (payload) => {
        const msg = payload.new as any
        setMessages(prev => {
          // avoid duplicates
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      })
      .subscribe()
  }

  const sendReply = async () => {
    if (!input.trim() || !selected || !adminId || sending) return
    setSending(true)

    const msg = input.trim()
    setInput('')

    const supabase = createClient()

    // Insert message
    const { data: newMsg, error } = await supabase
      .from('support_messages')
      .insert({
        chat_id: selected.id,
        sender_id: adminId,
        sender_role: 'admin',
        message: msg,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Send error:', error)
      setSending(false)
      setInput(msg)
      return
    }

    // Update chat timestamp
    await supabase
      .from('support_chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', selected.id)

    // Notify user
    await supabase.from('notifications').insert({
      user_id: selected.user?.id || selected.user_id,
      title: '💬 New Message from Joshua Elder',
      message: msg.slice(0, 100) + (msg.length > 100 ? '...' : ''),
      type: 'info',
      is_read: false,
    })

    setSending(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getUserName = (chat: any) => chat.user?.full_name || chat.user?.email?.split('@')[0] || 'Unknown'
  const getUserInitial = (chat: any) => (chat.user?.full_name || chat.user?.email || 'U')[0].toUpperCase()

  return (
    <div style={{ height: 'calc(100vh - 54px)', display: 'flex', fontFamily: 'monospace', overflow: 'hidden' }}>

      {/* Chat List */}
      <div style={{ width: 280, background: '#0d1117', borderRight: '1px solid #161b22', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #161b22', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 2 }}>Support Inbox</div>
          <div style={{ fontSize: 11, color: '#484f58' }}>{chats.length} conversations</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#484f58', fontSize: 12 }}>Loading...</div>
          ) : chats.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#484f58', fontSize: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              No conversations yet
            </div>
          ) : chats.map(chat => (
            <div key={chat.id} onClick={() => openChat(chat)}
              style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', cursor: 'pointer', background: selected?.id === chat.id ? 'rgba(201,168,76,0.08)' : 'transparent', borderLeft: `2px solid ${selected?.id === chat.id ? '#C9A84C' : 'transparent'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', flexShrink: 0, overflow: 'hidden' }}>
                  {chat.user?.avatar_url ? <img src={chat.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getUserInitial(chat)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getUserName(chat)}</div>
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
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <div style={{ fontSize: 15, marginBottom: 8, color: '#8b949e', fontWeight: 600 }}>Select a conversation</div>
            <div style={{ fontSize: 12 }}>Choose a chat to reply as Joshua Elder</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#060a0f', overflow: 'hidden' }}>

          {/* Chat header */}
          <div style={{ padding: '12px 20px', background: '#0d1117', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0 }}>
              {selected.user?.avatar_url ? <img src={selected.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getUserInitial(selected)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{getUserName(selected)}</div>
              <div style={{ fontSize: 11, color: '#484f58' }}>{selected.user?.email}</div>
            </div>
            <div style={{ fontSize: 10, color: '#3fb950', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', padding: '4px 10px', borderRadius: 20 }}>● Open</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#484f58', fontSize: 13 }}>No messages yet. Start the conversation!</div>
            ) : messages.map((msg, i) => (
              <div key={msg.id || i} style={{ display: 'flex', gap: 10, flexDirection: msg.sender_role === 'admin' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: msg.sender_role === 'admin' ? 'linear-gradient(135deg,#C9A84C,#E8D08C)' : '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: msg.sender_role === 'admin' ? '#060a0f' : '#e6edf3', border: `2px solid ${msg.sender_role === 'admin' ? 'rgba(201,168,76,0.3)' : '#21262d'}` }}>
                  {msg.sender_role === 'admin'
                    ? (joshuaAvatar ? <img src={joshuaAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE')
                    : getUserInitial(selected)}
                </div>
                <div style={{ maxWidth: '72%' }}>
                  <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4, textAlign: msg.sender_role === 'admin' ? 'right' : 'left' }}>
                    {msg.sender_role === 'admin' ? 'Joshua Elder' : getUserName(selected)} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ padding: '11px 15px', borderRadius: msg.sender_role === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.sender_role === 'admin' ? 'linear-gradient(135deg,#C9A84C,#E8D08C)' : '#161b22', color: msg.sender_role === 'admin' ? '#060a0f' : '#e6edf3', fontSize: 13, lineHeight: 1.7, border: msg.sender_role === 'admin' ? 'none' : '1px solid #21262d' }}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply input */}
          <div style={{ padding: '12px 16px', background: '#0d1117', borderTop: '1px solid #161b22', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
              {joshuaAvatar ? <img src={joshuaAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
            </div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Reply as Joshua Elder... (Enter to send)"
              disabled={sending}
              style={{ flex: 1, background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', opacity: sending ? 0.7 : 1 }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#21262d'}
            />
            <button
              onClick={sendReply}
              disabled={!input.trim() || sending}
              style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: sending ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 18, cursor: !input.trim() || sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: !input.trim() ? 0.5 : 1 }}>
              {sending ? '⟳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
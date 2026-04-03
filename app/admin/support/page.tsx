'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSupportPage() {
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  const fetchChats = async () => {
    const supabase = createClient()
    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, created_at')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })

    if (!users) { setLoading(false); return }

    const chatsWithMessages = await Promise.all(
      users.map(async (user) => {
        const { data: lastMsg } = await supabase
          .from('support_messages')
          .select('content, created_at, sender_role, is_read')
          .eq('chat_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const { count } = await supabase
          .from('support_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', user.id)
          .eq('sender_role', 'user')
          .eq('is_read', false)

        return {
          ...user,
          lastMessage: lastMsg?.content || null,
          lastMessageTime: lastMsg?.created_at || user.created_at,
          lastSenderRole: lastMsg?.sender_role || null,
          unreadCount: count || 0,
        }
      })
    )

    chatsWithMessages.sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    )

    setChats(chatsWithMessages)
    setLoading(false)
  }

  const fetchMessages = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('chat_id', userId)
      .order('created_at', { ascending: true })
    setMessages(data || [])

    // Mark user messages as read
    await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('chat_id', userId)
      .eq('sender_role', 'user')
      .eq('is_read', false)

    // Update unread count in list
    setChats(prev => prev.map(c => c.id === userId ? { ...c, unreadCount: 0 } : c))
  }

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (!selectedChat) return
    fetchMessages(selectedChat.id)

    const supabase = createClient()

    // Cleanup old channel
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    // Subscribe to new messages
    channelRef.current = supabase
      .channel(`admin-support-${selectedChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `chat_id=eq.${selectedChat.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as any])
      })
      .subscribe()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [selectedChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return
    setSending(true)
    const supabase = createClient()

    const msgContent = newMessage.trim()
    setNewMessage('')

    // Ensure chat exists
    await supabase.from('support_chats').upsert({
      id: selectedChat.id,
      user_id: selectedChat.id,
      status: 'open',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    await supabase.from('support_messages').insert({
      chat_id: selectedChat.id,
      sender_id: selectedChat.id,
      sender_role: 'admin',
      content: msgContent,
      is_read: false,
      created_at: new Date().toISOString(),
    })

    // Notify user
    await supabase.from('notifications').insert({
      user_id: selectedChat.id,
      title: '💬 Message from Joshua Elder',
      message: msgContent.length > 80 ? msgContent.slice(0, 80) + '...' : msgContent,
      type: 'info',
      is_read: false,
    })

    // Update chat in list
    setChats(prev => prev.map(c =>
      c.id === selectedChat.id
        ? { ...c, lastMessage: msgContent, lastMessageTime: new Date().toISOString(), lastSenderRole: 'admin' }
        : c
    ))

    setSending(false)
  }

  const QUICK_TEMPLATES = [
    { label: '👋 Welcome', msg: (name: string) => `Hi ${name}! I'm Joshua, your dedicated Account Manager at CapitalMarket Pro. I'm here to help you maximize your investment returns. How can I assist you today?` },
    { label: '📈 Check In', msg: (name: string) => `Hello ${name}! I wanted to personally check in on your portfolio performance. Do you have any questions about your investments or would you like to discuss upgrading your plan?` },
    { label: '💰 Upgrade Plan', msg: (name: string) => `Hi ${name}! I've been analyzing your account and I believe you could significantly increase your daily returns by upgrading to our Gold or Platinum plan. Would you like me to walk you through the benefits?` },
    { label: '⚡ Market Alert', msg: (name: string) => `${name}, our AI has just detected a major market opportunity! Your current plan is already capitalizing on this move. Want to know more about how to maximize your gains during this period?` },
    { label: '🎯 KYC Reminder', msg: (name: string) => `Hi ${name}! I noticed your identity verification is still pending. Completing KYC will unlock withdrawals and give you full access to all our premium features. Can I help you through the process?` },
    { label: '💸 Deposit Prompt', msg: (name: string) => `Hello ${name}! Our AI trading system is performing exceptionally well right now. Have you considered adding more funds to amplify your daily returns? I can guide you through the deposit process.` },
    { label: '✅ Approval Notice', msg: (name: string) => `Great news, ${name}! Your recent request has been processed and approved. Your account has been updated accordingly. Is there anything else I can help you with?` },
    { label: '📞 Schedule Call', msg: (name: string) => `Hi ${name}! I'd love to schedule a personal consultation to discuss your investment goals and how we can help you achieve them faster. When would be a good time for you?` },
  ]

  const filteredChats = chats.filter(c =>
    !search ||
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const firstName = (name: string) => name?.split(' ')[0] || 'there'

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', fontFamily: 'monospace', background: '#060a0f' }}>

      {/* LEFT PANEL — Chat list */}
      <div style={{ width: 300, borderRight: '1px solid #161b22', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#0a0e14' }}>

        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #161b22' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 10 }}>
            💬 Support Inbox
            {chats.reduce((s, c) => s + c.unreadCount, 0) > 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, background: '#f85149', color: '#fff', padding: '2px 7px', borderRadius: 20, fontWeight: 800 }}>
                {chats.reduce((s, c) => s + c.unreadCount, 0)}
              </span>
            )}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search users..."
            style={{ width: '100%', background: '#161b22', border: '1px solid #21262d', borderRadius: 8, padding: '8px 12px', color: '#e6edf3', fontSize: 12, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#21262d'}
          />
        </div>

        {/* Chat list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#484f58', fontSize: 12 }}>Loading chats...</div>
          ) : filteredChats.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#484f58', fontSize: 12 }}>No users found</div>
          ) : filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                borderBottom: '1px solid #161b22',
                cursor: 'pointer',
                background: selectedChat?.id === chat.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderLeft: selectedChat?.id === chat.id ? '3px solid #C9A84C' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (selectedChat?.id !== chat.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              onMouseLeave={e => { if (selectedChat?.id !== chat.id) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f', overflow: 'hidden' }}>
                  {chat.avatar_url
                    ? <img src={chat.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (chat.full_name || chat.email || 'U')[0].toUpperCase()}
                </div>
                {chat.unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#f85149', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', border: '2px solid #0a0e14' }}>
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <div style={{ fontSize: 12, fontWeight: chat.unreadCount > 0 ? 800 : 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                    {chat.full_name || 'No name'}
                  </div>
                  <div style={{ fontSize: 9, color: '#484f58', flexShrink: 0 }}>
                    {new Date(chat.lastMessageTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: chat.unreadCount > 0 ? '#8b949e' : '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: chat.unreadCount > 0 ? 600 : 400 }}>
                  {chat.lastMessage
                    ? `${chat.lastSenderRole === 'admin' ? 'Joshua: ' : ''}${chat.lastMessage.slice(0, 35)}${chat.lastMessage.length > 35 ? '...' : ''}`
                    : 'No messages yet'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Chat window */}
      {!selectedChat ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#060a0f' }}>JE</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>Joshua C. Elder</div>
            <div style={{ fontSize: 13, color: '#484f58', marginBottom: 4 }}>Account Manager · CapitalMarket Pro</div>
            <div style={{ fontSize: 12, color: '#484f58' }}>Select a user from the left to start chatting</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[`${chats.length} Users`, `${chats.reduce((s, c) => s + c.unreadCount, 0)} Unread`].map(s => (
              <div key={s} style={{ fontSize: 12, color: '#C9A84C', background: 'rgba(201,168,76,0.1)', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(201,168,76,0.2)' }}>{s}</div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Chat header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12, background: '#0a0e14', flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0 }}>
              {selectedChat.avatar_url
                ? <img src={selectedChat.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (selectedChat.full_name || selectedChat.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{selectedChat.full_name || 'No name'}</div>
              <div style={{ fontSize: 11, color: '#484f58' }}>{selectedChat.email}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ fontSize: 10, color: '#3fb950', background: 'rgba(63,185,80,0.1)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(63,185,80,0.2)' }}>
                Replying as Joshua Elder
              </div>
              <button onClick={() => setSelectedChat(null)}
                style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 28, height: 28, fontSize: 13 }}>✕</button>
            </div>
          </div>

          {/* Quick templates */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #161b22', background: '#0a0e14', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#484f58', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Templates:</div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {QUICK_TEMPLATES.map(tmpl => (
                <button key={tmpl.label} onClick={() => setNewMessage(tmpl.msg(firstName(selectedChat.full_name)))}
                  style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 40 }}>💬</div>
                <div style={{ fontSize: 13, color: '#484f58', textAlign: 'center' }}>
                  No messages yet.<br />Use a template above or type a message below.
                </div>
              </div>
            ) : messages.map((msg, i) => {
              const isAdmin = msg.sender_role === 'admin'
              const showTime = i === 0 || new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 5 * 60 * 1000

              return (
                <div key={msg.id || i}>
                  {showTime && (
                    <div style={{ textAlign: 'center', fontSize: 10, color: '#484f58', marginBottom: 8 }}>
                      {new Date(msg.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                    {!isAdmin && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#060a0f', flexShrink: 0, overflow: 'hidden' }}>
                        {selectedChat.avatar_url
                          ? <img src={selectedChat.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (selectedChat.full_name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '72%',
                      padding: '10px 14px',
                      borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isAdmin ? 'linear-gradient(135deg,#C9A84C,#E8D08C)' : '#161b22',
                      border: isAdmin ? 'none' : '1px solid #21262d',
                      color: isAdmin ? '#060a0f' : '#e6edf3',
                      fontSize: 13,
                      lineHeight: 1.6,
                      fontFamily: 'monospace',
                    }}>
                      {msg.content}
                    </div>
                    {isAdmin && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
                        JE
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid #161b22', background: '#0a0e14', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Type a message as Joshua Elder... (Enter to send)"
                rows={2}
                style={{ flex: 1, background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', resize: 'none', lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#21262d'}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                style={{ padding: '14px 20px', borderRadius: 12, border: 'none', background: !newMessage.trim() || sending ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: !newMessage.trim() || sending ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer', fontFamily: 'monospace', flexShrink: 0, height: 52 }}>
                {sending ? '⟳' : '→'}
              </button>
            </div>
            <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>
              Enter to send · Shift+Enter for new line · Replying as Joshua Elder
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
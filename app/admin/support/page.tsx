'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Chat = {
  id: string
  user_id: string
  status: string
  subject: string | null
  last_message: string | null
  last_message_at: string | null
  created_at: string
  user: {
    email: string
    full_name: string | null
  }
}

type Message = {
  id: string
  chat_id: string
  sender_id: string
  sender_role: string
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminSupportPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminId, setAdminId] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setAdminId(user.id)
      fetchChats()
    }
    init()
  }, [])

  const fetchChats = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('support_chats')
      .select('*, user:users(email, full_name)')
      .order('last_message_at', { ascending: false })
    setChats(data || [])
  }

  const loadMessages = async (chat: Chat) => {
    setSelectedChat(chat)
    const supabase = createClient()
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true })
    setMessages(data || [])

    // Mark messages as read
    await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('chat_id', chat.id)
      .eq('sender_role', 'user')

    // Subscribe to new messages
    supabase
      .channel(`chat:${chat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `chat_id=eq.${chat.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return
    setLoading(true)
    const supabase = createClient()

    await supabase.from('support_messages').insert({
      chat_id: selectedChat.id,
      sender_id: adminId,
      sender_role: 'admin',
      message: newMessage.trim(),
      is_read: false,
    })

    await supabase.from('support_chats').update({
      last_message: newMessage.trim(),
      last_message_at: new Date().toISOString(),
    }).eq('id', selectedChat.id)

    // Notify user
    await supabase.from('notifications').insert({
      user_id: selectedChat.user_id,
      title: '💬 New message from Support',
      message: newMessage.trim().slice(0, 100),
      type: 'info',
    })

    setNewMessage('')
    setLoading(false)
    fetchChats()
  }

  const closeChat = async (chatId: string) => {
    const supabase = createClient()
    await supabase.from('support_chats').update({ status: 'closed' }).eq('id', chatId)
    fetchChats()
    if (selectedChat?.id === chatId) setSelectedChat(prev => prev ? { ...prev, status: 'closed' } : null)
  }

  const unreadCount = (chat: Chat) => {
    return messages.filter(m => m.chat_id === chat.id && !m.is_read && m.sender_role === 'user').length
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Live Support</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Respond to user support messages in real-time</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, height: 'calc(100vh - 180px)' }}>

        {/* Chat List */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>Active Chats</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>{chats.filter(c => c.status === 'open').length} open</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chats.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#484f58', fontSize: 13 }}>No support chats yet</div>
            ) : chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => loadMessages(chat)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #161b22',
                  cursor: 'pointer',
                  background: selectedChat?.id === chat.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                  borderLeft: selectedChat?.id === chat.id ? '3px solid #C9A84C' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#060a0f', flexShrink: 0 }}>
                      {(chat.user?.full_name || chat.user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{chat.user?.full_name || 'User'}</div>
                      <div style={{ fontSize: 10, color: '#484f58' }}>{chat.user?.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 9, color: chat.status === 'open' ? '#3fb950' : '#484f58', background: chat.status === 'open' ? 'rgba(63,185,80,0.15)' : 'rgba(72,79,88,0.2)', padding: '2px 6px', borderRadius: 10, textTransform: 'uppercase' }}>
                      {chat.status}
                    </span>
                  </div>
                </div>
                {chat.last_message && (
                  <div style={{ fontSize: 11, color: '#484f58', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.last_message}
                  </div>
                )}
                {chat.subject && (
                  <div style={{ fontSize: 10, color: '#C9A84C', marginTop: 4 }}>📌 {chat.subject}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedChat ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 40 }}>💬</div>
              <div style={{ fontSize: 14, color: '#484f58' }}>Select a chat to start responding</div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#060a0f' }}>
                    {(selectedChat.user?.full_name || selectedChat.user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{selectedChat.user?.full_name || 'User'}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>{selectedChat.user?.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedChat.status === 'open' && (
                    <button
                      onClick={() => closeChat(selectedChat.id)}
                      style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer' }}
                    >
                      Close Chat
                    </button>
                  )}
                  <span style={{ fontSize: 10, color: selectedChat.status === 'open' ? '#3fb950' : '#484f58', background: selectedChat.status === 'open' ? 'rgba(63,185,80,0.15)' : 'rgba(72,79,88,0.2)', padding: '6px 10px', borderRadius: 8, textTransform: 'uppercase' }}>
                    {selectedChat.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#484f58', fontSize: 13, marginTop: 40 }}>No messages yet</div>
                ) : messages.map((msg) => {
                  const isAdmin = msg.sender_role === 'admin'
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%',
                        background: isAdmin ? 'linear-gradient(135deg, #C9A84C, #E8D08C)' : '#161b22',
                        borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '10px 14px',
                      }}>
                        <div style={{ fontSize: 13, color: isAdmin ? '#060a0f' : '#e6edf3', lineHeight: 1.5 }}>{msg.message}</div>
                        <div style={{ fontSize: 9, color: isAdmin ? 'rgba(6,10,15,0.6)' : '#484f58', marginTop: 4, textAlign: 'right' }}>
                          {isAdmin ? '👤 Admin · ' : ''}{new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid #161b22' }}>
                {selectedChat.status === 'closed' ? (
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#484f58', padding: '10px 0' }}>This chat is closed</div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                      placeholder="Type your response..."
                      style={{ flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '12px 16px', color: '#e6edf3', fontSize: 13, outline: 'none' }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !newMessage.trim()}
                      style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading || !newMessage.trim() ? 0.5 : 1 }}
                    >
                      Send →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
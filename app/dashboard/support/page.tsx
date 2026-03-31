'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SupportPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [subject, setSubject] = useState('')
  const [started, setStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Check existing chat
      const { data: chat } = await supabase
        .from('support_chats')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .single()

      if (chat) {
        setChatId(chat.id)
        setStarted(true)
        loadMessages(chat.id)
      }
    }
    init()
  }, [])

  const loadMessages = async (id: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('chat_id', id)
      .order('created_at', { ascending: true })
    setMessages(data || [])

    supabase
      .channel(`user-chat:${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `chat_id=eq.${id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
  }

  const startChat = async () => {
    if (!subject.trim()) return
    setLoading(true)
    const supabase = createClient()

    const { data: chat } = await supabase
      .from('support_chats')
      .insert({ user_id: userId, subject, status: 'open' })
      .select()
      .single()

    if (chat) {
      setChatId(chat.id)
      setStarted(true)
      loadMessages(chat.id)
    }
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return
    setLoading(true)
    const supabase = createClient()

    await supabase.from('support_messages').insert({
      chat_id: chatId,
      sender_id: userId,
      sender_role: 'user',
      message: newMessage.trim(),
    })

    await supabase.from('support_chats').update({
      last_message: newMessage.trim(),
      last_message_at: new Date().toISOString(),
    }).eq('id', chatId)

    setNewMessage('')
    setLoading(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Live Support</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Chat with our support team in real-time</div>
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden', height: 600, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12, background: '#0a0e14' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            🎧
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>CapitalMarket Pro Support</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950' }} />
              <span style={{ fontSize: 11, color: '#3fb950' }}>Online — Average response time: 5 mins</span>
            </div>
          </div>
        </div>

        {!started ? (
          /* Start Chat */
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>Start a Support Chat</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 24 }}>Describe your issue and our team will assist you shortly</div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What do you need help with?"
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
              />
              <button
                onClick={startChat}
                disabled={loading || !subject.trim()}
                style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading || !subject.trim() ? 0.5 : 1 }}
              >
                {loading ? 'Starting...' : 'Start Chat →'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Welcome message */}
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: 11, color: '#484f58', background: '#161b22', padding: '4px 12px', borderRadius: 20 }}>
                  Chat started · Support team will respond shortly
                </span>
              </div>

              {messages.map(msg => {
                const isUser = msg.sender_role === 'user'
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      background: isUser ? 'linear-gradient(135deg, #C9A84C, #E8D08C)' : '#161b22',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '10px 14px',
                    }}>
                      {!isUser && (
                        <div style={{ fontSize: 10, color: '#C9A84C', marginBottom: 4, fontWeight: 600 }}>Support Agent</div>
                      )}
                      <div style={{ fontSize: 13, color: isUser ? '#060a0f' : '#e6edf3', lineHeight: 1.5 }}>{msg.message}</div>
                      <div style={{ fontSize: 9, color: isUser ? 'rgba(6,10,15,0.5)' : '#484f58', marginTop: 4, textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #161b22' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                  placeholder="Type your message..."
                  style={{ flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '12px 16px', color: '#e6edf3', fontSize: 13, outline: 'none' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: !newMessage.trim() ? 0.5 : 1 }}
                >
                  Send →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
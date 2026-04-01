'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const BOT_RESPONSES: Record<string, string> = {
  default: "Thank you for reaching out to CapitalMarket Pro support. I'm transferring you to your dedicated account manager Joshua Elder who will assist you shortly. 🔄",
  deposit: "💰 To make a deposit: Go to Dashboard → Deposit → Choose your preferred provider (MoonPay, Binance, Coinbase etc) → Send Bitcoin to your unique address. Processing takes under 30 minutes. Need more help?",
  withdraw: "💸 To withdraw: Go to Dashboard → Withdraw → Enter amount and your Bitcoin wallet address → Submit request. Our team reviews within 24-48 hours. A 5% processing fee applies (min $100). Need help?",
  kyc: "🪪 To complete KYC verification: Go to Dashboard → Verification → Upload your government ID (front & back) + selfie. Standard processing takes 24-48 hours. Expedited processing ($50) takes 2-4 hours.",
  signal: "⚡ Our signal plans range from Basic ($99/mo) to VIP ($599/mo). All plans include automated buy/sell signals with 84% historical accuracy. Visit Dashboard → Signals to subscribe.",
  invest: "💹 Our investment plans range from Starter ($200 min, 5%/day) to Black ($100k min, 25%/day). All plans are fully automated. Visit Dashboard → Invest to get started.",
  card: "💳 We offer virtual cards (from $150) and physical Titanium cards (from $2,500). All cards are VISA-powered with up to 7% cashback. Visit Dashboard → Cards to apply.",
  account: "👤 Your dedicated account manager is Joshua C. Elder, Senior Portfolio Manager. He oversees all investment plans and is available 24/7. You can message him directly in this chat.",
  fee: "📋 Our fees: Deposit 0% · Withdrawal 5% (min $100) · Trading commission 10% on profits · Inactivity $39.90/month after 6 months. Full details at capitalmarket-pro.com/terms",
  hello: "👋 Hello! Welcome to CapitalMarket Pro support. I'm the automated assistant. How can I help you today? You can ask about: deposits, withdrawals, KYC, signals, investments, cards, or fees.",
  hi: "👋 Hi there! Welcome to CapitalMarket Pro. I'm here to help. What do you need assistance with today?",
  human: "🔄 Connecting you to your dedicated account manager Joshua C. Elder now. Please hold — he typically responds within 2 hours.",
  trading: "📈 For manual trading: Go to Dashboard → Manual Trade → Fund your account (min $500 via Bitcoin or Apple Pay) → Start trading with up to 100x leverage. Demo mode available!",
  balance: "💰 Your account balance is updated in real-time on your Dashboard home page. If you believe there's an error, please message Joshua directly and he'll resolve it within 1 hour.",
  profit: "📊 Your profits are automatically credited daily for active investment plans. You can view full history in Dashboard → Trades. For withdrawal of profits, visit Dashboard → Withdraw.",
}

const getBotReply = (msg: string): string => {
  const lower = msg.toLowerCase()
  if (lower.includes('hello') || lower.includes('hey')) return BOT_RESPONSES.hello
  if (lower.includes('hi')) return BOT_RESPONSES.hi
  if (lower.includes('deposit') || lower.includes('fund')) return BOT_RESPONSES.deposit
  if (lower.includes('withdraw') || lower.includes('cashout') || lower.includes('cash out')) return BOT_RESPONSES.withdraw
  if (lower.includes('kyc') || lower.includes('verify') || lower.includes('verification')) return BOT_RESPONSES.kyc
  if (lower.includes('signal')) return BOT_RESPONSES.signal
  if (lower.includes('invest') || lower.includes('plan') || lower.includes('roi')) return BOT_RESPONSES.invest
  if (lower.includes('card')) return BOT_RESPONSES.card
  if (lower.includes('fee') || lower.includes('charge') || lower.includes('cost')) return BOT_RESPONSES.fee
  if (lower.includes('account manager') || lower.includes('joshua') || lower.includes('manager')) return BOT_RESPONSES.account
  if (lower.includes('human') || lower.includes('agent') || lower.includes('person') || lower.includes('real')) return BOT_RESPONSES.human
  if (lower.includes('trade') || lower.includes('trading') || lower.includes('leverage')) return BOT_RESPONSES.trading
  if (lower.includes('balance') || lower.includes('balance')) return BOT_RESPONSES.balance
  if (lower.includes('profit') || lower.includes('earning') || lower.includes('return')) return BOT_RESPONSES.profit
  return BOT_RESPONSES.default
}

type Message = {
  id: string
  content: string
  sender: 'user' | 'bot' | 'admin'
  created_at: string
  sender_name?: string
}

export default function SupportPage() {
  const [tab, setTab] = useState<'bot' | 'live'>('bot')
  const [botMessages, setBotMessages] = useState<Message[]>([
    {
      id: '0',
      content: "👋 Welcome to CapitalMarket Pro Support! I'm your automated assistant. Ask me anything about deposits, withdrawals, KYC, investment plans, signals, or cards. Type 'human' to connect with Joshua Elder, your account manager.",
      sender: 'bot',
      created_at: new Date().toISOString(),
      sender_name: 'CMP Bot',
    }
  ])
  const [liveMessages, setLiveMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [joshuaAvatar, setJoshuaAvatar] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Get Joshua's avatar from settings
      const { data: settings } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('email', 'admin@capitalmarketpro.com')
        .single()
      if (settings?.avatar_url) setJoshuaAvatar(settings.avatar_url)

      // Get or create support chat
      const { data: existing } = await supabase
        .from('support_chats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        setChatId(existing.id)
        const { data: msgs } = await supabase
          .from('support_messages')
          .select('*')
          .eq('chat_id', existing.id)
          .order('created_at', { ascending: true })
        if (msgs) setLiveMessages(msgs.map(m => ({
          id: m.id,
          content: m.message,
          sender: m.sender_role === 'user' ? 'user' : 'admin',
          created_at: m.created_at,
          sender_name: m.sender_role === 'admin' ? 'Joshua Elder' : 'You',
        })))
      } else {
        const { data: newChat } = await supabase
          .from('support_chats')
          .insert({ user_id: user.id, status: 'open' })
          .select()
          .single()
        if (newChat) {
          setChatId(newChat.id)
          // Initial message from Joshua
          await supabase.from('support_messages').insert({
            chat_id: newChat.id,
            sender_id: user.id,
            sender_role: 'admin',
            message: "👋 Hello! I'm Joshua C. Elder, your dedicated Account Manager at CapitalMarket Pro. I'm here to help you with your investments, trading, and any account questions. How can I assist you today?",
          })
          setLiveMessages([{
            id: '1',
            content: "👋 Hello! I'm Joshua C. Elder, your dedicated Account Manager at CapitalMarket Pro. I'm here to help you with your investments, trading, and any account questions. How can I assist you today?",
            sender: 'admin',
            created_at: new Date().toISOString(),
            sender_name: 'Joshua Elder',
          }])
        }
      }
    }
    init()
  }, [])

  // Realtime listener for live chat
  useEffect(() => {
    if (!chatId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        const m = payload.new as any
        if (m.sender_role === 'admin') {
          setLiveMessages(prev => [...prev, {
            id: m.id,
            content: m.message,
            sender: 'admin',
            created_at: m.created_at,
            sender_name: 'Joshua Elder',
          }])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [botMessages, liveMessages, botTyping])

  const sendBotMessage = async () => {
    if (!input.trim()) return
    const userMsg: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      created_at: new Date().toISOString(),
    }
    setBotMessages(prev => [...prev, userMsg])
    const userInput = input
    setInput('')
    setBotTyping(true)

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
    setBotTyping(false)

    const reply = getBotReply(userInput)
    setBotMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      content: reply,
      sender: 'bot',
      created_at: new Date().toISOString(),
      sender_name: 'CMP Bot',
    }])
  }

const sendLiveMessage = async () => {
  if (!input.trim() || !chatId || !userId) return
  const supabase = createClient()
  const msgContent = input
  setInput('')

  const newMsg: Message = {
    id: Date.now().toString(),
    content: msgContent,
    sender: 'user',
    created_at: new Date().toISOString(),
  }
  setLiveMessages(prev => [...prev, newMsg])

  // Save message
  await supabase.from('support_messages').insert({
    chat_id: chatId,
    sender_id: userId,
    sender_role: 'user',
    message: msgContent,
  })

  // Update chat timestamp
  await supabase.from('support_chats').update({
    updated_at: new Date().toISOString(),
    status: 'open',
  }).eq('id', chatId)

  // Get admin user id to notify
  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .single()

  if (adminUser?.id) {
    // Create admin notification
    await supabase.from('notifications').insert({
      user_id: adminUser.id,
      title: '💬 New Support Message',
      message: `A user sent: "${msgContent.slice(0, 80)}${msgContent.length > 80 ? '...' : ''}"`,
      type: 'support',
      is_read: false,
    })
  }
}
  const handleSend = () => {
    if (tab === 'bot') sendBotMessage()
    else sendLiveMessage()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const messages = tab === 'bot' ? botMessages : liveMessages

  return (
    <div style={{ height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ padding: '16px 20px', background: '#0d1117', borderBottom: '1px solid #161b22', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3' }}>Support Center</div>
            <div style={{ fontSize: 12, color: '#484f58' }}>We typically respond within 2 hours</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#161b22', borderRadius: 10, padding: 4 }}>
          <button onClick={() => setTab('bot')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: tab === 'bot' ? '#0d1117' : 'transparent', color: tab === 'bot' ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === 'bot' ? 700 : 400 }}>
            🤖 Auto Support
          </button>
          <button onClick={() => setTab('live')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: tab === 'live' ? '#0d1117' : 'transparent', color: tab === 'live' ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === 'live' ? 700 : 400 }}>
            👤 Joshua Elder
          </button>
        </div>
      </div>

      {/* Joshua header for live tab */}
      {tab === 'live' && (
        <div style={{ padding: '14px 20px', background: 'rgba(201,168,76,0.04)', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f', overflow: 'hidden', border: '2px solid rgba(201,168,76,0.4)' }}>
              {joshuaAvatar ? <img src={joshuaAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
            </div>
            <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#3fb950', border: '2px solid #0d1117' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>Joshua C. Elder</div>
            <div style={{ fontSize: 11, color: '#C9A84C' }}>Account Manager · Senior Portfolio Manager</div>
            <div style={{ fontSize: 10, color: '#3fb950' }}>● Online — responds within 2 hours</div>
          </div>
        </div>
      )}

      {/* Bot header */}
      {tab === 'bot' && (
        <div style={{ padding: '12px 20px', background: 'rgba(123,43,249,0.04)', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7B2BF9, #9B51E0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: '2px solid rgba(123,43,249,0.3)' }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>CMP Automated Assistant</div>
            <div style={{ fontSize: 11, color: '#7B2BF9' }}>AI-powered · Instant responses 24/7</div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
            {/* Avatar */}
            {msg.sender !== 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: msg.sender === 'bot' ? 'linear-gradient(135deg, #7B2BF9, #9B51E0)' : 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: msg.sender === 'bot' ? 14 : 11, fontWeight: 800, color: '#060a0f', border: `2px solid ${msg.sender === 'bot' ? 'rgba(123,43,249,0.3)' : 'rgba(201,168,76,0.3)'}` }}>
                {msg.sender === 'bot' ? '🤖' : (joshuaAvatar ? <img src={joshuaAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE')}
              </div>
            )}
            <div style={{ maxWidth: '75%' }}>
              {msg.sender !== 'user' && (
                <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4, paddingLeft: 4 }}>
                  {msg.sender === 'bot' ? 'CMP Bot' : 'Joshua Elder'} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <div style={{
                padding: '12px 16px',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.sender === 'user' ? 'linear-gradient(135deg, #C9A84C, #E8D08C)' : msg.sender === 'bot' ? '#161b22' : '#0d1117',
                color: msg.sender === 'user' ? '#060a0f' : '#e6edf3',
                fontSize: 13,
                lineHeight: 1.7,
                border: msg.sender === 'user' ? 'none' : msg.sender === 'bot' ? '1px solid #21262d' : '1px solid rgba(201,168,76,0.2)',
              }}>
                {msg.content}
              </div>
              {msg.sender === 'user' && (
                <div style={{ fontSize: 10, color: '#484f58', marginTop: 4, textAlign: 'right', paddingRight: 4 }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Sent
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Bot typing indicator */}
        {botTyping && tab === 'bot' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7B2BF9, #9B51E0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#484f58', animation: `bounce 1.2s ease infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies for bot */}
      {tab === 'bot' && (
        <div style={{ padding: '8px 20px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid #161b22', flexShrink: 0 }}>
          {['Deposit', 'Withdraw', 'KYC', 'Investment Plans', 'Signals', 'Talk to Joshua'].map(q => (
            <button key={q} onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 100) }}
              style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 16px', background: '#0d1117', borderTop: '1px solid #161b22', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={tab === 'bot' ? 'Ask anything...' : 'Message Joshua Elder...'}
          style={{ flex: 1, background: '#161b22', border: '1px solid #21262d', borderRadius: 12, padding: '12px 16px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
          onFocus={e => e.target.style.borderColor = '#C9A84C'}
          onBlur={e => e.target.style.borderColor = '#21262d'}
        />
        <button onClick={handleSend} style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
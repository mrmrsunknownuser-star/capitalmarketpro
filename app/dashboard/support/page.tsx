'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const BOT_RESPONSES: Record<string, string> = {
  default: "Thank you for reaching out! I'm connecting you to Joshua Elder, your dedicated account manager. He will respond shortly. 🔄",
  deposit: "💰 To deposit: Go to Dashboard → Deposit → Choose a provider (MoonPay, Binance etc) → Send Bitcoin to your address. Processing takes under 30 minutes.",
  withdraw: "💸 To withdraw: Go to Dashboard → Withdraw → Enter amount and Bitcoin wallet address → Submit. Our team reviews within 24-48 hours. 5% fee applies.",
  kyc: "🪪 To verify KYC: Go to Dashboard → Verification → Upload government ID (front & back) + selfie. Standard: 24-48hrs. Expedited ($50): 2-4hrs.",
  signal: "⚡ Signal plans: Basic $99/mo, Pro $199/mo, Elite $349/mo, VIP $599/mo. All include automated signals with 84% accuracy.",
  invest: "💹 Investment plans: Starter ($200 min, 5%/day) to Black ($100k min, 25%/day). Fully automated. Visit Dashboard → Invest.",
  card: "💳 Cards from $150 (virtual) to $2,500 (Titanium). All VISA-powered with cashback. Visit Dashboard → Cards.",
  fee: "📋 Fees: Deposit 0% · Withdrawal 5% (min $100) · Trading 10% on profits · Inactivity $39.90/month after 6 months.",
  hello: "👋 Hello! Welcome to CapitalMarket Pro support. How can I help you today? Ask about deposits, withdrawals, KYC, plans, or type 'Joshua' to reach your account manager.",
  hi: "👋 Hi! Welcome to CapitalMarket Pro. What can I help you with today?",
  joshua: "🔄 Connecting you to Joshua C. Elder, your dedicated Account Manager. He will respond within 2 hours.",
  balance: "💰 Your balance updates in real-time on your Dashboard home page. For any discrepancies please contact Joshua directly.",
  trade: "📈 Manual Trading is under Dashboard → Market → Trade tab. Minimum $500 funding via Bitcoin or Apple Pay required.",
}

const getReply = (msg: string) => {
  const l = msg.toLowerCase()
  if (l.includes('hello') || l.includes('hey')) return BOT_RESPONSES.hello
  if (l.includes('hi ') || l === 'hi') return BOT_RESPONSES.hi
  if (l.includes('deposit') || l.includes('fund')) return BOT_RESPONSES.deposit
  if (l.includes('withdraw') || l.includes('cashout')) return BOT_RESPONSES.withdraw
  if (l.includes('kyc') || l.includes('verif')) return BOT_RESPONSES.kyc
  if (l.includes('signal')) return BOT_RESPONSES.signal
  if (l.includes('invest') || l.includes('plan') || l.includes('roi')) return BOT_RESPONSES.invest
  if (l.includes('card')) return BOT_RESPONSES.card
  if (l.includes('fee') || l.includes('charge')) return BOT_RESPONSES.fee
  if (l.includes('joshua') || l.includes('human') || l.includes('agent') || l.includes('person')) return BOT_RESPONSES.joshua
  if (l.includes('balance')) return BOT_RESPONSES.balance
  if (l.includes('trade') || l.includes('trading')) return BOT_RESPONSES.trade
  return BOT_RESPONSES.default
}

type Msg = { id: string; content: string; sender: 'user' | 'bot' | 'admin'; time: string; name?: string }

export default function SupportPage() {
  const [tab, setTab] = useState<'bot' | 'live'>('bot')
  const [botMsgs, setBotMsgs] = useState<Msg[]>([{
    id: '0', sender: 'bot', time: new Date().toISOString(), name: 'CMP Bot',
    content: "👋 Welcome to CapitalMarket Pro Support! I'm your automated assistant. Ask anything about deposits, withdrawals, KYC, investment plans, signals, or cards. Type 'Joshua' to connect with your account manager.",
  }])
  const [liveMsgs, setLiveMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [joshuaAvatar, setJoshuaAvatar] = useState<string | null>(null)
  const [liveReady, setLiveReady] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Get Joshua photo
      const { data: jd } = await supabase.from('users').select('avatar_url').eq('email', 'admin@capitalmarketpro.com').single()
      if (jd?.avatar_url) setJoshuaAvatar(jd.avatar_url)

      // Get or create chat
      let chat: any = null
      const { data: existing } = await supabase
        .from('support_chats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        chat = existing
      } else {
        const { data: newChat } = await supabase
          .from('support_chats')
          .insert({ user_id: user.id, status: 'open', updated_at: new Date().toISOString() })
          .select()
          .single()
        chat = newChat

        // Welcome message from Joshua
        if (newChat) {
          await supabase.from('support_messages').insert({
            chat_id: newChat.id,
            sender_id: user.id,
            sender_role: 'admin',
            message: "👋 Hello! I'm Joshua C. Elder, your dedicated Account Manager. I'm here to help with your investments, trading, and any account questions. How can I assist you today?",
          })
        }
      }

      if (chat) {
        setChatId(chat.id)

        // Load existing messages
        const { data: msgs } = await supabase
          .from('support_messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true })

        if (msgs) {
          setLiveMsgs(msgs.map(m => ({
            id: m.id,
            content: m.message,
            sender: m.sender_role === 'user' ? 'user' : 'admin',
            time: m.created_at,
            name: m.sender_role === 'admin' ? 'Joshua Elder' : 'You',
          })))
        }

        setLiveReady(true)

        // Subscribe to new messages
        if (channelRef.current) supabase.removeChannel(channelRef.current)
        channelRef.current = supabase
          .channel(`user-chat-${chat.id}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: `chat_id=eq.${chat.id}`,
          }, (payload) => {
            const m = payload.new as any
            if (m.sender_role === 'admin') {
              setLiveMsgs(prev => {
                if (prev.find(x => x.id === m.id)) return prev
                return [...prev, {
                  id: m.id,
                  content: m.message,
                  sender: 'admin',
                  time: m.created_at,
                  name: 'Joshua Elder',
                }]
              })
            }
          })
          .subscribe()
      }
    }
    init()
    return () => {
      const supabase = createClient()
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [botMsgs, liveMsgs, botTyping])

  const sendBot = async () => {
    if (!input.trim()) return
    const userMsg: Msg = { id: Date.now().toString(), content: input, sender: 'user', time: new Date().toISOString() }
    setBotMsgs(prev => [...prev, userMsg])
    const userInput = input
    setInput('')
    setBotTyping(true)
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 600))
    setBotTyping(false)
    setBotMsgs(prev => [...prev, { id: Date.now().toString(), content: getReply(userInput), sender: 'bot', time: new Date().toISOString(), name: 'CMP Bot' }])
  }

  const sendLive = async () => {
    if (!input.trim() || !chatId || !userId) return
    const supabase = createClient()
    const msg = input.trim()
    setInput('')

    // Optimistically add to UI
    const tempId = Date.now().toString()
    setLiveMsgs(prev => [...prev, { id: tempId, content: msg, sender: 'user', time: new Date().toISOString() }])

    // Save to DB
    await supabase.from('support_messages').insert({
      chat_id: chatId,
      sender_id: userId,
      sender_role: 'user',
      message: msg,
    })

    // Update chat timestamp
    await supabase.from('support_chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId)

    // Notify admin
    const { data: adminUser } = await supabase.from('users').select('id').eq('role', 'admin').single()
    if (adminUser?.id) {
      await supabase.from('notifications').insert({
        user_id: adminUser.id,
        title: '💬 New Support Message',
        message: `User: "${msg.slice(0, 80)}${msg.length > 80 ? '...' : ''}"`,
        type: 'support',
        is_read: false,
      })
    }
  }

  const handleSend = () => tab === 'bot' ? sendBot() : sendLive()
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const msgs = tab === 'bot' ? botMsgs : liveMsgs

  return (
    <div style={{ height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', background: '#0d1117', borderBottom: '1px solid #161b22', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', marginBottom: 10 }}>Support Center</div>
        <div style={{ display: 'flex', gap: 4, background: '#161b22', borderRadius: 10, padding: 3 }}>
          <button onClick={() => setTab('bot')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: tab === 'bot' ? '#0d1117' : 'transparent', color: tab === 'bot' ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === 'bot' ? 700 : 400 }}>
            🤖 Auto Support
          </button>
          <button onClick={() => setTab('live')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: tab === 'live' ? '#0d1117' : 'transparent', color: tab === 'live' ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === 'live' ? 700 : 400 }}>
            👤 Joshua Elder
          </button>
        </div>
      </div>

      {/* Joshua header */}
      {tab === 'live' && (
        <div style={{ padding: '12px 20px', background: 'rgba(201,168,76,0.04)', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f', overflow: 'hidden', border: '2px solid rgba(201,168,76,0.4)' }}>
              {joshuaAvatar ? <img src={joshuaAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
            </div>
            <div style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#3fb950', border: '2px solid #0d1117' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>Joshua C. Elder</div>
            <div style={{ fontSize: 11, color: '#C9A84C' }}>Account Manager</div>
            <div style={{ fontSize: 10, color: '#3fb950' }}>● Online · responds within 2 hours</div>
          </div>
        </div>
      )}

      {/* Bot header */}
      {tab === 'bot' && (
        <div style={{ padding: '10px 20px', background: 'rgba(123,43,249,0.04)', borderBottom: '1px solid #161b22', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#7B2BF9,#9B51E0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>CMP Automated Assistant</div>
            <div style={{ fontSize: 11, color: '#7B2BF9' }}>AI-powered · Instant responses 24/7</div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((msg, i) => (
          <div key={msg.id || i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
            {msg.sender !== 'user' && (
              <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: msg.sender === 'bot' ? 'linear-gradient(135deg,#7B2BF9,#9B51E0)' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: msg.sender === 'bot' ? 14 : 11, fontWeight: 800, color: '#060a0f' }}>
                {msg.sender === 'bot' ? '🤖' : (joshuaAvatar ? <img src={joshuaAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE')}
              </div>
            )}
            <div style={{ maxWidth: '76%' }}>
              {msg.sender !== 'user' && (
                <div style={{ fontSize: 10, color: '#484f58', marginBottom: 3, paddingLeft: 4 }}>
                  {msg.name || (msg.sender === 'bot' ? 'CMP Bot' : 'Joshua Elder')} · {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <div style={{ padding: '11px 15px', borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.sender === 'user' ? 'linear-gradient(135deg,#C9A84C,#E8D08C)' : msg.sender === 'bot' ? '#161b22' : '#0d1117', color: msg.sender === 'user' ? '#060a0f' : '#e6edf3', fontSize: 13, lineHeight: 1.7, border: msg.sender === 'user' ? 'none' : msg.sender === 'bot' ? '1px solid #21262d' : '1px solid rgba(201,168,76,0.2)' }}>
                {msg.content}
              </div>
              {msg.sender === 'user' && (
                <div style={{ fontSize: 10, color: '#484f58', marginTop: 3, textAlign: 'right', paddingRight: 4 }}>
                  {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Sent ✓
                </div>
              )}
            </div>
          </div>
        ))}

        {botTyping && tab === 'bot' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7B2BF9,#9B51E0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
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
            <button key={q} onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50) }}
              style={{ padding: '5px 11px', borderRadius: 20, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
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
        <button onClick={handleSend} disabled={!input.trim()}
          style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: input.trim() ? 'linear-gradient(135deg,#C9A84C,#E8D08C)' : '#161b22', color: '#060a0f', fontSize: 18, cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
      `}</style>
    </div>
  )
}
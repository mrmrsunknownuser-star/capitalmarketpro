'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const BOT_RESPONSES: Record<string, string> = {
  'deposit': 'To deposit funds, go to Dashboard → Deposit. Send Bitcoin or other crypto to your unique wallet address and submit your transaction hash. Funds appear within 30 minutes after confirmation.',
  'withdraw': 'To withdraw, go to Dashboard → Withdraw. You need completed KYC verification. Enter your amount and wallet address. Processing takes 24-48 hours.',
  'kyc': 'KYC (Know Your Customer) is required to unlock withdrawals and full platform access. Go to Dashboard → KYC Verification and submit your government-issued ID.',
  'plan': 'We offer 6 investment plans: Starter (5%/day), Silver (8%/day), Gold (12%/day), Platinum (15%/day), Elite (20%/day), and Black (25%/day). Visit the Invest page to activate.',
  'profit': 'Your daily profits are automatically credited to your account balance every 24 hours. Go to Portfolio to see your earnings and active plans.',
  'card': 'CapitalMarket Pro offers virtual and physical VISA cards with up to 7% cashback. Go to Dashboard → Cards to apply.',
  'affiliate': 'Earn $50 for every person you refer! Share your unique referral link from Dashboard → Affiliate. You can earn up to $200 per referral at Diamond tier.',
  'signal': 'Our AI trading signals are available in Dashboard → Signals. Plans start at $99/month for 5 signals per day up to unlimited VIP signals.',
  'help': 'I can help you with: deposits, withdrawals, KYC verification, investment plans, profit crediting, cards, affiliate program, and trading signals. What do you need help with?',
  'hello': 'Hello! Welcome to CapitalMarket Pro support. I\'m your AI assistant. For personalized help, chat with Joshua Elder in the Live Chat tab. What can I help you with?',
  'hi': 'Hi there! 👋 I\'m your support assistant. I can answer questions about deposits, withdrawals, KYC, investment plans, and more. How can I help?',
  'default': 'I\'m not sure about that specific question. For detailed help, please use the Live Chat tab to speak directly with Joshua Elder, your dedicated Account Manager.',
}

const getBotResponse = (msg: string): string => {
  const lower = msg.toLowerCase()
  for (const key of Object.keys(BOT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return BOT_RESPONSES[key]
  }
  return BOT_RESPONSES.default
}

const QUICK_QUESTIONS = [
  'How do I deposit?',
  'How do I withdraw?',
  'What is KYC?',
  'What investment plans are available?',
  'When are profits credited?',
  'How does the affiliate program work?',
]

export default function SupportPage() {
  const [tab, setTab] = useState<'bot' | 'live'>('bot')
  const [botMessages, setBotMessages] = useState<{ role: string; content: string; time: string }[]>([
    { role: 'bot', content: 'Hi! 👋 I\'m your AI support assistant. I can answer common questions instantly. For personalized help, switch to the Live Chat tab to speak with Joshua Elder. How can I help you today?', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
  ])
  const [botInput, setBotInput] = useState('')
  const [liveMessages, setLiveMessages] = useState<any[]>([])
  const [liveInput, setLiveInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [joshuaPhoto, setJoshuaPhoto] = useState<string | null>(null)
  const [joshuaOnline] = useState(true)
  const botEndRef = useRef<HTMLDivElement>(null)
  const liveEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Fetch Joshua photo
      const { data: admin } = await supabase.from('users').select('avatar_url').eq('role', 'admin').single()
      if (admin?.avatar_url) setJoshuaPhoto(admin.avatar_url)

      // Fetch existing messages
      const { data: msgs } = await supabase
        .from('support_messages')
        .select('*')
        .eq('chat_id', user.id)
        .order('created_at', { ascending: true })
      setLiveMessages(msgs || [])

      // Realtime
      channelRef.current = supabase
        .channel(`support-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `chat_id=eq.${user.id}`,
        }, payload => {
          setLiveMessages(prev => [...prev, payload.new as any])
        })
        .subscribe()
    }
    init()
    return () => {
      const supabase = createClient()
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  useEffect(() => {
    botEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [botMessages])

  useEffect(() => {
    liveEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveMessages])

  const sendBotMessage = (content: string) => {
    if (!content.trim()) return
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setBotMessages(prev => [...prev, { role: 'user', content, time }])
    setBotInput('')
    setTimeout(() => {
      setBotMessages(prev => [...prev, { role: 'bot', content: getBotResponse(content), time }])
    }, 600)
  }

  const sendLiveMessage = async () => {
    if (!liveInput.trim() || !userId || sending) return
    setSending(true)
    const supabase = createClient()
    const content = liveInput.trim()
    setLiveInput('')

    await supabase.from('support_chats').upsert({
      id: userId,
      user_id: userId,
      status: 'open',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    await supabase.from('support_messages').insert({
      chat_id: userId,
      sender_id: userId,
      sender_role: 'user',
      content,
      is_read: false,
    })

    // Notify admin
    const { data: admin } = await supabase.from('users').select('id').eq('role', 'admin').single()
    if (admin?.id) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        title: '💬 New Support Message',
        message: content.length > 60 ? content.slice(0, 60) + '...' : content,
        type: 'info',
        is_read: false,
      })
    }
    setSending(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', background: '#0a0e14', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 2 }}>Support Center</div>
        <div style={{ fontSize: 11, color: '#484f58' }}>AI Assistant + Live chat with Joshua Elder</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #161b22', background: '#0a0e14', flexShrink: 0 }}>
        {[
          { id: 'bot', label: '🤖 AI Assistant', desc: 'Instant answers' },
          { id: 'live', label: '💬 Joshua Elder', desc: 'Live chat' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', borderBottom: tab === t.id ? '2px solid #C9A84C' : '2px solid transparent', color: tab === t.id ? '#C9A84C' : '#484f58', cursor: 'pointer', fontFamily: 'monospace' }}>
            <div style={{ fontSize: 12, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</div>
            <div style={{ fontSize: 10, marginTop: 1 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* BOT TAB */}
      {tab === 'bot' && (
        <>
          {/* Quick questions */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #161b22', background: '#0a0e14', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendBotMessage(q)}
                  style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Bot messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {botMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                {msg.role === 'bot' && (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🤖</div>
                )}
                <div style={{ maxWidth: '78%' }}>
                  <div style={{ padding: '11px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg,#C9A84C,#E8D08C)' : '#161b22', border: msg.role === 'bot' ? '1px solid #21262d' : 'none', color: msg.role === 'user' ? '#060a0f' : '#e6edf3', fontSize: 13, lineHeight: 1.7 }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: 9, color: '#484f58', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                </div>
              </div>
            ))}
            <div ref={botEndRef} />
          </div>

          {/* Bot input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #161b22', background: '#0a0e14', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={botInput} onChange={e => setBotInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendBotMessage(botInput) }}
                placeholder="Ask me anything..."
                style={{ flex: 1, background: '#161b22', border: '1px solid #21262d', borderRadius: 24, padding: '10px 16px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#21262d'}
              />
              <button onClick={() => sendBotMessage(botInput)} disabled={!botInput.trim()}
                style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: botInput.trim() ? 'linear-gradient(135deg,#C9A84C,#E8D08C)' : '#161b22', color: botInput.trim() ? '#060a0f' : '#484f58', fontSize: 16, cursor: botInput.trim() ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                →
              </button>
            </div>
          </div>
        </>
      )}

      {/* LIVE CHAT TAB */}
      {tab === 'live' && (
        <>
          {/* Joshua header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', background: '#0a0e14', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', overflow: 'hidden', border: '2px solid rgba(201,168,76,0.4)' }}>
                {joshuaPhoto ? <img src={joshuaPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
              </div>
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: joshuaOnline ? '#3fb950' : '#484f58', border: '2px solid #0a0e14' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>Joshua C. Elder</div>
              <div style={{ fontSize: 11, color: joshuaOnline ? '#3fb950' : '#484f58' }}>
                {joshuaOnline ? '● Online · Account Manager' : '○ Away · Replies within 24h'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Response time</div>
              <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700 }}>~5 minutes</div>
            </div>
          </div>

          {/* Live messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {liveMessages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12, padding: 20 }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#060a0f', overflow: 'hidden' }}>
                  {joshuaPhoto ? <img src={joshuaPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>Chat with Joshua Elder</div>
                  <div style={{ fontSize: 13, color: '#484f58', lineHeight: 1.8, maxWidth: 300 }}>
                    Your dedicated Account Manager is here to help you maximize your returns. Send a message to get started!
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                  {['Help me get started', 'I have a deposit question', 'Tell me about investment plans', 'I need to withdraw'].map(q => (
                    <button key={q} onClick={() => setLiveInput(q)}
                      style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)', color: '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : liveMessages.map((msg, i) => {
              const isUser = msg.sender_role === 'user'
              const showTime = i === 0 || new Date(msg.created_at).getTime() - new Date(liveMessages[i - 1].created_at).getTime() > 5 * 60 * 1000
              return (
                <div key={msg.id || i}>
                  {showTime && (
                    <div style={{ textAlign: 'center', fontSize: 10, color: '#484f58', marginBottom: 8 }}>
                      {new Date(msg.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                    {!isUser && (
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0 }}>
                        {joshuaPhoto ? <img src={joshuaPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
                      </div>
                    )}
                    <div style={{ maxWidth: '78%', padding: '11px 14px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isUser ? 'linear-gradient(135deg,#C9A84C,#E8D08C)' : '#161b22', border: isUser ? 'none' : '1px solid #21262d', color: isUser ? '#060a0f' : '#e6edf3', fontSize: 13, lineHeight: 1.7 }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={liveEndRef} />
          </div>

          {/* Live input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #161b22', background: '#0a0e14', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea value={liveInput} onChange={e => setLiveInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendLiveMessage() } }}
                placeholder="Message Joshua Elder... (Enter to send)"
                rows={2}
                style={{ flex: 1, background: '#161b22', border: '1px solid #21262d', borderRadius: 14, padding: '10px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', resize: 'none', lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#21262d'}
              />
              <button onClick={sendLiveMessage} disabled={!liveInput.trim() || sending}
                style={{ width: 46, borderRadius: 14, border: 'none', background: liveInput.trim() && !sending ? 'linear-gradient(135deg,#C9A84C,#E8D08C)' : '#161b22', color: liveInput.trim() && !sending ? '#060a0f' : '#484f58', fontSize: 18, cursor: liveInput.trim() && !sending ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                {sending ? '⟳' : '→'}
              </button>
            </div>
            <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>Enter to send · Shift+Enter for new line</div>
          </div>
        </>
      )}
    </div>
  )
}
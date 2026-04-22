// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

var supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

var requestCounts = new Map()

function rateLimit(ip) {
  var now = Date.now()
  var record = requestCounts.get(ip)
  if (!record || now - record.start > 60000) {
    requestCounts.set(ip, { count: 1, start: now })
    return true
  }
  if (record.count >= 30) return false
  record.count++
  return true
}

var BOT_RULES = [
  { keywords: ['deposit', 'fund', 'top up', 'add money'], reply: 'To deposit funds go to your Dashboard and tap + Deposit. We accept Bitcoin, Ethereum and USDT. Deposits are credited within 30 minutes after blockchain confirmation. Josh will assist you shortly if you need further help. 💰' },
  { keywords: ['withdraw', 'withdrawal', 'cash out', 'payout'], reply: 'Withdrawals are processed within 24 hours after admin review. Go to Dashboard then Withdraw to submit your request. Make sure your KYC is approved first. Josh can check your withdrawal status if needed. 💸' },
  { keywords: ['kyc', 'verify', 'verification', 'identity', 'document', 'id'], reply: 'KYC verification takes 1 to 3 business hours. Go to Dashboard then KYC and upload a clear photo of your government-issued ID. Once approved all features including withdrawals are fully unlocked. ✅' },
  { keywords: ['invest', 'plan', 'plans', 'roi', 'return', 'profit', 'interest'], reply: 'We have plans from $50 Crypto Starter to $100K+ Institutional with monthly returns from 1.5% to 8%. Go to Dashboard then Invest to view all available plans and select one. Josh can recommend the best plan based on your budget. 📈' },
  { keywords: ['tesla', 'tsla', 'apple', 'aapl', 'nvidia', 'nvda', 'stock', 'shares'], reply: 'Tesla, Apple, NVIDIA and 200+ global stocks are available on our Growth and Elite plans starting from $5,000 with up to 6% monthly returns. Go to Dashboard then Invest then Stock Plans. 📊' },
  { keywords: ['bitcoin', 'btc', 'crypto', 'ethereum', 'eth', 'solana', 'sol', 'bnb'], reply: 'Our Crypto plans start from just $50 and include BTC, ETH, SOL, BNB, XRP and 50+ other assets with up to 8% monthly returns. View all crypto plans in Dashboard then Invest. ₿' },
  { keywords: ['gold', 'oil', 'commodity', 'forex', 'currency', 'eur', 'usd', 'gbp'], reply: 'We offer Forex and Commodities plans covering Gold, Silver, Crude Oil, 70+ currency pairs and more. Forex plans start from $200. Find them in Dashboard then Invest. 💱' },
  { keywords: ['affiliate', 'referral', 'refer', 'commission', 'invite'], reply: 'Our affiliate program pays 5% to 15% commission on every deposit your referrals make instantly to your balance. Find your referral link in Dashboard then More then Affiliate Program. 🤝' },
  { keywords: ['password', 'forgot', 'reset', 'login', 'access', 'sign in'], reply: 'To reset your password go to the login page and click Forgot Password, then follow the email instructions. If you still cannot access your account Josh will personally help you recover it. 🔒' },
  { keywords: ['card', 'pro card', 'visa', 'debit', 'virtual card'], reply: 'The CapitalMarket Pro Card is available after KYC verification. Both virtual and physical cards are supported. Go to Dashboard then Card to apply. Virtual cards activate instantly. 💳' },
  { keywords: ['support', 'help', 'josh', 'agent', 'human', 'speak', 'contact'], reply: 'You are connected to CapitalMarket Pro support. Josh is our primary support manager and reviews every conversation personally. Please describe your issue in detail and Josh will respond shortly. 😊' },
  { keywords: ['pending', 'status', 'approved', 'rejected', 'processing', 'transaction'], reply: 'For status updates on deposits, withdrawals or KYC you can check your Dashboard for real-time updates. Notifications are sent automatically when your status changes. If something seems stuck describe it here and Josh will look into it right away. 👀' },
  { keywords: ['fee', 'fees', 'charge', 'cost'], reply: 'Our fees: Deposits are free. Withdrawals have a 5% processing fee. Trading spreads from 0.0 pips on major pairs. No account maintenance fees. All fees are shown before you confirm any transaction. 📋' },
]

var DEFAULT_REPLIES = [
  'Thanks for reaching out to CapitalMarket Pro! Josh will review your message and respond shortly. Please feel free to add any additional details so we can help you faster. 🙏',
  'Got your message! Josh usually responds within a few minutes during active hours. Is there anything specific I can answer right now about our plans, deposits or account features?',
  'Your message has been received and Josh has been notified. Our typical response time is under 10 minutes. You can also check the Dashboard for account status updates. 📩',
]

function getBotReply(message) {
  var lower = message.toLowerCase()
  for (var i = 0; i < BOT_RULES.length; i++) {
    var rule = BOT_RULES[i]
    for (var j = 0; j < rule.keywords.length; j++) {
      if (lower.includes(rule.keywords[j])) return rule.reply
    }
  }
  return DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)]
}

export async function POST(req) {
  var ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
  }

  try {
    var body = await req.json()
    var action = body.action

    // ── CREATE CHAT ───────────────────────────────────────────
    if (action === 'create_chat') {
      if (!body.user_id && !body.guest_id) {
        return NextResponse.json({ error: 'Missing user identifier' }, { status: 400 })
      }

      var chatInsert = await supabase.from('support_chats').insert({
        user_id: body.user_id || null,
        guest_id: body.guest_id || null,
        user_name: body.user_name || 'Guest',
        user_email: body.user_email || null,
        status: 'open',
        last_message: 'Conversation started',
        last_message_at: new Date().toISOString(),
        unread_admin: 1,
      }).select().single()

      if (chatInsert.error) {
        console.error('Create chat error:', chatInsert.error.message)
        return NextResponse.json({ error: chatInsert.error.message }, { status: 500 })
      }

      var greeting = 'Hello' + (body.user_name && body.user_name !== 'Guest' ? ' ' + body.user_name : '') + '! Welcome to CapitalMarket Pro support. I am the support assistant and Josh our support manager will join shortly. How can I help you today?'

      await supabase.from('support_messages').insert({
        chat_id: chatInsert.data.id,
        sender_type: 'bot',
        message: greeting,
        is_read: true,
      })

      return NextResponse.json({ success: true, chat_id: chatInsert.data.id })
    }

    // ── SEND MESSAGE ──────────────────────────────────────────
    if (action === 'send_message') {
      if (!body.chat_id || !body.message || !body.message.trim()) {
        return NextResponse.json({ error: 'Missing chat_id or message' }, { status: 400 })
      }

      var msg = body.message.trim().slice(0, 2000)

      await supabase.from('support_messages').insert({
        chat_id: body.chat_id,
        sender_type: 'user',
        sender_id: body.user_id || null,
        message: msg,
        is_read: false,
      })

      var chatData = await supabase.from('support_chats').select('unread_admin').eq('id', body.chat_id).single()
      var currentUnread = chatData.data ? (chatData.data.unread_admin || 0) : 0

      await supabase.from('support_chats').update({
        last_message: msg.slice(0, 120),
        last_message_at: new Date().toISOString(),
        status: 'open',
        unread_admin: currentUnread + 1,
      }).eq('id', body.chat_id)

      var recent = await supabase
        .from('support_messages')
        .select('sender_type')
        .eq('chat_id', body.chat_id)
        .order('created_at', { ascending: false })
        .limit(10)

      var adminReplied = recent.data && recent.data.some(function(m) { return m.sender_type === 'admin' })

      if (!adminReplied) {
        var botReply = getBotReply(msg)
        await new Promise(function(r) { setTimeout(r, 1000 + Math.random() * 800) })
        await supabase.from('support_messages').insert({
          chat_id: body.chat_id,
          sender_type: 'bot',
          message: botReply,
          is_read: false,
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (err) {
    console.error('Chat POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req) {
  var ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    var url = new URL(req.url)
    var chatId = url.searchParams.get('chat_id')
    if (!chatId) return NextResponse.json({ error: 'Missing chat_id' }, { status: 400 })

    var result = await supabase
      .from('support_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    return NextResponse.json({ messages: result.data || [] })

  } catch (err) {
    console.error('Chat GET error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
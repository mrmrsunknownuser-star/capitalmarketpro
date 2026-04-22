// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

var supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

var BOT_RULES = [
  { keywords: ['deposit', 'fund', 'top up'], reply: 'To deposit funds go to your Dashboard and tap + Deposit. We accept Bitcoin, Ethereum and USDT. Deposits are credited within 30 minutes. Josh will assist you shortly.' },
  { keywords: ['withdraw', 'withdrawal', 'cash out'], reply: 'Withdrawals are processed within 24-48 hours after admin review. Go to Dashboard then Withdraw. Make sure your KYC is approved first.' },
  { keywords: ['kyc', 'verify', 'verification', 'identity'], reply: 'KYC verification takes 1-3 business hours. Go to Dashboard then KYC and upload a clear photo of your government ID. Once approved all features are unlocked.' },
  { keywords: ['invest', 'plan', 'plans', 'roi', 'return'], reply: 'We have plans from $50 Crypto Starter to $100K+ Institutional with monthly returns from 1.5% to 8%. Go to Dashboard then Invest to view all plans.' },
  { keywords: ['tesla', 'tsla', 'stock', 'shares', 'apple', 'nvidia'], reply: 'Tesla, Apple, NVIDIA and 200+ global stocks are available on our Growth and Elite plans starting from $5,000 with up to 6% monthly returns.' },
  { keywords: ['bitcoin', 'btc', 'crypto', 'ethereum', 'eth'], reply: 'Our Crypto plans start from just $50 and include BTC, ETH, SOL, BNB, XRP and 50+ other assets with up to 8% monthly returns.' },
  { keywords: ['affiliate', 'referral', 'commission'], reply: 'Our affiliate program pays 5% to 15% commission on every deposit your referrals make instantly. Find your link in Dashboard then More then Affiliate Program.' },
  { keywords: ['password', 'forgot', 'reset'], reply: 'To reset your password go to the login page and click Forgot Password. If you still have trouble Josh will personally help you.' },
  { keywords: ['support', 'help', 'josh', 'agent'], reply: 'You are connected to CapitalMarket Pro support. Josh is our primary support manager and reviews every conversation personally. Please describe your issue.' },
]

var DEFAULT_REPLIES = [
  'Thanks for reaching out to CapitalMarket Pro. Josh will review your message and respond shortly. Feel free to add more details so we can help you faster.',
  'Got your message. Josh usually responds within a few minutes. Is there anything specific I can help you with right now?',
  'Your message has been received and Josh has been notified. Our typical response time is under 10 minutes.',
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
  try {
    var body = await req.json()
    var action = body.action

    if (action === 'create_chat') {
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

      if (chatInsert.error) return NextResponse.json({ error: chatInsert.error.message }, { status: 500 })

      await supabase.from('support_messages').insert({
        chat_id: chatInsert.data.id,
        sender_type: 'bot',
        message: 'Hello' + (body.user_name && body.user_name !== 'Guest' ? ' ' + body.user_name : '') + '! Welcome to CapitalMarket Pro support. I am the support assistant. Josh our support manager will join shortly. How can I help you today?',
        is_read: true,
      })

      return NextResponse.json({ success: true, chat_id: chatInsert.data.id })
    }

    if (action === 'send_message') {
      if (!body.chat_id || !body.message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

      await supabase.from('support_messages').insert({ chat_id: body.chat_id, sender_type: 'user', sender_id: body.user_id || null, message: body.message, is_read: false })

      var chatData = await supabase.from('support_chats').select('unread_admin').eq('id', body.chat_id).single()
      var currentUnread = chatData.data ? chatData.data.unread_admin || 0 : 0

      await supabase.from('support_chats').update({ last_message: body.message.slice(0, 120), last_message_at: new Date().toISOString(), status: 'open', unread_admin: currentUnread + 1 }).eq('id', body.chat_id)

      var recent = await supabase.from('support_messages').select('sender_type').eq('chat_id', body.chat_id).order('created_at', { ascending: false }).limit(10)
      var adminReplied = recent.data && recent.data.some(function(m) { return m.sender_type === 'admin' })

      if (!adminReplied) {
        var botReply = getBotReply(body.message)
        await new Promise(function(resolve) { setTimeout(resolve, 1200) })
        await supabase.from('support_messages').insert({ chat_id: body.chat_id, sender_type: 'bot', message: botReply, is_read: false })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch(err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    var url = new URL(req.url)
    var chatId = url.searchParams.get('chat_id')
    if (!chatId) return NextResponse.json({ error: 'Missing chat_id' }, { status: 400 })
    var result = await supabase.from('support_messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
    return NextResponse.json({ messages: result.data || [] })
  } catch(err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
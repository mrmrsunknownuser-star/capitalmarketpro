// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ChatBubble() {
  var [open, setOpen] = useState(false)
  var [messages, setMessages] = useState([])
  var [input, setInput] = useState('')
  var [chatId, setChatId] = useState(null)
  var [loading, setLoading] = useState(false)
  var [sending, setSending] = useState(false)
  var [unread, setUnread] = useState(0)
  var [userId, setUserId] = useState(null)
  var [userName, setUserName] = useState('Guest')
  var [userEmail, setUserEmail] = useState(null)
  var messagesEnd = useRef(null)
  var inputRef = useRef(null)

  var guestId = (function() {
    if (typeof window === 'undefined') return 'guest-anon'
    var id = localStorage.getItem('cmp_guest_id')
    if (!id) { id = 'guest-' + Math.random().toString(36).slice(2, 10); localStorage.setItem('cmp_guest_id', id) }
    return id
  })()

  useEffect(function() {
    var supabase = createClient()
    supabase.auth.getUser().then(function(res) {
      var user = res.data.user
      if (user) {
        setUserId(user.id)
        supabase.from('users').select('full_name, email').eq('id', user.id).single().then(function(r) {
          if (r.data) { setUserName(r.data.full_name || 'User'); setUserEmail(r.data.email) }
        })
      }
    })
    var stored = localStorage.getItem('cmp_chat_id')
    if (stored) setChatId(stored)
  }, [])

  useEffect(function() {
    if (open && chatId) loadMessages()
    if (open) setTimeout(function() { if (inputRef.current) inputRef.current.focus() }, 200)
  }, [open, chatId])

  useEffect(function() {
    if (messagesEnd.current) messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(function() {
    if (!chatId) return
    var supabase = createClient()
    var channel = supabase.channel('chat-user-' + chatId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: 'chat_id=eq.' + chatId }, function(payload) {
        var msg = payload.new
        setMessages(function(prev) {
          if (prev.find(function(m) { return m.id === msg.id })) return prev
          return [...prev, msg]
        })
        if (!open && (msg.sender_type === 'admin' || msg.sender_type === 'bot')) {
          setUnread(function(u) { return u + 1 })
        }
      })
      .subscribe()
    return function() { supabase.removeChannel(channel) }
  }, [chatId, open])

  async function loadMessages() {
    if (!chatId) return
    setLoading(true)
    try {
      var res = await fetch('/api/chat?chat_id=' + chatId)
      var data = await res.json()
      if (data.messages) setMessages(data.messages)
    } catch(err) {}
    setLoading(false)
  }

  async function startChat() {
    setLoading(true)
    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_chat', user_id: userId, guest_id: !userId ? guestId : undefined, user_name: userName, user_email: userEmail }),
      })
      var data = await res.json()
      if (data.chat_id) {
        setChatId(data.chat_id)
        localStorage.setItem('cmp_chat_id', data.chat_id)
        setTimeout(function() { loadMessages() }, 800)
      }
    } catch(err) {}
    setLoading(false)
  }

  async function openChat() {
    setOpen(true)
    setUnread(0)
    if (!chatId) await startChat()
  }

  async function sendMessage() {
    if (!input.trim() || sending || !chatId) return
    var msg = input.trim()
    setInput('')
    setSending(true)
    var tempId = 'temp-' + Date.now()
    setMessages(function(prev) {
      return [...prev, { id: tempId, sender_type: 'user', message: msg, created_at: new Date().toISOString(), is_read: false }]
    })
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_message', chat_id: chatId, message: msg, user_id: userId }),
      })
    } catch(err) {}
    setSending(false)
  }

  function formatMsg(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
      <style>{'@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } } .ci { background: #141920; border: 1.5px solid #1e2530; border-radius: 10px; padding: 10px 14px; color: #e8edf5; font-size: 13px; font-family: Inter, sans-serif; outline: none; flex: 1; transition: border-color .2s; } .ci:focus { border-color: #C9A84C; } .ci::placeholder { color: #4a5568; } .cs { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #C9A84C, #E8D08C); border: none; color: #060a0e; font-size: 18px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; } .cm::-webkit-scrollbar { width: 3px; } .cm::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }'}</style>

      {open && (
        <div style={{ position: 'absolute', bottom: 68, right: 0, width: 344, background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.75)', animation: 'slideUp .2s ease', display: 'flex', flexDirection: 'column', maxHeight: '82vh' }}>
          <div style={{ background: 'linear-gradient(135deg,#0d1117,#141920)', padding: '14px 16px', borderBottom: '1px solid #1e2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#060a0e' }}>J</div>
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#2ecc71', border: '2px solid #0d1117' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>Josh - Support Manager</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#2ecc71', fontWeight: 600 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  Online - Replies in minutes
                </div>
              </div>
            </div>
            <button onClick={function() { setOpen(false) }} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid #1e2530', borderRadius: 8, color: '#8892a0', cursor: 'pointer', width: 28, height: 28, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
          </div>

          <div className="cm" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 180, maxHeight: 320 }}>
            {loading && messages.length === 0 && <div style={{ textAlign: 'center', padding: '24px 0', color: '#4a5568', fontSize: 13 }}>Loading...</div>}
            {messages.map(function(m) {
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender_type === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.sender_type !== 'user' && <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 3 }}>{m.sender_type === 'admin' ? 'Josh' : 'Support Bot'}</div>}
                  <div dangerouslySetInnerHTML={{ __html: formatMsg(m.message) }} style={{ maxWidth: '85%', padding: '9px 12px', borderRadius: m.sender_type === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px', background: m.sender_type === 'user' ? GG : m.sender_type === 'admin' ? '#1e2d3d' : '#141920', color: m.sender_type === 'user' ? '#060a0e' : '#e8edf5', fontSize: 13, lineHeight: 1.65, wordBreak: 'break-word' }} />
                  <div style={{ fontSize: 10, color: '#4a5568', marginTop: 3 }}>
                    {formatTime(m.created_at)}
                    {m.sender_type === 'user' && <span style={{ marginLeft: 4 }}>{m.is_read ? 'seen' : 'sent'}</span>}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEnd} />
          </div>

          <div style={{ padding: '10px 12px', borderTop: '1px solid #1e2530', display: 'flex', gap: 8, alignItems: 'center', background: '#0d1117', flexShrink: 0 }}>
            <input ref={inputRef} className="ci" value={input} onChange={function(e) { setInput(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter') sendMessage() }} placeholder="Type a message..." />
            <button className="cs" onClick={sendMessage}>→</button>
          </div>

          <div style={{ padding: '7px 12px', background: '#0a0d13', textAlign: 'center', fontSize: 10, color: '#2a3140', borderTop: '1px solid #141920', flexShrink: 0 }}>
            Encrypted - CapitalMarket Pro Support
          </div>
        </div>
      )}

      <button onClick={open ? function() { setOpen(false) } : openChat} style={{ width: 56, height: 56, borderRadius: '50%', background: open ? '#141920' : GG, border: open ? '1px solid #1e2530' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, cursor: 'pointer', boxShadow: '0 8px 32px rgba(201,168,76,.35)', color: open ? '#8892a0' : '#060a0e', transition: 'all .2s', animation: !open && unread > 0 ? 'bounce 1.2s ease infinite' : 'none' }}>
        💬
      </button>

      {!open && unread > 0 && (
        <div style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', border: '2px solid #060a0e' }}>
          {unread > 9 ? '9' : unread}
        </div>
      )}
    </div>
  )
}
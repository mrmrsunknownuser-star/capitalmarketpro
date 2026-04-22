// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSupportPage() {
  var [chats, setChats] = useState([])
  var [selected, setSelected] = useState(null)
  var [messages, setMessages] = useState([])
  var [reply, setReply] = useState('')
  var [loading, setLoading] = useState(true)
  var [sending, setSending] = useState(false)
  var [filter, setFilter] = useState('open')
  var [search, setSearch] = useState('')
  var [joshOnline, setJoshOnline] = useState(true)
  var messagesEnd = useRef(null)
  var supabase = createClient()

  async function fetchChats() {
    var result = await supabase.from('support_chats').select('*').order('last_message_at', { ascending: false })
    setChats(result.data || [])
    setLoading(false)
  }

  async function loadMessages(chatId) {
    var result = await supabase.from('support_messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
    setMessages(result.data || [])
    await supabase.from('support_messages').update({ is_read: true }).eq('chat_id', chatId).neq('sender_type', 'admin')
    await supabase.from('support_chats').update({ unread_admin: 0 }).eq('id', chatId)
    setChats(function(prev) { return prev.map(function(c) { return c.id === chatId ? { ...c, unread_admin: 0 } : c }) })
  }

  useEffect(function() {
    fetchChats()
    var channel = supabase.channel('admin-all-chats').on('postgres_changes', { event: '*', schema: 'public', table: 'support_chats' }, function() { fetchChats() }).subscribe()
    return function() { supabase.removeChannel(channel) }
  }, [])

  useEffect(function() {
    if (!selected) return
    loadMessages(selected.id)
    var channel = supabase.channel('admin-msgs-' + selected.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: 'chat_id=eq.' + selected.id }, function(payload) {
        var msg = payload.new
        setMessages(function(prev) { return prev.find(function(m) { return m.id === msg.id }) ? prev : [...prev, msg] })
        supabase.from('support_messages').update({ is_read: true }).eq('id', msg.id)
      })
      .subscribe()
    return function() { supabase.removeChannel(channel) }
  }, [selected && selected.id])

  useEffect(function() {
    if (messagesEnd.current) messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendReply() {
    if (!reply.trim() || !selected || sending) return
    var msg = reply.trim()
    setReply('')
    setSending(true)
    var userResult = await supabase.auth.getUser()
    await supabase.from('support_messages').insert({ chat_id: selected.id, sender_type: 'admin', sender_id: userResult.data.user ? userResult.data.user.id : null, message: msg, is_read: false })
    await supabase.from('support_chats').update({ last_message: msg.slice(0, 120), last_message_at: new Date().toISOString() }).eq('id', selected.id)
    setSending(false)
  }

  async function resolveChat(chatId) {
    await supabase.from('support_chats').update({ status: 'resolved' }).eq('id', chatId)
    setChats(function(prev) { return prev.map(function(c) { return c.id === chatId ? { ...c, status: 'resolved' } : c }) })
    if (selected && selected.id === chatId) setSelected(function(prev) { return prev ? { ...prev, status: 'resolved' } : null })
  }

  async function reopenChat(chatId) {
    await supabase.from('support_chats').update({ status: 'open' }).eq('id', chatId)
    setChats(function(prev) { return prev.map(function(c) { return c.id === chatId ? { ...c, status: 'open' } : c }) })
    if (selected && selected.id === chatId) setSelected(function(prev) { return prev ? { ...prev, status: 'open' } : null })
  }

  function formatTime(ts) {
    var d = new Date(ts)
    var diff = Date.now() - d.getTime()
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
    if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function formatMsg(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
  }

  var filtered = chats.filter(function(c) {
    var matchFilter = filter === 'all' ? true : filter === 'open' ? c.status === 'open' : c.status === 'resolved'
    var matchSearch = !search || (c.user_name || '').toLowerCase().includes(search.toLowerCase()) || (c.user_email || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  var totalUnread = chats.reduce(function(s, c) { return s + (c.unread_admin || 0) }, 0)
  var openCount = chats.filter(function(c) { return c.status === 'open' }).length
  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', fontFamily: 'Inter, sans-serif', background: '#060a0e', color: '#e8edf5' }}>
      <style>{'* { box-sizing: border-box; } textarea { font-family: Inter, sans-serif; resize: none; } .cli { cursor: pointer; border-left: 3px solid transparent; transition: all .15s; } .cli:hover { background: rgba(201,168,76,.04); } .cli.act { background: rgba(201,168,76,.07); border-left-color: #C9A84C; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }'}</style>

      <div style={{ width: 310, borderRight: '1px solid #1e2530', display: 'flex', flexDirection: 'column', background: '#0a0d13', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1e2530' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Support Inbox</div>
              <div style={{ fontSize: 11, color: '#4a5568', marginTop: 1 }}>{openCount} open - {totalUnread > 0 ? totalUnread + ' unread' : 'all read'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: joshOnline ? '#2ecc71' : '#4a5568', fontWeight: 600 }}>{joshOnline ? 'Online' : 'Away'}</span>
              <div onClick={function() { setJoshOnline(function(j) { return !j }) }} style={{ width: 36, height: 20, borderRadius: 10, background: joshOnline ? '#2ecc71' : '#1e2530', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                <div style={{ position: 'absolute', top: 2, left: joshOnline ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
              </div>
            </div>
          </div>
          <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Search users..." style={{ width: '100%', background: '#141920', border: '1px solid #1e2530', borderRadius: 8, padding: '8px 11px', color: '#e8edf5', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
          <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
            {['open', 'resolved', 'all'].map(function(f) {
              return <button key={f} onClick={function() { setFilter(f) }} style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: 'none', background: filter === f ? 'rgba(201,168,76,.12)' : 'transparent', color: filter === f ? G : '#4a5568', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: filter === f ? 700 : 400, textTransform: 'capitalize' }}>{f}</button>
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <div style={{ padding: 24, textAlign: 'center', color: '#4a5568', fontSize: 13 }}>Loading...</div>}
          {!loading && filtered.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: '#4a5568', fontSize: 13 }}>No {filter !== 'all' ? filter : ''} conversations</div>}
          {filtered.map(function(chat) {
            return (
              <div key={chat.id} className={'cli' + (selected && selected.id === chat.id ? ' act' : '')} onClick={function() { setSelected(chat); loadMessages(chat.id) }} style={{ padding: '12px 14px', borderBottom: '1px solid rgba(30,37,48,.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#060a0e', flexShrink: 0 }}>{(chat.user_name || 'G')[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{chat.user_name || 'Guest'}</div>
                      <div style={{ fontSize: 10, color: '#4a5568', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.user_email || 'Guest visitor'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 10, color: '#4a5568' }}>{formatTime(chat.last_message_at)}</div>
                    {(chat.unread_admin || 0) > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>{chat.unread_admin}</div>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#8892a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: 43 }}>{chat.last_message || 'No messages'}</div>
                {chat.status !== 'open' && <div style={{ marginLeft: 43, marginTop: 3, fontSize: 10, color: '#2ecc71', fontWeight: 600 }}>Resolved</div>}
              </div>
            )
          })}
        </div>
      </div>

      {selected ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '13px 20px', borderBottom: '1px solid #1e2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0d13', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: GG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#060a0e' }}>{(selected.user_name || 'G')[0].toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{selected.user_name || 'Guest'}</div>
                <div style={{ fontSize: 11, color: '#4a5568' }}>{selected.user_email || 'Guest user'} - {selected.user_id ? 'Registered' : 'Guest'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ padding: '4px 10px', background: selected.status === 'open' ? 'rgba(46,204,113,.1)' : 'rgba(201,168,76,.1)', border: '1px solid ' + (selected.status === 'open' ? 'rgba(46,204,113,.25)' : 'rgba(201,168,76,.25)'), borderRadius: 8, fontSize: 11, fontWeight: 600, color: selected.status === 'open' ? '#2ecc71' : G }}>{selected.status === 'open' ? 'Open' : 'Resolved'}</span>
              {selected.status === 'open' ? (
                <button onClick={function() { resolveChat(selected.id) }} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 8, color: '#8892a0', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Mark Resolved</button>
              ) : (
                <button onClick={function() { reopenChat(selected.id) }} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', borderRadius: 8, color: G, cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Reopen</button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(function(m) {
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 3 }}>{m.sender_type === 'admin' ? 'You (Josh)' : m.sender_type === 'bot' ? 'Support Bot' : selected.user_name || 'User'}</div>
                  <div dangerouslySetInnerHTML={{ __html: formatMsg(m.message) }} style={{ maxWidth: '68%', padding: '10px 14px', borderRadius: m.sender_type === 'admin' ? '14px 14px 4px 14px' : '4px 14px 14px 14px', background: m.sender_type === 'admin' ? GG : m.sender_type === 'bot' ? '#141920' : '#1e2d3d', color: m.sender_type === 'admin' ? '#060a0e' : '#e8edf5', fontSize: 13, lineHeight: 1.65, wordBreak: 'break-word' }} />
                  <div style={{ fontSize: 10, color: '#4a5568', marginTop: 3 }}>{new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}{m.sender_type === 'admin' && <span style={{ marginLeft: 4 }}>{m.is_read ? 'Seen' : 'Sent'}</span>}</div>
                </div>
              )
            })}
            <div ref={messagesEnd} />
          </div>

          {selected.status === 'open' ? (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #1e2530', background: '#0a0d13', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea value={reply} onChange={function(e) { setReply(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }} placeholder="Reply as Josh... Enter to send" rows={2} style={{ flex: 1, background: '#141920', border: '1.5px solid #1e2530', borderRadius: 10, padding: '10px 12px', color: '#e8edf5', fontSize: 13, outline: 'none', lineHeight: 1.6 }} onFocus={function(e) { e.target.style.borderColor = G }} onBlur={function(e) { e.target.style.borderColor = '#1e2530' }} />
                <button onClick={sendReply} disabled={!reply.trim() || sending} style={{ width: 44, height: 44, borderRadius: 11, background: reply.trim() && !sending ? GG : '#141920', border: 'none', color: reply.trim() && !sending ? '#060a0e' : '#4a5568', cursor: reply.trim() && !sending ? 'pointer' : 'not-allowed', fontSize: 19, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>→</button>
              </div>
              <div style={{ fontSize: 10, color: '#2a3140', marginTop: 5 }}>Replying as Josh - delivered instantly</div>
            </div>
          ) : (
            <div style={{ padding: '14px 16px', borderTop: '1px solid #1e2530', background: '#0a0d13', textAlign: 'center', fontSize: 13, color: '#4a5568', flexShrink: 0 }}>
              This conversation is resolved.
              <button onClick={function() { reopenChat(selected.id) }} style={{ marginLeft: 8, background: 'none', border: 'none', color: G, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600 }}>Reopen</button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Select a conversation</div>
          <div style={{ fontSize: 13, color: '#4a5568' }}>{openCount} open conversation{openCount !== 1 ? 's' : ''} waiting</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: joshOnline ? 'rgba(46,204,113,.07)' : 'rgba(255,255,255,.03)', border: '1px solid ' + (joshOnline ? 'rgba(46,204,113,.2)' : '#1e2530'), borderRadius: 10, fontSize: 12, color: joshOnline ? '#2ecc71' : '#4a5568', fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: joshOnline ? '#2ecc71' : '#4a5568', display: 'inline-block', animation: joshOnline ? 'pulse 2s infinite' : 'none' }} />
            Josh is {joshOnline ? 'Online' : 'Away'}
          </div>
        </div>
      )}
    </div>
  )
}
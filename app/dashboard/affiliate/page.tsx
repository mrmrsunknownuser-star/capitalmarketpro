'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AffiliatePage() {
  const [links, setLinks] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [copied, setCopied] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('affiliate_links').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setLinks(data || [])
      const { data: bal } = await supabase.from('balances').select('affiliate_balance').eq('user_id', user.id).single()
      setBalance(bal?.affiliate_balance || 0)
    }
    fetch()
  }, [message])

  const createLink = async () => {
    if (!newUrl) return
    setLoading(true)
    const supabase = createClient()
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    await supabase.from('affiliate_links').insert({
      user_id: userId,
      link_code: code,
      label: newLabel || 'My Link',
      url: newUrl,
      is_active: true,
    })
    setNewLabel('')
    setNewUrl('')
    setMessage('Link created!')
    setTimeout(() => setMessage(''), 3000)
    setLoading(false)
  }

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`https://capitalmarketpro.vercel.app/ref/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(''), 2000)
  }

  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0)
  const totalConversions = links.reduce((s, l) => s + (l.conversions || 0), 0)
  const totalEarnings = links.reduce((s, l) => s + (l.earnings || 0), 0)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Affiliate Program</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Earn passive income by referring new traders</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>✅ {message}</div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Affiliate Balance', value: `$${balance.toLocaleString()}`, icon: '💰', color: '#C9A84C' },
          { label: 'Total Clicks', value: totalClicks, icon: '👆', color: '#0052FF' },
          { label: 'Conversions', value: totalConversions, icon: '✅', color: '#3fb950' },
          { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString()}`, icon: '📈', color: '#F7A600' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d1117', border: `1px solid ${s.color}22`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Create Link */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>➕ Create Affiliate Link</div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Label</label>
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. My Instagram Link" style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '10px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Destination URL</label>
            <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://capitalmarketpro.vercel.app" style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '10px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <button onClick={createLink} disabled={loading || !newUrl} style={{ width: '100%', padding: '12px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: !newUrl ? 0.5 : 1 }}>
            {loading ? 'Creating...' : 'Generate Link'}
          </button>

          {/* How it works */}
          <div style={{ marginTop: 20, padding: 14, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#C9A84C', marginBottom: 8 }}>How it works</div>
            {['Share your unique link', 'Friend signs up & deposits', 'You earn 10% commission', 'Paid directly to your balance'].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#C9A84C', flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 11, color: '#8b949e' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Links List */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>🔗 Your Links</div>
          {links.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#484f58', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
              No links yet. Create your first affiliate link!
            </div>
          ) : links.map(link => (
            <div key={link.id} style={{ background: '#161b22', borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{link.label}</div>
                <span style={{ fontSize: 9, color: link.is_active ? '#3fb950' : '#484f58', background: link.is_active ? 'rgba(63,185,80,0.1)' : '#21262d', padding: '2px 8px', borderRadius: 10 }}>
                  {link.is_active ? '● ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#C9A84C', fontFamily: 'monospace', marginBottom: 10, wordBreak: 'break-all' }}>
                capitalmarketpro.vercel.app/ref/{link.link_code}
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                {[
                  { label: 'Clicks', value: link.clicks || 0 },
                  { label: 'Conversions', value: link.conversions || 0 },
                  { label: 'Earnings', value: `$${link.earnings || 0}` },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 10, color: '#484f58' }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => copyLink(link.link_code)} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: copied === link.link_code ? '#3fb950' : '#C9A84C', fontSize: 11, cursor: 'pointer' }}>
                {copied === link.link_code ? '✅ Copied!' : '📋 Copy Link'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminBalancesPage() {
  const [users, setUsers] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [balance, setBalance] = useState('')
  const [pnl, setPnl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('*, balances(*)')
        .order('created_at', { ascending: false })
      setUsers(data || [])
    }
    fetch()
  }, [])

  const saveBalance = async () => {
    if (!selected || !balance) return
    setLoading(true)
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('balances')
      .select('id')
      .eq('user_id', selected.id)
      .single()

    if (existing) {
      await supabase.from('balances').update({
        total_balance: parseFloat(balance),
        available_balance: parseFloat(balance),
        total_pnl: pnl ? parseFloat(pnl) : 0,
        updated_at: new Date().toISOString(),
      }).eq('user_id', selected.id)
    } else {
      await supabase.from('balances').insert({
        user_id: selected.id,
        total_balance: parseFloat(balance),
        available_balance: parseFloat(balance),
        total_pnl: pnl ? parseFloat(pnl) : 0,
      })
    }

    await supabase.from('notifications').insert({
      user_id: selected.id,
      title: '💰 Account Balance Updated',
      message: `Your account balance has been updated to $${parseFloat(balance).toLocaleString()}`,
      type: 'info',
      is_read: false,
    })

    try {
      await supabase.from('audit_logs').insert({
        action: 'BALANCE_UPDATED',
        target_user_id: selected.id,
        details: { balance, pnl },
      })
    } catch {}

    setMessage(`✅ Balance set to $${parseFloat(balance).toLocaleString()} for ${selected.email}`)
    setTimeout(() => setMessage(''), 4000)
    setLoading(false)
    setSelected(null)
    setBalance('')
    setPnl('')

    // Refresh
    const { data } = await supabase.from('users').select('*, balances(*)').order('created_at', { ascending: false })
    setUsers(data || [])
  }

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Balance Management</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Set user account balances and P&L</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          {message}
        </div>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search users..."
        style={{ width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '11px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', marginBottom: 16, boxSizing: 'border-box' as const }}
      />

      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ background: '#0a0e14', borderBottom: '1px solid #161b22' }}>
                {['User', 'Current Balance', 'P&L', 'Last Updated', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const bal = Array.isArray(user.balances) ? user.balances[0] : user.balances
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #161b22' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>{user.full_name || 'No name'}</div>
                      <div style={{ fontSize: 11, color: '#484f58' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C' }}>
                        ${(bal?.total_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 13, color: (bal?.total_pnl || 0) >= 0 ? '#3fb950' : '#f85149' }}>
                        {(bal?.total_pnl || 0) >= 0 ? '+' : ''}${(bal?.total_pnl || 0).toFixed(2)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#484f58' }}>
                      {bal?.updated_at ? new Date(bal.updated_at).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button onClick={() => { setSelected(user); setBalance((bal?.total_balance || '').toString()); setPnl((bal?.total_pnl || '').toString()) }}
                        style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #21262d', background: 'transparent', color: '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        Set Balance
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 440, padding: 28, fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>Set Balance</div>
              <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
            </div>
            <div style={{ background: '#161b22', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{selected.full_name || 'No name'}</div>
              <div style={{ fontSize: 11, color: '#484f58' }}>{selected.email}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Balance ($)</label>
              <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="e.g. 50000"
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#C9A84C', fontSize: 18, fontWeight: 800, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#30363d'}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total P&L ($)</label>
              <input type="number" value={pnl} onChange={e => setPnl(e.target.value)} placeholder="e.g. 5000"
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#3fb950', fontSize: 16, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#3fb950'}
                onBlur={e => e.target.style.borderColor = '#30363d'}
              />
            </div>
            <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7 }}>
                ⚡ User will see this balance on their dashboard immediately. They will receive a notification.
              </div>
            </div>
            <button onClick={saveBalance} disabled={loading || !balance}
              style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', opacity: !balance || loading ? 0.5 : 1 }}>
              {loading ? '⟳ Saving...' : `💰 Set Balance to $${balance ? parseFloat(balance).toLocaleString() : '0'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
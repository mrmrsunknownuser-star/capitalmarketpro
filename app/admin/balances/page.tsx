'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminBalancesPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [balance, setBalance] = useState('')
  const [pnl, setPnl] = useState('')
  const [trading, setTrading] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: userList } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, status')
      .order('created_at', { ascending: false })

    if (!userList) { setLoading(false); return }

    const { data: balances } = await supabase
      .from('balances')
      .select('*')

    const merged = userList.map(u => ({
      ...u,
      balance: balances?.find(b => b.user_id === u.id) || null,
    }))

    setUsers(merged)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const openModal = (user: any) => {
    setSelected(user)
    setBalance(user.balance?.total_balance?.toString() || '')
    setPnl(user.balance?.total_pnl?.toString() || '')
    setTrading(user.balance?.trading_balance?.toString() || '')
  }

  const saveBalance = async () => {
    if (!selected || !balance) return
    setSaving(true)
    const supabase = createClient()

    const payload = {
      user_id: selected.id,
      total_balance: parseFloat(balance) || 0,
      available_balance: parseFloat(balance) || 0,
      total_pnl: parseFloat(pnl) || 0,
      trading_balance: parseFloat(trading) || 0,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('balances')
      .upsert(payload, { onConflict: 'user_id' })

    if (error) {
      console.error('Balance save error:', error)
      setMessage('❌ Error saving balance: ' + error.message)
      setSaving(false)
      return
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: selected.id,
      title: '💰 Account Balance Updated',
      message: `Your account balance has been updated to $${parseFloat(balance).toLocaleString()}. Check your dashboard.`,
      type: 'info',
      is_read: false,
    })

    // Audit log
    try {
      await supabase.from('audit_logs').insert({
        action: 'BALANCE_UPDATED',
        target_user_id: selected.id,
        details: { total_balance: balance, total_pnl: pnl, trading_balance: trading },
      })
    } catch {}

    setMessage(`✅ Balance updated to $${parseFloat(balance).toLocaleString()} for ${selected.email}`)
    setTimeout(() => setMessage(''), 4000)
    setSaving(false)
    setSelected(null)
    setBalance('')
    setPnl('')
    setTrading('')
    fetchUsers()
  }

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalFunds = users.reduce((sum, u) => sum + (u.balance?.total_balance || 0), 0)

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Balance Management</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Set and manage user account balances</div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ background: message.startsWith('✅') ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', border: `1px solid ${message.startsWith('✅') ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: message.startsWith('✅') ? '#3fb950' : '#f85149' }}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Total Users', v: users.length, c: '#e6edf3' },
          { l: 'Total Funds', v: `$${totalFunds.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, c: '#C9A84C' },
          { l: 'Funded Accounts', v: users.filter(u => (u.balance?.total_balance || 0) > 0).length, c: '#3fb950' },
          { l: 'Zero Balance', v: users.filter(u => (u.balance?.total_balance || 0) === 0).length, c: '#484f58' },
        ].map(s => (
          <div key={s.l} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#484f58' }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '11px 14px 11px 40px', color: '#e6edf3', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
          onFocus={e => e.target.style.borderColor = '#C9A84C'}
          onBlur={e => e.target.style.borderColor = '#21262d'}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#0a0e14', borderBottom: '1px solid #161b22' }}>
                {['User', 'Total Balance', 'P&L', 'Trading Balance', 'Last Updated', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#484f58' }}>Loading users...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
                    <div style={{ fontSize: 13, color: '#484f58' }}>No users found</div>
                  </td>
                </tr>
              ) : filtered.map((user, i) => {
                const bal = user.balance
                const totalBal = bal?.total_balance || 0
                const totalPnlVal = bal?.total_pnl || 0
                const tradingBal = bal?.trading_balance || 0

                return (
                  <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #161b22' : 'none' }}>

                    {/* User */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', flexShrink: 0, overflow: 'hidden' }}>
                          {user.avatar_url
                            ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (user.full_name || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500, marginBottom: 2 }}>{user.full_name || 'No name'}</div>
                          <div style={{ fontSize: 11, color: '#484f58', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Total Balance */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: totalBal > 0 ? '#C9A84C' : '#484f58' }}>
                        ${totalBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* P&L */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: totalPnlVal >= 0 ? '#3fb950' : '#f85149' }}>
                        {totalPnlVal >= 0 ? '+' : ''}${Math.abs(totalPnlVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* Trading Balance */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 13, color: tradingBal > 0 ? '#0052FF' : '#484f58' }}>
                        ${tradingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* Last Updated */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#484f58' }}>
                        {bal?.updated_at ? new Date(bal.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => openModal(user)}
                        style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        💰 Set Balance
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
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 460, fontFamily: 'monospace', overflow: 'hidden' }}>

            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>Set Balance</div>
              <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '24px' }}>

              {/* User info */}
              <div style={{ background: '#161b22', borderRadius: 12, padding: '14px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', overflow: 'hidden', flexShrink: 0 }}>
                  {selected.avatar_url
                    ? <img src={selected.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (selected.full_name || selected.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{selected.full_name || 'No name'}</div>
                  <div style={{ fontSize: 12, color: '#484f58' }}>{selected.email}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 2 }}>Current</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#C9A84C' }}>
                    ${(selected.balance?.total_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Total Balance */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  💰 Total Balance (USD)
                </label>
                <input
                  type="number"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  placeholder="e.g. 50000"
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '14px 16px', color: '#C9A84C', fontSize: 20, fontWeight: 800, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = '#C9A84C'}
                  onBlur={e => e.target.style.borderColor = '#30363d'}
                />
              </div>

              {/* P&L */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  📈 Total P&L (USD)
                </label>
                <input
                  type="number"
                  value={pnl}
                  onChange={e => setPnl(e.target.value)}
                  placeholder="e.g. 5000"
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 16px', color: '#3fb950', fontSize: 16, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = '#3fb950'}
                  onBlur={e => e.target.style.borderColor = '#30363d'}
                />
              </div>

              {/* Trading Balance */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🔄 Trading Balance (USD)
                </label>
                <input
                  type="number"
                  value={trading}
                  onChange={e => setTrading(e.target.value)}
                  placeholder="e.g. 1000"
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 16px', color: '#0052FF', fontSize: 16, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = '#0052FF'}
                  onBlur={e => e.target.style.borderColor = '#30363d'}
                />
              </div>

              {/* Info */}
              <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.8 }}>
                  ⚡ Balance updates on the user's dashboard <strong style={{ color: '#C9A84C' }}>instantly</strong> via real-time sync. The user will also receive a notification.
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Cancel
                </button>
                <button
                  onClick={saveBalance}
                  disabled={saving || !balance}
                  style={{ padding: '13px 0', borderRadius: 12, border: 'none', background: !balance || saving ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: !balance || saving ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: !balance || saving ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
                  {saving ? '⟳ Saving...' : `💰 Set $${balance ? parseFloat(balance).toLocaleString() : '0'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
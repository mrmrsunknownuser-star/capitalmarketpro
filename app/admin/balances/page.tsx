'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type User = {
  id: string
  email: string
  full_name: string | null
}

type Balance = {
  crypto_balance: number
  stocks_balance: number
  affiliate_balance: number
  total_balance: number
  total_pnl: number
  pnl_percentage: number
}

export default function AdminBalancesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [balance, setBalance] = useState<Balance>({
    crypto_balance: 0,
    stocks_balance: 0,
    affiliate_balance: 0,
    total_balance: 0,
    total_pnl: 0,
    pnl_percentage: 0,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tradeForm, setTradeForm] = useState({
    platform: 'Coinbase',
    asset: 'BTC/USD',
    type: 'BUY',
    amount: '',
    pnl: '',
    note: '',
  })

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('users').select('id, email, full_name').eq('role', 'user').order('created_at', { ascending: false })
      setUsers(data || [])
    }
    fetchUsers()
  }, [])

  const loadUserBalance = async (user: User) => {
    setSelectedUser(user)
    const supabase = createClient()
    const { data } = await supabase.from('balances').select('*').eq('user_id', user.id).single()
    if (data) {
      setBalance({
        crypto_balance: data.crypto_balance || 0,
        stocks_balance: data.stocks_balance || 0,
        affiliate_balance: data.affiliate_balance || 0,
        total_balance: data.total_balance || 0,
        total_pnl: data.total_pnl || 0,
        pnl_percentage: data.pnl_percentage || 0,
      })
    }
  }

  const saveBalance = async () => {
    if (!selectedUser) return
    setLoading(true)
    const supabase = createClient()

    const total = balance.crypto_balance + balance.stocks_balance + balance.affiliate_balance

    const { error } = await supabase.from('balances').upsert({
      user_id: selectedUser.id,
      ...balance,
      total_balance: total,
      updated_at: new Date().toISOString(),
    })

    // Log the action
    await supabase.from('audit_logs').insert({
      action: 'BALANCE_UPDATED',
      target_user_id: selectedUser.id,
      details: { balance, total },
    })

    if (!error) {
      setMessage('Balance updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    }
    setLoading(false)
  }

  const addTrade = async () => {
    if (!selectedUser || !tradeForm.amount) return
    setLoading(true)
    const supabase = createClient()

    const num = Math.floor(Math.random() * 90000) + 10000

    await supabase.from('trades').insert({
      user_id: selectedUser.id,
      trade_id: `TXN-${num}`,
      platform: tradeForm.platform,
      asset: tradeForm.asset,
      type: tradeForm.type,
      amount: parseFloat(tradeForm.amount),
      pnl: tradeForm.pnl ? parseFloat(tradeForm.pnl) : null,
      note: tradeForm.note || null,
      status: 'completed',
    })

    setMessage('Trade added successfully!')
    setTradeForm({ platform: 'Coinbase', asset: 'BTC/USD', type: 'BUY', amount: '', pnl: '', note: '' })
    setTimeout(() => setMessage(''), 3000)
    setLoading(false)
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name?.toLowerCase().includes(search.toLowerCase()))
  )

  const inputStyle = {
    width: '100%',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#e6edf3',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: 11,
    color: '#8b949e',
    marginBottom: 6,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Set Balances</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Update user portfolio balances, P&L and trade history</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          ✅ {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

        {/* User List */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 16, height: 'fit-content' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 12 }}>Select User</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{ ...inputStyle, marginBottom: 12 }}
          />
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => loadUserBalance(user)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                  background: selectedUser?.id === user.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                  border: selectedUser?.id === user.id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#060a0f', flexShrink: 0 }}>
                  {(user.full_name || user.email)[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#e6edf3' }}>{user.full_name || 'No name'}</div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Editor */}
        <div>
          {!selectedUser ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👈</div>
              <div style={{ fontSize: 14, color: '#484f58' }}>Select a user to edit their balance</div>
            </div>
          ) : (
            <>
              {/* Balance Form */}
              <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{selectedUser.full_name || selectedUser.email}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>Portfolio Balances</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#C9A84C' }}>
                    ${(balance.crypto_balance + balance.stocks_balance + balance.affiliate_balance).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>◈ Coinbase / Crypto ($)</label>
                    <input
                      type="number"
                      value={balance.crypto_balance}
                      onChange={(e) => setBalance({ ...balance, crypto_balance: parseFloat(e.target.value) || 0 })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>◇ Stocks / IBKR ($)</label>
                    <input
                      type="number"
                      value={balance.stocks_balance}
                      onChange={(e) => setBalance({ ...balance, stocks_balance: parseFloat(e.target.value) || 0 })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>◉ Affiliate ($)</label>
                    <input
                      type="number"
                      value={balance.affiliate_balance}
                      onChange={(e) => setBalance({ ...balance, affiliate_balance: parseFloat(e.target.value) || 0 })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={labelStyle}>Total P&L ($)</label>
                    <input
                      type="number"
                      value={balance.total_pnl}
                      onChange={(e) => setBalance({ ...balance, total_pnl: parseFloat(e.target.value) || 0 })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>P&L Percentage (%)</label>
                    <input
                      type="number"
                      value={balance.pnl_percentage}
                      onChange={(e) => setBalance({ ...balance, pnl_percentage: parseFloat(e.target.value) || 0 })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  onClick={saveBalance}
                  disabled={loading}
                  style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Saving...' : '💾 Save Balance'}
                </button>
              </div>

              {/* Add Trade */}
              <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>➕ Inject Trade Into History</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>Platform</label>
                    <select
                      value={tradeForm.platform}
                      onChange={(e) => setTradeForm({ ...tradeForm, platform: e.target.value })}
                      style={{ ...inputStyle }}
                    >
                      {['Coinbase', 'Bybit', 'IBKR', 'Amazon'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Asset</label>
                    <input
                      value={tradeForm.asset}
                      onChange={(e) => setTradeForm({ ...tradeForm, asset: e.target.value })}
                      placeholder="BTC/USD"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select
                      value={tradeForm.type}
                      onChange={(e) => setTradeForm({ ...tradeForm, type: e.target.value })}
                      style={inputStyle}
                    >
                      {['BUY', 'SELL', 'EARN'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Amount ($)</label>
                    <input
                      type="number"
                      value={tradeForm.amount}
                      onChange={(e) => setTradeForm({ ...tradeForm, amount: e.target.value })}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>P&L ($)</label>
                    <input
                      type="number"
                      value={tradeForm.pnl}
                      onChange={(e) => setTradeForm({ ...tradeForm, pnl: e.target.value })}
                      placeholder="+240.00"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Note (optional)</label>
                    <input
                      value={tradeForm.note}
                      onChange={(e) => setTradeForm({ ...tradeForm, note: e.target.value })}
                      placeholder="Internal note..."
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  onClick={addTrade}
                  disabled={loading || !tradeForm.amount}
                  style={{ width: '100%', padding: '12px 0', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 10, color: '#C9A84C', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Adding...' : '➕ Add Trade to History'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
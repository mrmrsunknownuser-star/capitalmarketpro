'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WithdrawPage() {
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [network, setNetwork] = useState('Bitcoin')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: bal } = await supabase.from('balances').select('total_balance').eq('user_id', user.id).single()
      setBalance(bal?.total_balance || 0)

      const { data: hist } = await supabase.from('withdrawal_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setHistory(hist || [])
    }
    fetch()
  }, [success])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (parseFloat(amount) > balance) {
      setError('Insufficient balance')
      setLoading(false)
      return
    }

    if (parseFloat(amount) < 100) {
      setError('Minimum withdrawal is $100')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const num = Math.floor(Math.random() * 900000) + 100000

    const { error } = await supabase.from('withdrawal_requests').insert({
      user_id: user.id,
      request_id: `WDR-${num}`,
      amount: parseFloat(amount),
      currency: 'BTC',
      wallet_address: walletAddress,
      network,
      status: 'pending',
    })

    // Notify admin via notifications
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: '⏳ Withdrawal Request Submitted',
      message: `Your withdrawal of $${amount} is pending admin approval. You will be notified once processed.`,
      type: 'info',
    })

    if (!error) {
      setSuccess(true)
      setAmount('')
      setWalletAddress('')
    } else {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const statusColor = (s: string) => s === 'approved' ? '#3fb950' : s === 'rejected' ? '#f85149' : '#F7A600'

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Withdraw Funds</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Submit a withdrawal request to your crypto wallet</div>
      </div>

      {/* Balance */}
      <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Available Balance</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#C9A84C' }}>${balance.toLocaleString()}</div>
        </div>
        <div style={{ fontSize: 32 }}>💰</div>
      </div>

      {/* Success */}
      {success && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#3fb950', marginBottom: 4 }}>Withdrawal Request Submitted!</div>
          <div style={{ fontSize: 12, color: '#8b949e' }}>Your request is pending admin approval. You'll be notified once processed.</div>
          <button onClick={() => setSuccess(false)} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, border: '1px solid #3fb950', background: 'transparent', color: '#3fb950', fontSize: 12, cursor: 'pointer' }}>
            New Withdrawal
          </button>
        </div>
      )}

      {!success && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Form */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 20 }}>Withdrawal Details</div>

            {error && (
              <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#f85149' }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleWithdraw}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Min. $100"
                  required
                  min="100"
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Network</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                >
                  {['Bitcoin', 'Ethereum', 'USDT (TRC20)', 'USDT (ERC20)', 'BNB'].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                  required
                  style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
              </button>
            </form>

            {/* Info */}
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,82,255,0.06)', border: '1px solid rgba(0,82,255,0.15)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.6 }}>
                ℹ Withdrawals are reviewed by our team within <strong style={{ color: '#e6edf3' }}>24-48 hours</strong>. You will receive a notification once your request is processed.
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div>
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>Withdrawal Info</div>
              {[
                { label: 'Minimum Amount', value: '$100.00' },
                { label: 'Processing Time', value: '24-48 hours' },
                { label: 'Withdrawal Fee', value: '0.5%' },
                { label: 'Daily Limit', value: '$50,000' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22' }}>
                  <span style={{ fontSize: 12, color: '#8b949e' }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.15)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f85149', marginBottom: 8 }}>⚠ Important</div>
              <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7 }}>
                Always double-check your wallet address before submitting. Transactions sent to wrong addresses cannot be reversed.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 20, marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Withdrawal History</div>
        {history.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#484f58', fontSize: 13 }}>No withdrawals yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #161b22' }}>
                {['Request ID', 'Amount', 'Network', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid #161b22' }}>
                  <td style={{ padding: '12px', fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>{w.request_id}</td>
                  <td style={{ padding: '12px', fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>${w.amount.toLocaleString()}</td>
                  <td style={{ padding: '12px', fontSize: 11, color: '#8b949e' }}>{w.network}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(w.status), background: `${statusColor(w.status)}18`, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>{w.status}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: 11, color: '#484f58' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [kycStatus, setKycStatus] = useState('none')
  const [amount, setAmount] = useState('')
  const [wallet, setWallet] = useState('')
  const [network, setNetwork] = useState('Bitcoin (BTC)')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: profile } = await supabase.from('users').select('kyc_status, btc_address').eq('id', user.id).single()
      setKycStatus(profile?.kyc_status || 'none')
      if (profile?.btc_address) setWallet(profile.btc_address)
      const { data: bal } = await supabase.from('balances').select('total_balance').eq('user_id', user.id).single()
      setBalance(bal?.total_balance || 0)
      const { data: hist } = await supabase.from('withdrawal_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
      setHistory(hist || [])
    }
    init()
  }, [])

  const fee = amount ? (parseFloat(amount) * 0.05).toFixed(2) : '0.00'
  const receive = amount ? (parseFloat(amount) - parseFloat(fee)).toFixed(2) : '0.00'

  const handleSubmit = async () => {
    setError('')
    if (!amount || parseFloat(amount) < 100) { setError('Minimum withdrawal is $100'); return }
    if (!wallet.trim()) { setError('Please enter your wallet address'); return }
    if (parseFloat(amount) > balance) { setError('Insufficient balance'); return }
    if (kycStatus !== 'approved') { setError('Please complete KYC verification before withdrawing'); return }

    setSubmitting(true)
    const supabase = createClient()

    await supabase.from('withdrawal_requests').insert({
      user_id: userId,
      amount: parseFloat(amount),
      wallet_address: wallet,
      network,
      status: 'pending',
      fee: parseFloat(fee),
    })

    const { data: admin } = await supabase.from('users').select('id').eq('role', 'admin').single()
    if (admin?.id) {
      await supabase.from('notifications').insert({
        recipient_role: 'admin',
        title: '⬆ New Withdrawal Request',
        message: `$${parseFloat(amount).toLocaleString()} withdrawal to ${wallet.slice(0, 16)}...`,
        type: 'info', is_read: false,
      })
    }

    await supabase.from('notifications').insert({
      user_id: userId,
      title: '⬆ Withdrawal Submitted',
      message: `Your withdrawal of $${parseFloat(receive).toLocaleString()} (after 5% fee) is being processed. ETA: 24-48 hours.`,
      type: 'info', is_read: false,
    })

    setSubmitting(false)
    setSubmitted(true)
  }

  const statusColor = (s: string) => ({ pending: '#F7A600', approved: '#3fb950', rejected: '#f85149' }[s] || '#484f58')

  if (submitted) {
    return (
      <div style={{ padding: '24px 16px 80px', fontFamily: 'monospace', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.25)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#3fb950', marginBottom: 10 }}>Withdrawal Submitted!</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 24 }}>
            Your withdrawal of <strong style={{ color: '#C9A84C' }}>${parseFloat(receive).toLocaleString()}</strong> is being processed. Funds arrive within <strong style={{ color: '#e6edf3' }}>24-48 hours</strong>.
          </div>
          <div style={{ background: '#0d1117', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left' }}>
            {[
              { l: 'Amount', v: `$${parseFloat(amount).toLocaleString()}` },
              { l: 'Fee (5%)', v: `$${fee}` },
              { l: 'You Receive', v: `$${parseFloat(receive).toLocaleString()}` },
              { l: 'Network', v: network },
              { l: 'Wallet', v: wallet.slice(0, 20) + '...' },
              { l: 'Status', v: '⏳ Pending Review' },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #161b22' }}>
                <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 600 }}>{item.v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setSubmitted(false); setAmount(''); setWallet('') }}
            style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            New Withdrawal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace', maxWidth: 560, margin: '0 auto' }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Withdraw Funds</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Send funds to your crypto wallet</div>
      </div>

      {/* KYC Warning */}
      {kycStatus !== 'approved' && (
        <div style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f85149', marginBottom: 4 }}>KYC Required</div>
            <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>You must complete identity verification before making withdrawals.</div>
            <a href="/dashboard/kyc" style={{ fontSize: 12, color: '#C9A84C', display: 'inline-block', marginTop: 8 }}>Complete KYC →</a>
          </div>
        </div>
      )}

      {/* Balance */}
      <div style={{ background: 'linear-gradient(135deg,#0d1117,#161b22)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Available Balance</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#C9A84C', marginBottom: 4 }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: 11, color: '#484f58' }}>Min withdrawal: $100 · Fee: 5%</div>
      </div>

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: '#f85149', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠ {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* Form */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 16 }}>

        {/* Amount */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Withdrawal Amount (USD)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Min. $100"
            style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '14px', color: '#C9A84C', fontSize: 22, fontWeight: 800, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {[25, 50, 75, 100].map(pct => (
              <button key={pct} onClick={() => setAmount((balance * pct / 100).toFixed(2))}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Fee summary */}
        {amount && (
          <div style={{ background: '#161b22', borderRadius: 10, padding: 14, marginBottom: 16 }}>
            {[
              { l: 'Withdrawal Amount', v: `$${parseFloat(amount).toLocaleString()}` },
              { l: 'Processing Fee (5%)', v: `-$${fee}` },
              { l: 'You Will Receive', v: `$${parseFloat(receive).toLocaleString()}`, bold: true },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #21262d' }}>
                <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: (item as any).bold ? '#3fb950' : '#e6edf3', fontWeight: (item as any).bold ? 800 : 600 }}>{item.v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Network */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Network</label>
          <select value={network} onChange={e => setNetwork(e.target.value)}
            style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace', cursor: 'pointer' }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'}>
            {['Bitcoin (BTC)', 'Ethereum (ETH)', 'USDT (TRC20)', 'BNB (BEP20)'].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Wallet Address */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Wallet Address</label>
          <input value={wallet} onChange={e => setWallet(e.target.value)} placeholder="Enter your crypto wallet address..."
            style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
          <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>Double-check your address. Wrong address = permanent loss.</div>
        </div>

        <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.8 }}>
            📋 Withdrawals are reviewed within <strong style={{ color: '#e6edf3' }}>24-48 hours</strong>. You will receive a notification when approved and when funds are sent.
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!amount || !wallet || submitting || kycStatus !== 'approved'}
          style={{ width: '100%', padding: '14px 0', background: !amount || !wallet || submitting || kycStatus !== 'approved' ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: !amount || !wallet || submitting || kycStatus !== 'approved' ? '#484f58' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: !amount || !wallet || submitting || kycStatus !== 'approved' ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
          {submitting ? '⟳ Submitting...' : kycStatus !== 'approved' ? '🔒 KYC Required' : `Submit Withdrawal — $${parseFloat(receive || '0').toLocaleString()}`}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>Withdrawal History</div>
          {history.map((h, i) => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: i < history.length - 1 ? '1px solid #161b22' : 'none', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>${h.amount?.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>{h.network} · {new Date(h.created_at).toLocaleDateString()}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(h.status), background: `${statusColor(h.status)}18`, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
                {h.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
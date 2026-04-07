'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NETWORKS = [
  { id: 'BTC', label: 'Bitcoin', icon: '₿', color: '#F7A600', minTime: '1-3 hours' },
  { id: 'ETH', label: 'Ethereum', icon: 'Ξ', color: '#627EEA', minTime: '30 min' },
  { id: 'USDT_TRC20', label: 'USDT TRC20', icon: '₮', color: '#26A17B', minTime: '5 min' },
  { id: 'USDT_ERC20', label: 'USDT ERC20', icon: '₮', color: '#627EEA', minTime: '30 min' },
  { id: 'BNB', label: 'BNB', icon: '●', color: '#F7A600', minTime: '5 min' },
  { id: 'SOL', label: 'Solana', icon: '◎', color: '#9945FF', minTime: '1 min' },
]

export default function WithdrawPage() {
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [kycStatus, setKycStatus] = useState('none')
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0])
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: profile }, { data: bal }] = await Promise.all([
        supabase.from('users').select('kyc_status').eq('id', user.id).single(),
        supabase.from('balances').select('total_balance').eq('user_id', user.id).single(),
      ])

      setKycStatus(profile?.kyc_status || 'none')
      setBalance(bal?.total_balance || 0)
      setLoading(false)

      // Realtime balance
      supabase.channel(`withdraw-balance-${user.id}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'balances',
          filter: `user_id=eq.${user.id}`,
        }, p => setBalance((p.new as any).total_balance || 0))
        .subscribe()
    }
    init()
  }, [])

  const fee = amount ? parseFloat(amount) * 0.05 : 0
  const netAmount = amount ? parseFloat(amount) - fee : 0
  const MIN_WITHDRAWAL = 50
  const MAX_WITHDRAWAL = balance

  const handleSubmit = async () => {
    if (!amount || !walletAddress || !userId) return
    const amt = parseFloat(amount)

    if (amt < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is $${MIN_WITHDRAWAL}`)
      return
    }
    if (amt > balance) {
      setError('Insufficient balance')
      return
    }
    if (!walletAddress.trim()) {
      setError('Please enter your wallet address')
      return
    }

    setSubmitting(true)
    setError('')
    const supabase = createClient()

    const { data: insertData, error: insertError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: userId,
        amount: amt,
        fee: parseFloat(fee.toFixed(2)),
        network: selectedNetwork.id,
        wallet_address: walletAddress.trim(),
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('WITHDRAWAL INSERT ERROR:', insertError)
      setError('Failed: ' + insertError.message)
      setSubmitting(false)
      return
    }

    console.log('Withdrawal inserted:', insertData)

    // Deduct balance immediately
    const { data: bal } = await supabase
      .from('balances')
      .select('total_balance, available_balance, total_pnl')
      .eq('user_id', userId)
      .single()

    await supabase.from('balances').update({
      total_balance: Math.max(0, (bal?.total_balance || 0) - amt),
      available_balance: Math.max(0, (bal?.available_balance || 0) - amt),
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)

    // Notify admin
    const { data: admin } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .single()

    if (admin?.id) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        title: '⬆ New Withdrawal Request',
        message: `$${amt.toLocaleString()} via ${selectedNetwork.label}. Wallet: ${walletAddress.slice(0, 20)}...`,
        type: 'info',
        is_read: false,
        recipient_role: 'admin',
      })
    }

    await supabase.from('notifications').insert({
      user_id: userId,
      title: '⬆ Withdrawal Submitted',
      message: `Your withdrawal of $${amt.toLocaleString()} via ${selectedNetwork.label} is under review. Processing takes 24-48 hours.`,
      type: 'info',
      is_read: false,
      recipient_role: 'user',
    })

    setSubmitting(false)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 16px', fontFamily: 'monospace' }}>
        <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: '#161b22', borderRadius: 12, height: 80, marginBottom: 12, animation: 'pulse 1.5s ease infinite' }} />
        ))}
      </div>
    )
  }

  // ── KYC GATE ──
  if (kycStatus !== 'approved') {
    return (
      <div style={{ padding: '24px 16px 80px', fontFamily: 'monospace', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ background: 'rgba(248,81,73,0.06)', border: '2px solid rgba(248,81,73,0.3)', borderRadius: 20, padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f85149', marginBottom: 10 }}>KYC Required</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 28 }}>
            You must complete identity verification before making withdrawals. This protects your account and complies with financial regulations.
          </div>
          <div style={{ background: '#0d1117', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left' }}>
            {[
              { icon: kycStatus === 'pending' ? '⏳' : '❌', label: 'Identity Verified', done: false },
              { icon: '🔒', label: 'Withdrawals Locked', done: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i === 0 ? '1px solid #161b22' : 'none' }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontSize: 13, color: '#8b949e' }}>{s.label}</span>
              </div>
            ))}
          </div>
          {kycStatus === 'pending' ? (
            <div style={{ background: 'rgba(247,166,0,0.1)', border: '1px solid rgba(247,166,0,0.3)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F7A600', marginBottom: 4 }}>⏳ KYC Under Review</div>
              <div style={{ fontSize: 12, color: '#8b949e' }}>Your documents are being reviewed. Typically takes 24-48 hours.</div>
            </div>
          ) : (
            <Link href="/dashboard/kyc" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                Complete KYC Now →
              </button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  // ── SUCCESS STATE ──
  if (submitted) {
    return (
      <div style={{ padding: '24px 16px 80px', fontFamily: 'monospace', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ background: 'rgba(63,185,80,0.06)', border: '2px solid rgba(63,185,80,0.3)', borderRadius: 20, padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#3fb950', marginBottom: 10 }}>Withdrawal Submitted!</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 28 }}>
            Your withdrawal is being processed. Funds arrive within <strong style={{ color: '#e6edf3' }}>24-48 hours</strong> to your {selectedNetwork.label} wallet.
          </div>

          <div style={{ background: '#0d1117', borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left' }}>
            {[
              { l: 'Amount', v: `$${parseFloat(amount).toLocaleString()}` },
              { l: 'Processing Fee (5%)', v: `-$${fee.toFixed(2)}` },
              { l: 'You Receive', v: `$${netAmount.toFixed(2)}`, bold: true },
              { l: 'Network', v: selectedNetwork.label },
              { l: 'Wallet', v: walletAddress.slice(0, 20) + '...' },
              { l: 'Status', v: '⏳ Pending Review' },
              { l: 'ETA', v: '24-48 hours' },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #161b22', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: item.l === 'You Receive' ? '#3fb950' : '#e6edf3', fontWeight: item.bold ? 800 : 500 }}>{item.v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => { setSubmitted(false); setAmount(''); setWalletAddress(''); setStep(1) }}
              style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
              New Withdrawal
            </button>
            <Link href="/dashboard/trades" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                View History →
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── MAIN FORM ──
  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace', maxWidth: 520, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Withdraw Funds</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Transfer to your crypto wallet</div>
      </div>

      {/* Balance card */}
      <div style={{ background: 'linear-gradient(135deg,#0d1117,#161b22)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Available Balance</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#C9A84C' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>Min withdrawal</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>${MIN_WITHDRAWAL}</div>
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        {[{ n: 1, l: 'Network' }, { n: 2, l: 'Amount' }, { n: 3, l: 'Confirm' }].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: step > s.n ? '#C9A84C' : step === s.n ? 'rgba(201,168,76,0.2)' : '#161b22', border: `2px solid ${step >= s.n ? '#C9A84C' : '#21262d'}`, color: step > s.n ? '#060a0f' : step === s.n ? '#C9A84C' : '#484f58' }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontSize: 10, color: step === s.n ? '#C9A84C' : '#484f58', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s.l}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? '#C9A84C' : '#21262d', margin: '0 6px' }} />}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: '#f85149', display: 'flex', justifyContent: 'space-between' }}>
          <span>⚠ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* ── STEP 1 — Select Network ── */}
      {step === 1 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Step 1 — Select Network</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Choose your preferred withdrawal network</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {NETWORKS.map(network => (
              <div key={network.id}
                onClick={() => setSelectedNetwork(network)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: `2px solid ${selectedNetwork.id === network.id ? network.color : '#21262d'}`, background: selectedNetwork.id === network.id ? `${network.color}0d` : '#161b22', cursor: 'pointer' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${network.color}18`, border: `1px solid ${network.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: network.color, flexShrink: 0 }}>
                  {network.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{network.label}</div>
                  <div style={{ fontSize: 11, color: '#484f58' }}>ETA: {network.minTime} · Fee: 5%</div>
                </div>
                {selectedNetwork.id === network.id && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: network.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#060a0f', fontWeight: 800, flexShrink: 0 }}>✓</div>
                )}
              </div>
            ))}
          </div>

          <button onClick={() => setStep(2)}
            style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 2 — Amount + Wallet ── */}
      {step === 2 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Step 2 — Amount & Wallet</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Enter withdrawal amount and your {selectedNetwork.label} wallet address</div>

          {/* Selected network badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: `${selectedNetwork.color}0d`, border: `1px solid ${selectedNetwork.color}33`, borderRadius: 10 }}>
            <span style={{ fontSize: 18, color: selectedNetwork.color }}>{selectedNetwork.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: selectedNetwork.color }}>{selectedNetwork.label}</span>
            <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', fontSize: 10, color: '#484f58', background: 'none', border: 'none', cursor: 'pointer' }}>Change ✕</button>
          </div>

          {/* Amount input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount (USD) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#484f58', fontWeight: 700 }}>$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '16px 14px 16px 34px', color: '#e6edf3', fontSize: 22, fontWeight: 800, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#30363d'}
              />
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {[100, 500, 1000, 5000].filter(v => v <= balance).map(v => (
                <button key={v} onClick={() => setAmount(v.toString())}
                  style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid #21262d', background: amount === v.toString() ? 'rgba(201,168,76,0.15)' : '#161b22', color: amount === v.toString() ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                  ${v.toLocaleString()}
                </button>
              ))}
              <button onClick={() => setAmount(Math.floor(balance).toString())}
                style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)', color: '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                Max
              </button>
            </div>
          </div>

          {/* Fee preview */}
          {amount && parseFloat(amount) > 0 && (
            <div style={{ background: '#161b22', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              {[
                { l: 'Withdrawal Amount', v: `$${parseFloat(amount).toLocaleString()}` },
                { l: 'Processing Fee (5%)', v: `-$${fee.toFixed(2)}`, c: '#f85149' },
                { l: 'You Receive', v: `$${netAmount.toFixed(2)}`, c: '#3fb950', bold: true },
              ].map(item => (
                <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #21262d' }}>
                  <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                  <span style={{ fontSize: 12, color: (item as any).c || '#e6edf3', fontWeight: (item as any).bold ? 800 : 500 }}>{item.v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Wallet address */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {selectedNetwork.label} Wallet Address *
            </label>
            <textarea
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              placeholder={`Enter your ${selectedNetwork.label} wallet address...`}
              rows={3}
              style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '12px 14px', color: '#e6edf3', fontSize: 13, fontFamily: 'monospace', outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' as const }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
            <div style={{ fontSize: 11, color: '#484f58', marginTop: 6 }}>
              ⚠ Double-check your address. Funds sent to wrong address cannot be recovered.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
            <button onClick={() => {
              const amt = parseFloat(amount)
              if (!amount || isNaN(amt)) { setError('Please enter an amount'); return }
              if (amt < MIN_WITHDRAWAL) { setError(`Minimum withdrawal is $${MIN_WITHDRAWAL}`); return }
              if (amt > balance) { setError('Insufficient balance'); return }
              if (!walletAddress.trim()) { setError('Please enter your wallet address'); return }
              setError('')
              setStep(3)
            }}
              style={{ padding: '13px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              Review →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Confirm ── */}
      {step === 3 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Step 3 — Confirm Withdrawal</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Review details before submitting</div>

          {/* Amount hero */}
          <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 14, padding: '20px', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', marginBottom: 6 }}>You will receive</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#f85149', marginBottom: 4 }}>${netAmount.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: '#484f58' }}>after 5% processing fee (${fee.toFixed(2)})</div>
          </div>

          {/* Summary */}
          <div style={{ background: '#161b22', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            {[
              { l: 'Amount', v: `$${parseFloat(amount).toLocaleString()}` },
              { l: 'Fee (5%)', v: `-$${fee.toFixed(2)}` },
              { l: 'Net Amount', v: `$${netAmount.toFixed(2)}` },
              { l: 'Network', v: selectedNetwork.label },
              { l: 'ETA', v: selectedNetwork.minTime },
              { l: 'Wallet', v: walletAddress },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #21262d', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#484f58', flexShrink: 0 }}>{item.l}</span>
                <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all', fontFamily: item.l === 'Wallet' ? 'monospace' : 'inherit' }}>{item.v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(247,166,0,0.06)', border: '1px solid rgba(247,166,0,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#F7A600', lineHeight: 1.8 }}>
              ⚠ Withdrawals are processed manually within 24-48 hours. Your balance will be deducted immediately upon submission.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ padding: '14px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ padding: '14px 0', background: submitting ? '#161b22' : 'linear-gradient(135deg,#f85149,#c0392b)', border: 'none', borderRadius: 12, color: submitting ? '#484f58' : '#fff', fontSize: 14, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
              {submitting ? '⟳ Submitting...' : `⬆ Confirm Withdrawal`}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved · Withdrawals subject to review</div>
      </div>
    </div>
  )
}
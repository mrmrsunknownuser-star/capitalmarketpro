'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const PROVIDERS = [
  { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', url: 'https://www.moonpay.com/buy/btc', tag: 'Most Popular' },
  { name: 'Binance', icon: '🔶', color: '#F7A600', url: 'https://www.binance.com', tag: 'Low Fees' },
  { name: 'Coinbase', icon: '🔵', color: '#0052FF', url: 'https://www.coinbase.com', tag: 'Most Trusted' },
  { name: 'Paybis', icon: '💳', color: '#00C2FF', url: 'https://paybis.com', tag: 'Fast' },
  { name: 'Apple Pay', icon: '🍎', color: '#e6edf3', url: 'https://transak.com', tag: 'Instant' },
  { name: 'Transak', icon: '🌐', color: '#C9A84C', url: 'https://transak.com', tag: 'Global' },
]

const CRYPTOS = ['BTC', 'ETH', 'USDT', 'BNB']

export default function DepositPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedCrypto, setSelectedCrypto] = useState('BTC')
  const [copied, setCopied] = useState(false)
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [addresses, setAddresses] = useState<Record<string, string>>({
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fA32',
    USDT: 'TXkz2rQLJm7TFb1qJJHvxBEaJiFzPGx8Gq',
    BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
  })

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: bal } = await supabase.from('balances').select('total_balance').eq('user_id', user.id).single()
      setBalance(bal?.total_balance || 0)
      const { data: addr } = await supabase.from('platform_settings').select('value').eq('key', 'crypto_addresses').single()
      if (addr?.value) setAddresses(addr.value)
    }
    init()
  }, [])

const handleSubmit = async () => {
  if (!amount || !txHash || !userId) return
  setSubmitting(true)
  const supabase = createClient()

  // Remove try/catch to see real error
  const { data: insertData, error: insertError } = await supabase
    .from('deposits')
    .insert({
      user_id: userId,
      amount: parseFloat(amount),
      crypto: selectedCrypto,
      tx_hash: txHash,
      status: 'pending',
    })
    .select()
    .single()

  if (insertError) {
    console.error('DEPOSIT INSERT ERROR:', insertError)
    alert('Insert failed: ' + insertError.message)
    setSubmitting(false)
    return
  }

  console.log('Deposit inserted:', insertData)

  // Notify admin
  const { data: admin } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .single()

  if (admin?.id) {
    await supabase.from('notifications').insert({
      user_id: admin.id,
      title: '💰 New Deposit Request',
      message: `$${parseFloat(amount).toLocaleString()} via ${selectedCrypto}. TX: ${txHash.slice(0, 20)}...`,
      type: 'info',
      is_read: false,
      recipient_role: 'admin',
    })
  }

  await supabase.from('notifications').insert({
    user_id: userId,
    title: '💰 Deposit Submitted',
    message: `Your deposit of $${parseFloat(amount).toLocaleString()} via ${selectedCrypto} is under review. Funds appear within 30 minutes.`,
    type: 'info',
    is_read: false,
    recipient_role: 'user',
  })

  setSubmitting(false)
  setSubmitted(true)
}

  const addr = addresses[selectedCrypto]

  if (submitted) {
    return (
      <div style={{ padding: '24px 16px 80px', fontFamily: 'monospace', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.25)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#3fb950', marginBottom: 10 }}>Deposit Submitted!</div>
          <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 24 }}>
            Your deposit of <strong style={{ color: '#e6edf3' }}>${parseFloat(amount).toLocaleString()}</strong> via <strong style={{ color: '#C9A84C' }}>{selectedCrypto}</strong> is being reviewed. Funds appear within <strong style={{ color: '#e6edf3' }}>30 minutes</strong>.
          </div>
          <div style={{ background: '#0d1117', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left' }}>
            {[
              { l: 'Amount', v: `$${parseFloat(amount).toLocaleString()}` },
              { l: 'Crypto', v: selectedCrypto },
              { l: 'TX Hash', v: txHash.slice(0, 24) + '...' },
              { l: 'Status', v: '⏳ Pending Review' },
              { l: 'ETA', v: '~30 minutes' },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #161b22' }}>
                <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 600 }}>{item.v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setSubmitted(false); setStep(1); setAmount(''); setTxHash('') }}
            style={{ width: '100%', padding: '13px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            Make Another Deposit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace', maxWidth: 560, margin: '0 auto' }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Deposit Funds</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Add funds to your account securely</div>
      </div>

      {/* Balance card */}
      <div style={{ background: 'linear-gradient(135deg,#0d1117,#161b22)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Current Balance</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#C9A84C' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ fontSize: 36 }}>💰</div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        {[{ n: 1, l: 'Buy Crypto' }, { n: 2, l: 'Send Funds' }, { n: 3, l: 'Confirm' }].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: step > s.n ? '#C9A84C' : step === s.n ? 'rgba(201,168,76,0.2)' : '#161b22', border: `2px solid ${step >= s.n ? '#C9A84C' : '#21262d'}`, color: step > s.n ? '#060a0f' : step === s.n ? '#C9A84C' : '#484f58' }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontSize: 10, color: step === s.n ? '#C9A84C' : '#484f58', textTransform: 'uppercase' }}>{s.l}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? '#C9A84C' : '#21262d', margin: '0 6px' }} />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Step 1 — Buy Cryptocurrency</div>
            <div style={{ fontSize: 12, color: '#484f58', marginBottom: 18 }}>Purchase crypto from any trusted provider below</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PROVIDERS.map(p => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: `${p.color}0a`, border: `1px solid ${p.color}33`, borderRadius: 12, cursor: 'pointer' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>{p.name}</div>
                      <div style={{ fontSize: 9, color: p.color, fontWeight: 700 }}>{p.tag}</div>
                    </div>
                    <span style={{ fontSize: 12, color: p.color }}>→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8 }}>
              🔒 <strong style={{ color: '#e6edf3' }}>Why crypto only?</strong> Cryptocurrency ensures your trading activity is fully private and encrypted. Your funds cannot be monitored or frozen by banks.
            </div>
          </div>
          <button onClick={() => setStep(2)} style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            I Have Crypto — Continue →
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Step 2 — Send to Our Wallet</div>
            <div style={{ fontSize: 12, color: '#484f58', marginBottom: 18 }}>Select your crypto and send to the address below</div>

            {/* Crypto selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {CRYPTOS.map(c => (
                <button key={c} onClick={() => { setSelectedCrypto(c); setCopied(false) }}
                  style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${selectedCrypto === c ? '#C9A84C' : '#21262d'}`, background: selectedCrypto === c ? 'rgba(201,168,76,0.1)' : 'transparent', color: selectedCrypto === c ? '#C9A84C' : '#8b949e', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                  {c} {c === 'BTC' ? '⭐' : ''}
                </button>
              ))}
            </div>

            {/* Address */}
            <div onClick={() => { navigator.clipboard.writeText(addr); setCopied(true); setTimeout(() => setCopied(false), 3000) }}
              style={{ background: '#161b22', border: `1px solid ${copied ? '#3fb950' : '#21262d'}`, borderRadius: 12, padding: 16, cursor: 'pointer', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#484f58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {selectedCrypto} Deposit Address {selectedCrypto === 'BTC' ? '— Recommended' : ''}
              </div>
              <div style={{ fontSize: 12, color: '#C9A84C', wordBreak: 'break-all', lineHeight: 1.7, fontFamily: 'monospace' }}>{addr}</div>
              <div style={{ marginTop: 8, fontSize: 11, color: copied ? '#3fb950' : '#484f58', fontWeight: copied ? 700 : 400 }}>
                {copied ? '✅ Copied to clipboard!' : '📋 Tap to copy address'}
              </div>
            </div>

            <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#f85149', lineHeight: 1.7 }}>
                ⚠ Only send <strong>{selectedCrypto}</strong> to this address. Sending other assets will result in permanent loss of funds.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
            <button onClick={() => setStep(3)} style={{ padding: '13px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              I've Sent — Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div>
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Step 3 — Confirm Your Deposit</div>
            <div style={{ fontSize: 12, color: '#484f58', marginBottom: 18 }}>Enter your deposit amount and transaction ID</div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount Deposited (USD equivalent)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 5000"
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#C9A84C', fontSize: 18, fontWeight: 800, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transaction ID / Hash</label>
              <input value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="Paste your transaction hash here..."
                style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'} onBlur={e => e.target.style.borderColor = '#30363d'} />
              <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>Find in your wallet under Transaction History</div>
            </div>

            <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 14, marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.8 }}>
                ⚡ Our team reviews deposits within <strong style={{ color: '#e6edf3' }}>30 minutes</strong>. Funds will be credited to your account automatically upon confirmation.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
            <button onClick={handleSubmit} disabled={!amount || !txHash || submitting}
              style={{ padding: '13px 0', background: !amount || !txHash || submitting ? '#161b22' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: !amount || !txHash || submitting ? '#484f58' : '#060a0f', fontSize: 13, fontWeight: 800, cursor: !amount || !txHash || submitting ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
              {submitting ? '⟳ Submitting...' : '✅ Submit Deposit'}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
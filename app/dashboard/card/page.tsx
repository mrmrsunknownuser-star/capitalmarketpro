'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const VIRTUAL_CARDS = [
  {
    id: 'virtual_standard', name: 'Standard Virtual', tier: 'standard', type: 'virtual',
    price: 150, color: ['#1a1a2e', '#16213e'], accent: '#C9A84C', icon: '💳',
    cashback: '2%', limit: '$5,000/mo',
    features: ['Instant issuance', '2% cashback on all purchases', 'Freeze/unfreeze anytime', 'Online payments globally', 'Transaction notifications'],
  },
  {
    id: 'virtual_premium', name: 'Premium Virtual', tier: 'premium', type: 'virtual',
    price: 500, color: ['#0f0c29', '#302b63'], accent: '#7B2BF9', icon: '💜',
    cashback: '4%', limit: '$15,000/mo',
    features: ['All Standard features', '4% cashback', 'Apple Pay & Google Pay', 'Multi-currency support', 'Priority support'],
  },
  {
    id: 'virtual_elite', name: 'Elite Virtual', tier: 'elite', type: 'virtual',
    price: 1000, color: ['#000428', '#004e92'], accent: '#0052FF', icon: '💎',
    cashback: '5%', limit: '$30,000/mo',
    features: ['All Premium features', '5% cashback', 'Concierge service', 'Travel insurance', 'Lounge access codes'],
  },
]

const PHYSICAL_CARDS = [
  {
    id: 'physical_gold', name: 'Gold Card', tier: 'gold', type: 'physical',
    price: 2500, color: ['#2d1b00', '#5c3600'], accent: '#C9A84C', icon: '🥇',
    cashback: '5%', limit: '$50,000/mo', delivery: '7-14 business days',
    features: ['Physical metal card', '5% cashback', 'Global ATM access', 'Travel insurance', 'Concierge 24/7'],
  },
  {
    id: 'physical_titanium', name: 'Titanium Card', tier: 'titanium', type: 'physical',
    price: 5000, color: ['#1a1a1a', '#2d2d2d'], accent: '#e6edf3', icon: '⬛',
    cashback: '7%', limit: 'Unlimited', delivery: '5-10 business days',
    features: ['Premium metal card', '7% cashback', 'Unlimited spending', 'Airport lounges worldwide', 'Personal banker'],
  },
]

const PROVIDERS = [
  { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', url: 'https://www.moonpay.com/buy/btc', tag: 'Popular' },
  { name: 'Binance', icon: '🔶', color: '#F7A600', url: 'https://www.binance.com', tag: 'Low Fees' },
  { name: 'Coinbase', icon: '🔵', color: '#0052FF', url: 'https://www.coinbase.com', tag: 'Trusted' },
  { name: 'Paybis', icon: '💳', color: '#00C2FF', url: 'https://paybis.com', tag: 'Fast' },
  { name: 'Apple Pay', icon: '🍎', color: '#e6edf3', url: 'https://www.apple.com/apple-pay/', tag: 'Instant' },
  { name: 'Transak', icon: '🌐', color: '#C9A84C', url: 'https://transak.com', tag: 'Global' },
]

type Step = 'browse' | 'payment' | 'confirm'

export default function CardPage() {
  const [myCards, setMyCards] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'virtual' | 'physical'>('virtual')
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [step, setStep] = useState<Step>('browse')
  const [shippingAddr, setShippingAddr] = useState('')
  const [txHash, setTxHash] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BTC')
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [cryptoAddresses, setCryptoAddresses] = useState({
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

      // Fetch crypto addresses from admin settings
      const { data: addrData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'crypto_addresses')
        .single()
      if (addrData?.value) setCryptoAddresses(addrData.value)

      // Fetch applications
      const { data: apps } = await supabase
        .from('card_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setMyCards(apps || [])
      setLoading(false)
    }
    init()
  }, [])

  const submitApplication = async () => {
    if (!selectedCard || !userId) return
    if (selectedCard.type === 'physical' && !shippingAddr.trim()) {
      setError('Please enter your shipping address')
      return
    }
    if (!txHash.trim()) {
      setError('Please enter your transaction ID / payment reference')
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    const { error: insertError } = await supabase
      .from('card_applications')
      .insert({
        user_id: userId,
        card_id: selectedCard.id,
        card_name: selectedCard.name,
        card_type: selectedCard.type,
        card_tier: selectedCard.tier,
        card_price: selectedCard.price,
        status: 'pending',
        shipping_address: selectedCard.type === 'physical' ? shippingAddr : null,
        cashback: selectedCard.cashback,
        monthly_limit: selectedCard.limit,
        payment_method: paymentMethod,
        tx_hash: txHash,
      })

    if (insertError) {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
      return
    }

    // Notify admin
    const { data: adminUser } = await supabase
      .from('users').select('id').eq('role', 'admin').single()
    if (adminUser?.id) {
      await supabase.from('notifications').insert({
        user_id: adminUser.id,
        title: `💳 New ${selectedCard.name} Application`,
        message: `Payment of $${selectedCard.price} sent via ${paymentMethod}. TX: ${txHash.slice(0, 20)}...`,
        type: 'info', is_read: false,
      })
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: userId,
      title: '💳 Card Application Received',
      message: `Your ${selectedCard.name} application and payment are under review. You'll be notified within 24-48 hours.`,
      type: 'info', is_read: false,
    })

    setSuccess(`✅ Application submitted! We'll review your payment and activate your card within 24-48 hours.`)
    setSubmitting(false)
    setSelectedCard(null)
    setStep('browse')
    setTxHash('')
    setShippingAddr('')

    // Refresh cards
    const { data: apps } = await supabase
      .from('card_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setMyCards(apps || [])
    setTimeout(() => setSuccess(''), 6000)
  }

  const getApplication = (cardId: string) => myCards.find(c => c.card_id === cardId)
  const statusColor = (s: string) => ({ pending: '#F7A600', approved: '#3fb950', rejected: '#f85149' }[s] || '#484f58')
  const statusIcon = (s: string) => ({ pending: '⏳', approved: '🟢', rejected: '❌' }[s] || '❓')
  const allCards = tab === 'virtual' ? VIRTUAL_CARDS : PHYSICAL_CARDS
  const currentAddress = cryptoAddresses[paymentMethod as keyof typeof cryptoAddresses]

  // ── PAYMENT SCREEN ──
  if (step === 'payment' && selectedCard) {
    return (
      <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace', maxWidth: 540, margin: '0 auto' }}>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          {[{ n: 1, l: 'Select Card' }, { n: 2, l: 'Make Payment' }, { n: 3, l: 'Submit' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: s.n === 2 ? selectedCard.accent : s.n < 2 ? `${selectedCard.accent}22` : '#161b22', border: `2px solid ${s.n <= 2 ? selectedCard.accent : '#21262d'}`, color: s.n === 2 ? '#060a0f' : s.n < 2 ? selectedCard.accent : '#484f58' }}>
                  {s.n < 2 ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 10, color: s.n === 2 ? selectedCard.accent : '#484f58', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{s.l}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: s.n < 2 ? selectedCard.accent : '#21262d', margin: '0 6px' }} />}
            </div>
          ))}
        </div>

        {/* Card preview */}
        <div style={{ background: `linear-gradient(135deg, ${selectedCard.color[0]}, ${selectedCard.color[1]})`, borderRadius: 18, padding: 20, marginBottom: 20, border: `1px solid ${selectedCard.accent}44`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -15, right: -15, width: 80, height: 80, borderRadius: '50%', background: `${selectedCard.accent}15` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 9, color: selectedCard.accent, letterSpacing: '0.15em', textTransform: 'uppercase' }}>CapitalMarket Pro</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3' }}>{selectedCard.name}</div>
            </div>
            <div style={{ fontSize: 28 }}>{selectedCard.icon}</div>
          </div>
          <div style={{ fontSize: 14, color: '#8b949e', letterSpacing: '0.18em', marginBottom: 12 }}>•••• •••• •••• ••••</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <div style={{ fontSize: 8, color: '#484f58', textTransform: 'uppercase' }}>Cashback</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: selectedCard.accent }}>{selectedCard.cashback}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: '#484f58', textTransform: 'uppercase' }}>Monthly Limit</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{selectedCard.limit}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 8, color: '#484f58', textTransform: 'uppercase' }}>Application Fee</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: selectedCard.accent }}>${selectedCard.price.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>💰 Step 1 — Make Payment</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 16 }}>
            Pay the application fee of <strong style={{ color: selectedCard.accent }}>${selectedCard.price.toLocaleString()}</strong> using any method below
          </div>

          {/* Buy crypto providers */}
          <div style={{ fontSize: 11, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Buy Crypto or Pay via:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
            {PROVIDERS.map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: `${p.color}0a`, border: `1px solid ${p.color}33`, borderRadius: 10 }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>{p.name}</div>
                    <div style={{ fontSize: 9, color: p.color }}>{p.tag}</div>
                  </div>
                  <span style={{ fontSize: 11, color: p.color }}>→</span>
                </div>
              </a>
            ))}
          </div>

          {/* Crypto selector */}
          <div style={{ fontSize: 11, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Send Payment to:
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {Object.keys(cryptoAddresses).map(coin => (
              <button key={coin} onClick={() => { setPaymentMethod(coin); setCopied(false) }}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${paymentMethod === coin ? selectedCard.accent : '#21262d'}`, background: paymentMethod === coin ? `${selectedCard.accent}15` : 'transparent', color: paymentMethod === coin ? selectedCard.accent : '#8b949e', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                {coin} {coin === 'BTC' ? '⭐' : ''}
              </button>
            ))}
          </div>

          {/* Address */}
          <div onClick={() => { navigator.clipboard.writeText(currentAddress); setCopied(true); setTimeout(() => setCopied(false), 3000) }}
            style={{ background: '#161b22', border: `1px solid ${copied ? '#3fb950' : '#21262d'}`, borderRadius: 12, padding: 14, cursor: 'pointer', marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#484f58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {paymentMethod} Address — Send exactly ${selectedCard.price.toLocaleString()} worth
            </div>
            <div style={{ fontSize: 11, color: selectedCard.accent, wordBreak: 'break-all', lineHeight: 1.7, fontFamily: 'monospace' }}>
              {currentAddress}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: copied ? '#3fb950' : '#484f58', fontWeight: copied ? 700 : 400 }}>
              {copied ? '✅ Copied to clipboard!' : '📋 Tap to copy address'}
            </div>
          </div>

          <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: '#f85149', lineHeight: 1.7 }}>
              ⚠ Only send <strong>{paymentMethod}</strong> to this address. Send the exact amount: <strong>${selectedCard.price.toLocaleString()}</strong>. Wrong asset or amount = delayed processing.
            </div>
          </div>
        </div>

        {/* Physical card shipping */}
        {selectedCard.type === 'physical' && (
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>📦 Shipping Address</div>
            <div style={{ fontSize: 11, color: '#484f58', marginBottom: 12 }}>Enter where you want your physical card delivered</div>
            <textarea
              value={shippingAddr}
              onChange={e => setShippingAddr(e.target.value)}
              placeholder="Full name, Street address, City, State/Province, ZIP, Country..."
              rows={3}
              style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace', resize: 'none', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
            <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>🚚 Estimated delivery: {selectedCard.delivery}</div>
          </div>
        )}

        {/* Back button */}
        <button onClick={() => setStep('browse')} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', marginBottom: 12 }}>
          ← Back to Cards
        </button>

        {/* CTA */}
        <div style={{ background: `${selectedCard.accent}0d`, border: `2px solid ${selectedCard.accent}44`, borderRadius: 14, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>
            ✅ Made your payment?
          </div>
          <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8, marginBottom: 16 }}>
            After sending the payment, click below to submit your application with your transaction details.
          </div>
          <button onClick={() => setStep('confirm')}
            style={{ width: '100%', padding: '14px 0', background: `linear-gradient(135deg, ${selectedCard.accent}, ${selectedCard.accent}cc)`, border: 'none', borderRadius: 12, color: selectedCard.accent === '#e6edf3' ? '#060a0f' : '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
            I've Made Payment — Submit Application →
          </button>
        </div>
      </div>
    )
  }

  // ── CONFIRM / TX HASH SCREEN ──
  if (step === 'confirm' && selectedCard) {
    return (
      <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace', maxWidth: 540, margin: '0 auto' }}>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          {[{ n: 1, l: 'Select Card' }, { n: 2, l: 'Make Payment' }, { n: 3, l: 'Submit' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: s.n <= 3 ? `${selectedCard.accent}22` : '#161b22', border: `2px solid ${s.n <= 3 ? selectedCard.accent : '#21262d'}`, color: s.n < 3 ? '#060a0f' : selectedCard.accent }}>
                  {s.n < 3 ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 10, color: s.n === 3 ? selectedCard.accent : '#484f58', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{s.l}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: selectedCard.accent, margin: '0 6px' }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>📋 Step 2 — Confirm Payment</div>
          <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Enter your transaction details so we can verify your payment</div>

          {/* Summary */}
          <div style={{ background: '#161b22', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            {[
              { l: 'Card', v: selectedCard.name },
              { l: 'Application Fee', v: `$${selectedCard.price.toLocaleString()}` },
              { l: 'Payment Method', v: paymentMethod },
              { l: 'Send To', v: currentAddress.slice(0, 20) + '...' },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #21262d' }}>
                <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 600, fontFamily: 'monospace' }}>{item.v}</span>
              </div>
            ))}
          </div>

          {/* TX Hash */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Transaction ID / Hash *
            </label>
            <input
              value={txHash}
              onChange={e => setTxHash(e.target.value)}
              placeholder="Enter your transaction ID or hash..."
              style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '13px 14px', color: '#C9A84C', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
              onFocus={e => e.target.style.borderColor = selectedCard.accent}
              onBlur={e => e.target.style.borderColor = '#30363d'}
            />
            <div style={{ fontSize: 10, color: '#484f58', marginTop: 6, lineHeight: 1.7 }}>
              Find your transaction ID in your wallet or exchange under "Transaction History". This helps us verify your payment faster.
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#f85149' }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.8 }}>
              📌 <strong style={{ color: '#C9A84C' }}>What happens next?</strong><br />
              Our team will verify your payment within <strong style={{ color: '#e6edf3' }}>24-48 hours</strong>. Once confirmed, your card will be activated and you'll receive a notification immediately.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <button onClick={() => setStep('payment')} style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
              ← Back
            </button>
            <button onClick={submitApplication} disabled={submitting || !txHash.trim()}
              style={{ padding: '13px 0', background: !txHash.trim() || submitting ? '#161b22' : `linear-gradient(135deg, ${selectedCard.accent}, ${selectedCard.accent}cc)`, border: 'none', borderRadius: 12, color: !txHash.trim() || submitting ? '#484f58' : selectedCard.accent === '#e6edf3' ? '#060a0f' : '#fff', fontSize: 13, fontWeight: 800, cursor: !txHash.trim() || submitting ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
              {submitting ? '⟳ Submitting...' : '✅ Submit Application'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── BROWSE SCREEN ──
  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>
      <style>{`
        .card-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        @media (max-width: 700px) { .card-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Pro Cards</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>VISA-powered cards with up to 7% cashback</div>
      </div>

      {success && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: '#3fb950', lineHeight: 1.7 }}>
          {success}
        </div>
      )}

      {/* My Active Cards */}
      {myCards.filter(c => c.status === 'approved').length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 14 }}>💳 My Active Cards</div>
          {myCards.filter(c => c.status === 'approved').map(card => {
            const def = [...VIRTUAL_CARDS, ...PHYSICAL_CARDS].find(c => c.id === card.card_id)
            return (
              <div key={card.id} style={{ background: `linear-gradient(135deg, ${def?.color[0] || '#0d1117'}, ${def?.color[1] || '#161b22'})`, border: `2px solid ${def?.accent || '#C9A84C'}55`, borderRadius: 20, padding: 24, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `${def?.accent}12` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 9, color: def?.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>CapitalMarket Pro · VISA</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3' }}>{card.card_name}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <div style={{ fontSize: 24 }}>{def?.icon}</div>
                    <div style={{ fontSize: 10, color: '#3fb950', background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.3)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>🟢 ACTIVE</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, color: '#8b949e', letterSpacing: '0.22em', marginBottom: 18, fontFamily: 'monospace' }}>
                  •••• •••• •••• {Math.floor(1000 + (card.id.charCodeAt(0) * 31) % 9000)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Cashback</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: def?.accent }}>{card.cashback}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Monthly Limit</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{card.monthly_limit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Type</div>
                    <div style={{ fontSize: 12, color: '#8b949e', textTransform: 'capitalize' }}>{card.card_type}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pending/rejected */}
      {myCards.filter(c => c.status === 'pending' || c.status === 'rejected').length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Applications</div>
          {myCards.filter(c => c.status !== 'approved').map(card => (
            <div key={card.id} style={{ background: '#0d1117', border: `1px solid ${statusColor(card.status)}33`, borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 22 }}>{[...VIRTUAL_CARDS, ...PHYSICAL_CARDS].find(c => c.id === card.card_id)?.icon || '💳'}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{card.card_name}</div>
                  <div style={{ fontSize: 11, color: '#484f58' }}>Applied {new Date(card.created_at).toLocaleDateString()} · ${card.card_price?.toLocaleString()} application fee</div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: statusColor(card.status), background: `${statusColor(card.status)}15`, border: `1px solid ${statusColor(card.status)}33`, padding: '5px 12px', borderRadius: 20 }}>
                {statusIcon(card.status)} {card.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {[{ id: 'virtual', label: '💳 Virtual Cards' }, { id: 'physical', label: '📦 Physical Cards' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="card-grid">
        {allCards.map(card => {
          const app = getApplication(card.id)
          const isActive = app?.status === 'approved'
          const isPending = app?.status === 'pending'
          const isRejected = app?.status === 'rejected'

          return (
            <div key={card.id} style={{ background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})`, border: `1px solid ${isActive ? card.accent : card.accent + '33'}`, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
              {isActive && (
                <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, color: '#3fb950', background: 'rgba(63,185,80,0.2)', border: '1px solid rgba(63,185,80,0.4)', padding: '3px 10px', borderRadius: 20, fontWeight: 700, zIndex: 2 }}>
                  🟢 ACTIVE
                </div>
              )}

              {/* Card visual */}
              <div style={{ padding: '20px 20px 16px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${card.accent}12` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: card.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3 }}>CapitalMarket Pro</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>{card.name}</div>
                  </div>
                  <div style={{ fontSize: 26 }}>{card.icon}</div>
                </div>
                <div style={{ fontSize: 12, color: '#484f58', letterSpacing: '0.18em', marginBottom: 14 }}>•••• •••• •••• ••••</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 8, color: '#484f58', textTransform: 'uppercase' }}>Cashback</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: card.accent }}>{card.cashback}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: '#484f58', textTransform: 'uppercase' }}>Limit</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{card.limit}</div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '14px 20px' }}>
                <div style={{ marginBottom: 12 }}>
                  {card.features.slice(0, 4).map((f, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#8b949e', marginBottom: 5, display: 'flex', gap: 6 }}>
                      <span style={{ color: card.accent, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                  {(card as any).delivery && (
                    <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>📦 {(card as any).delivery}</div>
                  )}
                </div>

                {/* Application fee */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#8b949e' }}>Application Fee</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: card.accent }}>${card.price.toLocaleString()}</span>
                </div>

                {/* CTA */}
                {isActive ? (
                  <div style={{ width: '100%', padding: '11px 0', background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 12, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#3fb950' }}>
                    🟢 Card Active
                  </div>
                ) : isPending ? (
                  <div style={{ width: '100%', padding: '11px 0', background: 'rgba(247,166,0,0.1)', border: '1px solid rgba(247,166,0,0.3)', borderRadius: 12, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#F7A600' }}>
                    ⏳ Under Review
                  </div>
                ) : (
                  <button onClick={() => { setSelectedCard(card); setStep('payment'); setError('') }}
                    style={{ width: '100%', padding: '12px 0', background: `linear-gradient(135deg, ${card.accent}, ${card.accent}cc)`, border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 800, color: card.accent === '#e6edf3' ? '#060a0f' : '#fff', cursor: 'pointer', fontFamily: 'monospace' }}>
                    {isRejected ? '🔄 Reapply' : 'Apply Now →'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Benefits */}
      <div style={{ marginTop: 28, background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Why CapitalMarket Pro Cards?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {[
            { icon: '💸', title: 'Up to 7% Cashback', desc: 'Earn on every purchase worldwide' },
            { icon: '🌍', title: 'Global Acceptance', desc: 'Anywhere VISA is accepted' },
            { icon: '🔒', title: 'Instant Freeze', desc: 'Lock your card with one tap' },
            { icon: '⚡', title: 'Real-time Alerts', desc: 'Instant transaction notifications' },
            { icon: '✈️', title: 'Travel Perks', desc: 'Lounge access & travel insurance' },
            { icon: '🏦', title: 'ATM Access', desc: 'Withdraw cash globally' },
          ].map(b => (
            <div key={b.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{b.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{b.title}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
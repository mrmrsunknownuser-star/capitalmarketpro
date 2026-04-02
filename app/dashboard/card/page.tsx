'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const VIRTUAL_CARDS = [
  {
    id: 'virtual_standard',
    name: 'Standard Virtual',
    tier: 'standard',
    type: 'virtual',
    price: 150,
    color: ['#1a1a2e', '#16213e'],
    accent: '#C9A84C',
    icon: '💳',
    cashback: '2%',
    limit: '$5,000/mo',
    features: ['Online payments', 'Instant issuance', '2% cashback', 'Freeze/unfreeze', 'Virtual only'],
  },
  {
    id: 'virtual_premium',
    name: 'Premium Virtual',
    tier: 'premium',
    type: 'virtual',
    price: 500,
    color: ['#0f0c29', '#302b63'],
    accent: '#7B2BF9',
    icon: '💜',
    cashback: '4%',
    limit: '$15,000/mo',
    features: ['All Standard features', '4% cashback', 'Priority support', 'Multi-currency', 'Apple/Google Pay'],
  },
  {
    id: 'virtual_elite',
    name: 'Elite Virtual',
    tier: 'elite',
    type: 'virtual',
    price: 1000,
    color: ['#000428', '#004e92'],
    accent: '#0052FF',
    icon: '💎',
    cashback: '5%',
    limit: '$30,000/mo',
    features: ['All Premium features', '5% cashback', 'Concierge service', 'Travel insurance', 'Lounge access'],
  },
]

const PHYSICAL_CARDS = [
  {
    id: 'physical_gold',
    name: 'Gold Card',
    tier: 'gold',
    type: 'physical',
    price: 2500,
    color: ['#2d1b00', '#5c3600'],
    accent: '#C9A84C',
    icon: '🥇',
    cashback: '5%',
    limit: '$50,000/mo',
    features: ['Physical delivery', '5% cashback', 'Global ATM access', 'Travel insurance', 'Concierge 24/7'],
    delivery: '7-14 business days',
  },
  {
    id: 'physical_titanium',
    name: 'Titanium Card',
    tier: 'titanium',
    type: 'physical',
    price: 5000,
    color: ['#1a1a1a', '#2d2d2d'],
    accent: '#e6edf3',
    icon: '⬛',
    cashback: '7%',
    limit: 'Unlimited',
    features: ['Metal card', '7% cashback', 'Priority everything', 'Airport lounges worldwide', 'Personal banker'],
    delivery: '5-10 business days',
  },
]

export default function CardPage() {
  const [myCards, setMyCards] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'virtual' | 'physical'>('virtual')
  const [modal, setModal] = useState<any>(null)
  const [shippingAddr, setShippingAddr] = useState('')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      fetchMyCards(user.id)
    }
    init()
  }, [])

  const fetchMyCards = async (uid: string) => {
    setLoading(false)
    const supabase = createClient()
    const { data } = await supabase
      .from('card_applications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    setMyCards(data || [])
  }

  const applyForCard = async () => {
    if (!modal || !userId) return
    if (modal.type === 'physical' && !shippingAddr.trim()) {
      setError('Please enter your shipping address')
      return
    }
    setApplying(modal.id)

    const supabase = createClient()

    // Check if already applied for this card
    const existing = myCards.find(c => c.card_id === modal.id)
    if (existing) {
      setError(`You already have a ${modal.name} application (${existing.status})`)
      setApplying(null)
      setModal(null)
      return
    }

    const { error: insertError } = await supabase
      .from('card_applications')
      .insert({
        user_id: userId,
        card_id: modal.id,
        card_name: modal.name,
        card_type: modal.type,
        card_tier: modal.tier,
        card_price: modal.price,
        status: 'pending',
        shipping_address: modal.type === 'physical' ? shippingAddr : null,
        cashback: modal.cashback,
        monthly_limit: modal.limit,
      })

    if (insertError) {
      setError('Failed to submit application. Please try again.')
      setApplying(null)
      return
    }

    // Notify admin
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .single()

    if (adminUser?.id) {
      await supabase.from('notifications').insert({
        user_id: adminUser.id,
        title: `💳 New ${modal.name} Application`,
        message: `A user has applied for the ${modal.name} card ($${modal.price} activation fee).`,
        type: 'info',
        is_read: false,
      })
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: userId,
      title: '💳 Card Application Submitted',
      message: `Your ${modal.name} application has been received and is under review. We'll notify you within 24-48 hours.`,
      type: 'info',
      is_read: false,
    })

    setSuccess(`✅ ${modal.name} application submitted! We'll review within 24-48 hours.`)
    setApplying(null)
    setModal(null)
    setShippingAddr('')
    fetchMyCards(userId)
    setTimeout(() => setSuccess(''), 5000)
  }

  const getCardStatus = (cardId: string) => {
    return myCards.find(c => c.card_id === cardId)
  }

  const statusColor = (s: string) => ({
    pending: '#F7A600', approved: '#3fb950', rejected: '#f85149', active: '#3fb950'
  }[s] || '#484f58')

  const statusIcon = (s: string) => ({
    pending: '⏳', approved: '✅', rejected: '❌', active: '🟢'
  }[s] || '❓')

  const allCards = tab === 'virtual' ? VIRTUAL_CARDS : PHYSICAL_CARDS

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
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#f85149' }}>
          ⚠ {error}
          <button onClick={() => setError('')} style={{ marginLeft: 10, background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: 12 }}>✕</button>
        </div>
      )}

      {/* My Active Cards */}
      {myCards.filter(c => c.status === 'approved' || c.status === 'active').length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 14 }}>My Cards</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myCards.filter(c => c.status === 'approved' || c.status === 'active').map(card => {
              const cardDef = [...VIRTUAL_CARDS, ...PHYSICAL_CARDS].find(c => c.id === card.card_id)
              return (
                <div key={card.id} style={{ background: `linear-gradient(135deg, ${cardDef?.color[0] || '#0d1117'}, ${cardDef?.color[1] || '#161b22'})`, border: `1px solid ${cardDef?.accent || '#C9A84C'}44`, borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `${cardDef?.accent || '#C9A84C'}15` }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: cardDef?.accent || '#C9A84C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>CapitalMarket Pro</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3' }}>{card.card_name}</div>
                    </div>
                    <div style={{ fontSize: 28 }}>{cardDef?.icon}</div>
                  </div>
                  <div style={{ fontSize: 16, color: '#e6edf3', letterSpacing: '0.2em', marginBottom: 16, fontFamily: 'monospace' }}>
                    •••• •••• •••• {Math.floor(1000 + Math.random() * 9000)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 9, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cashback</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: cardDef?.accent || '#C9A84C' }}>{card.cashback}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Limit</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{card.monthly_limit}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#3fb950', background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.3)', padding: '5px 12px', borderRadius: 20, fontWeight: 700 }}>
                      🟢 ACTIVE
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending applications */}
      {myCards.filter(c => c.status === 'pending' || c.status === 'rejected').length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>Applications</div>
          {myCards.filter(c => c.status === 'pending' || c.status === 'rejected').map(card => (
            <div key={card.id} style={{ background: '#0d1117', border: `1px solid ${statusColor(card.status)}33`, borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>{[...VIRTUAL_CARDS, ...PHYSICAL_CARDS].find(c => c.id === card.card_id)?.icon || '💳'}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{card.card_name}</div>
                  <div style={{ fontSize: 11, color: '#484f58' }}>Applied {new Date(card.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: statusColor(card.status), background: `${statusColor(card.status)}15`, border: `1px solid ${statusColor(card.status)}33`, padding: '4px 12px', borderRadius: 20 }}>
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
          const application = getCardStatus(card.id)
          const isActive = application?.status === 'approved' || application?.status === 'active'
          const isPending = application?.status === 'pending'
          const isRejected = application?.status === 'rejected'

          return (
            <div key={card.id} style={{ background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})`, border: `1px solid ${card.accent}33`, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
              {/* Card Visual */}
              <div style={{ padding: '20px 20px 16px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${card.accent}12` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: card.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3 }}>CapitalMarket Pro</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>{card.name}</div>
                  </div>
                  <div style={{ fontSize: 26 }}>{card.icon}</div>
                </div>
                <div style={{ fontSize: 13, color: '#8b949e', letterSpacing: '0.18em', marginBottom: 14 }}>
                  •••• •••• •••• ••••
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 8, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cashback</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: card.accent }}>{card.cashback}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monthly Limit</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{card.limit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Type</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', textTransform: 'capitalize' }}>{card.type}</div>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 20px' }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>Features:</div>
                  {card.features.map((f, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#8b949e', marginBottom: 4, display: 'flex', gap: 6 }}>
                      <span style={{ color: card.accent }}>✓</span>{f}
                    </div>
                  ))}
                  {(card as any).delivery && (
                    <div style={{ fontSize: 10, color: '#484f58', marginTop: 6 }}>📦 Delivery: {(card as any).delivery}</div>
                  )}
                </div>

                {/* Activation fee */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 11, color: '#8b949e' }}>Activation Fee</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: card.accent }}>${card.price.toLocaleString()}</span>
                </div>

                {/* Status / Apply button */}
                {isActive ? (
                  <div style={{ width: '100%', padding: '11px 0', background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 12, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#3fb950' }}>
                    🟢 ACTIVE
                  </div>
                ) : isPending ? (
                  <div style={{ width: '100%', padding: '11px 0', background: 'rgba(247,166,0,0.1)', border: '1px solid rgba(247,166,0,0.3)', borderRadius: 12, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#F7A600' }}>
                    ⏳ PENDING REVIEW
                  </div>
                ) : isRejected ? (
                  <button onClick={() => setModal(card)}
                    style={{ width: '100%', padding: '11px 0', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#f85149', cursor: 'pointer', fontFamily: 'monospace' }}>
                    ❌ REJECTED — Reapply
                  </button>
                ) : (
                  <button onClick={() => setModal(card)}
                    style={{ width: '100%', padding: '11px 0', background: `linear-gradient(135deg, ${card.accent}, ${card.accent}cc)`, border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 800, color: card.accent === '#e6edf3' ? '#060a0f' : '#fff', cursor: 'pointer', fontFamily: 'monospace' }}>
                    Apply for this Card →
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Benefits section */}
      <div style={{ marginTop: 28, background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>💳 Why CapitalMarket Pro Cards?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {[
            { icon: '💸', title: 'Up to 7% Cashback', desc: 'Earn on every purchase worldwide' },
            { icon: '🔒', title: 'Freeze Instantly', desc: 'Lock your card with one tap' },
            { icon: '🌍', title: 'Global Acceptance', desc: 'Use anywhere VISA is accepted' },
            { icon: '⚡', title: 'Instant Notifications', desc: 'Real-time alerts on every transaction' },
          ].map(b => (
            <div key={b.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{b.icon}</span>
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

      {/* Application Modal */}
      {modal && (
        <div onClick={e => { if (e.target === e.currentTarget) { setModal(null); setShippingAddr('') } }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 440, fontFamily: 'monospace', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Modal header */}
            <div style={{ background: `linear-gradient(135deg, ${modal.color[0]}, ${modal.color[1]})`, padding: '24px 24px 20px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, borderRadius: '50%', background: `${modal.accent}15` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, color: modal.accent, letterSpacing: '0.15em', marginBottom: 4 }}>CAPITALMARKET PRO</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3' }}>{modal.name}</div>
                  <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>{modal.cashback} cashback · {modal.limit}</div>
                </div>
                <div style={{ fontSize: 32 }}>{modal.icon}</div>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Card Application</div>

              {/* Features */}
              <div style={{ background: '#161b22', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                {modal.features.map((f: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: '#8b949e' }}>
                    <span style={{ color: modal.accent }}>✓</span>{f}
                  </div>
                ))}
              </div>

              {/* Physical card shipping */}
              {modal.type === 'physical' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    📦 Shipping Address *
                  </label>
                  <textarea
                    value={shippingAddr}
                    onChange={e => setShippingAddr(e.target.value)}
                    placeholder="Enter your full shipping address including city, state, zip code, country..."
                    rows={3}
                    style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '12px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace', resize: 'none', lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = modal.accent}
                    onBlur={e => e.target.style.borderColor = '#30363d'}
                  />
                  <div style={{ fontSize: 10, color: '#484f58', marginTop: 4 }}>Delivery: {modal.delivery}</div>
                </div>
              )}

              {/* Fee */}
              <div style={{ background: `${modal.accent}0d`, border: `1px solid ${modal.accent}33`, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#8b949e' }}>One-time activation fee</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: modal.accent }}>${modal.price.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>
                  Fee will be deducted from your account balance upon approval
                </div>
              </div>

              {/* Process info */}
              <div style={{ marginBottom: 20 }}>
                {[
                  { s: '1', t: 'Submit application', c: '#C9A84C' },
                  { s: '2', t: 'Admin reviews (24-48hrs)', c: '#8b949e' },
                  { s: '3', t: 'Card activated on approval', c: '#8b949e' },
                  { s: '4', t: modal.type === 'physical' ? 'Physical card shipped to you' : 'Use immediately online', c: '#8b949e' },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${step.c}22`, border: `1px solid ${step.c}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: step.c, flexShrink: 0 }}>{step.s}</div>
                    <span style={{ fontSize: 12, color: step.c }}>{step.t}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <button onClick={() => { setModal(null); setShippingAddr('') }}
                  style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
                  Cancel
                </button>
                <button
                  onClick={applyForCard}
                  disabled={applying === modal.id || (modal.type === 'physical' && !shippingAddr.trim())}
                  style={{ padding: '13px 0', background: applying === modal.id ? '#161b22' : `linear-gradient(135deg, ${modal.accent}, ${modal.accent}cc)`, border: 'none', borderRadius: 12, color: applying === modal.id ? '#484f58' : modal.accent === '#e6edf3' ? '#060a0f' : '#fff', fontSize: 13, fontWeight: 800, cursor: applying === modal.id ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
                  {applying === modal.id ? '⟳ Submitting...' : 'Submit Application →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CardPage() {
  const [tab, setTab] = useState<'virtual' | 'physical'>('virtual')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [form, setForm] = useState({ address: '', city: '', country: '', zip: '', phone: '' })

  const handleApply = async () => {
    setApplying(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: '💳 Card Application Received',
      message: tab === 'virtual'
        ? 'Your virtual card application has been received. Your card will be ready within 24 hours after the activation fee is confirmed.'
        : 'Your physical card application has been received. Delivery takes 7-14 business days after the card fee is confirmed.',
      type: 'info',
    })
    setApplied(true)
    setApplying(false)
  }

  const VIRTUAL_CARDS = [
    {
      name: 'Standard Virtual Card',
      fee: '$150',
      color: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      accent: '#C9A84C',
      limit: '$10,000/month',
      features: ['Instant activation', 'Online payments', 'Apple Pay & Google Pay', 'Real-time notifications', 'Virtual card number', '3D Secure protection'],
      badge: null,
    },
    {
      name: 'Gold Virtual Card',
      fee: '$350',
      color: 'linear-gradient(135deg, #2d1b00, #5c3a00)',
      accent: '#C9A84C',
      limit: '$50,000/month',
      features: ['Priority activation', 'Global online payments', 'Apple Pay & Google Pay', 'Cashback rewards 2%', 'Multiple virtual cards', 'Concierge service', 'Travel insurance'],
      badge: 'POPULAR',
    },
    {
      name: 'Black Virtual Card',
      fee: '$750',
      color: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
      accent: '#e6edf3',
      limit: 'Unlimited',
      features: ['Instant VIP activation', 'Global unlimited payments', 'All digital wallets', 'Cashback rewards 5%', 'Unlimited virtual cards', 'Personal concierge 24/7', 'Airport lounge access', 'Premium travel insurance', 'No foreign fees'],
      badge: 'ELITE',
    },
  ]

  const PHYSICAL_CARDS = [
    {
      name: 'Standard Physical Card',
      fee: '$450',
      delivery: '$120 shipping',
      time: '10-14 business days',
      color: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      accent: '#C9A84C',
      limit: '$25,000/month',
      features: ['Chip & PIN security', 'Contactless payments', 'ATM withdrawals globally', 'Real-time notifications', '2% cashback', 'Fraud protection', 'Card replacement $75'],
      badge: null,
    },
    {
      name: 'Gold Physical Card',
      fee: '$850',
      delivery: '$200 express shipping',
      time: '5-7 business days',
      color: 'linear-gradient(135deg, #2d1b00, #5c3a00)',
      accent: '#C9A84C',
      limit: '$100,000/month',
      features: ['Premium metal card', 'Chip & biometric PIN', 'Priority ATM access', 'Real-time alerts', '3% cashback everywhere', 'Full fraud guarantee', 'Free card replacement', 'VIP airport lounges', 'Travel & medical cover'],
      badge: 'PREMIUM',
    },
    {
      name: 'Titanium Black Card',
      fee: '$2,500',
      delivery: '$500 private courier',
      time: '3-5 business days',
      color: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
      accent: '#e6edf3',
      limit: 'Unlimited',
      features: ['Titanium card (22g)', 'Biometric fingerprint PIN', 'Global ATM unlimited', 'Instant real-time alerts', '7% cashback all spend', 'Zero fraud liability', 'Lifetime free replacement', 'All lounge worldwide', 'Platinum travel cover', 'Personal shopper', 'Private banking access', 'Dedicated relationship manager'],
      badge: '👑 BLACK',
    },
  ]

  const cards = tab === 'virtual' ? VIRTUAL_CARDS : PHYSICAL_CARDS

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>CapitalMarket Pro Cards</div>
        <div style={{ fontSize: 13, color: '#8b949e' }}>Premium financial cards designed for serious traders and investors</div>
      </div>

      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: '28px 28px', marginBottom: 28, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        {/* Card mockup */}
        <div style={{ width: 240, height: 148, borderRadius: 16, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '1px solid rgba(201,168,76,0.4)', padding: 20, position: 'relative', flexShrink: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 700, letterSpacing: '0.1em' }}>CAPITALMARKET</div>
              <div style={{ fontSize: 8, color: '#484f58', letterSpacing: '0.15em' }}>PRO</div>
            </div>
            <div style={{ fontSize: 22 }}>💳</div>
          </div>
          <div style={{ fontSize: 13, color: '#e6edf3', letterSpacing: '0.15em', marginBottom: 14, fontFamily: 'monospace' }}>
            •••• •••• •••• 4821
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 8, color: '#484f58' }}>CARD HOLDER</div>
              <div style={{ fontSize: 11, color: '#e6edf3', fontWeight: 600 }}>J. SMITH</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: '#484f58' }}>EXPIRES</div>
              <div style={{ fontSize: 11, color: '#e6edf3' }}>12/28</div>
            </div>
            <div style={{ fontSize: 20, color: '#C9A84C', fontWeight: 800 }}>VISA</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3', marginBottom: 10 }}>
            Trade. Spend. Earn. <span style={{ color: '#C9A84C' }}>Everywhere.</span>
          </div>
          <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8, marginBottom: 16 }}>
            The CapitalMarket Pro card is your gateway to spending your crypto and investment returns anywhere in the world. Available in virtual and physical formats with industry-leading cashback rates.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['🌍 200+ Countries', '💰 Up to 7% Cashback', '🔒 Instant Freeze', '⚡ Real-time Alerts'].map(f => (
              <div key={f} style={{ fontSize: 12, color: '#C9A84C', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', padding: '4px 12px', borderRadius: 20 }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[{ id: 'virtual', label: '💳 Virtual Card' }, { id: 'physical', label: '🏦 Physical Card' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'physical' && (
        <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#f85149', lineHeight: 1.6 }}>
            ⚠ Physical cards require KYC verification. Shipping fees are non-refundable. International shipping includes customs duties where applicable. Delivery times are estimates and may vary.
          </div>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {cards.map((card: any) => (
          <div key={card.name} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
            {card.badge && (
              <div style={{ position: 'absolute', top: 14, right: 14, background: card.accent === '#e6edf3' ? '#1a1a1a' : 'rgba(201,168,76,0.2)', border: `1px solid ${card.accent}44`, color: card.accent, fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.08em' }}>
                {card.badge}
              </div>
            )}

            {/* Card visual */}
            <div style={{ background: card.color, padding: '24px 20px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              <div style={{ position: 'absolute', bottom: 10, right: 30, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              <div style={{ fontSize: 10, color: card.accent, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 16 }}>CAPITALMARKET PRO</div>
              <div style={{ fontSize: 13, color: '#8b949e', letterSpacing: '0.15em', marginBottom: 16, fontFamily: 'monospace' }}>•••• •••• •••• ••••</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 10, color: '#484f58' }}>CARD HOLDER NAME</div>
                <div style={{ fontSize: 16, color: card.accent, fontWeight: 800 }}>VISA</div>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 6 }}>{card.name}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: card.accent }}>{card.fee}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>activation fee</div>
              </div>

              {tab === 'physical' && (
                <div style={{ background: '#161b22', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 2 }}>📦 {(card as any).delivery}</div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>⏱ {(card as any).time}</div>
                </div>
              )}

              <div style={{ background: `${card.accent}0d`, border: `1px solid ${card.accent}22`, borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: '#484f58', marginBottom: 2 }}>MONTHLY LIMIT</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: card.accent }}>{card.limit}</div>
              </div>

              <div style={{ marginBottom: 18 }}>
                {card.features.map((f: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6, fontSize: 11, color: '#8b949e' }}>
                    <span style={{ color: card.accent, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>

              <button
                onClick={handleApply}
                disabled={applying || applied}
                style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: `1px solid ${card.accent}`, background: `${card.accent}0d`, color: card.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', opacity: applied ? 0.6 : 1 }}>
                {applied ? '✓ Application Sent' : applying ? 'Processing...' : `Apply — ${card.fee}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Why get a card */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 18 }}>Why get a CapitalMarket Pro Card?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { icon: '💸', title: 'Spend Your Profits', desc: 'Convert and spend your trading returns instantly at millions of merchants worldwide' },
            { icon: '🌍', title: 'Global Acceptance', desc: 'Use anywhere VISA is accepted — 200+ countries, 46M+ merchants' },
            { icon: '💰', title: 'Earn While Spending', desc: 'Up to 7% cashback on every transaction, automatically added to your account' },
            { icon: '🔒', title: 'Zero Fraud Liability', desc: 'Complete protection against unauthorized transactions with instant freeze capability' },
          ].map(item => (
            <div key={item.title} style={{ background: '#161b22', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#484f58', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
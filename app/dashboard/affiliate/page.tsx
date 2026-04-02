'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AffiliatePage() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [referrals, setReferrals] = useState<any[]>([])
  const [earnings, setEarnings] = useState(0)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'overview' | 'referrals' | 'earnings'>('overview')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email || '')

      const code = 'CMP' + user.id.slice(0, 8).toUpperCase()
      setReferralCode(code)
      setReferralLink(`https://capitalmarket-pro.com/register?ref=${code}`)

      const { data: refs } = await supabase
        .from('users')
        .select('id, email, full_name, created_at')
        .eq('referred_by', code)
      setReferrals(refs || [])
      setEarnings((refs?.length || 0) * 50)
    }
    init()
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const shareOnWhatsApp = () => window.open(`https://wa.me/?text=Join CapitalMarket Pro and start earning! ${referralLink}`)
  const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?text=I'm earning with CapitalMarket Pro! Join me and start investing: ${referralLink}`)
  const shareOnTelegram = () => window.open(`https://t.me/share/url?url=${referralLink}&text=Join CapitalMarket Pro and earn daily returns!`)

  const TIERS = [
    { name: 'Bronze', referrals: 0, commission: '10%', color: '#CD7F32', icon: '🥉', bonus: '$50/referral' },
    { name: 'Silver', referrals: 5, commission: '12%', color: '#8b949e', icon: '🥈', bonus: '$75/referral' },
    { name: 'Gold', referrals: 10, commission: '15%', color: '#C9A84C', icon: '🥇', bonus: '$100/referral' },
    { name: 'Platinum', referrals: 25, commission: '18%', color: '#0052FF', icon: '💎', bonus: '$150/referral' },
    { name: 'Diamond', referrals: 50, commission: '20%', color: '#7B2BF9', icon: '💠', bonus: '$200/referral' },
  ]

  const currentTier = TIERS.filter(t => referrals.length >= t.referrals).pop() || TIERS[0]
  const nextTier = TIERS.find(t => t.referrals > referrals.length)

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Affiliate Program</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Refer friends and earn commissions</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '👥', label: 'Referrals', value: referrals.length.toString(), color: '#C9A84C' },
          { icon: '💰', label: 'Earnings', value: `$${earnings.toLocaleString()}`, color: '#3fb950' },
          { icon: '🏆', label: 'Tier', value: currentTier.name, color: currentTier.color },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Current tier */}
      <div style={{ background: `linear-gradient(135deg, ${currentTier.color}15, ${currentTier.color}05)`, border: `1px solid ${currentTier.color}33`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Current Tier</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>{currentTier.icon}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: currentTier.color }}>{currentTier.name}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#484f58', marginBottom: 2 }}>Commission Rate</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: currentTier.color }}>{currentTier.commission}</div>
          </div>
        </div>
        {nextTier && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#484f58', marginBottom: 6 }}>
              <span>{referrals.length} referrals</span>
              <span>{nextTier.referrals} needed for {nextTier.name}</span>
            </div>
            <div style={{ height: 6, background: '#161b22', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (referrals.length / nextTier.referrals) * 100)}%`, background: `linear-gradient(90deg,${currentTier.color},${nextTier.color})`, borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Referral link */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>🔗 Your Referral Link</div>
        <div style={{ fontSize: 12, color: '#484f58', marginBottom: 14 }}>Share this link to earn {currentTier.commission} commission on every deposit</div>

        {/* Code */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 3 }}>Referral Code</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#C9A84C', letterSpacing: '0.1em' }}>{referralCode}</div>
          </div>
          <button onClick={copyLink} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
            Copy Code
          </button>
        </div>

        {/* Full link */}
        <div onClick={copyLink} style={{ background: '#161b22', border: `1px solid ${copied ? '#3fb950' : '#21262d'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', marginBottom: 16, wordBreak: 'break-all' }}>
          <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4 }}>Full Referral Link</div>
          <div style={{ fontSize: 11, color: '#C9A84C', lineHeight: 1.6 }}>{referralLink}</div>
          <div style={{ fontSize: 11, color: copied ? '#3fb950' : '#484f58', marginTop: 6, fontWeight: copied ? 700 : 400 }}>
            {copied ? '✅ Copied!' : '📋 Tap to copy'}
          </div>
        </div>

        {/* Share buttons */}
        <div style={{ fontSize: 11, color: '#484f58', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Share via:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { label: '💬 WhatsApp', color: '#25D366', action: shareOnWhatsApp },
            { label: '🐦 Twitter', color: '#1DA1F2', action: shareOnTwitter },
            { label: '✈️ Telegram', color: '#0088CC', action: shareOnTelegram },
          ].map(s => (
            <button key={s.label} onClick={s.action}
              style={{ padding: '11px 0', borderRadius: 10, border: `1px solid ${s.color}33`, background: `${s.color}0a`, color: s.color, fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tiers */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>🏆 Commission Tiers</div>
        {TIERS.map(tier => (
          <div key={tier.name} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #161b22', gap: 12 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{tier.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: tier.name === currentTier.name ? tier.color : '#e6edf3', marginBottom: 2 }}>
                {tier.name} {tier.name === currentTier.name && '← Current'}
              </div>
              <div style={{ fontSize: 11, color: '#484f58' }}>{tier.referrals}+ referrals · {tier.bonus}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: tier.color }}>{tier.commission}</div>
          </div>
        ))}
      </div>

      {/* Referrals list */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>
          Your Referrals ({referrals.length})
        </div>
        {referrals.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#484f58' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
            <div style={{ fontSize: 13 }}>No referrals yet. Share your link to start earning!</div>
          </div>
        ) : referrals.map((ref, i) => (
          <div key={ref.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: i < referrals.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
              {(ref.full_name || ref.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>{ref.full_name || 'Unknown'}</div>
              <div style={{ fontSize: 10, color: '#484f58' }}>Joined {new Date(ref.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3fb950' }}>+$50</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
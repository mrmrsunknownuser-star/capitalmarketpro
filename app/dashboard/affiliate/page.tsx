'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const TIERS = [
  { name: 'Bronze', referrals: 0, commission: '10%', color: '#CD7F32', icon: '🥉', bonus: '$50/referral' },
  { name: 'Silver', referrals: 5, commission: '12%', color: '#8b949e', icon: '🥈', bonus: '$75/referral' },
  { name: 'Gold', referrals: 10, commission: '15%', color: '#C9A84C', icon: '🥇', bonus: '$100/referral' },
  { name: 'Platinum', referrals: 25, commission: '18%', color: '#0052FF', icon: '💎', bonus: '$150/referral' },
  { name: 'Diamond', referrals: 50, commission: '20%', color: '#7B2BF9', icon: '💠', bonus: '$200/referral' },
]

export default function AffiliatePage() {
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [referrals, setReferrals] = useState<any[]>([])
  const [earnings, setEarnings] = useState(0)
  const [copied, setCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [tab, setTab] = useState<'overview' | 'referrals' | 'tiers'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      setUserEmail(user.email || '')

      const code = 'CMP' + user.id.slice(0, 8).toUpperCase()
      setReferralCode(code)
      setReferralLink(`https://capitalmarket-pro.com/register?ref=${code}`)

      // Fetch referrals
      const { data: refs } = await supabase
        .from('users')
        .select('id, email, full_name, created_at, status, kyc_status')
        .eq('referred_by', code)
        .order('created_at', { ascending: false })

      const refList = refs || []
      setReferrals(refList)

      // Calculate earnings — $50 per referral
      const totalEarnings = refList.length * 50
      setEarnings(totalEarnings)

      // Credit uncredited referrals
      if (refList.length > 0) {
        try {
          const { data: creditedRefs } = await supabase
            .from('referral_rewards')
            .select('referred_user_id')
            .eq('referrer_id', user.id)

          const creditedIds = new Set((creditedRefs || []).map((r: any) => r.referred_user_id))
          const uncredited = refList.filter(r => !creditedIds.has(r.id))

          for (const ref of uncredited) {
            // Insert reward record
            await supabase.from('referral_rewards').insert({
              referrer_id: user.id,
              referred_user_id: ref.id,
              amount: 50,
              status: 'credited',
            })

            // Credit $50 to balance
            const { data: bal } = await supabase
              .from('balances')
              .select('total_balance, available_balance, total_pnl')
              .eq('user_id', user.id)
              .single()

            await supabase.from('balances').upsert({
              user_id: user.id,
              total_balance: (bal?.total_balance || 0) + 50,
              available_balance: (bal?.available_balance || 0) + 50,
              total_pnl: (bal?.total_pnl || 0) + 50,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })

            // Notify user
            await supabase.from('notifications').insert({
              user_id: user.id,
              title: '🔗 Referral Bonus Credited!',
              message: `You earned $50 for referring ${ref.full_name || ref.email}! Keep sharing to earn more.`,
              type: 'success',
              is_read: false,
            })
          }
        } catch {}
      }

      setLoading(false)
    }
    init()
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 3000)
  }

  const currentTier = TIERS.filter(t => referrals.length >= t.referrals).pop() || TIERS[0]
  const nextTier = TIERS.find(t => t.referrals > referrals.length)

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Affiliate Program</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Refer friends and earn $50 per referral</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '👥', label: 'Total Referrals', value: referrals.length.toString(), color: '#C9A84C' },
          { icon: '💰', label: 'Total Earned', value: `$${earnings.toLocaleString()}`, color: '#3fb950' },
          { icon: '🏆', label: 'Current Tier', value: currentTier.name, color: currentTier.color },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 2 }}>{loading ? '...' : s.value}</div>
            <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Current tier card */}
      <div style={{ background: `linear-gradient(135deg,${currentTier.color}15,${currentTier.color}05)`, border: `1px solid ${currentTier.color}33`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Current Tier</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 26 }}>{currentTier.icon}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: currentTier.color }}>{currentTier.name}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>Commission Rate</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: currentTier.color }}>{currentTier.commission}</div>
            <div style={{ fontSize: 11, color: '#484f58' }}>{currentTier.bonus}</div>
          </div>
        </div>

        {nextTier ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#484f58', marginBottom: 6 }}>
              <span>{referrals.length} referrals</span>
              <span>{nextTier.referrals - referrals.length} more for {nextTier.name} {nextTier.icon}</span>
            </div>
            <div style={{ height: 6, background: '#161b22', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (referrals.length / nextTier.referrals) * 100)}%`, background: `linear-gradient(90deg,${currentTier.color},${nextTier.color})`, borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, color: currentTier.color, fontWeight: 700 }}>
            🎉 Maximum tier reached! You're getting the best commission rate!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {[{ id: 'overview', label: '🔗 Share & Earn' }, { id: 'referrals', label: `👥 My Referrals (${referrals.length})` }, { id: 'tiers', label: '🏆 Tiers' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div>
          {/* How it works */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>💡 How It Works</div>
            {[
              { n: '01', title: 'Share Your Link', desc: 'Share your unique referral link with friends, family, or on social media.' },
              { n: '02', title: 'They Sign Up', desc: 'When someone registers using your link, they become your referral.' },
              { n: '03', title: 'You Earn $50', desc: 'You automatically receive $50 credited to your account for each referral.' },
              { n: '04', title: 'Unlock Higher Tiers', desc: 'Refer more people to unlock higher commission tiers and earn up to $200 per referral.' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#C9A84C', flexShrink: 0 }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 3 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Referral Code */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>🔗 Your Referral Details</div>

            {/* Code */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Referral Code</div>
              <div style={{ background: '#161b22', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#C9A84C', letterSpacing: '0.12em' }}>{referralCode}</div>
                <button onClick={copyCode}
                  style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(201,168,76,0.3)', background: codeCopied ? 'rgba(63,185,80,0.1)' : 'rgba(201,168,76,0.1)', color: codeCopied ? '#3fb950' : '#C9A84C', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                  {codeCopied ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Full link */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Referral Link</div>
              <div onClick={copyLink}
                style={{ background: '#161b22', border: `1px solid ${copied ? '#3fb950' : '#21262d'}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ fontSize: 11, color: '#C9A84C', wordBreak: 'break-all', lineHeight: 1.6, marginBottom: 8 }}>{referralLink}</div>
                <div style={{ fontSize: 11, color: copied ? '#3fb950' : '#484f58', fontWeight: copied ? 700 : 400 }}>
                  {copied ? '✅ Copied to clipboard!' : '📋 Tap to copy full link'}
                </div>
              </div>
            </div>

            {/* Share buttons */}
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Share via:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
              {[
                { label: '💬 WhatsApp', color: '#25D366', url: `https://wa.me/?text=Join CapitalMarket Pro and start earning! Use my referral link: ${referralLink}` },
                { label: '🐦 Twitter', color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=I'm earning daily returns with CapitalMarket Pro! Join me: ${referralLink}` },
                { label: '✈️ Telegram', color: '#0088CC', url: `https://t.me/share/url?url=${referralLink}&text=Join CapitalMarket Pro!` },
                { label: '📘 Facebook', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${referralLink}` },
                { label: '💼 LinkedIn', color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${referralLink}` },
                { label: '📧 Email', color: '#C9A84C', url: `mailto:?subject=Join CapitalMarket Pro&body=I'm earning with CapitalMarket Pro! Join using my referral link: ${referralLink}` },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: `1px solid ${s.color}33`, background: `${s.color}0a`, color: s.color, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                    {s.label}
                  </button>
                </a>
              ))}
            </div>

            {/* Copy full button */}
            <button onClick={copyLink}
              style={{ width: '100%', padding: '13px 0', background: copied ? 'rgba(63,185,80,0.15)' : 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: copied ? '1px solid rgba(63,185,80,0.3)' : 'none', borderRadius: 12, color: copied ? '#3fb950' : '#060a0f', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              {copied ? '✅ Link Copied!' : '📋 Copy Referral Link'}
            </button>
          </div>

          {/* Earnings breakdown */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>💰 Earnings Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              {[
                { l: 'Per Referral', v: '$50', c: '#C9A84C', icon: '👤' },
                { l: 'Total Earned', v: `$${earnings}`, c: '#3fb950', icon: '💰' },
                { l: 'This Month', v: `$${referrals.filter(r => new Date(r.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length * 50}`, c: '#0052FF', icon: '📅' },
                { l: 'Pending Bonus', v: nextTier ? `$${(nextTier.referrals - referrals.length) * 50} to unlock` : '✅ Max tier!', c: '#7B2BF9', icon: '🎯' },
              ].map(item => (
                <div key={item.l} style={{ background: '#161b22', borderRadius: 10, padding: '14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: item.c, marginBottom: 2 }}>{item.v}</div>
                    <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>{item.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REFERRALS TAB */}
      {tab === 'referrals' && (
        <div>
          {referrals.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>No referrals yet</div>
              <div style={{ fontSize: 13, color: '#484f58', marginBottom: 20 }}>Share your link to start earning $50 per referral!</div>
              <button onClick={() => setTab('overview')}
                style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                Share Your Link →
              </button>
            </div>
          ) : (
            <div>
              <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#8b949e' }}>
                  Total: <strong style={{ color: '#e6edf3' }}>{referrals.length} referrals</strong>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#3fb950' }}>
                  +${earnings} earned
                </div>
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #161b22', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <span>User</span>
                  <span>Reward</span>
                </div>
                {referrals.map((ref, i) => (
                  <div key={ref.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < referrals.length - 1 ? '1px solid #161b22' : 'none', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#060a0f', flexShrink: 0 }}>
                      {(ref.full_name || ref.email || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ref.full_name || 'No name'}
                      </div>
                      <div style={{ fontSize: 10, color: '#484f58' }}>
                        Joined {new Date(ref.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#3fb950' }}>+$50</div>
                      <div style={{ fontSize: 9, color: ref.kyc_status === 'approved' ? '#3fb950' : '#F7A600', background: ref.kyc_status === 'approved' ? 'rgba(63,185,80,0.1)' : 'rgba(247,166,0,0.1)', padding: '2px 7px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                        {ref.kyc_status === 'approved' ? 'Verified' : 'Pending KYC'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TIERS TAB */}
      {tab === 'tiers' && (
        <div>
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>🏆 Commission Tiers</div>
            <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Refer more friends to unlock higher commission rates</div>

            {TIERS.map((tier, i) => {
              const isActive = tier.name === currentTier.name
              const isUnlocked = referrals.length >= tier.referrals
              return (
                <div key={tier.name} style={{ display: 'flex', alignItems: 'center', padding: '16px', marginBottom: 10, background: isActive ? `${tier.color}10` : '#161b22', border: `2px solid ${isActive ? tier.color : isUnlocked ? tier.color + '44' : '#21262d'}`, borderRadius: 12, position: 'relative', opacity: isUnlocked ? 1 : 0.6 }}>
                  {isActive && (
                    <div style={{ position: 'absolute', top: -10, right: 16, background: tier.color, color: '#060a0f', fontSize: 9, fontWeight: 800, padding: '2px 10px', borderRadius: 20 }}>CURRENT</div>
                  )}
                  <span style={{ fontSize: 28, marginRight: 14, flexShrink: 0 }}>{tier.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: isUnlocked ? tier.color : '#484f58' }}>{tier.name}</span>
                      {isUnlocked && <span style={{ fontSize: 10, color: '#3fb950', background: 'rgba(63,185,80,0.1)', padding: '1px 8px', borderRadius: 10 }}>✓ Unlocked</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>{tier.referrals}+ referrals · {tier.bonus}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: isUnlocked ? tier.color : '#484f58' }}>{tier.commission}</div>
                    <div style={{ fontSize: 9, color: '#484f58' }}>commission</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* How tiers work */}
          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 10 }}>📋 How Tiers Work</div>
            {[
              'Tiers unlock automatically as you reach referral milestones',
              'Higher tiers earn more per referral — up to $200 each',
              'All past referrals count toward your tier progress',
              'Commissions are credited instantly to your balance',
              'There is no limit to how many people you can refer',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#8b949e', alignItems: 'flex-start' }}>
                <span style={{ color: '#C9A84C', flexShrink: 0 }}>✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved</div>
      </div>
    </div>
  )
}
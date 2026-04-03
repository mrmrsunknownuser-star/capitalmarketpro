'use client'

interface Props {
  balance: number
  kycStatus: string
  referrals?: number
}

export default function Achievements({ balance, kycStatus, referrals = 0 }: Props) {
  const achievements = [
    {
      id: 'first_deposit',
      icon: '💰',
      title: 'First Deposit',
      desc: 'Made your first deposit',
      unlocked: balance > 0,
      color: '#C9A84C',
    },
    {
      id: 'kyc_verified',
      icon: '✅',
      title: 'Verified Trader',
      desc: 'Completed KYC verification',
      unlocked: kycStatus === 'approved',
      color: '#3fb950',
    },
    {
      id: 'investor_1k',
      icon: '📈',
      title: 'Rising Investor',
      desc: 'Portfolio reached $1,000',
      unlocked: balance >= 1000,
      color: '#0052FF',
    },
    {
      id: 'investor_10k',
      icon: '🏆',
      title: 'Power Investor',
      desc: 'Portfolio reached $10,000',
      unlocked: balance >= 10000,
      color: '#C9A84C',
    },
    {
      id: 'investor_100k',
      icon: '👑',
      title: 'Elite Investor',
      desc: 'Portfolio reached $100,000',
      unlocked: balance >= 100000,
      color: '#7B2BF9',
    },
    {
      id: 'referral_first',
      icon: '🔗',
      title: 'First Referral',
      desc: 'Referred your first friend',
      unlocked: referrals >= 1,
      color: '#F7A600',
    },
  ]

  const unlocked = achievements.filter(a => a.unlocked).length

  return (
    <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 16, padding: 20, marginBottom: 24, fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>🏅 Achievements</div>
          <div style={{ fontSize: 11, color: '#484f58' }}>{unlocked}/{achievements.length} unlocked</div>
        </div>
        <div style={{ background: '#161b22', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#C9A84C' }}>
          {unlocked} / {achievements.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#161b22', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(unlocked / achievements.length) * 100}%`, background: 'linear-gradient(90deg,#C9A84C,#E8D08C)', borderRadius: 2, transition: 'width 0.8s ease' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {achievements.map(a => (
          <div key={a.id} style={{ background: a.unlocked ? `${a.color}0d` : '#161b22', border: `1px solid ${a.unlocked ? a.color + '33' : '#21262d'}`, borderRadius: 12, padding: '12px 10px', textAlign: 'center', position: 'relative', opacity: a.unlocked ? 1 : 0.5 }}>
            {a.unlocked && (
              <div style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', background: '#3fb950', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 800 }}>✓</div>
            )}
            <div style={{ fontSize: 24, marginBottom: 6, filter: a.unlocked ? 'none' : 'grayscale(100%)' }}>{a.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: a.unlocked ? a.color : '#484f58', marginBottom: 3 }}>{a.title}</div>
            <div style={{ fontSize: 9, color: '#484f58', lineHeight: 1.4 }}>{a.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
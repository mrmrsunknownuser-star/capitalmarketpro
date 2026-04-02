'use client'

import Link from 'next/link'

const TEAM = [
  { initials: 'RK', name: 'Robert K. Hayes', role: 'Chief Executive Officer', color: '#0052FF', exp: '18yr', desc: 'Ex-BlackRock Managing Director with 18 years leading global investment platforms across 40+ countries.' },
  { initials: 'JE', name: 'Joshua C. Elder', role: 'Account Manager', color: '#C9A84C', exp: '14yr', desc: 'Former Goldman Sachs VP. Your dedicated guide to maximizing returns on CapitalMarket Pro.' },
  { initials: 'SC', name: 'Sophia C. Laurent', role: 'Chief Crypto Strategist', color: '#F7A600', exp: '11yr', desc: 'Pioneer Bitcoin strategist managing $800M+ in digital assets.' },
  { initials: 'MO', name: 'Marcus O. Sterling', role: 'Head of Stock Trading', color: '#3fb950', exp: '9yr', desc: 'Former Morgan Stanley analyst specializing in high-growth tech.' },
]

export default function AboutPage() {
  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0d1117,#161b22)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: 28, marginBottom: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%)' }} />
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: '#060a0f', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}>C</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
          <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
          <span style={{ color: '#e6edf3' }}> Pro</span>
        </div>
        <div style={{ fontSize: 11, color: '#484f58', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Professional Trading Platform</div>
        <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, maxWidth: 480, margin: '0 auto' }}>
          Founded in 2018 by Wall Street veterans, quant researchers, and blockchain engineers with one mission — make professional-grade investing accessible to everyone.
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { v: '$2.4B+', l: 'Assets Managed', c: '#C9A84C' },
          { v: '150K+', l: 'Active Traders', c: '#3fb950' },
          { v: '60+', l: 'Countries', c: '#0052FF' },
          { v: '6 Years', l: 'Track Record', c: '#7B2BF9' },
        ].map(s => (
          <div key={s.l} style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: '18px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 14 }}>🎯 Our Mission</div>
        <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9, marginBottom: 14 }}>
          CapitalMarket Pro was built to democratize professional investing. We combine cutting-edge AI technology with institutional-grade trading infrastructure to deliver consistent returns for everyday investors.
        </p>
        <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9 }}>
          Our AI algorithm analyzes millions of data points per second across cryptocurrency and stock markets, executing thousands of trades daily to maximize your returns while minimizing risk.
        </p>
      </div>

      {/* How it works */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>🤖 How It Works</div>
        {[
          { n: '01', title: 'You Deposit', desc: 'Send Bitcoin to your unique wallet. Funds confirmed in under 30 minutes.' },
          { n: '02', title: 'AI Activates', desc: 'Our algorithm begins trading your funds across 200+ markets immediately.' },
          { n: '03', title: 'Daily Returns', desc: 'Profits are credited to your dashboard every 24 hours automatically.' },
          { n: '04', title: 'You Withdraw', desc: 'Request a withdrawal anytime. Funds sent to your wallet within 48 hours.' },
        ].map(step => (
          <div key={step.n} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#C9A84C', flexShrink: 0 }}>{step.n}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{step.title}</div>
              <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Team */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>👥 Leadership Team</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TEAM.map(member => (
            <div key={member.name} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px', background: '#161b22', borderRadius: 12, border: `1px solid ${member.color}22` }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg,${member.color},${member.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f', flexShrink: 0, border: `2px solid ${member.color}44` }}>
                {member.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{member.name}</div>
                <div style={{ fontSize: 11, color: member.color, fontWeight: 600, marginBottom: 6 }}>{member.role} · {member.exp} experience</div>
                <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.7 }}>{member.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 16 }}>🔒 Security & Compliance</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '🛡', title: '256-bit SSL', desc: 'Military-grade encryption' },
            { icon: '🔐', title: 'Cold Storage', desc: '95% of funds offline' },
            { icon: '✅', title: 'KYC/AML', desc: 'Full compliance' },
            { icon: '💎', title: 'SOC 2 Type II', desc: 'Certified security' },
            { icon: '🌍', title: 'FCA Authorized', desc: 'UK regulated' },
            { icon: '⚖️', title: 'SEC Registered', desc: 'US compliant' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.1),rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: 24, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>Ready to Start Growing?</div>
        <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16, lineHeight: 1.7 }}>Join 150,000+ traders already earning with CapitalMarket Pro</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard/invest">
            <button style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              View Investment Plans →
            </button>
          </Link>
          <Link href="/dashboard/support">
            <button style={{ padding: '11px 24px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'transparent', color: '#C9A84C', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
              Talk to Joshua →
            </button>
          </Link>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58', lineHeight: 1.7 }}>
          © 2025 CapitalMarket Pro Financial Services<br />All Rights Reserved · EST. 2018
        </div>
      </div>
    </div>
  )
}
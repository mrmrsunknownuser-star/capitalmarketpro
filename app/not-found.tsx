import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      fontFamily: 'monospace',
      background: '#060a0f',
      color: '#e6edf3',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        {/* Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', marginBottom: 24, fontSize: 28, fontWeight: 800, color: '#060a0f' }}>
          C
        </div>

        {/* 404 */}
        <div style={{ fontSize: 96, fontWeight: 800, color: '#161b22', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.04em' }}>
          404
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 12 }}>
          Page Not Found
        </div>

        <p style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.8, marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Links */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/">
            <button style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              ← Back to Home
            </button>
          </Link>
          <Link href="/dashboard">
            <button style={{ padding: '12px 28px', borderRadius: 10, border: '1px solid #21262d', background: 'transparent', color: '#e6edf3', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
              Go to Dashboard
            </button>
          </Link>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 40, padding: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12 }}>
          <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Quick Links</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Login', href: '/login' },
              { label: 'Register', href: '/register' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Signals', href: '/dashboard/signals' },
              { label: 'Support', href: '/dashboard/support' },
              { label: 'Terms', href: '/terms' },
            ].map(item => (
              <Link key={item.label} href={item.href}>
                <span style={{ fontSize: 12, color: '#C9A84C', cursor: 'pointer' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 11, color: '#484f58' }}>
          © 2025 CapitalMarket Pro · Professional Trading Platform
        </div>
      </div>
    </div>
  )
}
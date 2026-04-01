'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const INVESTMENT_PLANS = [
  { name: 'Starter', min: '$200', roi: '5%', duration: '7 Days', total: '35%', color: '#8b949e', icon: '🌱' },
  { name: 'Silver', min: '$1,000', roi: '8%', duration: '14 Days', total: '112%', color: '#8b949e', icon: '🥈' },
  { name: 'Gold', min: '$5,000', roi: '12%', duration: '21 Days', total: '252%', color: '#C9A84C', icon: '🥇', popular: true },
  { name: 'Platinum', min: '$20,000', roi: '15%', duration: '30 Days', total: '450%', color: '#0052FF', icon: '💎' },
  { name: 'Elite', min: '$50,000', roi: '20%', duration: '30 Days', total: '600%', color: '#7B2BF9', icon: '👑' },
  { name: 'Black', min: '$100,000', roi: '25%', duration: '30 Days', total: '750%', color: '#e6edf3', icon: '🖤' },
]

const SIGNAL_PLANS = [
  { name: 'Basic', price: '$99', color: '#8b949e', signals: '5/day', features: ['Crypto signals', 'Email alerts'] },
  { name: 'Pro', price: '$199', color: '#0052FF', signals: '15/day', popular: true, features: ['Crypto + Stocks', 'Push alerts'] },
  { name: 'Elite', price: '$349', color: '#C9A84C', signals: '30/day', features: ['All markets', 'Priority'] },
  { name: 'VIP', price: '$599', color: '#7B2BF9', signals: '∞', features: ['Unlimited', '1-on-1 calls'] },
]

type ModalData = { title: string; amount: string; color: string } | null

function PurchaseModal({ modal, onClose }: { modal: ModalData; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [btcAddress, setBtcAddress] = useState('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')

  useEffect(() => {
    const fetchAddr = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('platform_settings').select('value').eq('key', 'general').single()
      if (data?.value?.btcAddress) setBtcAddress(data.value.btcAddress)
    }
    fetchAddr()
  }, [])

  if (!modal) return null

  const providers = [
    { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', url: 'https://www.moonpay.com/buy/btc' },
    { name: 'Binance', icon: '🔶', color: '#F7A600', url: 'https://www.binance.com/en/crypto/buy/USD/BTC' },
    { name: 'Coinbase', icon: '🔵', color: '#0052FF', url: 'https://www.coinbase.com/buy-bitcoin' },
    { name: 'Paybis', icon: '💳', color: '#00C2FF', url: 'https://paybis.com/buy-bitcoin/' },
  ]

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 20, width: '100%', maxWidth: 440, padding: 24, fontFamily: 'monospace', maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>Activate {modal.title}</div>
            <div style={{ fontSize: 11, color: '#484f58', marginTop: 2 }}>Min. {modal.amount}</div>
          </div>
          <button onClick={onClose} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 22 }}>
          {[{ n: 1, l: 'Notice' }, { n: 2, l: 'Provider' }, { n: 3, l: 'Send BTC' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: step > s.n ? modal.color : step === s.n ? `${modal.color}22` : '#161b22', border: `2px solid ${step >= s.n ? modal.color : '#21262d'}`, color: step > s.n ? '#060a0f' : step === s.n ? modal.color : '#484f58' }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 9, color: step === s.n ? modal.color : '#484f58', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{s.l}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? modal.color : '#21262d', margin: '0 6px' }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
              <p style={{ fontSize: 13, color: '#c9d1d9', lineHeight: 1.9, margin: 0 }}>
                To avoid <strong style={{ color: '#C9A84C' }}>loss of trades</strong>, we use <strong style={{ color: '#C9A84C' }}>Bitcoin</strong> for funding. This ensures <strong style={{ color: '#C9A84C' }}>fast processing</strong> aligned with our automated system.
              </p>
            </div>
            {[{ l: '⚡ Processing', v: 'Under 30 minutes' }, { l: '🔒 Network', v: 'Bitcoin (BTC)' }, { l: '📋 Minimum', v: modal.amount }, { l: '💰 Fee', v: '0% — Free' }].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22' }}>
                <span style={{ fontSize: 12, color: '#8b949e' }}>{item.l}</span>
                <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 600 }}>{item.v}</span>
              </div>
            ))}
            <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: 16, padding: '13px 0', background: `linear-gradient(135deg, ${modal.color}, ${modal.color}cc)`, border: 'none', borderRadius: 12, color: modal.color === '#e6edf3' ? '#060a0f' : '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
              I Understand — Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: 12, color: '#8b949e', marginBottom: 14 }}>Choose a provider to buy Bitcoin:</p>
            {providers.map(p => (
              <div key={p.name} onClick={() => { setProvider(p); setStep(3) }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: `${p.color}0d`, border: `1px solid ${p.color}33`, borderRadius: 12, marginBottom: 10, cursor: 'pointer' }}>
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', flex: 1 }}>{p.name}</span>
                <span style={{ color: p.color, fontWeight: 700 }}>→</span>
              </div>
            ))}
            <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: 6, padding: '11px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
          </>
        )}

        {step === 3 && provider && (
          <>
            <a href={provider.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: `${provider.color}0d`, border: `1px solid ${provider.color}33`, borderRadius: 12 }}>
                <span style={{ fontSize: 22 }}>{provider.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>Buy BTC on {provider.name}</div>
                  <div style={{ fontSize: 11, color: '#484f58' }}>Opens in new tab</div>
                </div>
                <span style={{ color: provider.color, fontWeight: 700 }}>Open →</span>
              </div>
            </a>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>Send BTC to activate your plan:</div>
            <div onClick={() => { navigator.clipboard.writeText(btcAddress); setCopied(true); setTimeout(() => setCopied(false), 2500) }}
              style={{ background: '#161b22', border: `1px solid ${copied ? '#3fb950' : '#21262d'}`, borderRadius: 12, padding: 14, marginBottom: 12, cursor: 'pointer' }}>
              <div style={{ fontSize: 10, color: '#484f58', marginBottom: 6, textTransform: 'uppercase' }}>Bitcoin Address</div>
              <div style={{ fontSize: 11, color: '#C9A84C', wordBreak: 'break-all', lineHeight: 1.6 }}>{btcAddress}</div>
              <div style={{ marginTop: 8, fontSize: 10, color: copied ? '#3fb950' : '#484f58' }}>{copied ? '✓ Copied!' : '📋 Tap to copy'}</div>
            </div>
            <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#f85149' }}>⚠ Send BTC only. Wrong asset = permanent loss.</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ padding: '12px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 12, color: '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>← Back</button>
              <button onClick={onClose} style={{ padding: '12px 0', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', border: 'none', borderRadius: 12, color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>✓ Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const [profileName, setProfileName] = useState('Trader')
  const [balance, setBalance] = useState<any>(null)
  const [kycStatus, setKycStatus] = useState('none')
  const [modal, setModal] = useState<ModalData>(null)
  const [hideBalance, setHideBalance] = useState(false)
  const [joshuaPhoto, setJoshuaPhoto] = useState<string | null>(null)
  const [liveAssets, setLiveAssets] = useState([
    { name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#F7A600', price: 67240, change: 2.4 },
    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: '#627EEA', price: 3480, change: 1.8 },
    { name: 'Solana', symbol: 'SOL', icon: '◎', color: '#9945FF', price: 142.30, change: 5.2 },
    { name: 'BNB', symbol: 'BNB', icon: '●', color: '#F7A600', price: 412.80, change: -0.8 },
    { name: 'XRP', symbol: 'XRP', icon: '✕', color: '#346AA9', price: 0.624, change: 4.1 },
    { name: 'ADA', symbol: 'ADA', icon: '◆', color: '#0033AD', price: 0.482, change: 2.8 },
  ])
  const [activeTab, setActiveTab] = useState(0)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, kyc_status')
        .eq('id', user.id)
        .single()

      // Fetch balance
      const { data: bal } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Fetch Joshua photo
      const { data: jd } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('email', 'admin@capitalmarketpro.com')
        .single()

      if (jd?.avatar_url) setJoshuaPhoto(jd.avatar_url)
      setBalance(bal)
      setKycStatus(profile?.kyc_status || 'none')

      const name = profile?.full_name || user?.user_metadata?.full_name || ''
      setProfileName(name ? name.split(' ')[0] : user.email?.split('@')[0] || 'Trader')

      // ── REALTIME: Balance updates ──
      channelRef.current = supabase
        .channel(`home-balance-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'balances',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setBalance(payload.new as any)
        })
        .subscribe()

      // ── REALTIME: KYC / profile updates ──
      supabase
        .channel(`home-profile-${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        }, (payload) => {
          const u = payload.new as any
          if (u.kyc_status) setKycStatus(u.kyc_status)
          if (u.full_name) setProfileName(u.full_name.split(' ')[0])
        })
        .subscribe()
    }

    init()

    // Live price updates
    const priceInterval = setInterval(() => {
      setLiveAssets(prev => prev.map(a => ({
        ...a,
        price: a.price * (1 + (Math.random() - 0.5) * 0.002),
        change: a.change + (Math.random() - 0.5) * 0.1,
      })))
    }, 3000)

    return () => {
      clearInterval(priceInterval)
      const supabase = createClient()
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  const totalBalance = balance?.total_balance || 0
  const totalPnl = balance?.total_pnl || 0

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>
      <style>{`
        .plans-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .signal-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        @media (max-width: 600px) {
          .plans-grid { grid-template-columns: 1fr 1fr !important; }
          .signal-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .plans-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── PORTFOLIO HEADER ── */}
      <div style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)', borderRadius: 20, padding: '24px 20px', marginBottom: 20, border: '1px solid rgba(201,168,76,0.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#8b949e' }}>
            Welcome back, <span style={{ color: '#C9A84C', fontWeight: 700 }}>{profileName}</span> 👋
          </div>
          <button onClick={() => setHideBalance(!hideBalance)} style={{ background: 'none', border: 'none', color: '#484f58', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {hideBalance ? '👁 Show' : '🙈 Hide'}
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Total Portfolio</div>
          <div style={{ fontSize: 38, fontWeight: 800, color: '#e6edf3', lineHeight: 1, marginBottom: 6 }}>
            {hideBalance ? '$ ••••••' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: totalPnl >= 0 ? '#3fb950' : '#f85149', fontWeight: 600 }}>
              {totalPnl >= 0 ? '▲' : '▼'} {hideBalance ? '••••' : `$${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
            <span style={{ fontSize: 11, color: '#484f58' }}>all time profit</span>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around' }}>
          {[
            { icon: '⬇', label: 'Deposit', href: '/dashboard/deposit', color: '#3fb950' },
            { icon: '⬆', label: 'Withdraw', href: '/dashboard/withdraw', color: '#f85149' },
            { icon: '🔄', label: 'Trade', href: '/dashboard/trade', color: '#0052FF' },
            { icon: '📊', label: 'Market', href: '/dashboard/market', color: '#C9A84C' },
          ].map(action => (
            <Link key={action.label} href={action.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${action.color}18`, border: `1px solid ${action.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {action.icon}
              </div>
              <span style={{ fontSize: 11, color: '#8b949e' }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* KYC Banner */}
      {kycStatus !== 'approved' && (
        <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f85149', marginBottom: 2 }}>🪪 Complete Identity Verification</div>
            <div style={{ fontSize: 11, color: '#8b949e' }}>Unlock withdrawals and full platform access</div>
          </div>
          <Link href="/dashboard/kyc">
            <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #f85149', background: 'rgba(248,81,73,0.1)', color: '#f85149', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>Verify Now →</button>
          </Link>
        </div>
      )}

      {/* ── LIVE ASSETS ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>Assets</div>
          <Link href="/dashboard/market" style={{ textDecoration: 'none', fontSize: 12, color: '#C9A84C' }}>View all →</Link>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: '#0d1117', border: '1px solid #161b22', borderRadius: 10, padding: 3 }}>
          {['Crypto', 'Wallets'].map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', background: activeTab === i ? '#161b22' : 'transparent', color: activeTab === i ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: activeTab === i ? 700 : 400 }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
            {liveAssets.map((asset, i) => (
              <Link key={asset.symbol} href="/dashboard/market" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < liveAssets.length - 1 ? '1px solid #161b22' : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${asset.color}18`, border: `1px solid ${asset.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: asset.color, marginRight: 14, flexShrink: 0 }}>
                    {asset.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{asset.name}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>{asset.symbol}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>
                      ${asset.price.toFixed(asset.price < 10 ? 4 : 2)}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: asset.change >= 0 ? '#3fb950' : '#f85149' }}>
                      {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.change).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💼</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>No Wallets Connected</div>
            <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16 }}>Deposit funds to get started</div>
            <Link href="/dashboard/deposit">
              <button style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                Deposit Funds →
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ── AI BANNER ── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 32 }}>🤖</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>AI Trading System — Active 24/7</div>
          <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7 }}>Our algorithm is trading right now. Activate a plan below to earn daily returns automatically.</div>
        </div>
        <Link href="/dashboard/invest">
          <button style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
            Invest →
          </button>
        </Link>
      </div>

      {/* ── INVESTMENT PLANS ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>💹 Investment Plans</div>
          <Link href="/dashboard/invest" style={{ textDecoration: 'none', fontSize: 12, color: '#C9A84C' }}>View all →</Link>
        </div>
        <div className="plans-grid">
          {INVESTMENT_PLANS.map(plan => (
            <div key={plan.name}
              onClick={() => setModal({ title: `${plan.name} Plan`, amount: plan.min, color: plan.color })}
              style={{ background: '#0d1117', border: `1px solid ${plan.color}33`, borderRadius: 14, padding: 16, cursor: 'pointer', position: 'relative' }}>
              {(plan as any).popular && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#060a0f', fontSize: 8, fontWeight: 800, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>⭐ POPULAR</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 800, color: plan.color, textTransform: 'uppercase', marginBottom: 10 }}>{plan.icon} {plan.name}</div>
              <div style={{ background: `${plan.color}18`, borderRadius: 8, padding: '10px', textAlign: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: plan.color, lineHeight: 1 }}>{plan.roi}</div>
                <div style={{ fontSize: 9, color: '#8b949e', marginTop: 3 }}>Daily · {plan.total} Total</div>
              </div>
              <div style={{ fontSize: 10, color: '#484f58', textAlign: 'center', marginBottom: 10 }}>
                Min: <span style={{ color: '#e6edf3', fontWeight: 600 }}>{plan.min}</span>
              </div>
              <button style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: `1px solid ${plan.color}`, background: `${plan.color}0d`, color: plan.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                Invest →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── SIGNAL PLANS ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>⚡ Signal Plans</div>
          <Link href="/dashboard/signals" style={{ textDecoration: 'none', fontSize: 12, color: '#C9A84C' }}>View →</Link>
        </div>
        <div className="signal-grid">
          {SIGNAL_PLANS.map(plan => (
            <div key={plan.name}
              onClick={() => setModal({ title: `${plan.name} Signal Plan`, amount: plan.price + '/mo', color: plan.color })}
              style={{ background: (plan as any).popular ? 'rgba(0,82,255,0.06)' : '#0d1117', border: `2px solid ${(plan as any).popular ? plan.color : plan.color + '33'}`, borderRadius: 14, padding: 16, cursor: 'pointer', position: 'relative' }}>
              {(plan as any).popular && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#0052FF', color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>POPULAR</div>
              )}
              <div style={{ fontSize: 10, fontWeight: 800, color: plan.color, textTransform: 'uppercase', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3' }}>{plan.price}</span>
                <span style={{ fontSize: 10, color: '#484f58' }}>/mo</span>
              </div>
              <div style={{ fontSize: 11, color: plan.color, fontWeight: 700, marginBottom: 8 }}>{plan.signals}</div>
              {plan.features.map((f, i) => (
                <div key={i} style={{ fontSize: 10, color: '#8b949e', marginBottom: 3, display: 'flex', gap: 4 }}>
                  <span style={{ color: plan.color }}>✓</span>{f}
                </div>
              ))}
              <button style={{ width: '100%', marginTop: 10, padding: '8px 0', borderRadius: 8, border: `1px solid ${plan.color}`, background: (plan as any).popular ? plan.color : `${plan.color}0d`, color: (plan as any).popular ? '#fff' : plan.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                Subscribe →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── MANUAL TRADING & CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>📈</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>Manual Trading</div>
          <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7, marginBottom: 14 }}>Trade with up to 100x leverage. Fund via Bitcoin or Apple Pay.</div>
          <Link href="/dashboard/market">
            <button style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.1)', color: '#3fb950', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              Start Trading →
            </button>
          </Link>
        </div>
        <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>💳</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e6edf3', marginBottom: 6 }}>Pro Cards</div>
          <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7, marginBottom: 14 }}>VISA cards with up to 7% cashback. Spend profits worldwide.</div>
          <Link href="/dashboard/card">
            <button style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              Get Card →
            </button>
          </Link>
        </div>
      </div>

      {/* ── ACCOUNT MANAGER ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3', marginBottom: 14 }}>👤 Your Account Manager</div>
        <div style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#060a0f', border: '3px solid rgba(201,168,76,0.4)', overflow: 'hidden' }}>
                {joshuaPhoto ? <img src={joshuaPhoto} alt="Joshua" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'JE'}
              </div>
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: '#3fb950', border: '2px solid #0d1117' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>Joshua C. Elder</div>
                <div style={{ fontSize: 9, color: '#3fb950', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>● ONLINE</div>
              </div>
              <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, marginBottom: 8 }}>Account Manager · Senior Portfolio Manager</div>
              <div style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.8, marginBottom: 12 }}>
                Former Goldman Sachs VP with <strong style={{ color: '#e6edf3' }}>14+ years</strong> managing over <strong style={{ color: '#C9A84C' }}>$2.4B</strong> in assets. Your dedicated guide to maximizing returns.
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {['✓ CFA Certified', '✓ Goldman Sachs', '✓ SEC Registered'].map(c => (
                  <div key={c} style={{ fontSize: 10, color: '#8b949e', background: '#161b22', border: '1px solid #21262d', padding: '3px 8px', borderRadius: 6 }}>{c}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/dashboard/support">
                  <button style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                    💬 Message Joshua
                  </button>
                </Link>
                <Link href="/dashboard/invest">
                  <button style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(201,168,76,0.3)', background: 'transparent', color: '#C9A84C', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                    💹 View Plans
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e6edf3' }}>Recent Activity</div>
          <Link href="/dashboard/trades" style={{ textDecoration: 'none', fontSize: 12, color: '#C9A84C' }}>View all →</Link>
        </div>
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
          {[
            { type: 'BUY', asset: 'BTC/USD', amount: '$12,400', pnl: '+$1,240', time: '2h ago', icon: '₿' },
            { type: 'SELL', asset: 'ETH/USDT', amount: '$4,800', pnl: '+$320', time: '4h ago', icon: 'Ξ' },
            { type: 'EARN', asset: 'Investment', amount: '$8,120', pnl: '+$974', time: '6h ago', icon: '🤖' },
            { type: 'EARN', asset: 'Affiliate', amount: '$248', pnl: '+$248', time: '8h ago', icon: '🔗' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < 3 ? '1px solid #161b22' : 'none', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.type === 'BUY' ? 'rgba(63,185,80,0.1)' : t.type === 'SELL' ? 'rgba(248,81,73,0.1)' : 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {t.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 2 }}>{t.asset}</div>
                <div style={{ fontSize: 10, color: '#484f58' }}>{t.type} · {t.time}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.pnl.startsWith('+') ? '#3fb950' : '#f85149' }}>{t.pnl}</div>
                <div style={{ fontSize: 11, color: '#484f58' }}>{t.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PurchaseModal modal={modal} onClose={() => setModal(null)} />
    </div>
  )
}
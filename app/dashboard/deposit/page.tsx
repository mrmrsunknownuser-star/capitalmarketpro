'use client'

import { useState } from 'react'

const providers = [
  { name: 'MoonPay', icon: '🌙', color: '#7B2BF9', desc: 'Buy crypto instantly with card or bank', url: 'https://www.moonpay.com/buy/btc', tag: 'Most Popular' },
  { name: 'Binance', icon: '🔶', color: '#F7A600', desc: 'Use your Binance account to send BTC', url: 'https://www.binance.com/en/crypto/buy/USD/BTC', tag: 'Low Fees' },
  { name: 'Paybis', icon: '💳', color: '#00C2FF', desc: 'Fast crypto purchase with 100+ methods', url: 'https://paybis.com/buy-bitcoin/', tag: 'Fast' },
  { name: 'Coinbase', icon: '🔵', color: '#0052FF', desc: "America's most trusted crypto platform", url: 'https://www.coinbase.com/buy-bitcoin', tag: 'Trusted' },
  { name: 'Simplex', icon: '⬡', color: '#00B386', desc: 'Buy BTC with zero fraud liability', url: 'https://www.simplex.com/buy-bitcoin', tag: 'Secure' },
  { name: 'Transak', icon: '🌐', color: '#C9A84C', desc: 'Global fiat-to-crypto gateway', url: 'https://transak.com/buy/btc', tag: 'Global' },
]

const BTC_ADDRESS = '14xH4BQwiMneJ5emzCfJ7znAL2ms3FDpYC'
const ETH_ADDRESS = '0x216071D242175C52FF67F74D4C150E367D7Cc8b5'

export default function DepositPage() {
  const [step, setStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(BTC_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ padding: 24, maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Deposit Funds</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Fund your account securely via Bitcoin</div>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
        {[{ n: 1, label: 'Notice' }, { n: 2, label: 'Provider' }, { n: 3, label: 'Send BTC' }].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: step > s.n ? '#C9A84C' : step === s.n ? 'rgba(201,168,76,0.15)' : '#161b22', border: `2px solid ${step >= s.n ? '#C9A84C' : '#21262d'}`, color: step > s.n ? '#060a0f' : step === s.n ? '#C9A84C' : '#484f58' }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontSize: 10, color: step === s.n ? '#C9A84C' : '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? '#C9A84C' : '#21262d' }} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Notice */}
      {step === 1 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
            <p style={{ fontSize: 14, color: '#c9d1d9', lineHeight: 1.8, margin: 0 }}>
              To avoid <strong style={{ color: '#C9A84C' }}>loss of trades</strong> or missing{' '}
              <strong style={{ color: '#C9A84C' }}>profitable market signals</strong>, we make use of{' '}
              <strong style={{ color: '#C9A84C' }}>cryptocurrency (Bitcoin preferably)</strong> for funding brokerage accounts.
              This method ensures <strong style={{ color: '#C9A84C' }}>fast processing</strong> and aligns with the trading
              system's <strong style={{ color: '#C9A84C' }}>automated strategy</strong>.
            </p>
          </div>

          {[
            { label: '⚡ Processing Time', value: 'Under 30 minutes' },
            { label: '🔒 Network', value: 'Bitcoin (BTC) — Recommended' },
            { label: '📋 Minimum Deposit', value: '$100 equivalent' },
            { label: '💰 Deposit Fee', value: '0% — No fees charged' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #161b22' }}>
              <span style={{ fontSize: 12, color: '#8b949e' }}>{item.label}</span>
              <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}

          <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: 20, padding: '13px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            I Understand — Continue →
          </button>
        </div>
      )}

      {/* Step 2 — Choose Provider */}
      {step === 2 && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 20 }}>
            Choose a platform to purchase Bitcoin, then send it to your deposit address.
          </div>
          {providers.map(p => (
            <div key={p.name} onClick={() => { setSelectedProvider(p); setStep(3) }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: `${p.color}0d`, border: `1px solid ${p.color}33`, borderRadius: 10, marginBottom: 10, cursor: 'pointer', transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${p.color}18`, border: `1px solid ${p.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{p.name}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: p.color, background: `${p.color}18`, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.08em' }}>{p.tag}</span>
                </div>
                <div style={{ fontSize: 11, color: '#8b949e' }}>{p.desc}</div>
              </div>
              <span style={{ color: '#484f58', fontSize: 16 }}>›</span>
            </div>
          ))}
          <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: 8, padding: '11px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 10, color: '#8b949e', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        </div>
      )}

      {/* Step 3 — Send BTC */}
      {step === 3 && selectedProvider && (
        <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24 }}>
          <div style={{ background: `${selectedProvider.color}0d`, border: `1px solid ${selectedProvider.color}33`, borderRadius: 10, padding: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{selectedProvider.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>Step 1 — Buy BTC on {selectedProvider.name}</div>
              <div style={{ fontSize: 11, color: '#8b949e' }}>Opens in a new tab</div>
            </div>
            <a href={selectedProvider.url} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', background: selectedProvider.color, border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}>Open →</a>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>Step 2 — Send BTC to your deposit address</div>
            <div style={{ fontSize: 12, color: '#8b949e' }}>After purchasing, send Bitcoin to the address below. Your account will be credited within 30 minutes.</div>
          </div>

          <div onClick={handleCopy} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: 16, marginBottom: 16, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: '#060a0f', fontWeight: 700, textAlign: 'center', padding: 4 }}>QR CODE</div>
            <div>
              <div style={{ fontSize: 10, color: '#484f58', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bitcoin (BTC) Address</div>
              <div style={{ fontSize: 11, color: '#C9A84C', wordBreak: 'break-all', lineHeight: 1.6, fontFamily: 'monospace' }}>{BTC_ADDRESS}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: copied ? '#3fb950' : '#484f58' }}>{copied ? '✓ Copied!' : 'Click to copy'}</div>
            </div>
          </div>

          <div style={{ background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#f85149', lineHeight: 1.6 }}>⚠ Send <strong>Bitcoin (BTC) only</strong> to this address. Sending any other asset will result in permanent loss.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ padding: '12px 0', background: 'transparent', border: '1px solid #21262d', borderRadius: 10, color: '#8b949e', fontSize: 12, cursor: 'pointer' }}>← Back</button>
            <button onClick={() => setStep(1)} style={{ padding: '12px 0', background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', border: 'none', borderRadius: 10, color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✓ Done</button>
          </div>
        </div>
      )}
    </div>
  )
}
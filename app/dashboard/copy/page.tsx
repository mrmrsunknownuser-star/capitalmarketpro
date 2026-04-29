// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

var TRADERS = [
  { name: 'AlgoMaster_X', avatar: 'A', roi: '+142%', monthly: '+18.4%', followers: '2,840', risk: 'Low', win: '87%', trades: 342, drawdown: '4.2%', assets: 'Crypto, Forex', color: '#C9A84C', verified: true, desc: 'Fully automated AI strategy with 3 years consistent track record. Specializes in BTC and ETH momentum trading.' },
  { name: 'CryptoWolf99', avatar: 'C', roi: '+98%', monthly: '+12.1%', followers: '1,920', risk: 'Medium', win: '79%', trades: 218, drawdown: '7.8%', assets: 'Crypto', color: '#F7931A', verified: true, desc: 'High frequency crypto scalping strategy. Best performance during high volatility market conditions.' },
  { name: 'ForexPro_AI', avatar: 'F', roi: '+76%', monthly: '+9.8%', followers: '3,100', risk: 'Low', win: '84%', trades: 156, drawdown: '3.1%', assets: 'Forex', color: '#3498db', verified: true, desc: 'Conservative forex strategy focusing on major pairs. Low drawdown with steady monthly returns.' },
  { name: 'GoldTrader_V', avatar: 'G', roi: '+54%', monthly: '+7.2%', followers: '890', risk: 'Low', win: '91%', trades: 89, drawdown: '2.4%', assets: 'Gold, Commodities', color: '#2ecc71', verified: false, desc: 'Specializes in gold and precious metals. Extremely high win rate with tight risk management.' },
  { name: 'StockKing247', avatar: 'S', roi: '+48%', monthly: '+6.5%', followers: '1,240', risk: 'Medium', win: '74%', trades: 201, drawdown: '9.2%', assets: 'Stocks', color: '#9b59b6', verified: true, desc: 'US and EU stock market specialist. Combines fundamental and technical analysis for consistent gains.' },
  { name: 'DeFi_Master', avatar: 'D', roi: '+210%', monthly: '+24.1%', followers: '4,200', risk: 'High', win: '68%', trades: 512, drawdown: '18.5%', assets: 'DeFi, Crypto', color: '#e74c3c', verified: true, desc: 'Aggressive DeFi yield farming and trading strategy. High risk high reward. Not suitable for beginners.' },
]

export default function CopyTradingPage() {
  var router = useRouter()
  var [filter, setFilter] = useState('all')
  var [selected, setSelected] = useState(null)
  var [copying, setCopying] = useState(null)
  var [amount, setAmount] = useState('500')
  var [success, setSuccess] = useState(false)

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  var filtered = TRADERS.filter(function(t) {
    if (filter === 'low') return t.risk === 'Low'
    if (filter === 'medium') return t.risk === 'Medium'
    if (filter === 'high') return t.risk === 'High'
    return true
  })

  function getRiskColor(risk) {
    if (risk === 'Low') return '#2ecc71'
    if (risk === 'Medium') return '#C9A84C'
    return '#e74c3c'
  }

  async function handleCopy() {
    setCopying(true)
    await new Promise(function(r) { setTimeout(r, 2000) })
    setCopying(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div style={{ background: '#060a0e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e8edf5', marginBottom: 8 }}>Now Copying {selected.name}!</div>
          <div style={{ fontSize: 14, color: '#8892a0', marginBottom: 24, lineHeight: 1.7 }}>
            You are now copying this trader with ${parseFloat(amount).toLocaleString()}. Your account will automatically mirror their trades.
          </div>
          <div style={{ background: '#0d1117', border: '1px solid rgba(46,204,113,.2)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Trader', val: selected.name },
                { label: 'Amount', val: '$' + parseFloat(amount).toLocaleString() },
                { label: 'Monthly ROI', val: selected.monthly },
                { label: 'Risk Level', val: selected.risk },
              ].map(function(item) {
                return (
                  <div key={item.label} style={{ background: '#141920', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>{item.val}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <button onClick={function() { router.push('/dashboard') }} style={{ width: '100%', padding: '14px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Go to Dashboard →
          </button>
        </div>
      </div>
    )
  }

  if (selected) {
    return (
      <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>

        <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={function() { setSelected(null) }} style={{ width: 38, height: 38, borderRadius: 12, background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#8892a0' }}>←</button>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5' }}>Copy Trader</div>
        </div>

        <div style={{ padding: '0 16px' }}>
          {/* Trader profile */}
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: selected.color + '20', border: '2px solid ' + selected.color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: selected.color }}>
                {selected.avatar}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#e8edf5' }}>{selected.name}</div>
                  {selected.verified && <span style={{ fontSize: 10, color: '#3498db' }}>✓ Verified</span>}
                </div>
                <div style={{ fontSize: 12, color: '#4a5568', marginTop: 3 }}>{selected.assets}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#2ecc71' }}>{selected.roi}</div>
                <div style={{ fontSize: 10, color: '#4a5568' }}>Total ROI</div>
              </div>
            </div>

            <div style={{ fontSize: 13, color: '#8892a0', lineHeight: 1.7, marginBottom: 16 }}>{selected.desc}</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                { label: 'Monthly', val: selected.monthly, color: '#2ecc71' },
                { label: 'Win Rate', val: selected.win, color: G },
                { label: 'Max DD', val: selected.drawdown, color: '#e74c3c' },
                { label: 'Followers', val: selected.followers, color: '#3498db' },
                { label: 'Trades', val: selected.trades, color: '#9b59b6' },
                { label: 'Risk', val: selected.risk, color: getRiskColor(selected.risk) },
              ].map(function(stat) {
                return (
                  <div key={stat.label} style={{ background: '#141920', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: stat.color }}>{stat.val}</div>
                    <div style={{ fontSize: 9, color: '#4a5568', marginTop: 3 }}>{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Copy amount */}
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e8edf5', marginBottom: 16 }}>Set Copy Amount</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Amount to Copy With (USD)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4a5568', fontSize: 18, fontWeight: 700 }}>$</span>
                <input type="number" value={amount} onChange={function(e) { setAmount(e.target.value) }} style={{ width: '100%', background: '#141920', border: '1.5px solid #1e2530', borderRadius: 12, padding: '14px 14px 14px 34px', color: '#e8edf5', fontSize: 20, fontWeight: 800, outline: 'none', fontFamily: 'Inter, sans-serif' }} onFocus={function(e) { e.target.style.borderColor = '#C9A84C' }} onBlur={function(e) { e.target.style.borderColor = '#1e2530' }} />
              </div>
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {['100', '500', '1000', '5000'].map(function(val) {
                return (
                  <button key={val} onClick={function() { setAmount(val) }} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid ' + (amount === val ? 'rgba(201,168,76,.4)' : '#1e2530'), background: amount === val ? 'rgba(201,168,76,.1)' : '#141920', color: amount === val ? G : '#4a5568', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    ${val}
                  </button>
                )
              })}
            </div>

            {/* Estimated returns */}
            {parseFloat(amount) > 0 && (
              <div style={{ background: 'linear-gradient(135deg,rgba(46,204,113,.06),rgba(46,204,113,.02))', border: '1px solid rgba(46,204,113,.15)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Estimated Monthly Returns</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#2ecc71' }}>
                      +${(parseFloat(amount) * parseFloat(selected.monthly) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 11, color: '#4a5568', marginTop: 3 }}>per month at {selected.monthly}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: G }}>${(parseFloat(amount) + parseFloat(amount) * parseFloat(selected.monthly) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: 11, color: '#4a5568', marginTop: 3 }}>total after 1 month</div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleCopy} disabled={!amount || parseFloat(amount) <= 0 || copying} style={{ width: '100%', padding: '15px', background: !amount || parseFloat(amount) <= 0 ? '#141920' : GG, border: 'none', borderRadius: 12, color: !amount || parseFloat(amount) <= 0 ? '#4a5568' : '#060a0e', fontSize: 15, fontWeight: 800, cursor: !amount || parseFloat(amount) <= 0 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {copying ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,.2)', borderTopColor: '#060a0e', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                  Setting up copy...
                </>
              ) : 'Start Copying ' + selected.name + ' →'}
            </button>
          </div>

          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, color: '#2a3140', lineHeight: 1.7 }}>
              Disclaimer: Copy trading involves risk. Past performance does not guarantee future results. Only invest what you can afford to lose.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#060a0e', minHeight: '100vh', paddingBottom: 30 }}>

      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={function() { router.back() }} style={{ width: 38, height: 38, borderRadius: 12, background: '#0d1117', border: '1px solid #1e2530', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#8892a0' }}>←</button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>Copy Trading</div>
          <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>Copy top traders automatically</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ margin: '0 16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Top Traders', val: '400+', color: G },
          { label: 'Avg Win Rate', val: '80%', color: '#2ecc71' },
          { label: 'Instruments', val: '1000+', color: '#3498db' },
        ].map(function(stat) {
          return (
            <div key={stat.label} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: stat.color }}>{stat.val}</div>
              <div style={{ fontSize: 10, color: '#4a5568', marginTop: 4 }}>{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ margin: '0 16px 20px', display: 'flex', gap: 8 }}>
        {[['all', 'All'], ['low', '🟢 Low Risk'], ['medium', '🟡 Medium'], ['high', '🔴 High']].map(function(f) {
          return (
            <button key={f[0]} onClick={function() { setFilter(f[0]) }} style={{ flex: 1, padding: '9px 4px', borderRadius: 11, border: filter === f[0] ? 'none' : '1px solid #1e2530', background: filter === f[0] ? GG : '#0d1117', color: filter === f[0] ? '#060a0e' : '#4a5568', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {f[1]}
            </button>
          )
        })}
      </div>

      {/* Traders list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(function(trader) {
          return (
            <div key={trader.name} onClick={function() { setSelected(trader) }} style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 20, padding: 20, cursor: 'pointer', transition: 'border-color .2s', position: 'relative', overflow: 'hidden' }} onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)' }} onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#1e2530' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,' + trader.color + '60,transparent)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: trader.color + '20', border: '2px solid ' + trader.color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: trader.color }}>
                    {trader.avatar}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#e8edf5' }}>{trader.name}</div>
                      {trader.verified && <span style={{ fontSize: 9, color: '#3498db', fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>{trader.assets}</div>
                    <div style={{ fontSize: 10, color: '#4a5568', marginTop: 2 }}>{trader.followers} followers</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#2ecc71' }}>{trader.roi}</div>
                  <div style={{ fontSize: 10, color: '#4a5568' }}>Total ROI</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: G, marginTop: 2 }}>{trader.monthly}/mo</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Win Rate', val: trader.win, color: '#2ecc71' },
                  { label: 'Max Drawdown', val: trader.drawdown, color: '#e74c3c' },
                  { label: 'Risk', val: trader.risk, color: getRiskColor(trader.risk) },
                ].map(function(stat) {
                  return (
                    <div key={stat.label} style={{ background: '#141920', borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: stat.color }}>{stat.val}</div>
                      <div style={{ fontSize: 9, color: '#4a5568', marginTop: 3 }}>{stat.label}</div>
                    </div>
                  )
                })}
              </div>

              <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', borderRadius: 12, color: G, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Copy This Trader →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
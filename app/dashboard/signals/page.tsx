'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const LIVE_SIGNALS = [
  { id: 1, asset: 'BTC/USD', type: 'BUY', entry: '$67,200', target: '$71,500', stop: '$65,000', strength: 92, risk: 'Low', timeframe: '4H', category: 'crypto', status: 'active', pnl: '+4.8%' },
  { id: 2, asset: 'ETH/USD', type: 'BUY', entry: '$3,480', target: '$3,750', stop: '$3,300', strength: 87, risk: 'Low', timeframe: '4H', category: 'crypto', status: 'active', pnl: '+7.7%' },
  { id: 3, asset: 'SOL/USD', type: 'SELL', entry: '$142', target: '$128', stop: '$148', strength: 74, risk: 'Medium', timeframe: '1H', category: 'crypto', status: 'active', pnl: '-4.2%' },
  { id: 4, asset: 'NVDA', type: 'BUY', entry: '$875', target: '$920', stop: '$850', strength: 88, risk: 'Low', timeframe: '1D', category: 'stocks', status: 'active', pnl: '+5.1%' },
  { id: 5, asset: 'AAPL', type: 'HOLD', entry: '$189', target: '$195', stop: '$185', strength: 65, risk: 'Low', timeframe: '1D', category: 'stocks', status: 'pending', pnl: '+3.2%' },
  { id: 6, asset: 'BNB/USD', type: 'BUY', entry: '$412', target: '$440', stop: '$395', strength: 81, risk: 'Medium', timeframe: '4H', category: 'crypto', status: 'active', pnl: '+6.8%' },
  { id: 7, asset: 'XRP/USD', type: 'BUY', entry: '$0.62', target: '$0.72', stop: '$0.58', strength: 79, risk: 'Medium', timeframe: '4H', category: 'crypto', status: 'active', pnl: '+16.1%' },
  { id: 8, asset: 'TSLA', type: 'SELL', entry: '$248', target: '$225', stop: '$260', strength: 71, risk: 'High', timeframe: '1D', category: 'stocks', status: 'active', pnl: '-4.8%' },
]

const PLANS = [
  { name: 'Basic', price: 99, color: '#8b949e', signals: 5, features: ['5 signals/day', 'Crypto only', 'Email alerts', 'Basic analysis'] },
  { name: 'Pro', price: 199, color: '#0052FF', signals: 15, popular: true, features: ['15 signals/day', 'Crypto + Stocks', 'Push alerts', 'Advanced analysis', 'Risk scoring'] },
  { name: 'Elite', price: 349, color: '#C9A84C', signals: 30, features: ['30 signals/day', 'All markets', 'Priority alerts', 'Premium analysis', 'Entry/exit precision'] },
  { name: 'VIP', price: 599, color: '#7B2BF9', signals: -1, features: ['Unlimited signals', 'All markets', 'Direct from analysts', '1-on-1 calls', 'Custom alerts'] },
]

export default function SignalsPage() {
  const [tab, setTab] = useState<'signals' | 'plans' | 'history'>('signals')
  const [category, setCategory] = useState<'all' | 'crypto' | 'stocks'>('all')
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      // Check existing signal subscription
      const { data } = await supabase.from('signal_subscriptions').select('plan').eq('user_id', user.id).eq('status', 'active').single()
      if (data) setUserPlan(data.plan)
    }
    init()
  }, [])

  const subscribe = async (plan: typeof PLANS[0]) => {
    if (!userId) return
    setSubscribing(plan.name)
    const supabase = createClient()

    try {
      await supabase.from('signal_subscriptions').upsert({
        user_id: userId,
        plan: plan.name,
        price: plan.price,
        status: 'pending',
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      const { data: admin } = await supabase.from('users').select('id').eq('role', 'admin').single()
      if (admin?.id) {
        await supabase.from('notifications').insert({
          user_id: admin.id,
          title: `⚡ New Signal Subscription`,
          message: `User subscribed to ${plan.name} Signal Plan ($${plan.price}/mo)`,
          type: 'info', is_read: false,
        })
      }

      await supabase.from('notifications').insert({
        user_id: userId,
        title: `⚡ ${plan.name} Signal Plan - Pending`,
        message: `Your ${plan.name} signal plan subscription is pending activation. Our team will activate it within 1 hour.`,
        type: 'info', is_read: false,
      })

      setMessage(`✅ ${plan.name} plan requested! Activation within 1 hour.`)
      setUserPlan(plan.name)
    } catch {}

    setSubscribing(null)
    setTimeout(() => setMessage(''), 5000)
  }

  const filtered = LIVE_SIGNALS.filter(s => category === 'all' || s.category === category)

  const typeColor = (t: string) => ({ BUY: '#3fb950', SELL: '#f85149', HOLD: '#F7A600' }[t] || '#484f58')
  const riskColor = (r: string) => ({ Low: '#3fb950', Medium: '#F7A600', High: '#f85149' }[r] || '#484f58')

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Trading Signals</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>AI-powered signals with 84% historical accuracy</div>
      </div>

      {message && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>
          {message}
        </div>
      )}

      {/* Live indicator */}
      <div style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 10px #3fb950' }} />
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#3fb950' }}>LIVE</span>
            <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 8 }}>{LIVE_SIGNALS.filter(s => s.status === 'active').length} active signals</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[{ l: 'Win Rate', v: '84%', c: '#3fb950' }, { l: 'Avg Return', v: '+12.4%', c: '#C9A84C' }, { l: 'Signals Today', v: '24', c: '#0052FF' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current plan */}
      {userPlan && (
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: '#e6edf3' }}>
            ⚡ Active Plan: <strong style={{ color: '#C9A84C' }}>{userPlan}</strong>
          </div>
          <button onClick={() => setTab('plans')} style={{ fontSize: 11, color: '#C9A84C', background: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>
            Upgrade →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {[{ id: 'signals', label: '⚡ Live Signals' }, { id: 'plans', label: '💎 Plans' }, { id: 'history', label: '📋 History' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* SIGNALS TAB */}
      {tab === 'signals' && (
        <div>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['all', 'crypto', 'stocks'].map(c => (
              <button key={c} onClick={() => setCategory(c as any)}
                style={{ padding: '7px 16px', borderRadius: 20, border: `1px solid ${category === c ? '#C9A84C' : '#21262d'}`, background: category === c ? 'rgba(201,168,76,0.1)' : 'transparent', color: category === c ? '#C9A84C' : '#8b949e', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', fontWeight: category === c ? 700 : 400, textTransform: 'capitalize' }}>
                {c === 'all' ? '🌐 All' : c === 'crypto' ? '₿ Crypto' : '📈 Stocks'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(signal => (
              <div key={signal.id} style={{ background: '#0d1117', border: `1px solid ${typeColor(signal.type)}22`, borderRadius: 14, padding: 18, position: 'relative' }}>
                {signal.status === 'active' && (
                  <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950' }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ padding: '5px 12px', borderRadius: 20, background: `${typeColor(signal.type)}15`, color: typeColor(signal.type), fontSize: 12, fontWeight: 800 }}>{signal.type}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>{signal.asset}</span>
                    <span style={{ fontSize: 10, color: '#484f58', background: '#161b22', padding: '2px 8px', borderRadius: 6 }}>{signal.timeframe}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: parseFloat(signal.pnl) >= 0 ? '#3fb950' : '#f85149' }}>{signal.pnl}</span>
                    <span style={{ fontSize: 10, color: riskColor(signal.risk), background: `${riskColor(signal.risk)}15`, padding: '2px 8px', borderRadius: 6 }}>{signal.risk} Risk</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                  {[{ l: 'ENTRY', v: signal.entry, c: '#e6edf3' }, { l: 'TARGET', v: signal.target, c: '#3fb950' }, { l: 'STOP LOSS', v: signal.stop, c: '#f85149' }].map(item => (
                    <div key={item.l} style={{ background: '#161b22', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#484f58', marginBottom: 4, letterSpacing: '0.08em' }}>{item.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: item.c }}>{item.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#484f58' }}>Signal Strength</span>
                  <div style={{ flex: 1, height: 5, background: '#161b22', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${signal.strength}%`, height: '100%', background: signal.strength >= 80 ? '#3fb950' : signal.strength >= 60 ? '#F7A600' : '#f85149', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: signal.strength >= 80 ? '#3fb950' : '#F7A600' }}>{signal.strength}%</span>
                </div>
              </div>
            ))}
          </div>

          {!userPlan && (
            <div style={{ marginTop: 20, background: '#0d1117', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>Get More Signals</div>
              <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16 }}>Subscribe to get up to unlimited signals daily</div>
              <button onClick={() => setTab('plans')} style={{ padding: '11px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                View Signal Plans →
              </button>
            </div>
          )}
        </div>
      )}

      {/* PLANS TAB */}
      {tab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{ background: (plan as any).popular ? 'rgba(0,82,255,0.06)' : '#0d1117', border: `2px solid ${userPlan === plan.name ? plan.color : (plan as any).popular ? plan.color + '55' : plan.color + '22'}`, borderRadius: 16, padding: 22, position: 'relative' }}>
              {(plan as any).popular && (
                <div style={{ position: 'absolute', top: -12, left: 24, background: '#0052FF', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 20 }}>⭐ MOST POPULAR</div>
              )}
              {userPlan === plan.name && (
                <div style={{ position: 'absolute', top: -12, right: 24, background: '#3fb950', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 20 }}>✓ ACTIVE</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: plan.color, marginBottom: 4 }}>{plan.name} Plan</div>
                  <div style={{ fontSize: 13, color: '#8b949e' }}>
                    {plan.signals === -1 ? 'Unlimited' : plan.signals} signals/day
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: plan.color }}>${plan.price}</div>
                  <div style={{ fontSize: 11, color: '#484f58' }}>per month</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 18 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#8b949e' }}>
                    <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>

              {userPlan === plan.name ? (
                <div style={{ width: '100%', padding: '12px 0', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#3fb950' }}>
                  ✅ Currently Active
                </div>
              ) : (
                <button onClick={() => subscribe(plan)} disabled={subscribing === plan.name}
                  style={{ width: '100%', padding: '13px 0', background: subscribing === plan.name ? '#161b22' : `linear-gradient(135deg,${plan.color},${plan.color}cc)`, border: 'none', borderRadius: 12, color: subscribing === plan.name ? '#484f58' : plan.color === '#8b949e' ? '#060a0f' : '#fff', fontSize: 13, fontWeight: 800, cursor: subscribing === plan.name ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
                  {subscribing === plan.name ? '⟳ Processing...' : `Subscribe — $${plan.price}/mo`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div>
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #161b22', fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>
              Signal Performance History
            </div>
            {[
              { asset: 'BTC/USD', type: 'BUY', entry: '$64,200', exit: '$67,800', pnl: '+$3,600', result: 'WIN', date: '2 days ago' },
              { asset: 'ETH/USD', type: 'BUY', entry: '$3,280', exit: '$3,490', pnl: '+$210', result: 'WIN', date: '3 days ago' },
              { asset: 'NVDA', type: 'BUY', entry: '$820', exit: '$878', pnl: '+$58', result: 'WIN', date: '4 days ago' },
              { asset: 'SOL/USD', type: 'SELL', entry: '$155', exit: '$141', pnl: '+$14', result: 'WIN', date: '5 days ago' },
              { asset: 'TSLA', type: 'BUY', entry: '$260', exit: '$248', pnl: '-$12', result: 'LOSS', date: '6 days ago' },
              { asset: 'BNB/USD', type: 'BUY', entry: '$390', exit: '$415', pnl: '+$25', result: 'WIN', date: '1 week ago' },
            ].map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < 5 ? '1px solid #161b22' : 'none', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: h.result === 'WIN' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {h.result === 'WIN' ? '🎯' : '❌'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{h.asset}</span>
                    <span style={{ fontSize: 10, color: typeColor(h.type), background: `${typeColor(h.type)}15`, padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>{h.type}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#484f58' }}>Entry: {h.entry} → Exit: {h.exit} · {h.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: h.result === 'WIN' ? '#3fb950' : '#f85149' }}>{h.pnl}</div>
                  <div style={{ fontSize: 9, color: h.result === 'WIN' ? '#3fb950' : '#f85149', fontWeight: 700 }}>{h.result}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
            {[{ l: 'Win Rate', v: '83.3%', c: '#3fb950' }, { l: 'Avg Win', v: '+$652', c: '#3fb950' }, { l: 'Avg Loss', v: '-$12', c: '#f85149' }, { l: 'Profit Factor', v: '4.2x', c: '#C9A84C' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved · Past performance does not guarantee future results</div>
      </div>
    </div>
  )
}
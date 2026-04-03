'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PLANS = [
  { name: 'Starter', min: 200, max: 999, roi: 5, duration: 7, total: 35, color: '#8b949e', icon: '🌱', features: ['Minimum deposit $200', '5% daily returns', '7 day trading cycle', 'Auto-compounding', 'Email notifications', 'Basic support'] },
  { name: 'Silver', min: 1000, max: 4999, roi: 8, duration: 14, total: 112, color: '#8b949e', icon: '🥈', features: ['Minimum deposit $1,000', '8% daily returns', '14 day trading cycle', 'Auto-compounding', 'Priority notifications', 'Live chat support'] },
  { name: 'Gold', min: 5000, max: 19999, roi: 12, duration: 21, total: 252, color: '#C9A84C', icon: '🥇', popular: true, features: ['Minimum deposit $5,000', '12% daily returns', '21 day trading cycle', 'Auto-compounding', 'Real-time alerts', 'Priority support', 'Trading signals'] },
  { name: 'Platinum', min: 20000, max: 49999, roi: 15, duration: 30, total: 450, color: '#0052FF', icon: '💎', features: ['Minimum deposit $20,000', '15% daily returns', '30 day trading cycle', 'Auto-compounding', 'Dedicated manager', 'VIP support', 'Full signals'] },
  { name: 'Elite', min: 50000, max: 99999, roi: 20, duration: 30, total: 600, color: '#7B2BF9', icon: '👑', features: ['Minimum deposit $50,000', '20% daily returns', '30 day trading cycle', 'Auto-compounding', 'Personal fund manager', 'Priority withdrawals', 'Custom plan'] },
  { name: 'Black', min: 100000, max: 999999999, roi: 25, duration: 30, total: 750, color: '#e6edf3', icon: '🖤', features: ['Minimum deposit $100,000', '25% daily returns', '30 day trading cycle', 'Auto-compounding', 'Senior fund manager', 'Instant withdrawals', 'Black card + concierge'] },
]

export default function InvestPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [activePlans, setActivePlans] = useState<any[]>([])
  const [selected, setSelected] = useState<typeof PLANS[0] | null>(null)
  const [amount, setAmount] = useState('')
  const [activating, setActivating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'plans' | 'active'>('plans')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: bal } = await supabase.from('balances').select('total_balance').eq('user_id', user.id).single()
      setBalance(bal?.total_balance || 0)
      const { data: plans } = await supabase.from('investment_plans').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setActivePlans(plans || [])
    }
    init()
  }, [])

  const activatePlan = async () => {
    if (!selected || !amount || !userId) return
    const amt = parseFloat(amount)
    if (amt < selected.min) { setError(`Minimum for ${selected.name} plan is $${selected.min.toLocaleString()}`); return }
    if (amt > balance) { setError('Insufficient balance. Please deposit funds first.'); return }

    setActivating(true)
    setError('')
    const supabase = createClient()

    const dailyProfit = amt * (selected.roi / 100)
    const totalProfit = dailyProfit * selected.duration
    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + selected.duration)

    await supabase.from('investment_plans').insert({
      user_id: userId,
      plan_name: selected.name,
      amount: amt,
      roi_percent: selected.roi,
      duration_days: selected.duration,
      daily_profit: dailyProfit,
      total_profit: totalProfit,
      status: 'active',
      ends_at: endsAt.toISOString(),
      last_credited: new Date().toISOString(),
    })

    // Deduct from balance
    const { data: bal } = await supabase.from('balances').select('total_balance, total_pnl').eq('user_id', userId).single()
    await supabase.from('balances').update({
      total_balance: (bal?.total_balance || 0) - amt,
      available_balance: (bal?.total_balance || 0) - amt,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)

    await supabase.from('notifications').insert({
      user_id: userId,
      title: `✅ ${selected.name} Plan Activated!`,
      message: `Your ${selected.name} investment plan of $${amt.toLocaleString()} is now active. You'll earn $${dailyProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })} daily for ${selected.duration} days.`,
      type: 'success', is_read: false,
    })

    // Notify admin
    const { data: admin } = await supabase.from('users').select('id').eq('role', 'admin').single()
    if (admin?.id) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        title: `💹 New Investment Plan Activated`,
        message: `User activated ${selected.name} plan with $${amt.toLocaleString()}. Daily profit: $${dailyProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
        type: 'info', is_read: false,
      })
    }

    setMessage(`✅ ${selected.name} plan activated! Earning $${dailyProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}/day.`)
    setBalance(prev => prev - amt)
    setSelected(null)
    setAmount('')
    setActivating(false)
    setTimeout(() => setMessage(''), 5000)

    const { data: plans } = await supabase.from('investment_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setActivePlans(plans || [])
    setTab('active')
  }

  const getDaysLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const getProgress = (plan: any) => {
    const total = plan.duration_days
    const left = getDaysLeft(plan.ends_at)
    return Math.min(100, ((total - left) / total) * 100)
  }

  return (
    <div style={{ padding: '16px 16px 80px', fontFamily: 'monospace' }}>
      <style>{`
        .plans-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        @media (max-width: 900px) { .plans-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 500px) { .plans-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>Investment Plans</div>
        <div style={{ fontSize: 13, color: '#484f58' }}>Fully automated AI trading — daily returns 24/7</div>
      </div>

      {message && <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#3fb950' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#f85149', display: 'flex', justifyContent: 'space-between' }}><span>⚠ {error}</span><button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}>✕</button></div>}

      {/* Balance */}
      <div style={{ background: 'linear-gradient(135deg,#0d1117,#161b22)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Available Balance</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#C9A84C' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <Link href="/dashboard/deposit">
          <button style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>+ Deposit</button>
        </Link>
      </div>

      {/* AI Banner */}
      <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 3 }}>100% Automated AI Trading</div>
          <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7 }}>Select a plan, enter your amount, and our AI starts trading immediately — earning you daily returns automatically.</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 4 }}>
        {[{ id: 'plans', label: '💹 Investment Plans' }, { id: 'active', label: `📊 My Plans ${activePlans.length > 0 ? `(${activePlans.length})` : ''}` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === t.id ? '#C9A84C' : '#8b949e', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* PLANS TAB */}
      {tab === 'plans' && (
        <div className="plans-grid">
          {PLANS.map(plan => {
            const activePlan = activePlans.find(p => p.plan_name === plan.name && p.status === 'active')
            return (
              <div key={plan.name} style={{ background: '#0d1117', border: `2px solid ${selected?.name === plan.name ? plan.color : plan.color + '22'}`, borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                onClick={() => { setSelected(plan); setAmount(plan.min.toString()) }}>
                {(plan as any).popular && (
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#060a0f', fontSize: 8, fontWeight: 800, padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap', zIndex: 1 }}>⭐ MOST POPULAR</div>
                )}
                {activePlan && (
                  <div style={{ position: 'absolute', top: 10, right: 10, background: '#3fb950', color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>ACTIVE</div>
                )}

                <div style={{ padding: '20px 18px 16px', background: `${plan.color}08` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: plan.color, textTransform: 'uppercase', marginBottom: 12 }}>{plan.icon} {plan.name}</div>
                  <div style={{ textAlign: 'center', background: `${plan.color}18`, borderRadius: 10, padding: '12px', marginBottom: 12 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: plan.color, lineHeight: 1 }}>{plan.roi}%</div>
                    <div style={{ fontSize: 10, color: '#8b949e', marginTop: 4 }}>Daily · {plan.total}% Total</div>
                    <div style={{ fontSize: 10, color: plan.color, marginTop: 2, fontWeight: 700 }}>{plan.duration} Days</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                    <div style={{ background: '#161b22', borderRadius: 6, padding: '7px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 8, color: '#484f58', marginBottom: 2 }}>MIN</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3' }}>${plan.min.toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#161b22', borderRadius: 6, padding: '7px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 8, color: '#484f58', marginBottom: 2 }}>MAX</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3' }}>{plan.max > 999999 ? 'Unlimited' : `$${plan.max.toLocaleString()}`}</div>
                    </div>
                  </div>
                  {plan.features.slice(0, 4).map((f, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#8b949e', marginBottom: 5, display: 'flex', gap: 6 }}>
                      <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>

                <div style={{ padding: '14px 18px', borderTop: `1px solid ${plan.color}22` }}>
                  <button
                    onClick={e => { e.stopPropagation(); setSelected(plan); setAmount(plan.min.toString()) }}
                    style={{ width: '100%', padding: '11px 0', background: selected?.name === plan.name ? `linear-gradient(135deg,${plan.color},${plan.color}cc)` : `${plan.color}0d`, border: `1px solid ${plan.color}`, borderRadius: 10, color: selected?.name === plan.name ? (plan.color === '#e6edf3' ? '#060a0f' : '#fff') : plan.color, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                    {activePlan ? '✅ Active — Invest More' : selected?.name === plan.name ? '✓ Selected' : `Invest ${plan.icon}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ACTIVE PLANS TAB */}
      {tab === 'active' && (
        <div>
          {activePlans.length === 0 ? (
            <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💹</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>No active plans yet</div>
              <div style={{ fontSize: 12, color: '#484f58', marginBottom: 20 }}>Activate an investment plan to start earning daily returns</div>
              <button onClick={() => setTab('plans')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8D08C)', color: '#060a0f', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
                View Plans →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activePlans.map(plan => {
                const planDef = PLANS.find(p => p.name === plan.plan_name) || PLANS[0]
                const daysLeft = getDaysLeft(plan.ends_at)
                const progress = getProgress(plan)
                const daysCompleted = plan.duration_days - daysLeft
                const earnedSoFar = plan.daily_profit * daysCompleted

                return (
                  <div key={plan.id} style={{ background: '#0d1117', border: `1px solid ${planDef.color}33`, borderRadius: 16, padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: planDef.color, textTransform: 'uppercase', marginBottom: 4 }}>{planDef.icon} {plan.plan_name} Plan</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3' }}>${plan.amount?.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: '#484f58' }}>Invested · {new Date(plan.started_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>Status</div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: plan.status === 'active' ? '#3fb950' : '#F7A600', background: plan.status === 'active' ? 'rgba(63,185,80,0.1)' : 'rgba(247,166,0,0.1)', padding: '4px 12px', borderRadius: 20 }}>
                          {plan.status === 'active' ? '🟢 ACTIVE' : '✅ COMPLETE'}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
                      {[
                        { l: 'Daily ROI', v: `${plan.roi_percent}%`, c: planDef.color },
                        { l: 'Daily Profit', v: `$${plan.daily_profit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, c: '#3fb950' },
                        { l: 'Earned So Far', v: `$${earnedSoFar.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, c: '#C9A84C' },
                        { l: 'Total Profit', v: `$${plan.total_profit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, c: '#3fb950' },
                      ].map(s => (
                        <div key={s.l} style={{ background: '#161b22', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 8, color: '#484f58', marginBottom: 4, textTransform: 'uppercase' }}>{s.l}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: s.c }}>{s.v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#484f58', marginBottom: 6 }}>
                        <span>Day {daysCompleted} of {plan.duration_days}</span>
                        <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}</span>
                      </div>
                      <div style={{ height: 6, background: '#161b22', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${planDef.color},${planDef.color}cc)`, borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#484f58' }}>
                      <span>Started: {new Date(plan.started_at).toLocaleDateString()}</span>
                      <span>Ends: {new Date(plan.ends_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Activation modal */}
      {selected && tab === 'plans' && (
        <div onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#0d1117', border: `1px solid ${selected.color}44`, borderRadius: 20, width: '100%', maxWidth: 440, padding: 28, fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3' }}>{selected.icon} Activate {selected.name} Plan</div>
              <button onClick={() => setSelected(null)} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, color: '#8b949e', cursor: 'pointer', width: 30, height: 30, fontSize: 14 }}>✕</button>
            </div>

            {/* Plan summary */}
            <div style={{ background: `${selected.color}0d`, border: `1px solid ${selected.color}22`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, textAlign: 'center' }}>
                {[{ l: 'Daily ROI', v: `${selected.roi}%` }, { l: 'Duration', v: `${selected.duration} Days` }, { l: 'Total Return', v: `${selected.total}%` }].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: 9, color: '#484f58', textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: selected.color }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Investment Amount (USD)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min $${selected.min.toLocaleString()}`}
                style={{ width: '100%', background: '#161b22', border: `1px solid ${selected.color}44`, borderRadius: 10, padding: '14px', color: selected.color, fontSize: 22, fontWeight: 800, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                onFocus={e => e.target.style.borderColor = selected.color}
                onBlur={e => e.target.style.borderColor = `${selected.color}44`}
              />
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {[selected.min, selected.min * 2, selected.min * 5].filter(v => v <= balance).map(v => (
                <button key={v} onClick={() => setAmount(v.toString())}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${selected.color}33`, background: 'transparent', color: selected.color, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>
                  ${v.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Projected earnings */}
            {amount && parseFloat(amount) >= selected.min && (
              <div style={{ background: '#161b22', borderRadius: 10, padding: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: '#484f58', marginBottom: 10, textTransform: 'uppercase' }}>Projected Earnings</div>
                {[
                  { l: 'Daily Profit', v: `$${(parseFloat(amount) * selected.roi / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                  { l: 'Total Profit', v: `$${(parseFloat(amount) * selected.roi / 100 * selected.duration).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                  { l: 'You Receive', v: `$${(parseFloat(amount) + parseFloat(amount) * selected.roi / 100 * selected.duration).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                ].map(item => (
                  <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #21262d' }}>
                    <span style={{ fontSize: 12, color: '#484f58' }}>{item.l}</span>
                    <span style={{ fontSize: 12, color: '#3fb950', fontWeight: 700 }}>{item.v}</span>
                  </div>
                ))}
              </div>
            )}

            {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#f85149' }}>⚠ {error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <button onClick={() => setSelected(null)} style={{ padding: '13px 0', borderRadius: 12, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>Cancel</button>
              <button onClick={activatePlan} disabled={activating || !amount || parseFloat(amount) < selected.min}
                style={{ padding: '13px 0', background: !amount || parseFloat(amount) < selected.min || activating ? '#161b22' : `linear-gradient(135deg,${selected.color},${selected.color}cc)`, border: 'none', borderRadius: 12, color: !amount || parseFloat(amount) < selected.min || activating ? '#484f58' : selected.color === '#e6edf3' ? '#060a0f' : '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}>
                {activating ? '⟳ Activating...' : `🚀 Activate Plan`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #161b22' }}>
        <div style={{ fontSize: 10, color: '#484f58' }}>© 2025 CapitalMarket Pro · All Rights Reserved · Past performance does not guarantee future results</div>
      </div>
    </div>
  )
}
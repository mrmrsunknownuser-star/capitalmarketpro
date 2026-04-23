// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

var RATES = {
  BTC: { USD: 94820, ETH: 29.2, USDT: 94820 },
  ETH: { USD: 3240, BTC: 0.0342, USDT: 3240 },
  USDT: { USD: 1, BTC: 0.0000105, ETH: 0.000308 },
  USD: { BTC: 0.0000105, ETH: 0.000308, USDT: 1 },
}

var CURRENCIES = ['USD', 'BTC', 'ETH', 'USDT']

export default function ConvertPage() {
  var router = useRouter()
  var [fromCur, setFromCur] = useState('USD')
  var [toCur, setToCur] = useState('USDT')
  var [amount, setAmount] = useState('100')
  var [converting, setConverting] = useState(false)
  var [converted, setConverted] = useState(false)
  var [user, setUser] = useState(null)

  var G = '#C9A84C'
  var GG = 'linear-gradient(135deg, #C9A84C, #E8D08C)'

  useEffect(function() {
    var supabase = createClient()
    supabase.auth.getUser().then(function(res) {
      if (!res.data.user) { router.push('/login'); return }
      supabase.from('users').select('balance').eq('id', res.data.user.id).single().then(function(r) {
        if (r.data) setUser(r.data)
      })
    })
  }, [])

  var getRate = function() {
    if (fromCur === toCur) return 1
    var rateMap = RATES[fromCur]
    return rateMap && rateMap[toCur] ? rateMap[toCur] : 1
  }

  var rate = getRate()
  var inputAmount = parseFloat(amount) || 0
  var outputAmount = inputAmount * rate
  var fee = inputAmount * 0.005
  var finalOutput = outputAmount * 0.995

  function swapCurrencies() {
    var temp = fromCur
    setFromCur(toCur)
    setToCur(temp)
    setAmount('')
  }

  async function handleConvert() {
    if (!amount || parseFloat(amount) <= 0) return
    setConverting(true)
    await new Promise(function(r) { setTimeout(r, 2000) })
    setConverting(false)
    setConverted(true)
  }

  var CURRENCY_ICONS = { USD: '$', BTC: '₿', ETH: 'E', USDT: '₮' }
  var CURRENCY_COLORS = { USD: '#2ecc71', BTC: '#F7931A', ETH: '#627EEA', USDT: '#26A17B' }

  if (converted) {
    return (
      <div style={{ background: '#060a0e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e8edf5', marginBottom: 8 }}>Conversion Successful!</div>
          <div style={{ fontSize: 14, color: '#8892a0', marginBottom: 8 }}>
            {inputAmount} {fromCur}
          </div>
          <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 24 }}>→</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: G, marginBottom: 24 }}>
            {finalOutput.toFixed(6)} {toCur}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={function() { setConverted(false); setAmount('') }} style={{ padding: '13px 28px', background: 'transparent', border: '1px solid #1e2530', borderRadius: 12, color: '#8892a0', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Convert Again
            </button>
            <button onClick={function() { router.push('/dashboard') }} style={{ padding: '13px 28px', background: GG, border: 'none', borderRadius: 12, color: '#060a0e', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Go to Dashboard
            </button>
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
          <div style={{ fontSize: 20, fontWeight: 800, color: '#e8edf5' }}>Convert</div>
          <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>Swap between currencies instantly</div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* From */}
        <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, padding: '18px', marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>From</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CURRENCIES.map(function(cur) {
                var active = fromCur === cur
                return (
                  <button key={cur} onClick={function() { if (cur !== toCur) setFromCur(cur) }} style={{ padding: '8px 14px', borderRadius: 10, border: active ? 'none' : '1px solid #1e2530', background: active ? GG : '#141920', color: active ? '#060a0e' : '#8892a0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: cur === toCur ? 0.3 : 1 }}>
                    {CURRENCY_ICONS[cur]} {cur}
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={amount}
                onChange={function(e) { setAmount(e.target.value) }}
                placeholder="0.00"
                style={{ width: '100%', background: '#141920', border: '1.5px solid #1e2530', borderRadius: 12, padding: '14px 16px', color: '#e8edf5', fontSize: 24, fontWeight: 900, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                onFocus={function(e) { e.target.style.borderColor = '#C9A84C' }}
                onBlur={function(e) { e.target.style.borderColor = '#1e2530' }}
              />
            </div>
            {user && (
              <div style={{ fontSize: 11, color: '#4a5568', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Available: ${parseFloat(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <button onClick={function() { setAmount(String(parseFloat(user.balance || 0))) }} style={{ background: 'none', border: 'none', color: G, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>MAX</button>
              </div>
            )}
          </div>
        </div>

        {/* Swap button */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
          <button onClick={swapCurrencies} style={{ width: 44, height: 44, borderRadius: '50%', background: '#0d1117', border: '2px solid ' + G, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: G, zIndex: 1 }}>⇅</button>
        </div>

        {/* To */}
        <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 18, padding: '18px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>To</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {CURRENCIES.map(function(cur) {
              var active = toCur === cur
              return (
                <button key={cur} onClick={function() { if (cur !== fromCur) setToCur(cur) }} style={{ padding: '8px 14px', borderRadius: 10, border: active ? 'none' : '1px solid #1e2530', background: active ? GG : '#141920', color: active ? '#060a0e' : '#8892a0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: cur === fromCur ? 0.3 : 1 }}>
                  {CURRENCY_ICONS[cur]} {cur}
                </button>
              )
            })}
          </div>
          <div style={{ background: '#141920', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: G }}>
              {inputAmount > 0 ? finalOutput.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 }) : '0.000000'}
            </div>
            <div style={{ fontSize: 11, color: '#4a5568', marginTop: 4 }}>{toCur}</div>
          </div>
        </div>

        {/* Rate info */}
        {inputAmount > 0 && (
          <div style={{ background: '#0d1117', border: '1px solid #1e2530', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>Conversion Details</div>
            {[
              { label: 'Exchange Rate', val: '1 ' + fromCur + ' = ' + rate.toLocaleString('en-US', { maximumFractionDigits: 6 }) + ' ' + toCur },
              { label: 'You Send', val: inputAmount.toLocaleString() + ' ' + fromCur },
              { label: 'Processing Fee (0.5%)', val: fee.toLocaleString('en-US', { maximumFractionDigits: 4 }) + ' ' + fromCur },
              { label: 'You Receive', val: finalOutput.toLocaleString('en-US', { maximumFractionDigits: 6 }) + ' ' + toCur },
            ].map(function(item) {
              return (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                  <span style={{ color: '#4a5568' }}>{item.label}</span>
                  <span style={{ color: item.label === 'You Receive' ? G : '#e8edf5', fontWeight: item.label === 'You Receive' ? 800 : 500 }}>{item.val}</span>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!amount || parseFloat(amount) <= 0 || converting || fromCur === toCur}
          style={{ width: '100%', padding: '15px', background: !amount || parseFloat(amount) <= 0 || fromCur === toCur ? '#141920' : GG, border: 'none', borderRadius: 14, color: !amount || parseFloat(amount) <= 0 || fromCur === toCur ? '#4a5568' : '#060a0e', fontSize: 16, fontWeight: 800, cursor: !amount || parseFloat(amount) <= 0 || fromCur === toCur ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: amount && parseFloat(amount) > 0 && fromCur !== toCur ? '0 6px 20px rgba(201,168,76,.25)' : 'none' }}
        >
          {converting ? (
            <>
              <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,.2)', borderTopColor: '#060a0e', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
              Converting...
            </>
          ) : fromCur === toCur ? 'Select different currencies' : 'Convert Now →'}
        </button>
      </div>

      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}
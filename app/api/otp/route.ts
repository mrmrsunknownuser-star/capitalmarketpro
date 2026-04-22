// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

var supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

var requestCounts = new Map()

function rateLimit(ip) {
  var now = Date.now()
  var record = requestCounts.get(ip)
  if (!record || now - record.start > 60000) {
    requestCounts.set(ip, { count: 1, start: now })
    return true
  }
  if (record.count >= 10) return false
  record.count++
  return true
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req) {
  var ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  try {
    var body = await req.json()
    var action = body.action
    var email = body.email
    var userId = body.user_id
    var code = body.code

    if (!action || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── SEND OTP ──────────────────────────────────────────────
    if (action === 'send') {
      // Delete any existing unused codes for this email
      await supabase
        .from('otp_codes')
        .delete()
        .eq('email', email.toLowerCase())
        .eq('used', false)

      var newCode = generateCode()
      var expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      // Save code to database
      var insertResult = await supabase.from('otp_codes').insert({
        user_id: userId || null,
        email: email.toLowerCase(),
        code: newCode,
        expires_at: expiresAt,
        used: false,
      })

      if (insertResult.error) {
        console.error('OTP insert error:', insertResult.error.message)
        return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
      }

      // Send email with the code
      var emailBody = `
        <div style="background:#060a0e;padding:40px;font-family:Inter,sans-serif;max-width:480px;margin:0 auto;border-radius:16px;border:1px solid #1e2530">
          <div style="text-align:center;margin-bottom:28px">
            <div style="width:50px;height:50px;background:linear-gradient(135deg,#C9A84C,#E8D08C);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#060a0e;margin-bottom:12px">C</div>
            <h2 style="color:#e8edf5;font-size:20px;font-weight:800;margin:0">Security Verification</h2>
            <p style="color:#4a5568;font-size:13px;margin-top:6px">CapitalMarket Pro Login Code</p>
          </div>
          <p style="color:#8892a0;font-size:14px;line-height:1.7;margin-bottom:24px">
            You requested a login verification code for your CapitalMarket Pro account. Enter the code below to complete your sign-in.
          </p>
          <div style="background:#141920;border:2px solid rgba(201,168,76,0.3);border-radius:14px;padding:24px;text-align:center;margin-bottom:24px">
            <div style="font-size:40px;font-weight:900;color:#C9A84C;letter-spacing:12px;font-family:monospace">${newCode}</div>
            <div style="color:#4a5568;font-size:12px;margin-top:10px">Expires in 10 minutes</div>
          </div>
          <p style="color:#4a5568;font-size:12px;line-height:1.7;margin-bottom:0">
            If you did not request this code, please ignore this email or contact support immediately at support@capitalmarket-pro.com
          </p>
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid #1e2530;text-align:center">
            <p style="color:#2a3140;font-size:11px;margin:0">CapitalMarket Pro Financial Services LLC | New York, USA</p>
          </div>
        </div>
      `

      var emailResult = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'raw',
          to: email.toLowerCase(),
          subject: newCode + ' is your CapitalMarket Pro login code',
          html: emailBody,
        }),
      })

      if (!emailResult.ok) {
        console.error('OTP email failed')
        return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Code sent to ' + email })
    }

    // ── VERIFY OTP ────────────────────────────────────────────
    if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ error: 'Code is required' }, { status: 400 })
      }

      var { data: otpRecord, error: findError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('code', code.toString())
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (findError || !otpRecord) {
        return NextResponse.json({ error: 'Invalid or expired code. Please try again.' }, { status: 400 })
      }

      // Check expiry
      var now = new Date()
      var expires = new Date(otpRecord.expires_at)
      if (now > expires) {
        await supabase.from('otp_codes').delete().eq('id', otpRecord.id)
        return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })
      }

      // Mark as used
      await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id)

      return NextResponse.json({ success: true, message: 'Code verified successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (err) {
    console.error('OTP route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
// @ts-nocheck
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

var resend = new Resend(process.env.RESEND_API_KEY)

var requestCounts = new Map()

function rateLimit(ip) {
  var now = Date.now()
  var record = requestCounts.get(ip)
  if (!record || now - record.start > 60000) {
    requestCounts.set(ip, { count: 1, start: now })
    return true
  }
  if (record.count >= 15) return false
  record.count++
  return true
}

var FROM = 'CapitalMarket Pro <noreply@capitalmarket-pro.com>'
var SUPPORT = 'support@capitalmarket-pro.com'
var SITE = 'https://capitalmarket-pro.com'

function baseTemplate(content) {
  return `
    <div style="background:#060a0e;min-height:100vh;padding:40px 20px;font-family:Inter,Arial,sans-serif">
      <div style="max-width:560px;margin:0 auto">
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#C9A84C,#E8D08C);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#060a0e">C</div>
          <div style="margin-top:10px;font-size:17px;font-weight:800;color:#e8edf5">CapitalMarket <span style="color:#C9A84C">Pro</span></div>
          <div style="font-size:10px;color:#4a5568;letter-spacing:0.1em;text-transform:uppercase;margin-top:3px">Global Trading Platform</div>
        </div>
        <div style="background:#0d1117;border:1px solid #1e2530;border-radius:20px;padding:36px;margin-bottom:24px">
          ${content}
        </div>
        <div style="text-align:center;font-size:11px;color:#2a3140;line-height:1.8">
          <p>CapitalMarket Pro Financial Services LLC | 350 Fifth Avenue, New York, NY 10118</p>
          <p>Need help? <a href="mailto:${SUPPORT}" style="color:#C9A84C">Contact Support</a></p>
          <p style="margin-top:8px;color:#1e2530">You received this email because you have an account on CapitalMarket Pro.</p>
        </div>
      </div>
    </div>
  `
}

var TEMPLATES = {
  welcome: function(data) {
    return {
      subject: 'Welcome to CapitalMarket Pro — Your Account Is Ready',
      html: baseTemplate(`
        <h2 style="color:#e8edf5;font-size:22px;font-weight:800;margin-bottom:8px">Welcome, ${data.name || 'Trader'}! 🎉</h2>
        <p style="color:#8892a0;font-size:14px;margin-bottom:20px">Your CapitalMarket Pro account has been created successfully. You are now part of a global community of 180,000+ investors.</p>
        <div style="background:#141920;border-radius:14px;padding:20px;margin-bottom:20px">
          <p style="color:#4a5568;font-size:12px;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Getting Started</p>
          ${['Complete your KYC verification to unlock all features', 'Make your first deposit (minimum $50)', 'Choose an investment plan or copy a top trader', 'Track your earnings in real time on your dashboard'].map(function(step, i) {
            return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#C9A84C,#E8D08C);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#060a0e;flex-shrink:0">' + (i + 1) + '</div><span style="color:#8892a0;font-size:13px">' + step + '</span></div>'
          }).join('')}
        </div>
        <a href="${SITE}/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:14px;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none">Go to Your Dashboard →</a>
      `),
    }
  },

  login_alert: function(data) {
    return {
      subject: 'New Login Detected — CapitalMarket Pro',
      html: baseTemplate(`
        <h2 style="color:#e8edf5;font-size:20px;font-weight:800;margin-bottom:8px">New Login Detected 🔐</h2>
        <p style="color:#8892a0;font-size:14px;margin-bottom:20px">A new login was detected on your CapitalMarket Pro account.</p>
        <div style="background:#141920;border-radius:14px;padding:20px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px"><span style="color:#4a5568">Time</span><span style="color:#e8edf5;font-weight:600">${data.time || new Date().toLocaleString()}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#4a5568">Device</span><span style="color:#e8edf5;font-weight:600">${data.device || 'Browser'}</span></div>
        </div>
        <div style="background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.2);border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="color:#e74c3c;font-size:13px;margin:0;line-height:1.7">If this was not you, please change your password immediately and contact our support team.</p>
        </div>
        <a href="${SITE}/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:14px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none">Secure My Account</a>
      `),
    }
  },

  deposit_confirmed: function(data) {
    return {
      subject: 'Deposit Confirmed — $' + (data.amount || '0') + ' Added to Your Account',
      html: baseTemplate(`
        <h2 style="color:#e8edf5;font-size:20px;font-weight:800;margin-bottom:8px">Deposit Confirmed ✅</h2>
        <p style="color:#8892a0;font-size:14px;margin-bottom:20px">Your deposit has been approved and credited to your CapitalMarket Pro account.</p>
        <div style="background:#141920;border-radius:14px;padding:20px;margin-bottom:20px">
          <div style="text-align:center;margin-bottom:16px">
            <div style="font-size:36px;font-weight:900;color:#2ecc71">$${data.amount || '0'}</div>
            <div style="font-size:12px;color:#4a5568;margin-top:4px">Successfully Credited</div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px"><span style="color:#4a5568">Method</span><span style="color:#e8edf5">${data.method || 'Crypto'}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#4a5568">Date</span><span style="color:#e8edf5">${new Date().toLocaleDateString()}</span></div>
        </div>
        <a href="${SITE}/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:14px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none">Start Investing Now →</a>
      `),
    }
  },

  withdrawal_approved: function(data) {
    return {
      subject: 'Withdrawal Approved — $' + (data.amount || '0') + ' Is On Its Way',
      html: baseTemplate(`
        <h2 style="color:#e8edf5;font-size:20px;font-weight:800;margin-bottom:8px">Withdrawal Approved ✅</h2>
        <p style="color:#8892a0;font-size:14px;margin-bottom:20px">Your withdrawal request has been approved and is being processed.</p>
        <div style="background:#141920;border-radius:14px;padding:20px;margin-bottom:20px">
          <div style="text-align:center;margin-bottom:16px">
            <div style="font-size:36px;font-weight:900;color:#C9A84C">$${data.amount || '0'}</div>
            <div style="font-size:12px;color:#4a5568;margin-top:4px">Approved and Processing</div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px"><span style="color:#4a5568">Wallet</span><span style="color:#e8edf5;font-size:12px">${data.wallet ? data.wallet.slice(0, 12) + '...' : 'On file'}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#4a5568">Processing Time</span><span style="color:#e8edf5">Within 24 hours</span></div>
        </div>
        <a href="${SITE}/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:14px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none">View Dashboard</a>
      `),
    }
  },

  withdrawal_rejected: function(data) {
    return {
      subject: 'Withdrawal Update — Action Required',
      html: baseTemplate(`
        <h2 style="color:#e8edf5;font-size:20px;font-weight:800;margin-bottom:8px">Withdrawal Could Not Be Processed</h2>
        <p style="color:#8892a0;font-size:14px;margin-bottom:20px">Unfortunately your withdrawal request could not be processed at this time.</p>
        <div style="background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.2);border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="color:#e74c3c;font-size:13px;margin:0;line-height:1.7">Reason: ${data.reason || 'Please ensure your KYC is verified and wallet address is correct.'}</p>
        </div>
        <p style="color:#8892a0;font-size:13px;margin-bottom:20px;line-height:1.7">Please contact our support team for assistance. We are here to help resolve this quickly.</p>
        <a href="${SITE}/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:14px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none">Contact Support</a>
      `),
    }
  },

  kyc_approved: function(data) {
    return {
      subject: 'KYC Verified — Your Account Is Fully Unlocked',
      html: baseTemplate(`
        <h2 style="color:#e8edf5;font-size:20px;font-weight:800;margin-bottom:8px">KYC Verification Approved ✅</h2>
        <p style="color:#8892a0;font-size:14px;margin-bottom:20px">Congratulations! Your identity has been verified. All features are now fully unlocked on your account.</p>
        <div style="background:#141920;border-radius:14px;padding:20px;margin-bottom:20px">
          ${['Withdrawals enabled', 'All investment plans accessible', 'Higher deposit limits', 'Pro Card application available', 'Priority customer support'].map(function(feat) {
            return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:13px;color:#8892a0"><span style="color:#2ecc71;font-size:14px">v</span>' + feat + '</div>'
          }).join('')}
        </div>
        <a href="${SITE}/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:14px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none">Start Investing →</a>
      `),
    }
  },

  kyc_rejected: function(data) {
    return {
      subject: 'KYC Verification — Resubmission Required',
      html: baseTemplate(`
        <h2 style="color:#e8edf5;font-size:20px;font-weight:800;margin-bottom:8px">KYC Resubmission Required</h2>
        <p style="color:#8892a0;font-size:14px;margin-bottom:20px">We were unable to verify your identity with the documents provided. Please resubmit with the corrections below.</p>
        <div style="background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.2);border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="color:#e74c3c;font-size:13px;margin:0;line-height:1.7">Reason: ${data.reason || 'Document unclear or invalid. Please upload a clear photo of a valid government-issued ID.'}</p>
        </div>
        <div style="background:#141920;border-radius:14px;padding:16px;margin-bottom:20px">
          ${['Ensure photo is clear and all corners visible', 'Document must not be expired', 'Use passport, national ID or drivers license', 'File must be JPG or PNG under 5MB'].map(function(tip) {
            return '<div style="font-size:13px;color:#8892a0;margin-bottom:8px;display:flex;align-items:center;gap:8px"><span style="color:#C9A84C">•</span>' + tip + '</div>'
          }).join('')}
        </div>
        <a href="${SITE}/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:14px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none">Resubmit Documents →</a>
      `),
    }
  },

  password_reset: function(data) {
    return {
      subject: 'Reset Your CapitalMarket Pro Password',
      html: baseTemplate(`
        <h2 style="color:#e8edf5;font-size:20px;font-weight:800;margin-bottom:8px">Password Reset Request 🔑</h2>
        <p style="color:#8892a0;font-size:14px;margin-bottom:20px">We received a request to reset the password for your account. Click the button below to create a new password.</p>
        <a href="${data.link || SITE + '/forgot-password'}" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:14px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none;margin-bottom:20px">Reset My Password →</a>
        <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.12);border-radius:12px;padding:14px">
          <p style="color:#4a5568;font-size:12px;margin:0;line-height:1.7">This link expires in 1 hour. If you did not request a password reset, please ignore this email. Your password will not be changed.</p>
        </div>
      `),
    }
  },

  card_approved: function(data) {
    return {
      subject: 'Your CapitalMarket Pro Card Is Approved',
      html: baseTemplate(`
        <h2 style="color:#e8edf5;font-size:20px;font-weight:800;margin-bottom:8px">Pro Card Approved 💳</h2>
        <p style="color:#8892a0;font-size:14px;margin-bottom:20px">Congratulations! Your CapitalMarket Pro Card application has been approved.</p>
        <div style="background:linear-gradient(135deg,#C9A84C,#E8D08C);border-radius:16px;padding:24px;margin-bottom:20px;text-align:center">
          <div style="font-size:13px;color:rgba(0,0,0,0.6);margin-bottom:6px">CapitalMarket Pro</div>
          <div style="font-size:20px;font-weight:800;color:#060a0e;letter-spacing:3px">${data.card_last4 ? '**** **** **** ' + data.card_last4 : '**** **** **** ****'}</div>
          <div style="font-size:12px;color:rgba(0,0,0,0.5);margin-top:8px">${data.card_type || 'Virtual Card'}</div>
        </div>
        <a href="${SITE}/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:14px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none">View My Card →</a>
      `),
    }
  },

  raw: function(data) {
    return {
      subject: data.subject || 'Message from CapitalMarket Pro',
      html: data.html || '<p>No content</p>',
    }
  },
}

export async function POST(req) {
  var ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
  }

  try {
    var body = await req.json()
    var type = body.type
    var to = body.to
    var data = body.data || {}

    if (!type || !to) {
      return NextResponse.json({ error: 'Missing type or to field' }, { status: 400 })
    }

    var templateFn = TEMPLATES[type]
    if (!templateFn) {
      return NextResponse.json({ error: 'Unknown email type: ' + type }, { status: 400 })
    }

    var template = templateFn(data)

    var result = await resend.emails.send({
      from: FROM,
      to: to,
      subject: template.subject,
      html: template.html,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.data && result.data.id })

  } catch (err) {
    console.error('Email route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
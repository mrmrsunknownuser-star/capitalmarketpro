import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'noreply@capitalmarket-pro.com'
const SITE_NAME = 'CapitalMarket Pro'

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log('No Resend API key — email skipped')
    return { success: false }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: `${SITE_NAME} <${FROM_EMAIL}>`, to, subject, html }),
  })
  return { success: res.ok }
}

const baseStyle = `
  font-family: 'Courier New', monospace;
  background: #060a0f;
  color: #e6edf3;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
`

const cardStyle = `
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 16px;
  padding: 32px;
  margin: 20px 0;
`

const btnStyle = `
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #C9A84C, #E8D08C);
  color: #060a0f;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  font-family: monospace;
  margin: 16px 0;
`

const logoHtml = `
  <div style="text-align:center; margin-bottom:32px;">
    <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#C9A84C,#E8D08C);display:inline-flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#060a0f;margin-bottom:12px;">C</div>
    <div style="font-size:20px;font-weight:800;"><span style="color:#C9A84C;">CapitalMarket</span><span style="color:#e6edf3;"> Pro</span></div>
    <div style="font-size:11px;color:#484f58;letter-spacing:0.1em;text-transform:uppercase;">Professional Trading Platform</div>
  </div>
`

const footerHtml = `
  <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #161b22;">
    <div style="font-size:12px;color:#484f58;line-height:1.8;">
      © 2025 CapitalMarket Pro Financial Services. All Rights Reserved.<br/>
      <a href="https://capitalmarket-pro.com" style="color:#C9A84C;text-decoration:none;">capitalmarket-pro.com</a>
      &nbsp;·&nbsp;
      <a href="https://capitalmarket-pro.com/terms" style="color:#484f58;text-decoration:none;">Terms & Privacy</a>
    </div>
  </div>
`

function getTemplate(type: string, data: any): { subject: string; html: string } | null {
  switch (type) {

    case 'welcome':
      return {
        subject: `🎉 Welcome to ${SITE_NAME}!`,
        html: `<div style="${baseStyle}">
          ${logoHtml}
          <div style="${cardStyle}">
            <h1 style="color:#C9A84C;font-size:24px;margin-bottom:8px;">Welcome, ${data.name || 'Trader'}! 👋</h1>
            <p style="color:#8b949e;line-height:1.9;margin-bottom:20px;">
              Your CapitalMarket Pro account is now active. You're one step closer to growing your wealth with our AI-powered automated trading system.
            </p>
            <div style="background:#161b22;border-radius:12px;padding:20px;margin-bottom:24px;">
              <div style="color:#e6edf3;font-weight:700;margin-bottom:12px;">🚀 Get Started in 3 Steps:</div>
              <div style="color:#8b949e;font-size:13px;line-height:2;">
                <div>1️⃣ Complete your <strong style="color:#C9A84C;">KYC verification</strong></div>
                <div>2️⃣ <strong style="color:#C9A84C;">Deposit funds</strong> via Bitcoin</div>
                <div>3️⃣ Choose an <strong style="color:#C9A84C;">investment plan</strong> and start earning</div>
              </div>
            </div>
            <div style="text-align:center;">
              <a href="https://capitalmarket-pro.com/dashboard" style="${btnStyle}">Go to Dashboard →</a>
            </div>
            <p style="color:#484f58;font-size:12px;text-align:center;margin-top:16px;">
              Questions? Your dedicated Account Manager <strong style="color:#C9A84C;">Joshua C. Elder</strong> is available 24/7.
            </p>
          </div>
          ${footerHtml}
        </div>`
      }

    case 'deposit_confirmed':
      return {
        subject: `✅ Deposit of $${data.amount?.toLocaleString()} Confirmed`,
        html: `<div style="${baseStyle}">
          ${logoHtml}
          <div style="${cardStyle}">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:48px;margin-bottom:12px;">✅</div>
              <h1 style="color:#3fb950;font-size:22px;margin-bottom:4px;">Deposit Confirmed!</h1>
              <div style="font-size:32px;font-weight:800;color:#C9A84C;">$${data.amount?.toLocaleString()}</div>
            </div>
            <div style="background:#161b22;border-radius:12px;padding:16px;margin-bottom:20px;">
              ${[
                ['Amount', `$${data.amount?.toLocaleString()}`],
                ['Cryptocurrency', data.crypto || 'Bitcoin (BTC)'],
                ['Status', '✅ Confirmed & Credited'],
                ['Account Balance', `$${data.newBalance?.toLocaleString() || 'Updated'}`],
              ].map(([l, v]) => `
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #21262d;">
                  <span style="color:#484f58;font-size:12px;">${l}</span>
                  <span style="color:#e6edf3;font-weight:600;font-size:12px;">${v}</span>
                </div>
              `).join('')}
            </div>
            <div style="text-align:center;">
              <a href="https://capitalmarket-pro.com/dashboard/invest" style="${btnStyle}">View Investment Plans →</a>
            </div>
          </div>
          ${footerHtml}
        </div>`
      }

    case 'withdrawal_approved':
      return {
        subject: `✅ Withdrawal of $${data.amount?.toLocaleString()} Approved`,
        html: `<div style="${baseStyle}">
          ${logoHtml}
          <div style="${cardStyle}">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:48px;margin-bottom:12px;">💸</div>
              <h1 style="color:#3fb950;font-size:22px;margin-bottom:4px;">Withdrawal Approved!</h1>
              <div style="font-size:32px;font-weight:800;color:#C9A84C;">$${data.amount?.toLocaleString()}</div>
            </div>
            <div style="background:#161b22;border-radius:12px;padding:16px;margin-bottom:20px;">
              ${[
                ['Amount', `$${data.amount?.toLocaleString()}`],
                ['Network', data.network || 'Bitcoin (BTC)'],
                ['Wallet', data.wallet ? data.wallet.slice(0, 20) + '...' : '—'],
                ['Status', '✅ Processing'],
                ['ETA', '24-48 hours'],
              ].map(([l, v]) => `
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #21262d;">
                  <span style="color:#484f58;font-size:12px;">${l}</span>
                  <span style="color:#e6edf3;font-weight:600;font-size:12px;">${v}</span>
                </div>
              `).join('')}
            </div>
            <p style="color:#8b949e;font-size:13px;line-height:1.8;text-align:center;">
              Your funds are being sent to your wallet. You will receive a blockchain confirmation once complete.
            </p>
          </div>
          ${footerHtml}
        </div>`
      }

    case 'withdrawal_rejected':
      return {
        subject: `❌ Withdrawal Request Update`,
        html: `<div style="${baseStyle}">
          ${logoHtml}
          <div style="${cardStyle}">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:48px;margin-bottom:12px;">❌</div>
              <h1 style="color:#f85149;font-size:22px;">Withdrawal Not Processed</h1>
            </div>
            <p style="color:#8b949e;line-height:1.9;margin-bottom:16px;">
              Your withdrawal request of <strong style="color:#e6edf3;">$${data.amount?.toLocaleString()}</strong> could not be processed at this time.
              ${data.reason ? `<br/><br/>Reason: <strong style="color:#C9A84C;">${data.reason}</strong>` : ''}
            </p>
            <div style="text-align:center;">
              <a href="https://capitalmarket-pro.com/dashboard/support" style="${btnStyle}">Contact Support →</a>
            </div>
          </div>
          ${footerHtml}
        </div>`
      }

    case 'kyc_approved':
      return {
        subject: `✅ Identity Verified — Full Access Unlocked`,
        html: `<div style="${baseStyle}">
          ${logoHtml}
          <div style="${cardStyle}">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:48px;margin-bottom:12px;">🎉</div>
              <h1 style="color:#3fb950;font-size:22px;">KYC Approved!</h1>
              <p style="color:#8b949e;font-size:14px;">Your identity has been verified</p>
            </div>
            <div style="background:#161b22;border-radius:12px;padding:16px;margin-bottom:20px;">
              <div style="color:#e6edf3;font-weight:700;margin-bottom:12px;">✅ Features Unlocked:</div>
              ${['Withdrawals enabled', 'All investment plans available', 'Pro Cards available', 'Full affiliate program', 'Priority support'].map(f => `
                <div style="color:#3fb950;font-size:13px;padding:4px 0;">✓ ${f}</div>
              `).join('')}
            </div>
            <div style="text-align:center;">
              <a href="https://capitalmarket-pro.com/dashboard" style="${btnStyle}">Access Full Platform →</a>
            </div>
          </div>
          ${footerHtml}
        </div>`
      }

    case 'kyc_rejected':
      return {
        subject: `⚠️ KYC Verification — Action Required`,
        html: `<div style="${baseStyle}">
          ${logoHtml}
          <div style="${cardStyle}">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
              <h1 style="color:#f85149;font-size:22px;">Verification Needs Attention</h1>
            </div>
            <p style="color:#8b949e;line-height:1.9;margin-bottom:16px;">
              Your identity verification could not be completed. ${data.reason ? `Reason: <strong style="color:#C9A84C;">${data.reason}</strong>` : 'Please resubmit clearer documents.'}
            </p>
            <div style="text-align:center;">
              <a href="https://capitalmarket-pro.com/dashboard/kyc" style="${btnStyle}">Resubmit Documents →</a>
            </div>
          </div>
          ${footerHtml}
        </div>`
      }

    case 'card_approved':
      return {
        subject: `✅ Your ${data.cardName} is Now Active!`,
        html: `<div style="${baseStyle}">
          ${logoHtml}
          <div style="${cardStyle}">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:48px;margin-bottom:12px;">💳</div>
              <h1 style="color:#3fb950;font-size:22px;">${data.cardName} Activated!</h1>
            </div>
            <p style="color:#8b949e;line-height:1.9;margin-bottom:20px;">
              Congratulations! Your <strong style="color:#C9A84C;">${data.cardName}</strong> is now active and ready to use. ${data.type === 'physical' ? 'Your physical card will be shipped to your registered address.' : 'You can start using your virtual card immediately.'}
            </p>
            <div style="text-align:center;">
              <a href="https://capitalmarket-pro.com/dashboard/card" style="${btnStyle}">View My Card →</a>
            </div>
          </div>
          ${footerHtml}
        </div>`
      }

    case 'password_reset':
      return {
        subject: `🔒 Password Reset Request`,
        html: `<div style="${baseStyle}">
          ${logoHtml}
          <div style="${cardStyle}">
            <h1 style="color:#C9A84C;font-size:22px;margin-bottom:8px;">Password Reset</h1>
            <p style="color:#8b949e;line-height:1.9;margin-bottom:20px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            <div style="text-align:center;">
              <a href="${data.resetUrl}" style="${btnStyle}">Reset Password →</a>
            </div>
            <p style="color:#484f58;font-size:12px;text-align:center;margin-top:16px;">
              If you didn't request this, please ignore this email. Link expires in 1 hour.
            </p>
          </div>
          ${footerHtml}
        </div>`
      }

    default:
      return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, to, data } = body

    if (!to || !type) {
      return NextResponse.json({ error: 'Missing to or type' }, { status: 400 })
    }

    const template = getTemplate(type, data || {})
    if (!template) {
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }

    const result = await sendEmail(to, template.subject, template.html)
    return NextResponse.json({ success: result.success })
  } catch (err) {
    console.error('Email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
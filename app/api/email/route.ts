import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { type, to, data } = await req.json()

    let subject = ''
    let html = ''

    const baseStyle = `
      font-family: 'Courier New', monospace;
      background: #060a0f;
      color: #e6edf3;
      padding: 0;
      margin: 0;
    `

    const header = `
      <div style="background: #0d1117; padding: 24px 32px; border-bottom: 1px solid #C9A84C;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #C9A84C, #E8D08C); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #060a0f;">C</div>
          <div>
            <div style="font-size: 16px; font-weight: 700; color: #C9A84C;">CapitalMarket Pro</div>
            <div style="font-size: 11px; color: #484f58;">Professional Trading Platform</div>
          </div>
        </div>
      </div>
    `

    const footer = `
      <div style="background: #0a0e14; padding: 20px 32px; border-top: 1px solid #161b22; text-align: center;">
        <div style="font-size: 11px; color: #484f58; margin-bottom: 8px;">
          © 2025 CapitalMarket Pro. All rights reserved.
        </div>
        <div style="font-size: 11px; color: #484f58;">
          🔒 256-bit SSL Encrypted · Your funds are protected
        </div>
      </div>
    `

    if (type === 'welcome') {
      subject = '🎉 Welcome to CapitalMarket Pro'
      html = `
        <div style="${baseStyle}">
          ${header}
          <div style="padding: 32px; background: #060a0f;">
            <h1 style="font-size: 24px; font-weight: 800; color: #e6edf3; margin-bottom: 8px;">Welcome, ${data.name}! 👋</h1>
            <p style="font-size: 14px; color: #8b949e; line-height: 1.8; margin-bottom: 24px;">
              Your CapitalMarket Pro account has been created successfully. You now have access to professional crypto trading, stock investments, and our affiliate program.
            </p>
            <div style="background: #0d1117; border: 1px solid #161b22; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <div style="font-size: 13px; font-weight: 600; color: #C9A84C; margin-bottom: 12px;">Get started in 3 steps:</div>
              ${['Complete your KYC verification', 'Make your first deposit via Bitcoin', 'Start trading and earning'].map((s, i) => `
                <div style="display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-start;">
                  <div style="width: 24px; height: 24px; background: rgba(201,168,76,0.15); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #C9A84C; flex-shrink: 0;">${i + 1}</div>
                  <div style="font-size: 13px; color: #8b949e; padding-top: 3px;">${s}</div>
                </div>
              `).join('')}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #C9A84C, #E8D08C); border-radius: 10px; color: #060a0f; font-size: 13px; font-weight: 700; text-decoration: none;">
              Go to Dashboard →
            </a>
          </div>
          ${footer}
        </div>
      `
    }

    if (type === 'deposit_confirmed') {
      subject = '✅ Deposit Confirmed — CapitalMarket Pro'
      html = `
        <div style="${baseStyle}">
          ${header}
          <div style="padding: 32px; background: #060a0f;">
            <div style="background: rgba(63,185,80,0.08); border: 1px solid rgba(63,185,80,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
              <div style="font-size: 18px; font-weight: 700; color: #3fb950;">Deposit Confirmed</div>
            </div>
            <p style="font-size: 14px; color: #8b949e; line-height: 1.8; margin-bottom: 20px;">
              Your deposit of <strong style="color: #e6edf3;">$${data.amount}</strong> has been confirmed and credited to your CapitalMarket Pro account.
            </p>
            <div style="background: #0d1117; border: 1px solid #161b22; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              ${[
                { label: 'Amount', value: `$${data.amount}` },
                { label: 'Transaction ID', value: data.txId || 'N/A' },
                { label: 'Date', value: new Date().toLocaleString() },
                { label: 'Status', value: '✅ Confirmed' },
              ].map(row => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #161b22;">
                  <span style="font-size: 12px; color: #484f58;">${row.label}</span>
                  <span style="font-size: 12px; color: #e6edf3; font-weight: 500;">${row.value}</span>
                </div>
              `).join('')}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #C9A84C, #E8D08C); border-radius: 10px; color: #060a0f; font-size: 13px; font-weight: 700; text-decoration: none;">
              View Dashboard →
            </a>
          </div>
          ${footer}
        </div>
      `
    }

    if (type === 'withdrawal_approved') {
      subject = '✅ Withdrawal Approved — CapitalMarket Pro'
      html = `
        <div style="${baseStyle}">
          ${header}
          <div style="padding: 32px; background: #060a0f;">
            <div style="background: rgba(63,185,80,0.08); border: 1px solid rgba(63,185,80,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
              <div style="font-size: 18px; font-weight: 700; color: #3fb950;">Withdrawal Approved</div>
            </div>
            <p style="font-size: 14px; color: #8b949e; line-height: 1.8; margin-bottom: 20px;">
              Your withdrawal request of <strong style="color: #e6edf3;">$${data.amount}</strong> has been approved and is being processed.
            </p>
            <div style="background: #0d1117; border: 1px solid #161b22; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              ${[
                { label: 'Amount', value: `$${data.amount}` },
                { label: 'Request ID', value: data.requestId },
                { label: 'Wallet Address', value: data.wallet?.slice(0, 20) + '...' },
                { label: 'Network', value: data.network || 'Bitcoin' },
                { label: 'Status', value: '✅ Approved' },
                { label: 'Processing Time', value: '1-3 business hours' },
              ].map(row => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #161b22;">
                  <span style="font-size: 12px; color: #484f58;">${row.label}</span>
                  <span style="font-size: 12px; color: #e6edf3; font-weight: 500;">${row.value}</span>
                </div>
              `).join('')}
            </div>
          </div>
          ${footer}
        </div>
      `
    }

    if (type === 'withdrawal_rejected') {
      subject = '❌ Withdrawal Rejected — CapitalMarket Pro'
      html = `
        <div style="${baseStyle}">
          ${header}
          <div style="padding: 32px; background: #060a0f;">
            <div style="background: rgba(248,81,73,0.08); border: 1px solid rgba(248,81,73,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 8px;">❌</div>
              <div style="font-size: 18px; font-weight: 700; color: #f85149;">Withdrawal Rejected</div>
            </div>
            <p style="font-size: 14px; color: #8b949e; line-height: 1.8; margin-bottom: 20px;">
              Your withdrawal request of <strong style="color: #e6edf3;">$${data.amount}</strong> has been rejected.
            </p>
            ${data.reason ? `
              <div style="background: rgba(248,81,73,0.06); border: 1px solid rgba(248,81,73,0.15); border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                <div style="font-size: 12px; font-weight: 600; color: #f85149; margin-bottom: 4px;">Reason:</div>
                <div style="font-size: 12px; color: #8b949e;">${data.reason}</div>
              </div>
            ` : ''}
            <p style="font-size: 13px; color: #8b949e; margin-bottom: 20px;">
              Please contact our support team if you have questions or wish to resubmit your withdrawal request.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/support" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #C9A84C, #E8D08C); border-radius: 10px; color: #060a0f; font-size: 13px; font-weight: 700; text-decoration: none;">
              Contact Support →
            </a>
          </div>
          ${footer}
        </div>
      `
    }

    if (type === 'kyc_approved') {
      subject = '✅ Identity Verified — CapitalMarket Pro'
      html = `
        <div style="${baseStyle}">
          ${header}
          <div style="padding: 32px; background: #060a0f;">
            <div style="background: rgba(63,185,80,0.08); border: 1px solid rgba(63,185,80,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
              <div style="font-size: 18px; font-weight: 700; color: #3fb950;">Identity Verified!</div>
            </div>
            <p style="font-size: 14px; color: #8b949e; line-height: 1.8; margin-bottom: 20px;">
              Congratulations! Your identity has been successfully verified. Your account now has full access to all CapitalMarket Pro features.
            </p>
            <div style="background: #0d1117; border: 1px solid #161b22; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <div style="font-size: 13px; font-weight: 600; color: #e6edf3; margin-bottom: 12px;">Features now unlocked:</div>
              ${['💸 Withdrawals to your wallet', '📈 Increased trading limits', '⚡ All premium signals', '🔗 Full affiliate program access', '🏆 Priority customer support'].map(f => `
                <div style="font-size: 12px; color: #8b949e; padding: 6px 0; border-bottom: 1px solid #161b22;">${f}</div>
              `).join('')}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #C9A84C, #E8D08C); border-radius: 10px; color: #060a0f; font-size: 13px; font-weight: 700; text-decoration: none;">
              Go to Dashboard →
            </a>
          </div>
          ${footer}
        </div>
      `
    }

    if (type === 'notification') {
      subject = `🔔 ${data.title} — CapitalMarket Pro`
      html = `
        <div style="${baseStyle}">
          ${header}
          <div style="padding: 32px; background: #060a0f;">
            <h2 style="font-size: 20px; font-weight: 700; color: #e6edf3; margin-bottom: 12px;">${data.title}</h2>
            <p style="font-size: 14px; color: #8b949e; line-height: 1.8; margin-bottom: 24px;">${data.message}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #C9A84C, #E8D08C); border-radius: 10px; color: #060a0f; font-size: 13px; font-weight: 700; text-decoration: none;">
              View Notifications →
            </a>
          </div>
          ${footer}
        </div>
      `
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'CapitalMarket Pro <noreply@capitalmarketpro.com>',
      to: [to],
      subject,
      html,
    })

    if (error) return NextResponse.json({ error }, { status: 400 })
    return NextResponse.json({ success: true, id: emailData?.id })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
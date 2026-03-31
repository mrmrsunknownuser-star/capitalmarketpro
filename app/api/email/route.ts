import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { type, to, data } = await req.json()

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true, message: 'Email skipped - no API key' })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const subjects: Record<string, string> = {
      welcome: '🎉 Welcome to CapitalMarket Pro',
      deposit_confirmed: '✅ Deposit Confirmed',
      withdrawal_approved: '✅ Withdrawal Approved',
      withdrawal_rejected: '❌ Withdrawal Rejected',
      kyc_approved: '✅ Identity Verified',
      notification: `🔔 ${data?.title || 'Notification'}`,
    }

    await resend.emails.send({
      from: 'CapitalMarket Pro <onboarding@resend.dev>',
      to: [to],
      subject: subjects[type] || 'CapitalMarket Pro',
      html: `<div style="font-family:monospace;background:#060a0f;color:#e6edf3;padding:32px">
        <div style="background:linear-gradient(135deg,#C9A84C,#E8D08C);width:40px;height:40px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#060a0f;margin-bottom:16px">C</div>
        <h2 style="color:#C9A84C">CapitalMarket Pro</h2>
        <p style="color:#8b949e">${data?.message || 'You have a new notification from CapitalMarket Pro.'}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://capitalmarket-pro.com'}/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#C9A84C,#E8D08C);border-radius:8px;color:#060a0f;font-weight:700;text-decoration:none">Go to Dashboard →</a>
        <p style="color:#484f58;font-size:11px;margin-top:24px">© 2025 CapitalMarket Pro. Trading involves risk.</p>
      </div>`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false, error: 'Email failed' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, data } = body

  const formatDate = (d: string) => new Date(d || Date.now()).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; background: #060a0f; color: #e6edf3; padding: 40px; max-width: 600px; margin: 0 auto; }
  .logo { text-align: center; margin-bottom: 32px; }
  .logo-box { width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg,#C9A84C,#E8D08C); display: inline-flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: #060a0f; margin-bottom: 12px; }
  .brand { font-size: 20px; font-weight: 800; }
  .brand span:first-child { color: #C9A84C; }
  .brand span:last-child { color: #e6edf3; }
  .tagline { font-size: 11px; color: #484f58; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
  .receipt-box { background: #0d1117; border: 1px solid #21262d; border-radius: 16px; padding: 28px; margin-bottom: 24px; }
  .receipt-title { font-size: 18px; font-weight: 800; color: #e6edf3; margin-bottom: 6px; }
  .receipt-subtitle { font-size: 12px; color: #484f58; margin-bottom: 24px; }
  .amount-big { text-align: center; padding: 20px; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2); border-radius: 12px; margin-bottom: 24px; }
  .amount-big .label { font-size: 11px; color: #484f58; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .amount-big .value { font-size: 36px; font-weight: 800; color: #C9A84C; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #161b22; }
  .row:last-child { border-bottom: none; }
  .row .label { font-size: 12px; color: #484f58; }
  .row .value { font-size: 12px; color: #e6edf3; font-weight: 500; text-align: right; max-width: 60%; word-break: break-all; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .status-approved { background: rgba(63,185,80,0.15); color: #3fb950; }
  .status-pending { background: rgba(247,166,0,0.15); color: #F7A600; }
  .footer { text-align: center; padding-top: 24px; border-top: 1px solid #161b22; }
  .footer p { font-size: 10px; color: #484f58; line-height: 1.8; }
  .verified { display: inline-flex; align-items: center; gap: 8px; background: rgba(63,185,80,0.1); border: 1px solid rgba(63,185,80,0.2); border-radius: 20px; padding: 8px 16px; margin: 16px 0; font-size: 12px; color: #3fb950; font-weight: 700; }
</style>
</head>
<body>

<div class="logo">
  <div class="logo-box">C</div>
  <div class="brand"><span>CapitalMarket</span><span> Pro</span></div>
  <div class="tagline">Professional Trading Platform · EST. 2018</div>
</div>

<div class="receipt-box">
  <div class="receipt-title">${type === 'deposit' ? '💰 Deposit Receipt' : type === 'withdrawal' ? '⬆ Withdrawal Receipt' : '📄 Transaction Receipt'}</div>
  <div class="receipt-subtitle">Official transaction confirmation</div>

  <div class="amount-big">
    <div class="label">${type === 'deposit' ? 'Amount Deposited' : type === 'withdrawal' ? 'Amount Withdrawn' : 'Transaction Amount'}</div>
    <div class="value">$${parseFloat(data.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
  </div>

  <div class="row"><span class="label">Receipt ID</span><span class="value">${Math.random().toString(36).slice(2, 12).toUpperCase()}</span></div>
  <div class="row"><span class="label">Date & Time</span><span class="value">${formatDate(data.date)}</span></div>
  <div class="row"><span class="label">Account</span><span class="value">${data.email || '—'}</span></div>
  ${type === 'deposit' ? `<div class="row"><span class="label">Cryptocurrency</span><span class="value">${data.crypto || 'Bitcoin (BTC)'}</span></div>` : ''}
  ${type === 'withdrawal' ? `<div class="row"><span class="label">Network</span><span class="value">${data.network || 'Bitcoin (BTC)'}</span></div>` : ''}
  ${type === 'withdrawal' ? `<div class="row"><span class="label">Processing Fee (5%)</span><span class="value">$${(parseFloat(data.amount || 0) * 0.05).toFixed(2)}</span></div>` : ''}
  ${data.txHash ? `<div class="row"><span class="label">Transaction Hash</span><span class="value">${data.txHash}</span></div>` : ''}
  <div class="row"><span class="label">Status</span><span class="value"><span class="status-badge ${data.status === 'approved' ? 'status-approved' : 'status-pending'}">${data.status === 'approved' ? '✅ Confirmed' : '⏳ Pending'}</span></span></div>

  <div style="text-align:center;">
    <div class="verified">✅ Verified by CapitalMarket Pro</div>
  </div>
</div>

<div class="footer">
  <p>
    This is an official receipt from CapitalMarket Pro Financial Services.<br>
    Keep this document for your records.<br><br>
    Questions? Contact support@capitalmarket-pro.com<br>
    capitalmarket-pro.com · EST. 2018<br><br>
    © 2025 CapitalMarket Pro Financial Services. All Rights Reserved.
  </p>
</div>

</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="capitalmarket-receipt-${Date.now()}.html"`,
    },
  })
}
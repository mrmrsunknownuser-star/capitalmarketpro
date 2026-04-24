// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

var supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Prevent duplicate notifications within 30 mins per IP
var recentVisitors = new Map()

export async function POST(req) {
  try {
    var body = await req.json()
    var page = body.page || '/'

    // Get real IP
    var ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    ip = ip.split(',')[0].trim()

    // Skip localhost
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'unknown') {
      return NextResponse.json({ ok: true })
    }

    // Skip if same IP visited in last 30 mins
    var lastVisit = recentVisitors.get(ip)
    var now = Date.now()
    if (lastVisit && now - lastVisit < 30 * 60 * 1000) {
      return NextResponse.json({ ok: true })
    }
    recentVisitors.set(ip, now)

    // Get location from IP
    var geoRes = await fetch('http://ip-api.com/json/' + ip + '?fields=country,regionName,city,isp,timezone,status')
    var geo = await geoRes.json()

    var country = geo.status === 'success' ? geo.country : 'Unknown'
    var city = geo.city || 'Unknown'
    var region = geo.regionName || 'Unknown'
    var timezone = geo.timezone || 'Unknown'
    var isp = geo.isp || 'Unknown'
    var userAgent = req.headers.get('user-agent') || 'Unknown'
    var referrer = body.referrer || 'Direct'

    // Save to database
    await supabase.from('visitor_logs').insert({
      ip: ip,
      country: country,
      city: city,
      region: region,
      timezone: timezone,
      isp: isp,
      page: page,
      user_agent: userAgent,
      referrer: referrer,
    })

    // Detect device type
    var device = 'Desktop'
    if (userAgent.toLowerCase().includes('mobile')) device = 'Mobile'
    else if (userAgent.toLowerCase().includes('tablet')) device = 'Tablet'

    // Send email notification to admin
    var emailHtml = `
      <div style="background:#060a0e;padding:32px;font-family:Inter,sans-serif;max-width:520px;margin:0 auto;border-radius:16px;border:1px solid #1e2530">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
          <div style="width:40px;height:40px;background:linear-gradient(135deg,#C9A84C,#E8D08C);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#060a0e">C</div>
          <div>
            <div style="font-size:15px;font-weight:800;color:#e8edf5">CapitalMarket <span style="color:#C9A84C">Pro</span></div>
            <div style="font-size:10px;color:#4a5568;text-transform:uppercase;letter-spacing:.1em">Visitor Alert</div>
          </div>
        </div>

        <div style="background:#0d1117;border:1px solid rgba(46,204,113,.2);border-radius:14px;padding:20px;margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <div style="width:8px;height:8px;border-radius:50%;background:#2ecc71"></div>
            <span style="font-size:14px;font-weight:700;color:#2ecc71">New Visitor Detected</span>
          </div>
          <table style="width:100%;border-collapse:collapse">
            ${[
              ['🌍 Country', country],
              ['🏙 City', city + ', ' + region],
              ['🕐 Timezone', timezone],
              ['📡 IP Address', ip],
              ['🌐 ISP / Network', isp],
              ['📱 Device', device],
              ['📄 Page Visited', page],
              ['🔗 Referrer', referrer],
              ['🕒 Time', new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' }) + ' EST'],
            ].map(function(row) {
              return '<tr><td style="padding:8px 0;font-size:12px;color:#4a5568;width:140px">' + row[0] + '</td><td style="padding:8px 0;font-size:13px;color:#e8edf5;font-weight:600">' + row[1] + '</td></tr>'
            }).join('')}
          </table>
        </div>

        <div style="background:#141920;border-radius:12px;padding:14px;margin-bottom:16px">
          <div style="font-size:11px;color:#4a5568;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">User Agent</div>
          <div style="font-size:11px;color:#8892a0;line-height:1.6;word-break:break-all">${userAgent}</div>
        </div>

        <a href="https://capitalmarket-pro.com/admin/dashboard" style="display:block;text-align:center;background:linear-gradient(135deg,#C9A84C,#E8D08C);color:#060a0e;padding:13px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none">
          View Admin Dashboard →
        </a>

        <div style="margin-top:16px;text-align:center;font-size:11px;color:#2a3140">
          CapitalMarket Pro · Visitor Tracking System
        </div>
      </div>
    `

    await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'raw',
        to: 'admincapitalmarketpro@gmail.com',
        subject: '👁 New Visitor — ' + country + ' — ' + page,
        html: emailHtml,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Visitor tracking error:', err)
    return NextResponse.json({ ok: true })
  }
}
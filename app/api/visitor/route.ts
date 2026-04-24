// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

var supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
var resend = new Resend(process.env.RESEND_API_KEY)
var seen = new Map()

export async function POST(req) {
  try {
    var body = await req.json()
    var ip = req.headers.get('x-forwarded-for') || 'unknown'
    ip = ip.split(',')[0].trim()

    if (ip === '127.0.0.1' || ip === '::1') return NextResponse.json({ ok: true })

    var now = Date.now()
    if (seen.get(ip) && now - seen.get(ip) < 1800000) return NextResponse.json({ ok: true })
    seen.set(ip, now)

    var geo = { country: 'Unknown', city: 'Unknown', regionName: 'Unknown', isp: 'Unknown', timezone: 'Unknown' }
    try {
      var geoRes = await fetch('http://ip-api.com/json/' + ip)
      var geoData = await geoRes.json()
      if (geoData.status === 'success') geo = geoData
    } catch (e) {}

    var ua = req.headers.get('user-agent') || 'Unknown'
    var device = ua.toLowerCase().includes('mobile') ? 'Mobile' : 'Desktop'

    await supabase.from('visitor_logs').insert({
      ip: ip,
      country: geo.country,
      city: geo.city,
      region: geo.regionName,
      timezone: geo.timezone,
      isp: geo.isp,
      page: body.page || '/',
      user_agent: ua,
      referrer: body.referrer || 'Direct',
    }).catch(function() {})

    await resend.emails.send({
      from: 'CapitalMarket Pro <noreply@capitalmarket-pro.com>',
      to: 'admincapitalmarketpro@gmail.com',
      subject: '👁 New Visitor from ' + geo.country + ' — ' + (body.page || '/'),
      html: `
        <div style="background:#060a0e;padding:32px;font-family:Inter,sans-serif;border-radius:16px;max-width:500px;margin:0 auto;border:1px solid #1e2530">
          <h2 style="color:#C9A84C;margin-bottom:24px">👁 New Visitor on CapitalMarket Pro</h2>
          <table style="width:100%">
            <tr><td style="color:#4a5568;padding:8px 0;font-size:13px">🌍 Country</td><td style="color:#e8edf5;font-weight:700;font-size:13px">${geo.country}</td></tr>
            <tr><td style="color:#4a5568;padding:8px 0;font-size:13px">🏙 City</td><td style="color:#e8edf5;font-weight:700;font-size:13px">${geo.city}, ${geo.regionName}</td></tr>
            <tr><td style="color:#4a5568;padding:8px 0;font-size:13px">📡 IP Address</td><td style="color:#e8edf5;font-weight:700;font-size:13px">${ip}</td></tr>
            <tr><td style="color:#4a5568;padding:8px 0;font-size:13px">🌐 ISP</td><td style="color:#e8edf5;font-weight:700;font-size:13px">${geo.isp}</td></tr>
            <tr><td style="color:#4a5568;padding:8px 0;font-size:13px">📱 Device</td><td style="color:#e8edf5;font-weight:700;font-size:13px">${device}</td></tr>
            <tr><td style="color:#4a5568;padding:8px 0;font-size:13px">📄 Page</td><td style="color:#e8edf5;font-weight:700;font-size:13px">${body.page || '/'}</td></tr>
            <tr><td style="color:#4a5568;padding:8px 0;font-size:13px">🔗 Referrer</td><td style="color:#e8edf5;font-weight:700;font-size:13px">${body.referrer || 'Direct'}</td></tr>
            <tr><td style="color:#4a5568;padding:8px 0;font-size:13px">🕐 Time</td><td style="color:#e8edf5;font-weight:700;font-size:13px">${new Date().toUTCString()}</td></tr>
          </table>
        </div>
      `
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Visitor error:', err)
    return NextResponse.json({ ok: true })
  }
}
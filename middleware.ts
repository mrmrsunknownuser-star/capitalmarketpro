// @ts-nocheck
import { NextResponse } from 'next/server'

export function middleware(request) {
  var response = NextResponse.next()
  var url = request.nextUrl.pathname

  // Security headers on every response
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s.tradingview.com https://fonts.googleapis.com https://www.youtube.com; frame-src 'self' https://s.tradingview.com https://www.youtube.com https://www.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com;")

  return response
}

export var config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
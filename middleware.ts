// @ts-nocheck
import { NextResponse } from 'next/server'

export function middleware(request) {
  var response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  return response
}

export var config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
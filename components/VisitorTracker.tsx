// @ts-nocheck
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  var pathname = usePathname()

  useEffect(function() {
    // Only track landing page and public pages, not dashboard or admin
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return

    try {
      fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pathname,
          referrer: document.referrer || 'Direct',
        }),
      })
    } catch (e) {}
  }, [pathname])

  return null
}
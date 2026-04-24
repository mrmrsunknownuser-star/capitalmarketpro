// @ts-nocheck
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  var pathname = usePathname()

  useEffect(function() {
    fetch('/api/visitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: pathname,
        referrer: typeof document !== 'undefined' ? (document.referrer || 'Direct') : 'Direct',
      }),
    }).then(function(r) { return r.json() }).then(function(d) {
      console.log('Visitor tracked:', d)
    }).catch(function(e) {
      console.log('Visitor track error:', e)
    })
  }, [])

  return null
}
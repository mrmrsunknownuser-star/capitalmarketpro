'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboardPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/users') }, [])
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'monospace', color: '#484f58' }}>
      Redirecting...
    </div>
  )
}
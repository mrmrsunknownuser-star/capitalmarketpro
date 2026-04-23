// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

var supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function verifyAdmin(req) {
  var authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  var token = authHeader.replace('Bearer ', '')
  var result = await supabase.auth.getUser(token)
  if (result.error || !result.data.user) return null
  var profile = await supabase.from('users').select('role').eq('id', result.data.user.id).single()
  if (!profile.data || profile.data.role !== 'admin') return null
  return result.data.user
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
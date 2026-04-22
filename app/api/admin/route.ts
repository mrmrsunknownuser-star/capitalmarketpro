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
  var { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  var { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return user
}
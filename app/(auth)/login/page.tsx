'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
    if (profile?.role === 'admin') { router.push('/admin/dashboard') } else { router.push('/dashboard') }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8D08C] mb-4">
          <span className="text-xl font-bold text-[#060a0f]">C</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">CapitalMarket Pro</h1>
        <p className="text-[#8b949e] text-sm mt-1">Sign in to your account</p>
      </div>

      <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-8">
        <h2 className="text-lg font-semibold text-white mb-6">Welcome back</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-[#8b949e] mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3 text-white text-sm placeholder-[#484f58] focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8b949e] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3 text-white text-sm placeholder-[#484f58] focus:outline-none focus:border-[#C9A84C] transition-colors pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] text-xs">
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-[#C9A84C] hover:text-[#E8D08C] transition-colors">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8D08C] text-[#060a0f] font-bold py-3 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#21262d]" />
          <span className="text-xs text-[#484f58]">OR</span>
          <div className="flex-1 h-px bg-[#21262d]" />
        </div>

        <p className="text-center text-sm text-[#8b949e]">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#C9A84C] hover:text-[#E8D08C] font-medium transition-colors">
            Create account
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-[#484f58] mt-6">
        🔒 256-bit SSL Encrypted · Your funds are protected
      </p>
    </div>
  )
}
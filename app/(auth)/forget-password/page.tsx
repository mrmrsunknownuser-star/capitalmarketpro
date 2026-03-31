'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8D08C] mb-4">
          <span className="text-xl font-bold text-[#060a0f]">CM</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">VaultFlow</h1>
        <p className="text-[#8b949e] text-sm mt-1">Reset your password</p>
      </div>

      <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-8">

        {/* Success state */}
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
            <p className="text-[#8b949e] text-sm mb-6">
              We sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-xs text-[#484f58] mb-6">
              Didn't receive it? Check your spam folder or try again.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-sm text-[#C9A84C] hover:text-[#E8D08C] transition-colors"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-2">Forgot password?</h2>
            <p className="text-[#8b949e] text-sm mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8D08C] text-[#060a0f] font-bold py-3 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#21262d]" />
        </div>

        <p className="text-center text-sm text-[#8b949e]">
          Remember your password?{' '}
          <Link href="/login" className="text-[#C9A84C] hover:text-[#E8D08C] font-medium transition-colors">
            Back to login
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-[#484f58] mt-6">
        🔒 256-bit SSL Encrypted · Your funds are protected
      </p>
    </div>
  )
}
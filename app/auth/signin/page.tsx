'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

const demoAccounts = [
  { label: 'Passenger', email: 'passenger@kipita.app', password: 'passenger' },
  { label: 'Driver', email: 'driver@kipita.app', password: 'driver' },
  { label: 'Admin', email: 'admin@kipita.app', password: 'admin' },
]

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(demoAccounts[0].email)
  const [password, setPassword] = useState(demoAccounts[0].password)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const authError = searchParams.get('error')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/',
    })

    setIsLoading(false)

    if (result?.error) {
      setError('Invalid credentials. Try a demo account below.')
      return
    }

    router.push(result?.url ?? '/')
  }

  const handleDemoFill = (account: (typeof demoAccounts)[number]) => {
    setEmail(account.email)
    setPassword(account.password)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur p-6 shadow-xl">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-black text-emerald-950">Welcome back</h1>
          <p className="text-sm font-medium text-slate-500">
            Sign in with a demo account to explore the app.
          </p>
        </div>

        {(error || authError) && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error ?? 'Authentication failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm font-semibold text-emerald-900">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              autoComplete="email"
              required
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-emerald-900">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Demo accounts
          </p>
          <div className="grid gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => handleDemoFill(account)}
                className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-left text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                <span>{account.label}</span>
                <span className="text-xs font-medium text-emerald-700">
                  {account.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

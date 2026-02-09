'use client'

import { useEffect, useState } from 'react'
import { signIn, getProviders, type ClientSafeProvider } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export function SignInClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<Record<
    string,
    ClientSafeProvider
  > | null>(null)

  const authError = searchParams.get('error')
  const authErrorMessage =
    authError === 'AccessDenied'
      ? 'Google sign-in is not configured.'
      : authError === 'OAuthAccountNotLinked'
      ? 'This email is linked to another sign-in method.'
      : authError
      ? 'Authentication failed. Please try again.'
      : null
  const googleProvider = providers?.google ?? null

  useEffect(() => {
    let isMounted = true
    getProviders()
      .then((result) => {
        if (isMounted) setProviders(result)
      })
      .catch(() => {
        if (isMounted) setProviders(null)
      })
    return () => {
      isMounted = false
    }
  }, [])

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
      setError('Invalid credentials. Please try again.')
      return
    }

    router.push(result?.url ?? '/')
  }

  const handleGoogleSignIn = () => {
    if (!googleProvider) return
    signIn(googleProvider.id, { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur p-6 shadow-xl">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-black text-emerald-950">Welcome back</h1>
          <p className="text-sm font-medium text-slate-500">
            Sign in to continue your journey.
          </p>
        </div>

        {(error || authErrorMessage) && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error ?? authErrorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm font-semibold text-emerald-900">
            Email or phone
            <input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              autoComplete="username"
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
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-emerald-100" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Or continue with
          </span>
          <div className="h-px flex-1 bg-emerald-100" />
        </div>

        {googleProvider ? (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Continue with Google
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-400"
          >
            Google sign-in unavailable
          </button>
        )}
      </div>
    </div>
  )
}

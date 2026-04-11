'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff, Lock, Mail, UserRound, X } from 'lucide-react'
import { getProviders, signIn, type ClientSafeProvider } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signInAsDriver, signInAsPassenger, type LoginRole } from '@/lib/authHelper'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

type AuthView = 'signin' | 'signup'

interface AuthDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialView?: AuthView
  initialError?: string | null
  selectedRole?: LoginRole
  callbackUrl?: string
  navigateOnSuccess?: boolean
}

const baseInputClassName =
  'w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20'

const iconInputClassName = `${baseInputClassName} pl-11`

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      focusable="false"
    >
      <path
        d="M12 5c1.62 0 3.08.56 4.23 1.64l3.15-3.15C17.36 1.62 14.86.5 12 .5 7.31.5 3.25 3.19 1.28 7.1l3.67 2.85A7.51 7.51 0 0 1 12 5Z"
        fill="#EA4335"
      />
      <path
        d="M23.5 12.27c0-.82-.07-1.42-.22-2.04H12v4.22h6.64c-.13 1.05-.84 2.62-2.42 3.69l3.56 2.76c2.11-1.94 3.72-4.81 3.72-8.63Z"
        fill="#4285F4"
      />
      <path
        d="M4.95 14.05A7.66 7.66 0 0 1 4.54 12c0-.71.14-1.4.39-2.05L1.27 7.1A11.45 11.45 0 0 0 .5 12c0 1.77.42 3.43 1.16 4.9l3.29-2.57Z"
        fill="#FBBC05"
      />
      <path
        d="M12 23.5c3 0 5.53-.98 7.37-2.66l-3.56-2.76c-.95.66-2.23 1.12-3.81 1.12a7.5 7.5 0 0 1-7.04-5.15l-3.29 2.57C3.62 20.61 7.56 23.5 12 23.5Z"
        fill="#34A853"
      />
    </svg>
  )
}

function authErrorToMessage(errorCode: string | null | undefined) {
  if (!errorCode) return null
  if (errorCode === 'AccessDenied') return 'Google sign-in is not configured.'
  if (errorCode === 'OAuthAccountNotLinked') {
    return 'This email is linked to another sign-in method.'
  }
  return 'Authentication failed. Please try again.'
}

export function AuthDrawer({
  open,
  onOpenChange,
  initialView = 'signin',
  initialError,
  selectedRole = 'passenger',
  callbackUrl = '/',
  navigateOnSuccess = false,
}: AuthDrawerProps) {
  const router = useRouter()
  const [authView, setAuthView] = useState<AuthView>(initialView)
  const [authError, setAuthError] = useState<string | null>(
    authErrorToMessage(initialError) ?? initialError ?? null
  )
  const [authLoading, setAuthLoading] = useState(false)
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [signInValues, setSignInValues] = useState({
    identifier: '',
    password: '',
  })
  const [signUpValues, setSignUpValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [providers, setProviders] = useState<Record<
    string,
    ClientSafeProvider
  > | null>(null)
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

  useEffect(() => {
    if (!open) {
      setAuthLoading(false)
      setAuthError(null)
      setShowSignInPassword(false)
      setShowSignUpPassword(false)
      return
    }

    setAuthView(initialView)
    setAuthError(authErrorToMessage(initialError) ?? initialError ?? null)
  }, [open, initialView, initialError])

  const authTitle =
    authView === 'signin' ? 'Welcome back' : 'Create your account'
  const authDescription =
    authView === 'signin'
      ? 'Sign in to continue your journey.'
      : 'Create an account to unlock shared rides.'

  const handleFieldFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    const target = event.currentTarget
    window.setTimeout(() => {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 80)
  }

  const handleAuthViewChange = (view: AuthView) => {
    setAuthView(view)
    setAuthError(null)
  }

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (authLoading) return
    setAuthError(null)
    setAuthLoading(true)

    try {
      const identifier = signInValues.identifier.trim()
      const result = await signIn('credentials', {
        redirect: false,
        email: identifier,
        password: signInValues.password,
        callbackUrl,
      })

      if (result?.error) {
        setAuthError('Invalid credentials. Please try again.')
        return
      }

      onOpenChange(false)
      if (navigateOnSuccess) {
        router.push(result?.url ?? callbackUrl)
      } else {
        router.refresh()
      }
    } catch {
      setAuthError('Unable to sign in right now.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (authLoading) return
    setAuthError(null)
    setAuthLoading(true)

    const payload = {
      name: signUpValues.name.trim(),
      email: signUpValues.email.trim(),
      phone: signUpValues.phone.trim(),
      password: signUpValues.password,
      role: selectedRole,
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setAuthError(data?.error ?? 'Unable to create your account.')
        return
      }

      const identifier = payload.email || payload.phone
      const result = await signIn('credentials', {
        redirect: false,
        email: identifier,
        password: payload.password,
        callbackUrl,
      })

      if (result?.error) {
        setAuthError('Account created. Please sign in to continue.')
        setAuthView('signin')
        setSignInValues({ identifier, password: '' })
        return
      }

      onOpenChange(false)
      if (navigateOnSuccess) {
        router.push(result?.url ?? callbackUrl)
      } else {
        router.refresh()
      }
    } catch {
      setAuthError('Unable to create your account right now.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!googleProvider || authLoading) return
    if (selectedRole === 'driver') {
      await signInAsDriver(callbackUrl)
      return
    }
    await signInAsPassenger(callbackUrl)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card/95 backdrop-blur border-t border-border max-h-[92dvh] overflow-hidden">
        <div
          className="mx-auto w-full max-w-md px-5 pb-8 overflow-y-auto overscroll-contain"
          style={{
            maxHeight: 'calc(92dvh - env(safe-area-inset-top))',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)',
            scrollPaddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)',
          }}
        >
          <div className="flex items-start justify-between pt-2">
            <DrawerHeader className="px-0 pb-2">
              <DrawerTitle className="text-2xl font-black text-foreground">
                {authTitle}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                {authDescription}
              </DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </DrawerClose>
          </div>

          <div className="mt-2 flex rounded-full bg-primary/10 p-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <button
              type="button"
              onClick={() => handleAuthViewChange('signin')}
              aria-pressed={authView === 'signin'}
              className={`flex-1 rounded-full px-3 py-2 transition ${
                authView === 'signin'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-primary/70 hover:text-primary'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => handleAuthViewChange('signup')}
              aria-pressed={authView === 'signup'}
              className={`flex-1 rounded-full px-3 py-2 transition ${
                authView === 'signup'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-primary/70 hover:text-primary'
              }`}
            >
              Sign up
            </button>
          </div>

          {authError && (
            <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              {authError}
            </div>
          )}

          {authView === 'signin' ? (
            <form onSubmit={handleSignIn} className="mt-4 space-y-3">
              <label className="block space-y-2 text-sm font-semibold text-foreground">
                Email or phone
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={signInValues.identifier}
                    onChange={(event) =>
                      setSignInValues((prev) => ({
                        ...prev,
                        identifier: event.target.value,
                      }))
                    }
                    onFocus={handleFieldFocus}
                    className={iconInputClassName}
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="block space-y-2 text-sm font-semibold text-foreground">
                Password
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInValues.password}
                    onChange={(event) =>
                      setSignInValues((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    onFocus={handleFieldFocus}
                    className={`${iconInputClassName} pr-12`}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword((prev) => !prev)}
                    aria-label={
                      showSignInPassword ? 'Hide password' : 'Show password'
                    }
                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    {showSignInPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {authLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="mt-4 space-y-3">
              <label className="block space-y-2 text-sm font-semibold text-foreground">
                Full name
                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={signUpValues.name}
                    onChange={(event) =>
                      setSignUpValues((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    onFocus={handleFieldFocus}
                    className={iconInputClassName}
                    autoComplete="name"
                    required
                  />
                </div>
              </label>

              <label className="block space-y-2 text-sm font-semibold text-foreground">
                Email
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    value={signUpValues.email}
                    onChange={(event) =>
                      setSignUpValues((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    onFocus={handleFieldFocus}
                    className={iconInputClassName}
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="block space-y-2 text-sm font-semibold text-foreground">
                Phone
                <input
                  type="tel"
                  value={signUpValues.phone}
                  onChange={(event) =>
                    setSignUpValues((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  onFocus={handleFieldFocus}
                  className={baseInputClassName}
                  autoComplete="tel"
                  required
                />
              </label>

              <label className="block space-y-2 text-sm font-semibold text-foreground">
                Password
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpValues.password}
                    onChange={(event) =>
                      setSignUpValues((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    onFocus={handleFieldFocus}
                    className={`${iconInputClassName} pr-12`}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword((prev) => !prev)}
                    aria-label={
                      showSignUpPassword ? 'Hide password' : 'Show password'
                    }
                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    {showSignUpPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {authLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {googleProvider ? (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:text-primary"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 w-full rounded-2xl border border-border bg-muted py-3 text-sm font-semibold text-muted-foreground"
            >
              Google sign-in unavailable
            </button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

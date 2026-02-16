'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthDrawer } from '@/components/auth-drawer'

export function SignInClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(true)
  const authErrorCode = searchParams.get('error')

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/85 backdrop-blur p-6 text-center shadow-xl">
        <h1 className="text-2xl font-black text-emerald-950">Account access</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Sign in or create an account to continue.
        </p>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="mt-6 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700"
        >
          Open Sign In Drawer
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-3 w-full rounded-2xl border border-emerald-200 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          Back to Home
        </button>
      </div>

      <AuthDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialView="signin"
        initialError={authErrorCode}
        callbackUrl="/"
        navigateOnSuccess
      />
    </div>
  )
}

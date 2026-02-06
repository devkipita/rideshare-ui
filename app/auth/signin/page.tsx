import { Suspense } from 'react'
import { SignInClient } from './signin-client'

function SignInFallback() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur p-6 shadow-xl">
        <p className="text-center text-sm font-semibold text-slate-500">
          Loading sign in...
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInClient />
    </Suspense>
  )
}

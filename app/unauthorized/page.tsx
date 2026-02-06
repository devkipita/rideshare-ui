import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur p-6 text-center shadow-xl">
        <h1 className="text-2xl font-black text-emerald-950">Access denied</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          You don&apos;t have permission to view this page.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/"
            className="rounded-2xl bg-emerald-600 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700"
          >
            Go home
          </Link>
          <Link
            href="/auth/signin"
            className="rounded-2xl border border-emerald-200 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Sign in with another account
          </Link>
        </div>
      </div>
    </div>
  )
}

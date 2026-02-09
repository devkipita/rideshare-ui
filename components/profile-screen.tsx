'use client'

import type { ComponentType, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  Phone,
  Mail,
  LogOut,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useProtectedRoute } from '@/hooks/use-auth'
import { StateFeedback } from '@/components/state-feedback'

interface ProfileScreenProps {
  userMode: 'passenger' | 'driver'
}

type ProfileData = {
  id?: string | number | null
  name?: string | null
  email?: string | null
  phone?: string | null
  role?: 'passenger' | 'driver' | 'admin' | null
  provider?: string | null
  created_at?: string | null
}

const formatRole = (role?: string | null) => {
  if (!role) return 'Member'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const formatProvider = (provider?: string | null) => {
  if (!provider) return 'Credentials'
  if (provider === 'google') return 'Google'
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

const formatDate = (iso?: string | null) => {
  if (!iso) return 'New'
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return 'New'
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  })
}

// ATOMS
function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        rounded-3xl 
        bg-white/5 
        backdrop-blur-xl 
        border border-white/10 
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]
        ${className}
      `}
    >
      {children}
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <GlassCard className="p-4 text-center transition-all active:scale-95">
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </GlassCard>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <GlassCard className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-all">
          {value}
        </p>
      </div>
    </GlassCard>
  )
}

function ActionButton({
  icon: Icon,
  label,
  destructive = false,
  onClick,
  disabled = false,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  destructive?: boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`
        w-full h-14 rounded-2xl px-5 
        flex items-center justify-between
        transition-all
        active:scale-[0.98]
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${destructive
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-foreground hover:bg-white/5'}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  )
}

// ORGANISM
export function ProfileScreen({ userMode }: ProfileScreenProps) {
  const { status } = useProtectedRoute()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    let isMounted = true

    const loadProfile = async () => {
      setIsLoading(true)
      setProfileError(null)

      try {
        const response = await fetch('/api/users/me', {
          method: 'GET',
          cache: 'no-store',
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.error ?? 'Unable to load profile.')
        }

        if (isMounted) {
          setProfile(data?.user ?? null)
        }
      } catch (error) {
        if (isMounted) {
          setProfileError(
            error instanceof Error ? error.message : 'Unable to load profile.'
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProfile()
    return () => {
      isMounted = false
    }
  }, [status])

  const derived = useMemo(() => {
    const role =
      profile?.role ??
      session?.user?.role ??
      (userMode === 'driver' ? 'driver' : 'passenger')

    const name = profile?.name ?? session?.user?.name ?? 'User'
    const email = profile?.email ?? session?.user?.email ?? 'Not provided'
    const phone = profile?.phone ?? 'Not provided'
    const provider = formatProvider(profile?.provider)
    const memberSince = formatDate(profile?.created_at)
    const avatarUrl = session?.user?.image ?? null

    const initialsSource = name || email || 'U'
    const initials = initialsSource
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')

    return {
      roleLabel: formatRole(role),
      name,
      email,
      phone,
      provider,
      memberSince,
      avatarUrl,
      initials: initials || 'U',
    }
  }, [
    profile,
    session?.user?.email,
    session?.user?.image,
    session?.user?.name,
    session?.user?.role,
    userMode,
  ])

  if (status === 'loading' || isLoading) {
    return (
      <div className="px-4 pb-28 space-y-8">
        <StateFeedback
          state="loading"
          title="Loading profile"
          message="Fetching your account details."
        />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="px-4 pb-28 space-y-8">
      {profileError && (
        <StateFeedback
          state="error"
          title="Profile unavailable"
          message={profileError}
        />
      )}

      {/* PROFILE HEADER */}
      <GlassCard className="p-6 text-center">
        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg overflow-hidden">
          {derived.avatarUrl ? (
            <img
              src={derived.avatarUrl}
              alt={`${derived.name} avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl font-semibold text-white">
              {derived.initials}
            </span>
          )}
        </div>

        <h2 className="text-xl font-semibold text-foreground">{derived.name}</h2>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-foreground/80">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{derived.roleLabel}</span>
        </div>
      </GlassCard>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={derived.roleLabel} label="Role" />
        <StatCard value={derived.memberSince} label="Member since" />
        <StatCard value={derived.provider} label="Sign-in" />
      </div>

      {/* CONTACT */}
      <section className="space-y-3">
        <p className="px-1 text-xs font-medium text-muted-foreground">Contact</p>
        <InfoRow icon={Phone} label="Phone" value={derived.phone} />
        <InfoRow icon={Mail} label="Email" value={derived.email} />
      </section>

      {/* ACCOUNT ACTIONS */}
      <section className="space-y-2">
        <p className="px-1 text-xs font-medium text-muted-foreground">Account</p>

        <GlassCard>
          <ActionButton icon={Settings} label="Settings" disabled />
          <div className="h-px bg-white/10 mx-4" />
          <ActionButton
            icon={LogOut}
            label="Log out"
            destructive
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          />
        </GlassCard>
      </section>
    </div>
  )
}

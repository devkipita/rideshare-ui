'use client'

import {
  Star,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react'

interface ProfileScreenProps {
  userMode: 'passenger' | 'driver'
}

/* ───────────────────────────────
   ATOMS
──────────────────────────────── */

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
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
  icon: any
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
}: {
  icon: any
  label: string
  destructive?: boolean
}) {
  return (
    <button
      className={`
        w-full h-14 rounded-2xl px-5 
        flex items-center justify-between
        transition-all
        active:scale-[0.98]
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

/* ───────────────────────────────
   ORGANISM
──────────────────────────────── */

export function ProfileScreen({ userMode }: ProfileScreenProps) {
  return (
    <div className="px-4 pb-28 space-y-8">
      {/* PROFILE HEADER */}
      <GlassCard className="p-6 text-center">
        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg">
          <span className="text-4xl font-semibold text-white">JD</span>
        </div>

        <h2 className="text-xl font-semibold text-foreground">
          John Doe
        </h2>

        <div className="flex items-center justify-center gap-1 mt-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">4.8</span>
          <span className="text-xs text-muted-foreground">
            (124 reviews)
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
          <MapPin className="w-4 h-4" />
          Nairobi, Kenya
        </div>
      </GlassCard>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value="24"
          label={userMode === 'driver' ? 'Trips Driven' : 'Trips Taken'}
        />
        <StatCard value="18" label="Months" />
        <StatCard value="98%" label="Reliability" />
      </div>

      {/* CONTACT */}
      <section className="space-y-3">
        <p className="px-1 text-xs font-medium text-muted-foreground">
          Contact
        </p>
        <InfoRow
          icon={Phone}
          label="Phone"
          value="+254 701 234 567"
        />
        <InfoRow
          icon={Mail}
          label="Email"
          value="john@rideshare.co"
        />
      </section>

      {/* ACCOUNT ACTIONS */}
      <section className="space-y-2">
        <p className="px-1 text-xs font-medium text-muted-foreground">
          Account
        </p>

        <GlassCard>
          <ActionButton icon={Settings} label="Settings" />
          <div className="h-px bg-white/10 mx-4" />
          <ActionButton
            icon={LogOut}
            label="Log out"
            destructive
          />
        </GlassCard>
      </section>
    </div>
  )
}

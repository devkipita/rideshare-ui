'use client'

import {
  MapPin,
  Clock,
  Users,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */

interface Ride {
  id: string
  from: string
  to: string
  date: string
  time: string
  driver: string
  price: number
  passengers: number
  status: 'upcoming' | 'completed' | 'cancelled'
}

/* ─────────────────────────────────────
   MOCK DATA
───────────────────────────────────── */

const rides: Ride[] = [
  {
    id: '1',
    from: 'Nanyuki',
    to: 'Nairobi',
    date: 'Today',
    time: '7:00 AM – 8:00 AM',
    driver: 'James K.',
    price: 1200,
    passengers: 2,
    status: 'upcoming',
  },
  {
    id: '2',
    from: 'Nairobi',
    to: 'Nanyuki',
    date: 'Yesterday',
    time: '5:00 PM – 6:15 PM',
    driver: 'Sarah M.',
    price: 1200,
    passengers: 3,
    status: 'completed',
  },
]

/* ─────────────────────────────────────
   ATOMIC UI
───────────────────────────────────── */

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl',
        'shadow-[0_10px_30px_rgba(0,0,0,0.15)]',
        'transition-all duration-200 active:scale-[0.98]',
        'p-4',
        className
      )}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  )
}

/* ─────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────── */

export function MyRides() {
  const upcoming = rides.filter((r) => r.status === 'upcoming')
  const completed = rides.filter((r) => r.status === 'completed')

  return (
    <div className="space-y-8 px-2 pb-24">
      {/* UPCOMING */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <SectionTitle>Upcoming Ride</SectionTitle>

          {upcoming.map((ride) => (
            <GlassCard key={ride.id}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold text-foreground leading-tight">
                    {ride.from} → {ride.to}
                  </p>
                  <p className="text-xs text-muted-foreground">{ride.date}</p>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Meta */}
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{ride.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{ride.passengers} pax</span>
                </div>
                <div className="text-right text-sm font-semibold text-primary">
                  KES {ride.price}
                </div>
              </div>

              {/* Driver */}
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary/10 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/30 text-sm font-bold text-primary">
                  {ride.driver[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {ride.driver}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Driver
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </section>
      )}

      {/* COMPLETED */}
      {completed.length > 0 && (
        <section className="space-y-3">
          <SectionTitle>Past Rides</SectionTitle>

          {completed.map((ride) => (
            <GlassCard
              key={ride.id}
              className="opacity-80 grayscale-[0.25]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {ride.from} → {ride.to}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ride.date}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {ride.time}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Completed</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </section>
      )}

      {/* EMPTY STATE */}
      {upcoming.length === 0 && completed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 backdrop-blur">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No rides yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Book or join a ride to get started
          </p>
        </div>
      )}
    </div>
  )
}

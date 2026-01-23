'use client'

import { useState } from 'react'
import {
  MapPin,
  Users,
  Dog,
  Luggage,
  Plane,
  X,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { filterTowns } from '@/lib/kenyan-towns'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */

interface SearchFilters {
  from: string
  to: string
  date: string
  seats: number
  pets: boolean
  luggage: boolean
  airport: boolean
}

interface PassengerSearchProps {
  onSearch?: (filters: SearchFilters) => void
}

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
        'rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
        'shadow-[0_12px_30px_-16px_rgba(0,0,0,0.55)]',
        className
      )}
    >
      {children}
    </div>
  )
}

function IconBadge({ icon: Icon }: { icon: any }) {
  return (
    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
  )
}

function ChipToggle({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: any
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-16 rounded-xl flex flex-col items-center justify-center gap-1',
        'transition-all duration-200 active:scale-95',
        active
          ? 'bg-primary/20 border border-primary text-primary'
          : 'bg-white/5 border border-white/10 text-muted-foreground'
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  )
}

/* ─────────────────────────────────────
   LOCATION INPUT (SMOOTH ANIMATION)
───────────────────────────────────── */

function LocationInput({
  label,
  value,
  placeholder,
  onChange,
  suggestions,
  onSelect,
  onClear,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (v: string) => void
  suggestions: string[]
  onSelect: (v: string) => void
  onClear: () => void
}) {
  const open = suggestions.length > 0

  return (
    <div className="space-y-1 relative">
      <label className="text-[11px] font-medium text-muted-foreground">
        {label}
      </label>

      <GlassCard className="flex items-center gap-2 px-3 py-2.5">
        <IconBadge icon={MapPin} />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent border-none focus-visible:ring-0 text-sm"
        />
        {value && (
          <button onClick={onClear}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </GlassCard>

      {/* Suggestions */}
      <div
        className={cn(
          'absolute z-50 w-full mt-1 origin-top',
          'transition-all duration-200 ease-out',
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        )}
      >
        <GlassCard className="max-h-48 overflow-y-auto py-1">
          {suggestions.map((town) => (
            <button
              key={town}
              onClick={() => onSelect(town)}
              className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-primary/10 transition"
            >
              {town}
            </button>
          ))}
        </GlassCard>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────
   DRIVER PREVIEW (RESULT CARD)
───────────────────────────────────── */

function DriverPreview() {
  return (
    <GlassCard className="p-3 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-primary/25 flex items-center justify-center text-primary font-semibold">
        J
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">James K.</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3 text-yellow-500" />
          <span>4.8 · 120 trips</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-primary">
        KES 1,200
      </span>
    </GlassCard>
  )
}

/* ─────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────── */

export function PassengerSearch({ onSearch }: PassengerSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    from: '',
    to: '',
    date: '',
    seats: 1,
    pets: false,
    luggage: false,
    airport: false,
  })

  const [fromSuggestions, setFromSuggestions] = useState<string[]>([])
  const [toSuggestions, setToSuggestions] = useState<string[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = () => {
    setSearched(true)
    onSearch?.(filters)
  }

  return (
    <div className="px-3 pt-3 pb-6 max-w-md mx-auto space-y-6">
      {/* FROM */}
      <LocationInput
        label="From"
        value={filters.from}
        placeholder="Nanyuki"
        onChange={(v) => {
          setFilters({ ...filters, from: v })
          setFromSuggestions(filterTowns(v))
        }}
        suggestions={fromSuggestions}
        onSelect={(town) => {
          setFilters({ ...filters, from: town })
          setFromSuggestions([])
        }}
        onClear={() => {
          setFilters({ ...filters, from: '' })
          setFromSuggestions([])
        }}
      />

      {/* TO */}
      <LocationInput
        label="To"
        value={filters.to}
        placeholder="Nairobi"
        onChange={(v) => {
          setFilters({ ...filters, to: v })
          setToSuggestions(filterTowns(v))
        }}
        suggestions={toSuggestions}
        onSelect={(town) => {
          setFilters({ ...filters, to: town })
          setToSuggestions([])
        }}
        onClear={() => {
          setFilters({ ...filters, to: '' })
          setToSuggestions([])
        }}
      />

      {/* DATE */}
      <GlassCard className="px-3 py-3 space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">
          Travel Date
        </label>
        <Input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters({ ...filters, date: e.target.value })
          }
          className="bg-transparent border-none text-sm"
        />
      </GlassCard>

      {/* SEATS */}
      <GlassCard className="px-3 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Seats</span>
          </div>
          <span className="text-sm font-semibold">
            {filters.seats}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setFilters({ ...filters, seats: n })}
              className={cn(
                'h-10 rounded-lg text-sm font-semibold transition',
                filters.seats === n
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/5 text-foreground'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* PREFERENCES */}
      <div className="space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground">
          Preferences
        </p>
        <div className="grid grid-cols-3 gap-2">
          <ChipToggle
            icon={Dog}
            label="Pets"
            active={filters.pets}
            onClick={() =>
              setFilters({ ...filters, pets: !filters.pets })
            }
          />
          <ChipToggle
            icon={Luggage}
            label="Luggage"
            active={filters.luggage}
            onClick={() =>
              setFilters({
                ...filters,
                luggage: !filters.luggage,
              })
            }
          />
          <ChipToggle
            icon={Plane}
            label="Airport"
            active={filters.airport}
            onClick={() =>
              setFilters({
                ...filters,
                airport: !filters.airport,
              })
            }
          />
        </div>
      </div>

      <Button
        onClick={handleSearch}
        className="w-full h-12 rounded-xl text-sm font-semibold"
      >
        Search Group Rides
      </Button>

      {/* RESULTS */}
      {searched && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-sm font-semibold">
            Available Drivers
          </h2>
          <DriverPreview />
          <DriverPreview />
          <DriverPreview />
        </div>
      )}
    </div>
  )
}

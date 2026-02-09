"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin,
  Users,
  Dog,
  Luggage,
  Plane,
  X,
  Star,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterTowns } from "@/lib/kenyan-towns";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */

interface SearchFilters {
  from: string;
  to: string;
  date: string;
  seats: number;
  pets: boolean;
  luggage: boolean;
  airport: boolean;
}

interface PassengerSearchProps {
  onSearch?: (filters: SearchFilters) => void;
}

/* ─────────────────────────────────────
   SMALL UTILS
───────────────────────────────────── */

function todayISO() {
  // YYYY-MM-DD (local)
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function clampSuggestions(list: string[], max = 8) {
  return list.slice(0, max);
}

/* ─────────────────────────────────────
   ATOMIC UI
───────────────────────────────────── */

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // cleaner glass + better borders for dark UI
        "rounded-2xl bg-white/[0.06] backdrop-blur-xl",
        "border border-white/10",
        "shadow-[0_16px_40px_-22px_rgba(0,0,0,0.70)]",
        "supports-[backdrop-filter]:bg-white/[0.05]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-medium tracking-wide text-muted-foreground">
      {children}
    </label>
  );
}

function IconBadge({ icon: Icon }: { icon: any }) {
  return (
    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
      <Icon className="w-[18px] h-[18px] text-primary" />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-foreground/90">{children}</p>
    </div>
  );
}

function ChipToggle({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: any;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-14 rounded-xl flex items-center justify-center gap-2 px-3",
        "transition-all duration-200 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-primary/18 border border-primary/40 text-primary"
          : "bg-white/[0.04] border border-white/10 text-muted-foreground hover:bg-white/[0.06]",
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4",
          active ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  );
}

/* ─────────────────────────────────────
   ACCESSIBLE LOCATION COMBOBOX
───────────────────────────────────── */

function LocationInput({
  id,
  label,
  value,
  placeholder,
  onChange,
  suggestions,
  onSelect,
  onClear,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  suggestions: string[];
  onSelect: (v: string) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const listId = `${id}-listbox`;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasSuggestions = suggestions.length > 0;
  const shouldOpen = open && hasSuggestions && !disabled;

  useEffect(() => {
    if (!value) setActiveIndex(-1);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (!el) return;
      if (inputRef.current?.contains(el)) return;
      // if click inside listbox container, ignore (handled by buttons)
      const list = document.getElementById(listId);
      if (list?.contains(el)) return;
      setOpen(false);
      setActiveIndex(-1);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [listId]);

  function commitSelection(v: string) {
    onSelect(v);
    setOpen(false);
    setActiveIndex(-1);
    // keep focus on input for fast switching
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!hasSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => {
        const next = Math.min(i + 1, suggestions.length - 1);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (shouldOpen && activeIndex >= 0) {
        e.preventDefault();
        commitSelection(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="space-y-1 relative">
      <FieldLabel>{label}</FieldLabel>

      <GlassCard
        className={cn(
          "flex items-center gap-2 px-3 py-2.5",
          disabled && "opacity-60 pointer-events-none",
        )}
      >
        <IconBadge icon={MapPin} />

        <Input
          ref={inputRef}
          id={id}
          value={value}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={shouldOpen}
          aria-controls={listId}
          aria-activedescendant={
            shouldOpen && activeIndex >= 0
              ? `${id}-opt-${activeIndex}`
              : undefined
          }
          className={cn(
            "bg-transparent border-none focus-visible:ring-0 text-sm",
            "placeholder:text-muted-foreground/70",
          )}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setOpen(false);
              setActiveIndex(-1);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            aria-label={`Clear ${label}`}
            className={cn(
              "p-1 rounded-md",
              "hover:bg-white/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </GlassCard>

      {/* Suggestions */}
      <div
        className={cn(
          "absolute z-50 w-full mt-1 origin-top",
          "transition-all duration-200 ease-out",
        )}
      >
        <div
          id={listId}
          role="listbox"
          className={cn(
            shouldOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-1 pointer-events-none",
          )}
        >
          <GlassCard className="max-h-56 overflow-y-auto py-1">
            {suggestions.map((town, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  id={`${id}-opt-${idx}`}
                  key={`${town}-${idx}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                  onClick={() => commitSelection(town)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm rounded-lg transition",
                    active
                      ? "bg-primary/12 text-foreground"
                      : "hover:bg-white/5",
                  )}
                >
                  {town}
                </button>
              );
            })}
            {!suggestions.length && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No matches
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   DRIVER PREVIEW (RESULT CARD)
───────────────────────────────────── */

function DriverPreview({
  name,
  rating,
  trips,
  price,
}: {
  name: string;
  rating: number;
  trips: number;
  price: number;
}) {
  const initial = name.trim().slice(0, 1).toUpperCase();

  return (
    <GlassCard className="p-3 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{name}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="w-3.5 h-3.5 text-yellow-500" />
          <span className="font-medium text-foreground/80">
            {rating.toFixed(1)}
          </span>
          <span className="opacity-70">·</span>
          <span>{trips} trips</span>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold text-primary">
          KES {price.toLocaleString()}
        </p>
        <p className="text-[11px] text-muted-foreground">per seat</p>
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────── */

export function PassengerSearch({ onSearch }: PassengerSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    from: "",
    to: "",
    date: "",
    seats: 1,
    pets: false,
    luggage: false,
    airport: false,
  });

  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  const minDate = useMemo(() => todayISO(), []);

  const canSearch = Boolean(
    filters.from.trim() && filters.to.trim() && filters.date,
  );

  const helperText = useMemo(() => {
    if (!filters.from || !filters.to) return "Pick your route to see rides.";
    if (!filters.date) return "Choose a travel date.";
    return "";
  }, [filters.from, filters.to, filters.date]);

  function swapLocations() {
    setFilters((f) => ({ ...f, from: f.to, to: f.from }));
    setFromSuggestions([]);
    setToSuggestions([]);
  }

  const handleSearch = () => {
    setSearched(true);
    onSearch?.(filters);
  };

  // Demo results (replace with real API data)
  const results = searched
    ? [
        { name: "James K.", rating: 4.8, trips: 120, price: 1200 },
        { name: "Amina W.", rating: 4.9, trips: 88, price: 1350 },
        { name: "Peter M.", rating: 4.7, trips: 210, price: 1100 },
      ]
    : [];

  return (
    <div className="px-3 pt-3 pb-6 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">
          Find a group ride
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose your route, date, and preferences.
        </p>
      </div>

      {/* Route (From/To + Swap) */}
      <div className="relative space-y-6">
        <LocationInput
          id="from"
          label="From"
          value={filters.from}
          placeholder="Nanyuki"
          onChange={(v) => {
            setFilters((f) => ({ ...f, from: v }));
            setFromSuggestions(clampSuggestions(filterTowns(v)));
          }}
          suggestions={fromSuggestions}
          onSelect={(town) => {
            setFilters((f) => ({ ...f, from: town }));
            setFromSuggestions([]);
          }}
          onClear={() => {
            setFilters((f) => ({ ...f, from: "" }));
            setFromSuggestions([]);
          }}
        />

        {/* Swap button */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[72px] z-10">
          <button
            type="button"
            onClick={swapLocations}
            aria-label="Swap from and to"
            className={cn(
              "h-10 w-10 rounded-full",
              "bg-background/40 backdrop-blur border border-white/10",
              "shadow-[0_10px_22px_-18px_rgba(0,0,0,0.75)]",
              "flex items-center justify-center",
              "hover:bg-background/55 transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <ArrowUpDown className="w-4 h-4 text-foreground/80" />
          </button>
        </div>

        <LocationInput
          id="to"
          label="To"
          value={filters.to}
          placeholder="Nairobi"
          onChange={(v) => {
            setFilters((f) => ({ ...f, to: v }));
            setToSuggestions(clampSuggestions(filterTowns(v)));
          }}
          suggestions={toSuggestions}
          onSelect={(town) => {
            setFilters((f) => ({ ...f, to: town }));
            setToSuggestions([]);
          }}
          onClear={() => {
            setFilters((f) => ({ ...f, to: "" }));
            setToSuggestions([]);
          }}
        />
      </div>

      {/* Date */}
      <GlassCard className="px-3 py-3 space-y-2">
        <SectionTitle>Travel date</SectionTitle>
        <Input
          type="date"
          min={minDate}
          value={filters.date}
          onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
          className={cn(
            "bg-transparent border-none text-sm",
            "focus-visible:ring-0",
          )}
        />
        <p className="text-[11px] text-muted-foreground">
          Earliest available: {minDate}
        </p>
      </GlassCard>

      {/* Seats */}
      <GlassCard className="px-3 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Seats</span>
          </div>
          <span className="text-sm font-semibold">{filters.seats}</span>
        </div>

        <div
          className="grid grid-cols-4 gap-2"
          role="group"
          aria-label="Seat count"
        >
          {[1, 2, 3, 4].map((n) => {
            const active = filters.seats === n;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={active}
                onClick={() => setFilters((f) => ({ ...f, seats: n }))}
                className={cn(
                  "h-10 rounded-xl text-sm font-semibold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_10px_22px_-18px_rgba(0,0,0,0.7)]"
                    : "bg-white/[0.04] border border-white/10 text-foreground hover:bg-white/[0.06]",
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Preferences */}
      <div className="space-y-2">
        <SectionTitle>Preferences</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          <ChipToggle
            icon={Dog}
            label="Pets"
            active={filters.pets}
            onClick={() => setFilters((f) => ({ ...f, pets: !f.pets }))}
          />
          <ChipToggle
            icon={Luggage}
            label="Luggage"
            active={filters.luggage}
            onClick={() => setFilters((f) => ({ ...f, luggage: !f.luggage }))}
          />
          <ChipToggle
            icon={Plane}
            label="Airport"
            active={filters.airport}
            onClick={() => setFilters((f) => ({ ...f, airport: !f.airport }))}
          />
        </div>
        {helperText && (
          <p className="text-[12px] text-muted-foreground">{helperText}</p>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={handleSearch}
        disabled={!canSearch}
        className={cn(
          "w-full h-12 rounded-xl text-sm font-semibold",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        Search Group Rides
      </Button>

      {/* RESULTS */}
      {searched && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Available drivers</h2>
            <span className="text-xs text-muted-foreground">
              {results.length} found
            </span>
          </div>

          {results.length === 0 ? (
            <GlassCard className="p-4">
              <p className="text-sm font-medium">No rides found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different date or nearby towns.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {results.map((r) => (
                <DriverPreview
                  key={r.name}
                  name={r.name}
                  rating={r.rating}
                  trips={r.trips}
                  price={r.price}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

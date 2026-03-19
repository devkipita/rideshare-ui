"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ArrowUpDown,
  Users,
  CalendarDays,
  PawPrint,
  LuggageIcon,
  PlaneIcon,
  Star,
  MapPin,
  Dot,
  ArrowRight,
  Clock3,
  MapPinned,
  StickyNote,
} from "lucide-react";

import { filterTowns } from "@/lib/kenyan-towns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChipToggle,
  FormDivider,
  LocationInput,
  PillButton,
  Surface,
} from "./ui-parts";
import { DatePickerCard } from "./ui/date-picker";

export interface SearchFilters {
  from: string;
  to: string;
  pickup: string;
  dropoff: string;
  note: string;
  date: string;
  seats: number;
  pets: boolean;
  luggage: boolean;
  airport: boolean;
}

type Props = {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onSearch: () => void;
  loading?: boolean;
};

type LocationField = "from" | "to" | "pickup" | "dropoff";
type Toggleable = "pets" | "luggage" | "airport";
type SetSug = Dispatch<SetStateAction<string[]>>;

type TodayRide = {
  id: string;
  name: string;
  from: string;
  to: string;
  price: number;
  rating: number;
  avatarUrl?: string;
  dateISO: string;
  time: string;
};

const MIN_TOWN_CHARS = 2;

const HIDE_SCROLLBAR =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const CARD_FOCUS = cn(
  "focus-within:border-transparent",
  "focus-within:ring-2 focus-within:ring-primary/55",
  "transition-[box-shadow,border-color] duration-200 ease-app",
);

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatISOToDDMMYYYY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++)
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function avatarColors(name: string) {
  const h = hashString(name) % 360;
  return {
    bg: `hsl(${h} 70% 55% / 0.18)`,
    border: `hsl(${h} 70% 55% / 0.45)`,
    text: `hsl(${h} 55% 28% / 0.95)`,
  };
}

const FALLBACK_RIDES: TodayRide[] = [
  {
    id: "t1",
    name: "Amina W.",
    from: "Nanyuki",
    to: "Nairobi",
    price: 1200,
    rating: 4.9,
    dateISO: todayISO(),
    time: "07:30",
  },
  {
    id: "t2",
    name: "James K.",
    from: "Nairobi",
    to: "Nanyuki",
    price: 1100,
    rating: 4.8,
    dateISO: todayISO(),
    time: "09:15",
  },
];

function useTodayRides(): TodayRide[] {
  const [rides, setRides] = useState<TodayRide[]>(FALLBACK_RIDES);

  useEffect(() => {
    let cancelled = false;
    const today = todayISO();

    fetch(`/api/rides?date=${today}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.rides?.length) return;
        const mapped: TodayRide[] = json.rides.map(
          (r: Record<string, unknown>) => {
            const driver = r.driver as Record<string, unknown> | null;
            const dt = r.departure_time ? new Date(r.departure_time as string) : null;
            return {
              id: r.id as string,
              name: (driver?.name as string) ?? "Driver",
              from: r.origin as string,
              to: r.destination as string,
              price: r.price_per_seat as number,
              rating: 4.5,
              avatarUrl: (driver?.image as string) ?? undefined,
              dateISO: today,
              time: dt
                ? `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`
                : "—",
            };
          },
        );
        setRides(mapped.length ? mapped : FALLBACK_RIDES);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return rides;
}

const Avatar = React.memo(function Avatar({
  name,
  url,
}: {
  name: string;
  url?: string;
}) {
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }, [name]);

  const c = useMemo(() => avatarColors(name), [name]);

  return (
    <div
      className="h-10 w-10 rounded-2xl overflow-hidden grid place-items-center border shrink-0"
      style={{ background: c.bg, borderColor: c.border }}
      aria-label={name}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-[12px] font-extrabold" style={{ color: c.text }}>
          {initials}
        </span>
      )}
    </div>
  );
});

function useAutoCarousel({
  count,
  enabled,
  intervalMs = 4200,
  pauseMsAfterInteract = 2400,
}: {
  count: number;
  enabled: boolean;
  intervalMs?: number;
  pauseMsAfterInteract?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const isDraggingRef = useRef(false);
  const pauseUntilRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const pauseNow = useCallback(() => {
    pauseUntilRef.current = Date.now() + pauseMsAfterInteract;
  }, [pauseMsAfterInteract]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const el = scrollerRef.current;
      if (!el) return;

      const i = clamp(index, 0, Math.max(0, count - 1));
      const child = el.children.item(i) as HTMLElement | null;
      if (!child) return;

      pauseNow();
      el.scrollTo({ left: child.offsetLeft, behavior });
    },
    [count, pauseNow],
  );

  const onPointerDown = useCallback(() => {
    isDraggingRef.current = true;
    pauseNow();
  }, [pauseNow]);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
    pauseNow();
  }, [pauseNow]);

  const onPointerCancel = useCallback(() => {
    isDraggingRef.current = false;
    pauseNow();
  }, [pauseNow]);

  const computeActive = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || count <= 1) return;

    const center = el.scrollLeft + el.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < el.children.length; i++) {
      const child = el.children.item(i) as HTMLElement | null;
      if (!child) continue;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    setActive(bestIdx);
  }, [count]);

  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      computeActive();
    });
  }, [computeActive]);

  useEffect(() => {
    if (!enabled || count <= 1) return;

    const id = window.setInterval(() => {
      if (isDraggingRef.current) return;
      if (Date.now() < pauseUntilRef.current) return;

      const next = (active + 1) % count;
      scrollToIndex(next, "smooth");
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [enabled, count, intervalMs, active, scrollToIndex]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    computeActive();
  }, [computeActive]);

  return {
    scrollerRef,
    active,
    scrollToIndex,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onScroll,
  };
}

function RoutePill({
  from,
  to,
  dateISO,
  time,
}: {
  from: string;
  to: string;
  dateISO: string;
  time: string;
}) {
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <Dot className="h-4 w-4 text-primary" />
          <span className="truncate">{from}</span>
        </span>

        <ArrowRight className="h-3.5 w-3.5 opacity-60 shrink-0" />

        <span className="inline-flex items-center gap-1.5 min-w-0">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{to}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formatISOToDDMMYYYY(dateISO)}</span>
        </span>
        <span className="opacity-40">•</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" />
          <span>{time}</span>
        </span>
      </div>
    </div>
  );
}

const RideCard = React.memo(function RideCard({
  ride,
  fallbackFrom,
}: {
  ride: TodayRide;
  fallbackFrom?: string;
}) {
  const from = fallbackFrom?.trim() ? fallbackFrom.trim() : ride.from;

  return (
    <div
      className={cn(
        "snap-start shrink-0",
        "w-[78vw] min-w-[240px] max-w-[340px]",
        "rounded-3xl border border-border/70 bg-card/60",
        "p-3.5 transition-transform duration-200",
        "active:scale-[0.99]",
      )}
      role="group"
      aria-label={`Ride ${from} to ${ride.to}`}
    >
      <div className="flex items-center gap-3">
        <Avatar name={ride.name} url={ride.avatarUrl} />

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold tracking-tight truncate">
            {ride.name}
          </p>
          <RoutePill
            from={from}
            to={ride.to}
            dateISO={ride.dateISO}
            time={ride.time}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-semibold">{ride.rating}</span>
        </div>

        <p className="text-[14px] font-extrabold tracking-tight">
          KES {ride.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
});

function Dots({
  count,
  active,
  onDot,
}: {
  count: number;
  active: number;
  onDot: (i: number) => void;
}) {
  if (count <= 1) return null;

  return (
    <div className="mt-2 flex items-center justify-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onDot(i)}
          aria-label={`Go to ride ${i + 1}`}
          className={cn(
            "h-1.5 rounded-full transition-all duration-200",
            i === active ? "w-6 bg-primary" : "w-2.5 bg-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function TodayRidesCarousel({
  rides,
  hint,
  fallbackFrom,
}: {
  rides: TodayRide[];
  hint?: string;
  fallbackFrom?: string;
}) {
  const {
    scrollerRef,
    active,
    scrollToIndex,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onScroll,
  } = useAutoCarousel({
    count: rides.length,
    enabled: true,
    intervalMs: 4200,
    pauseMsAfterInteract: 2400,
  });

  return (
    <Surface elevated className="p-4 relative">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-tight">
            Available rides
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Swipe to browse what’s already posted near you
          </p>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className={cn(
          "mt-3 w-full",
          "flex gap-2 overflow-x-auto overscroll-x-contain",
          "snap-x snap-mandatory pb-1",
          "touch-pan-x select-none",
          "-mx-4 px-4",
          "scroll-px-4 pr-4",
          HIDE_SCROLLBAR,
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {rides.map((r) => (
          <RideCard key={r.id} ride={r} fallbackFrom={fallbackFrom} />
        ))}
      </div>

      <Dots
        count={rides.length}
        active={active}
        onDot={(i) => scrollToIndex(i)}
      />

      <p className="mt-2 text-[11px] text-muted-foreground">
        {hint ?? "Enter your route to unlock date, seats, and preferences."}
      </p>
    </Surface>
  );
}

function RouteCard({
  filters,
  fromSuggestions,
  toSuggestions,
  onFromChange,
  onToChange,
  onFromSelect,
  onToSelect,
  onFromClear,
  onToClear,
  onSwap,
}: {
  filters: SearchFilters;
  fromSuggestions: string[];
  toSuggestions: string[];
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onFromSelect: (v: string) => void;
  onToSelect: (v: string) => void;
  onFromClear: () => void;
  onToClear: () => void;
  onSwap: () => void;
}) {
  return (
    <Surface elevated className="p-2 relative isolate z-10 focus-within:z-50">
      <p className="text-[12px] font-medium text-muted-foreground">Route</p>

      <div
        className={cn(
          "mt-3 relative z-10 focus-within:z-50 rounded-3xl border border-border/70 bg-card/60 overflow-visible",
          CARD_FOCUS,
        )}
      >
        <button
          type="button"
          onClick={onSwap}
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20",
            "h-11 w-11 rounded-2xl grid place-items-center",
            "bg-primary text-primary-foreground",
            "shadow-[0_18px_44px_-30px_rgba(6,78,59,0.55)]",
            "transition-all duration-300 ease-app active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
          )}
          aria-label="Swap from and to"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>

        <div className="p-3 sm:p-3.5">
          <LocationInput
            id="from"
            label="From"
            value={filters.from}
            placeholder="Leaving From"
            suggestions={fromSuggestions}
            minChars={MIN_TOWN_CHARS}
            onChange={onFromChange}
            onSelect={onFromSelect}
            onClear={onFromClear}
            compact
          />
        </div>

        <FormDivider />

        <div className="p-3 sm:p-3.5">
          <LocationInput
            id="to"
            label="To"
            value={filters.to}
            placeholder="Going To"
            suggestions={toSuggestions}
            minChars={MIN_TOWN_CHARS}
            onChange={onToChange}
            onSelect={onToSelect}
            onClear={onToClear}
            compact
          />
        </div>
      </div>
    </Surface>
  );
}

function PickupDropoffCard({
  open,
  onToggle,
  filters,
  pickupSuggestions,
  dropoffSuggestions,
  onPickupChange,
  onDropoffChange,
  onPickupSelect,
  onDropoffSelect,
  onPickupClear,
  onDropoffClear,
  onNoteChange,
}: {
  open: boolean;
  onToggle: () => void;
  filters: SearchFilters;
  pickupSuggestions: string[];
  dropoffSuggestions: string[];
  onPickupChange: (v: string) => void;
  onDropoffChange: (v: string) => void;
  onPickupSelect: (v: string) => void;
  onDropoffSelect: (v: string) => void;
  onPickupClear: () => void;
  onDropoffClear: () => void;
  onNoteChange: (v: string) => void;
}) {
  return (
    <Surface elevated className="p-3">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-start justify-between gap-3",
          "rounded-2xl transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
        )}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-tight">
            Pick up & drop-off
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Where the driver should meet you
          </p>
        </div>

        <div className="h-9 w-9 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15 shrink-0">
          <span className="text-[12px] font-bold text-primary">
            {open ? "–" : "+"}
          </span>
        </div>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-app",
          open
            ? "grid-rows-[1fr] opacity-100 translate-y-0"
            : "grid-rows-[0fr] opacity-0 -translate-y-1",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-2 rounded-3xl border border-border/70 bg-card/60 overflow-visible">
            <div className="p-3 sm:p-3.5">
              <LocationInput
                id="pickup"
                label="Pick up"
                value={filters.pickup}
                placeholder="Pickup location (e.g. Westlands, Sarit Centre)"
                suggestions={pickupSuggestions}
                minChars={MIN_TOWN_CHARS}
                onChange={onPickupChange}
                onSelect={onPickupSelect}
                onClear={onPickupClear}
                compact
                icon={MapPinned}
              />
            </div>

            <FormDivider />

            <div className="p-3 sm:p-3.5">
              <LocationInput
                id="dropoff"
                label="Drop-off"
                value={filters.dropoff}
                placeholder="Drop-off location (e.g. Thika, Makongeni)"
                suggestions={dropoffSuggestions}
                minChars={MIN_TOWN_CHARS}
                onChange={onDropoffChange}
                onSelect={onDropoffSelect}
                onClear={onDropoffClear}
                compact
                icon={MapPin}
              />
            </div>

            <FormDivider />

            <div className="p-3 sm:p-3.5">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-2xl border border-primary/15 bg-primary/10 shrink-0">
                  <StickyNote
                    className="h-4 w-4 text-primary"
                    strokeWidth={2.2}
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Note
                  </p>
                  <p className="text-[13px] font-semibold tracking-tight">
                    Add a message to the driver (optional)
                  </p>
                </div>
              </div>

              <textarea
                value={filters.note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="e.g. Small pet in carrier / I’m at the Shell entrance / I have one suitcase…"
                className={cn(
                  "mt-2 w-full min-h-[96px] resize-none rounded-3xl border border-border/70 bg-[color-mix(in_oklch,var(--card)_88%,white_10%)]",
                  "px-3.5 py-3 text-[13px] font-medium leading-relaxed",
                  "outline-none transition-all duration-200 ease-app",
                  "focus:border-transparent focus:ring-2 focus:ring-primary/55",
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </Surface>
  );
}

function TripOptions({
  open,
  onToggle,
  filters,
  minDate,
  dateOpen,
  setDateOpen,
  update,
  onSearch,
  canSearch,
  loading,
}: {
  open: boolean;
  onToggle: () => void;
  filters: SearchFilters;
  minDate: string;
  dateOpen: boolean;
  setDateOpen: (v: boolean) => void;
  update: <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) => void;
  onSearch: () => void;
  canSearch: boolean;
  loading?: boolean;
}) {
  const setSeats = useCallback(
    (n: number) => () => update("seats", n),
    [update],
  );

  const toggle = useCallback(
    (k: Toggleable) => () => update(k, !filters[k]),
    [filters, update],
  );

  return (
    <Surface elevated className="p-3">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-start justify-between gap-3",
          "rounded-2xl transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
        )}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-tight">
            Trip options
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Date, seats, and preferences
          </p>
        </div>

        <div className="h-9 w-9 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15 shrink-0">
          <span className="text-[12px] font-bold text-primary">
            {open ? "–" : "+"}
          </span>
        </div>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-app",
          open
            ? "grid-rows-[1fr] opacity-100 translate-y-0"
            : "grid-rows-[0fr] opacity-0 -translate-y-1",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Surface elevated className="p-2.5" focusRing>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold tracking-tight">
                  Travel date
                </p>

                <button
                  type="button"
                  onClick={() => setDateOpen(true)}
                  className={cn(
                    "h-9 w-9 rounded-2xl grid place-items-center",
                    "hover:bg-primary/10 active:scale-[0.98]",
                    "transition-all duration-300 ease-app",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                  )}
                  aria-label="Open travel date picker"
                >
                  <CalendarDays className="h-4 w-4 text-primary" />
                </button>
              </div>

              <div className="mt-2">
                <DatePickerCard
                  label="Travel date"
                  value={filters.date}
                  min={minDate}
                  onChange={(iso) => update("date", iso)}
                  variant="embedded"
                  open={dateOpen}
                  onOpenChange={setDateOpen}
                />
              </div>
            </Surface>

            <Surface elevated className="p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="h-9 w-9 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15">
                  <Users className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-muted-foreground">
                    Seats
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold tracking-tight">
                    {filters.seats}
                  </p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <PillButton
                    key={n}
                    active={filters.seats === n}
                    onClick={setSeats(n)}
                    className="h-9 rounded-2xl px-0 text-[13px] font-semibold"
                  >
                    {n}
                  </PillButton>
                ))}
              </div>
            </Surface>
          </div>

          <div className="mt-2">
            <Surface elevated className="p-2.5">
              <div className="flex flex-wrap gap-2">
                <ChipToggle
                  icon={PawPrint}
                  label="Pets"
                  active={filters.pets}
                  onClick={toggle("pets")}
                  size="sm"
                />
                <ChipToggle
                  icon={LuggageIcon}
                  label="Luggage"
                  active={filters.luggage}
                  onClick={toggle("luggage")}
                  size="sm"
                />
                <ChipToggle
                  icon={PlaneIcon}
                  label="Airport"
                  active={filters.airport}
                  onClick={toggle("airport")}
                  size="sm"
                />
              </div>

              <Button
                onClick={onSearch}
                disabled={!canSearch || !!loading}
                className={cn(
                  "mt-2.5 h-11 w-full rounded-4xl font-semibold tracking-tight",
                  "transition-all duration-300 ease-app active:scale-[0.99]",
                  "bg-primary text-primary-foreground shadow-[0_18px_44px_-34px_rgba(6,78,59,0.55)]",
                  "hover:brightness-[0.99]",
                  "disabled:opacity-100 disabled:bg-primary/35 disabled:text-primary-foreground/80 disabled:shadow-none",
                )}
              >
                {loading ? "Searching…" : "Search For Rides"}
              </Button>
            </Surface>
          </div>
        </div>
      </div>
    </Surface>
  );
}

export function PassengerSearchForm({
  filters,
  onChange,
  onSearch,
  loading,
}: Props) {
  const todayRides = useTodayRides();
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>([]);

  const minDate = useMemo(() => todayISO(), []);
  const [dateOpen, setDateOpen] = useState(false);

  const hasLocations = useMemo(
    () => Boolean(filters.from.trim() && filters.to.trim()),
    [filters.from, filters.to],
  );

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(true);

  const canSearch = useMemo(
    () =>
      Boolean(
        filters.from.trim() &&
        filters.to.trim() &&
        filters.pickup.trim() &&
        filters.dropoff.trim() &&
        filters.date,
      ),
    [filters.from, filters.to, filters.pickup, filters.dropoff, filters.date],
  );

  const update = useCallback(
    <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) =>
      onChange({ ...filters, [k]: v }),
    [filters, onChange],
  );

  const handleLocationChange = useCallback(
    (field: LocationField, v: string, setSug: SetSug) => {
      update(field, v as any);
      const q = v.trim();
      if (q.length < MIN_TOWN_CHARS) {
        setSug([]);
        return;
      }
      setSug(filterTowns(q));
    },
    [update],
  );

  const handleLocationSelect = useCallback(
    (field: LocationField, setSug: SetSug) => (v: string) => {
      update(field, v as any);
      setSug([]);
      if (field === "from" || field === "to") {
        setDetailsOpen(true);
        setOptionsOpen(true);
      }
    },
    [update],
  );

  const handleLocationClear = useCallback(
    (field: LocationField, setSug: SetSug) => () => {
      update(field, "" as any);
      setSug([]);
      if (field === "from" || field === "to") {
        update("pickup", "");
        update("dropoff", "");
        update("note", "");
        update("date", "");
        setPickupSuggestions([]);
        setDropoffSuggestions([]);
      }
    },
    [update],
  );

  const swap = useCallback(
    () => onChange({ ...filters, from: filters.to, to: filters.from }),
    [filters, onChange],
  );

  return (
    <div className="space-y-3">
      <RouteCard
        filters={filters}
        fromSuggestions={fromSuggestions}
        toSuggestions={toSuggestions}
        onFromChange={(v) =>
          handleLocationChange("from", v, setFromSuggestions)
        }
        onToChange={(v) => handleLocationChange("to", v, setToSuggestions)}
        onFromSelect={handleLocationSelect("from", setFromSuggestions)}
        onToSelect={handleLocationSelect("to", setToSuggestions)}
        onFromClear={handleLocationClear("from", setFromSuggestions)}
        onToClear={handleLocationClear("to", setToSuggestions)}
        onSwap={swap}
      />

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-app",
          hasLocations
            ? "grid-rows-[1fr] opacity-100 translate-y-0"
            : "grid-rows-[0fr] opacity-0 -translate-y-1",
        )}
      >
        <div className="overflow-hidden space-y-3">
          {hasLocations ? (
            <>
              <PickupDropoffCard
                open={detailsOpen}
                onToggle={() => setDetailsOpen((v) => !v)}
                filters={filters}
                pickupSuggestions={pickupSuggestions}
                dropoffSuggestions={dropoffSuggestions}
                onPickupChange={(v) =>
                  handleLocationChange("pickup", v, setPickupSuggestions)
                }
                onDropoffChange={(v) =>
                  handleLocationChange("dropoff", v, setDropoffSuggestions)
                }
                onPickupSelect={handleLocationSelect(
                  "pickup",
                  setPickupSuggestions,
                )}
                onDropoffSelect={handleLocationSelect(
                  "dropoff",
                  setDropoffSuggestions,
                )}
                onPickupClear={handleLocationClear(
                  "pickup",
                  setPickupSuggestions,
                )}
                onDropoffClear={handleLocationClear(
                  "dropoff",
                  setDropoffSuggestions,
                )}
                onNoteChange={(v) => update("note", v)}
              />

              <TripOptions
                open={optionsOpen}
                onToggle={() => setOptionsOpen((v) => !v)}
                filters={filters}
                minDate={minDate}
                dateOpen={dateOpen}
                setDateOpen={setDateOpen}
                update={update}
                onSearch={onSearch}
                canSearch={canSearch}
                loading={loading}
              />
            </>
          ) : null}
        </div>
      </div>

      <TodayRidesCarousel
        rides={todayRides}
        fallbackFrom={filters.from}
        hint={
          hasLocations
            ? "Rides update automatically — swipe for more."
            : "Add your route to unlock pickup, drop-off, date, seats, and preferences."
        }
      />
    </div>
  );
}

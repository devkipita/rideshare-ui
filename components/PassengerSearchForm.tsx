"use client";

import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ArrowUpDown,
  Users,
  CalendarDays,
  PawPrint,
  LuggageIcon,
  Music,
  Star,
  MapPin,
  Dot,
  ArrowRight,
  Clock3,
  MapPinned,
  StickyNote,
} from "lucide-react";

import { cn, todayISO, avatarColors } from "@/lib/utils";
import { useAutoCarousel } from "@/hooks/use-auto-carousel";
import { usePlaceSuggestions } from "@/hooks/use-place-suggestions";
import { useTownSuggestions } from "@/hooks/use-town-suggestions";
import { Button } from "@/components/ui/button";
import {
  ChipToggle,
  FormDivider,
  LocationInput,
  SeatStepper,
  Surface,
} from "./ui-parts";
import { DatePickerCard } from "./ui/date-picker";
import { TimePickerCard } from "./ui/time-picker";
import { RideDetailsSheet, type SearchRide } from "./my-rides";
import { useChat } from "./global-chat";
import { useAuthDrawer } from "./auth-drawer-provider";
import { LIMITS } from "@/lib/constants";
import useSWR from "swr";
import { PaymentDrawer } from "./shared/payment-drawer";

export interface SearchFilters {
  from: string;
  to: string;
  pickup: string;
  dropoff: string;
  note: string;
  date: string;
  departTime: string;
  seats: number;
  pets: boolean;
  luggage: boolean;
  music: boolean;
}

type Props = {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onSearch: () => void;
  loading?: boolean;
};

type LocationField = "from" | "to" | "pickup" | "dropoff";
type Toggleable = "pets" | "luggage" | "music";

type TodayRide = {
  id: string;
  driverId?: string;
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


function formatISOToDDMMYYYY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
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

function useLiveTodayRides(): TodayRide[] {
  const today = useMemo(() => todayISO(), []);
  const { data } = useSWR<{ rides?: Record<string, unknown>[] }>(
    `/api/rides?date=${today}`,
    {
      refreshInterval: LIMITS.pollIntervalMs,
    },
  );

  return useMemo(() => {
    if (!data?.rides?.length) return FALLBACK_RIDES;

    const mapped: TodayRide[] = data.rides.map((r) => {
      const driver = r.driver as Record<string, unknown> | null;
      const dt = r.departure_time ? new Date(r.departure_time as string) : null;
      return {
        id: r.id as string,
        driverId: (driver?.id as string) ?? undefined,
        name: (driver?.name as string) ?? "Driver",
        from: r.origin as string,
        to: r.destination as string,
        price: r.price_per_seat as number,
        rating: 4.5,
        avatarUrl: (driver?.image as string) ?? undefined,
        dateISO: today,
        time: dt
          ? `${String(dt.getHours()).padStart(2, "0")}:${String(
              dt.getMinutes(),
            ).padStart(2, "0")}`
          : "â€”",
      };
    });

    return mapped.length ? mapped : FALLBACK_RIDES;
  }, [data?.rides, today]);
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
      <div className="flex items-center gap-2 text-[12px] text-foreground/90 dark:text-foreground/85">
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

      <div className="flex items-center gap-2 text-[11px] text-foreground/70 dark:text-foreground/65">
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
  onTap,
}: {
  ride: TodayRide;
  fallbackFrom?: string;
  onTap: (ride: TodayRide) => void;
}) {
  const from = fallbackFrom?.trim() ? fallbackFrom.trim() : ride.from;

  return (
    <button
      type="button"
      onClick={() => onTap(ride)}
      className={cn(
        "snap-start shrink-0 text-left text-foreground",
        "w-[78vw] min-w-[240px] max-w-[340px]",
        "rounded-3xl border border-border/70",
        "bg-card/80 dark:bg-card/90",
        "supports-[backdrop-filter]:backdrop-blur-[24px]",
        "p-3.5 transition-all duration-200",
        "shadow-[0_12px_30px_-20px_color-mix(in_oklch,var(--primary)_16%,transparent)]",
        "dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.7)]",
        "active:scale-[0.99]",
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
      )}
      aria-label={`View ride ${from} to ${ride.to}`}
    >
      <div className="flex items-center gap-3">
        <Avatar name={ride.name} url={ride.avatarUrl} />

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold tracking-tight truncate text-foreground">
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
          <span className="text-[13px] font-bold text-foreground">{ride.rating}</span>
        </div>

        <p className="text-[14px] font-extrabold tracking-tight text-foreground">
          KES {ride.price.toLocaleString()}
        </p>
      </div>
    </button>
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

function toSearchRide(r: TodayRide): SearchRide {
  return {
    id: r.id,
    driverId: r.driverId,
    name: r.name,
    rating: r.rating,
    trips: 0,
    price: r.price,
    from: r.from,
    to: r.to,
    departureTime: `${r.dateISO}T${r.time}:00`,
    avatarUrl: r.avatarUrl,
  };
}

function TodayRidesCarousel({
  rides,
  fallbackFrom,
  seats = 1,
}: {
  rides: TodayRide[];
  fallbackFrom?: string;
  seats?: number;
}) {
  const chat = useChat();
  const { openAuthDrawer, isSignedIn } = useAuthDrawer();

  const [selectedRide, setSelectedRide] = useState<TodayRide | null>(null);
  const [payingRide, setPayingRide] = useState<TodayRide | null>(null);

  const searchRide = selectedRide ? toSearchRide(selectedRide) : null;

  const handleMessage = useCallback(() => {
    if (!selectedRide) return;
    if (!isSignedIn) { openAuthDrawer({ selectedRole: "passenger" }); return; }
    const dId = selectedRide.driverId ?? selectedRide.id;
    chat.openChat({
      rideId: selectedRide.id,
      tripState: "not_started",
      driver: {
        id: dId,
        name: selectedRide.name,
        rating: selectedRide.rating,
        trips: 0,
        avatarUrl: selectedRide.avatarUrl,
        role: "driver",
      },
    });
    setSelectedRide(null);
  }, [selectedRide, isSignedIn, openAuthDrawer, chat]);

  const handleBookSeat = useCallback(() => {
    if (!selectedRide) return;
    if (!isSignedIn) { openAuthDrawer({ selectedRole: "passenger" }); return; }
    setPayingRide(selectedRide);
  }, [selectedRide, isSignedIn, openAuthDrawer]);

  const {
    scrollerRef,
    active,
    scrollToIndex,
    onPointerDown,
    onPointerUp,
    onScroll,
  } = useAutoCarousel({
    count: rides.length,
    enabled: !selectedRide,
    intervalMs: 4200,
    pauseMsAfterInteract: 2400,
  });

  return (
    <>
      <div>
        <p className="px-1 text-[12px] font-extrabold tracking-[0.16em] uppercase text-foreground/90">
          Available rides
        </p>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "mt-2 w-full",
            "flex gap-2.5 overflow-x-auto overscroll-x-contain",
            "snap-x snap-mandatory pb-1",
            "touch-pan-x select-none",
            HIDE_SCROLLBAR,
          )}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {rides.map((r) => (
            <RideCard key={r.id} ride={r} fallbackFrom={fallbackFrom} onTap={setSelectedRide} />
          ))}
        </div>

        <Dots
          count={rides.length}
          active={active}
          onDot={(i) => scrollToIndex(i)}
        />
      </div>

      <RideDetailsSheet
        open={!!selectedRide}
        onOpenChange={(v) => { if (!v) setSelectedRide(null); }}
        selected={searchRide ? { kind: "search", ride: searchRide } : null}
        onMessage={handleMessage}
        onBookSeat={handleBookSeat}
      />

      <PaymentDrawer
        open={!!payingRide}
        onOpenChange={(v) => {
          if (!v) setPayingRide(null);
        }}
        rideId={payingRide?.id ?? ""}
        amount={(payingRide?.price ?? 0) * Math.max(1, seats)}
        seats={seats}
        routeLabel={
          payingRide ? `${payingRide.from} -> ${payingRide.to}` : undefined
        }
        onSuccess={() => {
          setSelectedRide(null);
        }}
      />
    </>
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
    <Surface elevated className="p-3 relative isolate z-10 focus-within:z-50">
      <button
        type="button"
        onClick={onSwap}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 z-20",
          "h-10 w-10 rounded-2xl grid place-items-center",
          "bg-primary text-primary-foreground",
          "shadow-[0_12px_30px_-20px_rgba(6,78,59,0.55)]",
          "active:scale-[0.98] transition-all duration-300",
        )}
        aria-label="Swap from and to"
      >
        <ArrowUpDown className="h-4 w-4" />
      </button>

      <div className="pr-14">
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

      <div className="my-2 h-px bg-border/50" />

      <div className="pr-14">
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
          "w-full flex items-start justify-between gap-3 text-left",
          "rounded-2xl transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
        )}
        aria-expanded={open}
      >
        <div className="min-w-0 text-left">
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
          <div className="mt-2 rounded-3xl border border-border/70 bg-card/56 supports-[backdrop-filter]:backdrop-blur-[24px] overflow-visible">
            <div className="p-3 sm:p-3.5">
              <LocationInput
                id="pickup"
                label="Pick up"
                value={filters.pickup}
                placeholder={
                  filters.from
                    ? `Pickup place in ${filters.from}`
                    : "Pickup place"
                }
                suggestions={pickupSuggestions}
                minChars={1}
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
                placeholder={
                  filters.to
                    ? `Drop-off place in ${filters.to}`
                    : "Drop-off place"
                }
                suggestions={dropoffSuggestions}
                minChars={1}
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
                  "mt-2 w-full min-h-[96px] resize-none rounded-3xl border border-border/70 bg-[color-mix(in_oklch,var(--card)_72%,white_10%)] supports-[backdrop-filter]:backdrop-blur-[24px]",
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
          "w-full flex items-start justify-between gap-3 text-left",
          "rounded-2xl transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
        )}
        aria-expanded={open}
      >
        <div className="min-w-0 text-left">
          <p className="text-[13px] font-semibold tracking-tight">
            Trip options
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Date, time, seats, and preferences
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

            <TimePickerCard
              label="Travel time"
              value={filters.departTime}
              onChange={(value) => update("departTime", value)}
              variant="card"
              className="p-2.5"
            />
          </div>

          <div className="mt-2">
            <Surface elevated className="p-2.5">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15 shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[12px] font-medium text-muted-foreground">
                    Seats
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold tracking-tight">
                    Up to {LIMITS.maxSeats}
                  </p>
                </div>
              </div>

              <SeatStepper
                value={filters.seats}
                min={LIMITS.minSeats}
                max={LIMITS.maxSeats}
                onChange={(value) => update("seats", value)}
                className="mt-2"
              />
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
                  icon={Music}
                  label="Music"
                  active={filters.music}
                  onClick={toggle("music")}
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
  const todayRides = useLiveTodayRides();
  const minDate = useMemo(() => todayISO(), []);
  const [dateOpen, setDateOpen] = useState(false);
  const fromSuggestions = useTownSuggestions(filters.from, MIN_TOWN_CHARS);
  const toSuggestions = useTownSuggestions(filters.to, MIN_TOWN_CHARS);
  const pickupSuggestions = usePlaceSuggestions(
    filters.from,
    filters.pickup,
    1,
  );
  const dropoffSuggestions = usePlaceSuggestions(
    filters.to,
    filters.dropoff,
    1,
  );

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
        filters.date &&
        filters.departTime,
      ),
    [
      filters.from,
      filters.to,
      filters.pickup,
      filters.dropoff,
      filters.date,
      filters.departTime,
    ],
  );

  const update = useCallback(
    <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) =>
      onChange({ ...filters, [k]: v }),
    [filters, onChange],
  );

  const setLocationValue = useCallback(
    (field: LocationField, value: string) => {
      switch (field) {
        case "from":
          onChange({ ...filters, from: value, pickup: "" });
          return;
        case "to":
          onChange({ ...filters, to: value, dropoff: "" });
          return;
        case "pickup":
          onChange({ ...filters, pickup: value });
          return;
        case "dropoff":
          onChange({ ...filters, dropoff: value });
          return;
      }
    },
    [filters, onChange],
  );

  const handleLocationChange = useCallback(
    (field: LocationField, value: string) => {
      setLocationValue(field, value);
    },
    [setLocationValue],
  );

  const handleLocationSelect = useCallback(
    (field: LocationField) => (value: string) => {
      setLocationValue(field, value);
      if (field === "from" || field === "to") {
        setDetailsOpen(true);
        setOptionsOpen(true);
      }
    },
    [setLocationValue],
  );

  const handleLocationClear = useCallback(
    (field: LocationField) => () => {
      setLocationValue(field, "");
    },
    [setLocationValue],
  );

  const swap = useCallback(
    () =>
      onChange({
        ...filters,
        from: filters.to,
        to: filters.from,
        pickup: filters.dropoff,
        dropoff: filters.pickup,
      }),
    [filters, onChange],
  );

  return (
    <div className="space-y-3">
        <RouteCard
          filters={filters}
          fromSuggestions={fromSuggestions}
          toSuggestions={toSuggestions}
          onFromChange={(v) => handleLocationChange("from", v)}
          onToChange={(v) => handleLocationChange("to", v)}
          onFromSelect={handleLocationSelect("from")}
          onToSelect={handleLocationSelect("to")}
          onFromClear={handleLocationClear("from")}
          onToClear={handleLocationClear("to")}
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
                onPickupChange={(v) => handleLocationChange("pickup", v)}
                onDropoffChange={(v) => handleLocationChange("dropoff", v)}
                onPickupSelect={handleLocationSelect("pickup")}
                onDropoffSelect={handleLocationSelect("dropoff")}
                onPickupClear={handleLocationClear("pickup")}
                onDropoffClear={handleLocationClear("dropoff")}
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
        seats={filters.seats}
      />
    </div>
  );
}

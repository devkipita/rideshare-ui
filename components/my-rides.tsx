"use client";

import * as React from "react";
import {
  CalendarDays,
  Clock3,
  Footprints,
  Luggage,
  MapPin,
  PawPrint,
  Search,
  SlidersHorizontal,
  Users2,
} from "lucide-react";

import {
  BottomSheet,
  ChipToggle,
  PillButton,
  ShimmerCard,
  Surface,
} from "@/components/ui-parts";
import { Button } from "@/components/ui/button";

type RideTiming = "now" | "scheduled";

type RequestedRide = {
  id: string;
  from: string;
  to: string;
  timing: RideTiming;
  dateLabel: string;
  timeLabel: string;
  seatsNeeded: number;
  luggage: boolean;
  pets: boolean;
  pickupStation?: string;
  dropoffStation?: string;
  note?: string;
  status: "active" | "matched" | "cancelled";
};

type PastRide = {
  id: string;
  from: string;
  to: string;
  dateLabel: string;
  timeLabel: string;
  seatsTaken: number;
  totalSeats: number;
  luggage: boolean;
  pets: boolean;
  pickupStation?: string;
  dropoffStation?: string;
  distanceLabel?: string;
  durationLabel?: string;
  status: "completed" | "cancelled";
};

const requestedRidesMock: RequestedRide[] = [
  {
    id: "req-1",
    from: "Nairobi",
    to: "Thika",
    timing: "scheduled",
    dateLabel: "Tomorrow",
    timeLabel: "6:40 PM",
    seatsNeeded: 1,
    luggage: false,
    pets: true,
    pickupStation: "Westlands, Sarit Centre",
    dropoffStation: "Thika, Makongeni",
    note: "Small pet in carrier.",
    status: "active",
  },
  {
    id: "req-2",
    from: "Nanyuki",
    to: "Nairobi",
    timing: "now",
    dateLabel: "Today",
    timeLabel: "Leaving soon",
    seatsNeeded: 2,
    luggage: true,
    pets: false,
    pickupStation: "Nanyuki Town, Next to Equity Bank",
    dropoffStation: "Nairobi CBD, Railway Station",
    status: "matched",
  },
  {
    id: "req-3",
    from: "Nakuru",
    to: "Eldoret",
    timing: "scheduled",
    dateLabel: "Feb 20",
    timeLabel: "10:00 AM",
    seatsNeeded: 3,
    luggage: true,
    pets: false,
    pickupStation: "Nakuru Town Center",
    dropoffStation: "Eldoret CBD",
    status: "active",
  },
  {
    id: "req-4",
    from: "Mombasa",
    to: "Nairobi",
    timing: "scheduled",
    dateLabel: "Feb 22",
    timeLabel: "5:30 AM",
    seatsNeeded: 2,
    luggage: true,
    pets: true,
    pickupStation: "Mombasa CBD, Digo Road",
    dropoffStation: "Nairobi, Jomo Kenyatta Airport",
    note: "Early morning flight connection needed.",
    status: "active",
  },
  {
    id: "req-5",
    from: "Kisumu",
    to: "Nairobi",
    timing: "scheduled",
    dateLabel: "Feb 25",
    timeLabel: "2:00 PM",
    seatsNeeded: 1,
    luggage: false,
    pets: false,
    pickupStation: "Kisumu Bus Station",
    dropoffStation: "Nairobi CBD, Railways",
    status: "active",
  },
];

const pastRidesMock: PastRide[] = [
  {
    id: "past-1",
    from: "Nairobi",
    to: "Nanyuki",
    dateLabel: "Feb 10",
    timeLabel: "5:00 PM",
    seatsTaken: 3,
    totalSeats: 6,
    luggage: true,
    pets: false,
    pickupStation: "Railway Station, Nairobi CBD",
    dropoffStation: "Nanyuki Town Center",
    distanceLabel: "185 km",
    durationLabel: "2h 45min",
    status: "completed",
  },
  {
    id: "past-2",
    from: "Thika",
    to: "Nairobi",
    dateLabel: "Feb 8",
    timeLabel: "8:00 AM",
    seatsTaken: 2,
    totalSeats: 4,
    luggage: false,
    pets: false,
    pickupStation: "Thika Town Center",
    dropoffStation: "Nairobi, Westlands",
    distanceLabel: "42 km",
    durationLabel: "55min",
    status: "completed",
  },
  {
    id: "past-3",
    from: "Nakuru",
    to: "Nairobi",
    dateLabel: "Feb 5",
    timeLabel: "6:30 AM",
    seatsTaken: 4,
    totalSeats: 5,
    luggage: true,
    pets: false,
    pickupStation: "Nakuru CBD",
    dropoffStation: "Nairobi, Upper Hill",
    distanceLabel: "158 km",
    durationLabel: "2h 15min",
    status: "completed",
  },
  {
    id: "past-4",
    from: "Nairobi",
    to: "Mombasa",
    dateLabel: "Jan 28",
    timeLabel: "4:00 AM",
    seatsTaken: 3,
    totalSeats: 6,
    luggage: true,
    pets: true,
    pickupStation: "Nairobi CBD, Railways",
    dropoffStation: "Mombasa, Nyali Beach",
    distanceLabel: "485 km",
    durationLabel: "6h 30min",
    status: "completed",
  },
];

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <p className="text-xs font-extrabold tracking-[0.22em] text-primary/90">
        {title.toUpperCase()}
      </p>
      {typeof count === "number" ? (
        <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {count}
        </div>
      ) : null}
      <div className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
    </div>
  );
}

function Tag({
  icon,
  label,
  tone = "muted",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "muted" | "primary";
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border",
        "supports-[backdrop-filter]:backdrop-blur-xl",
        tone === "primary"
          ? "bg-primary/14 border-primary/20 text-primary"
          : "bg-card/70 border-border/70 text-foreground/80",
      ].join(" ")}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 border border-primary/15 text-primary">
        {icon}
      </span>
      <span className="leading-none">{label}</span>
    </div>
  );
}

function MetricPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3 py-2 text-xs font-semibold text-foreground/85">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 border border-primary/15 text-primary">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

function PlaceRow({
  kind,
  text,
}: {
  kind: "pickup" | "dropoff";
  text: string;
}) {
  const isPickup = kind === "pickup";
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 px-3 py-3">
      <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-primary/10 border border-primary/15 text-primary">
        {isPickup ? (
          <div className="grid h-5 w-5 place-items-center rounded-full bg-primary">
            <div className="h-2.5 w-2.5 rounded-full bg-background" />
          </div>
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold tracking-[0.2em] text-primary/80">
          {isPickup ? "PICKUP" : "DROP-OFF"}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground/90">{text}</p>
      </div>
    </div>
  );
}

function RequestedRideCard({ ride }: { ride: RequestedRide }) {
  const statusLabel =
    ride.status === "active"
      ? "Active request"
      : ride.status === "matched"
        ? "Matched"
        : "Cancelled";

  return (
    <Surface tone="panel" elevated interactive className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tag
          icon={<Footprints className="h-3.5 w-3.5" />}
          label="Ride request"
          tone="primary"
        />
        <Tag
          icon={<Clock3 className="h-3.5 w-3.5" />}
          label={ride.timing === "now" ? "Now" : "Later"}
        />
        <Tag
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label={statusLabel}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
            FROM
          </p>
          <p className="mt-1 truncate text-xl font-extrabold text-foreground">
            {ride.from}
          </p>
        </div>

        <div className="mt-3 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
          <Footprints className="h-5 w-5" />
        </div>

        <div className="min-w-0 text-right">
          <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
            TO
          </p>
          <p className="mt-1 truncate text-xl font-extrabold text-foreground">
            {ride.to}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span>{ride.dateLabel}</span>
        <span className="opacity-60">•</span>
        <Clock3 className="h-4 w-4" />
        <span>{ride.timeLabel}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <MetricPill
          icon={<Users2 className="h-4 w-4" />}
          label={`${ride.seatsNeeded} seat${ride.seatsNeeded > 1 ? "s" : ""}`}
        />
        <MetricPill
          icon={<Luggage className="h-4 w-4" />}
          label={ride.luggage ? "Luggage" : "No luggage"}
        />
        <MetricPill
          icon={<PawPrint className="h-4 w-4" />}
          label={ride.pets ? "Pets ok" : "No pets"}
        />
      </div>

      {(ride.pickupStation || ride.dropoffStation) && (
        <div className="mt-4 space-y-2">
          {ride.pickupStation ? (
            <PlaceRow kind="pickup" text={ride.pickupStation} />
          ) : null}
          {ride.dropoffStation ? (
            <PlaceRow kind="dropoff" text={ride.dropoffStation} />
          ) : null}
        </div>
      )}

      {ride.note ? (
        <div className="mt-4 rounded-2xl border border-border/70 bg-card/70 px-3 py-3">
          <p className="text-[10px] font-extrabold tracking-[0.2em] text-muted-foreground">
            NOTE
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground/90">
            {ride.note}
          </p>
        </div>
      ) : null}
    </Surface>
  );
}

function PastRideCard({ ride }: { ride: PastRide }) {
  return (
    <Surface tone="raised" interactive className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tag
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label="Past ride"
          tone="primary"
        />
        <Tag
          icon={<Clock3 className="h-3.5 w-3.5" />}
          label={ride.status === "completed" ? "Completed" : "Cancelled"}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
            FROM
          </p>
          <p className="mt-1 truncate text-xl font-extrabold text-foreground">
            {ride.from}
          </p>
        </div>

        <div className="mt-3 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
          <MapPin className="h-5 w-5" />
        </div>

        <div className="min-w-0 text-right">
          <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
            TO
          </p>
          <p className="mt-1 truncate text-xl font-extrabold text-foreground">
            {ride.to}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span>{ride.dateLabel}</span>
        <span className="opacity-60">•</span>
        <Clock3 className="h-4 w-4" />
        <span>{ride.timeLabel}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <MetricPill
          icon={<Users2 className="h-4 w-4" />}
          label={`${ride.seatsTaken}/${ride.totalSeats} seats`}
        />
        <MetricPill
          icon={<Luggage className="h-4 w-4" />}
          label={ride.luggage ? "Luggage" : "No luggage"}
        />
        <MetricPill
          icon={<PawPrint className="h-4 w-4" />}
          label={ride.pets ? "Pets ok" : "No pets"}
        />
      </div>

      {(ride.pickupStation || ride.dropoffStation) && (
        <div className="mt-4 space-y-2">
          {ride.pickupStation ? (
            <PlaceRow kind="pickup" text={ride.pickupStation} />
          ) : null}
          {ride.dropoffStation ? (
            <PlaceRow kind="dropoff" text={ride.dropoffStation} />
          ) : null}
        </div>
      )}

      {ride.distanceLabel || ride.durationLabel ? (
        <div className="mt-4 rounded-2xl border border-border/70 bg-card/70 px-4 py-3">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold">
            <span className="text-muted-foreground">Distance</span>
            <span className="text-foreground/85">
              {ride.distanceLabel ?? "—"}
            </span>
          </div>
          <div className="mt-2 h-px bg-border/70" />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold">
            <span className="text-muted-foreground">Duration</span>
            <span className="text-foreground/85">
              {ride.durationLabel ?? "—"}
            </span>
          </div>
        </div>
      ) : null}
    </Surface>
  );
}

function FiltersSheet({
  open,
  onOpenChange,
  luggage,
  pets,
  setLuggage,
  setPets,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  luggage: boolean;
  pets: boolean;
  setLuggage: (v: boolean) => void;
  setPets: (v: boolean) => void;
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Filters">
      <div className="space-y-3">
        <Surface tone="sheet" className="p-3">
          <p className="text-sm font-extrabold tracking-tight">Preferences</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ChipToggle
              active={luggage}
              label="Luggage"
              icon={Luggage}
              onClick={() => setLuggage(!luggage)}
              size="md"
            />
            <ChipToggle
              active={pets}
              label="Pets ok"
              icon={PawPrint}
              onClick={() => setPets(!pets)}
              size="md"
            />
          </div>
        </Surface>

        <Button
          variant="secondary"
          className="h-11 w-full rounded-2xl font-semibold"
          onClick={() => {
            setLuggage(false);
            setPets(false);
          }}
        >
          Clear filters
        </Button>
      </div>
    </BottomSheet>
  );
}

function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerCard key={i} />
      ))}
    </div>
  );
}

export function MyRides() {
  const [tab, setTab] = React.useState<"requested" | "past">("requested");
  const [query, setQuery] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [onlyLuggage, setOnlyLuggage] = React.useState(false);
  const [onlyPets, setOnlyPets] = React.useState(false);

  const [loadingRequested, setLoadingRequested] = React.useState(true);
  const [loadingPast, setLoadingPast] = React.useState(true);

  React.useEffect(() => {
    const t1 = window.setTimeout(() => setLoadingRequested(false), 650);
    const t2 = window.setTimeout(() => setLoadingPast(false), 850);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const loading = tab === "requested" ? loadingRequested : loadingPast;
  const base = tab === "requested" ? requestedRidesMock : pastRidesMock;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return base
      .filter((r) => {
        if (!q) return true;
        const hay = [
          r.from,
          r.to,
          (r as any).pickupStation ?? "",
          (r as any).dropoffStation ?? "",
          (r as any).status ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .filter((r) => {
        const luggage = (r as any).luggage as boolean;
        const pets = (r as any).pets as boolean;
        if (onlyLuggage && !luggage) return false;
        if (onlyPets && !pets) return false;
        return true;
      });
  }, [base, query, onlyLuggage, onlyPets]);

  return (
    <div className="w-full space-y-4 pb-4">
      <Surface tone="sheet" className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">
              From, to, station...
            </p>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-1 py-0.5">
              <Search className="h-4 w-4 text-primary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-7 w-full bg-transparent text-[14px] font-semibold outline-none placeholder:text-muted-foreground/80"
              />
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-border/70 bg-card/70 text-foreground/80 active:scale-[0.99]"
                aria-label="Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <PillButton
            active={tab === "requested"}
            onClick={() => setTab("requested")}
            className="flex-1"
          >
            Requested
          </PillButton>
          <PillButton
            active={tab === "past"}
            onClick={() => setTab("past")}
            className="flex-1"
          >
            Previous
          </PillButton>
        </div>
      </Surface>

      <SectionHeader
        title={tab === "requested" ? "Requested rides" : "Previous rides"}
        count={loading ? undefined : filtered.length}
      />

      {loading ? (
        <SkeletonList count={tab === "requested" ? 5 : 4} />
      ) : filtered.length ? (
        <div className="space-y-3">
          {filtered.map((r: any) =>
            tab === "requested" ? (
              <RequestedRideCard key={r.id} ride={r as RequestedRide} />
            ) : (
              <PastRideCard key={r.id} ride={r as PastRide} />
            ),
          )}
        </div>
      ) : (
        <Surface tone="panel" className="p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <p className="mt-3 text-base font-extrabold">No rides found</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Try a different search or clear filters.
          </p>
          <Button
            variant="secondary"
            className="mt-5 h-11 w-full rounded-2xl font-semibold"
            onClick={() => {
              setQuery("");
              setOnlyLuggage(false);
              setOnlyPets(false);
            }}
          >
            Clear search
          </Button>
        </Surface>
      )}

      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        luggage={onlyLuggage}
        pets={onlyPets}
        setLuggage={setOnlyLuggage}
        setPets={setOnlyPets}
      />
    </div>
  );
}
// components/my-rides.tsx
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
  Star,
  Timer,
  Users2,
  Car,
  BadgeCheck,
  Hash,
  MessageCircle,
  PaletteIcon,
  X,
} from "lucide-react";

import {
  BottomSheet,
  ChipToggle,
  PillButton,
  ShimmerCard,
  Surface,
} from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import {
  useChat,
  type Driver as ChatDriver,
  type TripState as ChatTripState,
} from "@/components/global-chat";

type RideTiming = "now" | "scheduled";
type RideStatus = "active" | "matched" | "cancelled";
type TripState = "not_started" | "started" | "completed" | "cancelled";

type Driver = {
  id: string;
  name: string;
  rating: number;
  trips: number;
  avatarUrl?: string;
  verified?: boolean;
  car: {
    makeModel: string;
    color: string;
    plate: string;
  };
};

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
  status: RideStatus;
  driver?: Driver;
  tripState?: TripState;
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
  driver?: Driver;
};

const driversMock: Driver[] = [
  {
    id: "drv-1",
    name: "James K.",
    rating: 4.8,
    trips: 214,
    verified: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    car: { makeModel: "Toyota Axio", color: "Silver", plate: "KDD 234A" },
  },
  {
    id: "drv-2",
    name: "Sarah M.",
    rating: 4.9,
    trips: 318,
    verified: false,
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80",
    car: { makeModel: "Honda Fit", color: "Blue", plate: "KCF 778B" },
  },
];

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
    tripState: "not_started",
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
    driver: driversMock[0],
    tripState: "not_started",
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
    driver: driversMock[1],
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
    driver: driversMock[0],
  },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "D";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase();
}

function DriverAvatar({
  name,
  src,
  verified,
  size = 44,
}: {
  name: string;
  src?: string;
  verified?: boolean;
  size?: number;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="grid place-items-center overflow-hidden rounded-full border-2 border-primary/50 bg-primary/10 text-primary"
        style={{ width: size, height: size }}
        aria-label={`Driver avatar for ${name}`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-sm font-extrabold">{initials(name)}</span>
        )}
      </div>

      {verified ? (
        <div
          className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"
          aria-label="Verified driver"
          title="Verified driver"
        >
          <BadgeCheck className="h-3.5 w-3.5" />
        </div>
      ) : null}
    </div>
  );
}

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

function DriverSummaryCard({
  driver,
  onMessage,
}: {
  driver: Driver;
  onMessage: () => void;
}) {
  return (
    <Surface tone="panel" className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <DriverAvatar
            name={driver.name}
            src={driver.avatarUrl}
            verified={driver.verified}
            size={48}
          />

          <div className="min-w-0">
            <p className="text-[11px] font-extrabold tracking-[0.2em] text-muted-foreground">
              DRIVER
            </p>

            <div className="mt-1 flex items-center gap-2 min-w-0">
              <p className="truncate text-lg font-extrabold text-foreground">
                {driver.name}
              </p>

              {driver.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-2.5 py-1">
                <Star className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground/85">
                  {driver.rating.toFixed(1)}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-2.5 py-1">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground/85">{driver.trips} trips</span>
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          className="h-10 rounded-2xl px-4 font-semibold"
          onClick={onMessage}
        >
          Message
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Car className="h-4 w-4 text-primary" />
            <span>Car</span>
          </div>
          <p className="mt-1 text-sm font-extrabold text-foreground/90 truncate">
            {driver.car.makeModel}
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/70 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <PaletteIcon className="h-4 w-4 text-primary" />
            <span>Color</span>
          </div>
          <p className="mt-1 text-sm font-extrabold text-foreground/90 truncate">
            {driver.car.color}
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/70 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Hash className="h-4 w-4 text-primary" />
            <span>Plate</span>
          </div>
          <p className="mt-1 text-sm font-extrabold text-foreground/90 truncate">
            {driver.car.plate}
          </p>
        </div>
      </div>
    </Surface>
  );
}

function RequestedRideDetails({
  ride,
  onMessage,
}: {
  ride: RequestedRide;
  onMessage: () => void;
}) {
  const statusLabel =
    ride.status === "active"
      ? "Active request"
      : ride.status === "matched"
        ? "Matched"
        : "Cancelled";
  const canShowDriver = ride.status === "matched" && !!ride.driver;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Tag
          icon={<Footprints className="h-3.5 w-3.5" />}
          label={ride.timing === "now" ? "Leaving now" : "Scheduled"}
          tone="primary"
        />
        <Tag icon={<Clock3 className="h-3.5 w-3.5" />} label={statusLabel} />
      </div>

      {canShowDriver ? (
        <DriverSummaryCard driver={ride.driver!} onMessage={onMessage} />
      ) : null}

      <Surface tone="panel" className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
              FROM
            </p>
            <p className="mt-1 truncate text-xl font-extrabold text-foreground">
              {ride.from}
            </p>
          </div>

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
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

      {ride.status === "matched" ? (
        <Surface tone="panel" className="p-4">
          <p className="text-[11px] font-extrabold tracking-[0.2em] text-muted-foreground">
            TRIP STATUS
          </p>
          <p className="mt-1 text-sm font-extrabold text-foreground/90">
            {ride.tripState === "started"
              ? "Trip started"
              : ride.tripState === "completed"
                ? "Trip completed"
                : ride.tripState === "cancelled"
                  ? "Trip cancelled"
                  : "Not started"}
          </p>
        </Surface>
      ) : null}
    </div>
  );
}

function PastRideDetails({ ride }: { ride: PastRide }) {
  return (
    <div className="space-y-3">
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

      {ride.driver ? (
        <Surface tone="panel" className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <DriverAvatar
                name={ride.driver.name}
                src={ride.driver.avatarUrl}
                verified={ride.driver.verified}
                size={44}
              />

              <div className="min-w-0">
                <p className="text-[11px] font-extrabold tracking-[0.2em] text-muted-foreground">
                  DRIVER
                </p>
                <div className="mt-1 flex items-center gap-2 min-w-0">
                  <p className="truncate text-lg font-extrabold text-foreground">
                    {ride.driver.name}
                  </p>
                  {ride.driver.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-2.5 py-1">
                <Star className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground/85">
                  {ride.driver.rating.toFixed(1)}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-2.5 py-1">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground/85">
                  {ride.driver.trips} trips
                </span>
              </span>
            </div>
          </div>
        </Surface>
      ) : null}

      <Surface tone="panel" className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
              FROM
            </p>
            <p className="mt-1 truncate text-xl font-extrabold text-foreground">
              {ride.from}
            </p>
          </div>

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
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
      </Surface>
    </div>
  );
}

function RequestedRideCompactCard({
  ride,
  onClick,
}: {
  ride: RequestedRide;
  onClick: () => void;
}) {
  const statusTone =
    ride.status === "matched"
      ? "bg-primary/14 border-primary/20 text-primary"
      : ride.status === "cancelled"
        ? "bg-destructive/10 border-destructive/20 text-destructive"
        : "bg-card/70 border-border/70 text-foreground/80";

  const statusLabel =
    ride.status === "active"
      ? "Active"
      : ride.status === "matched"
        ? "Matched"
        : "Cancelled";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left active:scale-[0.995]"
      aria-label={`Open requested ride ${ride.from} to ${ride.to}`}
    >
      <Surface tone="raised" interactive className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-muted-foreground">
              ROUTE
            </p>
            <p className="mt-1 truncate text-lg font-extrabold text-foreground">
              {ride.from} <span className="text-primary">→</span> {ride.to}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{ride.dateLabel}</span>
              <span className="opacity-60">•</span>
              <Clock3 className="h-4 w-4" />
              <span>{ride.timeLabel}</span>
            </div>
          </div>

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
            <Footprints className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-semibold text-foreground/85">
            <Users2 className="h-3.5 w-3.5 text-primary" />
            <span>
              {ride.seatsNeeded} seat{ride.seatsNeeded > 1 ? "s" : ""}
            </span>
          </div>

          <div
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
              statusTone,
            ].join(" ")}
          >
            <span className="leading-none">{statusLabel}</span>
            <span className="opacity-70">•</span>
            <span className="leading-none">
              {ride.timing === "now" ? "Now" : "Scheduled"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div
              className={[
                "grid h-9 w-9 place-items-center rounded-2xl border",
                ride.luggage
                  ? "bg-primary/10 border-primary/15 text-primary"
                  : "bg-card/70 border-border/70 text-muted-foreground",
              ].join(" ")}
              aria-label={ride.luggage ? "Luggage" : "No luggage"}
            >
              <Luggage className="h-4 w-4" />
            </div>
            <div
              className={[
                "grid h-9 w-9 place-items-center rounded-2xl border",
                ride.pets
                  ? "bg-primary/10 border-primary/15 text-primary"
                  : "bg-card/70 border-border/70 text-muted-foreground",
              ].join(" ")}
              aria-label={ride.pets ? "Pets ok" : "No pets"}
            >
              <PawPrint className="h-4 w-4" />
            </div>
          </div>
        </div>

        {ride.status === "matched" && ride.driver ? (
          <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <DriverAvatar
                  name={ride.driver.name}
                  src={ride.driver.avatarUrl}
                  verified={ride.driver.verified}
                  size={40}
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold tracking-[0.2em] text-primary/80">
                    DRIVER MATCHED
                  </p>

                  <div className="mt-1 flex items-center gap-2 min-w-0">
                    <p className="truncate text-sm font-extrabold text-foreground/90">
                      {ride.driver.name}
                    </p>

                    {ride.driver.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Star className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground/85">
                      {ride.driver.rating.toFixed(1)}
                    </span>
                    <span className="opacity-60">•</span>
                    <span className="text-foreground/85">
                      {ride.driver.trips} trips
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/20 border border-primary/30 text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-3 h-px bg-border/60" />
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Tap to view details</span>
          <span className="text-primary">View</span>
        </div>
      </Surface>
    </button>
  );
}

function PastRideCompactCard({
  ride,
  onClick,
}: {
  ride: PastRide;
  onClick: () => void;
}) {
  const duration = ride.durationLabel ?? "—";
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left active:scale-[0.995]"
      aria-label={`Open past ride ${ride.from} to ${ride.to}`}
    >
      <Surface tone="raised" interactive className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-muted-foreground">
              ROUTE
            </p>
            <p className="mt-1 truncate text-lg font-extrabold text-foreground">
              {ride.from} <span className="text-primary">→</span> {ride.to}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{ride.dateLabel}</span>
              </div>
              <span className="opacity-60">•</span>
              <div className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                <span>{ride.timeLabel}</span>
              </div>
              <span className="opacity-60">•</span>
              <div className="inline-flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>{duration}</span>
              </div>
            </div>
          </div>

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 h-px bg-border/60" />
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Tap to view details</span>
          <span className="text-primary">View</span>
        </div>
      </Surface>
    </button>
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
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      headerRight={
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-border/70 bg-card/70 text-foreground/80 hover:bg-accent/40 active:scale-[0.99]"
          aria-label="Close filters"
        >
          <X className="h-4 w-4" />
        </button>
      }
    >
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

function toHaystackRequested(r: RequestedRide) {
  return [
    r.from,
    r.to,
    r.pickupStation ?? "",
    r.dropoffStation ?? "",
    r.note ?? "",
    r.status,
    r.timing,
    r.dateLabel,
    r.timeLabel,
    r.driver?.name ?? "",
    r.driver?.car.makeModel ?? "",
    r.driver?.car.color ?? "",
    r.driver?.car.plate ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function toHaystackPast(r: PastRide) {
  return [
    r.from,
    r.to,
    r.pickupStation ?? "",
    r.dropoffStation ?? "",
    r.status,
    r.dateLabel,
    r.timeLabel,
    r.distanceLabel ?? "",
    r.durationLabel ?? "",
    r.driver?.name ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function RideDetailsSheet({
  open,
  onOpenChange,
  selected,
  onMessage,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selected:
    | { kind: "requested"; ride: RequestedRide }
    | { kind: "past"; ride: PastRide }
    | null;
  onMessage: () => void;
}) {
  const title =
    selected?.kind === "requested"
      ? "Ride request"
      : selected?.kind === "past"
        ? "Ride details"
        : "Ride";

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      headerRight={
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-border/70 bg-card/70 text-foreground/80 hover:bg-accent/40 active:scale-[0.99]"
          aria-label="Close ride details"
        >
          <X className="h-4 w-4" />
        </button>
      }
    >
      {selected ? (
        selected.kind === "requested" ? (
          <RequestedRideDetails ride={selected.ride} onMessage={onMessage} />
        ) : (
          <PastRideDetails ride={selected.ride} />
        )
      ) : (
        <Surface tone="panel" className="p-4 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            No ride selected
          </p>
        </Surface>
      )}
    </BottomSheet>
  );
}

function toChatDriver(d: Driver): ChatDriver {
  return {
    id: d.id,
    name: d.name,
    rating: d.rating,
    trips: d.trips,
    avatarUrl: d.avatarUrl,
    car: d.car,
    verified: d.verified,
  } as ChatDriver;
}

function toChatTripState(s: TripState | undefined): ChatTripState {
  return (s ?? "not_started") as ChatTripState;
}

export function MyRides() {
  const { openChat } = useChat();

  const [tab, setTab] = React.useState<"requested" | "past">("requested");
  const [query, setQuery] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [onlyLuggage, setOnlyLuggage] = React.useState(false);
  const [onlyPets, setOnlyPets] = React.useState(false);

  const [loadingRequested, setLoadingRequested] = React.useState(true);
  const [loadingPast, setLoadingPast] = React.useState(true);

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<
    | { kind: "requested"; ride: RequestedRide }
    | { kind: "past"; ride: PastRide }
    | null
  >(null);

  const [ridesRequested] = React.useState<RequestedRide[]>(requestedRidesMock);

  React.useEffect(() => {
    const t1 = window.setTimeout(() => setLoadingRequested(false), 650);
    const t2 = window.setTimeout(() => setLoadingPast(false), 850);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const filteredRequested = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return ridesRequested
      .filter((r) => (q ? toHaystackRequested(r).includes(q) : true))
      .filter((r) => {
        if (onlyLuggage && !r.luggage) return false;
        if (onlyPets && !r.pets) return false;
        return true;
      });
  }, [ridesRequested, query, onlyLuggage, onlyPets]);

  const filteredPast = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return pastRidesMock
      .filter((r) => (q ? toHaystackPast(r).includes(q) : true))
      .filter((r) => {
        if (onlyLuggage && !r.luggage) return false;
        if (onlyPets && !r.pets) return false;
        return true;
      });
  }, [query, onlyLuggage, onlyPets]);

  const filteredCount =
    tab === "requested" ? filteredRequested.length : filteredPast.length;

  const onMessageSelected = React.useCallback(() => {
    const ride = selected?.kind === "requested" ? selected.ride : null;
    if (!ride) return;
    if (ride.status !== "matched" || !ride.driver) return;

    openChat({
      rideId: ride.id,
      tripState: toChatTripState(ride.tripState),
      driver: toChatDriver(ride.driver),
    });
  }, [selected, openChat]);

  return (
    <div className="w-full space-y-4 pb-4">
      <p className="text-lg font-semibold text-center m-0 py-1 text-white">
        My Rides
      </p>

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
        count={
          (tab === "requested" ? loadingRequested : loadingPast)
            ? undefined
            : filteredCount
        }
      />

      {(tab === "requested" ? loadingRequested : loadingPast) ? (
        <SkeletonList count={tab === "requested" ? 5 : 4} />
      ) : filteredCount ? (
        <div className="space-y-3">
          {tab === "requested"
            ? filteredRequested.map((r) => (
                <RequestedRideCompactCard
                  key={r.id}
                  ride={r}
                  onClick={() => {
                    setSelected({ kind: "requested", ride: r });
                    setDetailsOpen(true);
                  }}
                />
              ))
            : filteredPast.map((r) => (
                <PastRideCompactCard
                  key={r.id}
                  ride={r}
                  onClick={() => {
                    setSelected({ kind: "past", ride: r });
                    setDetailsOpen(true);
                  }}
                />
              ))}
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

      <RideDetailsSheet
        open={detailsOpen}
        onOpenChange={(v) => {
          setDetailsOpen(v);
          if (!v) setSelected(null);
        }}
        selected={selected}
        onMessage={onMessageSelected}
      />
    </div>
  );
}

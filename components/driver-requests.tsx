"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Surface, FormDivider } from "@/components/ui-parts";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  User,
  Users2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RequestStatus = "pending" | "accepted" | "rejected";

type Trip = {
  driverName: string;
  driverRating: number;
  driverTrips: number;
  from: string;
  to: string;
  pickup: string;
  dropoff: string;
  dateLabel: string;
  timeLabel: string;
  availableSeats: number;
};

type Request = {
  id: string;
  passengerName: string;
  rating: number;
  trips: number;
  seatsNeeded: number;
  status: RequestStatus;
  verified: boolean;
  phone?: string;
};

const mockTrip: Trip = {
  driverName: "Ngeni K.",
  driverRating: 4.8,
  driverTrips: 126,
  from: "Nairobi",
  to: "Nakuru",
  pickup: "Westlands, Shell (Nairobi)",
  dropoff: "Nakuru CBD (Nakuru)",
  dateLabel: "Today",
  timeLabel: "2:30 PM",
  availableSeats: 3,
};

const mockRequests: Request[] = [
  {
    id: "req-1",
    passengerName: "Alice K.",
    rating: 4.9,
    trips: 18,
    seatsNeeded: 1,
    status: "pending",
    verified: true,
    phone: "+254700000001",
  },
  {
    id: "req-2",
    passengerName: "Bob J.",
    rating: 4.7,
    trips: 11,
    seatsNeeded: 2,
    status: "pending",
    verified: false,
    phone: "+254700000002",
  },
  {
    id: "req-3",
    passengerName: "Carol M.",
    rating: 5.0,
    trips: 24,
    seatsNeeded: 1,
    status: "accepted",
    verified: true,
    phone: "+254700000003",
  },
];

export function DriverRequests({
  onOpenChat,
}: {
  onOpenChat?: (payload: { requestId: string; passengerName: string }) => void;
}) {
  const [trip] = useState<Trip>(mockTrip);
  const [requests, setRequests] = useState<Request[]>(mockRequests);

  const pending = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests],
  );
  const accepted = useMemo(
    () => requests.filter((r) => r.status === "accepted"),
    [requests],
  );

  const accept = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)),
    );
  };

  const decline = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
    );
  };

  const openChat = (req: Request) => {
    onOpenChat?.({ requestId: req.id, passengerName: req.passengerName });
    window.dispatchEvent(
      new CustomEvent("kipita:chat", {
        detail: {
          rideId: req.id,
          peerName: req.passengerName,
          peerRole: "passenger",
        },
      }),
    );
  };

  const callPassenger = (req: Request) => {
    const phone = req.phone?.trim();
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="md:hidden">
      <div className="pb-[calc(120px+env(safe-area-inset-bottom))] space-y-3">
        <TripSummaryCard trip={trip} />

        <SectionCard title="Pending requests" count={pending.length} tone="pending">
          {pending.length ? (
            <div className="space-y-3">
              {pending.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  tone="pending"
                  onChat={() => openChat(req)}
                  onCall={() => callPassenger(req)}
                  onAccept={() => accept(req.id)}
                  onDecline={() => decline(req.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyInline
              icon={Clock3}
              title="No pending requests"
              desc="When someone requests to join your carpool, they’ll appear here."
            />
          )}
        </SectionCard>

        <SectionCard title="Accepted" count={accepted.length} tone="accepted">
          {accepted.length ? (
            <div className="space-y-3">
              {accepted.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  tone="accepted"
                  onChat={() => openChat(req)}
                  onCall={() => callPassenger(req)}
                />
              ))}
            </div>
          ) : (
            <EmptyInline
              icon={Check}
              title="No accepted passengers yet"
              desc="Accepted passengers will show here with chat and call actions."
            />
          )}
        </SectionCard>

        <TrustReminder />
      </div>
    </div>
  );
}

function TripSummaryCard({ trip }: { trip: Trip }) {
  return (
    <Surface tone="sheet" elevated className="overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-muted-foreground">
              Manage requests
            </p>
            <h1 className="mt-0.5 text-[18px] font-extrabold tracking-tight">
              {trip.from} → {trip.to}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Chip icon={CalendarDays}>{trip.dateLabel}</Chip>
              <Chip icon={Clock3}>{trip.timeLabel}</Chip>
              <Chip icon={Users2} tone="primary">
                {trip.availableSeats} seats left
              </Chip>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/15 bg-primary/10">
              <User className="h-4.5 w-4.5 text-primary" />
            </span>
            <p className="mt-2 text-[13px] font-extrabold tracking-tight">
              {trip.driverName}
            </p>
            <div className="mt-0.5 flex items-center justify-end gap-2 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                <span className="font-semibold text-foreground/85">
                  {trip.driverRating.toFixed(1)}
                </span>
              </span>
              <span className="opacity-60">•</span>
              <span>{trip.driverTrips} trips</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3">
          <IconField icon={MapPin} label="Pick up" value={trip.pickup} />
          <IconField icon={MapPin} label="Drop off" value={trip.dropoff} />
        </div>
      </div>
    </Surface>
  );
}

function SectionCard({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count: number;
  tone: "pending" | "accepted";
  children: React.ReactNode;
}) {
  return (
    <Surface
      tone="sheet"
      elevated
      className={cn(
        "overflow-hidden",
        tone === "pending"
          ? "bg-[color-mix(in_oklch,var(--card)_90%,var(--primary)_6%)]"
          : "bg-[color-mix(in_oklch,var(--card)_90%,var(--ring)_7%)]",
      )}
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-extrabold tracking-tight text-foreground/80">
            {title}
          </p>
          <Chip tone={tone === "accepted" ? "primary" : "soft"} className="px-2.5">
            {count}
          </Chip>
        </div>
      </div>

      <FormDivider />

      <div className="px-4 py-4">{children}</div>
    </Surface>
  );
}

function RequestCard({
  req,
  tone,
  onAccept,
  onDecline,
  onChat,
  onCall,
}: {
  req: Request;
  tone: "pending" | "accepted";
  onAccept?: () => void;
  onDecline?: () => void;
  onChat: () => void;
  onCall: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/70 overflow-hidden",
        "supports-[backdrop-filter]:backdrop-blur-xl",
        "shadow-[0_10px_28px_-22px_oklch(var(--brand-primary)/0.18)]",
        tone === "pending"
          ? "bg-[color-mix(in_oklch,var(--surface-low)_88%,var(--primary)_12%)]"
          : "bg-[color-mix(in_oklch,var(--surface-low)_90%,var(--ring)_10%)]",
      )}
    >
      <div className="px-3.5 pt-3.5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar name={req.passengerName} tone={tone} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[15px] font-extrabold tracking-tight">
                  {req.passengerName}
                </p>

                <Chip icon={Users2} tone="soft" className="shrink-0">
                  {req.seatsNeeded} seat{req.seatsNeeded === 1 ? "" : "s"}
                </Chip>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <MetricRow rating={req.rating} trips={req.trips} />
                <span className="opacity-50">•</span>
                {req.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[11px] font-semibold text-foreground/70">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
                    Basic
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <ActionIconBtn icon={MessageCircle} label="Chat" onClick={onChat} />
            <ActionIconBtn icon={Phone} label="Call" onClick={onCall} />
          </div>
        </div>

        {tone === "pending" ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={onAccept}
              className={cn(
                "h-12 rounded-full",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "shadow-[0_18px_44px_-34px_color-mix(in_oklch,var(--primary)_44%,transparent)]",
                "active:scale-[0.99] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
            >
              <CheckCircle2 className="mr-2 h-4.5 w-4.5" strokeWidth={2.4} />
              Accept
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onDecline}
              className={cn(
                "h-12 rounded-full",
                "border-border/70 bg-[color-mix(in_oklch,var(--card)_88%,white_12%)]",
                "hover:bg-primary/8 hover:border-primary/20",
                "active:scale-[0.99] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
            >
              <XCircle className="mr-2 h-4.5 w-4.5" strokeWidth={2.4} />
              Decline
            </Button>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between">
            <Chip icon={Check} tone="primary" className="px-3.5 py-2">
              Confirmed
            </Chip>
          </div>
        )}
      </div>
    </div>
  );
}

function TrustReminder() {
  return (
    <Surface
      tone="sheet"
      elevated
      className="overflow-hidden bg-[color-mix(in_oklch,var(--card)_90%,var(--primary)_6%)]"
    >
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl border border-primary/15 bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold tracking-tight">
              Trust-first reminder
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Chat or call to confirm pickup timing before accepting. Accept only passengers whose seat needs match your trip.
            </p>
          </div>
        </div>
      </div>
    </Surface>
  );
}

function EmptyInline({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-[color-mix(in_oklch,var(--muted)_70%,var(--card)_30%)] px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-11 w-11 place-items-center rounded-2xl border border-border/70 bg-card/70">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-extrabold tracking-tight">{title}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, tone }: { name: string; tone: "pending" | "accepted" }) {
  return (
    <div
      className={cn(
        "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border",
        tone === "pending"
          ? "bg-[color-mix(in_oklch,var(--card)_80%,var(--primary)_20%)] border-primary/15"
          : "bg-[color-mix(in_oklch,var(--card)_82%,var(--ring)_18%)] border-primary/15",
      )}
    >
      <span className="text-[13px] font-extrabold tracking-tight text-primary">
        {initials(name)}
      </span>
    </div>
  );
}

function Chip({
  icon: Icon,
  children,
  tone = "neutral",
  className,
}: {
  icon?: any;
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "soft";
  className?: string;
}) {
  const toneClass =
    tone === "primary"
      ? "border-primary/15 bg-primary/10 text-primary"
      : tone === "soft"
        ? "border-border/70 bg-muted/60 text-foreground/80"
        : "border-border/70 bg-card/70 text-foreground/85";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "border text-[12px] font-semibold tracking-tight",
        toneClass,
        className,
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={2.3} /> : null}
      {children}
    </span>
  );
}

function MetricRow({ rating, trips }: { rating: number; trips: number }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Star className="h-3.5 w-3.5 text-primary fill-primary" />
        <span className="font-semibold text-foreground/85">
          {rating.toFixed(1)}
        </span>
      </span>
      <span className="opacity-60">•</span>
      <span>{trips} trips</span>
    </div>
  );
}

function IconField({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl border border-primary/15 bg-primary/10">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-[13px] font-semibold tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionIconBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "touch-target grid h-11 w-11 place-items-center rounded-2xl border",
        "border-border/70 bg-[color-mix(in_oklch,var(--card)_90%,white_10%)]",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:bg-primary/8 hover:border-primary/20",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(var(--ring)/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <Icon className="h-4.5 w-4.5 text-primary" strokeWidth={2.3} />
    </button>
  );
}

function initials(name: string) {
  const parts = name
    .replace(/\./g, "")
    .split(" ")
    .filter(Boolean);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpDown,
  CalendarDays,
  Clock3,
  Banknote,
  Users,
  PawPrint,
  Package,
  Music,
  MapPin,
  Dot,
  ArrowRight,
  Star,
  MessageCircle,
  BadgeCheck,
  Footprints,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, todayISO, hashString, avatarColors } from "@/lib/utils";
import { useAutoCarousel } from "@/hooks/use-auto-carousel";
import { useTownSuggestions } from "@/hooks/use-town-suggestions";
import {
  BottomSheet,
  ChipToggle,
  LocationInput,
  SeatStepper,
  Surface,
} from "./ui-parts";
import { useChat } from "./global-chat";
import { DatePickerCard } from "./ui/date-picker";
import {
  AnnouncementsStrip,
  useAnnouncements,
} from "./announcements-strip";
import { useAuthDrawer } from "./auth-drawer-provider";
import { LIMITS } from "@/lib/constants";
import useSWR from "swr";

/* ── types ─────────────────────────────────────────── */

interface OfferRideForm {
  from: string;
  to: string;
  date: string;
  departTime: string;
  seats: number;
  pricePerSeat: number;
  pets: boolean;
  luggage: boolean;
  music: boolean;
}

interface DriverOfferRideProps {
  onSubmit?: (form: OfferRideForm) => void;
}

type LocationField = "from" | "to";

type PassengerRequest = {
  id: string;
  passengerId?: string;
  name: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  avatarUrl?: string;
};


/* ── constants ─────────────────────────────────────── */

const MIN_TOWN_CHARS = 2;
const HIDE_SCROLLBAR =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const DRIVER_OFFER_DRAFT_KEY = "kipita-driver-offer-draft";

const DEFAULT_OFFER_FORM: OfferRideForm = {
  from: "",
  to: "",
  date: "",
  departTime: "",
  seats: 4,
  pricePerSeat: 1200,
  pets: false,
  luggage: false,
  music: false,
};

/* ── utilities (imported from @/lib/utils) ──────── */

function formatDateDMY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function normalizeTimeInput(value?: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)/.exec(value ?? "");
  return match ? `${match[1]}:${match[2]}` : "";
}

function formatTimeLabel(value?: string) {
  const time = normalizeTimeInput(value);
  if (!time) return "Any time";
  const [hours, minutes] = time.split(":").map(Number);
  const dt = new Date(2026, 0, 1, hours, minutes);
  return dt.toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
  });
}


/* ── hooks ─────────────────────────────────────────── */

const FALLBACK_REQUESTS: PassengerRequest[] = [
  { id: "fr1", name: "Sarah M.", from: "Nairobi", to: "Nakuru", date: todayISO(), time: "08:00", seats: 2 },
  { id: "fr2", name: "Brian O.", from: "Mombasa", to: "Nairobi", date: todayISO(), time: "09:30", seats: 1 },
];

function usePassengerRequests(): { requests: PassengerRequest[]; loading: boolean } {
  const [requests, setRequests] = useState<PassengerRequest[]>(FALLBACK_REQUESTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/ride-requests")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.ride_requests?.length) {
          setLoading(false);
          return;
        }
        const mapped: PassengerRequest[] = json.ride_requests.map(
          (r: Record<string, unknown>) => {
            const passenger = r.passenger as Record<string, unknown> | null;
            return {
              id: r.id as string,
              passengerId: (passenger?.id as string) ?? undefined,
              name: (passenger?.name as string) ?? "Passenger",
              from: r.origin as string,
              to: r.destination as string,
              date: (r.preferred_date as string) ?? todayISO(),
              time: normalizeTimeInput(r.preferred_time as string),
              seats: (r.seats_needed as number) ?? 1,
              avatarUrl: (passenger?.image as string) ?? undefined,
            };
          },
        );
        setRequests(mapped.length ? mapped : FALLBACK_REQUESTS);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { requests, loading };
}

function useLivePassengerRequests(): {
  requests: PassengerRequest[];
  loading: boolean;
} {
  const { data, isLoading } = useSWR<{ ride_requests?: Record<string, unknown>[] }>(
    "/api/ride-requests",
    {
      refreshInterval: LIMITS.pollIntervalMs,
    },
  );

  const requests = useMemo(() => {
    if (!data?.ride_requests?.length) return FALLBACK_REQUESTS;

    const mapped: PassengerRequest[] = data.ride_requests.map((r) => {
      const passenger = r.passenger as Record<string, unknown> | null;
      return {
        id: r.id as string,
        passengerId: (passenger?.id as string) ?? undefined,
        name: (passenger?.name as string) ?? "Passenger",
        from: r.origin as string,
        to: r.destination as string,
        date: (r.preferred_date as string) ?? todayISO(),
        time: normalizeTimeInput(r.preferred_time as string),
        seats: (r.seats_needed as number) ?? 1,
        avatarUrl: (passenger?.image as string) ?? undefined,
      };
    });

    return mapped.length ? mapped : FALLBACK_REQUESTS;
  }, [data?.ride_requests]);

  return { requests, loading: isLoading };
}


/* useAutoCarousel imported from @/hooks/use-auto-carousel */

/* ── small components ──────────────────────────────── */

const Avatar = React.memo(function Avatar({ name, url }: { name: string; url?: string }) {
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }, [name]);
  const c = useMemo(() => avatarColors(name), [name]);

  return (
    <div
      className="h-9 w-9 rounded-2xl overflow-hidden grid place-items-center border shrink-0"
      style={{ background: c.bg, borderColor: c.border }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-[11px] font-extrabold" style={{ color: c.text }}>{initials}</span>
      )}
    </div>
  );
});

function Dots({ count, active, onDot }: { count: number; active: number; onDot: (i: number) => void }) {
  if (count <= 1) return null;
  return (
    <div className="mt-1.5 flex items-center justify-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onDot(i)}
          aria-label={`Go to item ${i + 1}`}
          className={cn(
            "h-1.5 rounded-full transition-all duration-200",
            i === active ? "w-5 bg-primary" : "w-2 bg-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

/* ── request card ──────────────────────────────────── */

const RequestCard = React.memo(function RequestCard({
  req,
  onTap,
}: {
  req: PassengerRequest;
  onTap: (req: PassengerRequest) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onTap(req)}
      className={cn(
        "snap-start shrink-0 text-left",
        "w-[72vw] min-w-[220px] max-w-[300px]",
        "rounded-3xl border border-border/70 bg-card/56 supports-[backdrop-filter]:backdrop-blur-[24px]",
        "p-3 transition-all duration-200",
        "active:scale-[0.98] hover:border-primary/30 hover:bg-card/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
      )}
      aria-label={`View request: ${req.from} to ${req.to}`}
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={req.name} url={req.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold tracking-tight truncate">{req.name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-foreground/78">
            <Dot className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">{req.from}</span>
            <ArrowRight className="h-3 w-3 opacity-60 shrink-0" />
            <MapPin className="h-3 w-3 text-primary" />
            <span className="truncate">{req.to}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-foreground/72">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {formatDateDMY(req.date)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3 w-3" />
          {formatTimeLabel(req.time)}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <Users className="h-3 w-3 text-primary" />
          {req.seats} seat{req.seats !== 1 ? "s" : ""}
        </span>
      </div>
    </button>
  );
});

/* ── passenger requests carousel ───────────────────── */

function PassengerAvatar({
  name,
  src,
  size = 52,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const c = avatarColors(name);
  const ini = name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("");
  return (
    <div
      className="rounded-full grid place-items-center overflow-hidden border-2 shrink-0"
      style={{ width: size, height: size, background: c.bg, borderColor: c.border }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-extrabold" style={{ fontSize: size * 0.3, color: c.text }}>{ini}</span>
      )}
    </div>
  );
}

function MetricPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-2xl px-3.5 py-2",
      "bg-card/58 dark:bg-card/50",
      "border border-border/60",
      "supports-[backdrop-filter]:backdrop-blur-[24px]",
    )}>
      <div className="grid h-7 w-7 place-items-center rounded-xl bg-primary/12 border border-primary/15">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold leading-tight text-foreground/72">{label}</p>
        <p className="text-[13px] font-extrabold tracking-tight leading-tight">{value}</p>
      </div>
    </div>
  );
}

function RequestDetailSheet({
  request,
  onClose,
}: {
  request: PassengerRequest | null;
  onClose: () => void;
}) {
  const chat = useChat();
  const { openAuthDrawer, isSignedIn } = useAuthDrawer();
  const [matched, setMatched] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [matchPrice, setMatchPrice] = useState("1200");
  const [matchTime, setMatchTime] = useState("08:00");
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Reset matched state when request changes
  useEffect(() => {
    setMatched(false);
    setShowMatchForm(false);
    setMatchPrice("1200");
    setMatchTime(normalizeTimeInput(request?.time) || "08:00");
    setMatching(false);
    setMatchError(null);
  }, [request?.id, request?.time]);

  if (!request) return null;

  const handleMessage = () => {
    if (!isSignedIn) { openAuthDrawer({ selectedRole: "driver" }); return; }
    chat.openChat({
      rideId: request.id,
      tripState: "not_started",
      driver: {
        id: request.passengerId ?? request.id,
        name: request.name,
        rating: 0,
        trips: 0,
        avatarUrl: request.avatarUrl,
        role: "passenger",
      },
    });
    onClose();
  };

  const handleMatch = async () => {
    if (!isSignedIn) { openAuthDrawer({ selectedRole: "driver" }); return; }
    if (!showMatchForm) {
      setShowMatchForm(true);
      return;
    }

    const price = Number(matchPrice);
    if (!Number.isFinite(price) || price <= 0) {
      setMatchError("Enter a valid price per seat.");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(matchTime)) {
      setMatchError("Choose a valid departure time.");
      return;
    }

    setMatching(true);
    setMatchError(null);
    try {
      const res = await fetch("/api/ride-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          status: "accepted",
          price_per_seat: price,
          depart_time: matchTime,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to match request");
      setMatched(true);
      setShowMatchForm(false);
    } catch (error) {
      setMatchError(error instanceof Error ? error.message : "Try again.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <BottomSheet open title="Ride Request" onOpenChange={(v) => { if (!v) onClose(); }}>
      <div className="space-y-3">
        {/* ===== Passenger summary card (branded design) ===== */}
        <Surface
          tone="panel"
          className={cn(
            "relative overflow-hidden rounded-[28px] p-5",
            "bg-secondary/25 dark:bg-accent/35",
            "border border-border",
          )}
        >
          {/* Header: avatar + name + seats badge */}
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <div className="rounded-full p-[3px]">
                  <PassengerAvatar name={request.name} src={request.avatarUrl} size={52} />
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-foreground/60 dark:text-foreground/70">
                  Passenger
                </p>
                <p className="truncate text-xl font-extrabold text-foreground">
                  {request.name}
                </p>
              </div>
            </div>

            {/* Seats badge */}
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-2",
              "bg-primary/14 dark:bg-primary/20",
              "border border-primary/22 dark:border-primary/28",
              "supports-[backdrop-filter]:backdrop-blur-[24px]",
            )}>
              <Users className="h-4 w-4 text-primary" />
              <span className="text-lg font-black text-primary tracking-tight">
                {request.seats}
              </span>
              <span className="text-[11px] font-semibold text-primary/80">
                seat{request.seats !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Metric pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            <MetricPill icon={CalendarDays} label="Date" value={formatDateDMY(request.date)} />
            <MetricPill icon={Clock3} label="Time" value={formatTimeLabel(request.time)} />
            <MetricPill icon={Footprints} label="Seats" value={`${request.seats} seat${request.seats !== 1 ? "s" : ""}`} />
          </div>
        </Surface>

        {/* ===== Route card ===== */}
        <Surface tone="panel" elevated className="rounded-[22px] overflow-hidden">
          <div className="px-4 pt-3.5 pb-1">
            <p className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-foreground/70">
              Route
            </p>
          </div>
          <div className="px-4 pb-4 flex items-center gap-3">
            <div className="flex flex-col items-center gap-0.5">
              <div className="h-3 w-3 rounded-full bg-primary ring-2 ring-primary/20" />
              <div className="w-[2px] h-7 bg-primary/30 rounded-full" />
              <div className="h-3 w-3 rounded-full bg-primary/50 ring-2 ring-primary/15" />
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              <div>
                <p className="text-[10px] font-semibold text-foreground/70">FROM</p>
                <p className="text-[14px] font-extrabold tracking-tight truncate">{request.from}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-foreground/70">TO</p>
                <p className="text-[14px] font-extrabold tracking-tight truncate">{request.to}</p>
              </div>
            </div>
          </div>
        </Surface>

        {/* ===== Actions ===== */}
        {matched ? (
          <Surface tone="panel" elevated className="rounded-[22px] p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full grid place-items-center bg-primary/12 border border-primary/15">
                <BadgeCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-extrabold tracking-tight">Matched!</p>
                <p className="mt-0.5 text-[12px] text-foreground/72">
                  Send a message to coordinate pickup details.
                </p>
              </div>
            </div>
            <Button
              onClick={handleMessage}
              className={cn(
                "mt-3 h-11 w-full rounded-2xl font-semibold tracking-tight",
                "bg-primary text-primary-foreground active:scale-[0.99]",
                "shadow-[0_18px_44px_-34px_color-mix(in_oklch,var(--primary)_44%,transparent)]",
              )}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message {request.name.split(" ")[0]}
            </Button>
          </Surface>
        ) : showMatchForm ? (
          <Surface tone="panel" elevated className="rounded-[22px] p-4">
            <p className="text-[13px] font-extrabold tracking-tight">
              Add match terms
            </p>
            <p className="mt-1 text-[12px] text-foreground/72">
              The passenger pays after these terms are accepted.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-border/70 bg-card/62 supports-[backdrop-filter]:backdrop-blur-[24px] px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-foreground/70">
                  <Banknote className="h-3.5 w-3.5 text-primary" />
                  PRICE
                </div>
                <Input
                  type="number"
                  value={matchPrice}
                  onChange={(e) => setMatchPrice(e.target.value)}
                  className="mt-1 h-8 border-0 bg-transparent p-0 text-[14px] font-extrabold focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/62 supports-[backdrop-filter]:backdrop-blur-[24px] px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-foreground/70">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  TIME
                </div>
                <Input
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="mt-1 h-8 border-0 bg-transparent p-0 text-[14px] font-extrabold focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            {matchError ? (
              <p className="mt-2 text-center text-[12px] font-semibold text-destructive">
                {matchError}
              </p>
            ) : null}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                onClick={handleMatch}
                disabled={matching}
                className="h-12 rounded-2xl bg-primary font-extrabold text-primary-foreground"
              >
                {matching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Star className="h-4 w-4 mr-2" />
                )}
                {matching ? "Matching..." : "Confirm"}
              </Button>
              <Button
                onClick={() => {
                  setShowMatchForm(false);
                  setMatchError(null);
                }}
                variant="outline"
                className="h-12 rounded-2xl font-extrabold"
              >
                Cancel
              </Button>
            </div>
          </Surface>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleMatch}
              className={cn(
                "h-12 rounded-2xl font-extrabold tracking-tight",
                "bg-primary text-primary-foreground",
                "shadow-[0_18px_44px_-34px_color-mix(in_oklch,var(--primary)_44%,transparent)]",
                "active:scale-[0.99] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
            >
              <Star className="h-4 w-4 mr-2" />
              Match ride
            </Button>
            <Button
              onClick={handleMessage}
              variant="outline"
                className={cn(
                  "h-12 rounded-2xl font-extrabold tracking-tight",
                  "border-border/70 bg-card/62 supports-[backdrop-filter]:backdrop-blur-[24px]",
                  "hover:bg-primary/8 hover:border-primary/20",
                  "active:scale-[0.99] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                )}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

function RequestsCarousel({ requests }: { requests: PassengerRequest[] }) {
  const [selectedRequest, setSelectedRequest] = useState<PassengerRequest | null>(null);

  const { scrollerRef, active, scrollToIndex, onPointerDown, onPointerUp, onScroll } =
    useAutoCarousel({ count: requests.length, enabled: !selectedRequest, intervalMs: 4200 });

  return (
    <>
      <div>
        <p className="px-1 text-[12px] font-semibold tracking-tight text-foreground/84">
          Passenger requests
        </p>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "mt-2 w-full flex gap-2.5 overflow-x-auto overscroll-x-contain",
            "snap-x snap-mandatory pb-1 touch-pan-x select-none",
            HIDE_SCROLLBAR,
          )}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {requests.map((r) => (
            <RequestCard key={r.id} req={r} onTap={setSelectedRequest} />
          ))}
        </div>

        <Dots count={requests.length} active={active} onDot={(i) => scrollToIndex(i)} />
      </div>

      <RequestDetailSheet request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </>
  );
}

/* ── announcements strip ───────────────────────────── */

/* AnnouncementsStrip is now imported from ./announcements-strip */

/* ── trip details toggle ───────────────────────────── */

function TripDetailsSection({
  form,
  update,
  minDate,
  dateOpen,
  setDateOpen,
  canPost,
  isPosting,
  postError,
  onSubmit,
}: {
  form: OfferRideForm;
  update: <K extends keyof OfferRideForm>(k: K, v: OfferRideForm[K]) => void;
  minDate: string;
  dateOpen: boolean;
  setDateOpen: (v: boolean) => void;
  canPost: boolean;
  isPosting: boolean;
  postError: string | null;
  onSubmit: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Surface elevated className="p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-start justify-between gap-3",
          "rounded-2xl transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
        )}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-tight">Trip details</p>
          <p className="mt-0.5 text-[11px] text-foreground/72">
            Date, time, seats, price &amp; preferences
          </p>
        </div>
        <div className="h-8 w-8 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15 shrink-0">
          <span className="text-[12px] font-bold text-primary">{open ? "–" : "+"}</span>
        </div>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "grid-rows-[1fr] opacity-100 translate-y-0"
            : "grid-rows-[0fr] opacity-0 -translate-y-1",
        )}
      >
        <div className="overflow-hidden">
          {/* date + time row */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Surface elevated className="p-2.5" focusRing>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold tracking-tight">Date</p>
                <button
                  type="button"
                  onClick={() => setDateOpen(true)}
                  className={cn(
                    "h-8 w-8 rounded-2xl grid place-items-center",
                    "hover:bg-primary/10 active:scale-[0.98]",
                    "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                  )}
                  aria-label="Open calendar"
                >
                  <CalendarDays className="h-4 w-4 text-primary" />
                </button>
              </div>
              <div className="mt-1">
                <DatePickerCard
                  label="Travel date"
                  value={form.date}
                  min={minDate}
                  onChange={(iso) => update("date", iso)}
                  variant="embedded"
                  open={dateOpen}
                  onOpenChange={setDateOpen}
                />
              </div>
            </Surface>

            <div className="space-y-2">
              {/* departure time */}
              <Surface elevated className="p-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15">
                    <Clock3 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-foreground/72">Departure</p>
                    <Input
                      type="time"
                      value={form.departTime}
                      onChange={(e) => update("departTime", e.target.value)}
                      className="mt-0.5 h-7 border-0 bg-transparent p-0 text-[14px] font-semibold tracking-tight focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
              </Surface>

              {/* seats */}
              <Surface elevated className="p-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-foreground/72">Seats</p>
                    <p className="text-[14px] font-semibold tracking-tight">Up to {LIMITS.maxSeats}</p>
                  </div>
                </div>
                <SeatStepper
                  value={form.seats}
                  min={LIMITS.minSeats}
                  max={LIMITS.maxSeats}
                  onChange={(value) => update("seats", value)}
                  className="mt-1.5"
                />
              </Surface>
            </div>
          </div>

          {/* price */}
          <div className="mt-2">
            <Surface elevated className="p-2.5">
              <div className="rounded-2xl border border-border/70 bg-card/62 supports-[backdrop-filter]:backdrop-blur-[24px] px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-foreground/72">
                    <Banknote className="h-3.5 w-3.5 text-primary" />
                    Price per seat
                  </div>
                  <span className="text-[11px] text-foreground/72">KES</span>
                </div>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.pricePerSeat}
                  onChange={(e) => update("pricePerSeat", Number(e.target.value))}
                  className="mt-0.5 h-7 border-0 bg-transparent p-0 text-[14px] font-semibold tracking-tight focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </Surface>
          </div>

          {/* amenities + submit */}
          <div className="mt-2">
            <Surface elevated className="p-2.5">
              <div className="flex flex-wrap gap-2">
                <ChipToggle
                  icon={PawPrint}
                  label="Pets OK"
                  active={form.pets}
                  onClick={() => update("pets", !form.pets)}
                  size="sm"
                />
                <ChipToggle
                  icon={Package}
                  label="Luggage"
                  active={form.luggage}
                  onClick={() => update("luggage", !form.luggage)}
                  size="sm"
                />
                <ChipToggle
                  icon={Music}
                  label="Music OK"
                  active={form.music}
                  onClick={() => update("music", !form.music)}
                  size="sm"
                />
              </div>

              {postError && (
                <p className="mt-2 text-[12px] text-destructive text-center">{postError}</p>
              )}

              <Button
                onClick={onSubmit}
                disabled={!canPost || isPosting}
                className={cn(
                  "mt-2.5 h-11 w-full rounded-2xl font-semibold tracking-tight",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]",
                  "bg-primary text-primary-foreground",
                  "shadow-[0_18px_44px_-34px_rgba(6,78,59,0.55)]",
                  "disabled:opacity-100 disabled:bg-primary/35 disabled:text-primary-foreground/80 disabled:shadow-none",
                )}
              >
                {isPosting ? "Posting…" : "Post ride"}
              </Button>
            </Surface>
          </div>
        </div>
      </div>
    </Surface>
  );
}

/* ── main component ────────────────────────────────── */

export function DriverOfferRide({ onSubmit }: DriverOfferRideProps) {
  const { openAuthDrawer, isSignedIn } = useAuthDrawer();
  const [form, setForm] = useState<OfferRideForm>(() => {
    if (typeof window === "undefined") return DEFAULT_OFFER_FORM;

    try {
      const draft = window.sessionStorage.getItem(DRIVER_OFFER_DRAFT_KEY);
      if (!draft) return DEFAULT_OFFER_FORM;
      return { ...DEFAULT_OFFER_FORM, ...JSON.parse(draft) };
    } catch {
      return DEFAULT_OFFER_FORM;
    }
  });
  const [dateOpen, setDateOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const { requests } = useLivePassengerRequests();
  const announcements = useAnnouncements();

  const minDate = useMemo(() => todayISO(), []);
  const fromSuggestions = useTownSuggestions(form.from, MIN_TOWN_CHARS);
  const toSuggestions = useTownSuggestions(form.to, MIN_TOWN_CHARS);

  const hasLocations = useMemo(
    () => Boolean(form.from.trim() && form.to.trim()),
    [form.from, form.to],
  );

  const canPost = useMemo(() => {
    return Boolean(
      form.from.trim() &&
      form.to.trim() &&
      form.date &&
      form.departTime &&
      form.seats >= LIMITS.minSeats &&
      form.seats <= LIMITS.maxSeats &&
      Number.isFinite(form.pricePerSeat) &&
      form.pricePerSeat > 0,
    );
  }, [form]);

  const update = useCallback(
    <K extends keyof OfferRideForm>(k: K, v: OfferRideForm[K]) =>
      setForm((p) => ({ ...p, [k]: v })),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(
      DRIVER_OFFER_DRAFT_KEY,
      JSON.stringify(form),
    );
  }, [form]);

  const handleLocationChange = useCallback(
    (field: LocationField, v: string) => {
      update(field, v);
    },
    [update],
  );

  const handleLocationSelect = useCallback(
    (field: LocationField) => (v: string) => {
      update(field, v);
    },
    [update],
  );

  const handleLocationClear = useCallback(
    (field: LocationField) => () => {
      update(field, "");
    },
    [update],
  );

  const swap = useCallback(
    () => setForm((p) => ({ ...p, from: p.to, to: p.from })),
    [],
  );

  useEffect(() => {
    if (!isSubmitted) return;
    const t = window.setTimeout(() => {
      setIsSubmitted(false);
      setForm(DEFAULT_OFFER_FORM);
      setDateOpen(false);
    }, 1800);
    return () => window.clearTimeout(t);
  }, [isSubmitted]);

  const handleSubmit = async () => {
    if (!canPost || isPosting) return;
    if (!isSignedIn) { openAuthDrawer({ selectedRole: "driver" }); return; }
    setIsPosting(true);
    setPostError(null);

    try {
      const departureTime = new Date(`${form.date}T${form.departTime}:00`).toISOString();

      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: form.from.trim(),
          destination: form.to.trim(),
          departure_time: departureTime,
          total_seats: form.seats,
          price_per_seat: form.pricePerSeat,
          allows_pets: form.pets,
          allows_packages: form.luggage,
          allows_music: form.music,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to post ride" }));
        throw new Error(err.error || "Failed to post ride");
      }

      setIsSubmitted(true);
      onSubmit?.(form);
    } catch (e: unknown) {
      setPostError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsPosting(false);
    }
  };

  /* ── success state ── */
  if (isSubmitted) {
    return (
      <Surface elevated className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl grid place-items-center bg-primary/12 border border-primary/15">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold tracking-tight">Ride posted</p>
            <p className="mt-0.5 text-[12px] text-foreground/72">
              Your ride is live. Requests will appear in your inbox.
            </p>
          </div>
        </div>
      </Surface>
    );
  }

  /* ── main render ── */
  return (
    <div className="space-y-3">
        {/* route input — flat, no card-in-card */}
        <Surface elevated className="p-3 relative isolate z-10 focus-within:z-50">
          <button
            type="button"
            onClick={swap}
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
              id="offer-from"
              label="From"
              value={form.from}
              placeholder="Leaving from"
              suggestions={fromSuggestions}
              minChars={MIN_TOWN_CHARS}
              onChange={(v) => handleLocationChange("from", v)}
              onSelect={handleLocationSelect("from")}
              onClear={handleLocationClear("from")}
              compact
              nextFocusId="offer-to"
            />
          </div>

          <div className="my-2 h-px bg-border/50" />

          <div className="pr-14">
            <LocationInput
              id="offer-to"
              label="To"
              value={form.to}
              placeholder="Going to"
              suggestions={toSuggestions}
              minChars={MIN_TOWN_CHARS}
              onChange={(v) => handleLocationChange("to", v)}
              onSelect={handleLocationSelect("to")}
              onClear={handleLocationClear("to")}
              compact
            />
          </div>
        </Surface>

        {/* trip details — revealed when both locations filled */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            hasLocations
              ? "grid-rows-[1fr] opacity-100 translate-y-0"
              : "grid-rows-[0fr] opacity-0 -translate-y-1",
          )}
        >
          <div className="overflow-hidden">
            {hasLocations ? (
              <TripDetailsSection
                form={form}
                update={update}
                minDate={minDate}
                dateOpen={dateOpen}
                setDateOpen={setDateOpen}
                canPost={canPost}
                isPosting={isPosting}
                postError={postError}
                onSubmit={handleSubmit}
              />
            ) : null}
          </div>
        </div>

        {/* passenger requests carousel */}
        <RequestsCarousel requests={requests} />

        {/* announcements */}
        <AnnouncementsStrip announcements={announcements} />
    </div>
  );
}

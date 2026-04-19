"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BottomSheet,
  Surface,
  FormDivider,
  PillButton,
  ShimmerCard,
  Chip,
  EmptyState,
  UserAvatar,
} from "@/components/ui-parts";
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
  Users2,
  XCircle,
  ArrowRight,
  Dot,
  Inbox,
  Banknote,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, timeAgo } from "@/lib/format";
import { useAuthDrawer } from "./auth-drawer-provider";
import { useChat } from "./global-chat";
import { toast } from "sonner";

/* ── types ─────────────────────────────────────────── */

type RequestStatus = "pending" | "accepted" | "rejected";

type RideRequest = {
  id: string;
  passengerName: string;
  passengerImage?: string;
  origin: string;
  destination: string;
  preferredDate: string;
  preferredTime: string;
  seatsNeeded: number;
  allowsPets: boolean;
  allowsPackages: boolean;
  pickupStation?: string;
  dropoffStation?: string;
  note?: string;
  status: RequestStatus;
  matchedRideId?: string;
  pricePerSeat?: number;
  departureTime?: string;
  createdAt: string;
};

const SELECTED_REQUEST_KEY = "kipita_selected_request";

function normalizeTimeInput(value?: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)/.exec(value ?? "");
  return match ? `${match[1]}:${match[2]}` : "";
}

function timeInputFromIso(value?: string) {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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

/* ── data fetching ─────────────────────────────────── */

function useRideRequests() {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(() => {
    fetch("/api/ride-requests")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.ride_requests) return;
        const mapped: RideRequest[] = json.ride_requests.map(
          (r: Record<string, unknown>) => {
            const passenger = r.passenger as Record<string, unknown> | null;
            const matchedRide = r.matched_ride as Record<string, unknown> | null;
            const apiStatus = String(r.status ?? "active");
            const status: RequestStatus =
              apiStatus === "matched"
                ? "accepted"
                : apiStatus === "cancelled"
                  ? "rejected"
                  : "pending";
            return {
              id: r.id as string,
              passengerName: (passenger?.name as string) ?? "Passenger",
              passengerImage: (passenger?.image as string) ?? undefined,
              origin: r.origin as string,
              destination: r.destination as string,
              preferredDate: (r.preferred_date as string) ?? "",
              preferredTime: normalizeTimeInput(r.preferred_time as string),
              seatsNeeded: (r.seats_needed as number) ?? 1,
              allowsPets: Boolean(r.allows_pets),
              allowsPackages: Boolean(r.allows_packages),
              pickupStation: (r.pickup_station as string) ?? undefined,
              dropoffStation: (r.dropoff_station as string) ?? undefined,
              note: (r.note as string) ?? undefined,
              status,
              matchedRideId:
                (r.matched_ride_id as string) ??
                (matchedRide?.id as string) ??
                undefined,
              pricePerSeat:
                Number(r.match_price_per_seat ?? matchedRide?.price_per_seat) ||
                undefined,
              departureTime:
                (r.match_departure_time as string) ??
                (matchedRide?.departure_time as string) ??
                undefined,
              createdAt: (r.created_at as string) ?? new Date().toISOString(),
            };
          },
        );
        setRequests(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, setRequests, loading, refetch: fetchRequests };
}

/* ── main component ────────────────────────────────── */

export function DriverRequests({
  onOpenChat,
}: {
  onOpenChat?: (payload: { requestId: string; passengerName: string }) => void;
}) {
  const { requests, setRequests, loading } = useRideRequests();
  const { openAuthDrawer, isSignedIn } = useAuthDrawer();
  const chat = useChat();
  const [view, setView] = useState<RequestStatus>("pending");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const [acceptingRequest, setAcceptingRequest] = useState<RideRequest | null>(null);
  const [matchPrice, setMatchPrice] = useState("1200");
  const [matchTime, setMatchTime] = useState("08:00");
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Pick up selected request from carousel navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const selectedId = sessionStorage.getItem(SELECTED_REQUEST_KEY);
    if (selectedId) {
      setHighlightId(selectedId);
      setView("pending");
      sessionStorage.removeItem(SELECTED_REQUEST_KEY);
    }
  }, []);

  // Scroll to highlighted request when data loads
  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      // Clear highlight after 3 seconds
      const t = window.setTimeout(() => setHighlightId(null), 3000);
      return () => window.clearTimeout(t);
    }
  }, [highlightId, requests]);

  useEffect(() => {
    if (!acceptingRequest) return;
    setMatchPrice(String(acceptingRequest.pricePerSeat ?? 1200));
    setMatchTime(
      timeInputFromIso(acceptingRequest.departureTime) ||
        acceptingRequest.preferredTime ||
        "08:00",
    );
    setMatchError(null);
  }, [acceptingRequest]);

  const pending = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests],
  );
  const accepted = useMemo(
    () => requests.filter((r) => r.status === "accepted"),
    [requests],
  );
  const rejected = useMemo(
    () => requests.filter((r) => r.status === "rejected"),
    [requests],
  );

  const patchRequest = useCallback(
    async (
      id: string,
      status: "accepted" | "rejected",
      details?: { pricePerSeat?: number; departTime?: string },
    ) => {
      if (!isSignedIn) {
        openAuthDrawer({ selectedRole: "driver" });
        return false;
      }
      // Optimistic update
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      try {
        const res = await fetch("/api/ride-requests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status,
            price_per_seat: details?.pricePerSeat,
            depart_time: details?.departTime,
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Failed");
        const updated = json?.ride_request as Record<string, unknown> | undefined;
        const matchedRide = updated?.matched_ride as Record<string, unknown> | null;
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  matchedRideId:
                    (updated?.matched_ride_id as string) ??
                    (matchedRide?.id as string) ??
                    r.matchedRideId,
                  pricePerSeat:
                    Number(updated?.match_price_per_seat ?? matchedRide?.price_per_seat) ||
                    r.pricePerSeat,
                  departureTime:
                    (updated?.match_departure_time as string) ??
                    (matchedRide?.departure_time as string) ??
                    r.departureTime,
                }
              : r,
          ),
        );
        toast.success(
          status === "accepted" ? "Ride matched" : "Request declined",
          {
            description:
              status === "accepted"
                ? "Passenger can now pay and confirm the trip."
                : "The passenger will be notified.",
          },
        );
        return true;
      } catch (error) {
        // Roll back on failure
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "pending" } : r)),
        );
        toast.error("Couldn't update request", {
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
        return false;
      }
    },
    [setRequests, isSignedIn, openAuthDrawer],
  );

  const accept = useCallback(
    (req: RideRequest) => setAcceptingRequest(req),
    [],
  );
  const decline = useCallback((id: string) => patchRequest(id, "rejected"), [patchRequest]);

  const confirmMatch = useCallback(async () => {
    if (!acceptingRequest || matching) return;
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
    const ok = await patchRequest(acceptingRequest.id, "accepted", {
      pricePerSeat: price,
      departTime: matchTime,
    });
    setMatching(false);
    if (ok) setAcceptingRequest(null);
  }, [acceptingRequest, matching, matchPrice, matchTime, patchRequest]);

  const openChat = useCallback(
    (req: RideRequest) => {
      if (!isSignedIn) { openAuthDrawer({ selectedRole: "driver" }); return; }
      onOpenChat?.({ requestId: req.id, passengerName: req.passengerName });
      chat.openChat({
        rideId: req.id,
        tripState: "not_started",
        driver: {
          id: req.id,
          name: req.passengerName,
          rating: 0,
          trips: 0,
          avatarUrl: req.passengerImage,
          role: "passenger",
        },
      });
    },
    [onOpenChat, isSignedIn, openAuthDrawer, chat],
  );

  const activeList =
    view === "pending" ? pending : view === "accepted" ? accepted : rejected;

  return (
    <div className="w-full">
      <p className="py-1 text-center text-sm font-semibold text-white dark:text-foreground">
        Manage ride requests
      </p>

      <div className="pb-[calc(120px+env(safe-area-inset-bottom))] space-y-3">
        {/* summary strip */}
        <Surface tone="sheet" elevated className="overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-muted-foreground">
                  Passenger demand
                </p>
                <p className="mt-0.5 text-[16px] font-extrabold tracking-tight">
                  {loading ? "Loading…" : `${requests.length} active request${requests.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Chip icon={CheckCircle2} tone="primary">
                  {accepted.length} matched
                </Chip>
              </div>
            </div>
          </div>
        </Surface>

        {/* tab bar + list */}
        <Surface tone="sheet" elevated className="overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[12px] font-extrabold tracking-tight text-foreground/80">
              Requests
            </p>
            <div className="mt-2 flex items-center gap-2">
              <PillButton
                type="button"
                onClick={() => setView("pending")}
                active={view === "pending"}
                className="h-10"
              >
                Pending
                <span className="ml-2 text-foreground/70">({pending.length})</span>
              </PillButton>
              <PillButton
                type="button"
                onClick={() => setView("accepted")}
                active={view === "accepted"}
                className="h-10"
              >
                Matched
                <span className="ml-2 text-foreground/70">({accepted.length})</span>
              </PillButton>
              <PillButton
                type="button"
                onClick={() => setView("rejected")}
                active={view === "rejected"}
                className="h-10"
              >
                Declined
                <span className="ml-2 text-foreground/70">({rejected.length})</span>
              </PillButton>
            </div>
          </div>

          <FormDivider />

          <div className="px-4 py-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ShimmerCard key={i} />
                ))}
              </div>
            ) : activeList.length ? (
              <div className="space-y-3">
                {activeList.map((req) => (
                  <div
                    key={req.id}
                    ref={req.id === highlightId ? highlightRef : undefined}
                  >
                    <RequestCard
                      req={req}
                      highlighted={req.id === highlightId}
                      showDecision={view === "pending"}
                      onChat={() => openChat(req)}
                      onAccept={() => accept(req)}
                      onDecline={() => decline(req.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={
                  view === "accepted"
                    ? Check
                    : view === "rejected"
                      ? XCircle
                      : Inbox
                }
                title={
                  view === "accepted"
                    ? "No matched passengers yet"
                    : view === "rejected"
                      ? "No declined requests"
                      : "No pending requests"
                }
                desc={
                  view === "accepted"
                    ? "Matched passengers will show here with chat actions."
                    : view === "rejected"
                      ? "Declined requests will show here for reference."
                      : "Passenger ride requests from the home page will appear here."
                }
              />
            )}
          </div>
        </Surface>

        <BottomSheet
          open={!!acceptingRequest}
          onOpenChange={(open) => {
            if (!open && !matching) setAcceptingRequest(null);
          }}
          title="Match request"
        >
          <div className="space-y-3">
            <Surface tone="panel" className="p-4">
              <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">
                PASSENGER REQUEST
              </p>
              <p className="mt-1 text-base font-extrabold">
                {acceptingRequest
                  ? `${acceptingRequest.origin} -> ${acceptingRequest.destination}`
                  : "Route"}
              </p>
              <p className="mt-1 text-[12px] font-semibold text-muted-foreground">
                Add the trip terms before matching so the passenger can pay and
                confirm immediately.
              </p>
              {acceptingRequest ? (
                <p className="mt-2 text-[12px] font-semibold text-primary">
                  Requested {formatDate(acceptingRequest.preferredDate)} at{" "}
                  {formatTimeLabel(acceptingRequest.preferredTime)}
                </p>
              ) : null}
            </Surface>

            <div className="grid grid-cols-2 gap-2">
              <Surface tone="panel" className="p-3">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-primary" />
                  <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">
                    PRICE / SEAT
                  </p>
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={matchPrice}
                  onChange={(e) => setMatchPrice(e.target.value)}
                  className="mt-2 h-10 w-full rounded-2xl border border-border/70 bg-card/70 px-3 text-sm font-extrabold outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="1200"
                />
              </Surface>

              <Surface tone="panel" className="p-3">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">
                    DEPARTURE
                  </p>
                </div>
                <input
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="mt-2 h-10 w-full rounded-2xl border border-border/70 bg-card/70 px-3 text-sm font-extrabold outline-none focus:ring-2 focus:ring-primary/40"
                />
              </Surface>
            </div>

            {matchError ? (
              <p className="text-center text-[12px] font-semibold text-destructive">
                {matchError}
              </p>
            ) : null}

            <Button
              type="button"
              onClick={confirmMatch}
              disabled={matching}
              className="h-12 w-full rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground"
            >
              {matching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {matching ? "Matching..." : "Match and request payment"}
            </Button>
          </div>
        </BottomSheet>

        <TrustReminder />
      </div>
    </div>
  );
}

/* ── request card ──────────────────────────────────── */

function RequestCard({
  req,
  highlighted,
  showDecision,
  onAccept,
  onDecline,
  onChat,
}: {
  req: RideRequest;
  highlighted?: boolean;
  showDecision: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onChat: () => void;
}) {
  const isAccepted = req.status === "accepted";

  return (
    <div
      className={cn(
        "rounded-3xl border overflow-hidden",
        "supports-[backdrop-filter]:backdrop-blur-xl",
        "shadow-[0_10px_28px_-22px_color-mix(in_srgb,var(--primary)_18%,transparent)]",
        "transition-all duration-500",
        highlighted
          ? "border-primary/40 bg-[color-mix(in_srgb,var(--card)_82%,var(--primary)_18%)] ring-2 ring-primary/30"
          : isAccepted
            ? "border-border/70 bg-[color-mix(in_srgb,var(--card)_90%,var(--ring)_10%)]"
            : "border-border/70 bg-[color-mix(in_srgb,var(--card)_88%,var(--primary)_12%)]",
      )}
    >
      <div className="px-3.5 pt-3.5 pb-3">
        {/* passenger info row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <UserAvatar name={req.passengerName} src={req.passengerImage} size={48} shape="rounded" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-extrabold tracking-tight">
                {req.passengerName}
              </p>

              {/* route */}
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Dot className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{req.origin}</span>
                <ArrowRight className="h-3 w-3 opacity-60 shrink-0" />
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate">{req.destination}</span>
              </div>

              {/* meta chips */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Chip icon={CalendarDays}>{formatDate(req.preferredDate)}</Chip>
                <Chip icon={Clock3}>{formatTimeLabel(req.preferredTime)}</Chip>
                <Chip icon={Users2} tone="primary">
                  {req.seatsNeeded} seat{req.seatsNeeded === 1 ? "" : "s"}
                </Chip>
                <span className="text-[10px] text-muted-foreground">{timeAgo(req.createdAt)}</span>
              </div>

              {req.note && (
                <p className="mt-2 text-[11px] italic text-muted-foreground line-clamp-2">
                  &quot;{req.note}&quot;
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <ActionIconBtn icon={MessageCircle} label="Chat" onClick={onChat} />
          </div>
        </div>

        {/* actions */}
        {showDecision ? (
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
              Match ride
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
        ) : isAccepted ? (
          <div className="mt-3 flex items-center justify-between">
            <Chip icon={Check} tone="primary" className="px-3.5 py-2">
              Matched
            </Chip>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between">
            <Chip icon={XCircle} tone="soft" className="px-3.5 py-2">
              Declined
            </Chip>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── small components ──────────────────────────────── */

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
              Chat with the passenger to confirm pickup details before matching.
              Match passengers whose route aligns with your trip.
            </p>
          </div>
        </div>
      </div>
    </Surface>
  );
}

function ActionIconBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--ring)_55%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <Icon className="h-4.5 w-4.5 text-primary" strokeWidth={2.3} />
    </button>
  );
}

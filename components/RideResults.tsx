"use client";

import { useEffect, useState } from "react";
import { Star, SendHorizonal, MapPin, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShimmerCard, Surface } from "./ui-parts";
import { useChat } from "./global-chat";
import { useAuthDrawer } from "./auth-drawer-provider";
import {
  DriverAvatar,
  RideDetailsSheet,
  type SearchRide,
} from "./my-rides";
import { formatTime } from "@/lib/format";

/* re-export so passenger-search.tsx keeps working */
export type Driver = SearchRide;

/* ── ride result card (list item) ─────────────────────── */

function RideResultCard({
  ride,
  onSelect,
}: {
  ride: Driver;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="w-full text-left">
      <Surface tone="panel" interactive className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <DriverAvatar
            name={ride.name}
            src={ride.avatarUrl}
            verified={ride.verified}
            size={44}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-extrabold tracking-tight text-foreground/90 truncate">
                {ride.name}
              </p>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-primary">
                  KES {ride.price.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground -mt-0.5">
                  per seat
                </p>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold text-foreground/80">
                {ride.rating}
              </span>
              <span className="opacity-60">·</span>
              <span>{ride.trips} trips</span>
              {ride.seatsLeft != null && (
                <>
                  <span className="opacity-60">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {ride.seatsLeft} seat{ride.seatsLeft === 1 ? "" : "s"} left
                  </span>
                </>
              )}
            </div>

            {ride.from && ride.to && (
              <div className="mt-2 rounded-2xl border border-border/70 bg-card/60 px-3 py-2">
                <p className="text-[13px] font-extrabold tracking-tight truncate">
                  <MapPin className="inline h-3.5 w-3.5 mr-1 text-primary" />
                  {ride.from} → {ride.to}
                  {ride.departureTime && (
                    <span className="ml-2 text-[11px] font-semibold text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-0.5" />
                      {formatTime(ride.departureTime)}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </Surface>
    </button>
  );
}

/* ── main component ───────────────────────────────────── */

export function RideResults({
  status,
  results,
  onPostRequest,
}: {
  status: "idle" | "loading" | "ready";
  results: Driver[];
  onPostRequest?: () => void;
}) {
  const chat = useChat();
  const { openAuthDrawer, isSignedIn } = useAuthDrawer();

  const [selectedRide, setSelectedRide] = useState<Driver | null>(null);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);

  // Reset booking state when ride changes
  useEffect(() => {
    setBooked(false);
    setBooking(false);
  }, [selectedRide?.id]);

  const handleMessage = () => {
    if (!selectedRide) return;
    if (!isSignedIn) {
      openAuthDrawer({ selectedRole: "passenger" });
      return;
    }
    const dId = selectedRide.driverId ?? selectedRide.id ?? selectedRide.name;
    chat.openChat({
      rideId: selectedRide.id ?? selectedRide.name,
      tripState: "not_started",
      driver: {
        id: dId,
        name: selectedRide.name,
        rating: selectedRide.rating,
        trips: selectedRide.trips,
        avatarUrl: selectedRide.avatarUrl,
      },
    });
    setSelectedRide(null);
  };

  const handleBookSeat = async () => {
    if (!selectedRide) return;
    if (!isSignedIn) {
      openAuthDrawer({ selectedRole: "passenger" });
      return;
    }
    if (booking) return;
    setBooking(true);
    try {
      const res = await fetch("/api/ride-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: selectedRide.from ?? "",
          destination: selectedRide.to ?? "",
          preferred_date: selectedRide.departureTime
            ? selectedRide.departureTime.split("T")[0]
            : new Date().toISOString().split("T")[0],
          seats_needed: 1,
          note: `Requesting seat on ride ${selectedRide.id ?? ""}`.trim(),
        }),
      });
      if (res.ok) {
        setBooked(true);
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setBooking(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    );
  }

  if (status === "ready" && !results.length) {
    return (
      <Surface tone="panel" className="p-4">
        <p className="text-sm font-semibold text-foreground/85">
          No rides found
        </p>
        <p className="text-[12px] mt-1 text-muted-foreground">
          Try different towns or dates, or post a request so drivers can find
          you.
        </p>
        {onPostRequest && (
          <Button
            onClick={onPostRequest}
            className={cn(
              "mt-3 h-10 w-full rounded-2xl font-semibold tracking-tight text-[13px]",
              "bg-primary text-primary-foreground",
              "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]",
            )}
          >
            <SendHorizonal className="h-4 w-4 mr-2" />
            Post a Ride Request
          </Button>
        )}
      </Surface>
    );
  }

  if (status !== "ready") return null;

  return (
    <>
      <div className="space-y-2">
        {results.map((r, i) => (
          <RideResultCard
            key={r.id ?? i}
            ride={r}
            onSelect={() => setSelectedRide(r)}
          />
        ))}
      </div>

      <RideDetailsSheet
        open={!!selectedRide}
        onOpenChange={(v) => {
          if (!v) setSelectedRide(null);
        }}
        selected={selectedRide ? { kind: "search", ride: selectedRide } : null}
        onMessage={handleMessage}
        onBookSeat={handleBookSeat}
        booked={booked}
        booking={booking}
      />
    </>
  );
}

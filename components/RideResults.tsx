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
import { PaymentDrawer } from "./shared/payment-drawer";

export type Driver = SearchRide;

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
              <p className="text-sm font-extrabold tracking-tight text-foreground dark:text-foreground/96 truncate">
                {ride.name}
              </p>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-primary">
                  KES {ride.price.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-foreground/72 -mt-0.5">
                  per seat
                </p>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground dark:text-foreground/76">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold text-foreground/88 dark:text-foreground/94">
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
                <p className="text-[13px] font-extrabold tracking-tight truncate text-foreground/92 dark:text-foreground/95">
                  <MapPin className="inline h-3.5 w-3.5 mr-1 text-primary" />
                  {ride.from} {"->"} {ride.to}
                  {ride.departureTime && (
                    <span className="ml-2 text-[11px] font-semibold text-muted-foreground dark:text-foreground/72">
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

export function RideResults({
  status,
  results,
  onPostRequest,
  requestPosted,
  postingRequest,
  seats = 1,
}: {
  status: "idle" | "loading" | "ready";
  results: Driver[];
  onPostRequest?: () => void;
  requestPosted?: boolean;
  postingRequest?: boolean;
  seats?: number;
}) {
  const chat = useChat();
  const { openAuthDrawer, isSignedIn } = useAuthDrawer();

  const [selectedRide, setSelectedRide] = useState<Driver | null>(null);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [payingRide, setPayingRide] = useState<Driver | null>(null);

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
        role: "driver",
      },
    });
    setSelectedRide(null);
  };

  const handleBookSeat = () => {
    if (!selectedRide) return;
    if (!isSignedIn) {
      openAuthDrawer({ selectedRole: "passenger" });
      return;
    }
    setPayingRide(selectedRide);
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
        <p className="text-sm font-semibold text-foreground/92 dark:text-foreground/96">
          {requestPosted ? "Request posted" : "No rides found"}
        </p>
        <p className="text-[12px] mt-1 text-muted-foreground dark:text-foreground/74">
          {requestPosted
            ? "Drivers on this route have been notified. You can check your requests while they match or message you."
            : "Try different towns or dates. If nothing is available, we can post a request so drivers can find you."}
        </p>
        {requestPosted ? (
          <Button
            onClick={() => {
              window.location.href = "/trips";
            }}
            className={cn(
              "mt-3 h-10 w-full rounded-2xl font-semibold tracking-tight text-[13px]",
              "bg-primary text-primary-foreground",
              "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]",
            )}
          >
            <SendHorizonal className="h-4 w-4 mr-2" />
            Check ride requests
          </Button>
        ) : onPostRequest ? (
          <Button
            onClick={onPostRequest}
            disabled={postingRequest}
            className={cn(
              "mt-3 h-10 w-full rounded-2xl font-semibold tracking-tight text-[13px]",
              "bg-primary text-primary-foreground",
              "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]",
            )}
          >
            <SendHorizonal className="h-4 w-4 mr-2" />
            {postingRequest ? "Posting request..." : "Post a ride request"}
          </Button>
        ) : null}
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

      <PaymentDrawer
        open={!!payingRide}
        onOpenChange={(v) => {
          if (!v) setPayingRide(null);
        }}
        rideId={payingRide?.id ?? ""}
        amount={(payingRide?.price ?? 0) * Math.max(1, seats)}
        seats={seats}
        routeLabel={
          payingRide?.from && payingRide?.to
            ? `${payingRide.from} -> ${payingRide.to}`
            : undefined
        }
        onSuccess={() => {
          setBooked(true);
          setSelectedRide(null);
        }}
      />
    </>
  );
}

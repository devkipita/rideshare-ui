"use client";

import { Star, MapPin, Clock, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui-parts";
import type { RideCardData } from "@/components/ride-card";

export function RideDetailsScreen({
  ride,
  onBack,
}: {
  ride: RideCardData;
  onBack: () => void;
}) {
  return (
    <div className="space-y-3">
      <Surface className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-muted-foreground">
              Driver
            </p>
            <p className="mt-0.5 text-[16px] font-extrabold tracking-tight truncate">
              {ride.driverName}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-yellow-500" />
              <span className="font-semibold text-foreground/85">
                {ride.rating}
              </span>
              <span className="opacity-60">·</span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {ride.seatsLeft} seat{ride.seatsLeft === 1 ? "" : "s"} left
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[18px] font-extrabold text-primary">
              KES {ride.price.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground -mt-0.5">
              per seat
            </p>
          </div>
        </div>
      </Surface>

      <Surface className="p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-2xl border border-border/70 bg-card/60 px-3 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Route
            </p>
            <p className="mt-0.5 text-[14px] font-extrabold tracking-tight">
              <MapPin className="inline h-4 w-4 mr-1 text-primary" />
              {ride.from} → {ride.to}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 px-3 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Departure
            </p>
            <p className="mt-0.5 text-[14px] font-extrabold tracking-tight">
              <Clock className="inline h-4 w-4 mr-1 text-primary" />
              {ride.startTime} – {ride.endTime}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 px-3 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Availability
            </p>
            <p className="mt-0.5 text-[14px] font-extrabold tracking-tight">
              <Users className="inline h-4 w-4 mr-1 text-primary" />
              {ride.seatsLeft} seat{ride.seatsLeft === 1 ? "" : "s"} remaining
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button className="h-12 rounded-2xl font-extrabold tracking-tight">
            Request Seat
          </Button>
          <Button
            variant="secondary"
            className="h-12 rounded-2xl font-extrabold tracking-tight"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onBack}
          className="mt-3 h-11 w-full rounded-2xl font-extrabold tracking-tight"
        >
          Back to search
        </Button>
      </Surface>
    </div>
  );
}

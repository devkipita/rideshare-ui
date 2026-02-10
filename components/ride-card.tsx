"use client";

import { Star, MapPin, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui-parts";

export type RideCardData = {
  driverName: string;
  rating: number;
  from: string;
  to: string;
  startTime: string;
  endTime: string;
  price: number;
  seatsLeft: number;
};

export function RideCard({
  ride,
  onSelect,
}: {
  ride: RideCardData;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left"
      aria-label={`View ride with ${ride.driverName}`}
    >
      <Surface interactive tone="panel" className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "h-11 w-11 rounded-2xl grid place-items-center font-extrabold",
              "border border-border/70 bg-card/70 text-foreground/80",
            )}
          >
            {ride.driverName.trim()[0]?.toUpperCase() ?? "D"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-extrabold tracking-tight truncate">
                {ride.driverName}
              </p>

              <div className="text-right">
                <p className="text-[15px] font-extrabold text-primary">
                  KES {ride.price.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground -mt-0.5">
                  per seat
                </p>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-yellow-500" />
              <span className="font-semibold text-foreground/80">
                {ride.rating}
              </span>
              <span className="opacity-60">·</span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {ride.seatsLeft} seat{ride.seatsLeft === 1 ? "" : "s"} left
                </span>
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-border/70 bg-card/60 px-3 py-2">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Route
                </p>
                <p className="mt-0.5 text-[13px] font-extrabold tracking-tight truncate">
                  <MapPin className="inline h-3.5 w-3.5 mr-1 text-primary" />
                  {ride.from} → {ride.to}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 px-3 py-2">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Time
                </p>
                <p className="mt-0.5 text-[13px] font-extrabold tracking-tight truncate">
                  <Clock className="inline h-3.5 w-3.5 mr-1 text-primary" />
                  {ride.startTime} – {ride.endTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Surface>
    </button>
  );
}

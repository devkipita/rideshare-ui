"use client";

import { useState } from "react";
import { Star, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShimmerCard, Surface } from "./ui-parts";

export interface Driver {
  id?: string;
  name: string;
  rating: number;
  trips: number;
  price: number;
  from?: string;
  to?: string;
  departureTime?: string;
  seatsLeft?: number;
}

export function RideResults({
  status,
  results,
  onPostRequest,
}: {
  status: "idle" | "loading" | "ready";
  results: Driver[];
  onPostRequest?: () => void;
}) {
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
          Try different towns or dates, or post a request so drivers can find you.
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
    <div className="space-y-2">
      {results.map((r) => (
        <Surface key={r.name} tone="panel" interactive className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-11 w-11 rounded-2xl grid place-items-center font-extrabold",
                "border border-border/70 bg-card/70 text-foreground/75",
              )}
              aria-hidden="true"
            >
              {r.name[0]}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold tracking-tight text-foreground/90 truncate">
                {r.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-foreground/80">
                  {r.rating}
                </span>
                <span className="opacity-60">·</span>
                <span>{r.trips} trips</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-extrabold text-primary">
                KES {r.price.toLocaleString()}
              </p>
              <p className="text-[12px] text-muted-foreground">per seat</p>
              {r.seatsLeft != null && (
                <p className="text-[11px] text-muted-foreground">
                  {r.seatsLeft} seat{r.seatsLeft !== 1 ? "s" : ""} left
                </p>
              )}
            </div>
          </div>
        </Surface>
      ))}
    </div>
  );
}

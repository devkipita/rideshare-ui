"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShimmerCard, Surface } from "./ui-parts";

export interface Driver {
  name: string;
  rating: number;
  trips: number;
  price: number;
}

export function RideResults({
  status,
  results,
}: {
  status: "idle" | "loading" | "ready";
  results: Driver[];
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
          Try different towns or dates.
        </p>
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
            </div>
          </div>
        </Surface>
      ))}
    </div>
  );
}

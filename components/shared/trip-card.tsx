"use client";

import { CalendarDays, Clock3, MapPin, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface, UserAvatar } from "@/components/ui-parts";
import { formatTime } from "@/lib/format";

interface TripCardProps {
  id: string;
  driverName: string;
  driverImage?: string;
  driverVerified?: boolean;
  driverRating?: number;
  from: string;
  to: string;
  departureTime?: string;
  price: number;
  seatsLeft?: number;
  onTap?: () => void;
  className?: string;
}

export function TripCard({
  driverName,
  driverImage,
  driverVerified,
  driverRating,
  from,
  to,
  departureTime,
  price,
  seatsLeft,
  onTap,
  className,
}: TripCardProps) {
  return (
    <button type="button" onClick={onTap} className={cn("w-full text-left", className)}>
      <Surface tone="panel" interactive className="p-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={driverName}
            src={driverImage}
            verified={driverVerified}
            size={44}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-extrabold tracking-tight text-foreground/90 truncate">
                {driverName}
              </p>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-primary">
                  KES {price.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground -mt-0.5">per seat</p>
              </div>
            </div>

            {driverRating != null && (
              <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-foreground/80">{driverRating}</span>
                {seatsLeft != null && (
                  <>
                    <span className="opacity-60">·</span>
                    <Users className="h-3.5 w-3.5" />
                    <span>{seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left</span>
                  </>
                )}
              </div>
            )}

            <div className="mt-2 rounded-2xl border border-border/70 bg-card/60 px-3 py-2">
              <p className="text-[13px] font-extrabold tracking-tight truncate">
                <MapPin className="inline h-3.5 w-3.5 mr-1 text-primary" />
                {from} → {to}
                {departureTime && (
                  <span className="ml-2 text-[11px] font-semibold text-muted-foreground">
                    <Clock3 className="inline h-3 w-3 mr-0.5" />
                    {formatTime(departureTime)}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Surface>
    </button>
  );
}

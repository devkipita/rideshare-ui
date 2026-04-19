"use client";

import { BadgeCheck, MessageCircle, Phone, Star } from "lucide-react";
import { Surface, UserAvatar } from "@/components/ui-parts";
import { BottomDrawer } from "./bottom-drawer";

interface Person {
  id: string;
  name: string;
  image?: string;
  phone?: string;
  verified?: boolean;
  rating?: number;
  totalTrips?: number;
  role?: "passenger" | "driver";
}

interface PersonSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  person: Person | null;
  tripContext?: string;
  onMessage?: () => void;
}

export function PersonSheet({
  open,
  onOpenChange,
  person,
  tripContext,
  onMessage,
}: PersonSheetProps) {
  if (!person) return null;

  return (
    <BottomDrawer open={open} onOpenChange={onOpenChange} title="Profile">
      <div className="space-y-3">
        <Surface tone="panel" className="p-4">
          <div className="flex items-start gap-3">
            <UserAvatar
              name={person.name}
              src={person.image}
              verified={person.verified}
              size={56}
            />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold tracking-tight">{person.name}</p>

              {person.verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary mt-1">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}

              <div className="mt-2 flex items-center gap-3">
                {person.rating != null && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span>{person.rating.toFixed(1)}</span>
                  </div>
                )}
                {person.totalTrips != null && (
                  <span className="text-sm font-semibold text-muted-foreground">
                    {person.totalTrips} trips
                  </span>
                )}
              </div>
            </div>
          </div>
        </Surface>

        {person.phone && (
          <Surface tone="panel" className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">PHONE</p>
                <p className="text-sm font-semibold">{person.phone}</p>
              </div>
            </div>
          </Surface>
        )}

        {tripContext && (
          <Surface tone="panel" className="p-4">
            <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">TRIP CONTEXT</p>
            <p className="mt-1 text-sm font-semibold text-foreground/90">{tripContext}</p>
          </Surface>
        )}

        {onMessage && (
          <button
            type="button"
            onClick={onMessage}
            className="h-12 w-full rounded-[18px] bg-primary text-primary-foreground text-sm font-extrabold shadow-[0_10px_26px_-18px_color-mix(in_srgb,var(--primary)_75%,transparent)] hover:brightness-[1.03] active:scale-[0.98] transition inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </button>
        )}
      </div>
    </BottomDrawer>
  );
}

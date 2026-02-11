"use client";

import { memo, useMemo, useCallback } from "react";
import {
  HomeIcon,
  ReceiptText,
  BellDot,
  User,
  Car,
  ClipboardList,
  Wallet,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "passenger" | "driver";

interface BottomNavProps {
  mode: Mode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

type TabDef = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const PASSENGER_TABS: readonly TabDef[] = [
  { id: "search", label: "Search", icon: HomeIcon },
  { id: "trips", label: "Trips", icon: ReceiptText },
  { id: "messages", label: "Messages", icon: BellDot },
  { id: "profile", label: "Profile", icon: User },
] as const;

const DRIVER_TABS: readonly TabDef[] = [
  { id: "rides", label: "My Rides", icon: Car },
  { id: "requests", label: "Ride Requests", icon: ClipboardList },
  { id: "earnings", label: "Earnings", icon: Wallet },
  { id: "profile", label: "Driver Profile", icon: UserCircle },
] as const;

export const BottomNav = memo(function BottomNav({
  mode,
  activeTab,
  onTabChange,
}: BottomNavProps) {
  const tabs = useMemo(
    () => (mode === "passenger" ? PASSENGER_TABS : DRIVER_TABS),
    [mode],
  );

  const handleTab = useCallback(
    (id: string) => {
      if (id !== activeTab) onTabChange(id);
    },
    [activeTab, onTabChange],
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 glass border-t supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]"
      aria-label={
        mode === "passenger" ? "Passenger navigation" : "Driver navigation"
      }
    >
      <div className="mx-auto w-full max-w-md">
        <div className="flex h-16 items-stretch justify-around px-1 sm:h-20 sm:px-2">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTab(id)}
                className={cn(
                  "group relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200 touch-target active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "absolute top-1.5 h-1 w-8 rounded-full transition-all duration-200 sm:top-2",
                    active ? "bg-primary/80" : "bg-transparent",
                  )}
                />
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200 sm:h-6 sm:w-6",
                    active ? "scale-110" : "scale-100 group-hover:scale-105",
                  )}
                />
                <span className="hidden text-xs font-medium sm:inline">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

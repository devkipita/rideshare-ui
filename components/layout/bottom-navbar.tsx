"use client";

import { useRole } from "@/app/context";
import { cn } from "@/lib/utils";
import {
  BellDot,
  Car,
  ClipboardList,
  HomeIcon,
  ReceiptText,
  User,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";

type TabDef = {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
};

const PASSENGER_TABS: readonly TabDef[] = [
  { id: "home", label: "Home", icon: HomeIcon, route: "/home" },
  { id: "trips", label: "Trips", icon: ReceiptText, route: "/trips" },
  { id: "notifications", label: "Alerts", icon: BellDot, route: "/notifications" },
  { id: "profile", label: "Profile", icon: User, route: "/profile" },
];

const DRIVER_TABS: readonly TabDef[] = [
  { id: "home", label: "My Rides", icon: Car, route: "/home" },
  { id: "trips", label: "Requests", icon: ClipboardList, route: "/trips" },
  { id: "notifications", label: "Alerts", icon: BellDot, route: "/notifications" },
  { id: "profile", label: "Profile", icon: UserCircle, route: "/profile" },
];

function routeToTabId(pathname: string): string {
  if (pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/trips")) return "trips";
  if (pathname.startsWith("/notifications")) return "notifications";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/earnings")) return "home";
  return "home";
}

export const BottomNavbar = memo(function BottomNavbar() {
  const { activeRole } = useRole();
  const pathname = usePathname();

  const tabs = useMemo(
    () => (activeRole === "passenger" ? PASSENGER_TABS : DRIVER_TABS),
    [activeRole],
  );
  const activeTab = useMemo(() => routeToTabId(pathname), [pathname]);

  return (
    <nav
      className={cn(
        "absolute inset-x-0 bottom-0 z-40",
        "border-t border-black/6",
        "bg-[rgb(var(--shell-nav)/0.98)]",
        "supports-[backdrop-filter]:backdrop-blur-xl",
        "dark:border-white/10 dark:bg-[rgb(var(--shell-nav)/0.94)]",
        "supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]",
      )}
      aria-label={
        activeRole === "passenger" ? "Passenger navigation" : "Driver navigation"
      }
    >
      <div className="mx-auto w-full max-w-md">
        <div className="flex h-16 items-stretch justify-around px-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.id}
                href={tab.route}
                prefetch
                className={cn(
                  "group relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200 active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "absolute top-1.5 h-1 w-8 rounded-full transition-all duration-200",
                    active ? "bg-primary/80" : "bg-transparent",
                  )}
                />
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    active ? "scale-110" : "scale-100 group-hover:scale-105",
                  )}
                />
                <span className="text-[10px] font-medium leading-none">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

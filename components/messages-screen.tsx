"use client";

import * as React from "react";
import {
  AlertTriangle,
  Bell,
  Megaphone,
  ShieldAlert,
  TrafficCone,
  CalendarDays,
  Clock3,
  Search,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";

type Role = "driver" | "passenger";
type NoticeKind = "system" | "ride" | "announcement";
type NoticeSeverity = "info" | "warning" | "critical";

type Notice = {
  id: string;
  kind: NoticeKind;
  severity: NoticeSeverity;
  title: string;
  body: string;
  location?: string;
  route?: { from: string; to: string };
  timestamp: number;
  read?: boolean;
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

function Surface({
  children,
  className,
  tone = "panel",
  elevated,
  interactive,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "base" | "raised" | "sheet" | "panel";
  elevated?: boolean;
  interactive?: boolean;
}) {
  const toneClass =
    tone === "sheet"
      ? "bg-card/92 border-border/70"
      : tone === "panel"
        ? "bg-card/88 border-border/70"
        : tone === "raised"
          ? "bg-card/86 border-border/70"
          : "bg-card/82 border-border/70";

  const shadowClass = elevated
    ? "shadow-[0_18px_44px_-34px_color-mix(in_oklch,var(--primary)_28%,transparent)] dark:shadow-[0_18px_54px_-40px_rgba(0,0,0,0.85)]"
    : "shadow-[0_12px_30px_-34px_color-mix(in_oklch,var(--primary)_18%,transparent)] dark:shadow-[0_14px_40px_-38px_rgba(0,0,0,0.80)]";

  return (
    <div
      className={[
        "relative rounded-3xl border",
        "supports-[backdrop-filter]:backdrop-blur-xl",
        toneClass,
        shadowClass,
        "transition-all duration-300",
        EASE,
        interactive
          ? [
              "hover:-translate-y-[1px]",
              "hover:shadow-[0_26px_62px_-48px_color-mix(in_oklch,var(--primary)_32%,transparent)]",
              "active:translate-y-0 active:scale-[0.99]",
            ].join(" ")
          : "",
        className ?? "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-55 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

function PillButton({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={!!active}
      onClick={onClick}
      className={[
        "h-10 rounded-full px-4",
        "inline-flex items-center justify-center gap-2",
        "text-[13px] font-semibold tracking-tight",
        "border transition-all duration-300",
        EASE,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
        "active:scale-[0.99]",
        active
          ? [
              "bg-primary text-primary-foreground border-primary/60",
              "shadow-[0_18px_44px_-34px_color-mix(in_oklch,var(--primary)_40%,transparent)]",
            ].join(" ")
          : [
              "bg-card/70 border-border/70 text-foreground/85",
              "hover:bg-primary/10 hover:border-primary/20",
            ].join(" "),
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function BottomSheet({
  open,
  title,
  onOpenChange,
  children,
}: {
  open: boolean;
  title?: string;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const startY = React.useRef<number | null>(null);
  const lastY = React.useRef(0);
  const [dragY, setDragY] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!open) {
      setDragY(0);
      setDragging(false);
      startY.current = null;
      lastY.current = 0;
    }
  }, [open]);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    startY.current = e.clientY;
    lastY.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || startY.current == null) return;
    const dy = Math.max(0, e.clientY - startY.current);
    lastY.current = dy;
    setDragY(dy);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    const dy = lastY.current;
    setDragging(false);
    if (dy > 90) onOpenChange(false);
    else setDragY(0);
    startY.current = null;
    lastY.current = 0;
  };

  return (
    <div className={[open ? "" : "pointer-events-none"].join(" ")}>
      <div
        className={[
          "fixed inset-0 z-40 transition-all duration-300",
          EASE,
          open ? "bg-black/45" : "bg-transparent",
        ].join(" ")}
        onClick={() => onOpenChange(false)}
      />
      <div
        className="fixed left-0 right-0 bottom-0 z-50"
        role="dialog"
        aria-modal="true"
        style={{
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: dragging
            ? "none"
            : "transform 320ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <Surface elevated className="rounded-3xl overflow-hidden">
            <div className="px-4 pt-3 pb-2">
              <div
                className="mx-auto h-1.5 w-12 rounded-full bg-primary/20"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ touchAction: "none" }}
              />
              {title ? (
                <p className="mt-3 text-sm font-extrabold tracking-tight">
                  {title}
                </p>
              ) : null}
            </div>
            <div className="px-3 pb-3 max-h-[78vh] overflow-auto scrollbar-hide">
              {children}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

function ShimmerCard() {
  return (
    <Surface className="p-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded-xl bg-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
          </div>
          <div className="h-3 w-full rounded-xl bg-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
          </div>
          <div className="h-3 w-48 rounded-xl bg-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
          </div>
        </div>
      </div>
    </Surface>
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(ts: number) {
  return new Date(ts).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <p className="text-[11px] font-extrabold tracking-[0.22em] text-primary/90">
        {title.toUpperCase()}
      </p>
      {typeof count === "number" ? (
        <div className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
          {count}
        </div>
      ) : null}
      <div className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
    </div>
  );
}

function KindPill({ kind }: { kind: NoticeKind }) {
  const meta =
    kind === "ride"
      ? { label: "Ride", icon: <MapPin className="h-3 w-3" /> }
      : kind === "announcement"
        ? { label: "Alert", icon: <Megaphone className="h-3 w-3" /> }
        : { label: "System", icon: <Bell className="h-3 w-3" /> };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/75 px-2.5 py-1 text-[11px] font-semibold text-foreground/85">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 border border-primary/15 text-primary">
        {meta.icon}
      </span>
      <span className="leading-none">{meta.label}</span>
    </div>
  );
}

function SeverityPill({ severity }: { severity: NoticeSeverity }) {
  const meta =
    severity === "critical"
      ? {
          label: "Critical",
          icon: <ShieldAlert className="h-3 w-3" />,
          cls: "bg-destructive/10 border-destructive/20 text-destructive",
        }
      : severity === "warning"
        ? {
            label: "Warning",
            icon: <AlertTriangle className="h-3 w-3" />,
            cls: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
          }
        : {
            label: "Info",
            icon: <TrafficCone className="h-3 w-3" />,
            cls: "bg-primary/10 border-primary/18 text-primary",
          };

  return (
    <div
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        meta.cls,
      ].join(" ")}
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-background/60 border border-border/60">
        {meta.icon}
      </span>
      <span className="leading-none">{meta.label}</span>
    </div>
  );
}

function NoticeCard({
  n,
  onToggleRead,
}: {
  n: Notice;
  onToggleRead: (id: string) => void;
}) {
  const unread = !n.read;

  return (
    <Surface tone="panel" elevated interactive className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <KindPill kind={n.kind} />
            <SeverityPill severity={n.severity} />
            {unread ? (
              <span className="inline-flex items-center rounded-full bg-primary/14 border border-primary/20 px-2 py-0.5 text-[10px] font-extrabold tracking-tight text-primary">
                NEW
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-[14px] font-extrabold tracking-tight text-foreground leading-tight">
            {n.title}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-foreground/80 leading-relaxed">
            {n.body}
          </p>

          {n.location ? (
            <div className="mt-2 rounded-2xl border border-border/70 bg-card/70 px-2.5 py-2">
              <p className="text-[9px] font-extrabold tracking-[0.2em] text-muted-foreground">
                AREA
              </p>
              <p className="mt-0.5 text-[12px] font-semibold text-foreground/90">
                {n.location}
              </p>
            </div>
          ) : null}

          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formatDay(n.timestamp)}</span>
            <span className="opacity-60">•</span>
            <Clock3 className="h-3.5 w-3.5" />
            <span>{formatTime(n.timestamp)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleRead(n.id)}
          className={[
            "shrink-0 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold",
            "transition-all duration-300",
            EASE,
            unread
              ? "bg-primary/14 border-primary/22 text-primary hover:bg-primary/18"
              : "bg-card/70 border-border/70 text-foreground/70 hover:bg-primary/10 hover:border-primary/20",
            "active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
          ].join(" ")}
        >
          {unread ? "Read" : "Unread"}
        </button>
      </div>
    </Surface>
  );
}

const now = Date.now();
const DEMO_NOTICES: Notice[] = [
  {
    id: "n1",
    kind: "announcement",
    severity: "warning",
    title: "Protest alert may affect routes tomorrow",
    body: "Expect delays around Nairobi CBD. Consider leaving earlier or choosing an alternate pickup.",
    location: "Nairobi CBD",
    timestamp: now - 1000 * 60 * 12,
    read: false,
  },
  {
    id: "n2",
    kind: "announcement",
    severity: "critical",
    title: "Matatu operators strike expected",
    body: "Reduced public transport may increase demand. Drivers: expect higher requests. Passengers: plan ahead.",
    location: "Nairobi Metropolitan",
    timestamp: now - 1000 * 60 * 46,
    read: false,
  },
  {
    id: "n3",
    kind: "ride",
    severity: "info",
    title: "Ride request matched",
    body: "A driver has accepted your ride request. Coordinate pickup using ride details.",
    timestamp: now - 1000 * 60 * 90,
    read: true,
  },
  {
    id: "n4",
    kind: "ride",
    severity: "warning",
    title: "Route advisory: police roadblocks reported",
    body: "Possible checks along Thika Road. Add 15–25 minutes buffer time.",
    location: "Thika Road",
    timestamp: now - 1000 * 60 * 160,
    read: true,
  },
  {
    id: "n5",
    kind: "system",
    severity: "info",
    title: "New safety guidelines",
    body: "Verify pickup points before boarding. Use in-app check-in when you arrive.",
    timestamp: now - 1000 * 60 * 280,
    read: true,
  },
  {
    id: "n6",
    kind: "announcement",
    severity: "warning",
    title: "Heavy traffic expected on Mombasa Road",
    body: "Road construction ongoing. Allow extra 30 minutes for your journey.",
    location: "Mombasa Road",
    timestamp: now - 1000 * 60 * 320,
    read: true,
  },
  {
    id: "n7",
    kind: "ride",
    severity: "info",
    title: "Your ride was completed successfully",
    body: "Thank you for using Kipita. Rate your experience to help us improve.",
    timestamp: now - 1000 * 60 * 480,
    read: true,
  },
];

function groupByDay(items: Notice[]) {
  const m = new Map<string, Notice[]>();
  for (const n of items) {
    const key = formatDay(n.timestamp);
    const arr = m.get(key) ?? [];
    arr.push(n);
    m.set(key, arr);
  }
  return Array.from(m.entries());
}

function FiltersSheet({
  open,
  onOpenChange,
  kinds,
  setKinds,
  onlyUnread,
  setOnlyUnread,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kinds: Record<NoticeKind, boolean>;
  setKinds: (k: Record<NoticeKind, boolean>) => void;
  onlyUnread: boolean;
  setOnlyUnread: (v: boolean) => void;
}) {
  const toggleKind = (k: NoticeKind) => setKinds({ ...kinds, [k]: !kinds[k] });

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Filters">
      <div className="space-y-3">
        <Surface tone="sheet" className="p-3">
          <p className="text-sm font-extrabold tracking-tight">Show</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["ride", "announcement", "system"] as NoticeKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => toggleKind(k)}
                className={[
                  "h-[44px] rounded-full border px-3 inline-flex items-center gap-2 font-semibold text-[13px]",
                  "transition-all duration-300",
                  EASE,
                  kinds[k]
                    ? "bg-primary/14 border-primary/22 text-primary"
                    : "bg-card/75 border-border/70 text-foreground/80",
                  "active:scale-[0.99]",
                ].join(" ")}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 border border-primary/15 text-primary">
                  {k === "ride" ? (
                    <MapPin className="h-4 w-4" />
                  ) : k === "announcement" ? (
                    <Megaphone className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </span>
                <span className="truncate">
                  {k === "ride"
                    ? "Rides"
                    : k === "announcement"
                      ? "Alerts"
                      : "System"}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOnlyUnread(!onlyUnread)}
              className={[
                "h-[44px] rounded-full border px-3 inline-flex items-center gap-2 font-semibold text-[13px]",
                "transition-all duration-300",
                EASE,
                onlyUnread
                  ? "bg-primary/14 border-primary/22 text-primary"
                  : "bg-card/75 border-border/70 text-foreground/80",
                "active:scale-[0.99]",
              ].join(" ")}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 border border-primary/15 text-primary">
                <Search className="h-4 w-4" />
              </span>
              <span className="truncate">Unread</span>
            </button>
          </div>
        </Surface>

        <button
          type="button"
          onClick={() => {
            setKinds({ ride: true, announcement: true, system: true });
            setOnlyUnread(false);
          }}
          className="h-10 w-full rounded-2xl font-semibold border border-border/70 bg-card/80 text-foreground/85 active:scale-[0.99] text-[13px]"
        >
          Clear filters
        </button>
      </div>
    </BottomSheet>
  );
}

export function NotificationsScreen({
  role = "passenger" as Role,
}: {
  role?: Role;
}) {
  const [tab, setTab] = React.useState<"all" | "rides" | "alerts">("all");
  const [query, setQuery] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const [kinds, setKinds] = React.useState<Record<NoticeKind, boolean>>({
    ride: true,
    announcement: true,
    system: true,
  });
  const [onlyUnread, setOnlyUnread] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Notice[]>([]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      const seeded = DEMO_NOTICES.map((n) => {
        if (role === "driver" && n.kind === "ride" && n.severity === "info") {
          return {
            ...n,
            title: "New ride request",
            body: "A passenger posted a request matching your route. Review and respond.",
          };
        }
        return n;
      });
      setItems(seeded.sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    }, 700);
    return () => window.clearTimeout(t);
  }, [role]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    return items
      .filter((n) => {
        if (tab === "rides") return n.kind === "ride";
        if (tab === "alerts")
          return n.kind === "announcement" || n.severity !== "info";
        return true;
      })
      .filter((n) => {
        if (!kinds[n.kind]) return false;
        if (onlyUnread && n.read) return false;
        if (!q) return true;
        const hay = [
          n.title,
          n.body,
          n.location ?? "",
          n.route?.from ?? "",
          n.route?.to ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [items, tab, query, kinds, onlyUnread]);

  const grouped = React.useMemo(() => groupByDay(filtered), [filtered]);
  const unreadCount = React.useMemo(
    () => filtered.filter((n) => !n.read).length,
    [filtered],
  );

  const toggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide bg-primary/25 px-3 pb-24">
      <div className="w-full pt-1 space-y-3">
        {/* Search and Filters Section */}
        <Surface tone="sheet" className="p-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Route, area, keywords...
          </p>

          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2">
            <Search className="h-4 w-4 text-primary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications"
              className="h-7 w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-muted-foreground/80"
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border/70 bg-card/70 text-foreground/80 active:scale-[0.99]"
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <PillButton
              active={tab === "all"}
              onClick={() => setTab("all")}
              className="flex-1"
            >
              All
            </PillButton>
            <PillButton
              active={tab === "rides"}
              onClick={() => setTab("rides")}
              className="flex-1"
            >
              Rides
            </PillButton>
            <PillButton
              active={tab === "alerts"}
              onClick={() => setTab("alerts")}
              className="flex-1"
            >
              Alerts
            </PillButton>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-muted-foreground">
              {loading ? "Loading..." : `${unreadCount} unread`}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-extrabold text-primary hover:opacity-80 active:scale-[0.99]"
              >
                Mark all read
              </button>
            )}
          </div>
        </Surface>

        {/* Section Header */}
        <SectionHeader
          title="Notifications"
          count={loading ? undefined : filtered.length}
        />

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="space-y-3">
            {grouped.map(([day, notices]) => (
              <div key={day} className="space-y-2.5">
                <div className="px-1 flex items-center gap-2">
                  <p className="text-[10px] font-extrabold tracking-[0.22em] text-muted-foreground">
                    {day.toUpperCase()}
                  </p>
                  <div className="h-px flex-1 bg-border/70" />
                </div>
                <div className="space-y-2.5">
                  {notices.map((n) => (
                    <NoticeCard key={n.id} n={n} onToggleRead={toggleRead} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Surface tone="panel" className="p-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <p className="mt-2.5 text-[15px] font-extrabold">
              No notifications
            </p>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
              Try a different search or clear filters.
            </p>
            <button
              type="button"
              className="mt-4 h-10 w-full rounded-2xl font-semibold border border-border/70 bg-card/80 text-foreground/85 active:scale-[0.99] text-[13px]"
              onClick={() => {
                setQuery("");
                setKinds({ ride: true, announcement: true, system: true });
                setOnlyUnread(false);
                setTab("all");
              }}
            >
              Clear all filters
            </button>
          </Surface>
        )}
      </div>

      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        kinds={kinds}
        setKinds={setKinds}
        onlyUnread={onlyUnread}
        setOnlyUnread={setOnlyUnread}
      />
    </div>
  );
}
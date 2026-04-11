"use client";

import * as React from "react";
import { useAuthDrawer } from "@/components/auth-drawer-provider";
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
  Send,
  Pencil,
} from "lucide-react";
import {
  BottomSheet,
  EASE,
  SectionHeader,
  ShimmerCard,
  Surface,
} from "@/components/ui-parts";
import { formatTimestamp, formatDay } from "@/lib/format";

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
            <span>{formatTimestamp(n.timestamp)}</span>
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

export function NotificationsScreen(_props: { role?: Role }) {
  const { isSignedIn, openAuthDrawer } = useAuthDrawer();

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
  const [postText, setPostText] = React.useState("");

  const fetchNotifications = React.useCallback(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.notifications) return;
        setItems((prev) => {
          // Merge: keep locally-read status, add new items
          const readIds = new Set(prev.filter((n) => n.read).map((n) => n.id));
          const merged: Notice[] = (json.notifications as Notice[]).map((n) => ({
            ...n,
            read: readIds.has(n.id) ? true : n.read ?? false,
          }));
          return merged.sort((a, b) => b.timestamp - a.timestamp);
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = window.setInterval(fetchNotifications, 30_000);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
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
  }, [items, query, kinds, onlyUnread]);

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

  const [posting, setPosting] = React.useState(false);
  const [postSeverity, setPostSeverity] = React.useState<NoticeSeverity>("info");
  const [postLocation, setPostLocation] = React.useState("");
  const [postError, setPostError] = React.useState<string | null>(null);

  const postUpdate = async () => {
    const body = postText.trim();
    if (!body || posting) return;

    // Require sign-in before posting
    if (!isSignedIn) {
      openAuthDrawer({ selectedRole: "passenger" });
      return;
    }

    setPosting(true);
    setPostError(null);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: body,
          severity: postSeverity,
          location: postLocation.trim() || undefined,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Session expired or not signed in — open auth drawer
          openAuthDrawer({ selectedRole: "passenger" });
          return;
        }
        const err = await res.json().catch(() => ({ error: "Failed to post" }));
        throw new Error(err.error || "Failed to post announcement");
      }

      const severityTitles: Record<NoticeSeverity, string> = {
        info: "Road update",
        warning: "Road warning",
        critical: "Road alert",
      };

      // Optimistically add to the list
      const newNotice: Notice = {
        id: `local-${Date.now()}`,
        kind: "announcement",
        severity: postSeverity,
        title: severityTitles[postSeverity],
        body,
        location: postLocation.trim() || undefined,
        timestamp: Date.now(),
        read: false,
      };
      setItems((prev) => [newNotice, ...prev]);
      setPostText("");
      setPostLocation("");
      setPostSeverity("info");

      // Refetch to get server data
      setTimeout(fetchNotifications, 1500);
    } catch (e: unknown) {
      setPostError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide  pb-24">
      <div className="w-full pt-1 space-y-3">
        <p className="text-center text-sm font-semibold text-foreground m-0 py-1">Ride and Road Updates</p>

        <Surface tone="sheet" className="p-3">
          <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">
            POST A ROAD UPDATE
          </p>

          {/* message input */}
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 border border-primary/15 text-primary">
              <Pencil className="h-4 w-4" />
            </span>

            <input
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's happening on the road?"
              className="h-7 w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-muted-foreground/80"
              onKeyDown={(e) => {
                if (e.key === "Enter") postUpdate();
              }}
            />

            <button
              type="button"
              onClick={postUpdate}
              disabled={!postText.trim() || posting}
              className={[
                "grid h-9 w-9 shrink-0 place-items-center rounded-xl border active:scale-[0.99]",
                "transition-all duration-200",
                postText.trim()
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/70 bg-card/70 text-foreground/40",
              ].join(" ")}
              aria-label="Post"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* location input */}
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <input
              value={postLocation}
              onChange={(e) => setPostLocation(e.target.value)}
              placeholder="Location (e.g. Thika Road, Mombasa Rd)"
              className="h-7 w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-muted-foreground/80"
            />
          </div>

          {/* severity picker */}
          <div className="mt-2 flex items-center gap-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground mr-1">Level:</p>
            {(["info", "warning", "critical"] as NoticeSeverity[]).map((sev) => {
              const meta =
                sev === "critical"
                  ? { label: "Critical", icon: <ShieldAlert className="h-3 w-3" />, active: "bg-destructive/14 border-destructive/25 text-destructive", inactive: "border-border/70 bg-card/70 text-foreground/60" }
                  : sev === "warning"
                    ? { label: "Warning", icon: <AlertTriangle className="h-3 w-3" />, active: "bg-amber-500/14 border-amber-500/25 text-amber-700 dark:text-amber-300", inactive: "border-border/70 bg-card/70 text-foreground/60" }
                    : { label: "Info", icon: <TrafficCone className="h-3 w-3" />, active: "bg-primary/14 border-primary/25 text-primary", inactive: "border-border/70 bg-card/70 text-foreground/60" };

              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setPostSeverity(sev)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold",
                    "transition-all duration-200 active:scale-[0.98]",
                    postSeverity === sev ? meta.active : meta.inactive,
                  ].join(" ")}
                >
                  {meta.icon}
                  {meta.label}
                </button>
              );
            })}
          </div>

          {postError && (
            <p className="mt-1.5 text-[11px] text-destructive font-semibold">{postError}</p>
          )}

          {/* unread count + search */}
          <div className="mt-3 flex items-center justify-between gap-2">
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

          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2">
            <Search className="h-4 w-4 text-primary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications"
              className="h-7 w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-muted-foreground/80"
            />
          </div>
        </Surface>

        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex-1 min-w-0">
            <SectionHeader
              title="Notifications"
              count={loading ? undefined : filtered.length}
            />
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border/70 bg-card/70 text-foreground/80 active:scale-[0.99]"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

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
            <p className="mt-2.5 text-[15px] font-extrabold">No notifications</p>
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

"use client";

import * as React from "react";
import { useAuthDrawer } from "@/components/auth-drawer-provider";
import { AlertCard } from "@/components/shared/alert-card";
import {
  Bell,
  CarFront,
  CheckCircle2,
  Megaphone,
  Search,
  Send,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { EASE, ShimmerCard, Surface } from "@/components/ui-parts";
import { formatDay } from "@/lib/format";
import { LIMITS } from "@/lib/constants";
import {
  classifyRoadUpdate,
  roadUpdateTitle,
  type NoticeSeverity,
} from "@/lib/notification-priority";
import useSWR from "swr";

type Role = "driver" | "passenger";
type NoticeKind = "system" | "notification" | "alert";
type NoticeTab = "notifications" | "alerts" | "system";

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

type NotificationsResponse = {
  notifications?: Array<
    Omit<Notice, "kind"> & {
      kind: "system" | "notification" | "ride" | "announcement";
    }
  >;
};

type AnnouncementsResponse = {
  announcements?: Record<string, unknown>[];
};

type NotificationFeedItem = NonNullable<
  NotificationsResponse["notifications"]
>[number];

const TAB_META: Record<
  NoticeTab,
  { label: string; kind: NoticeKind; icon: React.ElementType }
> = {
  notifications: {
    label: "Notifications",
    kind: "notification",
    icon: CarFront,
  },
  alerts: { label: "Alerts", kind: "alert", icon: Megaphone },
  system: { label: "System", kind: "system", icon: ShieldAlert },
};

function groupByDay(items: Notice[]) {
  const groups = new Map<string, Notice[]>();
  for (const notice of items) {
    const key = formatDay(notice.timestamp);
    groups.set(key, [...(groups.get(key) ?? []), notice]);
  }
  return Array.from(groups.entries());
}

function dedupeById(items: Notice[]) {
  const map = new Map<string, Notice>();
  for (const item of items) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
}

function normalizeNotification(item: NotificationFeedItem): Notice {
  return {
    ...item,
    kind: item.kind === "system" ? "system" : "notification",
  };
}

function mapAnnouncement(announcement: Record<string, unknown>): Notice {
  const poster = announcement.poster as Record<string, unknown> | null;
  const severity =
    (announcement.severity as NoticeSeverity | undefined) ?? "info";

  return {
    id: `ann-${String(announcement.id)}`,
    kind: "alert",
    severity,
    title: `${roadUpdateTitle(severity)} from ${
      (poster?.name as string) ?? "Someone"
    }`,
    body: String(announcement.message ?? ""),
    location: (announcement.location as string | undefined) ?? undefined,
    route:
      announcement.route_from && announcement.route_to
        ? {
            from: String(announcement.route_from),
            to: String(announcement.route_to),
          }
        : undefined,
    timestamp: announcement.created_at
      ? new Date(String(announcement.created_at)).getTime()
      : Date.now(),
  };
}

function TabButton({
  tab,
  active,
  count,
  onClick,
}: {
  tab: NoticeTab;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  const meta = TAB_META[tab];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "h-10 min-w-0 rounded-full border px-3",
        "inline-flex items-center justify-center gap-2 text-[12px] font-extrabold",
        "transition-all duration-300",
        EASE,
        active
          ? "border-primary/30 bg-primary/14 text-primary"
          : "border-border/70 bg-card/75 text-foreground/75 hover:bg-primary/8",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{meta.label}</span>
      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-background/70 px-1.5 text-[10px]">
        {count}
      </span>
    </button>
  );
}

function Composer({
  value,
  setValue,
  posting,
  error,
  onPost,
}: {
  value: string;
  setValue: (value: string) => void;
  posting: boolean;
  error: string | null;
  onPost: () => void;
}) {
  const body = value.trim();
  const overLimit = value.length > LIMITS.maxAlertLength;

  return (
    <Surface tone="sheet" className="p-2">
      <div className="relative rounded-2xl border border-primary/20 bg-primary/10 p-1.5">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Example: Accident near Waiyaki Way, two lanes blocked"
          rows={2}
          className="min-h-[52px] w-full resize-none bg-transparent px-2 pb-4 pt-1.5 pr-14 text-[14px] font-semibold leading-relaxed outline-none placeholder:text-muted-foreground/75"
        />
        <span
          className={[
            "pointer-events-none absolute bottom-2 right-3 rounded-full bg-background/80 px-1.5 text-[10px] font-semibold",
            overLimit ? "text-destructive" : "text-muted-foreground",
          ].join(" ")}
        >
          {value.length}/{LIMITS.maxAlertLength}
        </span>
      </div>

      {error ? (
        <p className="mt-2 text-[12px] font-semibold text-destructive">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onPost}
        disabled={!body || posting || overLimit}
        className={[
          "mt-2 h-10 w-full rounded-2xl",
          "inline-flex items-center justify-center gap-2",
          "bg-primary text-sm font-extrabold text-primary-foreground",
          "transition-all duration-300 active:scale-[0.99]",
          "disabled:bg-primary/35 disabled:text-primary-foreground/80",
        ].join(" ")}
      >
        {posting ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {posting ? "Posting..." : "Post update"}
      </button>
    </Surface>
  );
}

export function NotificationsScreen(_props: { role?: Role }) {
  const { isSignedIn, openAuthDrawer } = useAuthDrawer();
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<NoticeTab>("notifications");
  const [filtersOpen, setFiltersOpen] = React.useState(true);
  const [readIds, setReadIds] = React.useState<string[]>([]);
  const [optimisticAlerts, setOptimisticAlerts] = React.useState<Notice[]>([]);
  const [postText, setPostText] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  const [postError, setPostError] = React.useState<string | null>(null);

  const { data: notificationsData, isLoading: notificationsLoading } =
    useSWR<NotificationsResponse>("/api/notifications", {
      refreshInterval: LIMITS.pollIntervalMs,
    });

  const {
    data: announcementsData,
    isLoading: announcementsLoading,
    mutate: mutateAnnouncements,
  } = useSWR<AnnouncementsResponse>("/api/announcements", {
    refreshInterval: LIMITS.pollIntervalMs,
  });

  const readIdSet = React.useMemo(() => new Set(readIds), [readIds]);

  const notifications = React.useMemo(
    () => (notificationsData?.notifications ?? []).map(normalizeNotification),
    [notificationsData?.notifications],
  );

  const alerts = React.useMemo(() => {
    const mapped = (announcementsData?.announcements ?? []).map(
      mapAnnouncement,
    );
    return dedupeById([...optimisticAlerts, ...mapped]);
  }, [announcementsData?.announcements, optimisticAlerts]);

  const items = React.useMemo(
    () =>
      dedupeById([...notifications, ...alerts]).map((item) => ({
        ...item,
        read: readIdSet.has(item.id),
      })),
    [alerts, notifications, readIdSet],
  );

  const tabCounts = React.useMemo(
    () =>
      ({
        notifications: items.filter((item) => item.kind === "notification")
          .length,
        alerts: items.filter((item) => item.kind === "alert").length,
        system: items.filter((item) => item.kind === "system").length,
      }) satisfies Record<NoticeTab, number>,
    [items],
  );

  const filtered = React.useMemo(() => {
    const kind = TAB_META[activeTab].kind;
    const value = query.trim().toLowerCase();

    return items
      .filter((item) => item.kind === kind)
      .filter((item) => {
        if (!value) return true;
        return [
          item.title,
          item.body,
          item.location ?? "",
          item.route?.from ?? "",
          item.route?.to ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(value);
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [activeTab, items, query]);

  const grouped = React.useMemo(() => groupByDay(filtered), [filtered]);
  const unreadCount = React.useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );
  const activeUnreadCount = React.useMemo(
    () => filtered.filter((item) => !item.read).length,
    [filtered],
  );
  const isLoading = notificationsLoading || announcementsLoading;

  const toggleRead = (id: string) => {
    setReadIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const markAllRead = () => {
    setReadIds((prev) =>
      Array.from(new Set([...prev, ...filtered.map((item) => item.id)])),
    );
  };

  const postUpdate = async () => {
    const body = postText.trim();
    if (!body || posting) return;
    if (body.length > LIMITS.maxAlertLength) {
      setPostError(`Keep updates under ${LIMITS.maxAlertLength} characters.`);
      return;
    }

    if (!isSignedIn) {
      openAuthDrawer({ selectedRole: "passenger" });
      return;
    }

    setPosting(true);
    setPostError(null);

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          openAuthDrawer({ selectedRole: "passenger" });
          return;
        }

        const error = await response
          .json()
          .catch(() => ({ error: "Failed to post road update" }));
        throw new Error(error.error || "Failed to post road update");
      }

      const json = await response.json();
      const announcement = json.announcement as
        | Record<string, unknown>
        | undefined;
      const severity =
        (announcement?.severity as NoticeSeverity | undefined) ??
        classifyRoadUpdate(body);

      const optimisticNotice: Notice = {
        id: `ann-${announcement?.id ?? Date.now()}`,
        kind: "alert",
        severity,
        title: `${roadUpdateTitle(severity)} posted`,
        body,
        location: (announcement?.location as string | undefined) ?? undefined,
        route:
          announcement?.route_from && announcement?.route_to
            ? {
                from: String(announcement.route_from),
                to: String(announcement.route_to),
              }
            : undefined,
        timestamp: announcement?.created_at
          ? new Date(String(announcement.created_at)).getTime()
          : Date.now(),
        read: false,
      };

      setOptimisticAlerts((prev) => dedupeById([optimisticNotice, ...prev]));
      setPostText("");
      setActiveTab("alerts");
      void mutateAnnouncements();
    } catch (error) {
      setPostError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setPosting(false);
    }
  };

  const emptyTitle =
    activeTab === "system"
      ? "No system alerts"
      : activeTab === "alerts"
        ? "No road alerts"
        : "No notifications";

  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-24">
      <div className="w-full space-y-3 pt-1">
        <div className="px-1 text-center">
          <p className="text-sm font-semibold text-white dark:text-foreground">
            Notifications
          </p>
          <p className="mt-1 text-[12px] font-extrabold text-white/78 dark:text-muted-foreground">
            System, trip, and road updates in one place.
          </p>
        </div>

        <Composer
          value={postText}
          setValue={setPostText}
          posting={posting}
          error={postError}
          onPost={postUpdate}
        />

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search updates"
              className="h-8 w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-muted-foreground/80"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-label="Filter notifications"
            aria-expanded={filtersOpen}
            className={[
              "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border",
              "transition-all duration-300 active:scale-[0.99]",
              filtersOpen
                ? "border-primary/30 bg-primary/14 text-primary"
                : "border-border/70 bg-card/70 text-foreground/80",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {filtersOpen ? (
          <div className="grid grid-cols-3 gap-2">
            {(["notifications", "alerts", "system"] as NoticeTab[]).map(
              (tab) => (
                <TabButton
                  key={tab}
                  tab={tab}
                  active={activeTab === tab}
                  count={tabCounts[tab]}
                  onClick={() => {
                    setActiveTab(tab);
                    setFiltersOpen(false);
                  }}
                />
              ),
            )}
          </div>
        ) : null}

        <div className="flex items-center gap-2 px-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary/90">
            {TAB_META[activeTab].label}
          </p>
          <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-extrabold text-primary">
            {isLoading
              ? "..."
              : activeUnreadCount > 0
                ? `${activeUnreadCount} unread`
                : filtered.length}
          </span>
          <div className="h-px flex-1 bg-border/70" />
          {activeUnreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="h-8 shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 text-[11px] font-extrabold text-primary active:scale-[0.99]"
            >
              Mark tab read
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <ShimmerCard key={index} />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="space-y-3">
            {grouped.map(([day, notices]) => (
              <div key={day} className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <p className="text-[10px] font-extrabold tracking-[0.22em] text-muted-foreground">
                    {day.toUpperCase()}
                  </p>
                  <div className="h-px flex-1 bg-border/70" />
                </div>
                <div className="space-y-2.5">
                  {notices.map((notice) => (
                    <AlertCard
                      key={notice.id}
                      id={notice.id}
                      kind={notice.kind}
                      severity={notice.severity}
                      title={notice.title}
                      body={notice.body}
                      location={notice.location}
                      timestamp={notice.timestamp}
                      read={notice.read}
                      onToggleRead={toggleRead}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Surface tone="panel" className="p-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <p className="mt-2.5 text-[15px] font-extrabold">{emptyTitle}</p>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
              New items from the API will appear here automatically.
            </p>
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 h-10 w-full rounded-2xl border border-border/70 bg-card/80 text-[13px] font-semibold text-foreground/85 active:scale-[0.99]"
              >
                Clear search
              </button>
            ) : null}
          </Surface>
        )}
      </div>
    </div>
  );
}

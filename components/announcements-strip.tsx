"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Megaphone, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "./ui-parts";
import { useRouter } from "next/navigation";

export type Announcement = {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
  posterName: string;
  location?: string;
  createdAt: number;
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function useAnnouncements(): Announcement[] {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/announcements")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.announcements?.length) return;
        const mapped: Announcement[] = json.announcements
          .slice(0, 5)
          .map((a: Record<string, unknown>) => {
            const poster = a.poster as Record<string, unknown> | null;
            return {
              id: a.id as string,
              message: a.message as string,
              severity: (a.severity as string) ?? "info",
              posterName: (poster?.name as string) ?? "User",
              location: (a.location as string) ?? undefined,
              createdAt: new Date(a.created_at as string).getTime(),
            };
          });
        setItems(mapped);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}

export function AnnouncementsStrip({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const router = useRouter();

  const navigate = () => {
    router.push("/notifications");
  };

  const important = announcements.filter(
    (a) => a.severity === "critical" || a.severity === "warning",
  );
  const display = important.length
    ? important.slice(0, 3)
    : announcements.slice(0, 2);

  if (!display.length) return null;

  const severityIcon = (s: string) =>
    s === "critical" ? (
      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
    ) : s === "warning" ? (
      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
    ) : (
      <Megaphone className="h-3.5 w-3.5 text-primary" />
    );

  return (
    <Surface elevated className="p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold tracking-tight">Road updates</p>
        <button
          type="button"
          onClick={navigate}
          className="text-[11px] font-bold text-primary flex items-center gap-0.5 active:opacity-70"
        >
          View all <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 space-y-1.5">
        {display.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={navigate}
            className={cn(
              "w-full text-left rounded-2xl border px-2.5 py-2",
              "transition-all duration-200 active:scale-[0.99]",
              a.severity === "critical"
                ? "border-destructive/20 bg-destructive/5"
                : a.severity === "warning"
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-border/70 bg-card/60",
            )}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0">{severityIcon(a.severity)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold leading-tight line-clamp-2">
                  {a.message}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {a.posterName} · {timeAgo(a.createdAt)}
                  {a.location ? ` · ${a.location}` : ""}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Surface>
  );
}

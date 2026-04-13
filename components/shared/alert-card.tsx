"use client";

import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Clock3,
  MapPin,
  Megaphone,
  ShieldAlert,
  TrafficCone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui-parts";
import { formatTimestamp, formatDay } from "@/lib/format";

type NoticeKind = "system" | "ride" | "announcement";
type Severity = "info" | "warning" | "critical";

interface AlertCardProps {
  id: string;
  kind: NoticeKind;
  severity: Severity;
  title: string;
  body: string;
  location?: string;
  timestamp: number;
  read?: boolean;
  onToggleRead?: (id: string) => void;
  onTap?: () => void;
}

const KIND_META: Record<NoticeKind, { label: string; icon: React.ReactNode }> = {
  ride: { label: "Ride", icon: <MapPin className="h-3 w-3" /> },
  announcement: { label: "Alert", icon: <Megaphone className="h-3 w-3" /> },
  system: { label: "System", icon: <Bell className="h-3 w-3" /> },
};

const SEVERITY_META: Record<Severity, { label: string; icon: React.ReactNode; cls: string }> = {
  critical: {
    label: "Critical",
    icon: <ShieldAlert className="h-3 w-3" />,
    cls: "bg-destructive/10 border-destructive/20 text-destructive",
  },
  warning: {
    label: "Warning",
    icon: <AlertTriangle className="h-3 w-3" />,
    cls: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
  },
  info: {
    label: "Info",
    icon: <TrafficCone className="h-3 w-3" />,
    cls: "bg-primary/10 border-primary/18 text-primary",
  },
};

export function AlertCard({
  id,
  kind,
  severity,
  title,
  body,
  location,
  timestamp,
  read,
  onToggleRead,
  onTap,
}: AlertCardProps) {
  const km = KIND_META[kind];
  const sm = SEVERITY_META[severity];
  const unread = !read;

  return (
    <div
      onClick={onTap}
      onKeyDown={(event) => {
        if (!onTap) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onTap();
        }
      }}
      role={onTap ? "button" : undefined}
      tabIndex={onTap ? 0 : undefined}
      className="w-full text-left"
    >
      <Surface tone="panel" elevated interactive className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Kind pill */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/75 px-2.5 py-1 text-[11px] font-semibold text-foreground/85">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 border border-primary/15 text-primary">
                  {km.icon}
                </span>
                <span className="leading-none">{km.label}</span>
              </div>
              {/* Severity pill */}
              <div className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                sm.cls,
              )}>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-background/60 border border-border/60">
                  {sm.icon}
                </span>
                <span className="leading-none">{sm.label}</span>
              </div>
              {unread && (
                <span className="inline-flex items-center rounded-full bg-primary/14 border border-primary/20 px-2 py-0.5 text-[10px] font-extrabold tracking-tight text-primary">
                  NEW
                </span>
              )}
            </div>

            <p className="mt-2 text-[14px] font-extrabold tracking-tight text-foreground leading-tight">
              {title}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-foreground/80 leading-relaxed">
              {body}
            </p>

            {location && (
              <div className="mt-2 rounded-2xl border border-border/70 bg-card/70 px-2.5 py-2">
                <p className="text-[9px] font-extrabold tracking-[0.2em] text-muted-foreground">AREA</p>
                <p className="mt-0.5 text-[12px] font-semibold text-foreground/90">{location}</p>
              </div>
            )}

            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatDay(timestamp)}</span>
              <span className="opacity-60">·</span>
              <Clock3 className="h-3.5 w-3.5" />
              <span>{formatTimestamp(timestamp)}</span>
            </div>
          </div>

          {onToggleRead && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleRead(id); }}
              className={cn(
                "shrink-0 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-all duration-300 active:scale-[0.99]",
                unread
                  ? "bg-primary/14 border-primary/22 text-primary"
                  : "bg-card/70 border-border/70 text-foreground/70",
              )}
            >
              {unread ? "Read" : "Unread"}
            </button>
          )}
        </div>
      </Surface>
    </div>
  );
}

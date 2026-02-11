"use client";

import { MapPin, Navigation, Sparkles, Clock3, Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "../ui-parts";

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function hueFromRoute(from: string, to: string) {
  const h = hashString(`${from}→${to}`) % 360;
  return h;
}

function initials(label: string, fallback: string) {
  const t = label?.trim();
  if (!t) return fallback;
  const parts = t.split(/\s+/).slice(0, 2);
  const a = parts[0]?.[0] ?? fallback;
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function kmEstimate(from: string, to: string) {
  // playful deterministic “estimate” based on text (keeps UI lively without APIs)
  const seed = hashString(`${from}|${to}`) % 180;
  return 60 + seed; // 60–239 km
}

function minutesEstimate(from: string, to: string) {
  const km = kmEstimate(from, to);
  // assume 70–90km/h -> minutes 40–210ish
  const speed = 70 + (hashString(`${to}|${from}`) % 21); // 70–90
  return Math.max(35, Math.round((km / speed) * 60));
}

function formatETA(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m} min`;
  return `${h}h ${m}m`;
}

export function MapPreview({ from, to }: { from: string; to: string }) {
  const fromLabel = from?.trim() ? from.trim() : "Pick a start";
  const toLabel = to?.trim() ? to.trim() : "Pick a destination";
  const ready = Boolean(from?.trim() && to?.trim());

  const left = initials(from, "A");
  const right = initials(to, "B");

  const hue = hueFromRoute(from || "A", to || "B");
  const km = ready ? kmEstimate(from, to) : null;
  const mins = ready ? minutesEstimate(from, to) : null;

  return (
    <Surface className="py-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-2xl grid place-items-center border"
              style={{
                background: `hsl(${hue} 70% 55% / 0.14)`,
                borderColor: `hsl(${hue} 70% 55% / 0.22)`,
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground">
              Route preview
            </p>
          </div>

          <p className="mt-1 text-[13px] font-extrabold tracking-tight truncate">
            {fromLabel} <span className="text-primary">→</span> {toLabel}
          </p>

          {ready ? (
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                <span className="font-medium">ETA</span>
                <span className="font-semibold text-foreground/85">
                  {mins ? formatETA(mins) : "—"}
                </span>
              </span>
              <span className="opacity-35">•</span>
              <span className="font-medium">
                ~{km?.toLocaleString()} km
              </span>
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Add both towns to see a richer preview.
            </p>
          )}
        </div>

        <div className="h-10 w-10 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15 shrink-0">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Map card */}
      <div
        className={cn(
          "mt-3 relative overflow-hidden rounded-3xl border",
          "h-[112px]",
          "bg-card/60",
        )}
        style={{
          borderColor: `hsl(${hue} 70% 55% / 0.18)`,
        }}
      >
        {/* Soft animated glow */}
        <div
          className="absolute -top-10 -left-10 h-40 w-40 rounded-full blur-3xl opacity-70"
          style={{ background: `hsl(${hue} 70% 55% / 0.18)` }}
        />
        <div
          className="absolute -bottom-12 -right-16 h-48 w-48 rounded-full blur-3xl opacity-60"
          style={{ background: `hsl(${(hue + 50) % 360} 70% 55% / 0.14)` }}
        />

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] dark:opacity-60 [background-size:14px_14px]" />

        {/* Curved route path (SVG) */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 360 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="routeLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={`hsl(${hue} 70% 55% / 0.15)`} />
              <stop offset="50%" stopColor={`hsl(${hue} 70% 55% / 0.55)`} />
              <stop offset="100%" stopColor={`hsl(${(hue + 40) % 360} 70% 55% / 0.18)`} />
            </linearGradient>

            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* dotted baseline */}
          <path
            d="M56 60 C 120 18, 240 102, 304 60"
            fill="none"
            stroke={`hsl(${hue} 70% 55% / 0.18)`}
            strokeWidth="2"
            strokeDasharray="3 8"
          />

          {/* main route */}
          <path
            d="M56 60 C 120 18, 240 102, 304 60"
            fill="none"
            stroke="url(#routeLine)"
            strokeWidth="3.25"
            filter="url(#softGlow)"
          />

          {/* moving dot (pure CSS via animateTransform) */}
          {ready ? (
            <circle r="3.8" fill={`hsl(${hue} 70% 55% / 0.95)`}>
              <animateMotion
                dur="3.4s"
                repeatCount="indefinite"
                path="M56 60 C 120 18, 240 102, 304 60"
              />
            </circle>
          ) : null}
        </svg>

        {/* Start / end badges */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <div
            className="h-10 w-10 rounded-2xl grid place-items-center border shadow-[0_16px_42px_-30px_rgba(0,0,0,0.35)]"
            style={{
              background: `hsl(${hue} 70% 55% / 0.16)`,
              borderColor: `hsl(${hue} 70% 55% / 0.28)`,
            }}
          >
            <span className="text-[12px] font-extrabold text-foreground/90">
              {left}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Dot className="h-3.5 w-3.5 text-primary" />
            <span className="max-w-[120px] truncate">{from || "From"}</span>
          </div>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
          <div
            className="h-10 w-10 rounded-2xl grid place-items-center border shadow-[0_16px_42px_-30px_rgba(0,0,0,0.35)] ml-auto"
            style={{
              background: `hsl(${(hue + 30) % 360} 70% 55% / 0.16)`,
              borderColor: `hsl(${(hue + 30) % 360} 70% 55% / 0.28)`,
            }}
          >
            <span className="text-[12px] font-extrabold text-foreground/90">
              {right}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <span className="max-w-[120px] truncate">{to || "To"}</span>
          </div>
        </div>

        {/* Bottom hint suggestiveness */}
        <div className="absolute left-0 right-0 bottom-2 flex items-center justify-center">
          <div className="px-3 py-1 rounded-full border bg-background/40 backdrop-blur-sm text-[10px] text-muted-foreground">
            {ready ? "Route may vary by driver" : "Select both towns to preview"}
          </div>
        </div>
      </div>
    </Surface>
  );
}

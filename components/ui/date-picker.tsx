"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "../ui-parts";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fromISO(iso: string) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime();
}

function formatDisplay(iso: string) {
  const d = fromISO(iso);
  if (!d) return "mm/dd/yyyy";
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

function monthLabel(year: number, monthIndex: number) {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function buildMonth(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startWeekday = first.getDay(); // Sun=0
  const cells: Array<{ day: number | null }> = [];

  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  while (cells.length % 7 !== 0) cells.push({ day: null });
  return cells;
}

export function DatePickerCard({
  label,
  value,
  min,
  onChange,
  variant = "card",
  className,
  open,
  onOpenChange,
}: {
  label: string;
  value: string;
  min?: string; // ISO
  onChange: (iso: string) => void;
  variant?: "card" | "embedded";
  className?: string;

  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  // ✅ Portal mount (prevents "fixed" being trapped by parent stacking contexts)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ✅ support controlled/uncontrolled open
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? !!open : uncontrolledOpen;

  const setIsOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (!isControlled) setUncontrolledOpen(v);
  };

  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = useMemo(() => {
    const parsed = min ? fromISO(min) : null;
    return startOfDay(parsed ?? today);
  }, [min, today]);

  const selected = useMemo(() => fromISO(value), [value]);

  const [view, setView] = useState(() => {
    const base = selected ?? today;
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  useEffect(() => {
    if (!isOpen) return;
    const base = selected ?? today;
    setView({ y: base.getFullYear(), m: base.getMonth() });
  }, [isOpen, selected, today]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // ✅ Optional: stop background scrolling while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const cells = useMemo(() => buildMonth(view.y, view.m), [view.y, view.m]);
  const display = value ? formatDisplay(value) : "mm/dd/yyyy";

  const pick = (d: Date) => {
    onChange(toISO(d));
    setIsOpen(false);
  };

  const gotoPrev = () => {
    const next = new Date(view.y, view.m - 1, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  };

  const gotoNext = () => {
    const next = new Date(view.y, view.m + 1, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const Trigger = (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      aria-label={label}
      className={cn(
        "w-full text-left select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-inset",
        className,
      )}
    >
      <div className="h-14 rounded-2xl px-4 flex items-center bg-primary/6 border border-primary/12">
        <span
          className={cn(
            "text-[15px] font-semibold",
            value ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {display}
        </span>
      </div>
    </button>
  );

  const Overlay = (
    <div
      className={cn(
        // ✅ super high z-index so it always sits above swap button etc.
        "fixed inset-0 z-[9999] transition-all duration-300 ease-app",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300 ease-app",
        )}
        onClick={() => setIsOpen(false)}
      />

      <div className="absolute inset-0 grid place-items-center p-4">
        <Surface className="w-full max-w-[360px] overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border/70">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-10 w-10 rounded-2xl grid place-items-center hover:bg-primary/10 transition-all duration-300 ease-app active:scale-[0.98]"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <p className="text-sm font-extrabold tracking-tight">
                {monthLabel(view.y, view.m)}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={gotoPrev}
                  className="h-10 w-10 rounded-2xl grid place-items-center hover:bg-primary/10 transition-all duration-300 ease-app active:scale-[0.98]"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4 text-primary" />
                </button>
                <button
                  type="button"
                  onClick={gotoNext}
                  className="h-10 w-10 rounded-2xl grid place-items-center hover:bg-primary/10 transition-all duration-300 ease-app active:scale-[0.98]"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => pick(today)}
                className="h-10 rounded-2xl font-extrabold text-sm bg-primary/12 border border-primary/20 text-primary hover:bg-primary/16 transition-all duration-300 ease-app active:scale-[0.98]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() =>
                  pick(
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate() + 1,
                    ),
                  )
                }
                className="h-10 rounded-2xl font-extrabold text-sm bg-card/70 border border-border/70 text-foreground/80 hover:bg-primary/7 transition-all duration-300 ease-app active:scale-[0.98]"
              >
                Tomorrow
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 text-[11px] font-semibold text-muted-foreground">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={`${d}-${i}`} className="text-center">
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-2">
              {cells.map((c, idx) => {
                if (!c.day) return <div key={idx} className="h-10" />;

                const date = new Date(view.y, view.m, c.day);
                const day = startOfDay(date);
                const disabled = isBefore(day, minDate);
                const isToday = isSameDay(day, today);
                const isSelected = selected
                  ? isSameDay(day, startOfDay(selected))
                  : false;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    onClick={() => pick(day)}
                    className={cn(
                      "h-10 rounded-2xl text-sm font-extrabold",
                      "transition-all duration-200 ease-app active:scale-[0.98]",
                      disabled
                        ? "text-muted-foreground/35"
                        : "hover:bg-primary/10",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-[0_16px_34px_-26px_rgba(6,78,59,0.65)]"
                        : "bg-card/70 border border-border/70",
                      isToday && !isSelected && "ring-2 ring-primary/25",
                    )}
                  >
                    {c.day}
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-12 w-full rounded-2xl font-extrabold tracking-tight bg-primary text-primary-foreground shadow-[0_20px_44px_-34px_rgba(6,78,59,0.70)] transition-all duration-300 ease-app active:scale-[0.99]"
              >
                Done
              </button>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );

  return (
    <>
      {variant === "card" ? (
        <Surface
          interactive
          className={cn("p-4 cursor-pointer select-none", className)}
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold tracking-tight">{label}</p>
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">{Trigger}</div>
        </Surface>
      ) : (
        Trigger
      )}

      {/* ✅ Render overlay via portal so it covers the whole viewport always */}
      {mounted ? createPortal(Overlay, document.body) : null}
    </>
  );
}

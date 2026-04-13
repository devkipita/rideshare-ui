"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Clock3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "../ui-parts";

const QUICK_TIMES = [
  { label: "Morning", value: "08:00" },
  { label: "Noon", value: "12:00" },
  { label: "Evening", value: "17:00" },
];

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function isTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function formatDisplay(value: string) {
  if (!isTime(value)) return "hh:mm";
  const [hours, minutes] = value.split(":").map(Number);
  const dt = new Date(2026, 0, 1, hours, minutes);
  return dt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildSlots() {
  const slots: string[] = [];
  for (let hour = 5; hour <= 22; hour += 1) {
    slots.push(`${pad2(hour)}:00`);
    slots.push(`${pad2(hour)}:30`);
  }
  return slots;
}

export function TimePickerCard({
  label,
  value,
  onChange,
  variant = "card",
  className,
  open,
  onOpenChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  variant?: "card" | "embedded";
  className?: string;
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? !!open : uncontrolledOpen;

  const setIsOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (!isControlled) setUncontrolledOpen(next);
  };

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const slots = useMemo(buildSlots, []);
  const display = formatDisplay(value);

  const pick = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

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
        "fixed inset-0 z-[9999] transition-all duration-300 ease-app",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300 ease-app"
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

              <p className="text-sm font-extrabold tracking-tight">{label}</p>

              <div className="h-10 w-10 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15">
                <Clock3 className="h-4 w-4 text-primary" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {QUICK_TIMES.map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => pick(time.value)}
                  className={cn(
                    "h-10 rounded-2xl font-extrabold text-sm border transition-all duration-300 ease-app active:scale-[0.98]",
                    value === time.value
                      ? "bg-primary text-primary-foreground border-primary/60"
                      : "bg-card/70 border-border/70 text-foreground/80 hover:bg-primary/7",
                  )}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 max-h-[292px] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {slots.map((slot) => {
                const selected = value === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => pick(slot)}
                    className={cn(
                      "h-10 rounded-2xl text-sm font-extrabold",
                      "transition-all duration-200 ease-app active:scale-[0.98]",
                      selected
                        ? "bg-primary text-primary-foreground shadow-[0_16px_34px_-26px_rgba(6,78,59,0.65)]"
                        : "bg-card/70 border border-border/70 hover:bg-primary/10",
                    )}
                  >
                    {formatDisplay(slot)}
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
            <Clock3 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3">{Trigger}</div>
        </Surface>
      ) : (
        Trigger
      )}

      {mounted ? createPortal(Overlay, document.body) : null}
    </>
  );
}

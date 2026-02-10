"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import type { LucideIcon } from "lucide-react";
import { MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppBackdrop({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-dvh text-foreground", className)}>
      <div className="app-backdrop min-h-dvh">
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

type SurfaceTone = "base" | "raised" | "sheet" | "panel";

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  tone?: SurfaceTone;
  elevated?: boolean;
  focusRing?: boolean;
};

export function Surface({
  children,
  className,
  interactive,
  tone = "base",
  elevated,
  focusRing,
  ...divProps
}: SurfaceProps) {
  const toneClass =
    tone === "sheet" || tone === "panel"
      ? "bg-card/85 border-border/70"
      : tone === "raised"
        ? "bg-card/80 border-border/70"
        : "bg-card/80 border-border/70";

  return (
    <div
      {...divProps}
      className={cn(
        "relative rounded-3xl border backdrop-blur-xl",
        toneClass,
        elevated
          ? "shadow-[0_18px_44px_-34px_rgba(6,78,59,0.30)] dark:shadow-[0_18px_54px_-40px_rgba(0,0,0,0.85)]"
          : "shadow-[0_12px_30px_-34px_rgba(6,78,59,0.18)] dark:shadow-[0_14px_40px_-38px_rgba(0,0,0,0.80)]",
        "transition-all duration-300 ease-app",
        interactive &&
          "hover:-translate-y-[1px] hover:shadow-[0_26px_62px_-48px_rgba(6,78,59,0.35)] active:translate-y-0 active:scale-[0.99]",
        focusRing
          ? "focus-within:ring-2 focus-within:ring-primary/25 focus-within:ring-inset focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-inset"
          : "",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-70 bg-gradient-to-b from-primary/8 via-transparent to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function FormDivider() {
  return <div className="h-px bg-border/70" />;
}

export function ClearBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "touch-target h-11 w-11 rounded-2xl grid place-items-center",
        "transition-all duration-300 ease-app hover:bg-primary/10 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
      )}
      aria-label="Clear"
    >
      <X className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

export function PillButton({
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
      className={cn(
        "h-12 rounded-2xl px-3 text-sm font-extrabold tracking-tight",
        "border transition-all duration-300 ease-app active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-[0_16px_32px_-26px_rgba(6,78,59,0.65)]"
          : "bg-card/70 border-border/70 text-foreground/80 hover:bg-primary/7",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ChipToggle({
  active,
  label,
  icon: Icon,
  onClick,
  size = "md",
}: {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-11" : "h-12";
  const text = size === "sm" ? "text-[13px]" : "text-sm";
  const pad = size === "sm" ? "px-2.5" : "px-3";

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        h,
        "w-full rounded-2xl border",
        pad,
        "flex items-center justify-center gap-2",
        "transition-all duration-300 ease-app active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-[0_16px_32px_-26px_rgba(6,78,59,0.65)]"
          : "bg-card/70 border-border/70 text-foreground/80 hover:bg-primary/7",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          active ? "text-primary-foreground" : "text-primary",
        )}
      />
      <span className={cn(text, "font-extrabold tracking-tight")}>{label}</span>
    </button>
  );
}

export function LocationInput({
  id,
  label,
  value,
  placeholder,
  suggestions,
  onChange,
  onSelect,
  onClear,
  compact,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  suggestions: string[];
  onChange: (v: string) => void;
  onSelect: (v: string) => void;
  onClear: () => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listId = useMemo(() => `${id}-list`, [id]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const has = suggestions.length > 0;

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            compact ? "h-10 w-10" : "h-11 w-11",
            "rounded-2xl grid place-items-center bg-primary/10 border border-primary/15",
          )}
        >
          <MapPin className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground">
            {label}
          </p>
          <input
            ref={inputRef}
            value={value}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={(e) => {
              if (!has) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
                setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                onSelect(suggestions[activeIndex]);
                setOpen(false);
                inputRef.current?.blur();
              }
              if (e.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
              }
            }}
            aria-expanded={open}
            aria-controls={listId}
            className={cn(
              compact ? "h-7" : "h-8",
              "w-full bg-transparent outline-none",
              "text-[15px] font-extrabold tracking-tight text-foreground",
              "placeholder:text-muted-foreground/80",
            )}
          />
        </div>

        {value ? <ClearBtn onClick={onClear} /> : <div className="w-11" />}
      </div>

      {open && has ? (
        <div className="absolute z-40 w-full mt-2">
          <Surface elevated className="p-2 max-h-64 overflow-auto">
            <div id={listId} role="listbox" className="space-y-1">
              {suggestions.map((town, idx) => (
                <button
                  key={town}
                  type="button"
                  role="option"
                  aria-selected={idx === activeIndex}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onSelect(town);
                    setOpen(false);
                    inputRef.current?.blur();
                  }}
                  className={cn(
                    "w-full rounded-2xl px-3 py-3 text-left",
                    "transition-all duration-200 ease-app active:scale-[0.99]",
                    idx === activeIndex
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/8",
                  )}
                >
                  <span className="text-sm font-extrabold tracking-tight">
                    {town}
                  </span>
                </button>
              ))}
            </div>
          </Surface>
        </div>
      ) : null}
    </div>
  );
}

export function BottomSheet({
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
  const startY = useRef<number | null>(null);
  const lastY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
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
    <div className={cn("md:hidden", open ? "" : "pointer-events-none")}>
      <div
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300 ease-app",
          open ? "bg-black/45" : "bg-transparent",
        )}
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
        <div className="px-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
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
            <div className="px-3 pb-3 max-h-[78vh] overflow-auto">
              {children}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
export function ShimmerCard() {
  return (
    <Surface className="p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded-xl bg-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
          </div>
          <div className="h-3 w-44 rounded-xl bg-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
          </div>
        </div>
        <div className="h-4 w-20 rounded-xl bg-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
        </div>
      </div>
    </Surface>
  );
}

export function MapPreview({ from, to }: { from: string; to: string }) {
  const left = from?.trim()?.[0]?.toUpperCase() || "A";
  const right = to?.trim()?.[0]?.toUpperCase() || "B";

  return (
    <Surface className="p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground">
            Route preview
          </p>
          <p className="mt-1 text-sm font-extrabold tracking-tight truncate">
            {from || "—"} <span className="text-primary">→</span> {to || "—"}
          </p>
        </div>
        <div className="h-11 w-11 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="mt-3 h-[96px] rounded-2xl border border-primary/12 bg-gradient-to-br from-primary/14 via-card/70 to-transparent overflow-hidden relative">
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,rgba(6,78,59,0.14)_1px,transparent_0)] dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] [background-size:14px_14px]" />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-[0_14px_34px_-26px_rgba(6,78,59,0.70)]">
          <span className="text-[12px] font-extrabold">{left}</span>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-[0_14px_34px_-26px_rgba(6,78,59,0.70)]">
          <span className="text-[12px] font-extrabold">{right}</span>
        </div>
        <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-[2px] bg-primary/25" />
      </div>
    </Surface>
  );
}

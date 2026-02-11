"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import type { LucideIcon } from "lucide-react";
import { Check, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export function AppBackdrop({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-dvh text-foreground", className)}>
      <div className="min-h-dvh">
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
      {...divProps}
      className={cn(
        "relative rounded-3xl border",
        "supports-[backdrop-filter]:backdrop-blur-xl",
        toneClass,
        shadowClass,
        "transition-all duration-300",
        EASE,
        interactive &&
          cn(
            "hover:-translate-y-[1px]",
            "hover:shadow-[0_26px_62px_-48px_color-mix(in_oklch,var(--primary)_32%,transparent)]",
            "active:translate-y-0 active:scale-[0.99]",
          ),
        focusRing
          ? "focus-within:ring-2 focus-within:ring-primary/45 focus-within:ring-inset"
          : "",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-55 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
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
        "touch-target h-11 w-11 rounded-full grid place-items-center",
        "transition-all duration-300",
        EASE,
        "hover:bg-primary/10 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
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
        "h-11 rounded-full px-4",
        "inline-flex items-center justify-center gap-2",
        "text-[13px] font-semibold tracking-tight",
        "border transition-all duration-300",
        EASE,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
        "active:scale-[0.99]",
        active
          ? cn(
              "bg-primary text-primary-foreground border-primary/60",
              "shadow-[0_18px_44px_-34px_color-mix(in_oklch,var(--primary)_40%,transparent)]",
            )
          : cn(
              "bg-card/70 border-border/70 text-foreground/85",
              "hover:bg-primary/10 hover:border-primary/20",
            ),
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
  size = "sm",
  className,
}: {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const isSm = size === "sm";

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      data-active={active ? "true" : "false"}
      className={cn(
        isSm ? "h-10 px-3" : "h-[44px] px-3.5",
        "inline-flex w-auto items-center gap-2",
        "rounded-full border",
        "transition-all duration-300",
        EASE,
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(var(--ring)/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? cn(
              "border-[oklch(var(--ring)/0.30)]",
              "bg-[oklch(var(--ring)/0.14)] dark:bg-[oklch(var(--ring)/0.18)]",
              "shadow-[0_14px_32px_-26px_oklch(var(--ring)/0.45)]",
            )
          : cn(
              "border-border/70 bg-card/75 text-foreground",
              "hover:bg-primary/8 hover:border-primary/20",
              "hover:shadow-[0_14px_32px_-28px_color-mix(in_oklch,var(--primary)_18%,transparent)]",
            ),
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          isSm ? "h-8 w-8" : "h-9 w-9",
          "grid shrink-0 place-items-center rounded-full border",
          "transition-all duration-300",
          EASE,
          active
            ? "bg-[oklch(var(--ring)/0.16)] border-[oklch(var(--ring)/0.28)]"
            : "bg-primary/10 border-primary/15",
        )}
      >
        <Icon
          className={cn(
            isSm ? "h-[18px] w-[18px]" : "h-5 w-5",
            "transition-transform duration-300",
            EASE,
            active ? "text-[oklch(var(--ring))]" : "text-primary",
          )}
          strokeWidth={2.2}
        />
      </span>

      <span
        className={cn(
          isSm ? "text-[13px]" : "text-[14px]",
          "font-semibold tracking-tight leading-none",
          "whitespace-nowrap",
          active ? "text-[oklch(var(--ring))]" : "text-foreground/85",
        )}
      >
        {label}
      </span>

      {active ? (
        <span className="ml-1 inline-flex items-center">
          <Check
            className="h-4 w-4 text-[oklch(var(--ring))]"
            strokeWidth={2.6}
          />
        </span>
      ) : null}
    </button>
  );
}

function highlightMatch(text: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return <>{text}</>;

  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return <>{text}</>;

  const a = text.slice(0, i);
  const b = text.slice(i, i + q.length);
  const c = text.slice(i + q.length);

  return (
    <>
      {a}
      <span className="text-primary font-semibold">{b}</span>
      {c}
    </>
  );
}

type Placement = "top" | "bottom";

export function LocationInput({
  id,
  label,
  value,
  placeholder,
  suggestions,
  fallbackSuggestions = [],
  minChars = 1,
  placement = "bottom",
  onChange,
  onSelect,
  onClear,
  compact,
  rightSlot,
  nextFocusId,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  suggestions: string[];
  fallbackSuggestions?: string[];
  minChars?: number;
  placement?: Placement;
  onChange: (v: string) => void;
  onSelect: (v: string) => void;
  onClear: () => void;
  compact?: boolean;
  rightSlot?: React.ReactNode;
  nextFocusId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{
    left: number;
    top: number;
    width: number;
    place: Placement;
  }>({
    left: 0,
    top: 0,
    width: 0,
    place: placement,
  });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const q = value.trim();
  const canQuery = q.length >= minChars;

  const items =
    q && canQuery && suggestions.length > 0
      ? suggestions
      : q
        ? fallbackSuggestions
        : [];

  const hasItems = items.length > 0;

  const listId = useMemo(() => `${id}-list`, [id]);
  const state = open ? "open" : "closed";

  const focusNext = () => {
    if (!nextFocusId) return;
    window.setTimeout(() => {
      const el = document.getElementById(
        nextFocusId,
      ) as HTMLInputElement | null;
      el?.focus();
      el?.select?.();
    }, 0);
  };

  useEffect(() => {
    if (!q) {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    setOpen(hasItems);
  }, [q, hasItems]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!open && mounted) {
      const t = window.setTimeout(() => setMounted(false), 160);
      return () => window.clearTimeout(t);
    }
  }, [open, mounted]);

  const measure = () => {
    const el = wrapRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const gap = 10;
    const maxH = 264;
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;

    let nextPlace: Placement = placement;
    if (
      placement === "bottom" &&
      spaceBelow < maxH + gap &&
      spaceAbove > spaceBelow
    )
      nextPlace = "top";
    if (
      placement === "top" &&
      spaceAbove < maxH + gap &&
      spaceBelow > spaceAbove
    )
      nextPlace = "bottom";

    const top = nextPlace === "bottom" ? r.bottom + gap : r.top - gap;

    setPos({
      left: Math.max(10, Math.min(r.left, window.innerWidth - r.width - 10)),
      top,
      width: r.width,
      place: nextPlace,
    });
  };

  useEffect(() => {
    if (!mounted) return;
    measure();

    const onResize = () => measure();
    const onScroll = () => measure();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [mounted, placement, value]);

  useEffect(() => {
    if (!mounted) return;

    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      const inWrap = !!wrapRef.current?.contains(t);
      const inPop = !!popRef.current?.contains(t);
      if (!inWrap && !inPop) setOpen(false);
    };

    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [mounted]);

  const commitSelect = (town: string) => {
    onSelect(town);
    setOpen(false);
    inputRef.current?.blur();
    focusNext();
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            compact ? "h-10 w-10" : "h-11 w-11",
            "rounded-2xl grid place-items-center",
            "bg-primary/10 border border-primary/15",
            "shadow-[0_10px_24px_-20px_color-mix(in_oklch,var(--primary)_22%,transparent)]",
          )}
        >
          <MapPin className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">
            {label}
          </p>

          <input
            id={id}
            ref={inputRef}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              onChange(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                setOpen(false);
                return;
              }

              if (!hasItems) return;

              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, items.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter") {
                if (activeIndex >= 0) {
                  e.preventDefault();
                  commitSelect(items[activeIndex]);
                }
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
              "text-[15px] font-semibold tracking-tight text-foreground",
              "placeholder:text-muted-foreground/80",
            )}
          />
        </div>

        {rightSlot ? rightSlot : null}

        {!value ? null : (
          <ClearBtn
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
          />
        )}
      </div>

      {mounted && hasItems && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popRef}
              style={{
                position: "fixed",
                left: pos.left,
                top: pos.top,
                width: pos.width,
                zIndex: 9999,
                transform:
                  pos.place === "top" ? "translateY(-100%)" : undefined,
              }}
              data-state={state}
              className={cn(
                "rounded-[26px] border border-border/70",
                "bg-[color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]",
                "supports-[backdrop-filter]:backdrop-blur-xl",
                "shadow-[0_28px_90px_-70px_color-mix(in_oklch,var(--primary)_55%,transparent)] dark:shadow-[0_34px_120px_-86px_rgba(0,0,0,0.92)]",
                "overflow-hidden",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-1",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-1",
              )}
            >
              <div className="px-3 pt-2.5 pb-2 flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Suggestions
                </p>
                <p className="text-[11px] text-muted-foreground/80">
                  Enter to select
                </p>
              </div>

              <div className="max-h-[264px] overflow-y-auto px-2 pb-2 overscroll-contain">
                <div id={listId} role="listbox" className="space-y-1.5">
                  {items.map((town, idx) => (
                    <button
                      key={`${town}-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={idx === activeIndex}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => commitSelect(town)}
                      className={cn(
                        "w-full text-left rounded-full px-4 py-3",
                        "transition-all duration-200",
                        EASE,
                        "active:scale-[0.99]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                        idx === activeIndex
                          ? "bg-primary/14 border border-primary/18 shadow-[0_18px_44px_-34px_color-mix(in_oklch,var(--primary)_32%,transparent)]"
                          : "border border-transparent hover:bg-primary/10 hover:border-primary/14",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-medium tracking-tight">
                          {highlightMatch(town, q)}
                        </p>
                        <span className="text-[11px] text-muted-foreground/70">
                          Select
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
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
          "fixed inset-0 z-40 transition-all duration-300",
          EASE,
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
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_oklch,var(--primary)_18%,transparent)_1px,transparent_0)] dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] [background-size:14px_14px]" />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-[0_14px_34px_-26px_color-mix(in_oklch,var(--primary)_52%,transparent)]">
          <span className="text-[12px] font-extrabold">{left}</span>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 h-9 w-9 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-[0_14px_34px_-26px_color-mix(in_oklch,var(--primary)_52%,transparent)]">
          <span className="text-[12px] font-extrabold">{right}</span>
        </div>
        <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-[2px] bg-primary/25" />
      </div>
    </Surface>
  );
}

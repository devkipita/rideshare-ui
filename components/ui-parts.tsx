"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Check, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
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
  type,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type ?? "button"}
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
        isSm ? "h-10 pr-3" : "h-[44px] pr-3.5",
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
  icon: Icon = MapPin,
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
  icon?: any;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({
    left: 0,
    top: 0,
    width: 0,
    place: placement as Placement,
  });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const q = (value ?? "").trim();
  const canQuery = q.length >= minChars;

  const items =
    q && canQuery && suggestions.length > 0
      ? suggestions
      : q
      ? fallbackSuggestions
      : [];

  const hasItems = items.length > 0;
  const listId = useMemo(() => `${id}-list`, [id]);

  /* ---------------- helpers ---------------- */

  const clearSelection = () => {
    const el = inputRef.current;
    if (!el) return;
    const end = el.value.length;
    el.setSelectionRange(end, end);
    window.getSelection?.()?.removeAllRanges?.();
  };

  const focusNext = () => {
    if (!nextFocusId) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(nextFocusId) as HTMLInputElement | null;
      if (!el) return;
      el.focus();
      const end = el.value.length;
      el.setSelectionRange(end, end);
    });
  };

  const commitSelect = (town: string) => {
    onSelect(town);
    setOpen(false);
    setActiveIndex(-1);

    requestAnimationFrame(() => {
      clearSelection();
      inputRef.current?.blur();
      focusNext();
    });
  };

  /* ---------------- open / close logic ---------------- */

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

  /* ---------------- positioning ---------------- */

  const measure = () => {
    const el = wrapRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const gap = 10;
    const maxH = 264;

    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;

    let place: Placement = placement;
    if (placement === "bottom" && spaceBelow < maxH && spaceAbove > spaceBelow)
      place = "top";
    if (placement === "top" && spaceAbove < maxH && spaceBelow > spaceAbove)
      place = "bottom";

    setPos({
      left: r.left,
      top: place === "bottom" ? r.bottom + gap : r.top - gap,
      width: r.width,
      place,
    });
  };

  useEffect(() => {
    if (!mounted) return;
    measure();

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [mounted, value]);

  /* ---------------- outside click ---------------- */

  useEffect(() => {
    if (!mounted) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (
        !wrapRef.current?.contains(t) &&
        !popRef.current?.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [mounted]);

  /* ---------------- render ---------------- */

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            compact ? "h-10 w-10" : "h-11 w-11",
            "rounded-2xl grid place-items-center",
            "bg-primary/10 border border-primary/15",
          )}
        >
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">
            {label}
          </p>

          <input
            ref={inputRef}
            value={value ?? ""}
            placeholder={placeholder}
            onChange={(e) => {
              onChange(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={(e) => {
              if (!hasItems) return;

              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, items.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                commitSelect(items[activeIndex]);
              }
              if (e.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
              }
            }}
            className={cn(
              compact ? "h-7" : "h-8",
              "w-full bg-transparent outline-none",
              "text-[15px] font-semibold tracking-tight",
              "placeholder:text-muted-foreground/80",
            )}
          />
        </div>

        {rightSlot}
        {value && (
          <button
            type="button"
            onClick={() => {
              onClear();
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="text-muted-foreground px-1"
          >
            ×
          </button>
        )}
      </div>

      {mounted && hasItems
        ? createPortal(
            <div
              ref={popRef}
              style={{
                position: "fixed",
                left: pos.left,
                top: pos.top,
                width: pos.width,
                transform:
                  pos.place === "top" ? "translateY(-100%)" : undefined,
                zIndex: 9999,
              }}
              className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl"
            >
              <div className="max-h-[264px] overflow-y-auto p-2">
                {items.map((town, idx) => (
                  <button
                    key={town + idx}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => commitSelect(town)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-full",
                      idx === activeIndex
                        ? "bg-primary/15"
                        : "hover:bg-primary/10",
                    )}
                  >
                    {town}
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

let sheetLockCount = 0;
function lockScroll() {
  sheetLockCount++;
  if (sheetLockCount === 1) document.body.style.overflow = "hidden";
}
function unlockScroll() {
  sheetLockCount = Math.max(0, sheetLockCount - 1);
  if (sheetLockCount === 0) document.body.style.overflow = "";
}

export function BottomSheet({
  open,
  title,
  onOpenChange,
  children,
  headerRight,
  zIndex,
}: {
  open: boolean;
  title?: string;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  zIndex?: { backdrop: number; sheet: number };
}) {
  const startY = useRef<number | null>(null);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const canDrag = useRef(false);

  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const sheetMaxH = useMemo(() => "min(75vh, calc(100dvh - 84px))", []);

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
      lastT.current = 0;
      velocity.current = 0;
      canDrag.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => unlockScroll();
  }, [open]);

  const closeByGesture = (dy: number, v: number) => {
    const distanceOk = dy > 110;
    const flickOk = v > 0.75 && dy > 24;
    if (distanceOk || flickOk) onOpenChange(false);
    else setDragY(0);
  };

  const onPointerDownHandle = (e: React.PointerEvent) => {
    if (!open) return;
    setDragging(true);
    startY.current = e.clientY;
    lastY.current = 0;
    lastT.current = performance.now();
    velocity.current = 0;
    canDrag.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const pendingDrag = useRef<{ pointerId: number; y: number; target: HTMLElement } | null>(null);
  const DRAG_THRESHOLD = 6; // px before we commit to a drag

  const onPointerDownSheet = (e: React.PointerEvent) => {
    if (!open) return;

    const sc = scrollRef.current;
    const atTop = !sc || sc.scrollTop <= 0;
    if (!atTop) return;

    const target = e.target as HTMLElement | null;
    const el = target?.closest?.("[data-sheet-drag-handle]");
    if (el) return;

    // Don't capture immediately — wait for movement past threshold
    // so clicks on buttons/links still fire
    const interactive = target?.closest?.("button, a, input, textarea, select, [role=button], [data-no-drag]");
    if (interactive) {
      // Store pending drag info — only start drag if user moves enough
      pendingDrag.current = { pointerId: e.pointerId, y: e.clientY, target: e.currentTarget as HTMLElement };
      return;
    }

    setDragging(true);
    startY.current = e.clientY;
    lastY.current = 0;
    lastT.current = performance.now();
    velocity.current = 0;
    canDrag.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    // Check if we have a pending drag that should now be promoted
    if (pendingDrag.current && startY.current == null) {
      const dy = e.clientY - pendingDrag.current.y;
      if (Math.abs(dy) >= DRAG_THRESHOLD && dy > 0) {
        // Promote to drag
        setDragging(true);
        startY.current = pendingDrag.current.y;
        lastY.current = Math.max(0, dy);
        lastT.current = performance.now();
        velocity.current = 0;
        canDrag.current = true;
        pendingDrag.current.target.setPointerCapture?.(e.pointerId);
        pendingDrag.current = null;
        setDragY(Math.max(0, dy));
        return;
      }
      return;
    }

    if (!dragging || startY.current == null || !canDrag.current) return;

    const sc = scrollRef.current;
    const atTop = !sc || sc.scrollTop <= 0;

    const rawDy = e.clientY - startY.current;
    const dy = Math.max(0, rawDy);

    if (!atTop && dy > 0) {
      canDrag.current = false;
      setDragging(false);
      startY.current = null;
      lastY.current = 0;
      lastT.current = 0;
      velocity.current = 0;
      setDragY(0);
      return;
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastT.current);
    const dv = (dy - lastY.current) / dt;
    velocity.current = dv;

    lastY.current = dy;
    lastT.current = now;

    setDragY(dy);
  };

  const onPointerUp = () => {
    pendingDrag.current = null;

    if (!dragging) return;

    const dy = lastY.current;
    const v = velocity.current;

    setDragging(false);
    startY.current = null;
    lastY.current = 0;
    lastT.current = 0;

    closeByGesture(dy, v);
    canDrag.current = false;
  };

  const zBackdrop = zIndex?.backdrop ?? 40;
  const zSheet = zIndex?.sheet ?? 50;

  return (
    <div className={cn("md:hidden", open ? "" : "pointer-events-none")}>
      <div
        className={cn(
          "fixed inset-0 transition-opacity duration-300",
          EASE,
          open ? "opacity-100 bg-black/45" : "opacity-0 bg-transparent",
        )}
        style={{ zIndex: zBackdrop }}
        onClick={() => onOpenChange(false)}
      />

      <div
        className="fixed left-0 right-0 bottom-0"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Bottom sheet"}
        style={{
          zIndex: zSheet,
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: dragging
            ? "none"
            : "transform 320ms cubic-bezier(0.22,1,0.36,1)",
          touchAction: "none",
        }}
        onPointerDown={onPointerDownSheet}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="w-full pb-[env(safe-area-inset-bottom)]">
          <Surface
            elevated
            className="w-full overflow-hidden rounded-t-3xl rounded-b-none"
          >
            <div className="px-2 pt-3 pb-2">
              <div
                data-sheet-drag-handle
                className="mx-auto h-1.5 w-12 rounded-full bg-primary/20"
                onPointerDown={onPointerDownHandle}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ touchAction: "none" }}
              />

              {title || headerRight ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  {title ? (
                    <p className="text-sm font-extrabold tracking-tight">
                      {title}
                    </p>
                  ) : (
                    <span />
                  )}

                  {headerRight ? (
                    headerRight
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      aria-label="Close"
                      className="grid h-9 w-9 place-items-center rounded-2xl border border-border/70 bg-card/70 text-foreground/80 active:scale-[0.99]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <div
              ref={scrollRef}
              className="px-1 pb-3 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
              style={{ maxHeight: sheetMaxH }}
            >
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
    <Surface className="p-2 sm:p-4">
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

/* ── Shared small components ─────────────────────────── */

export function UserAvatar({
  name,
  src,
  verified,
  size = 44,
  shape = "circle",
}: {
  name: string;
  src?: string;
  verified?: boolean;
  size?: number;
  shape?: "circle" | "rounded";
}) {
  const borderRadius = shape === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(
          "grid place-items-center overflow-hidden border-2 border-primary/50 bg-primary/10 text-primary",
          borderRadius,
        )}
        style={{ width: size, height: size }}
        aria-label={`Avatar for ${name}`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-sm font-extrabold">{initials(name)}</span>
        )}
      </div>

      {verified ? (
        <div
          className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"
          aria-label="Verified"
          title="Verified"
        >
          <BadgeCheck className="h-3.5 w-3.5" />
        </div>
      ) : null}
    </div>
  );
}

export function SectionHeader({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <p className="text-xs font-extrabold tracking-[0.22em] text-primary/90">
        {title.toUpperCase()}
      </p>
      {typeof count === "number" ? (
        <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {count}
        </div>
      ) : null}
      <div className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
    </div>
  );
}

export function Tag({
  icon,
  label,
  tone = "muted",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "muted" | "primary";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border",
        "supports-[backdrop-filter]:backdrop-blur-xl",
        tone === "primary"
          ? "bg-primary/14 border-primary/20 text-primary"
          : "bg-card/70 border-border/70 text-foreground/80",
      )}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 border border-primary/15 text-primary">
        {icon}
      </span>
      <span className="leading-none">{label}</span>
    </div>
  );
}

export function MetricPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3 py-2 text-xs font-semibold text-foreground/85">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 border border-primary/15 text-primary">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

export function Chip({
  icon: Icon,
  children,
  tone = "neutral",
  className,
}: {
  icon?: React.ElementType;
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "soft";
  className?: string;
}) {
  const toneClass =
    tone === "primary"
      ? "border-primary/15 bg-primary/10 text-primary"
      : tone === "soft"
        ? "border-border/70 bg-muted/60 text-foreground/80"
        : "border-border/70 bg-card/70 text-foreground/85";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "border text-[12px] font-semibold tracking-tight",
        toneClass,
        className,
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={2.3} /> : null}
      {children}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-[color-mix(in_oklch,var(--muted)_70%,var(--card)_30%)] px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-11 w-11 place-items-center rounded-2xl border border-border/70 bg-card/70">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-extrabold tracking-tight">{title}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export { EASE };

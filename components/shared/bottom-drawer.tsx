"use client";

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui-parts";

interface BottomDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function BottomDrawer({
  open,
  onOpenChange,
  title,
  children,
  headerRight,
}: BottomDrawerProps) {
  const startY = useRef<number | null>(null);
  const lastY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) {
      setDragY(0);
      setDragging(false);
      startY.current = null;
      lastY.current = 0;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
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
    setDragging(false);
    if (lastY.current > 100) onOpenChange(false);
    else setDragY(0);
    startY.current = null;
    lastY.current = 0;
  };

  return (
    <div className={cn(open ? "" : "pointer-events-none")}>
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300",
          open ? "opacity-100 bg-black/45" : "opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />

      <div
        className="fixed left-0 right-0 bottom-0 z-50"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Drawer"}
        style={{
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: dragging
            ? "none"
            : "transform 320ms cubic-bezier(0.22,1,0.36,1)",
          touchAction: "none",
        }}
      >
        <div className="w-full pb-[env(safe-area-inset-bottom)]">
          <Surface elevated className="w-full overflow-hidden rounded-t-3xl rounded-b-none">
            <div className="px-4 pt-3 pb-2">
              <div
                className="mx-auto h-1.5 w-12 rounded-full bg-primary/20"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ touchAction: "none" }}
              />

              {(title || headerRight) && (
                <div className="mt-3 flex items-center justify-between gap-3">
                  {title ? (
                    <p className="text-sm font-extrabold tracking-tight">{title}</p>
                  ) : <span />}

                  {headerRight ?? (
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
              )}
            </div>

            <div className="px-3 pb-3 overflow-y-auto overscroll-contain max-h-[75vh]">
              {children}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

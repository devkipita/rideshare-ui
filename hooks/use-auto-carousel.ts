import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/utils";

interface UseAutoCarouselOptions {
  count: number;
  enabled: boolean;
  intervalMs?: number;
  pauseMsAfterInteract?: number;
}

export function useAutoCarousel({
  count,
  enabled,
  intervalMs = 4200,
  pauseMsAfterInteract = 2400,
}: UseAutoCarouselOptions) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const isDraggingRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const pauseNow = useCallback(() => {
    pauseUntilRef.current = Date.now() + pauseMsAfterInteract;
  }, [pauseMsAfterInteract]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const el = scrollerRef.current;
      if (!el) return;
      const i = clamp(index, 0, Math.max(0, count - 1));
      const child = el.children.item(i) as HTMLElement | null;
      if (!child) return;
      pauseNow();
      el.scrollTo({ left: child.offsetLeft, behavior });
    },
    [count, pauseNow],
  );

  const onPointerDown = useCallback(() => { isDraggingRef.current = true; pauseNow(); }, [pauseNow]);
  const onPointerUp = useCallback(() => { isDraggingRef.current = false; pauseNow(); }, [pauseNow]);

  const computeActive = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || count <= 1) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children.item(i) as HTMLElement | null;
      if (!child) continue;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - center);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    }
    setActive(bestIdx);
  }, [count]);

  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      computeActive();
    });
  }, [computeActive]);

  useEffect(() => {
    if (!enabled || count <= 1) return;
    const id = window.setInterval(() => {
      if (isDraggingRef.current) return;
      if (Date.now() < pauseUntilRef.current) return;
      const next = (active + 1) % count;
      scrollToIndex(next, "smooth");
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, count, intervalMs, active, scrollToIndex]);

  useEffect(() => { return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }; }, []);
  useEffect(() => { computeActive(); }, [computeActive]);

  return { scrollerRef, active, scrollToIndex, onPointerDown, onPointerUp, onScroll };
}

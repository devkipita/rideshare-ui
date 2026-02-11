"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

export const CarouselDots = memo(function CarouselDots({
  count,
  index,
  onSelect,
  className,
}: {
  count: number;
  index: number;
  onSelect: (i: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("mt-3 flex items-center justify-center gap-1.5", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
            i === index
              ? "bg-primary w-5"
              : "bg-muted-foreground/30 hover:bg-muted-foreground/45"
          )}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === index ? "true" : undefined}
        />
      ))}
    </div>
  );
});

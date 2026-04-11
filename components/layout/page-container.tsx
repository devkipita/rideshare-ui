"use client";

import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative flex-1 w-full overflow-y-auto overflow-x-hidden",
        "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        "pt-[calc(max(8px,env(safe-area-inset-top))+60px)]",
        "pb-[calc(80px+env(safe-area-inset-bottom))]",
        "px-2.5",
        className,
      )}
    >
      <div className="w-full space-y-4">{children}</div>
    </main>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui-parts";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Surface tone="panel" className={cn("p-6 text-center", className)}>
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 border border-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-2.5 text-[15px] font-extrabold">{title}</p>
      <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{desc}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 h-10 px-5 rounded-full bg-primary text-primary-foreground text-[13px] font-extrabold active:scale-[0.98] transition"
        >
          {action.label}
        </button>
      )}
    </Surface>
  );
}

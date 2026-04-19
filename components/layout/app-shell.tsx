"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordRoute } from "@/hooks/use-back-navigation";
import { BottomNavbar } from "./bottom-navbar";
import { PageContainer } from "./page-container";
import { TopNavbar } from "./top-navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    recordRoute(pathname);
  }, [pathname]);

  return (
    <div
      className={cn(
        "fixed inset-0 isolate mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden text-foreground",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-background"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[230px] rounded-b-[40px] bg-[color-mix(in_srgb,var(--primary)_14%,var(--background))] bg-cover bg-center bg-no-repeat shadow-[0_28px_56px_-44px_color-mix(in_srgb,var(--primary)_70%,transparent)]"
        style={{ backgroundImage: "url('/bgOne.svg')" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[230px] rounded-b-[40px] bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--background)_34%,transparent),color-mix(in_srgb,var(--background)_12%,transparent))]"
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-[204px] h-16",
          "bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--primary)_10%,transparent),transparent)]",
          "dark:bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--primary)_18%,transparent),transparent)]",
        )}
      />

      <div className="relative z-10 flex h-full flex-col">
        <TopNavbar />
        <PageContainer>{children}</PageContainer>
        <BottomNavbar />
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { BottomNavbar } from "./bottom-navbar";
import { PageContainer } from "./page-container";
import { TopNavbar } from "./top-navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "fixed inset-0 isolate mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden text-foreground",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[rgb(var(--shell-canvas))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[230px] rounded-b-[40px] bg-[rgb(var(--shell-top))] shadow-[0_28px_56px_-44px_rgba(4,37,29,0.82)]"
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-[204px] h-16",
          "bg-[linear-gradient(to_bottom,rgba(11,90,70,0.10),transparent)]",
          "dark:bg-[linear-gradient(to_bottom,rgba(7,47,38,0.28),transparent)]",
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

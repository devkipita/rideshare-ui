"use client";

import { useOptionalRole } from "@/app/context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useBackNavigation } from "@/hooks/use-back-navigation";
import { useAppPreferences } from "@/hooks/use-app-preferences";

function AppLogo() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-8 w-[150px]">
        <Image
          src="/Kipita Logo v3-08.svg"
          alt="Kipita"
          fill
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
}

function RoleChip() {
  const role = useOptionalRole();
  if (!role) return null;

  return (
    <button
      type="button"
      onClick={role.toggleRole}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "text-[10px] font-bold uppercase tracking-wider",
        "border transition-all duration-200 active:scale-[0.97]",
        role.activeRole === "passenger"
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400",
      )}
      aria-label={`Switch to ${role.activeRole === "passenger" ? "driver" : "passenger"} mode`}
    >
      <ArrowLeftRight className="h-3 w-3" />
      <span>{role.activeRole === "passenger" ? "Rider" : "Driver"}</span>
    </button>
  );
}

export function TopNavbar({
  onBack,
  className,
}: {
  onBack?: () => void;
  className?: string;
}) {
  const { goBack } = useBackNavigation();
  const { isDark, toggleTheme } = useAppPreferences();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    goBack();
  };

  return (
    <header
      className={cn(
        "absolute inset-x-0 top-0 z-50",
        "pointer-events-none",
        className,
      )}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-md px-2.5 pt-[max(8px,env(safe-area-inset-top))]">
        <div
          className={cn(
            "relative isolate",
            "h-12 rounded-full px-2",
            "flex items-center justify-between",
            "border border-black/8 supports-[backdrop-filter]:backdrop-blur-xl",
            "bg-[rgb(var(--shell-bar)/0.96)]",
            "shadow-[0_22px_44px_-34px_rgba(4,37,29,0.34)]",
            "dark:border-white/10 dark:bg-[rgb(var(--shell-bar)/0.9)]",
            "dark:shadow-[0_22px_52px_-40px_rgba(0,0,0,0.78)]",
          )}
        >
          {/* Left: back + role chip */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10 rounded-full hover:bg-primary/10 active:scale-[0.98] transition-all duration-300"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <RoleChip />
          </div>

          {/* Center: logo */}
          <AppLogo />

          {/* Right: theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-full hover:bg-primary/10 active:scale-[0.98] transition-all duration-300"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

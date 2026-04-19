"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useBackNavigation } from "@/hooks/use-back-navigation";
import { useAppPreferences } from "@/hooks/use-app-preferences";

function AppLogo() {
  return (
    <div className="pointer-events-none ml-0.5 flex min-w-0 items-center">
      <div className="relative h-8 w-[24px]">
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
            "flex items-center",
            "border border-border/70 supports-[backdrop-filter]:backdrop-blur-[24px]",
            "bg-[color-mix(in_srgb,var(--card)_80%,transparent)]",
            "shadow-[0_22px_44px_-34px_color-mix(in_srgb,var(--primary)_34%,transparent)]",
            "dark:shadow-[0_22px_52px_-40px_rgba(0,0,0,0.78)]",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-11 w-11 rounded-full hover:bg-primary/10 active:scale-[0.98] transition-all duration-300"
            aria-label="Back"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2.8} />
          </Button>

          <AppLogo />

          <div className="flex-1" />

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

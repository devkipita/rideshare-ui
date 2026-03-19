"use client";

import { useOptionalRole } from "@/app/context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun, ArrowLeftRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

type TopNavProps = {
  variant: "default" | "chat";
  onBack?: () => void;
  className?: string;
  title?: string;
  user?: { name: string; role: string };
};

function readInitialTheme() {
  const saved =
    typeof window !== "undefined" ? localStorage.getItem("theme") : null;
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return typeof document !== "undefined"
    ? document.documentElement.classList.contains("dark")
    : false;
}

function AppLogo() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-8 w-[150px] sm:h-9 sm:w-[180px] md:h-10 md:w-[200px]">
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

function RoleToggle() {
  const role = useOptionalRole();
  if (!role) return null;

  return (
    <button
      type="button"
      onClick={role.toggleRole}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
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

export function TopNav(props: TopNavProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => setIsDark(readInitialTheme()), []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = !html.classList.contains("dark");
    html.classList.toggle("dark", next);
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleBack = () => {
    if (props.onBack) {
      props.onBack();
      return;
    }
    router.back();
  };

  return (
    <header className={cn("sticky top-0 z-50 bg-transparent", props.className)}>
      <div className="bg-transparent pt-[max(8px,env(safe-area-inset-top))]">
        <div className="mx-auto max-w-screen-sm px-2 bg-transparent">
          <div
            className={cn(
              "relative isolate",
              "h-12 sm:h-13",
              "rounded-full",
              "px-2 sm:px-2.5",
              "flex items-center justify-between",
              "border",
              "supports-[backdrop-filter]:backdrop-blur-xl",
              "bg-white/70 border-border/60",
              "shadow-[0_18px_50px_-44px_rgba(6,78,59,0.55)]",
              "dark:bg-[rgba(8,20,16,0.72)]",
              "dark:border-white/10",
              "dark:shadow-[0_22px_70px_-58px_rgba(0,0,0,0.85)]",
            )}
          >
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-primary/10 via-transparent to-transparent" />

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className={cn(
                  "h-10 w-10 rounded-full",
                  "hover:bg-primary/10 active:scale-[0.98]",
                  "transition-all duration-300 ease-app",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                )}
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <RoleToggle />
            </div>

            <AppLogo />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                "h-10 w-10 rounded-full",
                "hover:bg-primary/10 active:scale-[0.98]",
                "transition-all duration-300 ease-app",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
              )}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-6 w-6" />
              ) : (
                <Moon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {props.variant === "default" && props.title ? (
          <p className="text-center text-[13px] font-semibold text-white/90">
            {props.title}
          </p>
        ) : null}
      </div>
    </header>
  );
}

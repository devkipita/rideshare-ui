"use client";

import { useOptionalAppMode } from "@/app/context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

type TopNavBase = {
  onBack?: () => void;
  className?: string;
};

type TopNavProps =
  | ({ variant: "default"; title?: string } & TopNavBase)
  | ({ variant: "chat"; user: { name: string; role: string } } & TopNavBase);

type NavSnapshot = {
  mode?: string;
  activeTab?: string;
  searchResults?: boolean;
  selectedRide?: unknown;
};

const SNAP_KEY = "kipita_nav_snapshot";

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

function readSnapshot(): NavSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SNAP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NavSnapshot;
  } catch {
    return null;
  }
}

function emitRestore(s: NavSnapshot) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent("kipita:restore", { detail: s }));
  } catch {}
}

export function TopNav(props: TopNavProps) {
  const appMode = useOptionalAppMode();
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

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    const snap = readSnapshot();

    if (snap) emitRestore(snap);

    if (snap?.mode && appMode?.setMode) {
      if (snap.mode !== "splash") appMode.setMode(snap.mode as any);
      else appMode.setMode("passenger" as any);
      return;
    }

    if (appMode?.mode && appMode?.setMode) {
      if (appMode.mode === "splash") appMode.setMode("passenger" as any);
      else appMode.setMode(appMode.mode as any);
      return;
    }

    router.push("/");
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

        {props.variant === "default" ? (
            <p className="text-center text-[13px] font-semibold text-white/90">
              {props.title}
            </p>
        ) : null}
      </div>
    </header>
  );
}

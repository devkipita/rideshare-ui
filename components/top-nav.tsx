"use client";

import { useAppMode } from "@/app/context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type TopNavBase = {
  onBack?: () => void;
  className?: string;
};

type TopNavProps =
  | ({ variant: "default"; title: string } & TopNavBase)
  | ({ variant: "chat"; user: { name: string; role: string } } & TopNavBase);

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
      {/* no background, just the SVG */}
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

export function TopNav(props: TopNavProps) {
  const { setMode } = useAppMode();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(readInitialTheme());
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = !html.classList.contains("dark");
    html.classList.toggle("dark", next);
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleBack = () => {
    if (props.onBack) props.onBack();
    else setMode("splash");
  };

  return (
    <header className={cn("sticky top-0 z-50", props.className)}>
      <div className="pt-[max(8px,env(safe-area-inset-top))]">
        <div className="mx-auto max-w-screen-sm px-2">
          <div
            className={cn(
              "glass rounded-4xl",
              "h-12 sm:h-13",
              "px-2 sm:px-2.5",
              "relative flex items-center justify-between",
              "shadow-[0_18px_50px_-44px_rgba(6,78,59,0.55)]",
              "dark:shadow-[0_22px_70px_-58px_rgba(0,0,0,0.85)]",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className={cn(
                "h-10 w-10 rounded-xl",
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
                "h-10 w-10 rounded-xl",
                "hover:bg-primary/10 active:scale-[0.98]",
                "transition-all duration-300 ease-app",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
              )}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-7 w-7" /> : <Moon className="h-7 w-7" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

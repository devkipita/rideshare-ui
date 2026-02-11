"use client";

import { useAppMode } from "@/app/context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TopNavBase = {
  onBack?: () => void;
  className?: string;
};

type TopNavProps =
  | ({ variant: "default"; title: string } & TopNavBase)
  | ({ variant: "chat"; user: { name: string; role: string } } & TopNavBase);

function readInitialTheme() {
  // Prefer persisted theme if present, else reflect current class
  const saved =
    typeof window !== "undefined" ? localStorage.getItem("theme") : null;
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return typeof document !== "undefined"
    ? document.documentElement.classList.contains("dark")
    : false;
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

  const title = useMemo(() => {
    if (props.variant === "default") return props.title;
    return props.user.name;
  }, [props]);

  return (
    <header className={cn("sticky top-0 z-50", props.className)}>
      {/* subtle top padding + safe area */}
      <div className="pt-[max(8px,env(safe-area-inset-top))]">
        <div className="mx-auto max-w-screen-sm px-2">
          <div
            className={cn(
              // “cooler” glass + elevation + crisp border (M3-ish)
              "glass rounded-4xl",
              "h-12 sm:h-13",
              "px-2 sm:px-2.5",
              "flex items-center gap-2",
              "shadow-[0_18px_50px_-44px_rgba(6,78,59,0.55)]",
              "dark:shadow-[0_22px_70px_-58px_rgba(0,0,0,0.85)]",
            )}
          >
            {/* Back */}
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

            {/* Center */}
            <div className="min-w-0 flex-1">
              {props.variant === "default" ? (
                <div className="text-center">
                  <p className="text-[14px] sm:text-[15px] font-semibold tracking-tight truncate">
                    {title}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-2xl grid place-items-center",
                      "bg-primary/12 border border-primary/18",
                      "shadow-[0_10px_22px_-18px_rgba(6,78,59,0.25)]",
                    )}
                    aria-hidden="true"
                  >
                    <User className="h-4 w-4 text-primary" />
                  </div>

                  <div className="min-w-0 leading-tight">
                    <p className="text-[14px] font-semibold tracking-tight truncate">
                      {props.user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {props.user.role}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Theme */}
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
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* optional: tiny spacer so content doesn’t feel glued */}
          <div className="h-2" />
        </div>
      </div>
    </header>
  );
}

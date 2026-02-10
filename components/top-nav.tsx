"use client";

import { useAppMode } from "@/app/context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TopNavBase = {
  onBack?: () => void;
};

type TopNavProps =
  | ({ variant: "default"; title: string } & TopNavBase)
  | ({ variant: "chat"; user: { name: string; role: string } } & TopNavBase);

export function TopNav(props: TopNavProps) {
  const { setMode } = useAppMode();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    setIsDark(html.classList.contains("dark"));
    localStorage.setItem(
      "theme",
      html.classList.contains("dark") ? "dark" : "light",
    );
  };

  const handleBack = () => {
    if (props.onBack) props.onBack();
    else setMode("splash");
  };

  return (
    <div className="sticky top-0 z-50 pt-2">
      <div className="max-w-screen-sm mx-auto px-2">
        <div
          className={cn(
            "glass-card rounded-3xl h-14 px-2.5",
            "flex items-center justify-between gap-2",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full h-11 w-11"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {props.variant === "default" && (
            <h1 className="text-[15px] sm:text-base font-extrabold tracking-tight flex-1 text-center truncate">
              {props.title}
            </h1>
          )}

          {props.variant === "chat" && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-sm font-extrabold tracking-tight truncate">
                  {props.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {props.user.role}
                </p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-11 w-11"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

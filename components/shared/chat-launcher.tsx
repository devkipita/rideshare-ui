"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatLauncherProps {
  onOpen: () => void;
  unreadCount?: number;
}

export function ChatLauncher({ onOpen, unreadCount = 0 }: ChatLauncherProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "fixed bottom-24 right-4 z-30",
        "grid h-14 w-14 place-items-center rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-[0_18px_44px_-20px_oklch(var(--primary)/0.65)]",
        "hover:brightness-[1.05] active:scale-[0.95]",
        "transition-all duration-300",
      )}
      aria-label="Open chat"
    >
      <MessageCircle className="h-6 w-6" />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

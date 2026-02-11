"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function useTypewriter(text: string, speed = 22, startDelay = 180) {
  const [out, setOut] = useState("");

  useEffect(() => {
    let i = 0;
    let mounted = true;

    const start = window.setTimeout(() => {
      const tick = () => {
        if (!mounted) return;
        i += 1;
        setOut(text.slice(0, i));
        if (i < text.length) window.setTimeout(tick, speed);
      };
      tick();
    }, startDelay);

    return () => {
      mounted = false;
      window.clearTimeout(start);
    };
  }, [text, speed, startDelay]);

  return out;
}

function Caret({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "ml-0.5 inline-block h-[1em] w-[2px] align-[-2px]",
        "bg-primary/80",
        "animate-[blink_1s_steps(1,end)_infinite]",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function HeroTyping() {
  const greeting = "Hi 👋";
  const full = "Let’s find you great rides today.";
  const typed = useTypewriter(full, 18, 220);

  const withAccent = useMemo(() => {
    const key = "today";
    const i = typed.toLowerCase().lastIndexOf(key);
    if (i < 0) return <>{typed}</>;

    const a = typed.slice(0, i);
    const b = typed.slice(i, i + key.length);
    const c = typed.slice(i + key.length);

    return (
      <>
        {a}
        <span className="text-primary">{b}</span>
        {c}
      </>
    );
  }, [typed]);

  const done = typed.length >= full.length;

  return (
    <div className="px-4">
      <p className="text-[12px] font-medium text-muted-foreground">
        {greeting}
      </p>

      <p className="mt-1 text-[18px] font-semibold leading-tight tracking-tight">
        {withAccent}
        {!done ? <Caret /> : null}
      </p>

      <style jsx global>{`
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

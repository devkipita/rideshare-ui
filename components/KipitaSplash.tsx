"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, ChevronRight, ShieldCheck, Navigation } from "lucide-react";
import { useAppMode } from "@/app/context";

// --- ANIMATION UTILS ---

// Premium "overshoot" easing for the logo entrance
const backOut =
  (s = 1.6) =>
  (p: number) =>
    1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2);

// Standard smooth easing for UI elements (cubic-bezier)
const easeOutCubic: [number, number, number, number] = [0.33, 1, 0.68, 1];

declare global {
  interface Window {
    __kipita_intro_start?: number;
  }
}

/**
 * Mobile-First Selection Card
 * Optimized for touch targets (min 44px) and visual feedback
 */
function SelectionCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  delay,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: easeOutCubic }}
      onClick={onClick}
      className="group relative w-full text-left p-4 sm:p-5 rounded-[1.5rem] bg-white border border-slate-100 hover:border-emerald-400 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-emerald-900/5 overflow-hidden"
    >
      {/* Subtle hover background fill */}
      <div className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/30 transition-colors duration-300" />

      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300">
          <Icon size={26} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0 py-1">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-emerald-950 truncate">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-tight truncate font-medium">
            {subtitle}
          </p>
        </div>

        <ChevronRight
          size={20}
          className="text-slate-300 group-hover:text-emerald-600 transition-colors transform group-hover:translate-x-1"
        />
      </div>
    </motion.button>
  );
}

/**
 * Internal Splash Screen Logic
 */
export function SplashScreen() {
  const { setMode } = useAppMode();
  const reduceMotion = useReducedMotion();

  // --- TIMING CONFIGURATION ---
  const REVEAL_DELAY_MS = 1800; // Time before UI reveals

  // --- STATE MANAGEMENT ---
  const initialPhase = useMemo<"enter" | "reveal">(() => {
    if (typeof window === "undefined") return "enter";
    const start = window.__kipita_intro_start;
    if (!start) return "enter";
    return performance.now() - start >= REVEAL_DELAY_MS ? "reveal" : "enter";
  }, []);

  const [phase, setPhase] = useState<"enter" | "reveal">(initialPhase);

  // --- ANIMATION LOOP ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const start = window.__kipita_intro_start ?? performance.now();
    window.__kipita_intro_start = start;

    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      if (reduceMotion || elapsed >= REVEAL_DELAY_MS) {
        setPhase("reveal");
        return;
      }
      setPhase("enter");
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  // --- MOTION VARIANTS ---
  const pieces = useMemo(
    () => ({
      stem: {
        initial: { x: -280, y: -280, opacity: 0 },
        animate: { x: 0, y: 0, opacity: 1 },
      },
      roadLeft: {
        initial: { x: -280, y: 280, opacity: 0 },
        animate: { x: 0, y: 0, opacity: 1 },
      },
      roadRight: {
        initial: { x: 280, y: 280, opacity: 0 },
        animate: { x: 0, y: 0, opacity: 1 },
      },
      leaf: {
        initial: { x: 280, y: -280, opacity: 0 },
        animate: { x: 0, y: 0, opacity: 1 },
      },
    }),
    [],
  );

  const enterTransition = (delay: number) => ({
    duration: 1.2,
    ease: backOut(1.4), // Custom overshoot function
    delay,
  });

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#F8FAF8] flex flex-col items-center">
      {/* 1. GLOBAL STYLES (Performance Optimized) */}
      <style jsx global>{`
        @keyframes kipitaDash {
          to {
            stroke-dashoffset: -260;
          }
        }
        .kipita-roadDash {
          animation: kipitaDash 1s linear infinite;
        }
        /* Disable text selection for app-like feel */
        .no-select {
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>

      {/* 2. AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-emerald-50/20" />
        {/* Subtle decorative blob - Static blur is cheaper than animated filter */}
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-100/30 rounded-full blur-[80px]" />
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-[100dvh] px-6 py-4 no-select overflow-y-auto">
        {/* --- LOGO SECTION --- 
            We use layout-based motion instead of absolute positioning 
            to ensure that siblings (Action Area) respect the logo's space.
        */}
        <motion.div
          className="flex-shrink-0 flex flex-col items-center justify-center"
          layout
          initial={{ marginTop: "30dvh", scale: 1.1 }}
          animate={{
            marginTop: phase === "reveal" ? "8dvh" : "30dvh",
            scale: phase === "reveal" ? 1 : 1.1,
          }}
          transition={{
            type: "spring",
            stiffness: 45,
            damping: 15,
            mass: 1.2,
          }}
        >
          {/* Logo Wrapper with Glow */}
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-emerald-400/10 rounded-full blur-2xl" />

            <div className="w-32 h-32 sm:w-40 sm:h-40 relative">
              <svg
                viewBox="0 0 500 500"
                className="w-full h-full drop-shadow-lg"
              >
                <motion.path
                  d="M125.35,26.53c38.88-4.44,70.3,25.14,72.86,63.3,4.26,63.33-49.67,189.9-103.5,225.83-9.08,6.06-21.56,12.39-25.8-2.02l.25-233.03c4.73-27.23,28.55-50.92,56.18-54.08Z"
                  fill="#064e3b"
                  initial={pieces.stem.initial}
                  animate={pieces.stem.animate}
                  transition={enterTransition(0)}
                />
                <motion.path
                  d="M261.16,254.51l-32.94,18.23c-51.27,33.64-60.02,82.29-41.52,138.91,4.69,14.36,17.05,31.16,13.06,45.29-3.68,3.75-51.5,5.61-56.75,3.11-9.07-4.32-6.57-43.12-13.59-51-22.63-7.93-5.08,44.69-12.25,50.37-3.4,2.69-38.06,3.49-44.33,3.07-11.37-.77-18.32-.09-18.16-13.46.3-25.54,18.4-65.95,32.84-87,40.97-59.68,104.53-91.3,173.62-107.52Z"
                  fill="#064e3b"
                  initial={pieces.roadLeft.initial}
                  animate={pieces.roadLeft.animate}
                  transition={enterTransition(0.08)}
                />
                <motion.path
                  d="M317.89,243.48l-.78,3.17,3.91.76c-23.14,10.1-54.79,23.95-40.23,54.4,13.46,28.16,96.36,82.61,124.45,107.1,8.81,7.68,40.22,34.38,40.05,44.89-.19,11.78-24.78,15.05-33.91,16.3-31.79,4.34-75,5.07-106.88,1.75-10.46-1.09-18.49-4.3-26.01-11.8-19.45-19.39-57.82-76.91-65.72-102.82-21.55-70.68,48.97-100.85,105.11-113.74Z"
                  fill="#064e3b"
                  initial={pieces.roadRight.initial}
                  animate={pieces.roadRight.animate}
                  transition={enterTransition(0.16)}
                />
                <motion.g
                  animate={phase === "reveal" ? { y: [0, -4, 0] } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.path
                    d="M188.72,262.36l1.63-5.44c48.15-33.31,126.05-120.2,191.11-93.58,20.1,8.22,25.14,28.95,7.19,43-21.3,16.68-90.79,26.57-120.27,34.1-26.67,6.8-52.77,15.97-79.66,21.92Z"
                    fill="#9ec5a2"
                    initial={pieces.leaf.initial}
                    animate={pieces.leaf.animate}
                    transition={enterTransition(0.24)}
                  />
                </motion.g>

                {/* Road Lines - Only appear in Reveal phase */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === "reveal" ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <path
                    d="M205 285 Q 165 310 150 400"
                    fill="none"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="30 20"
                    className={phase === "reveal" ? "kipita-roadDash" : ""}
                  />
                  <path
                    d="M260 290 Q 285 330 365 410"
                    fill="none"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="30 20"
                    className={phase === "reveal" ? "kipita-roadDash" : ""}
                  />
                </motion.g>
              </svg>
            </div>
          </div>

          {/* Wordmark - Optimized Size */}
          <motion.div
            className="mt-4 w-32 sm:w-40"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === "reveal" ? 1 : 0,
              y: phase === "reveal" ? 0 : 10,
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <KipitaWordmarkSvg />
          </motion.div>
        </motion.div>

        {/* --- ACTION AREA --- 
            Now follows naturally in the flex flow. 
            The space-y-8 ensures proper padding between elements.
        */}
        <div className="flex-1 flex flex-col mt-8">
          <AnimatePresence>
            {phase === "reveal" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: easeOutCubic }}
                className="space-y-8 pb-12"
              >
                {/* HEADLINE BLOCK */}
                <div className="space-y-4 text-center sm:text-left">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest border border-emerald-200/50"
                  >
                    <ShieldCheck size={12} strokeWidth={2.5} />
                    <span>Ride-Share-Connect</span>
                  </motion.div>

                  <div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-emerald-950 leading-[0.9]">
                      Share the <span className="text-emerald-600">Ride .</span>{" "}
                      Save <span className="text-emerald-600">More</span>
                    </h1>

                    <p className="text-slate-500 font-medium text-sm sm:text-base mt-4 leading-relaxed max-w-[90%] mx-auto sm:mx-0">
                      Connect with neighbors heading your way and save on every
                      trip.
                    </p>
                  </div>
                </div>

                {/* CARDS BLOCK */}
                <div className="space-y-3">
                  <SelectionCard
                    icon={Search}
                    title="I need a ride"
                    subtitle="Find a seat nearby"
                    delay={0.4}
                    onClick={() => setMode("passenger")}
                  />
                  <SelectionCard
                    icon={Navigation}
                    title="I'm driving"
                    subtitle="Post your empty seats"
                    delay={0.5}
                    onClick={() => setMode("driver")}
                  />
                </div>

                {/* FOOTER LINK */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center"
                >
                  <button className="text-xs sm:text-sm font-semibold text-emerald-900/50 hover:text-emerald-800 transition-colors py-2">
                    Already have an account?{" "}
                    <span className="underline decoration-emerald-900/20 underline-offset-2">
                      Log in
                    </span>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LOADING INDICATOR (Only during entrance) */}
        <AnimatePresence>
          {phase === "enter" && (
            <motion.div
              exit={{ opacity: 0 }}
              className="absolute bottom-12 left-0 right-0 flex justify-center space-x-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-900/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Wordmark SVG - Pure presentation */
function KipitaWordmarkSvg() {
  return (
    <svg
      viewBox="0 0 500 120"
      className="w-full h-auto drop-shadow-sm"
      aria-hidden="true"
    >
      <defs>
        <style>{`
          .cls-1{fill:#2f6c4f;font-family:Inter,sans-serif;font-size:38px;font-weight:600;}
          .cls-3{fill:#1a2e26;}
        `}</style>
      </defs>
      <g transform="translate(0, -180)">
        <path
          className="cls-3"
          d="M218.95,286.59v-23.37c7.86,3.68,16.37,4.45,23.37-1.53,7.03-6.01,8.05-16.47,2.15-23.69-11.15-13.63-31.36-5.23-32.31,11.36l-.1,64.46-19.86,18.88c-.05-2.72-.82-5.6-.94-8.27-1.07-22.55-1.45-53.29.03-75.65,3.66-55.25,79.45-48.25,78.11.64-.72,26.29-25.63,42.33-50.45,37.17Z"
        />
        <path
          className="cls-3"
          d="M430.47,210.96v76.25h-20.91v-39.66c0-2.61-3.1-7.82-4.91-9.85-8.23-9.25-24.72-7.63-29.84,4.01-7.56,17.19,13.74,31.64,27.98,20.91v23.98c-11.95,1.58-22.22,1.32-32.54-5.28-31.45-20.12-18.99-68.64,18.68-70.99,4.33-.27,7.89.87,11.71.91,9.9.09,19.91-.62,29.82-.27Z"
        />
        <path
          className="cls-3"
          d="M332.09,196.2v12.61c0,.33.95,1.37.61,2.15h15.37v20.91h-15.37c-1.27,13.25,1.1,28.18,15.37,32.59v22.75c-14.24-3.78-26.94-13.52-32.7-27.25-1.21-2.89-3.58-10.14-3.58-13.02v-50.73h20.29Z"
        />
        <path
          className="cls-3"
          d="M151.31,210.96c.28,1.19-.43,1.18-1.04,1.73-22.71,20.7-44.94,42.04-67.82,62.53-3.92,3.51-8.29,7.94-12.92,10.14v-27.36l51.96-47.04h29.82Z"
        />
        <rect
          className="cls-3"
          x="159.3"
          y="210.96"
          width="21.52"
          height="72.56"
        />
        <rect
          className="cls-3"
          x="279.21"
          y="210.96"
          width="21.52"
          height="72.56"
        />
        <polygon
          className="cls-3"
          points="90.43 167.3 90.43 231.55 69.53 250.31 69.53 167.3 90.43 167.3"
        />
        <polygon
          className="cls-3"
          points="151.31 283.51 122.72 283.51 103.36 264.14 118.41 250.32 151.31 283.51"
        />
        <path
          className="cls-3"
          d="M286.42,179.12c21.09-3.89,20.28,27.22,1.23,24.3-14.02-2.15-13.04-22.13-1.23-24.3Z"
        />
        <path
          className="cls-3"
          d="M179.38,199.67c-11.15,11.99-30.13-5.43-18.26-17.34,11.23-11.27,29.52,5.23,18.26,17.34Z"
        />
      </g>
    </svg>
  );
}

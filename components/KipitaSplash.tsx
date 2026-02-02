"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

type KipitaSplashProps = {
  onHandoffStart: () => void; // called once when icon starts moving to header
  onFinish: () => void;       // called once when splash should unmount
};

type EaseFn = (p: number) => number;
const linear: EaseFn = (p) => p;
const easeOutCubic: EaseFn = (p) => 1 - Math.pow(1 - p, 3);
const easeInOutCubic: EaseFn = (p) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

const backOut = (s = 1.55): EaseFn => (p) =>
  1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2);

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function useViewport() {
  const [vp, setVp] = React.useState({ w: 390, h: 844 });
  React.useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vp;
}

// Must match HomeScreen header target placement
const HEADER_PAD = 16;
const HEADER_SIZE = 44;
const SPLASH_ICON_SIZE = 180;

// Timeline (ms)
const T_ASSEMBLE_END = 1050;
const T_MOVE_START = 1800;
const T_END = 2550;

declare global {
  interface Window {
    __kipitaSplashStart?: number;
    __kipitaSplashDone?: boolean;
  }
}

export function KipitaSplash({ onHandoffStart, onFinish }: KipitaSplashProps) {
  const reduceMotion = useReducedMotion();
  const { w, h } = useViewport();

  // 0 assemble, 1 idle, 2 moving
  const [phase, setPhase] = React.useState<0 | 1 | 2>(0);

  const didHandoffRef = React.useRef(false);
  const didFinishRef = React.useRef(false);

  const finalScale = HEADER_SIZE / SPLASH_ICON_SIZE;

  // centered coordinate system -> header target
  const xTo = clamp(-w / 2 + HEADER_PAD + HEADER_SIZE / 2, -9999, 0);
  const yTo = clamp(-h / 2 + HEADER_PAD + HEADER_SIZE / 2, -9999, 0);

  const fireHandoffOnce = React.useCallback(() => {
    if (didHandoffRef.current) return;
    didHandoffRef.current = true;
    onHandoffStart();
  }, [onHandoffStart]);

  const finishOnce = React.useCallback(() => {
    if (didFinishRef.current) return;
    didFinishRef.current = true;
    if (typeof window !== "undefined") window.__kipitaSplashDone = true;
    onFinish();
  }, [onFinish]);

  // ✅ Key fix: continue timeline across dev remounts (no “plays twice”)
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.__kipitaSplashDone) {
      // already finished this session
      fireHandoffOnce();
      setPhase(2);
      // unmount immediately
      requestAnimationFrame(() => finishOnce());
      return;
    }

    const start = window.__kipitaSplashStart ?? performance.now();
    window.__kipitaSplashStart = start;

    const now = performance.now();
    const elapsed = now - start;

    // Pick correct phase based on elapsed time
    const nextPhase: 0 | 1 | 2 =
      reduceMotion || elapsed >= T_MOVE_START ? 2 : elapsed >= T_ASSEMBLE_END ? 1 : 0;

    setPhase(nextPhase);

    if (reduceMotion) {
      fireHandoffOnce();
      // short finish
      const t = window.setTimeout(() => finishOnce(), 220);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];

    // schedule transitions with remaining time
    if (elapsed < T_ASSEMBLE_END) {
      timers.push(
        window.setTimeout(() => setPhase(1), Math.max(0, T_ASSEMBLE_END - elapsed)),
      );
    }

    if (elapsed < T_MOVE_START) {
      timers.push(
        window.setTimeout(() => {
          fireHandoffOnce();
          setPhase(2);
        }, Math.max(0, T_MOVE_START - elapsed)),
      );
    } else {
      // already past move start
      fireHandoffOnce();
      setPhase(2);
    }

    // hard stop at end
    if (elapsed < T_END) {
      timers.push(window.setTimeout(() => finishOnce(), Math.max(0, T_END - elapsed)));
    } else {
      finishOnce();
    }

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduceMotion, fireHandoffOnce, finishOnce]);

  // Tap to skip
  const skip = () => {
    if (typeof window !== "undefined" && !window.__kipitaSplashStart) {
      window.__kipitaSplashStart = performance.now() - T_MOVE_START;
    }
    fireHandoffOnce();
    setPhase(2);
  };

  const bgAnim =
    phase === 2
      ? { opacity: 0, transition: { duration: 0.42, ease: easeOutCubic } }
      : { opacity: 1, transition: { duration: 0.22, ease: easeOutCubic } };

  const moverAnim =
    phase === 2
      ? {
          x: xTo,
          y: yTo,
          scale: finalScale,
          transition: { duration: 0.72, ease: easeOutCubic },
        }
      : { x: 0, y: 0, scale: 1, transition: { duration: 0.25, ease: easeOutCubic } };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onPointerDown={skip}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18, ease: easeOutCubic } }}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Splash background */}
      <motion.div
        className="absolute inset-0"
        animate={bgAnim}
        style={{
          background:
            "radial-gradient(900px 640px at 50% 40%, rgba(158,197,162,0.18), rgba(255,255,255,1) 60%, rgba(255,255,255,1) 100%)",
        }}
      />

      {/* Ambient pulse (idle only) */}
      {!reduceMotion && (
        <motion.div
          className="absolute"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            phase === 1
              ? { opacity: [0.2, 0.55, 0.2], scale: [1, 1.04, 1] }
              : { opacity: 0, scale: 0.95 }
          }
          transition={
            phase === 1
              ? { duration: 2.0, repeat: Infinity, ease: easeInOutCubic }
              : { duration: 0.22, ease: easeOutCubic }
          }
          style={{
            width: 520,
            height: 520,
            borderRadius: 9999,
            background:
              "radial-gradient(circle at 50% 50%, rgba(158,197,162,0.20), rgba(158,197,162,0.07) 35%, rgba(158,197,162,0) 70%)",
          }}
        />
      )}

      {/* Center anchor */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Mover */}
        <motion.div
          animate={moverAnim}
          onAnimationComplete={() => {
            // extra safety: if phase is 2 and mover completed, finish
            if (phase === 2) finishOnce();
          }}
          style={{ willChange: "transform" }}
        >
          <div className="flex flex-col items-center gap-3 select-none">
            {/* ✅ ICON ONLY (shared layoutId) */}
            <KipitaIconAssemble phase={phase} reduceMotion={!!reduceMotion} />

            {/* ✅ WORDMARK + SLOGAN (NOT shared layout) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={
                phase === 2
                  ? { opacity: 0, y: 10, transition: { duration: 0.15, ease: easeOutCubic } }
                  : { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOutCubic, delay: 0.08 } }
              }
              className="text-center"
            >
              {/* Use text for reliability (recommended) */}
              <div className="text-[34px] font-semibold tracking-tight text-foreground leading-none">
                kipita
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Ride. Share. Connect.
              </div>

              {/* If you insist on the full SVG wordmark instead, swap with:
                  <KipitaWordmarkSvg />
              */}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** ICON SVG (the K leaf mark) — shared layoutId = "kipita-icon" */
function KipitaIconAssemble({
  phase,
  reduceMotion,
}: {
  phase: 0 | 1 | 2;
  reduceMotion: boolean;
}) {
  const parts = [
    { delay: 0.0, from: { x: -140, y: 0, rotate: -10 } }, // stem
    { delay: 0.08, from: { x: 0, y: 140, rotate: 8 } }, // road base
    { delay: 0.16, from: { x: 120, y: 120, rotate: 10 } }, // road cluster
    { delay: 0.28, from: { x: 160, y: -60, rotate: -12 } }, // leaf last
  ] as const;

  const enter = (delay: number) => ({
    duration: 0.9,
    ease: backOut(1.55),
    delay,
  });

  const dash =
    !reduceMotion && phase === 1
      ? {
          strokeDashoffset: [0, -240],
          transition: { duration: 1.15, repeat: Infinity, ease: linear },
        }
      : { strokeDashoffset: 0 };

  const leafFloat =
    !reduceMotion && phase === 1
      ? { y: [0, -5, 0, 5, 0], transition: { duration: 2.4, repeat: Infinity, ease: easeInOutCubic } }
      : { y: 0 };

  const leafMaskAnim =
    phase === 0
      ? { width: 0, transition: { duration: 0.01 } }
      : { width: 500, transition: { duration: 0.55, ease: easeOutCubic, delay: 0.35 } };

  return (
    <motion.svg
      layoutId="kipita-icon"
      width={SPLASH_ICON_SIZE}
      height={SPLASH_ICON_SIZE}
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: phase >= 1 ? "drop-shadow(0 10px 20px rgba(0,0,0,0.10))" : "none" }}
    >
      <defs>
        <mask id="leafRevealMask">
          <rect x="0" y="0" width="500" height="500" fill="black" />
          <motion.rect x="0" y="0" height="500" fill="white" initial={{ width: 0 }} animate={leafMaskAnim} />
        </mask>
      </defs>

      <motion.path
        fill="#2f6c4f"
        d="M125.35,26.53c38.88-4.44,70.3,25.14,72.86,63.3,4.26,63.33-49.67,189.9-103.5,225.83-9.08,6.06-21.56,12.39-25.8-2.02l.25-233.03c4.73-27.23,28.55-50.92,56.18-54.08Z"
        initial={{ opacity: 0, scale: 0.88, ...parts[0].from }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0, transition: enter(parts[0].delay) }}
      />

      <motion.path
        fill="#2f6c4f"
        d="M317.89,243.48l-.78,3.17,3.91.76c-23.14,10.1-54.79,23.95-40.23,54.4,13.46,28.16,96.36,82.61,124.45,107.1,8.81,7.68,40.22,34.38,40.05,44.89-.19,11.78-24.78,15.05-33.91,16.3-31.79,4.34-75,5.07-106.88,1.75-10.46-1.09-18.49-4.3-26.01-11.8-19.45-19.39-57.82-76.91-65.72-102.82-21.55-70.68,48.97-100.85,105.11-113.74ZM253.28,282.85c-2.56-2.77-10.46,10.68-11.02,12.58,5.97,4.28,12.19-11.32,11.02-12.58ZM246.98,304.89l-6.4,2.64c.98,8.65,1.04,20.32,12.7,17.84l-6.31-20.47ZM257.4,339.69c-4.55,1.28.22,6.47,1.83,8.9,4.52,6.79,19.78,27.45,28.77,21.73l.77-4.01c-5.91-3.18-21.91-25.36-25.55-26.45-1.81-.54-4-.67-5.82-.16ZM358.83,437.19l-1.5-5.58-41.06-37.69c-2.84-1.47-13.44-1.76-14.14,1.57l36.97,40.19c6.51,3.72,12.78,3.27,19.73,1.52Z"
        initial={{ opacity: 0, scale: 0.88, ...parts[2].from }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0, transition: enter(parts[2].delay) }}
      />

      <motion.path
        fill="#2f6c4f"
        d="M261.16,254.51l-32.94,18.23c-51.27,33.64-60.02,82.29-41.52,138.91,4.69,14.36,17.05,31.16,13.06,45.29-3.68,3.75-51.5,5.61-56.75,3.11-9.07-4.32-6.57-43.12-13.59-51-22.63-7.93-5.08,44.69-12.25,50.37-3.4,2.69-38.06,3.49-44.33,3.07-11.37-.77-18.32-.09-18.16-13.46.3-25.54,18.4-65.95,32.84-87,40.97-59.68,104.53-91.3,173.62-107.52ZM183.98,295.46c-3.68-.67-21.17,13.48-18.89,15.73,7.83-2.18,13.96-9.67,18.89-15.73ZM160.36,319.09c-6.09-4.52-19.89,18.06-20.47,23.6,6.14,5.53,17.38-19.78,20.47-23.6ZM139.87,353.73c-14.68-.46-14.59,23.45-18.83,33.99.13,5.86,9.57,4.14,11.72.62.92-1.51,8.38-33.39,7.11-34.62Z"
        initial={{ opacity: 0, scale: 0.88, ...parts[1].from }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0, transition: enter(parts[1].delay) }}
      />

      <motion.g animate={leafFloat}>
        <motion.path
          fill="#9ec5a2"
          mask="url(#leafRevealMask)"
          d="M188.72,262.36l1.63-5.44c48.15-33.31,126.05-120.2,191.11-93.58,20.1,8.22,25.14,28.95,7.19,43-21.3,16.68-90.79,26.57-120.27,34.1-26.67,6.8-52.77,15.97-79.66,21.92Z"
          initial={{ opacity: 0, scale: 0.88, ...parts[3].from }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0, transition: enter(parts[3].delay) }}
        />
      </motion.g>

      {/* Dash only in idle */}
      <motion.g initial={{ opacity: 0 }} animate={phase === 1 ? { opacity: 1 } : { opacity: 0 }}>
        <motion.path
          d="M261.16,254.51l-32.94,18.23c-51.27,33.64-60.02,82.29-41.52,138.91"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="28 18 10 18"
          animate={dash}
        />
      </motion.g>
    </motion.svg>
  );
}

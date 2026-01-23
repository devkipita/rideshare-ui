'use client'

import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { useAppMode } from '@/app/context'
import { Button } from '@/components/ui/button'

/** -------------------------------------------
 * Small utility (no external deps)
 * ------------------------------------------*/
function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ')
}

/** -------------------------------------------
 * Design tokens
 * ------------------------------------------*/
const TOKENS = {
  ctaBase:
    'h-14 sm:h-14 rounded-full font-semibold text-base sm:text-[1rem] transition-all duration-300 ease-out active:scale-[0.98] data-[dragging=true]:pointer-events-none',
  ctaShadow:
    'shadow-[0_6px_18px_hsl(var(--primary)/0.25)] hover:shadow-[0_10px_26px_hsl(var(--primary)/0.35)]',
  ctaOutline:
    'bg-accent/10 border-accent/40 text-foreground hover:bg-accent/20',
  glass:
    'backdrop-blur-xl bg-white/5 dark:bg-black/10 border border-white/10 dark:border-white/10 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)]',
}

/** -------------------------------------------
 * Reusable primitives
 * ------------------------------------------*/
function GlassCard({
  className,
  children,
  padding = 'p-5 sm:p-6',
}: {
  className?: string
  children: ReactNode
  padding?: string
}) {
  return (
    <div className={cx('rounded-3xl', TOKENS.glass, padding, 'will-animate', className)}>
      {children}
    </div>
  )
}

function CTAButton({
  className,
  variant,
  type = 'button',
  ...props
}: ComponentProps<typeof Button>) {
  const isOutline = variant === 'outline'
  return (
    <Button
      size="lg"
      variant={variant}
      type={type}
      className={cx(
        TOKENS.ctaBase,
        isOutline ? TOKENS.ctaOutline : 'text-white',
        !isOutline && 'bg-primary',
        !isOutline && TOKENS.ctaShadow,
        'hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60',
        className,
      )}
      {...props}
    />
  )
}

/** Animated K brand mark (carpool lanes + routed chevron) */
function LogoKMark({ className }: { className?: string }) {
  return (
    <div className={cx('relative flex items-center justify-center gap-2 sm:gap-3', className)}>
      {/* Left lane */}
      <div
        className="relative w-[10px] sm:w-[12px] h-16 sm:h-20 rounded-sm bg-primary/90 shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_8px_24px_hsl(var(--primary)/0.35)] will-animate"
        style={{ animation: 'converge-left 1.2s var(--ease-out) forwards' }}
        aria-hidden
      >
        <span
          className="absolute inset-y-0 -inset-x-4 sm:-inset-x-5 bg-gradient-to-r from-transparent via-white/50 to-transparent will-animate"
          style={{ animation: 'sweep 1.4s var(--ease-out) 0.6s both' }}
        />
      </div>

      {/* Right chevron + inner “road” */}
      <div
        className="relative w-10 sm:w-12 h-16 sm:h-20 will-animate"
        style={{ animation: 'converge-right 1.2s var(--ease-out) forwards' }}
        aria-hidden
      >
        <svg viewBox="0 0 60 90" className="w-full h-full">
          <path
            d="M6 45 L58 6 L58 24 L30 45 L58 86 L30 86 L6 45 Z"
            className="fill-accent"
            style={{ filter: 'drop-shadow(0 10px 22px hsl(var(--accent)/0.35))' }}
          />
          <path
            d="M39 19 L23 31 L43 45 L23 60 L39 74"
            fill="none"
            stroke="hsl(var(--background))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 8"
            className="will-animate"
            style={{ animation: 'dash 1.1s var(--ease-snap) 0.85s both' }}
          />
        </svg>

        {/* carpool orbiters */}
        <div
          className="absolute -inset-2 flex items-center justify-center will-animate"
          style={{ animation: 'orbit 3.2s linear 0.9s both' }}
          aria-hidden
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-[32%] border border-accent/30" />
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_0_2px_hsl(var(--accent)/0.25)]" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.25)]" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Swipe control: drag knob to choose Passenger (left) / Driver (right) */
function SwipeChoice({
  onChoose,
}: {
  onChoose: (mode: 'driver' | 'passenger') => void
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [width, setWidth] = useState(0)

  const progress = useMemo(() => {
    if (!width) return 0
    const max = width - 56 // knob width
    return Math.min(1, Math.max(0, dragX / (max || 1)))
  }, [dragX, width])

  const label = progress > 0.6 ? 'Driver' : 'Passenger'
  const labelHint = progress > 0.6 ? 'Offer a Ride' : 'Join a Group Ride'

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  function startDrag(e: React.PointerEvent<HTMLButtonElement>) {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setDragging(true)
  }

  function onDrag(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - 28 // center knob
    const max = rect.width - 56
    setDragX(Math.min(max, Math.max(0, x)))
  }

  function endDrag() {
    if (!trackRef.current) {
      setDragging(false)
      return
    }
    const shouldRight = progress > 0.6
    const shouldLeft = progress < 0.4
    setDragging(false)

    if (shouldRight) {
      setDragX(width - 56)
      onChoose('driver')
    } else if (shouldLeft) {
      setDragX(0)
      onChoose('passenger')
    } else {
      setDragX(progress >= 0.5 ? width - 56 : 0)
      onChoose(progress >= 0.5 ? 'driver' : 'passenger')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <GlassCard padding="p-3 sm:p-3.5" className="rounded-2xl">
        <div
          ref={trackRef}
          className="relative w-full h-16 sm:h-[70px] rounded-full bg-gradient-to-br from-background/60 to-background/30 border border-white/10 overflow-hidden"
        >
          <div className="absolute inset-0 grid grid-cols-2 pointer-events-none text-[0.9rem] sm:text-[1rem]">
            <div className="flex items-center justify-start pl-5 sm:pl-6 text-foreground/80">
              Passenger
            </div>
            <div className="flex items-center justify-end pr-5 sm:pr-6 text-foreground/80">
              Driver
            </div>
          </div>

          <div
            aria-hidden
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent/30 via-primary/25 to-transparent"
            style={{ width: `${Math.max(30, progress * 100)}%` }}
          />

          <button
            type="button"
            aria-label={`Choose ${label} — ${labelHint}`}
            className={cx(
              'absolute top-1/2 -translate-y-1/2 w-14 h-14 sm:w-[56px] sm:h-[56px] rounded-full',
              'bg-gradient-to-br from-primary to-accent',
              'shadow-[0_8px_24px_hsl(var(--primary)/0.45)]',
              'border border-white/15 text-white',
              'active:scale-[0.98] outline-none',
            )}
            style={{
              left: `${dragX}px`,
              boxShadow: dragging
                ? '0 8px 30px hsl(var(--primary)/0.55), 0 0 0 6px hsl(var(--primary)/0.15)'
                : undefined,
            }}
            onPointerDown={startDrag}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            data-dragging={dragging}
          >
            <span className="sr-only">{label}</span>
            <svg viewBox="0 0 40 40" className="w-6 h-6 m-auto">
              <circle cx="20" cy="20" r="6" fill="currentColor" />
              <path
                d="M20 8 L26 20 L20 32 L14 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="pt-2 text-center text-xs sm:text-sm text-muted-foreground">
          Drag the knob • {labelHint}
        </div>
      </GlassCard>
    </div>
  )
}

/** -------------------------------------------
 * SplashGate
 * ------------------------------------------*/
export function SplashGate() {
  const { setMode } = useAppMode()
  const [phase, setPhase] = useState<'splash' | 'home'>('splash')

  useEffect(() => {
    let mounted = true
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const timer = setTimeout(() => {
      if (mounted) setPhase('home')
    }, prefersReduced ? 1200 : 3800)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  if (phase === 'home') return <HomeScreen setMode={setMode} />
  return <SplashScreen />
}

/** -------------------------------------------
 * SplashScreen
 * ------------------------------------------*/
function SplashScreen() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-primary/5"
      aria-label="ipita splash"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            --ease-out: cubic-bezier(0.19, 1, 0.22, 1);
            --ease-snap: cubic-bezier(0.77, 0, 0.175, 1);
          }
          .bg-animated::before, .bg-animated::after {
            content: "";
            position: absolute;
            inset: -20%;
            pointer-events: none;
          }
          .bg-animated::before {
            background: radial-gradient(50% 50% at 50% 50%, hsl(var(--primary)/0.12), transparent 60%);
            filter: blur(30px);
            transform: scale(0.9);
            animation: glow-pan 3.2s var(--ease-out) both;
          }
          .bg-animated::after {
            background-image:
              linear-gradient(to bottom right, hsl(var(--border)/0.25) 1px, transparent 1px),
              linear-gradient(to top left, hsl(var(--border)/0.18) 1px, transparent 1px);
            background-size: 40px 40px, 60px 60px;
            mask-image: radial-gradient(60% 60% at 50% 50%, black 0%, black 60%, transparent 100%);
            opacity: .25;
            animation: grid-parallax 3.6s linear both;
          }
          @keyframes converge-left {
            0%   { transform: translateX(-120px) scaleY(0.6); opacity: 0; }
            55%  { transform: translateX(18px)  scaleY(1.05); opacity: 1; }
            72%  { transform: translateX(-6px)  scaleY(0.98); }
            100% { transform: translateX(0)     scaleY(1);    }
          }
          @keyframes converge-right {
            0%   { transform: translateX(120px) scale(0.7); opacity: 0; }
            55%  { transform: translateX(-18px) scale(1.08); opacity: 1; }
            72%  { transform: translateX(6px)   scale(0.98); }
            100% { transform: translateX(0)     scale(1);    }
          }
          @keyframes reveal-mask {
            from { clip-path: inset(0 100% 0 0); }
            to   { clip-path: inset(0 0 0 0); }
          }
          @keyframes word-reveal {
            0%   { clip-path: inset(0 100% 0 0); filter: saturate(0.9) contrast(0.9); }
            100% { clip-path: inset(0 0 0 0);   filter: saturate(1) contrast(1); }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes dash {
            from { stroke-dashoffset: 90; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes orbit {
            to { transform: rotate(360deg); }
          }
          @keyframes sweep {
            0%   { transform: translateX(-120%); opacity: .0; }
            20%  { opacity: 1; }
            100% { transform: translateX(120%); opacity: .0; }
          }
          @keyframes glow-pan {
            0%   { transform: translate3d(-8%, -6%, 0) scale(0.9); opacity: 0; }
            30%  { opacity: 1; }
            100% { transform: translate3d(6%, 4%, 0)   scale(1.05); opacity: 1; }
          }
          @keyframes grid-parallax {
            0%   { transform: translate3d(-2%, 2%, 0) scale(1.02); }
            100% { transform: translate3d(2%, -2%, 0) scale(1.06); }
          }
          @keyframes grow {
            from { transform: scaleX(0); opacity: .6; }
            to   { transform: scaleX(1); opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .will-animate { animation: none !important; transition: none !important; }
          }
        `,
        }}
      />

      <div className="bg-animated absolute inset-0" aria-hidden />

      <GlassCard padding="px-6 py-6 sm:px-8 sm:py-7" className="rounded-[28px]">
        <div className="flex items-stretch gap-4 sm:gap-6">
          <div className="flex flex-col items-center justify-center">
            <LogoKMark />
          </div>

          <div
            className="w-px h-20 sm:h-24 bg-border/70 self-center will-animate"
            style={{ animation: 'reveal-mask 0.5s ease-out 1.2s both' }}
            aria-hidden
          />

          <div className="relative flex flex-col justify-center">
            <div
              className="text-[40px] sm:text-[52px] font-black tracking-tight text-foreground leading-none will-animate"
              style={{ animation: 'word-reveal 1s var(--ease-snap) 1.35s both' }}
            >
              <span className="inline-block will-animate" style={{ animation: 'fade-in .6s ease .95s both' }}>i</span>
              <span className="inline-block will-animate" style={{ animation: 'fade-in .6s ease 1.05s both' }}>p</span>
              <span className="inline-block will-animate" style={{ animation: 'fade-in .6s ease 1.15s both' }}>i</span>
              <span className="inline-block will-animate" style={{ animation: 'fade-in .6s ease 1.25s both' }}>t</span>
              <span className="inline-block will-animate" style={{ animation: 'fade-in .6s ease 1.35s both' }}>a</span>
            </div>
            <div className="overflow-hidden mt-2">
              <div
                className="h-[3px] sm:h-1 origin-left bg-gradient-to-r from-primary via-accent to-primary/70 rounded will-animate"
                style={{ animation: 'grow .9s var(--ease-out) 1.55s both' }}
              />
            </div>
            <p
              className="text-xs sm:text-sm text-muted-foreground mt-3 will-animate"
              style={{ animation: 'fade-in 0.8s ease-out 2.1s both' }}
            >
              Ride. Share. Connect.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

/** -------------------------------------------
 * HomeScreen
 * ------------------------------------------*/
function HomeScreen({
  setMode,
}: {
  setMode: (mode: 'driver' | 'passenger') => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center px-4 sm:px-6 pb-10">
      <GlassCard padding="px-5 py-4 sm:px-6 sm:py-5" className="mb-8 rounded-2xl">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-8 bg-primary rounded-sm" />
          <svg viewBox="0 0 50 80" className="w-7 h-9 fill-accent" aria-hidden>
            <path d="M0 40 L50 0 L50 20 L20 40 L50 80 L20 80 L0 40 Z" />
          </svg>
        </div>
      </GlassCard>

      <div className="text-center max-w-md mb-6">
        <h1 className="text-[32px] sm:text-[40px] font-black text-foreground leading-tight">
          Share the ride.
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mt-1">
          Save more.
        </h2>
        <p className="mt-3 text-muted-foreground text-base leading-relaxed">
          Join a trusted community of people already going your way.
        </p>
      </div>

      <div className="mb-6 w-full flex justify-center">
        <SwipeChoice onChoose={(mode) => setMode(mode)} />
      </div>

      <div className="w-full max-w-sm space-y-3">
        <CTAButton onClick={() => setMode('passenger')} className="w-full">
          Join a Group Ride
        </CTAButton>
        <CTAButton variant="outline" onClick={() => setMode('driver')} className="w-full">
          Offer a Ride
        </CTAButton>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Tip: Drag the pill above to choose quickly.
      </p>
    </div>
  )
}

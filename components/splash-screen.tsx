'use client'

import { useEffect, useState } from 'react'
import { useAppMode } from '@/app/context'
import { Button } from '@/components/ui/button'

export function SplashScreen() {
  const { setMode } = useAppMode()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center px-6 py-12">
      {/* Animated Car Icon */}
      <div className="mb-16 relative w-32 h-24">
        <div
          className={`absolute inset-0 smooth-transition ${
            isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
        >
          <svg
            className="w-full h-full text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm.33-10l1.5 4h-11l1.5-4h8z" />
          </svg>
        </div>
        {/* Animated dotted line */}
        <svg
          className="absolute top-1/2 -translate-y-1/2 w-full h-1"
          viewBox="0 0 128 2"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="1"
            x2="128"
            y2="1"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4,4"
            className="text-primary/30"
          />
        </svg>
      </div>

      {/* Heading */}
      <div className="mb-6 text-center max-w-sm">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 text-balance">
          Share the road.
        </h1>
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-6 text-balance">
          Split the cost.
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Join a community of conscious travelers heading the same way
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="mt-12 w-full max-w-xs space-y-3">
        <Button
          size="lg"
          onClick={() => setMode('passenger')}
          className="w-full h-14 rounded-full text-base font-semibold soft-shadow smooth-transition hover:scale-105 active:scale-95"
        >
          Join a Group Ride
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setMode('driver')}
          className="w-full h-14 rounded-full text-base font-semibold soft-shadow smooth-transition hover:scale-105 active:scale-95"
        >
          Offer a Ride
        </Button>
      </div>

      {/* Footer note */}
      <p className="absolute bottom-8 text-center text-sm text-muted-foreground px-6">
        No hassle. No surge pricing. Just community.
      </p>
    </div>
  )
}

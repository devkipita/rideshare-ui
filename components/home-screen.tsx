"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useAppMode } from "@/app/context";
import { Button } from "@/components/ui/button";

type BootStage = "splash" | "moving" | "home";

const HEADER_PAD = 16;
const HEADER_SIZE = 44;

export function HomeScreen({ bootStage }: { bootStage: BootStage }) {
  const { setMode } = useAppMode();

  const showHeader = bootStage !== "splash";
  const showContent = bootStage === "home";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Header target */}
      <div
        className="fixed z-30 flex items-center gap-2"
        style={{
          top: `calc(env(safe-area-inset-top) + ${HEADER_PAD}px)`,
          left: `calc(env(safe-area-inset-left) + ${HEADER_PAD}px)`,
          height: HEADER_SIZE,
        }}
      >
        <motion.svg
          layoutId="kipita-icon"
          width={HEADER_SIZE}
          height={HEADER_SIZE}
          viewBox="0 0 500 500"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            // ✅ hide during moving to prevent “duplicate corner logo”
            opacity: bootStage === "home" ? 1 : 0,
          }}
        >
          <path
            fill="#2f6c4f"
            d="M125.35,26.53c38.88-4.44,70.3,25.14,72.86,63.3,4.26,63.33-49.67,189.9-103.5,225.83-9.08,6.06-21.56,12.39-25.8-2.02l.25-233.03c4.73-27.23,28.55-50.92,56.18-54.08Z"
          />
          <path
            fill="#2f6c4f"
            d="M317.89,243.48l-.78,3.17,3.91.76c-23.14,10.1-54.79,23.95-40.23,54.4,13.46,28.16,96.36,82.61,124.45,107.1,8.81,7.68,40.22,34.38,40.05,44.89-.19,11.78-24.78,15.05-33.91,16.3-31.79,4.34-75,5.07-106.88,1.75-10.46-1.09-18.49-4.3-26.01-11.8-19.45-19.39-57.82-76.91-65.72-102.82-21.55-70.68,48.97-100.85,105.11-113.74Z"
          />
          <path
            fill="#2f6c4f"
            d="M261.16,254.51l-32.94,18.23c-51.27,33.64-60.02,82.29-41.52,138.91,4.69,14.36,17.05,31.16,13.06,45.29-3.68,3.75-51.5,5.61-56.75,3.11-9.07-4.32-6.57-43.12-13.59-51-22.63-7.93-5.08,44.69-12.25,50.37-3.4,2.69-38.06,3.49-44.33,3.07-11.37-.77-18.32-.09-18.16-13.46.3-25.54,18.4-65.95,32.84-87,40.97-59.68,104.53-91.3,173.62-107.52Z"
          />
          <path
            fill="#9ec5a2"
            d="M188.72,262.36l1.63-5.44c48.15-33.31,126.05-120.2,191.11-93.58,20.1,8.22,25.14,28.95,7.19,43-21.3,16.68-90.79,26.57-120.27,34.1-26.67,6.8-52.77,15.97-79.66,21.92Z"
          />
        </motion.svg>

        <div
          className="text-base font-semibold text-foreground"
          style={{ opacity: showHeader ? 1 : 0 }}
        >
          kipita
        </div>
      </div>

      {/* Home content only after splash finishes */}
      <motion.div
        initial={false}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.55, ease: (p) => 1 - Math.pow(1 - p, 3) }}
        style={{ pointerEvents: showContent ? "auto" : "none" }}
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      >
        <div className="mb-6 text-center max-w-sm">
          <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">
            Share the road.
          </h1>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-6 text-balance">
            Split the cost.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Join a community of conscious travelers heading the same way
          </p>
        </div>

        <div className="mt-10 w-full max-w-xs space-y-3">
          <Button
            size="lg"
            onClick={() => setMode("passenger")}
            className="w-full h-14 rounded-full text-base font-semibold soft-shadow smooth-transition active:scale-[0.98]"
          >
            Join a Group Ride
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setMode("driver")}
            className="w-full h-14 rounded-full text-base font-semibold soft-shadow smooth-transition active:scale-[0.98]"
          >
            Offer a Ride
          </Button>
        </div>

        <p className="absolute bottom-8 text-center text-sm text-muted-foreground px-6">
          No hassle. No surge pricing. Just community.
        </p>
      </motion.div>
    </div>
  );
}

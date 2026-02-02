"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { AppProvider, useAppMode } from "@/app/context";

import { HomeScreen } from "@/components/home-screen";
import { KipitaSplash } from "@/components/KipitaSplash";

// ... keep your other imports for passenger/driver screens ...

type BootStage = "splash" | "moving" | "home";

declare global {
  interface Window {
    __kipitaSplashDone?: boolean;
  }
}

function BootGate() {
  const { mode, setMode } = useAppMode();
  const [bootStage, setBootStage] = useState<BootStage>("splash");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.__kipitaSplashDone) {
      setShowSplash(false);
      setBootStage("home");
      if (mode === "splash") setMode("home");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LayoutGroup>
      <HomeScreen bootStage={bootStage} />

      <AnimatePresence>
        {showSplash && (
          <KipitaSplash
            onHandoffStart={() => {
              setBootStage("moving");
              if (mode === "splash") setMode("home");
            }}
            onFinish={() => {
              setShowSplash(false);
              setBootStage("home");
              if (mode === "splash") setMode("home");
            }}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

function AppContent() {
  const { mode } = useAppMode();

  // ✅ boot flow
  if (mode === "splash" || mode === "home") return <BootGate />;

  // ... your existing passenger/driver UI here ...
  return <div className="min-h-screen">TODO: your app screens</div>;
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

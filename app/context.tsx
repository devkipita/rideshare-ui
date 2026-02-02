"use client";

import * as React from "react";

export type AppMode = "splash" | "home" | "passenger" | "driver";

type AppModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
};

const AppModeContext = React.createContext<AppModeContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<AppMode>("splash");
  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const ctx = React.useContext(AppModeContext);
  if (!ctx) throw new Error("useAppMode must be used within AppProvider");
  return ctx;
}

"use client";

import * as React from "react";

export type ActiveRole = "passenger" | "driver";

type RoleContextValue = {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  toggleRole: () => void;
};

const STORAGE_KEY = "kipita_active_role";

const RoleContext = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRoleState] = React.useState<ActiveRole>("passenger");

  // Hydrate from localStorage after mount to avoid SSR mismatch
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "driver" || stored === "passenger") {
        setActiveRoleState(stored);
      }
    } catch {}
  }, []);

  const setActiveRole = React.useCallback((role: ActiveRole) => {
    setActiveRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch {}
  }, []);

  const toggleRole = React.useCallback(() => {
    setActiveRoleState((prev) => {
      const next = prev === "passenger" ? "driver" : "passenger";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ activeRole, setActiveRole, toggleRole }),
    [activeRole, setActiveRole, toggleRole],
  );

  return (
    <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = React.useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within <RoleProvider />");
  return ctx;
}

export function useOptionalRole() {
  return React.useContext(RoleContext);
}

// ─── Legacy aliases (used by KipitaSplash during transition) ───
// These are kept so old imports don't break immediately.
// They should be removed once all consumers are migrated.

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

export function useOptionalAppMode() {
  return React.useContext(AppModeContext);
}

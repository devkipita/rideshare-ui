"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useSession } from "next-auth/react";
import { AuthDrawer } from "@/components/auth-drawer";
import type { LoginRole } from "@/lib/authHelper";

type AuthDrawerOpts = {
  initialView?: "signin" | "signup";
  selectedRole?: LoginRole;
};

type AuthDrawerContextValue = {
  openAuthDrawer: (opts?: AuthDrawerOpts) => void;
  closeAuthDrawer: () => void;
  isSignedIn: boolean;
  isLoading: boolean;
};

const AuthDrawerContext = createContext<AuthDrawerContextValue | null>(null);

export function AuthDrawerProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<AuthDrawerOpts>({});

  const openAuthDrawer = useCallback((o?: AuthDrawerOpts) => {
    setOpts(o ?? {});
    setOpen(true);
  }, []);

  const closeAuthDrawer = useCallback(() => setOpen(false), []);

  const value: AuthDrawerContextValue = {
    openAuthDrawer,
    closeAuthDrawer,
    isSignedIn: status === "authenticated",
    isLoading: status === "loading",
  };

  return (
    <AuthDrawerContext.Provider value={value}>
      {children}
      <AuthDrawer
        open={open}
        onOpenChange={setOpen}
        initialView={opts.initialView ?? "signin"}
        selectedRole={opts.selectedRole ?? "passenger"}
      />
    </AuthDrawerContext.Provider>
  );
}

export function useAuthDrawer(): AuthDrawerContextValue {
  const ctx = useContext(AuthDrawerContext);
  if (!ctx) throw new Error("useAuthDrawer must be used within AuthDrawerProvider");
  return ctx;
}

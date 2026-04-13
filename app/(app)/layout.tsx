"use client";

import React from "react";
import { SWRConfig } from "swr";
import { RoleProvider } from "@/app/context";
import { ChatProvider } from "@/components/global-chat";
import { AuthDrawerProvider } from "@/components/auth-drawer-provider";
import { AppShell } from "@/components/layout/app-shell";
import { swrConfig } from "@/lib/swr-config";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <SWRConfig value={swrConfig}>
        <ChatProvider initialMessages={[]}>
          <AuthDrawerProvider>
            <AppShell>{children}</AppShell>
          </AuthDrawerProvider>
        </ChatProvider>
      </SWRConfig>
    </RoleProvider>
  );
}

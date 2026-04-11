"use client";

import React from "react";
import { RoleProvider } from "@/app/context";
import { ChatProvider } from "@/components/global-chat";
import { AuthDrawerProvider } from "@/components/auth-drawer-provider";
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <ChatProvider initialMessages={[]}>
        <AuthDrawerProvider>
          <AppShell>{children}</AppShell>
        </AuthDrawerProvider>
      </ChatProvider>
    </RoleProvider>
  );
}

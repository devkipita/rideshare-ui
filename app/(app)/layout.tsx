"use client";

import React from "react";
import { RoleProvider } from "@/app/context";
import { ChatProvider } from "@/components/global-chat";
import { AuthDrawerProvider } from "@/components/auth-drawer-provider";
import { TopNav } from "@/components/top-nav";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <ChatProvider initialMessages={[]}>
        <AuthDrawerProvider>
          <div className="fixed inset-0 w-full h-full max-w-[430px] mx-auto bg-primary/25 px-2 text-foreground overflow-hidden">
            {/* Green arc background */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[230px] rounded-b-[40px] bg-primary dark:bg-primary/14 border-b border-primary/10" />

            <div className="relative z-10 flex flex-col h-full w-full">
              <TopNav variant="default" />

              <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide">
                <div className="w-full pb-24 space-y-4">
                  {children}
                </div>
              </div>

              <BottomNav />
            </div>
          </div>
        </AuthDrawerProvider>
      </ChatProvider>
    </RoleProvider>
  );
}

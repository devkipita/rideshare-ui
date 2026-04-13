"use client";

import React from "react";
import { BottomSheet } from "@/components/ui-parts";

interface BottomDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function BottomDrawer({
  open,
  onOpenChange,
  title,
  children,
  headerRight,
}: BottomDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      headerRight={headerRight}
    >
      {children}
    </BottomSheet>
  );
}

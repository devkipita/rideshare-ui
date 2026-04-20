"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordRoute } from "@/hooks/use-back-navigation";

export function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordRoute(pathname);
  }, [pathname]);

  return null;
}

"use client";

import { useRole } from "@/app/context";
import { DriverEarnings } from "@/components/driver-earnings";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EarningsPage() {
  const { activeRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (activeRole !== "driver") {
      router.replace("/home");
    }
  }, [activeRole, router]);

  if (activeRole !== "driver") return null;

  return <DriverEarnings />;
}

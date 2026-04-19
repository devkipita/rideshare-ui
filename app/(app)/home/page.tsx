"use client";

import { PassengerSearch } from "@/components/passenger-search";
import { DriverOfferRide } from "@/components/driver-offer-ride";
import { useRoleConfig } from "@/hooks/use-role-config";

export default function HomePage() {
  const { role, config } = useRoleConfig();
  const isPassenger = role === "passenger";

  return (
    <>
      <p className="py-1 text-center text-[15px] font-extrabold tracking-tight text-primary-foreground [text-shadow:0_2px_12px_rgba(0,0,0,0.4)] dark:text-foreground dark:[text-shadow:0_2px_14px_rgba(0,0,0,0.7)]">
        {config.homeTitle}
      </p>
      {isPassenger ? <PassengerSearch /> : <DriverOfferRide />}
    </>
  );
}

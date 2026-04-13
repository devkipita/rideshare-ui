"use client";

import { PassengerSearch } from "@/components/passenger-search";
import { DriverOfferRide } from "@/components/driver-offer-ride";
import { useRoleConfig } from "@/hooks/use-role-config";

export default function HomePage() {
  const { role, config } = useRoleConfig();
  const isPassenger = role === "passenger";

  return (
    <>
      <p className="py-1 text-center text-sm font-semibold text-white dark:text-foreground">
        {config.homeTitle}
      </p>
      {isPassenger ? <PassengerSearch /> : <DriverOfferRide />}
    </>
  );
}

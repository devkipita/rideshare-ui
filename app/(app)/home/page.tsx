"use client";

import { useRole } from "@/app/context";
import { PassengerSearch } from "@/components/passenger-search";
import { DriverOfferRide } from "@/components/driver-offer-ride";

export default function HomePage() {
  const { activeRole } = useRole();
  const isPassenger = activeRole === "passenger";

  return (
    <>
      <p className="text-center text-sm font-semibold text-foreground py-1">
        {isPassenger ? "Find Your Ride Today" : "Offer a Ride Today"}
      </p>
      {isPassenger ? <PassengerSearch /> : <DriverOfferRide />}
    </>
  );
}

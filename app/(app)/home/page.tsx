"use client";

import { useRole } from "@/app/context";
import { PassengerSearch } from "@/components/passenger-search";
import { DriverOfferRide } from "@/components/driver-offer-ride";

export default function HomePage() {
  const { activeRole } = useRole();

  return (
    <div className="pt-1">
      {activeRole === "passenger" ? (
        <>
          <p className="text-center text-sm py-1 m-0 font-semibold text-[#fff]">
            Find Your Ride Today
          </p>
          <PassengerSearch />
        </>
      ) : (
        <DriverOfferRide />
      )}
    </div>
  );
}

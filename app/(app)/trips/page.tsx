"use client";

import { useRole } from "@/app/context";
import { MyRides } from "@/components/my-rides";
import { DriverRequests } from "@/components/driver-requests";

export default function TripsPage() {
  const { activeRole } = useRole();
  return activeRole === "passenger" ? <MyRides /> : <DriverRequests />;
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { AppProvider, useAppMode } from "@/app/context";
import { TopNav } from "@/components/top-nav";
import { BottomNav } from "@/components/bottom-nav";
import { PassengerSearch } from "@/components/passenger-search";
import { RideCard, type RideCardData } from "@/components/ride-card";
import { DriverOfferRide } from "@/components/driver-offer-ride";
import { DriverRequests } from "@/components/driver-requests";
import { DriverEarnings } from "@/components/driver-earnings";
import { MessagesScreen } from "@/components/messages-screen";
import { ProfileScreen } from "@/components/profile-screen";
import { MyRides } from "@/components/my-rides";
import { SplashScreen } from "@/components/KipitaSplash";
import { RideDetailsScreen } from "@/components/ride-details";

const mockRides: RideCardData[] = [
  {
    driverName: "James K.",
    rating: 4.8,
    from: "Nanyuki",
    to: "Nairobi",
    startTime: "7:00 AM",
    endTime: "8:00 AM",
    price: 1200,
    seatsLeft: 2,
  },
  {
    driverName: "Sarah M.",
    rating: 4.9,
    from: "Nanyuki",
    to: "Nairobi",
    startTime: "6:30 AM",
    endTime: "7:45 AM",
    price: 1100,
    seatsLeft: 1,
  },
  {
    driverName: "Mike T.",
    rating: 4.6,
    from: "Nanyuki",
    to: "Nairobi",
    startTime: "8:00 AM",
    endTime: "9:15 AM",
    price: 1300,
    seatsLeft: 3,
  },
];

function AppContent() {
  const { mode } = useAppMode();
  const [activeTab, setActiveTab] = useState("search");
  const [searchResults, setSearchResults] = useState(false);
  const [selectedRide, setSelectedRide] = useState<RideCardData | null>(null);

  useEffect(() => {
    setActiveTab(mode === "passenger" ? "search" : "rides");
    setSearchResults(false);
    setSelectedRide(null);
  }, [mode]);

  const isPassenger = mode === "passenger";
  const isMessages = activeTab === "messages";

  const showingRideDetails =
    isPassenger && activeTab === "search" && !!selectedRide;

  const pageTitle = useMemo(() => {
    if (isPassenger) {
      if (showingRideDetails) return "Ride Details";
      if (activeTab === "search") return "Find and Share Ride";
      if (activeTab === "trips") return "My Trips";
      if (activeTab === "messages") return "Messages";
      return "Profile";
    }
    if (activeTab === "rides") return "My Rides";
    if (activeTab === "requests") return "Ride Requests";
    if (activeTab === "earnings") return "Earnings";
    return "Profile";
  }, [activeTab, isPassenger, showingRideDetails]);

  const onBack = showingRideDetails
    ? () => {
        setSelectedRide(null);
        setSearchResults(false);
        requestAnimationFrame(() =>
          window.scrollTo({ top: 0, behavior: "smooth" }),
        );
      }
    : undefined;

  const handleTabChange = (next: string) => {
    setActiveTab(next);
    if (next !== "search") {
      setSearchResults(false);
      setSelectedRide(null);
    }
  };

  if (mode === "splash") return <SplashScreen />;

  return (
    <div className="min-h-dvh w-full bg-background text-foreground overflow-hidden relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[230px] sm:h-[260px] rounded-b-[40px] bg-primary/12 dark:bg-primary/14 border-b border-primary/10" />
      <div className="relative z-10 flex flex-col min-h-dvh">
        {isMessages ? (
          <TopNav variant="chat" user={{ name: "John D.", role: "driver" }} />
        ) : (
          <TopNav variant="default" title={pageTitle} onBack={onBack} />
        )}

        {!isMessages && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-screen-sm mx-auto w-full px-2 pb-24 space-y-4">
              {isPassenger && (
                <>
                  {activeTab === "search" && (
                    <div className="pt-1">
                      {!selectedRide ? (
                        <>
                          <PassengerSearch
                            onSearch={() => {
                              setSelectedRide(null);
                              setSearchResults(true);
                            }}
                          />

                          {searchResults && (
                            <div className="mt-5 space-y-3">
                              <div className="px-1 flex items-end justify-between gap-2">
                                <h2 className="text-[15px] sm:text-base font-extrabold tracking-tight">
                                  {mockRides.length} rides available
                                </h2>
                                <button
                                  type="button"
                                  onClick={() => setSearchResults(false)}
                                  className="text-[12px] font-semibold text-primary hover:opacity-80"
                                >
                                  New search
                                </button>
                              </div>

                              <div className="space-y-3">
                                {mockRides.map((ride, idx) => (
                                  <RideCard
                                    key={idx}
                                    ride={ride}
                                    onSelect={() => setSelectedRide(ride)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <RideDetailsScreen
                          ride={selectedRide}
                          onBack={() => {
                            setSelectedRide(null);
                            setSearchResults(false);
                            requestAnimationFrame(() =>
                              window.scrollTo({ top: 0, behavior: "smooth" }),
                            );
                          }}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === "trips" && <MyRides />}
                  {activeTab === "profile" && (
                    <ProfileScreen userMode="passenger" />
                  )}
                </>
              )}

              {!isPassenger && (
                <>
                  {activeTab === "rides" && <DriverOfferRide />}
                  {activeTab === "requests" && <DriverRequests />}
                  {activeTab === "earnings" && <DriverEarnings />}
                  {activeTab === "profile" && (
                    <ProfileScreen userMode="driver" />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {isMessages && <MessagesScreen />}

        <BottomNav
          mode={isPassenger ? "passenger" : "driver"}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

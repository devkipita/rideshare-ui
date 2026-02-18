"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { AppProvider, useAppMode } from "@/app/context";
import { ChatProvider } from "@/components/global-chat";
import { TopNav } from "@/components/top-nav";
import { BottomNav } from "@/components/bottom-nav";
import { PassengerSearch } from "@/components/passenger-search";
import { RideCard, type RideCardData } from "@/components/ride-card";
import { DriverOfferRide } from "@/components/driver-offer-ride";
import { DriverEarnings } from "@/components/driver-earnings";
import { NotificationsScreen } from "@/components/messages-screen";
import { ProfileScreen } from "@/components/profile-screen";
import { SplashScreen } from "@/components/KipitaSplash";
import { RideDetailsScreen } from "@/components/ride-details";
import { DriverRequests } from "@/components/driver-requests";
import { MyRides } from "@/components/my-rides";

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

type NavSnapshot = {
  mode?: string;
  activeTab?: string;
  searchResults?: boolean;
  selectedRide?: RideCardData | null;
};

const SNAP_KEY = "kipita_nav_snapshot";
const TAB_PASSENGER_KEY = "kipita_last_tab_passenger";
const TAB_DRIVER_KEY = "kipita_last_tab_driver";

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function readString(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeString(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

function saveSnapshot(s: NavSnapshot) {
  writeJSON(SNAP_KEY, s);
}

function AppContent() {
  const { mode } = useAppMode() as any;
  const [activeTab, setActiveTab] = useState("search");
  const [searchResults, setSearchResults] = useState(false);
  const [selectedRide, setSelectedRide] = useState<RideCardData | null>(null);

  const hydrated = useRef(false);
  const prevMode = useRef<string | null>(null);

  useEffect(() => {
    const snap = readJSON<NavSnapshot>(SNAP_KEY);

    const passengerTab = readString(TAB_PASSENGER_KEY);
    const driverTab = readString(TAB_DRIVER_KEY);

    if (snap?.activeTab) setActiveTab(snap.activeTab);
    else {
      if (mode === "passenger") setActiveTab(passengerTab ?? "search");
      else if (mode === "driver") setActiveTab(driverTab ?? "rides");
      else setActiveTab("search");
    }

    if (typeof snap?.searchResults === "boolean")
      setSearchResults(snap.searchResults);
    if (typeof snap?.selectedRide !== "undefined")
      setSelectedRide(snap.selectedRide ?? null);

    hydrated.current = true;
    prevMode.current = mode;

    const onRestore = (e: Event) => {
      const detail = (e as CustomEvent<NavSnapshot>).detail;
      if (!detail) return;
      if (detail.activeTab) setActiveTab(detail.activeTab);
      if (typeof detail.searchResults === "boolean")
        setSearchResults(detail.searchResults);
      if (typeof detail.selectedRide !== "undefined")
        setSelectedRide(detail.selectedRide ?? null);
    };

    window.addEventListener("kipita:restore", onRestore as any);
    return () => window.removeEventListener("kipita:restore", onRestore as any);
  }, []);

  useEffect(() => {
    const prev = prevMode.current;
    prevMode.current = mode;

    if (!hydrated.current) return;
    if (!prev || prev === mode) return;

    const passengerTab = readString(TAB_PASSENGER_KEY) ?? "search";
    const driverTab = readString(TAB_DRIVER_KEY) ?? "rides";

    if (mode === "passenger") {
      setActiveTab(passengerTab);
      setSearchResults(false);
      setSelectedRide(null);
    } else if (mode === "driver") {
      setActiveTab(driverTab);
      setSearchResults(false);
      setSelectedRide(null);
    }
  }, [mode]);

  useEffect(() => {
    if (!hydrated.current) return;

    if (mode === "passenger") writeString(TAB_PASSENGER_KEY, activeTab);
    if (mode === "driver") writeString(TAB_DRIVER_KEY, activeTab);

    if (mode !== "splash") {
      saveSnapshot({
        mode,
        activeTab,
        searchResults,
        selectedRide,
      });
    }
  }, [mode, activeTab, searchResults, selectedRide]);

  const isPassenger = mode === "passenger";
  const isMessages = activeTab === "messages";
  const showingRideDetails =
    isPassenger && activeTab === "search" && !!selectedRide;

  const pageTitle = useMemo(() => {
    if (isPassenger) {
      if (showingRideDetails) return "Ride Details";
      if (activeTab === "search") return "Find and Share a Ride";
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
    <div className="fixed inset-0 w-full h-full max-w-[430px] mx-auto bg-primary/25 px-2 text-foreground overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[230px] rounded-b-[40px] bg-primary dark:bg-primary/14 border-b border-primary/10" />

      <div className="relative z-10 flex flex-col h-full w-full">
        {isMessages ? (
          <TopNav variant="chat" user={{ name: "John D.", role: "driver" }} />
        ) : (
          <TopNav variant="default" onBack={onBack} />
        )}

        {!isMessages && (
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="w-full pb-24 space-y-4">
              {isPassenger && (
                <>
                  {activeTab === "search" && (
                    <div className="pt-1">
                      {!selectedRide ? (
                        <>
                          <p className="text-center text-sm py-1 m-0 font-semibold text-[#fff]">
                            Find Your Ride Today
                          </p>
                          <PassengerSearch
                            onSearch={() => {
                              setSelectedRide(null);
                              setSearchResults(true);
                            }}
                          />

                          {searchResults && (
                            <div className="mt-5 space-y-3">
                              <div className="px-1 flex items-end justify-between gap-2">
                                <h2 className="text-[15px] font-extrabold tracking-tight">
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

        {isMessages && <NotificationsScreen />}

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
      <ChatProvider
        initialMessages={[
          {
            id: "m-1",
            rideId: "req-2",
            driverId: "drv-1",
            sender: "driver",
            text: "Hey! I’m 5 minutes away from pickup.",
            createdAt: Date.now() - 1000 * 60 * 8,
            readByUser: false,
          },
        ]}
      >
        <AppContent />
      </ChatProvider>
    </AppProvider>
  );
}

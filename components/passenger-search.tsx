"use client";

import { useMemo, useState } from "react";
import { PassengerSearchForm, type SearchFilters } from "./PassengerSearchForm";
import { RideResults, type Driver } from "./RideResults";
import { AppBackdrop, BottomSheet, Surface } from "./ui-parts";
import { MapPreview } from "./ui/MapPreview";
import { AnnouncementsStrip, useAnnouncements } from "./announcements-strip";
import { useAuthDrawer } from "./auth-drawer-provider";

type Status = "idle" | "loading" | "ready";

const HIDE_SCROLLBAR =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export function PassengerSearch({
  onSearch,
}: {
  onSearch?: (filters: SearchFilters) => void;
}) {
  const [filters, setFilters] = useState<SearchFilters>({
    from: "",
    to: "",
    pickup: "",
    dropoff: "",
    note: "",
    date: "",
    seats: 2,
    pets: true,
    luggage: false,
    airport: false,
  });

  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<Driver[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [requestPosted, setRequestPosted] = useState(false);
  const [postingRequest, setPostingRequest] = useState(false);
  const { openAuthDrawer, isSignedIn } = useAuthDrawer();
  const announcements = useAnnouncements();

  const canSearch = useMemo(
    () =>
      Boolean(
        filters.from.trim() &&
        filters.to.trim() &&
        filters.pickup.trim() &&
        filters.dropoff.trim() &&
        filters.date,
      ),
    [filters.from, filters.to, filters.pickup, filters.dropoff, filters.date],
  );

  const postRideRequest = async () => {
    if (postingRequest || requestPosted) return;
    if (!isSignedIn) { openAuthDrawer({ selectedRole: "passenger" }); return; }
    setPostingRequest(true);
    try {
      const res = await fetch("/api/ride-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: filters.from.trim(),
          destination: filters.to.trim(),
          preferred_date: filters.date,
          seats_needed: filters.seats,
          allows_pets: filters.pets,
          allows_packages: filters.luggage,
          pickup_station: filters.pickup.trim() || null,
          dropoff_station: filters.dropoff.trim() || null,
          note: filters.note.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setRequestPosted(true);
    } catch {
      // silently fail
    } finally {
      setPostingRequest(false);
    }
  };

  const runSearch = async () => {
    if (!canSearch || status === "loading") return;

    onSearch?.(filters);

    setStatus("loading");
    setResults([]);
    setSheetOpen(true);

    try {
      const params = new URLSearchParams();
      if (filters.from) params.set("from", filters.from.trim());
      if (filters.to) params.set("to", filters.to.trim());
      if (filters.date) params.set("date", filters.date);
      if (filters.seats) params.set("seats", String(filters.seats));
      if (filters.pets) params.set("pets", "true");
      if (filters.luggage) params.set("luggage", "true");

      const res = await fetch(`/api/rides?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Search failed");

      const rides: Driver[] = (json.rides ?? []).map((r: Record<string, unknown>) => {
        const driver = r.driver as Record<string, unknown> | null;
        return {
          id: r.id as string,
          driverId: (driver?.id as string) ?? undefined,
          name: (driver?.name as string) ?? "Unknown",
          rating: 4.5,
          trips: 0,
          price: r.price_per_seat as number,
          from: r.origin as string,
          to: r.destination as string,
          departureTime: r.departure_time as string,
          seatsLeft: r.available_seats as number,
          avatarUrl: (driver?.image as string) ?? undefined,
        };
      });

      setResults(rides);
    } catch {
      setResults([]);
    } finally {
      setStatus("ready");
    }
  };

  return (
    <AppBackdrop>
      <div
        className={[
          "h-dvh overflow-y-auto overflow-x-hidden overscroll-y-contain",
          "touch-pan-y",
          HIDE_SCROLLBAR,
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-[520px]">
          <div className="pb-[calc(env(safe-area-inset-bottom)+24px)]">
            <div className="space-y-3">
              <PassengerSearchForm
                filters={filters}
                onChange={setFilters}
                onSearch={runSearch}
                loading={status === "loading"}
              />
              <AnnouncementsStrip announcements={announcements} />
            </div>

            <BottomSheet
              open={sheetOpen && status !== "idle"}
              onOpenChange={setSheetOpen}
              title={
                status === "loading" ? "Searching rides…" : "Available rides"
              }
            >
              <div className="space-y-3">
                <Surface elevated className="p-3">
                  <MapPreview from={filters.from} to={filters.to} />
                </Surface>
                <RideResults
                  status={status}
                  results={results}
                  onPostRequest={postRideRequest}
                />
              </div>
            </BottomSheet>
          </div>
        </div>
      </div>
    </AppBackdrop>
  );
}

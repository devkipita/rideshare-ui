"use client";

import { useEffect, useMemo, useState } from "react";
import { PassengerSearchForm, type SearchFilters } from "./PassengerSearchForm";
import { RideResults, type Driver } from "./RideResults";
import { BottomSheet, Surface } from "./ui-parts";
import { AnnouncementsStrip, useAnnouncements } from "./announcements-strip";
import { useAuthDrawer } from "./auth-drawer-provider";
import { toast } from "sonner";
import { LIMITS } from "@/lib/constants";

type Status = "idle" | "loading" | "ready";

const PASSENGER_SEARCH_DRAFT_KEY = "kipita-passenger-search-draft";

const DEFAULT_FILTERS: SearchFilters = {
  from: "",
  to: "",
  pickup: "",
  dropoff: "",
  note: "",
  date: "",
  departTime: "",
  seats: 2,
  pets: true,
  luggage: false,
};

function clampSeats(value: unknown) {
  const seats = Math.round(Number(value));
  if (!Number.isFinite(seats)) return DEFAULT_FILTERS.seats;
  return Math.min(LIMITS.maxSeats, Math.max(LIMITS.minSeats, seats));
}

function normalizeDraft(value: unknown): SearchFilters {
  if (!value || typeof value !== "object") return DEFAULT_FILTERS;
  const { airport: _airport, ...draft } = value as Partial<SearchFilters> & {
    airport?: boolean;
  };

  return {
    ...DEFAULT_FILTERS,
    ...draft,
    departTime:
      typeof draft.departTime === "string" ? draft.departTime : "",
    seats: clampSeats(draft.seats),
  };
}

export function PassengerSearch({
  onSearch,
}: {
  onSearch?: (filters: SearchFilters) => void;
}) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [draftReady, setDraftReady] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<Driver[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [requestPostedFor, setRequestPostedFor] = useState<string | null>(null);
  const [postingRequest, setPostingRequest] = useState(false);
  const { openAuthDrawer, isSignedIn } = useAuthDrawer();
  const announcements = useAnnouncements();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const draft = window.sessionStorage.getItem(PASSENGER_SEARCH_DRAFT_KEY);
      if (draft) setFilters(normalizeDraft(JSON.parse(draft)));
    } catch {
      setFilters(DEFAULT_FILTERS);
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!draftReady || typeof window === "undefined") return;
    window.sessionStorage.setItem(
      PASSENGER_SEARCH_DRAFT_KEY,
      JSON.stringify(filters),
    );
  }, [draftReady, filters]);

  const canSearch = useMemo(
    () =>
      Boolean(
        filters.from.trim() &&
        filters.to.trim() &&
        filters.pickup.trim() &&
        filters.dropoff.trim() &&
        filters.date &&
        filters.departTime,
      ),
    [
      filters.from,
      filters.to,
      filters.pickup,
      filters.dropoff,
      filters.date,
      filters.departTime,
    ],
  );

  const requestKey = useMemo(
    () =>
      [
        filters.from.trim().toLowerCase(),
        filters.to.trim().toLowerCase(),
        filters.date,
        filters.departTime,
        filters.seats,
        filters.pickup.trim().toLowerCase(),
        filters.dropoff.trim().toLowerCase(),
      ].join("|"),
    [filters],
  );

  const requestPosted = requestPostedFor === requestKey;

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
          preferred_time: filters.departTime,
          seats_needed: filters.seats,
          allows_pets: filters.pets,
          allows_packages: filters.luggage,
          pickup_station: filters.pickup.trim() || null,
          dropoff_station: filters.dropoff.trim() || null,
          note: filters.note.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setRequestPostedFor(requestKey);
      toast.success("Request posted", {
        description:
          "Drivers on this route have been notified. You will see matches in My Rides.",
      });
    } catch {
      toast.error("Couldn't post request", {
        description: "Please check your connection and try again.",
      });
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
      if (filters.departTime) params.set("time", filters.departTime);
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
      if (!rides.length) {
        void postRideRequest();
      }
    } catch {
      setResults([]);
    } finally {
      setStatus("ready");
    }
  };

  return (
    <div className="space-y-3">
      {/* Section 1: Route search + collapsible options */}
      <PassengerSearchForm
        filters={filters}
        onChange={setFilters}
        onSearch={runSearch}
        loading={status === "loading"}
      />

      {/* Section 3: Road alerts */}
      <AnnouncementsStrip announcements={announcements} />

      {/* Search results bottom sheet */}
      <BottomSheet
        open={sheetOpen && status !== "idle"}
        onOpenChange={setSheetOpen}
        title={status === "loading" ? "Searching rides…" : "Available rides"}
      >
        <RideResults
          status={status}
          results={results}
          onPostRequest={postRideRequest}
          requestPosted={requestPosted}
          postingRequest={postingRequest}
          seats={filters.seats}
        />
      </BottomSheet>
    </div>
  );
}

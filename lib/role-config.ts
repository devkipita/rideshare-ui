export type AppRole = "passenger" | "driver";

interface RoleConfig {
  label: string;
  homeTitle: string;
  searchCTA: string;
  searchPlaceholder: { from: string; to: string };
  emptyTrips: string;
  emptySearch: string;
  emptyRequests: string;
  postRideCTA: string;
  endpoints: {
    search: string;
    myTrips: string;
    requests: string;
  };
}

export const ROLE_CONFIG: Record<AppRole, RoleConfig> = {
  passenger: {
    label: "Rider",
    homeTitle: "Find your ride today",
    searchCTA: "Search Rides",
    searchPlaceholder: { from: "Pickup town", to: "Drop-off town" },
    emptyTrips: "No trips yet. Search for a ride to get started.",
    emptySearch: "No rides found on this route.",
    emptyRequests: "No pending requests.",
    postRideCTA: "Post a Ride Request",
    endpoints: {
      search: "/api/rides",
      myTrips: "/api/ride-requests",
      requests: "/api/ride-requests",
    },
  },
  driver: {
    label: "Driver",
    homeTitle: "Offer a ride today",
    searchCTA: "Search Requests",
    searchPlaceholder: { from: "Departure town", to: "Destination town" },
    emptyTrips: "No rides posted. Offer a ride to get started.",
    emptySearch: "No passenger requests on this route.",
    emptyRequests: "No incoming ride requests.",
    postRideCTA: "Post a Ride",
    endpoints: {
      search: "/api/ride-requests",
      myTrips: "/api/rides",
      requests: "/api/ride-requests",
    },
  },
};

export function getRoleConfig(role: AppRole): RoleConfig {
  return ROLE_CONFIG[role];
}

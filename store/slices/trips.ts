import { create } from "zustand";

type TripStatus = "active" | "matched" | "started" | "completed" | "cancelled";

interface Trip {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  seats: number;
  pricePerSeat: number;
  status: TripStatus;
  driverId?: string;
  passengerId?: string;
}

interface TripsState {
  myTrips: Trip[];
  requests: Trip[];
  activeTrip: Trip | null;
  addTrip: (trip: Trip) => void;
  updateStatus: (id: string, status: TripStatus) => void;
  setActiveTrip: (trip: Trip | null) => void;
  setTrips: (trips: Trip[]) => void;
  setRequests: (requests: Trip[]) => void;
}

export const useTripsStore = create<TripsState>()((set) => ({
  myTrips: [],
  requests: [],
  activeTrip: null,

  addTrip: (trip) =>
    set((s) => ({ myTrips: [trip, ...s.myTrips] })),

  updateStatus: (id, status) =>
    set((s) => ({
      myTrips: s.myTrips.map((t) =>
        t.id === id ? { ...t, status } : t,
      ),
      requests: s.requests.map((t) =>
        t.id === id ? { ...t, status } : t,
      ),
    })),

  setActiveTrip: (trip) => set({ activeTrip: trip }),
  setTrips: (trips) => set({ myTrips: trips }),
  setRequests: (requests) => set({ requests }),
}));

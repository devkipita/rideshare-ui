export type AppRole = "passenger" | "driver";
export type RideStatus = "active" | "matched" | "started" | "completed" | "cancelled";
export type TripState = "not_started" | "started" | "completed" | "cancelled";
export type RideTiming = "now" | "scheduled";
export type RequestStatus = "pending" | "accepted" | "rejected";
export type NoticeKind = "system" | "notification" | "alert";
export type NoticeSeverity = "info" | "warning" | "critical";
export type PaymentMethod = "mpesa" | "card";

export interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  avatarUrl?: string;
  verified?: boolean;
  car?: { makeModel: string; color: string; plate: string };
}

export interface SearchRide {
  id?: string;
  driverId?: string;
  name: string;
  rating: number;
  trips: number;
  price: number;
  from?: string;
  to?: string;
  departureTime?: string;
  seatsLeft?: number;
  avatarUrl?: string;
  verified?: boolean;
}

export interface Trip {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  seats: number;
  pricePerSeat: number;
  status: RideStatus;
  driverId?: string;
  passengerId?: string;
  driver?: Driver;
}

export interface RideRequest {
  id: string;
  passengerName: string;
  passengerImage?: string;
  origin: string;
  destination: string;
  preferredDate: string;
  preferredTime?: string;
  seatsNeeded: number;
  allowsPets: boolean;
  allowsPackages: boolean;
  pickupStation?: string;
  dropoffStation?: string;
  note?: string;
  status: RequestStatus;
  createdAt: string;
}

export interface Notice {
  id: string;
  kind: NoticeKind;
  severity: NoticeSeverity;
  title: string;
  body: string;
  location?: string;
  route?: { from: string; to: string };
  timestamp: number;
  read: boolean;
}

export interface Person {
  id: string;
  name: string;
  image?: string;
  phone?: string;
  verified?: boolean;
  rating?: number;
  totalTrips?: number;
  role?: AppRole;
}

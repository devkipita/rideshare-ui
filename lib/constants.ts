export const APP_NAME = "Kipita";
export const APP_TAGLINE = "Share the road. Split the cost.";

export const KENYA_COORDS = { lat: -1.2921, lng: 36.8219 };
export const TIMEZONE = "Africa/Nairobi";
export const CURRENCY = "KES";

export const LIMITS = {
  maxSeats: 14,
  minSeats: 1,
  maxPricePerSeat: 50_000,
  minPricePerSeat: 50,
  maxRidePostsPerHour: 5,
  searchDebounceMs: 300,
  pollIntervalMs: 30_000,
  maxAlertLength: 280,
};

export const RIDE_STATUSES = [
  "active",
  "matched",
  "started",
  "completed",
  "cancelled",
] as const;
export type RideStatus = (typeof RIDE_STATUSES)[number];

export const NOTICE_KINDS = ["system", "notification", "alert"] as const;
export type NoticeKind = (typeof NOTICE_KINDS)[number];

export const NOTICE_SEVERITIES = ["info", "warning", "critical"] as const;
export type NoticeSeverity = (typeof NOTICE_SEVERITIES)[number];

export const SUPPORTED_LANGUAGES = ["en", "sw"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const API_TIMEOUT = 10_000;

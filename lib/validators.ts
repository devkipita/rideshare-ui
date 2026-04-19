import { z } from "zod";
import { LIMITS } from "./constants";

export const rideFormSchema = z.object({
  from: z.string().min(2, "Pickup location required"),
  to: z.string().min(2, "Destination required"),
  date: z.string().min(1, "Date required"),
  departTime: z.string().min(1, "Departure time required"),
  seats: z.number().min(LIMITS.minSeats).max(LIMITS.maxSeats),
  pricePerSeat: z
    .number()
    .min(LIMITS.minPricePerSeat)
    .max(LIMITS.maxPricePerSeat),
  pets: z.boolean(),
  luggage: z.boolean(),
});
export type RideFormValues = z.infer<typeof rideFormSchema>;

export const alertPostSchema = z.object({
  message: z
    .string()
    .min(1, "Message required")
    .max(LIMITS.maxAlertLength, `Max ${LIMITS.maxAlertLength} characters`),
  severity: z.enum(["info", "warning", "critical"]),
  location: z.string().optional(),
});
export type AlertPostValues = z.infer<typeof alertPostSchema>;

export const phoneSchema = z
  .string()
  .regex(/^(?:\+254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number");

export const emailSchema = z.string().email("Enter a valid email");

export function validateKenyanPhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Notice = {
  id: string;
  kind: "system" | "notification";
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  location?: string;
  route?: { from: string; to: string };
  timestamp: number;
  read?: boolean;
};

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null);
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const [ridesRes, rideRequestsRes] = await Promise.all([
    supabaseAdmin
      .from("rides")
      .select("*, driver:users!driver_id(id,name,image)")
      .eq("status", "open")
      .not("notes", "ilike", "Matched passenger request %")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(30),
    supabaseAdmin
      .from("ride_requests")
      .select("*, passenger:users!passenger_id(id,name,image)")
      .eq("status", "active")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const notices: Notice[] = [];
  const todayAtSeven = new Date();
  todayAtSeven.setHours(7, 0, 0, 0);

  notices.push({
    id: "system-road-updates",
    kind: "system",
    severity: "info",
    title: "Road updates need one message",
    body: "Post what is happening on the road. Kipita assigns the alert level automatically.",
    timestamp: todayAtSeven.getTime(),
  });

  if (session?.user?.id) {
    notices.push({
      id: `system-account-${session.user.id}`,
      kind: "system",
      severity: "info",
      title: "Trip emails are active",
      body: "Payment receipts and trip confirmations are emailed after successful checkout.",
      timestamp: todayAtSeven.getTime() - 60 * 60 * 1000,
    });
  }

  if (ridesRes.data) {
    for (const ride of ridesRes.data) {
      const driver = ride.driver as Record<string, unknown> | null;
      const driverName = (driver?.name as string) ?? "A driver";

      notices.push({
        id: `ride-${ride.id}`,
        kind: "notification",
        severity: "info",
        title: `New ride: ${ride.origin} -> ${ride.destination}`,
        body: `${driverName} posted a ride for KES ${Number(ride.price_per_seat).toLocaleString()}/seat. ${ride.available_seats} seat${ride.available_seats !== 1 ? "s" : ""} available.`,
        route: { from: ride.origin, to: ride.destination },
        timestamp: new Date(ride.created_at).getTime(),
      });
    }
  }

  if (rideRequestsRes.data) {
    for (const request of rideRequestsRes.data) {
      const passenger = request.passenger as Record<string, unknown> | null;
      const passengerName = (passenger?.name as string) ?? "A passenger";

      notices.push({
        id: `request-${request.id}`,
        kind: "notification",
        severity: "info",
        title: `Ride request: ${request.origin} -> ${request.destination}`,
        body: `${passengerName} needs ${request.seats_needed} seat${request.seats_needed !== 1 ? "s" : ""}. Drivers can match the request or start a chat first.`,
        route: { from: request.origin, to: request.destination },
        timestamp: new Date(request.created_at).getTime(),
      });
    }
  }

  notices.sort((a, b) => b.timestamp - a.timestamp);

  return NextResponse.json({ notifications: notices }, { status: 200 });
}

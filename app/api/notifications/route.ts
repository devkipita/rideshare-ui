import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { roadUpdateTitle } from "@/lib/notification-priority";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Notice = {
  id: string;
  kind: "system" | "ride" | "announcement";
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  location?: string;
  route?: { from: string; to: string };
  timestamp: number;
  read?: boolean;
};

/** GET /api/notifications — composite feed of rides + announcements (public) */
export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null);

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Fetch recent rides, ride requests, and announcements in parallel.
  const [ridesRes, rideRequestsRes, announcementsRes] = await Promise.all([
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
    supabaseAdmin
      .from("announcements")
      .select("*, poster:users!user_id(id,name,image)")
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

  // Map rides to notifications
  if (ridesRes.data) {
    for (const r of ridesRes.data) {
      const driver = r.driver as Record<string, unknown> | null;
      const driverName = (driver?.name as string) ?? "A driver";
      notices.push({
        id: `ride-${r.id}`,
        kind: "ride",
        severity: "info",
        title: `New ride: ${r.origin} → ${r.destination}`,
        body: `${driverName} posted a ride for KES ${Number(r.price_per_seat).toLocaleString()}/seat — ${r.available_seats} seat${r.available_seats !== 1 ? "s" : ""} available.`,
        route: { from: r.origin, to: r.destination },
        timestamp: new Date(r.created_at).getTime(),
      });
    }
  }

  if (rideRequestsRes.data) {
    for (const r of rideRequestsRes.data) {
      const passenger = r.passenger as Record<string, unknown> | null;
      const passengerName = (passenger?.name as string) ?? "A passenger";
      notices.push({
        id: `request-${r.id}`,
        kind: "ride",
        severity: "info",
        title: `Ride request: ${r.origin} -> ${r.destination}`,
        body: `${passengerName} needs ${r.seats_needed} seat${r.seats_needed !== 1 ? "s" : ""}. Drivers can match the request or start a chat first.`,
        route: { from: r.origin, to: r.destination },
        timestamp: new Date(r.created_at).getTime(),
      });
    }
  }

  // Map announcements to notifications
  if (announcementsRes.data) {
    for (const a of announcementsRes.data) {
      const poster = a.poster as Record<string, unknown> | null;
      const posterName = (poster?.name as string) ?? "Someone";
      const severity = (a.severity as Notice["severity"]) ?? "info";
      notices.push({
        id: `ann-${a.id}`,
        kind: "announcement",
        severity,
        title: `${roadUpdateTitle(severity)} from ${posterName}`,
        body: a.message,
        location: a.location ?? undefined,
        route:
          a.route_from && a.route_to
            ? { from: a.route_from, to: a.route_to }
            : undefined,
        timestamp: new Date(a.created_at).getTime(),
      });
    }
  }

  // Sort newest first
  notices.sort((a, b) => b.timestamp - a.timestamp);

  return NextResponse.json({ notifications: notices }, { status: 200 });
}

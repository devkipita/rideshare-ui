import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/ride-requests — passenger posts a ride request */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const {
    origin,
    destination,
    preferred_date,
    seats_needed = 1,
    allows_pets = false,
    allows_packages = false,
    pickup_station,
    dropoff_station,
    note,
  } = body;

  if (!origin || !destination || !preferred_date)
    return NextResponse.json(
      { error: "origin, destination, and preferred_date are required" },
      { status: 400 },
    );

  const { data, error } = await supabaseAdmin
    .from("ride_requests")
    .insert({
      passenger_id: String(session.user.id),
      origin: String(origin).trim(),
      destination: String(destination).trim(),
      preferred_date: String(preferred_date),
      seats_needed: Math.max(1, Number(seats_needed) || 1),
      allows_pets: Boolean(allows_pets),
      allows_packages: Boolean(allows_packages),
      pickup_station: pickup_station ? String(pickup_station).trim() : null,
      dropoff_station: dropoff_station ? String(dropoff_station).trim() : null,
      note: note ? String(note).trim() : null,
      status: "active",
    })
    .select("*")
    .single();

  if (error)
    return NextResponse.json(
      { error: "Failed to create ride request", details: error.message },
      { status: 500 },
    );

  return NextResponse.json({ ride_request: data }, { status: 201 });
}

/** GET /api/ride-requests — fetch ride requests */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = String(session.user.id);
  const role = session.user.role;

  let query = supabaseAdmin
    .from("ride_requests")
    .select("*, passenger:users!passenger_id(id,name,image)")
    .order("created_at", { ascending: false });

  if (role === "driver") {
    // Drivers see all active requests (demand visibility)
    query = query.eq("status", "active");
  } else {
    // Passengers see their own requests
    query = query.eq("passenger_id", userId);
  }

  const { data, error } = await query;

  if (error)
    return NextResponse.json(
      { error: "Failed to fetch ride requests", details: error.message },
      { status: 500 },
    );

  return NextResponse.json({ ride_requests: data ?? [] }, { status: 200 });
}

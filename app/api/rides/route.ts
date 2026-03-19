import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/rides — driver posts a new ride */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "driver")
    return NextResponse.json(
      { error: "Only drivers can post rides" },
      { status: 403 },
    );

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const {
    origin,
    destination,
    departure_time,
    total_seats,
    price_per_seat,
    allows_pets = false,
    allows_packages = false,
    notes,
    vehicle_id,
  } = body;

  if (!origin || !destination || !departure_time || !total_seats || price_per_seat == null)
    return NextResponse.json(
      { error: "origin, destination, departure_time, total_seats, and price_per_seat are required" },
      { status: 400 },
    );

  if (typeof total_seats !== "number" || total_seats < 1)
    return NextResponse.json({ error: "total_seats must be >= 1" }, { status: 400 });

  if (typeof price_per_seat !== "number" || price_per_seat <= 0)
    return NextResponse.json({ error: "price_per_seat must be > 0" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("rides")
    .insert({
      driver_id: String(session.user.id),
      vehicle_id: vehicle_id || null,
      origin: String(origin).trim(),
      destination: String(destination).trim(),
      departure_time: String(departure_time),
      total_seats,
      available_seats: total_seats,
      price_per_seat,
      allows_pets: Boolean(allows_pets),
      allows_packages: Boolean(allows_packages),
      notes: notes ? String(notes).trim() : null,
      status: "open",
    })
    .select("*")
    .single();

  if (error)
    return NextResponse.json(
      { error: "Failed to create ride", details: error.message },
      { status: 500 },
    );

  return NextResponse.json({ ride: data }, { status: 201 });
}

/** GET /api/rides — search available rides */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const date = url.searchParams.get("date");
  const seats = url.searchParams.get("seats");
  const pets = url.searchParams.get("pets");
  const luggage = url.searchParams.get("luggage");

  let query = supabaseAdmin
    .from("rides")
    .select("*, driver:users!driver_id(id,name,image,role)")
    .eq("status", "open")
    .order("departure_time", { ascending: true });

  if (from) query = query.ilike("origin", `%${from}%`);
  if (to) query = query.ilike("destination", `%${to}%`);

  if (date) {
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;
    query = query.gte("departure_time", dayStart).lte("departure_time", dayEnd);
  }

  if (seats) {
    const n = parseInt(seats, 10);
    if (!isNaN(n) && n > 0) query = query.gte("available_seats", n);
  }

  if (pets === "true") query = query.eq("allows_pets", true);
  if (luggage === "true") query = query.eq("allows_packages", true);

  const { data, error } = await query;

  if (error)
    return NextResponse.json(
      { error: "Failed to search rides", details: error.message },
      { status: 500 },
    );

  return NextResponse.json({ rides: data ?? [] }, { status: 200 });
}

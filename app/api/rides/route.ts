import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { LIMITS } from "@/lib/constants";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KENYA_OFFSET = "+03:00";
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function buildKenyaDayWindow(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("date must be YYYY-MM-DD");
  }

  const start = new Date(`${date}T00:00:00${KENYA_OFFSET}`);
  if (Number.isNaN(start.getTime())) throw new Error("Invalid date");

  return {
    start,
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1),
  };
}

function buildKenyaRideSearchWindow(date: string, time?: string | null) {
  const day = buildKenyaDayWindow(date);
  if (!time) return day;

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error("time must be HH:mm");
  }

  const center = new Date(`${date}T${time}:00${KENYA_OFFSET}`);
  if (Number.isNaN(center.getTime())) throw new Error("Invalid time");

  return {
    start: new Date(Math.max(day.start.getTime(), center.getTime() - TWO_HOURS_MS)),
    end: new Date(Math.min(day.end.getTime(), center.getTime() + TWO_HOURS_MS)),
  };
}

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
    allows_music = false,
    notes,
    vehicle_id,
  } = body;

  if (!origin || !destination || !departure_time || !total_seats || price_per_seat == null)
    return NextResponse.json(
      { error: "origin, destination, departure_time, total_seats, and price_per_seat are required" },
      { status: 400 },
    );

  if (
    typeof total_seats !== "number" ||
    total_seats < LIMITS.minSeats ||
    total_seats > LIMITS.maxSeats
  )
    return NextResponse.json(
      { error: `total_seats must be between ${LIMITS.minSeats} and ${LIMITS.maxSeats}` },
      { status: 400 },
    );

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
      allows_music: Boolean(allows_music),
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

/** GET /api/rides — search available rides (public) */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const date = url.searchParams.get("date");
  const time = url.searchParams.get("time");
  const seats = url.searchParams.get("seats");
  const pets = url.searchParams.get("pets");
  const luggage = url.searchParams.get("luggage");
  const music = url.searchParams.get("music");

  if (time && !date) {
    return NextResponse.json(
      { error: "date is required when time is provided" },
      { status: 400 },
    );
  }

  let query = supabaseAdmin
    .from("rides")
    .select("*, driver:users!driver_id(id,name,image,role)")
    .eq("status", "open")
    .not("notes", "ilike", "Matched passenger request %")
    .order("departure_time", { ascending: true });

  if (from) query = query.ilike("origin", `%${from}%`);
  if (to) query = query.ilike("destination", `%${to}%`);

  if (date) {
    try {
      const window = buildKenyaRideSearchWindow(date, time);
      query = query
        .gte("departure_time", window.start.toISOString())
        .lte("departure_time", window.end.toISOString());
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid date or time" },
        { status: 400 },
      );
    }
  }

  if (seats) {
    const n = parseInt(seats, 10);
    if (!isNaN(n) && n > 0) query = query.gte("available_seats", n);
  }

  if (pets === "true") query = query.eq("allows_pets", true);
  if (luggage === "true") query = query.eq("allows_packages", true);
  if (music === "true") query = query.eq("allows_music", true);

  const { data, error } = await query;

  if (error)
    return NextResponse.json(
      { error: "Failed to search rides", details: error.message },
      { status: 500 },
    );

  return NextResponse.json({ rides: data ?? [] }, { status: 200 });
}

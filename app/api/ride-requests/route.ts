import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { LIMITS } from "@/lib/constants";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_SELECT = [
  "*",
  "passenger:users!passenger_id(id,name,image,email)",
  "matched_driver:users!matched_driver_id(id,name,image,email)",
  "matched_ride:rides!matched_ride_id(*)",
].join(",");

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanTime(value: unknown) {
  const raw = clean(value);
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) return raw;
  if (/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(raw)) {
    return raw.slice(0, 5);
  }
  return "";
}

function buildKenyaDeparture(preferredDate: string, timeValue: unknown) {
  const raw = clean(timeValue) || "08:00";
  if (raw.includes("T")) {
    const dt = new Date(raw);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString();
  }

  const time = /^\d{2}:\d{2}$/.test(raw) ? `${raw}:00` : raw;
  const dt = new Date(`${preferredDate}T${time}+03:00`);
  if (Number.isNaN(dt.getTime())) {
    throw new Error("Invalid departure time");
  }
  return dt.toISOString();
}

/** POST /api/ride-requests - passenger posts a ride request */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const origin = clean(body.origin);
  const destination = clean(body.destination);
  const preferredDate = clean(body.preferred_date);
  const preferredTime = cleanTime(body.preferred_time);
  const seatsNeeded = Math.min(
    LIMITS.maxSeats,
    Math.max(1, Number(body.seats_needed) || 1),
  );

  if (!origin || !destination || !preferredDate || !preferredTime) {
    return NextResponse.json(
      { error: "origin, destination, preferred_date, and preferred_time are required" },
      { status: 400 },
    );
  }

  const duplicate = await supabaseAdmin
    .from("ride_requests")
    .select(REQUEST_SELECT)
    .eq("passenger_id", String(session.user.id))
    .eq("origin", origin)
    .eq("destination", destination)
    .eq("preferred_date", preferredDate)
    .eq("preferred_time", preferredTime)
    .in("status", ["active", "matched"])
    .maybeSingle();

  if (duplicate.error) {
    return NextResponse.json(
      { error: "Failed to check existing ride request", details: duplicate.error.message },
      { status: 500 },
    );
  }

  if (duplicate.data) {
    return NextResponse.json(
      { ride_request: duplicate.data, duplicate: true, notified: true },
      { status: 200 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("ride_requests")
    .insert({
      passenger_id: String(session.user.id),
      origin,
      destination,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      seats_needed: seatsNeeded,
      allows_pets: Boolean(body.allows_pets),
      allows_packages: Boolean(body.allows_packages),
      pickup_station: clean(body.pickup_station) || null,
      dropoff_station: clean(body.dropoff_station) || null,
      note: clean(body.note) || null,
      status: "active",
    })
    .select(REQUEST_SELECT)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create ride request", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ride_request: data, notified: true },
    { status: 201 },
  );
}

/** GET /api/ride-requests - fetch ride requests */
export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null);
  const role = session?.user?.role;

  let query = supabaseAdmin
    .from("ride_requests")
    .select(REQUEST_SELECT)
    .order("created_at", { ascending: false });

  if (session?.user?.id && role === "passenger") {
    query = query.eq("passenger_id", String(session.user.id));
  } else if (session?.user?.id && role === "driver") {
    query = query.or(
      `status.eq.active,matched_driver_id.eq.${String(session.user.id)}`,
    );
  } else {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch ride requests", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ride_requests: data ?? [] }, { status: 200 });
}

/** PATCH /api/ride-requests - driver matches or declines a request */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "driver") {
    return NextResponse.json(
      { error: "Only drivers can update ride requests" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const statusMap: Record<string, string> = {
    accepted: "matched",
    matched: "matched",
    rejected: "cancelled",
    cancelled: "cancelled",
  };
  const nextStatus = statusMap[String(body.status)];
  if (!nextStatus) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const { data: request, error: requestError } = await supabaseAdmin
    .from("ride_requests")
    .select("*")
    .eq("id", String(body.id))
    .single();

  if (requestError || !request) {
    return NextResponse.json(
      { error: "Ride request not found" },
      { status: 404 },
    );
  }

  if (nextStatus === "cancelled") {
    const { data, error } = await supabaseAdmin
      .from("ride_requests")
      .update({ status: "cancelled" })
      .eq("id", String(body.id))
      .select(REQUEST_SELECT)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update ride request", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ride_request: data }, { status: 200 });
  }

  const pricePerSeat = Number(body.price_per_seat);
  if (
    !Number.isFinite(pricePerSeat) ||
    pricePerSeat < LIMITS.minPricePerSeat ||
    pricePerSeat > LIMITS.maxPricePerSeat
  ) {
    return NextResponse.json(
      {
        error: `price_per_seat must be between ${LIMITS.minPricePerSeat} and ${LIMITS.maxPricePerSeat}`,
      },
      { status: 400 },
    );
  }

  let departureTime: string;
  try {
    departureTime = buildKenyaDeparture(
      String(request.preferred_date),
      body.departure_time ?? body.depart_time ?? request.preferred_time,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid departure time" },
      { status: 400 },
    );
  }

  const seatCount = Math.min(
    LIMITS.maxSeats,
    Math.max(1, Number(request.seats_needed) || 1),
  );

  const { data: ride, error: rideError } = await supabaseAdmin
    .from("rides")
    .insert({
      driver_id: String(session.user.id),
      vehicle_id: null,
      origin: String(request.origin).trim(),
      destination: String(request.destination).trim(),
      departure_time: departureTime,
      total_seats: seatCount,
      available_seats: seatCount,
      price_per_seat: pricePerSeat,
      allows_pets: Boolean(request.allows_pets),
      allows_packages: Boolean(request.allows_packages),
      notes: `Matched passenger request ${request.id}`,
      status: "open",
    })
    .select("*")
    .single();

  if (rideError) {
    return NextResponse.json(
      { error: "Failed to create matched ride", details: rideError.message },
      { status: 500 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("ride_requests")
    .update({
      status: "matched",
      matched_driver_id: String(session.user.id),
      matched_at: new Date().toISOString(),
      matched_ride_id: ride.id,
      match_price_per_seat: pricePerSeat,
      match_departure_time: departureTime,
    })
    .eq("id", String(body.id))
    .select(REQUEST_SELECT)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update ride request", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ride_request: data }, { status: 200 });
}

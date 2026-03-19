import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/announcements — anyone posts a road announcement */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { message, location, route_from, route_to, severity = "info" } = body;

  if (!message || typeof message !== "string" || !message.trim())
    return NextResponse.json({ error: "message is required" }, { status: 400 });

  const validSeverities = ["info", "warning", "critical"];
  const sev = validSeverities.includes(severity) ? severity : "info";

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .insert({
      user_id: String(session.user.id),
      message: message.trim(),
      location: location ? String(location).trim() : null,
      route_from: route_from ? String(route_from).trim() : null,
      route_to: route_to ? String(route_to).trim() : null,
      severity: sev,
    })
    .select("*")
    .single();

  if (error)
    return NextResponse.json(
      { error: "Failed to create announcement", details: error.message },
      { status: 500 },
    );

  return NextResponse.json({ announcement: data }, { status: 201 });
}

/** GET /api/announcements — fetch recent announcements */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .select("*, poster:users!user_id(id,name,image)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error)
    return NextResponse.json(
      { error: "Failed to fetch announcements", details: error.message },
      { status: 500 },
    );

  return NextResponse.json({ announcements: data ?? [] }, { status: 200 });
}

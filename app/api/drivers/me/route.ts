// app/api/drivers/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = String(session.user.id);

  const { data: profile, error: pErr } = await supabaseAdmin
    .from("driver_profiles")
    .select(
      "id,user_id,national_id,driving_license,verified,verified_at,created_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (pErr)
    return NextResponse.json(
      { error: "Failed to load driver profile" },
      { status: 500 },
    );

  // completed rides count (driver)
  const { count, error: cErr } = await supabaseAdmin
    .from("rides")
    .select("id", { count: "exact", head: true })
    .eq("driver_id", userId)
    .eq("status", "completed");

  if (cErr)
    return NextResponse.json(
      { error: "Failed to load driver stats" },
      { status: 500 },
    );

  return NextResponse.json(
    {
      driver_profile: profile ?? null,
      stats: { completed_rides: count ?? 0 },
    },
    { status: 200 },
  );
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = String(session.user.id);
  const body = await req.json().catch(() => null);

  const national_id =
    body?.national_id === undefined
      ? undefined
      : typeof body.national_id === "string"
        ? body.national_id.trim() || null
        : null;

  const driving_license =
    body?.driving_license === undefined
      ? undefined
      : typeof body.driving_license === "string"
        ? body.driving_license.trim() || null
        : null;

  const patch: Record<string, any> = {};
  if (national_id !== undefined) patch.national_id = national_id;
  if (driving_license !== undefined) patch.driving_license = driving_license;

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });

  // upsert driver profile (verified remains controlled by admin)
  const { data, error } = await supabaseAdmin
    .from("driver_profiles")
    .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" })
    .select(
      "id,user_id,national_id,driving_license,verified,verified_at,created_at",
    )
    .limit(1)
    .maybeSingle();

  if (error)
    return NextResponse.json(
      { error: "Failed to update driver profile" },
      { status: 500 },
    );

  return NextResponse.json({ driver_profile: data ?? null }, { status: 200 });
}

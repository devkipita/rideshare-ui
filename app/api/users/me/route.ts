// users/me/route.ts

// app/api/users/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SELECT_USER =
  "id,name,email,phone,phone_verified,role,provider,created_at,image";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = session.user.id ? String(session.user.id) : null;
  const email =
    typeof session.user.email === "string"
      ? session.user.email.toLowerCase()
      : null;
  if (!id && !email)
    return NextResponse.json({ error: "Missing identity" }, { status: 400 });

  const base = supabaseAdmin.from("users").select(SELECT_USER).limit(1);

  const { data, error } = id
    ? await base.eq("id", id).maybeSingle()
    : await base.eq("email", email!).maybeSingle();

  if (error)
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );

  return NextResponse.json({ user: data ?? null }, { status: 200 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = session.user.id ? String(session.user.id) : null;
  const email =
    typeof session.user.email === "string"
      ? session.user.email.toLowerCase()
      : null;
  if (!id && !email)
    return NextResponse.json({ error: "Missing identity" }, { status: 400 });

  const body = await req.json().catch(() => null);

  const patch: Record<string, any> = {};

  if (body?.name !== undefined)
    patch.name =
      typeof body.name === "string" ? body.name.trim() || null : null;
  if (body?.image !== undefined)
    patch.image =
      typeof body.image === "string" ? body.image.trim() || null : null;

  // ✅ phone is NOT directly set here anymore (we verify it through OTP endpoints)
  if (body?.phone !== undefined) {
    return NextResponse.json(
      {
        error:
          "Use /api/users/phone/start + /api/users/phone/verify to change phone.",
      },
      { status: 400 },
    );
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const upd = supabaseAdmin
    .from("users")
    .update(patch)
    .select(SELECT_USER)
    .limit(1);

  const { data, error } = id
    ? await upd.eq("id", id).maybeSingle()
    : await upd.eq("email", email!).maybeSingle();

  if (error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );

  return NextResponse.json({ user: data ?? null }, { status: 200 });
}

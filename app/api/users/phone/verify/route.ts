// app/api/users/phone/verify/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function normalizePhone(input: string) {
  const raw = input.trim().replace(/\s+/g, "");
  if (raw.startsWith("+")) return raw;
  if (/^254\d{9}$/.test(raw)) return `+${raw}`;
  if (/^0[17]\d{8}$/.test(raw)) return `+254${raw.slice(1)}`;
  if (/^[17]\d{8}$/.test(raw)) return `+254${raw}`;
  throw new Error(
    "Invalid phone format. Use +2547XXXXXXXX, 2547XXXXXXXX, or 07XXXXXXXX.",
  );
}

const SELECT_USER =
  "id,name,email,phone,phone_verified,role,provider,created_at,image";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const phoneInput = typeof body?.phone === "string" ? body.phone : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!phoneInput.trim() || !code)
    return NextResponse.json(
      { error: "Phone and code are required" },
      { status: 400 },
    );
  if (code.length !== 6)
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  let phone: string;
  try {
    phone = normalizePhone(phoneInput);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid phone number." },
      { status: 400 },
    );
  }

  const { data: row, error: readErr } = await supabaseAdmin
    .from("phone_verifications")
    .select("id,code_hash,expires_at,verified_at,created_at")
    .eq("user_id", session.user.id)
    .eq("phone", phone)
    .is("verified_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readErr)
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 },
    );
  if (!row)
    return NextResponse.json(
      { error: "No verification request found" },
      { status: 400 },
    );

  const expMs = Date.parse(String(row.expires_at));
  if (!Number.isFinite(expMs))
    return NextResponse.json({ error: "Code expired" }, { status: 400 });
  if (expMs < Date.now())
    return NextResponse.json({ error: "Code expired" }, { status: 400 });

  if (hashCode(code) !== row.code_hash)
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const verifiedAt = new Date().toISOString();

  const { error: markErr } = await supabaseAdmin
    .from("phone_verifications")
    .update({ verified_at: verifiedAt })
    .eq("id", row.id);
  if (markErr)
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 },
    );

  const { data: user, error: updErr } = await supabaseAdmin
    .from("users")
    .update({ phone, phone_verified: true })
    .eq("id", session.user.id)
    .select(SELECT_USER)
    .limit(1)
    .maybeSingle();

  if (updErr)
    return NextResponse.json(
      { error: "Failed to update user phone" },
      { status: 500 },
    );

  return NextResponse.json({ ok: true, user }, { status: 200 });
}

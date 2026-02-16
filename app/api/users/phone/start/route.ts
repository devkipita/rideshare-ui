// app/api/users/phone/start/route.ts
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

class SmsSendError extends Error {
  status: number;
  providerBody?: string;
  constructor(message: string, status = 502, providerBody?: string) {
    super(message);
    this.name = "SmsSendError";
    this.status = status;
    this.providerBody = providerBody;
  }
}

function cleanEnv(v: string | undefined) {
  return (v ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function getAtConfig() {
  const mode = cleanEnv(process.env.AT_ENV).toLowerCase();
  if (mode !== "sandbox" && mode !== "production") {
    throw new SmsSendError("AT_ENV must be 'sandbox' or 'production'.", 503);
  }
  const username = cleanEnv(process.env.AT_USERNAME);
  const apiKey = cleanEnv(process.env.AT_API_KEY);
  if (!username || !apiKey)
    throw new SmsSendError("Set AT_USERNAME and AT_API_KEY.", 503);
  if (/\s/.test(apiKey) || /\s/.test(username))
    throw new SmsSendError("AT_USERNAME/AT_API_KEY contains whitespace.", 503);
  const baseUrl =
    mode === "sandbox"
      ? "https://api.sandbox.africastalking.com"
      : "https://api.africastalking.com";
  return { mode, username, apiKey, baseUrl };
}

async function sendSms(phoneE164: string, message: string) {
  const { username, apiKey, baseUrl } = getAtConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  let bodyText = "";

  try {
    const form = new URLSearchParams({ username, to: phoneE164, message });

    res = await fetch(`${baseUrl}/version1/messaging`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body: form.toString(),
      signal: controller.signal,
    });

    bodyText = await res.text().catch(() => "");
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      throw new SmsSendError("SMS provider timed out.", 504);
    }
    throw new SmsSendError("Could not reach SMS provider.", 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const trimmed = (bodyText || "").trim();
    const msg =
      res.status === 401
        ? "SMS provider authentication failed."
        : res.status === 400
          ? "SMS provider rejected the request."
          : `SMS provider request failed (${res.status}).`;

    throw new SmsSendError(
      trimmed ? `${msg} Provider says: ${trimmed}` : msg,
      res.status,
      trimmed,
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const phoneInput = typeof body?.phone === "string" ? body.phone : "";
  if (!phoneInput.trim())
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });

  let phone: string;
  try {
    phone = normalizePhone(phoneInput);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid phone number." },
      { status: 400 },
    );
  }

  const now = Date.now();

  const { data: lastRow } = await supabaseAdmin
    .from("phone_verifications")
    .select("id,created_at,verified_at")
    .eq("user_id", session.user.id)
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastRow?.created_at && !lastRow?.verified_at) {
    const lastMs = Date.parse(String(lastRow.created_at));
    if (Number.isFinite(lastMs)) {
      const diff = now - lastMs;
      if (diff < 60_000) {
        const retryAfter = Math.ceil((60_000 - diff) / 1000);
        return NextResponse.json(
          {
            error: "Please wait before requesting another code.",
            retry_after: retryAfter,
          },
          { status: 429 },
        );
      }
    }
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(now + 5 * 60 * 1000);
  const codeHash = hashCode(code);

  await supabaseAdmin
    .from("phone_verifications")
    .delete()
    .eq("user_id", session.user.id)
    .eq("phone", phone)
    .is("verified_at", null);

  const { error: insertError } = await supabaseAdmin
    .from("phone_verifications")
    .insert({
      user_id: session.user.id,
      phone,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

  if (insertError)
    return NextResponse.json(
      { error: "Failed to start verification" },
      { status: 500 },
    );

  try {
    await sendSms(phone, `Your verification code is: ${code}`);
  } catch (error) {
    await supabaseAdmin
      .from("phone_verifications")
      .delete()
      .eq("user_id", session.user.id)
      .eq("phone", phone)
      .eq("code_hash", codeHash)
      .is("verified_at", null);

    if (error instanceof SmsSendError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to send verification SMS." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true, expires_at: expiresAt.toISOString() },
    { status: 200 },
  );
}

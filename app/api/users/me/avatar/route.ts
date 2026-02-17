// avatar/route.ts

// app/api/users/me/avatar/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = process.env.SUPABASE_AVATARS_BUCKET?.trim() || "avatars";
const SELECT_USER =
  "id,name,email,phone,phone_verified,role,provider,created_at,image";

function extFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "bin";
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id ? String(session.user.id) : null;
  if (!userId)
    return NextResponse.json({ error: "Missing identity" }, { status: 400 });

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Use multipart/form-data" },
      { status: 400 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!file.type?.startsWith("image/")) {
    return NextResponse.json(
      { error: "File must be an image" },
      { status: 400 },
    );
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = extFromType(file.type);
  const path = `${userId}/${Date.now()}.${ext}`;

  const up = await supabaseAdmin.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type,
    upsert: true,
    cacheControl: "3600",
  });

  if (up.error) {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }

  const pub = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  const url = pub?.data?.publicUrl ? String(pub.data.publicUrl) : null;
  if (!url)
    return NextResponse.json(
      { error: "Failed to build image URL" },
      { status: 500 },
    );

  const upd = supabaseAdmin
    .from("users")
    .update({ image: url })
    .select(SELECT_USER)
    .limit(1);
  const { data, error } = await upd.eq("id", userId).maybeSingle();

  if (error)
    return NextResponse.json(
      { error: "Failed to save profile image" },
      { status: 500 },
    );

  return NextResponse.json({ url, user: data ?? null }, { status: 200 });
}

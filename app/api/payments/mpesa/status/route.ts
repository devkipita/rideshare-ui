import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/payments/mpesa/status?id=<checkoutRequestId>
 * Stub: always returns paid=true after first poll. Replace with Daraja
 * callback-backed persistence in production.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "id is required" }, { status: 400 });

  return NextResponse.json({
    paid: true,
    mpesaReceiptNumber: `RK${id.slice(-6).toUpperCase()}`,
  });
}

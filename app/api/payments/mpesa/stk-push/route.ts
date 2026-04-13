import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { confirmRidePayment } from "@/lib/payment-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/mpesa/stk-push
 * Stub M-Pesa STK push. In production, wire this to Safaricom Daraja and
 * confirm bookings from the callback. In local/dev a successful STK request
 * confirms the booking, holds the payment, and sends the rider emails.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { rideId, amount, phone, seats = 1 } = body as {
    rideId?: string;
    amount?: number;
    phone?: string;
    seats?: number;
  };

  if (!rideId || typeof amount !== "number" || amount <= 0 || !phone) {
    return NextResponse.json(
      { error: "rideId, amount, and phone are required" },
      { status: 400 },
    );
  }

  const normalizedPhone = phone
    .replace(/\s+/g, "")
    .replace(/^0/, "254")
    .replace(/^\+/, "");

  const checkoutRequestId = `stub_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2, 8)}`;

  try {
    await confirmRidePayment({
      rideId,
      amount,
      seats,
      method: "M-Pesa",
      reference: checkoutRequestId,
      passengerId: String(session.user.id),
      passengerEmail: session.user.email ?? "",
      passengerName: session.user.name ?? "Traveller",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to confirm payment",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    checkoutRequestId,
    phone: normalizedPhone,
    status: "processing",
  });
}

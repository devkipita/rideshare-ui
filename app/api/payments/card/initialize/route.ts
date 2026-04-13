import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { confirmRidePayment } from "@/lib/payment-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/card/initialize
 * Stub card payment initializer. In production, redirect to Stripe/Paystack
 * and confirm from the provider callback. In local/dev this confirms the trip.
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

  const { rideId, amount, seats = 1 } = body as {
    rideId?: string;
    amount?: number;
    seats?: number;
  };

  if (!rideId || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "rideId and amount are required" },
      { status: 400 },
    );
  }

  const reference = `card_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2, 8)}`;

  try {
    await confirmRidePayment({
      rideId,
      amount,
      seats,
      method: "Card",
      reference,
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

  return NextResponse.json({ reference, status: "processing" });
}

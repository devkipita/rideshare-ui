import { CURRENCY } from "./constants";

export type PaymentMethod = "mpesa" | "card";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed";

interface PaymentRequest {
  amount: number;
  currency: string;
  rideId: string;
  method: PaymentMethod;
  phone?: string;
  seats?: number;
}

interface PaymentResult {
  status: PaymentStatus;
  transactionId?: string;
  error?: string;
}

export async function initiateMpesaPayment(
  rideId: string,
  amount: number,
  phone: string,
  seats = 1,
): Promise<PaymentResult> {
  const res = await fetch("/api/payments/mpesa/stk-push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rideId,
      amount,
      phone,
      seats,
      currency: CURRENCY,
      method: "mpesa",
    } satisfies PaymentRequest),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return {
      status: "failed",
      error: data?.error ?? "Failed to initiate M-Pesa payment",
    };
  }

  const data = await res.json();
  return { status: "processing", transactionId: data.checkoutRequestId };
}

export async function pollMpesaStatus(
  checkoutRequestId: string,
): Promise<PaymentResult> {
  const res = await fetch(
    `/api/payments/mpesa/status?id=${encodeURIComponent(checkoutRequestId)}`,
  );

  if (!res.ok) {
    return { status: "pending" };
  }

  const data = await res.json();
  return {
    status: data.paid ? "completed" : "pending",
    transactionId: data.mpesaReceiptNumber,
  };
}

export async function initiateCardPayment(
  rideId: string,
  amount: number,
  email: string,
  seats = 1,
): Promise<PaymentResult> {
  const res = await fetch("/api/payments/card/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rideId, amount, email, seats, currency: CURRENCY }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return {
      status: "failed",
      error: data?.error ?? "Failed to initialize card payment",
    };
  }

  const data = await res.json();
  return { status: "processing", transactionId: data.reference };
}

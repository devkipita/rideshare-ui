import { CURRENCY } from "./constants";

export type PaymentMethod = "mpesa" | "card";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed";

interface PaymentRequest {
  amount: number;
  currency: string;
  rideId: string;
  method: PaymentMethod;
  phone?: string;
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
): Promise<PaymentResult> {
  const res = await fetch("/api/payments/mpesa/stk-push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rideId,
      amount,
      phone,
      currency: CURRENCY,
      method: "mpesa",
    } satisfies PaymentRequest),
  });

  if (!res.ok) {
    return { status: "failed", error: "Failed to initiate M-Pesa payment" };
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
): Promise<PaymentResult> {
  const res = await fetch("/api/payments/card/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rideId, amount, email, currency: CURRENCY }),
  });

  if (!res.ok) {
    return { status: "failed", error: "Failed to initialize card payment" };
  }

  const data = await res.json();
  return { status: "processing", transactionId: data.reference };
}

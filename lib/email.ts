import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";
import PaymentReceiptEmail from "@/emails/PaymentReceiptEmail";
import TripConfirmationEmail from "@/emails/TripConfirmationEmail";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const FROM = process.env.EMAIL_FROM ?? "Kipita <hello@kipita.app>";
const API_KEY = process.env.RESEND_API_KEY;

/**
 * Low-level Resend sender. Falls back to a console log no-op when
 * RESEND_API_KEY isn't configured so local dev stays friction-free.
 */
async function sendEmail({ to, subject, html, text }: SendArgs) {
  if (!to) return { ok: false, skipped: true, reason: "no-recipient" } as const;

  if (!API_KEY) {
    console.info("[email] RESEND_API_KEY missing — skipping send", {
      to,
      subject,
    });
    return { ok: false, skipped: true, reason: "no-api-key" } as const;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to, subject, html, text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] send failed", res.status, body);
      return { ok: false, skipped: false, reason: "send-failed" } as const;
    }
    return { ok: true } as const;
  } catch (err) {
    console.error("[email] send threw", err);
    return { ok: false, skipped: false, reason: "exception" } as const;
  }
}

export async function sendWelcomeEmail(args: { to: string; name: string; role: "passenger" | "driver" | "admin" }) {
  const html = await render(WelcomeEmail({ name: args.name, role: args.role }));
  const text = `Karibu ${args.name}! Your Kipita account is ready.`;
  return sendEmail({
    to: args.to,
    subject: `Karibu to Kipita, ${args.name.split(" ")[0]}!`,
    html,
    text,
  });
}

export async function sendPaymentReceipt(args: {
  to: string;
  name: string;
  amount: number;
  method: "M-Pesa" | "Card";
  rideId: string;
  reference: string;
}) {
  const html = await render(
    PaymentReceiptEmail({
      name: args.name,
      amount: args.amount,
      method: args.method,
      rideId: args.rideId,
      reference: args.reference,
    }),
  );
  const text = `Payment of KES ${args.amount} confirmed. Ref: ${args.reference}`;
  return sendEmail({
    to: args.to,
    subject: `Payment received - KES ${args.amount.toLocaleString()} | Kipita`,
    html,
    text,
  });
}

export async function sendTripConfirmation(args: {
  to: string;
  name: string;
  origin: string;
  destination: string;
  departureTime: string;
  driverName: string;
  seats: number;
}) {
  const html = await render(TripConfirmationEmail(args));
  const text = `Your trip ${args.origin} -> ${args.destination} is confirmed.`;
  return sendEmail({
    to: args.to,
    subject: `Trip confirmed: ${args.origin} -> ${args.destination}`,
    html,
    text,
  });
}

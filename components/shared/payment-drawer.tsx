"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Headphones,
  ListChecks,
  Loader2,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui-parts";
import { BottomDrawer } from "./bottom-drawer";
import {
  initiateCardPayment,
  initiateMpesaPayment,
  pollMpesaStatus,
  type PaymentMethod,
} from "@/lib/payments";
import { toast } from "sonner";

interface PaymentDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rideId: string;
  amount: number;
  seats?: number;
  title?: string;
  routeLabel?: string;
  onSuccess?: () => void;
}

export function PaymentDrawer({
  open,
  onOpenChange,
  rideId,
  amount,
  seats = 1,
  title = "Confirm and pay",
  routeLabel,
  onSuccess,
}: PaymentDrawerProps) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingMpesa, setAwaitingMpesa] = useState(false);
  const [done, setDone] = useState(false);
  const [pollId, setPollId] = useState<string | null>(null);

  const safeSeats = Math.max(1, Math.floor(Number(seats) || 1));
  const amountLabel = useMemo(
    () => `KES ${Math.max(0, amount).toLocaleString()}`,
    [amount],
  );

  useEffect(() => {
    if (!open) {
      setMethod(null);
      setPhone("");
      setProcessing(false);
      setError(null);
      setAwaitingMpesa(false);
      setDone(false);
      setPollId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!awaitingMpesa || !pollId || done) return;
    let cancelled = false;
    const tick = async () => {
      const result = await pollMpesaStatus(pollId);
      if (cancelled) return;
      if (result.status === "completed") {
        setDone(true);
        setAwaitingMpesa(false);
        toast.success("Payment confirmed", {
          description:
            "Your trip confirmation and payment receipt have been emailed.",
        });
        onSuccess?.();
      }
    };
    const t = window.setTimeout(tick, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [awaitingMpesa, pollId, done, onSuccess]);

  const validateCheckout = () => {
    if (!rideId) return "Ride details are missing. Please reopen the ride.";
    if (!Number.isFinite(amount) || amount <= 0) {
      return "Payment amount is missing. Please reopen the ride.";
    }
    return null;
  };

  const handleMpesa = async () => {
    const validation = validateCheckout();
    if (validation) {
      setError(validation);
      return;
    }
    if (!phone.trim()) {
      setError("Enter your M-Pesa phone number");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const result = await initiateMpesaPayment(
        rideId,
        amount,
        phone,
        safeSeats,
      );
      if (result.status === "failed") {
        setError(result.error ?? "Payment failed");
        return;
      }
      setPollId(result.transactionId ?? null);
      setAwaitingMpesa(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCard = async () => {
    const validation = validateCheckout();
    if (validation) {
      setError(validation);
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const result = await initiateCardPayment(rideId, amount, "", safeSeats);
      if (result.status === "failed") {
        setError(result.error ?? "Payment failed");
        return;
      }
      setDone(true);
      toast.success("Payment confirmed", {
        description:
          "Your trip confirmation and payment receipt have been emailed.",
      });
      onSuccess?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <BottomDrawer open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-3">
        <Surface tone="panel" className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">
                SECURE CHECKOUT
              </p>
              <p className="mt-1 text-2xl font-extrabold text-primary">
                {amountLabel}
              </p>
              <p className="mt-1 text-[12px] font-semibold text-muted-foreground">
                {safeSeats} seat{safeSeats === 1 ? "" : "s"} held after payment
                {routeLabel ? ` for ${routeLabel}` : ""}.
              </p>
            </div>
          </div>
        </Surface>

        {done ? (
          <Surface tone="panel" className="p-6 text-center">
            <CheckCircle2
              className="mx-auto h-10 w-10 text-[#16a34a]"
              strokeWidth={2.2}
            />
            <p className="mt-3 text-base font-extrabold">Trip confirmed</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Your receipt and trip details are in your inbox. Keep them handy
              for pickup.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/trips";
                }}
                className="h-11 rounded-2xl border border-border/70 bg-card/80 text-[12px] font-extrabold text-foreground/85 active:scale-[0.99]"
              >
                <ListChecks className="mr-1.5 inline h-4 w-4 text-primary" />
                My rides
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "mailto:support@kipita.app";
                }}
                className="h-11 rounded-2xl bg-primary text-[12px] font-extrabold text-primary-foreground active:scale-[0.99]"
              >
                <Headphones className="mr-1.5 inline h-4 w-4" />
                Support
              </button>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-3 h-10 w-full rounded-2xl border border-border/70 bg-card/70 text-[13px] font-semibold text-foreground/80 active:scale-[0.99]"
            >
              Done
            </button>
          </Surface>
        ) : awaitingMpesa ? (
          <Surface tone="panel" className="p-6 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm font-extrabold">Check your phone</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Approve the M-Pesa prompt. We will confirm the seat as soon as it
              clears.
            </p>
          </Surface>
        ) : !method ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("mpesa")}
              className={cn(
                "rounded-3xl border border-border/70 p-4 text-center",
                "bg-card/80 hover:bg-primary/8 hover:border-primary/20",
                "active:scale-[0.98] transition-all duration-300",
              )}
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[#4CAF50]/20 bg-[#4CAF50]/10">
                <Phone className="h-6 w-6 text-[#4CAF50]" />
              </div>
              <p className="mt-2 text-sm font-extrabold">M-Pesa</p>
              <p className="text-[11px] text-muted-foreground">
                STK push to your phone
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMethod("card")}
              className={cn(
                "rounded-3xl border border-border/70 p-4 text-center",
                "bg-card/80 hover:bg-primary/8 hover:border-primary/20",
                "active:scale-[0.98] transition-all duration-300",
              )}
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <p className="mt-2 text-sm font-extrabold">Card</p>
              <p className="text-[11px] text-muted-foreground">
                Visa or Mastercard
              </p>
            </button>
          </div>
        ) : method === "mpesa" ? (
          <div className="space-y-3">
            <Surface tone="panel" className="p-4">
              <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">
                M-PESA NUMBER
              </p>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
                className="mt-2 h-11 w-full rounded-2xl border border-border/70 bg-card/70 px-4 text-[15px] font-semibold outline-none placeholder:text-muted-foreground/80"
                type="tel"
              />
            </Surface>

            <button
              type="button"
              onClick={handleMpesa}
              disabled={processing}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#4CAF50] text-sm font-extrabold text-white transition hover:brightness-[1.03] active:scale-[0.98] disabled:opacity-70"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
              {processing ? "Sending..." : "Pay with M-Pesa"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCard}
            disabled={processing}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-blue-600 text-sm font-extrabold text-white transition hover:brightness-[1.03] active:scale-[0.98] disabled:opacity-70"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {processing ? "Processing..." : "Pay with Card"}
          </button>
        )}

        {error && (
          <p className="text-center text-[12px] font-semibold text-destructive">
            {error}
          </p>
        )}

        {method && !awaitingMpesa && !done && (
          <button
            type="button"
            onClick={() => {
              setMethod(null);
              setError(null);
            }}
            className="h-10 w-full rounded-2xl border border-border/70 bg-card/80 text-[13px] font-semibold text-foreground/85 active:scale-[0.99]"
          >
            Back to payment options
          </button>
        )}
      </div>
    </BottomDrawer>
  );
}

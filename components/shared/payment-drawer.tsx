"use client";

import { useState } from "react";
import { Loader2, Phone, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui-parts";
import { BottomDrawer } from "./bottom-drawer";
import { initiateMpesaPayment, initiateCardPayment, type PaymentMethod } from "@/lib/payments";

interface PaymentDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rideId: string;
  amount: number;
  onSuccess?: () => void;
}

export function PaymentDrawer({
  open,
  onOpenChange,
  rideId,
  amount,
  onSuccess,
}: PaymentDrawerProps) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingMpesa, setAwaitingMpesa] = useState(false);

  const handleMpesa = async () => {
    if (!phone.trim()) { setError("Enter your M-Pesa phone number"); return; }
    setProcessing(true);
    setError(null);
    const result = await initiateMpesaPayment(rideId, amount, phone);
    if (result.status === "failed") {
      setError(result.error ?? "Payment failed");
      setProcessing(false);
      return;
    }
    setAwaitingMpesa(true);
    setProcessing(false);
  };

  const handleCard = async () => {
    setProcessing(true);
    setError(null);
    const result = await initiateCardPayment(rideId, amount, "");
    if (result.status === "failed") {
      setError(result.error ?? "Payment failed");
    }
    setProcessing(false);
  };

  return (
    <BottomDrawer open={open} onOpenChange={onOpenChange} title="Payment">
      <div className="space-y-3">
        <Surface tone="panel" className="p-4 text-center">
          <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">AMOUNT</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">KES {amount.toLocaleString()}</p>
        </Surface>

        {awaitingMpesa ? (
          <Surface tone="panel" className="p-6 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm font-extrabold">Check your phone</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Approve the M-Pesa payment on your phone
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
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#4CAF50]/10 border border-[#4CAF50]/20">
                <Phone className="h-6 w-6 text-[#4CAF50]" />
              </div>
              <p className="mt-2 text-sm font-extrabold">M-Pesa</p>
              <p className="text-[11px] text-muted-foreground">Lipa Na M-Pesa</p>
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
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <p className="mt-2 text-sm font-extrabold">Card</p>
              <p className="text-[11px] text-muted-foreground">Visa / Mastercard</p>
            </button>
          </div>
        ) : method === "mpesa" ? (
          <div className="space-y-3">
            <Surface tone="panel" className="p-4">
              <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground">M-PESA NUMBER</p>
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
              className="h-12 w-full rounded-[18px] bg-[#4CAF50] text-white text-sm font-extrabold hover:brightness-[1.03] active:scale-[0.98] transition disabled:opacity-70 inline-flex items-center justify-center gap-2"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
              {processing ? "Sending..." : "Pay with M-Pesa"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCard}
            disabled={processing}
            className="h-12 w-full rounded-[18px] bg-blue-600 text-white text-sm font-extrabold hover:brightness-[1.03] active:scale-[0.98] transition disabled:opacity-70 inline-flex items-center justify-center gap-2"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {processing ? "Processing..." : "Pay with Card"}
          </button>
        )}

        {error && (
          <p className="text-center text-[12px] font-semibold text-destructive">{error}</p>
        )}

        {method && !awaitingMpesa && (
          <button
            type="button"
            onClick={() => { setMethod(null); setError(null); }}
            className="h-10 w-full rounded-2xl border border-border/70 bg-card/80 text-foreground/85 text-[13px] font-semibold active:scale-[0.99]"
          >
            Back to payment options
          </button>
        )}
      </div>
    </BottomDrawer>
  );
}

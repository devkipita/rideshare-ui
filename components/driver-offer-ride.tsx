"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  CalendarDays,
  Clock,
  DollarSign,
  Users,
  PawPrint,
  LuggageIcon,
  PlaneTakeoff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { filterTowns } from "@/lib/kenyan-towns";
import {
  ChipToggle,
  FormDivider,
  LocationInput,
  PillButton,
  Surface,
} from "./ui-parts";
import { DatePickerCard } from "./ui/date-picker";

interface OfferRideForm {
  from: string;
  to: string;
  date: string;
  departTime: string;
  arrivalTime: string;
  seats: number;
  pricePerSeat: number;
  pets: boolean;
  luggage: boolean;
  airport: boolean;
}

interface DriverOfferRideProps {
  onSubmit?: (form: OfferRideForm) => void;
}

type LocationField = "from" | "to";
const MIN_TOWN_CHARS = 2;

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DriverOfferRide({ onSubmit }: DriverOfferRideProps) {
  const [form, setForm] = useState<OfferRideForm>({
    from: "",
    to: "",
    date: "",
    departTime: "",
    arrivalTime: "",
    seats: 4,
    pricePerSeat: 1200,
    pets: false,
    luggage: false,
    airport: false,
  });

  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [dateOpen, setDateOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const minDate = useMemo(() => todayISO(), []);

  const canPost = useMemo(() => {
    return Boolean(
      form.from.trim() &&
      form.to.trim() &&
      form.date &&
      form.departTime &&
      form.seats > 0 &&
      Number.isFinite(form.pricePerSeat) &&
      form.pricePerSeat > 0,
    );
  }, [form]);

  const update = <K extends keyof OfferRideForm>(k: K, v: OfferRideForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleLocationChange = (
    field: LocationField,
    v: string,
    setSug: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    update(field, v);
    const q = v.trim();
    if (q.length < MIN_TOWN_CHARS) return setSug([]);
    setSug(filterTowns(q));
  };

  const handleLocationSelect =
    (
      field: LocationField,
      setSug: React.Dispatch<React.SetStateAction<string[]>>,
    ) =>
    (v: string) => {
      update(field, v);
      setSug([]);
    };

  const handleLocationClear =
    (
      field: LocationField,
      setSug: React.Dispatch<React.SetStateAction<string[]>>,
    ) =>
    () => {
      update(field, "");
      setSug([]);
    };

  const swap = () =>
    setForm((p) => ({
      ...p,
      from: p.to,
      to: p.from,
    }));

  useEffect(() => {
    if (!isSubmitted) return;
    const t = window.setTimeout(() => {
      setIsSubmitted(false);
      setForm({
        from: "",
        to: "",
        date: "",
        departTime: "",
        arrivalTime: "",
        seats: 4,
        pricePerSeat: 1200,
        pets: false,
        luggage: false,
        airport: false,
      });
      setFromSuggestions([]);
      setToSuggestions([]);
      setDateOpen(false);
    }, 1800);

    return () => window.clearTimeout(t);
  }, [isSubmitted]);

  const handleSubmit = () => {
    if (!canPost) return;
    setIsSubmitted(true);
    onSubmit?.(form);
  };

  if (isSubmitted) {
    return (
      <div className="w-full overflow-x-hidden">
        <div className="mx-auto max-w-screen-sm px-2 pb-[calc(env(safe-area-inset-bottom)+96px)]">
          <Surface elevated className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl grid place-items-center bg-primary/12 border border-primary/15">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.6}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-extrabold tracking-tight">
                  Ride posted
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Your ride is live. Requests will appear in your inbox.
                </p>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    );
  }

  const routeLine =
    form.from || form.to
      ? `${form.from || "From where?"} → ${form.to || "To where?"}`
      : "From where? → To where?";

  return (
    <div className="w-full overflow-x-hidden">
      <div className="mx-auto max-w-screen-sm px-2 pb-[calc(env(safe-area-inset-bottom)+96px)] space-y-3">
        <p className="mt-1 p-1 text-[18px] font-semibold leading-tight tracking-tight text-accent">
          Share your route{" "}
          <span className="text-secondary">fill your empty seats</span>.
        </p>

        <Surface elevated className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-muted-foreground">
                Route
              </p>
              <p className="mt-1 text-[15px] font-semibold tracking-tight truncate">
                {routeLine}
              </p>
            </div>

            <button
              type="button"
              onClick={swap}
              className={cn(
                "h-10 w-10 rounded-2xl grid place-items-center",
                "bg-primary text-primary-foreground",
                "shadow-[0_18px_44px_-34px_rgba(6,78,59,0.55)]",
                "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
              )}
              aria-label="Swap from and to"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 rounded-3xl border border-border/70 bg-card/60 overflow-visible">
            <div className="p-3">
              <LocationInput
                id="offer-from"
                label="From"
                value={form.from}
                placeholder="Leaving From"
                suggestions={fromSuggestions}
                minChars={MIN_TOWN_CHARS}
                onChange={(v) =>
                  handleLocationChange("from", v, setFromSuggestions)
                }
                onSelect={handleLocationSelect("from", setFromSuggestions)}
                onClear={handleLocationClear("from", setFromSuggestions)}
                compact
                nextFocusId="offer-to"
              />
            </div>

            <FormDivider />

            <div className="p-3">
              <LocationInput
                id="offer-to"
                label="To"
                value={form.to}
                placeholder="Going To"
                suggestions={toSuggestions}
                minChars={MIN_TOWN_CHARS}
                onChange={(v) =>
                  handleLocationChange("to", v, setToSuggestions)
                }
                onSelect={handleLocationSelect("to", setToSuggestions)}
                onClear={handleLocationClear("to", setToSuggestions)}
                compact
              />
            </div>
          </div>
        </Surface>

        <div className="grid grid-cols-2 gap-2">
          <Surface elevated className="p-4" focusRing>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold tracking-tight">Date</p>
              <button
                type="button"
                onClick={() => setDateOpen(true)}
                className={cn(
                  "h-10 w-10 rounded-2xl grid place-items-center",
                  "hover:bg-primary/10 active:scale-[0.98]",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                )}
                aria-label="Open calendar"
              >
                <CalendarDays className="h-4 w-4 text-primary" />
              </button>
            </div>

            <div className="mt-3">
              <DatePickerCard
                label="Travel date"
                value={form.date}
                min={minDate}
                onChange={(iso) => update("date", iso)}
                variant="embedded"
                open={dateOpen}
                onOpenChange={setDateOpen}
              />
            </div>
          </Surface>

          <Surface elevated className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl grid place-items-center bg-primary/10 border border-primary/15">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-muted-foreground">
                  Seats
                </p>
                <p className="mt-0.5 text-[15px] font-semibold tracking-tight">
                  {form.seats}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <PillButton
                  key={n}
                  active={form.seats === n}
                  onClick={() => update("seats", n)}
                  className="h-10 px-4"
                >
                  {n}
                </PillButton>
              ))}
            </div>
          </Surface>
        </div>

        <Surface elevated className="p-4">
          <p className="text-[13px] font-semibold tracking-tight">Time</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5">
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Depart
              </div>
              <Input
                type="time"
                value={form.departTime}
                onChange={(e) => update("departTime", e.target.value)}
                className="mt-1 h-8 border-0 bg-transparent p-0 text-[15px] font-semibold tracking-tight focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5">
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Arrive
              </div>
              <Input
                type="time"
                value={form.arrivalTime}
                onChange={(e) => update("arrivalTime", e.target.value)}
                className="mt-1 h-8 border-0 bg-transparent p-0 text-[15px] font-semibold tracking-tight focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </Surface>

        <Surface elevated className="p-4">
          <p className="text-[13px] font-semibold tracking-tight">Price</p>

          <div className="mt-3 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                Per seat
              </div>
              <span className="text-[11px] text-muted-foreground">KES</span>
            </div>

            <Input
              type="number"
              inputMode="numeric"
              value={form.pricePerSeat}
              onChange={(e) => update("pricePerSeat", Number(e.target.value))}
              className="mt-1 h-8 border-0 bg-transparent p-0 text-[15px] font-semibold tracking-tight focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </Surface>

        <Surface elevated className="p-3">
          <p className="px-1 text-[13px] font-semibold tracking-tight">
            Amenities
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <ChipToggle
              icon={PawPrint}
              label="Pets OK"
              active={form.pets}
              onClick={() => update("pets", !form.pets)}
              size="sm"
            />
            <ChipToggle
              icon={LuggageIcon}
              label="Luggage"
              active={form.luggage}
              onClick={() => update("luggage", !form.luggage)}
              size="sm"
            />
            <ChipToggle
              icon={PlaneTakeoff}
              label="Airport"
              active={form.airport}
              onClick={() => update("airport", !form.airport)}
              size="sm"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canPost}
            className={cn(
              "mt-3 h-12 w-full rounded-2xl font-semibold tracking-tight",
              "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]",
              "bg-primary text-primary-foreground",
              "shadow-[0_18px_44px_-34px_rgba(6,78,59,0.55)]",
              "disabled:opacity-100 disabled:bg-primary/35 disabled:text-primary-foreground/80 disabled:shadow-none",
            )}
          >
            Post ride
          </Button>
        </Surface>
      </div>
    </div>
  );
}

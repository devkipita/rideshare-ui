"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  ArrowUpDown,
  Users,
  CalendarDays,
  PawPrint,
  LuggageIcon,
  PlaneIcon,
  ArrowRightIcon,
} from "lucide-react";
import { filterTowns } from "@/lib/kenyan-towns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChipToggle,
  FormDivider,
  LocationInput,
  PillButton,
  Surface,
} from "./ui-parts";
import { DatePickerCard } from "./ui/date-picker";

export interface SearchFilters {
  from: string;
  to: string;
  date: string;
  seats: number;
  pets: boolean;
  luggage: boolean;
  airport: boolean;
}

type Props = {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onSearch: () => void;
  loading?: boolean;
};

type LocationField = "from" | "to";
type Toggleable = "pets" | "luggage" | "airport";
type SetSug = Dispatch<SetStateAction<string[]>>;

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const CARD_FOCUS = cn(
  "focus-within:border-transparent",
  "focus-within:ring-2 focus-within:ring-primary/55",
  "transition-[box-shadow,border-color] duration-200 ease-app",
);

// ✅ start suggesting after user types at least 2 chars
const MIN_TOWN_CHARS = 2;

export function PassengerSearchForm({
  filters,
  onChange,
  onSearch,
  loading,
}: Props) {
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const minDate = useMemo(() => todayISO(), []);
  const [dateOpen, setDateOpen] = useState(false);

  const canSearch = useMemo(
    () => Boolean(filters.from && filters.to && filters.date),
    [filters.from, filters.to, filters.date],
  );

  const update = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) =>
    onChange({ ...filters, [k]: v });

  const handleLocationChange = (
    field: LocationField,
    v: string,
    setSug: SetSug,
  ) => {
    update(field, v);

    const q = v.trim();
    if (q.length < MIN_TOWN_CHARS) {
      setSug([]); 
      return;
    }

    setSug(filterTowns(q)); 
  };

  const handleLocationSelect =
    (field: LocationField, setSug: SetSug) => (v: string) => {
      update(field, v);
      setSug([]);
    };

  const handleLocationClear = (field: LocationField, setSug: SetSug) => () => {
    update(field, "");
    setSug([]);
  };

  const swap = () =>
    onChange({ ...filters, from: filters.to, to: filters.from });

  const setSeats = (n: number) => () => update("seats", n);
  const toggle = (k: Toggleable) => () => update(k, !filters[k]);

  const fromLabel = filters.from || "Where from?";
const toLabel = filters.to || "Where to?";

const routeLine = (
  <span className="inline-flex items-center gap-2 truncate">
    <span className="truncate">{fromLabel}</span>
    <ArrowRightIcon className="h-4 w-4 shrink-0 text-primary/80" aria-hidden="true" />
    <span className="truncate">{toLabel}</span>
  </span>
);

  return (
    <div className="space-y-3">
      <div className="px-4">
        <p className="text-[12px] font-medium text-muted-foreground">Hi 👋</p>
        <p className="mt-1 text-[18px] font-semibold leading-tight tracking-tight">
          Let’s find you great rides <span className="text-primary">today</span>
          .
        </p>
      </div>

      <Surface elevated className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-muted-foreground">
              Route
            </p>
            <p className="mt-1 text-[15px] sm:text-[16px] font-semibold tracking-tight truncate">
              {routeLine}
            </p>
          </div>
        </div>

        {/* overflow-visible so popup can float; swap z-index lowered so popup stays on top */}
        <div
          className={cn(
            "mt-3 relative rounded-3xl border border-border/70 bg-card/60 overflow-visible",
            CARD_FOCUS,
          )}
        >
          <button
            type="button"
            onClick={swap}
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20",
              "h-11 w-11 rounded-2xl grid place-items-center",
              "bg-primary text-primary-foreground",
              "shadow-[0_18px_44px_-30px_rgba(6,78,59,0.55)]",
              "transition-all duration-300 ease-app active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
            )}
            aria-label="Swap from and to"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>

          <div className="p-3 sm:p-3.5">
            <LocationInput
              id="from"
              label="From"
              value={filters.from}
              placeholder="Nanyuki"
              suggestions={fromSuggestions}
              minChars={MIN_TOWN_CHARS}
              onChange={(v) =>
                handleLocationChange("from", v, setFromSuggestions)
              }
              onSelect={handleLocationSelect("from", setFromSuggestions)}
              onClear={handleLocationClear("from", setFromSuggestions)}
              compact
            />
          </div>

          <FormDivider />

          <div className="p-3 sm:p-3.5">
            <LocationInput
              id="to"
              label="To"
              value={filters.to}
              placeholder="Nairobi"
              suggestions={toSuggestions}
              minChars={MIN_TOWN_CHARS}
              onChange={(v) => handleLocationChange("to", v, setToSuggestions)}
              onSelect={handleLocationSelect("to", setToSuggestions)}
              onClear={handleLocationClear("to", setToSuggestions)}
              compact
            />
          </div>
        </div>
      </Surface>

      <div className="grid grid-cols-2 gap-2">
        <Surface elevated className="p-4" focusRing>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold tracking-tight">
              Travel date
            </p>
            <button
              type="button"
              onClick={() => setDateOpen(true)}
              className={cn(
                "h-10 w-10 rounded-2xl grid place-items-center",
                "hover:bg-primary/10 active:scale-[0.98]",
                "transition-all duration-300 ease-app",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
              )}
              aria-label="Open travel date picker"
            >
              <CalendarDays className="h-4 w-4 text-primary" />
            </button>
          </div>

          <div className="mt-3">
            <DatePickerCard
              label="Travel date"
              value={filters.date}
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
                {filters.seats}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <PillButton
                key={n}
                active={filters.seats === n}
                onClick={setSeats(n)}
                className="h-10 rounded-2xl px-0 text-[13px] font-semibold"
              >
                {n}
              </PillButton>
            ))}
          </div>
        </Surface>
      </div>

      <Surface elevated className="p-3">
        <div className="flex flex-wrap gap-2">
          <ChipToggle
            icon={PawPrint}
            label="Pets"
            active={filters.pets}
            onClick={toggle("pets")}
            size="sm"
          />
          <ChipToggle
            icon={LuggageIcon}
            label="Luggage"
            active={filters.luggage}
            onClick={toggle("luggage")}
            size="sm"
          />
          <ChipToggle
            icon={PlaneIcon}
            label="Airport"
            active={filters.airport}
            onClick={toggle("airport")}
            size="sm"
          />
        </div>

        <Button
          onClick={onSearch}
          disabled={!canSearch || !!loading}
          className={cn(
            "mt-3 h-12 w-full rounded-4xl font-semibold tracking-tight",
            "transition-all duration-300 ease-app active:scale-[0.99]",
            "bg-primary text-primary-foreground shadow-[0_18px_44px_-34px_rgba(6,78,59,0.55)]",
            "hover:brightness-[0.99]",
            "disabled:opacity-100 disabled:bg-primary/35 disabled:text-primary-foreground/80 disabled:shadow-none",
          )}
        >
          {loading ? "Searching…" : "Search For Rides"}
        </Button>
      </Surface>
    </div>
  );
}

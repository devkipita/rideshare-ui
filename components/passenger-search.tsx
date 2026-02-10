"use client";

import { useMemo, useState } from "react";
import { PassengerSearchForm, type SearchFilters } from "./PassengerSearchForm";
import { RideResults, type Driver } from "./RideResults";
import { AppBackdrop, BottomSheet, MapPreview, Surface } from "./ui-parts";

type Status = "idle" | "loading" | "ready";

const HIDE_SCROLLBAR =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export function PassengerSearch({
  onSearch,
}: {
  onSearch?: (filters: SearchFilters) => void;
}) {
  const [filters, setFilters] = useState<SearchFilters>({
    from: "",
    to: "",
    date: "",
    seats: 2,
    pets: true,
    luggage: false,
    airport: false,
  });

  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<Driver[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const canSearch = useMemo(
    () => Boolean(filters.from && filters.to && filters.date),
    [filters.from, filters.to, filters.date],
  );

  const runSearch = () => {
    if (!canSearch || status === "loading") return;
    onSearch?.(filters);
    setStatus("loading");
    setResults([]);
    setSheetOpen(true);

    window.setTimeout(() => {
      setResults([
        { name: "James K.", rating: 4.8, trips: 120, price: 1200 },
        { name: "Amina W.", rating: 4.9, trips: 88, price: 1350 },
        { name: "Peter M.", rating: 4.7, trips: 210, price: 1100 },
      ]);
      setStatus("ready");
    }, 850);
  };

  const showDesktopResults = status !== "idle";

  return (
    <AppBackdrop>
      {/* ✅ Mobile scroll container (prevents clipping) */}
      <div
        className={[
          "h-dvh overflow-y-auto overflow-x-hidden overscroll-y-contain",
          "touch-pan-y",
          HIDE_SCROLLBAR,
        ].join(" ")}
      >
        <div className="mx-auto max-w-[1100px]">
          {/* ✅ add safe-area padding so bottom content (Search button/Tip) never hides */}
          <div className="md:px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+24px)]">
            <div className="grid gap-3 md:gap-4 md:grid-cols-[420px_1fr] items-start">
              {/* Left */}
              <div className="space-y-3 md:sticky md:top-4 md:bottom-4">
                <PassengerSearchForm
                  filters={filters}
                  onChange={setFilters}
                  onSearch={runSearch}
                  loading={status === "loading"}
                />

                <Surface elevated className="p-4">
                  <p className="text-[12px] font-extrabold tracking-tight">
                    Tip
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Try flexible dates — you’ll see more drivers and better
                    prices.
                  </p>
                </Surface>
              </div>

              {/* Right (desktop only) */}
              <div className="hidden md:block space-y-3">
                {showDesktopResults ? (
                  <>
                    <Surface elevated className="p-3 md:p-4">
                      <MapPreview from={filters.from} to={filters.to} />
                    </Surface>
                    <RideResults status={status} results={results} />
                  </>
                ) : (
                  <Surface elevated className="p-4">
                    <p className="text-sm font-extrabold tracking-tight text-foreground/85">
                      Start by picking your route
                    </p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Choose towns, a date, and seats — results will appear
                      here.
                    </p>
                  </Surface>
                )}
              </div>
            </div>

            <BottomSheet
              open={sheetOpen && status !== "idle"}
              onOpenChange={setSheetOpen}
              title={
                status === "loading" ? "Searching rides…" : "Available rides"
              }
            >
              <div className="space-y-3">
                <Surface elevated className="p-3">
                  <MapPreview from={filters.from} to={filters.to} />
                </Surface>
                <RideResults status={status} results={results} />
              </div>
            </BottomSheet>
          </div>
        </div>
      </div>
    </AppBackdrop>
  );
}

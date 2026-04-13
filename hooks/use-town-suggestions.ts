"use client";

import { useMemo } from "react";
import { filterTowns } from "@/lib/kenyan-towns";
import { LIMITS } from "@/lib/constants";
import { useDebounce } from "./use-debounce";

export function useTownSuggestions(value: string, minChars = 2) {
  const debounced = useDebounce(value.trim(), LIMITS.searchDebounceMs);

  return useMemo(() => {
    if (debounced.length < minChars) return [];
    return filterTowns(debounced);
  }, [debounced, minChars]);
}

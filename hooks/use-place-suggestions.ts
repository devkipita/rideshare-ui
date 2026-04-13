"use client";

import { useMemo } from "react";
import { LIMITS } from "@/lib/constants";
import { filterPlaces } from "@/lib/kenyan-places";
import { useDebounce } from "./use-debounce";

export function usePlaceSuggestions(city: string, value: string, minChars = 1) {
  const debounced = useDebounce(value.trim(), LIMITS.searchDebounceMs);
  const normalizedCity = city.trim();

  return useMemo(() => {
    if (!normalizedCity || debounced.length < minChars) return [];
    return filterPlaces(normalizedCity, debounced);
  }, [debounced, minChars, normalizedCity]);
}

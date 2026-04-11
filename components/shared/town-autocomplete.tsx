"use client";

import { useState, useMemo } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { filterTowns } from "@/lib/kenyan-towns";
import { useDebounce } from "@/hooks/use-debounce";
import { LIMITS } from "@/lib/constants";

interface TownAutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  onSelect: (town: string) => void;
  placeholder: string;
  label: string;
  id: string;
}

export function TownAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  label,
  id,
}: TownAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const debounced = useDebounce(value, LIMITS.searchDebounceMs);

  const suggestions = useMemo(() => {
    if (!debounced || debounced.length < 2) return [];
    return filterTowns(debounced).slice(0, 8);
  }, [debounced]);

  const showDropdown = focused && suggestions.length > 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 border border-primary/15">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
          <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder={placeholder}
            className="h-8 w-full bg-transparent outline-none text-[15px] font-semibold tracking-tight placeholder:text-muted-foreground/80"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted-foreground px-1 text-lg"
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <div className={cn(
          "absolute left-0 right-0 top-full mt-2 z-50",
          "rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl",
          "max-h-[264px] overflow-y-auto p-2",
          "shadow-[0_18px_44px_-34px_oklch(var(--primary)/0.28)]",
        )}>
          {suggestions.map((town, idx) => (
            <button
              key={town + idx}
              type="button"
              onMouseDown={() => { onSelect(town); setFocused(false); }}
              className="w-full text-left px-4 py-3 rounded-full hover:bg-primary/10 text-sm font-semibold"
            >
              {town}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

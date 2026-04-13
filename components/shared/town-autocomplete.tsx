"use client";

import { MapPin } from "lucide-react";
import { LocationInput } from "@/components/ui-parts";
import { useTownSuggestions } from "@/hooks/use-town-suggestions";

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
  const suggestions = useTownSuggestions(value);

  return (
    <LocationInput
      id={id}
      label={label}
      value={value}
      placeholder={placeholder}
      suggestions={suggestions}
      minChars={2}
      onChange={onChange}
      onSelect={onSelect}
      onClear={() => onChange("")}
      icon={MapPin}
    />
  );
}

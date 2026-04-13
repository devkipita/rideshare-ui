"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePreferencesStore } from "@/store";

type ResolvedTheme = "light" | "dark";

function getPreferredTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useAppPreferences() {
  const theme = usePreferencesStore((s) => s.theme);
  const language = usePreferencesStore((s) => s.language);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current || typeof window === "undefined") return;

    hydrated.current = true;

    const legacyTheme = window.localStorage.getItem("theme");
    if (theme === "system" && (legacyTheme === "light" || legacyTheme === "dark")) {
      setTheme(legacyTheme);
    }

    const legacyLanguage = window.localStorage.getItem("kipita-lang");
    if (
      legacyLanguage &&
      (legacyLanguage === "en" || legacyLanguage === "sw") &&
      legacyLanguage !== language
    ) {
      setLanguage(legacyLanguage);
    }
  }, [language, setLanguage, setTheme, theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextTheme = theme === "system" ? getPreferredTheme() : theme;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("theme", nextTheme);
    setResolvedTheme(nextTheme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.lang = language;
    window.localStorage.setItem("kipita-lang", language);
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === "dark",
      setTheme,
      toggleTheme,
      language,
      setLanguage,
    }),
    [language, resolvedTheme, setLanguage, setTheme, theme, toggleTheme],
  );
}

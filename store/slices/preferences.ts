import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";
type Language = "en" | "sw";

interface FormDraft {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  seats?: number;
  pets?: boolean;
  luggage?: boolean;
}

interface PreferencesState {
  theme: Theme;
  language: Language;
  formDraft: FormDraft;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  updateFormDraft: (draft: Partial<FormDraft>) => void;
  clearFormDraft: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "en",
      formDraft: {},

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      updateFormDraft: (draft) =>
        set((s) => ({ formDraft: { ...s.formDraft, ...draft } })),
      clearFormDraft: () => set({ formDraft: {} }),
    }),
    {
      name: "kipita-prefs",
      partialize: (s) => ({
        theme: s.theme,
        language: s.language,
        formDraft: s.formDraft,
      }),
    },
  ),
);

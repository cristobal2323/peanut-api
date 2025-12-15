import { create } from "zustand";

export type Locale = "en" | "es";

type PreferencesState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  locale: "es",
  setLocale: (locale) => set({ locale }),
  toggleLocale: () => {
    const current = get().locale;
    set({ locale: current === "es" ? "en" : "es" });
  }
}));

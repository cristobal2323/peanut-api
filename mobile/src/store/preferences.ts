import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Locale = "en" | "es";

export type NotificationPrefs = {
  nearby: boolean;
  matches: boolean;
  sightings: boolean;
  emailDigest: boolean;
};

type PreferencesState = {
  locale: Locale;
  onboardingDone: boolean;
  notifications: NotificationPrefs;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  setOnboardingDone: (done: boolean) => void;
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      locale: "es",
      onboardingDone: false,
      notifications: {
        nearby: true,
        matches: true,
        sightings: true,
        emailDigest: false,
      },
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => {
        const current = get().locale;
        set({ locale: current === "es" ? "en" : "es" });
      },
      setOnboardingDone: (onboardingDone) => set({ onboardingDone }),
      setNotificationPref: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),
    }),
    {
      name: "peanut-preferences",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

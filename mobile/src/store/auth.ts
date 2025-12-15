import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  login: (user: User, token: string, refreshToken?: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken: refreshToken ?? null }),
      logout: () => set({ user: null, token: null, refreshToken: null })
    }),
    {
      name: "peanut-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken
      })
    }
  )
);

// Hook to know when hydration finished to avoid redirect loops.
export const useAuthHydration = () => {
  const [hydrated, setHydrated] = useState(
    useAuthStore.persist.hasHydrated?.() ?? false
  );

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration?.(() =>
      setHydrated(true)
    );
    if (useAuthStore.persist.hasHydrated?.()) {
      setHydrated(true);
    }
    return () => unsub?.();
  }, []);

  return hydrated;
};

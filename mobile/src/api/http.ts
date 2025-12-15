import { usePreferencesStore } from "../store/preferences";
import { useAuthStore } from "../store/auth";
import { AuthResponse } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

type Options = RequestInit & { token?: string; skipAuth?: boolean; _retry?: boolean };

export async function http<T>(path: string, options: Options = {}): Promise<T> {
  const debug = __DEV__;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": usePreferencesStore.getState().locale,
    ...(options.headers as Record<string, string> | undefined)
  };

  const authState = useAuthStore.getState();
  const bearer = options.token || (options.skipAuth ? undefined : authState.token);
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  if (debug) {
    console.log("[HTTP] ->", path, options.method ?? "GET", {
      headers,
      body: options.body
    });
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (debug) {
      console.log("[HTTP] <-", res.status, path, data);
    }
    // Attempt refresh on 401 once
    if (
      res.status === 401 &&
      !options._retry &&
      !options.skipAuth &&
      authState.refreshToken
    ) {
      try {
        const refreshed = await fetch(`${API_URL}/users/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": headers["Accept-Language"] || "es"
          },
          body: JSON.stringify({ refreshToken: authState.refreshToken })
        })
          .then(async (r) => {
            const txt = await r.text();
            const json = txt ? JSON.parse(txt) : null;
            if (!r.ok) {
              throw new Error(json?.message || r.statusText);
            }
            return json as AuthResponse;
          });
        useAuthStore.getState().login(refreshed.user, refreshed.token, authState.refreshToken);
        return http<T>(path, { ...options, _retry: true });
      } catch (err) {
        useAuthStore.getState().logout();
      }
    }

    const message = data?.message || res.statusText;
    throw new Error(Array.isArray(message) ? message[0] : message);
  }

  if (debug) {
    console.log("[HTTP] <-", res.status, path, data);
  }

  return data as T;
}

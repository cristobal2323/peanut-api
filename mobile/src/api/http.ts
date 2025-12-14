const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

type Options = RequestInit & { token?: string };

export async function http<T>(path: string, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined)
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message || res.statusText;
    throw new Error(Array.isArray(message) ? message[0] : message);
  }

  return data as T;
}

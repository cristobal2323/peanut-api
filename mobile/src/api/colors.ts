import { http } from "./http";

export type ColorOption = {
  id: string;
  slug: string;
  name: string;
  hex?: string | null;
};

export const colorsApi = {
  list: (q?: string) =>
    http<ColorOption[]>(
      `/colors${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      { skipAuth: true }
    ),
};

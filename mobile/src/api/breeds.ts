import { http } from "./http";

export type BreedOption = {
  id: string;
  slug: string;
  name: string;
};

export const breedsApi = {
  list: (q?: string) =>
    http<BreedOption[]>(
      `/breeds${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      { skipAuth: true }
    ),
};

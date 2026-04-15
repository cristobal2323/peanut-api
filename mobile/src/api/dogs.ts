import { http } from "./http";
import { Dog, DogStatus } from "../types";

export type DogSexApi = "MALE" | "FEMALE" | "UNKNOWN";
export type DogSizeApi = "SMALL" | "MEDIUM" | "LARGE";

export type CreateDogPayload = {
  name: string;
  breedId?: string;
  mixedBreed?: boolean;
  birthDate?: string;
  sex: DogSexApi;
  colorId?: string;
  size: DogSizeApi;
  microchip?: string;
  passportId?: string;
  photoUrl?: string;
  notes?: string;
};

type BreedRef = { id: string; slug: string; nameEs: string; nameEn: string };
type ColorRef = { id: string; slug: string; nameEs: string; nameEn: string; hex?: string | null };

export type DogApi = {
  id: string;
  ownerId: string;
  name: string;
  breedId?: string | null;
  breed?: BreedRef | null;
  mixedBreed: boolean;
  birthDate?: string | null;
  sex: DogSexApi;
  colorId?: string | null;
  color?: ColorRef | null;
  size: DogSizeApi;
  microchip?: string | null;
  passportId?: string | null;
  photoUrl?: string | null;
  notes?: string | null;
  lostStatus: boolean;
  lostSince?: string | null;
  createdAt: string;
  updatedAt: string;
};

const sexToUi: Record<DogSexApi, Dog["sex"]> = {
  MALE: "male",
  FEMALE: "female",
  UNKNOWN: undefined as unknown as Dog["sex"],
};

const sizeToUi: Record<DogSizeApi, Dog["size"]> = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
};

export function computeAgeYears(iso: string | null | undefined): number | undefined {
  if (!iso) return undefined;
  const birth = new Date(iso);
  if (isNaN(birth.getTime())) return undefined;
  const ms = Date.now() - birth.getTime();
  const years = Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
  return years >= 0 ? years : undefined;
}

export function mapApiDogToDog(dog: DogApi, locale: "es" | "en" = "es"): Dog {
  const status: DogStatus = dog.lostStatus ? "lost" : "normal";
  const breedLabel = dog.breed
    ? locale === "en"
      ? dog.breed.nameEn
      : dog.breed.nameEs
    : dog.mixedBreed
      ? locale === "en"
        ? "Mixed breed"
        : "Mestizo"
      : "";
  const colorLabel = dog.color
    ? locale === "en"
      ? dog.color.nameEn
      : dog.color.nameEs
    : undefined;

  return {
    id: dog.id,
    name: dog.name,
    breed: breedLabel,
    age: computeAgeYears(dog.birthDate),
    birthDate: dog.birthDate ?? undefined,
    sex: sexToUi[dog.sex],
    color: colorLabel,
    size: sizeToUi[dog.size],
    microchip: dog.microchip ?? undefined,
    photo: dog.photoUrl ?? undefined,
    status,
  };
}

export type UpdateDogPayload = Partial<CreateDogPayload>;

export const dogsApi = {
  create: (payload: CreateDogPayload) =>
    http<DogApi>("/dogs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listMine: () => http<DogApi[]>("/dogs"),
  getById: (id: string) => http<DogApi>(`/dogs/${id}`),
  update: (id: string, payload: UpdateDogPayload) =>
    http<DogApi>(`/dogs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (id: string) =>
    http<{ success: boolean }>(`/dogs/${id}`, {
      method: "DELETE",
    }),
};

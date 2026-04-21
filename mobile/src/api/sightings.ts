import { http } from "./http";
import { haversineKm } from "./lostReports";
import type { CommunityReport, MapPin } from "../types";
import type { Locale } from "../store/preferences";

export type SightingStatusApi = "ACTIVE" | "FOUND" | "CLOSED";

export type SightingApi = {
  id: string;
  userId: string;
  dogId?: string | null;
  lostReportId?: string | null;
  notes?: string | null;
  status: SightingStatusApi;
  createdAt: string;
  location: {
    id: string;
    latitude: number;
    longitude: number;
    addressText?: string | null;
  };
  image?: { id: string; url: string; type: string } | null;
  user: { id: string; name: string };
  dog?: {
    id: string;
    name: string;
    breed?: { name: string } | null;
    color?: { name: string } | null;
  } | null;
};

export type CreateSightingPayload = {
  latitude: number;
  longitude: number;
  addressText?: string;
  imageUrl?: string;
  notes?: string;
  dogId?: string;
  lostReportId?: string;
};

export type PublicSightingStatusParam = "active" | "found" | "any";

export type ListPublicSightingsParams = {
  skip?: number;
  take?: number;
  maxKm?: number;
  lat?: number;
  lng?: number;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  since?: string;
  status?: PublicSightingStatusParam;
};

export type ListPublicSightingsResponse = {
  items: SightingApi[];
  nextCursor: number | null;
};

function buildQuery(params: ListPublicSightingsParams): string {
  const parts: string[] = [];
  (Object.keys(params) as (keyof ListPublicSightingsParams)[]).forEach((k) => {
    const v = params[k];
    if (v === undefined || v === null || v === "") return;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  });
  return parts.length ? `?${parts.join("&")}` : "";
}

export const sightingsApi = {
  create: (payload: CreateSightingPayload) =>
    http<SightingApi>("/sightings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listPublic: (params: ListPublicSightingsParams = {}) =>
    http<ListPublicSightingsResponse>(
      `/sightings/public${buildQuery(params)}`
    ),
  listMine: (params: { skip?: number; take?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.skip != null) qs.set("skip", String(params.skip));
    if (params.take != null) qs.set("take", String(params.take));
    const q = qs.toString();
    return http<ListPublicSightingsResponse>(
      `/sightings/mine${q ? `?${q}` : ""}`
    );
  },
  markFound: (id: string) =>
    http<SightingApi>(`/sightings/${id}/found`, { method: "POST" }),
  close: (id: string) =>
    http<SightingApi>(`/sightings/${id}/close`, { method: "POST" }),
};

export function mapSightingToMapPin(
  s: SightingApi,
  locale: Locale = "es",
  userCoords?: { latitude: number; longitude: number } | null
): MapPin | null {
  const loc = s.location;
  if (!loc) return null;
  const distance = userCoords ? haversineKm(userCoords, loc) : 0;
  const dogName =
    s.dog?.name ?? (locale === "es" ? "Perro encontrado" : "Found dog");
  return {
    id: `sighting-${s.id}`,
    lat: loc.latitude,
    lng: loc.longitude,
    name: dogName,
    photo: s.image?.url ?? undefined,
    status: s.status === "FOUND" ? "found" : "sighting",
    distanceKm: Math.round(distance * 10) / 10,
    breed: s.dog?.breed?.name ?? undefined,
    location: loc.addressText ?? undefined,
  };
}

export function mapSightingToCommunityReport(
  s: SightingApi,
  locale: Locale = "es",
  userCoords?: { latitude: number; longitude: number } | null
): CommunityReport {
  const loc = s.location;
  const distance = userCoords && loc ? haversineKm(userCoords, loc) : 0;
  const dogName =
    s.dog?.name ??
    (locale === "es" ? "Perro encontrado" : "Found dog");
  return {
    id: `sighting-${s.id}`,
    dogId: s.dogId ?? "",
    dogName,
    breed: s.dog?.breed?.name ?? "",
    description: s.notes ?? undefined,
    reportType: s.status === "FOUND" ? "found" : "sighting",
    reporterId: s.userId,
    photo: s.image?.url ?? "",
    distanceKm: Math.round(distance * 10) / 10,
    location:
      loc?.addressText ??
      (loc
        ? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`
        : ""),
    createdAt: s.createdAt,
  };
}

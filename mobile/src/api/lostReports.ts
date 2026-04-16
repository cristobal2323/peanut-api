import { http } from "./http";
import { DogApi, mapApiDogToDog } from "./dogs";
import type { CommunityReport, MapPin } from "../types";
import type { Locale } from "../store/preferences";

export type LostReportStatusApi = "ACTIVE" | "RESOLVED" | "CANCELLED";

export type LocationApi = {
  id: string;
  latitude: number;
  longitude: number;
  addressText?: string | null;
  city?: string | null;
  country?: string | null;
};

export type LostReportApi = {
  id: string;
  dogId: string;
  ownerId: string;
  description?: string | null;
  lastSeenLocationId?: string | null;
  lastSeenLocation?: LocationApi | null;
  lastSeenAt?: string | null;
  status: LostReportStatusApi;
  rewardOffered?: number | null;
  createdAt: string;
  updatedAt: string;
  dog?: DogApi;
  owner?: { id: string; name: string; email?: string; phone?: string | null };
};

export type CreateLostReportPayload = {
  dogId: string;
  description?: string;
  lastSeenLatitude?: number;
  lastSeenLongitude?: number;
  lastSeenAddress?: string;
  lastSeenAt?: string;
  rewardOffered?: number;
};

export const lostReportsApi = {
  create: (payload: CreateLostReportPayload) =>
    http<LostReportApi>("/lost-reports", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getActive: () => http<LostReportApi[]>("/lost-reports/active"),
  listMine: () => http<LostReportApi[]>("/lost-reports/mine"),
  getById: (id: string) => http<LostReportApi>(`/lost-reports/${id}`),
  resolve: (id: string) =>
    http<LostReportApi>(`/lost-reports/${id}/resolve`, { method: "POST" }),
  cancel: (id: string) =>
    http<LostReportApi>(`/lost-reports/${id}/cancel`, { method: "POST" }),
};

export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(sa)));
}

export function mapApiLostReportToCommunityReport(
  r: LostReportApi,
  locale: Locale = "es",
  userCoords?: { latitude: number; longitude: number } | null
): CommunityReport {
  const dog = r.dog ? mapApiDogToDog(r.dog, locale) : undefined;
  const loc = r.lastSeenLocation;
  const distance =
    userCoords && loc ? haversineKm(userCoords, loc) : 0;
  return {
    id: r.id,
    dogId: r.dogId,
    dogName: dog?.name ?? "Perro",
    breed: dog?.breed ?? "",
    description: r.description ?? undefined,
    reportType: "lost",
    photo: dog?.photo ?? "",
    distanceKm: Math.round(distance * 10) / 10,
    location:
      loc?.addressText ??
      (loc ? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}` : ""),
    createdAt: r.createdAt,
  };
}

export function mapApiLostReportToMapPin(
  r: LostReportApi,
  locale: Locale = "es",
  userCoords?: { latitude: number; longitude: number } | null
): MapPin | null {
  const loc = r.lastSeenLocation;
  if (!loc) return null;
  const dog = r.dog ? mapApiDogToDog(r.dog, locale) : undefined;
  const distance = userCoords ? haversineKm(userCoords, loc) : 0;
  return {
    id: r.id,
    lat: loc.latitude,
    lng: loc.longitude,
    name: dog?.name ?? "Perro",
    photo: dog?.photo,
    status: "lost",
    distanceKm: Math.round(distance * 10) / 10,
    reportType: "lost",
    breed: dog?.breed,
    location: loc.addressText ?? undefined,
  };
}

export function mapApiLostReport(r: LostReportApi) {
  return {
    id: r.id,
    dogId: r.dogId,
    dogName: r.dog?.name ?? "",
    description: r.description ?? undefined,
    lastSeen: r.lastSeenLocation
      ? {
          latitude: r.lastSeenLocation.latitude,
          longitude: r.lastSeenLocation.longitude,
          address: r.lastSeenLocation.addressText ?? undefined,
          time: r.lastSeenAt ?? undefined,
        }
      : undefined,
    status: r.status,
    rewardOffered: r.rewardOffered ?? undefined,
    createdAt: r.createdAt,
  };
}

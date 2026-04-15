export type DogStatus = "normal" | "lost" | "found";

export type DogSize = "small" | "medium" | "large";

export interface User {
  id: string;
  name: string;
  email: string;
  city?: string;
  country?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age?: number;
  birthDate?: string;
  sex?: "male" | "female";
  color?: string;
  size?: DogSize;
  microchip?: string;
  photo?: string;
  nosePhoto?: string;
  status: DogStatus;
  lastSeen?: {
    latitude: number;
    longitude: number;
    address?: string;
    time?: string;
  };
}

export interface LostReport {
  id: string;
  dogId: string;
  dogName: string;
  description?: string;
  lastSeen: {
    latitude: number;
    longitude: number;
    address?: string;
    time?: string;
  };
  images?: string[];
  qrCode?: string;
  sightings: Sighting[];
}

export interface Sighting {
  id: string;
  dogId: string;
  image?: string;
  comment: string;
  seenAt: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export type NotificationKind = "match" | "sighting" | "system";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: NotificationKind;
}

export type ReportType = "lost" | "found";

export interface CommunityReport {
  id: string;
  dogName: string;
  breed: string;
  description?: string;
  reportType: ReportType;
  photo: string;
  distanceKm: number;
  location: string;
  createdAt: string;
  dogId?: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: string | number;
  refreshToken?: string;
  refreshExpiresIn?: string | number;
  user: User;
}

// ─── New types for redesigned screens ─────────────────────────────

export interface UserStats {
  dogs: number;
  reports: number;
  helps: number;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  name: string;
  photo?: string;
  status: "lost" | "found";
  distanceKm: number;
  reportType?: ReportType;
  breed?: string;
  location?: string;
}

export interface FoundReport {
  id: string;
  photo?: string;
  noseScanned: boolean;
  location: { latitude: number; longitude: number; address?: string };
  comment?: string;
  createdAt: string;
}

export interface MatchBreakdown {
  label: string;
  value: number;
  color: string;
}

export interface MatchResult {
  id: string;
  confidence: number; // 0..100
  registeredDog: Dog;
  foundReport: FoundReport;
  breakdown: MatchBreakdown[];
  owner?: { name: string; phone?: string; avatar?: string };
}

export interface BiometricScanResult {
  matchId: string | null;
  quality: "good" | "poor";
  imageUri: string;
}

export interface AppearanceCandidate {
  matchId: string;
  dog: Dog;
  confidence: number;
}

export interface AppearanceSearchResult {
  candidates: AppearanceCandidate[];
}

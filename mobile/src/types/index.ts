export type DogStatus = "normal" | "lost";

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

export interface AuthResponse {
  token: string;
  expiresIn: string | number;
  user: User;
}

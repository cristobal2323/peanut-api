import {
  Dog,
  LostReport,
  AppNotification,
  Sighting,
  CommunityReport,
  MapPin,
  MatchResult,
  FoundReport,
  UserStats,
  BiometricScanResult,
  User,
} from "../types";
import { useDogsStore } from "../store/dogs";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const sampleDogs: Dog[] = [
  {
    id: "d1",
    name: "Peanut",
    breed: "Beagle Mix",
    age: 4,
    sex: "male",
    color: "Marrón / Blanco",
    size: "medium",
    microchip: "9 8 5 1 2 1 0 0 7 8 9 5 4 3 1",
    status: "normal",
    photo:
      "https://images.unsplash.com/photo-1583512603871-8c539cddf0c3?auto=format&fit=crop&w=800&q=80",
    nosePhoto:
      "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "d2",
    name: "Luna",
    breed: "Border Collie",
    age: 2,
    sex: "female",
    color: "Negro / Blanco",
    size: "medium",
    microchip: "9 8 5 1 2 1 0 0 7 8 9 5 4 3 2",
    status: "lost",
    photo:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80",
    lastSeen: {
      latitude: -33.4489,
      longitude: -70.6693,
      address: "Parque Bicentenario, Vitacura",
      time: "2026-04-04T14:00:00Z",
    },
  },
];

const sampleSightings: Sighting[] = [
  {
    id: "s1",
    dogId: "d2",
    image:
      "https://images.unsplash.com/photo-1517840545243-4eac79608d88?auto=format&fit=crop&w=600&q=80",
    comment: "La vi cerca de la entrada del parque, parecía asustada.",
    seenAt: "2026-04-05T09:30:00Z",
    location: {
      latitude: -33.4471,
      longitude: -70.6709,
    },
  },
  {
    id: "s2",
    dogId: "d2",
    comment: "Anduvo por la ciclovía buscando comida.",
    seenAt: "2026-04-05T18:15:00Z",
    location: {
      latitude: -33.4458,
      longitude: -70.6712,
    },
  },
];

const sampleLostReports: LostReport[] = [
  {
    id: "lr1",
    dogId: "d2",
    dogName: "Luna",
    description:
      "Es muy tímida, responde a su nombre y le encantan los snacks. Por favor contáctame si la ves.",
    images: [
      "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=800&q=80",
    ],
    qrCode:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=Luna",
    lastSeen: {
      latitude: -33.4489,
      longitude: -70.6693,
      address: "Parque Bicentenario, Vitacura",
      time: "2026-04-04T14:00:00Z",
    },
    sightings: sampleSightings,
  },
];

const sampleNotifications: AppNotification[] = [
  {
    id: "n1",
    title: "Posible coincidencia",
    message: "Encontramos un perro parecido a Luna cerca de Plaza Italia.",
    type: "match",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: "n2",
    title: "Nuevo avistamiento",
    message: "Un vecino reportó haber visto un perro similar.",
    type: "sighting",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
  {
    id: "n3",
    title: "Sistema",
    message: "Recuerda mantener actualizado el perfil de tu perro.",
    type: "system",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
];

const sampleCommunityReports: CommunityReport[] = [
  {
    id: "cr1",
    dogName: "Rocky",
    breed: "Beagle",
    description: "Encontrado sin collar. Esperando identificación de trufa.",
    reportType: "found",
    photo:
      "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80",
    distanceKm: 2.8,
    location: "Parque Norte",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dogId: "cr-d1",
  },
  {
    id: "cr2",
    dogName: "Max",
    breed: "Golden Retriever",
    description: "Encontrado con collar azul, muy amigable. Buscando dueño.",
    reportType: "found",
    photo:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    distanceKm: 1.2,
    location: "Plaza Central",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    dogId: "cr-d2",
  },
  {
    id: "cr3",
    dogName: "Luna",
    breed: "Border Collie",
    description: "Se escapó durante paseo. Responde a su nombre, tiene microchip.",
    reportType: "lost",
    photo:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80",
    distanceKm: 4.1,
    location: "Av. Los Leones",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    dogId: "d2",
  },
  {
    id: "cr4",
    dogName: "Coco",
    breed: "Poodle",
    description: "Perdido desde ayer, lleva collar rojo con placa.",
    reportType: "lost",
    photo:
      "https://images.unsplash.com/photo-1594922009922-d1665120be39?auto=format&fit=crop&w=800&q=80",
    distanceKm: 3.5,
    location: "Barrio Italia",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    dogId: "cr-d3",
  },
  {
    id: "cr5",
    dogName: "Toby",
    breed: "Labrador",
    description:
      "Encontrado desorientado en la calle. Sin collar, buen estado.",
    reportType: "found",
    photo:
      "https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=800&q=80",
    distanceKm: 0.8,
    location: "Parque O'Higgins",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    dogId: "cr-d4",
  },
];

// Mutable found reports created during session.
const foundReports: FoundReport[] = [];

// Pre-baked match for testing the MatchResult screen.
const sampleMatch: MatchResult = {
  id: "m1",
  confidence: 87,
  registeredDog: sampleDogs[1], // Luna
  foundReport: {
    id: "fr-demo",
    photo:
      "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=800&q=80",
    noseScanned: true,
    location: {
      latitude: -33.4471,
      longitude: -70.6709,
      address: "Parque Forestal",
    },
    comment: "Encontrado vagando solo cerca de la fuente.",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  breakdown: [
    { label: "Patrón de trufa", value: 92, color: "#10B981" },
    { label: "Forma facial", value: 85, color: "#10B981" },
    { label: "Color y manchas", value: 88, color: "#10B981" },
    { label: "Tamaño y proporción", value: 80, color: "#F59E42" },
  ],
  owner: {
    name: "María González",
    phone: "+56 9 8765 4321",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
};

const matches: Record<string, MatchResult> = {
  m1: sampleMatch,
};

const sampleMapPins: MapPin[] = [
  {
    id: "cr1",
    lat: -33.4180,
    lng: -70.6080,
    name: "Rocky",
    breed: "Beagle",
    photo:
      "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80",
    status: "found",
    distanceKm: 2.8,
    location: "Parque Norte",
    reportType: "found",
  },
  {
    id: "cr2",
    lat: -33.4378,
    lng: -70.6505,
    name: "Max",
    breed: "Golden Retriever",
    photo:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    status: "found",
    distanceKm: 1.2,
    location: "Plaza Central",
    reportType: "found",
  },
  {
    id: "cr3",
    lat: -33.4489,
    lng: -70.6693,
    name: "Luna",
    breed: "Border Collie",
    photo:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80",
    status: "lost",
    distanceKm: 4.1,
    location: "Av. Los Leones",
    reportType: "lost",
  },
  {
    id: "cr4",
    lat: -33.4267,
    lng: -70.6125,
    name: "Coco",
    breed: "Poodle",
    photo:
      "https://images.unsplash.com/photo-1594922009922-d1665120be39?auto=format&fit=crop&w=800&q=80",
    status: "lost",
    distanceKm: 3.5,
    location: "Barrio Italia",
    reportType: "lost",
  },
  {
    id: "cr5",
    lat: -33.4569,
    lng: -70.6483,
    name: "Toby",
    breed: "Labrador",
    photo:
      "https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=800&q=80",
    status: "found",
    distanceKm: 0.8,
    location: "Parque O'Higgins",
    reportType: "found",
  },
];

const sampleUserStats: UserStats = {
  dogs: 2,
  reports: 5,
  helps: 12,
};

let cachedUser: User | null = null;

export const api = {
  // ── Dogs ─────────────────────────────────────────────
  async fetchDogs(): Promise<Dog[]> {
    await delay();
    return useDogsStore.getState().dogs;
  },
  async fetchDog(id: string): Promise<Dog | undefined> {
    await delay();
    return (
      useDogsStore.getState().dogs.find((d) => d.id === id) ??
      sampleDogs.find((d) => d.id === id)
    );
  },
  async fetchDogById(id: string): Promise<Dog | undefined> {
    return api.fetchDog(id);
  },
  async saveDog(dog: Dog): Promise<Dog> {
    await delay();
    const newDog = { ...dog, id: dog.id || `d-${Date.now()}` };
    useDogsStore.getState().addDog(newDog);
    return newDog;
  },
  async updateDog(id: string, patch: Partial<Dog>): Promise<Dog | undefined> {
    await delay();
    const current = useDogsStore.getState().dogs.find((d) => d.id === id);
    if (!current) return undefined;
    const next = { ...current, ...patch };
    useDogsStore.getState().updateDog(next);
    return next;
  },
  async deleteDog(id: string): Promise<boolean> {
    await delay();
    const store = useDogsStore.getState();
    store.setDogs(store.dogs.filter((d) => d.id !== id));
    return true;
  },
  async toggleLostMode(id: string, status: Dog["status"]) {
    await delay();
    useDogsStore.getState().toggleStatus(id, status);
    return status;
  },

  // ── Lost reports ─────────────────────────────────────
  async fetchLostReports(): Promise<LostReport[]> {
    await delay();
    return sampleLostReports;
  },
  async fetchLostReport(id: string): Promise<LostReport | undefined> {
    await delay();
    return sampleLostReports.find((r) => r.id === id);
  },
  async createLostReport(
    dogId: string,
    payload: {
      description?: string;
      lastSeen: { latitude: number; longitude: number; address?: string; time?: string };
    }
  ): Promise<LostReport> {
    await delay();
    const dog = useDogsStore.getState().dogs.find((d) => d.id === dogId);
    const report: LostReport = {
      id: `lr-${Date.now()}`,
      dogId,
      dogName: dog?.name ?? "Perro",
      description: payload.description,
      images: dog?.photo ? [dog.photo] : [],
      lastSeen: payload.lastSeen,
      sightings: [],
    };
    sampleLostReports.unshift(report);
    if (dog) {
      useDogsStore.getState().toggleStatus(dogId, "lost");
    }
    return report;
  },

  // ── Sightings ────────────────────────────────────────
  async fetchSightings(dogId?: string): Promise<Sighting[]> {
    await delay();
    return sampleSightings.filter((s) => (dogId ? s.dogId === dogId : true));
  },
  async submitSighting(input: Omit<Sighting, "id">): Promise<Sighting> {
    await delay();
    const sighting: Sighting = { ...input, id: `s-${Date.now()}` };
    sampleSightings.push(sighting);
    return sighting;
  },

  // ── Community feed ───────────────────────────────────
  async fetchCommunityReports(): Promise<CommunityReport[]> {
    await delay();
    return sampleCommunityReports;
  },

  // ── Notifications ────────────────────────────────────
  async fetchNotifications(): Promise<AppNotification[]> {
    await delay();
    return sampleNotifications;
  },
  async markNotificationAsRead(id: string) {
    await delay(200);
    const match = sampleNotifications.find((n) => n.id === id);
    if (match) match.read = true;
    return match;
  },
  async markAllNotificationsAsRead() {
    await delay(200);
    sampleNotifications.forEach((n) => (n.read = true));
    return sampleNotifications;
  },

  // ── Scan / Biometric ─────────────────────────────────
  async runBiometricScan(
    imageUri: string,
    dogId?: string
  ): Promise<BiometricScanResult> {
    await delay(1200);
    // Simulate quality detection. Always returns "good" in mock.
    return {
      matchId: dogId ? null : "m1",
      quality: "good",
      imageUri,
    };
  },

  // ── Found dog flow ───────────────────────────────────
  async createFoundDogReport(payload: {
    photo?: string;
    noseScanned: boolean;
    location: { latitude: number; longitude: number; address?: string };
    comment?: string;
  }): Promise<{ matchId: string | null; foundReportId: string }> {
    await delay(1500);
    const report: FoundReport = {
      id: `fr-${Date.now()}`,
      photo: payload.photo,
      noseScanned: payload.noseScanned,
      location: payload.location,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
    };
    foundReports.push(report);
    // Simulate match: if nose was scanned, return the demo match.
    return {
      foundReportId: report.id,
      matchId: payload.noseScanned ? "m1" : null,
    };
  },

  // ── Matches ──────────────────────────────────────────
  async fetchMatch(id: string): Promise<MatchResult | undefined> {
    await delay();
    return matches[id];
  },

  // ── Map ──────────────────────────────────────────────
  async fetchAllPinsOnMap(): Promise<MapPin[]> {
    await delay();
    return sampleMapPins;
  },

  // ── User profile ─────────────────────────────────────
  async fetchUserStats(_userId: string): Promise<UserStats> {
    await delay();
    return sampleUserStats;
  },
  async updateUserProfile(payload: Partial<User>): Promise<User> {
    await delay();
    cachedUser = { ...(cachedUser ?? ({} as User)), ...payload } as User;
    return cachedUser;
  },
};

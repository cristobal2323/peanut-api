import { Dog, LostReport, AppNotification, Sighting } from "../types";
import { useDogsStore } from "../store/dogs";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const sampleDogs: Dog[] = [
  {
    id: "d1",
    name: "Peanut",
    breed: "Beagle Mix",
    age: 4,
    sex: "male",
    color: "Brown / White",
    size: "medium",
    status: "normal",
    photo:
      "https://images.unsplash.com/photo-1583512603871-8c539cddf0c3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "d2",
    name: "Luna",
    breed: "Border Collie",
    age: 2,
    sex: "female",
    color: "Black / White",
    size: "medium",
    status: "lost",
    photo:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80",
    lastSeen: {
      latitude: 37.78825,
      longitude: -122.4324,
      address: "Mission District",
      time: "2024-07-18T14:00:00Z"
    }
  }
];

const sampleSightings: Sighting[] = [
  {
    id: "s1",
    dogId: "d2",
    image:
      "https://images.unsplash.com/photo-1517840545243-4eac79608d88?auto=format&fit=crop&w=600&q=80",
    comment: "Spotted near the park entrance",
    seenAt: "2024-07-18T15:30:00Z",
    location: {
      latitude: 37.78925,
      longitude: -122.4314
    }
  }
];

const sampleLostReports: LostReport[] = [
  {
    id: "lr1",
    dogId: "d2",
    dogName: "Luna",
    description: "Friendly, responds to treats.",
    images: [
      "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=800&q=80"
    ],
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=Luna",
    lastSeen: {
      latitude: 37.78825,
      longitude: -122.4324,
      address: "Mission District",
      time: "2024-07-18T14:00:00Z"
    },
    sightings: sampleSightings
  }
];

const sampleNotifications: AppNotification[] = [
  {
    id: "n1",
    title: "Possible match",
    message: "We found a dog matching Luna near Dolores Park.",
    type: "match",
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: "n2",
    title: "New sighting",
    message: "A neighbor shared a photo of a similar dog.",
    type: "sighting",
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: "n3",
    title: "System",
    message: "Remember to keep your dog profile updated.",
    type: "system",
    createdAt: new Date().toISOString(),
    read: true
  }
];

export const api = {
  async fetchDogs(): Promise<Dog[]> {
    await delay();
    return sampleDogs;
  },
  async fetchDog(id: string): Promise<Dog | undefined> {
    await delay();
    return sampleDogs.find((d) => d.id === id);
  },
  async fetchLostReports(): Promise<LostReport[]> {
    await delay();
    return sampleLostReports;
  },
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
  async fetchNotifications(): Promise<AppNotification[]> {
    await delay();
    return sampleNotifications;
  },
  async markNotificationAsRead(id: string) {
    await delay(200);
    const match = sampleNotifications.find((n) => n.id === id);
    if (match) {
      match.read = true;
    }
    return match;
  },
  async saveDog(dog: Dog): Promise<Dog> {
    await delay();
    const newDog = { ...dog, id: `d-${Date.now()}` };
    useDogsStore.getState().addDog(newDog);
    return newDog;
  },
  async toggleLostMode(id: string, status: Dog["status"]) {
    await delay();
    useDogsStore.getState().toggleStatus(id, status);
    return status;
  }
};

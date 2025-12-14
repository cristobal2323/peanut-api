import { create } from "zustand";
import { Dog } from "../types";

type DogsState = {
  dogs: Dog[];
  setDogs: (dogs: Dog[]) => void;
  addDog: (dog: Dog) => void;
  updateDog: (dog: Dog) => void;
  toggleStatus: (id: string, status: Dog["status"]) => void;
};

const initialDogs: Dog[] = [
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

export const useDogsStore = create<DogsState>((set) => ({
  dogs: initialDogs,
  setDogs: (dogs) => set({ dogs }),
  addDog: (dog) => set((state) => ({ dogs: [...state.dogs, dog] })),
  updateDog: (dog) =>
    set((state) => ({
      dogs: state.dogs.map((d) => (d.id === dog.id ? dog : d))
    })),
  toggleStatus: (id, status) =>
    set((state) => ({
      dogs: state.dogs.map((dog) =>
        dog.id === id ? { ...dog, status } : dog
      )
    }))
}));

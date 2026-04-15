import { create } from "zustand";
import { Dog } from "../types";

type DogsState = {
  dogs: Dog[];
  setDogs: (dogs: Dog[]) => void;
  addDog: (dog: Dog) => void;
  updateDog: (dog: Dog) => void;
  toggleStatus: (id: string, status: Dog["status"]) => void;
};

const initialDogs: Dog[] = [];

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

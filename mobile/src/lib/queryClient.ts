import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  dogs: ["dogs"],
  dog: (id: string) => ["dog", id],
  lostReports: ["lostReports"],
  notifications: ["notifications"],
  sightings: (dogId?: string) => ["sightings", dogId ?? "all"]
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1
    }
  }
});

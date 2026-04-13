import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  dogs: ["dogs"] as const,
  dog: (id: string) => ["dog", id] as const,
  lostReports: ["lostReports"] as const,
  lostReport: (id: string) => ["lostReport", id] as const,
  communityReports: ["communityReports"] as const,
  notifications: ["notifications"] as const,
  sightings: (dogId?: string) => ["sightings", dogId ?? "all"] as const,
  match: (id: string) => ["match", id] as const,
  mapPins: ["mapPins"] as const,
  userStats: (id: string) => ["userStats", id] as const,
  appearanceSearch: (imageUri: string) => ["appearanceSearch", imageUri] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

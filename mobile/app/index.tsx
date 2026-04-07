import { Redirect } from "expo-router";
import { useAuthStore, useAuthHydration } from "../src/store/auth";
import { usePreferencesStore } from "../src/store/preferences";

export default function Index() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthHydration();
  const onboardingDone = usePreferencesStore((state) => state.onboardingDone);

  if (!hydrated) {
    return null;
  }

  if (!onboardingDone) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

import { Redirect } from "expo-router";
import { useAuthStore, useAuthHydration } from "../src/store/auth";

export default function Index() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthHydration();

  if (!hydrated) {
    return null;
  }

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

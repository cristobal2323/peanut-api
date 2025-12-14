import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/auth";

export default function Index() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // In a real app we could hydrate tokens here.
  }, []);

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

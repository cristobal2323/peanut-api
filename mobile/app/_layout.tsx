import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { PeanutTheme } from "../src/theme";
import { queryClient } from "../src/lib/queryClient";
import { initSentry } from "../src/lib/sentry";

const RootLayoutNav = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="dog/[id]" options={{ presentation: "card" }} />
    <Stack.Screen name="dog/new" options={{ presentation: "modal" }} />
    <Stack.Screen
      name="report-sighting"
      options={{ title: "Report sighting", presentation: "modal" }}
    />
  </Stack>
);

export default function RootLayout() {
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={PeanutTheme}>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

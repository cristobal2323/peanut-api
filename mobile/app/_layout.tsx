import { Stack } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { TrufaTheme, colors } from "../src/theme";
import { queryClient } from "../src/lib/queryClient";
import { initSentry } from "../src/lib/sentry";
import { usePushNotifications } from "../src/hooks/usePushNotifications";

SplashScreen.preventAutoHideAsync();

const RootLayoutNav = () => (
  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="dog/[id]" />
    <Stack.Screen name="dog/new" options={{ presentation: "modal" }} />
    <Stack.Screen name="dog/edit/[id]" />
    <Stack.Screen name="scan" />
    <Stack.Screen name="report-lost" options={{ presentation: "modal" }} />
    <Stack.Screen name="report-lost/[dogId]" />
    <Stack.Screen name="report/[id]" />
    <Stack.Screen name="found-dog" />
    <Stack.Screen name="map" />
    <Stack.Screen name="settings" />
    <Stack.Screen name="profile/edit" />
    <Stack.Screen
      name="report-sighting"
      options={{ presentation: "modal" }}
    />
  </Stack>
);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  usePushNotifications();

  useEffect(() => {
    initSentry();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={TrufaTheme}>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

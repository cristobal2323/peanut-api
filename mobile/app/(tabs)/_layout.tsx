import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PeanutTheme } from "../../src/theme";

const iconFor = (name: string) => (props: { color: string; size: number }) => (
  <MaterialCommunityIcons name={name as any} {...props} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PeanutTheme.colors.primary,
        tabBarInactiveTintColor: PeanutTheme.colors.tertiary,
        tabBarStyle: {
          borderTopWidth: 0,
          paddingBottom: 8,
          height: 70
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: iconFor("home-variant")
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: iconFor("qrcode-scan")
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: iconFor("map-marker-radius")
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: iconFor("bell-badge")
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: iconFor("account-circle")
        }}
      />
    </Tabs>
  );
}

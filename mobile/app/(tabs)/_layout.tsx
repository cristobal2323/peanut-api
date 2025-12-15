import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Tabs, Link, useNavigation } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { PeanutTheme, spacing } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";

const iconFor = (name: string) => (props: { color: string; size: number }) => (
  <MaterialCommunityIcons name={name as any} {...props} />
);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: ({ options, route }) => (
          <TabHeader title={(options?.title as string) ?? route.name} routeName={route.name} />
        ),
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#E0E7FF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 2
        },
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: PeanutTheme.colors.primary,
          paddingBottom: bottomInset,
          paddingTop: 6,
          height: 58 + bottomInset
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

const TabHeader = ({ title, routeName }: { title?: string; routeName: string }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.fetchNotifications
  });
  const unread = notifications.filter((n) => !n.read).length;

  const showBack = navigation.canGoBack() && !ROOT_TABS.includes(routeName);

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
      {showBack ? (
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={26} color="#FFFFFF" />
        </Pressable>
      ) : null}
      <View style={styles.headerText}>
        <Text style={styles.headerEyebrow}>{title ?? "Inicio"}</Text>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Hola {user?.name ?? "amigo"} 👋
        </Text>
      </View>
      <Link asChild href="/(tabs)/notifications">
        <Pressable style={styles.headerBell}>
          <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
          {unread > 0 && (
            <Badge style={styles.headerBadge} size={18}>
              {unread}
            </Badge>
          )}
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: PeanutTheme.colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  headerText: {
    flex: 1
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm
  },
  headerEyebrow: {
    color: "#E0E7FF",
    fontSize: 12
  },
  headerTitle: {
    color: "white"
  },
  headerBell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  headerBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: PeanutTheme.colors.error,
    color: "white"
  }
});

const ROOT_TABS = ["index", "scan", "feed", "notifications", "profile"];

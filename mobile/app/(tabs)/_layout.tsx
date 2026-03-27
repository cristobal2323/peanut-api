import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Tabs, Link, useNavigation } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { colors, spacing, radii, fonts } from "../../src/theme";
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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.bodySemiBold,
          marginBottom: 2,
        },
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: colors.surfaceContainerLowest,
          paddingBottom: bottomInset,
          paddingTop: 6,
          height: 58 + bottomInset,
          shadowColor: colors.onSurface,
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: iconFor("home-variant"),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Escanear",
          tabBarIcon: iconFor("qrcode-scan"),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Comunidad",
          tabBarIcon: iconFor("account-group"),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alertas",
          tabBarIcon: iconFor("bell-badge"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: iconFor("account-circle"),
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
    queryFn: api.fetchNotifications,
  });
  const unread = notifications.filter((n) => !n.read).length;

  const showBack = navigation.canGoBack() && !ROOT_TABS.includes(routeName);

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
      {showBack ? (
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.onSurface} />
        </Pressable>
      ) : null}
      <View style={styles.headerText}>
        <Text style={styles.headerEyebrow}>{title ?? "Inicio"}</Text>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Hola {user?.name ?? "amigo"}
        </Text>
      </View>
      <Link asChild href="/(tabs)/notifications">
        <Pressable style={styles.headerBell}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.primary} />
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
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.onSurface,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerText: {
    flex: 1,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  headerEyebrow: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
  },
  headerTitle: {
    color: colors.onSurface,
    fontFamily: fonts.headingMedium,
  },
  headerBell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryFixed,
  },
  headerBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: colors.error,
    color: colors.onError,
  },
});

const ROOT_TABS = ["index", "scan", "feed", "notifications", "profile"];

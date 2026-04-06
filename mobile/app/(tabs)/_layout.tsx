import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Tabs, Link, useNavigation } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { colors, spacing, radii, fonts } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";

const TabIcon = ({
  name,
  color,
}: {
  name: string;
  color: string;
  size: number;
  focused: boolean;
}) => (
  <View style={styles.iconContainer}>
    <MaterialCommunityIcons name={name as any} size={24} color={color} />
  </View>
);

const ScanTabIcon = () => (
  <View style={styles.scanButton}>
    <MaterialCommunityIcons name="scan-helper" size={28} color={colors.onPrimary} />
  </View>
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
        tabBarIconStyle: {
          overflow: "visible",
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
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="home-outline" color={color} size={size} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Comunidad",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="account-group-outline" color={color} size={size} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Escanear",
          tabBarIcon: () => <ScanTabIcon />,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: fonts.bodySemiBold,
            marginBottom: 2,
            marginTop: 18,
          },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="bell-outline" color={color} size={size} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="account-outline" color={color} size={size} focused={focused} />,
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
  const isHome = routeName === "index";

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
      {showBack ? (
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.onSurface} />
        </Pressable>
      ) : (
        <View style={styles.headerAvatar}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.headerAvatarImg} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
            </View>
          )}
        </View>
      )}
      <View style={styles.headerText}>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Hola, {user?.name?.split(" ")[0] ?? "amigo"}
        </Text>
        {isHome && (
          <Text style={styles.headerSub}>Protege a tu perro con su huella nasal</Text>
        )}
        {!isHome && (
          <Text style={styles.headerSub}>{title}</Text>
        )}
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
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: colors.primaryContainer,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  headerAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.onSurface,
    fontFamily: fonts.headingMedium,
    fontSize: 16,
  },
  headerSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 1,
  },
  headerBell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow,
  },
  headerBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    color: colors.onError,
  },
});

const ROOT_TABS = ["index", "scan", "feed", "notifications", "profile"];

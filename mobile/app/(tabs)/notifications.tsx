import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Text, Badge } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { AppNotification } from "../../src/types";
import { EmptyState } from "../../src/components/EmptyState";
import { spacing, colors, radii, fonts } from "../../src/theme";
import { Pressable } from "react-native";

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.fetchNotifications,
  });

  const mutation = useMutation({
    mutationFn: api.markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const iconFor = (type: AppNotification["type"]): string => {
    switch (type) {
      case "match":
        return "paw";
      case "sighting":
        return "map-marker";
      default:
        return "bell-outline";
    }
  };

  const iconColor = (type: AppNotification["type"]) => {
    switch (type) {
      case "match":
        return colors.tertiary;
      case "sighting":
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Notificaciones
      </Text>
      {notifications.length === 0 ? (
        <EmptyState icon="bell-outline" message="Sin alertas nuevas" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.notifCard, !item.read && styles.unreadCard]}
              onPress={() => mutation.mutate(item.id)}
            >
              <View style={[styles.notifIcon, { backgroundColor: `${iconColor(item.type)}15` }]}>
                <MaterialCommunityIcons
                  name={iconFor(item.type) as any}
                  size={22}
                  color={iconColor(item.type)}
                />
              </View>
              <View style={styles.notifContent}>
                <Text variant="titleSmall" style={{ color: colors.onSurface }}>{item.title}</Text>
                <Text style={styles.notifMessage}>{item.message}</Text>
              </View>
              {!item.read && <Badge style={styles.badge} size={10}>{""}</Badge>}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
    color: colors.onSurface,
    fontFamily: fonts.heading,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  unreadCard: {
    backgroundColor: colors.primaryFixed,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: {
    flex: 1,
    gap: 2,
  },
  notifMessage: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  badge: {
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
    marginTop: 4,
  },
});

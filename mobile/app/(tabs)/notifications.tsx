import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { EmptyState } from "../../src/components/EmptyState";
import { IconCircle } from "../../src/components/IconCircle";
import { spacing, colors, fonts, radii } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { AppNotification, NotificationKind } from "../../src/types";

type Filter = "all" | "unread";

const META: Record<
  NotificationKind,
  { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; tintBg: string }
> = {
  match: {
    icon: "heart-pulse",
    color: colors.accentPurple,
    tintBg: "rgba(139,92,246,0.06)",
  },
  sighting: {
    icon: "map-marker",
    color: colors.error,
    tintBg: "rgba(239,68,68,0.05)",
  },
  system: {
    icon: "information-outline",
    color: colors.secondary,
    tintBg: "rgba(59,130,246,0.05)",
  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");

  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.fetchNotifications,
  });

  const mutation = useMutation({
    mutationFn: api.markNotificationAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const markAll = useMutation({
    mutationFn: api.markAllNotificationsAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const unread = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, filter]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Alertas</Text>
          <Text style={styles.subtitle}>
            {unread > 0
              ? `Tienes ${unread} sin leer`
              : "Estás al día"}
          </Text>
        </View>
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unread}</Text>
          </View>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.chip, filter === "all" && styles.chipActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.chipText, filter === "all" && styles.chipTextActive]}>
            Todas
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === "unread" && styles.chipActive]}
          onPress={() => setFilter("unread")}
        >
          <Text style={[styles.chipText, filter === "unread" && styles.chipTextActive]}>
            No leídas{unread > 0 ? ` (${unread})` : ""}
          </Text>
        </Pressable>
        {unread > 0 && (
          <Pressable
            style={styles.markAllBtn}
            onPress={() => markAll.mutate()}
          >
            <MaterialCommunityIcons name="check-all" size={16} color={colors.primary} />
            <Text style={styles.markAllText}>Marcar todas</Text>
          </Pressable>
        )}
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="bell-off-outline"
            message={filter === "unread" ? "No tienes alertas sin leer" : "Sin alertas nuevas"}
          />
        ) : (
          filtered.map((item) => (
            <NotifCard
              key={item.id}
              item={item}
              onPress={() => !item.read && mutation.mutate(item.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function NotifCard({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  const meta = META[item.type];
  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: meta.tintBg },
        !item.read && [styles.unread, { borderLeftColor: meta.color }],
      ]}
      onPress={onPress}
    >
      <IconCircle icon={meta.icon} color={meta.color} size={44} />
      <View style={{ flex: 1 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.cardMessage}>{item.message}</Text>
      </View>
      {!item.read && item.type === "sighting" && (
        <MaterialCommunityIcons name="alert-circle" size={18} color={colors.error} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  unreadBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: "#ffffff",
  },

  // Filters
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  chipTextActive: {
    color: "#ffffff",
    fontFamily: fonts.bodySemiBold,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  markAllText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.primary,
  },

  // List
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm + 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  unread: {
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  cardTime: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  cardMessage: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});

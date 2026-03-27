import React from "react";
import { ScrollView, View, StyleSheet, Image, Pressable } from "react-native";
import { Link } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Text } from "react-native-paper";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { CardContainer } from "../../src/components/CardContainer";
import { spacing, colors, radii, fonts } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { useDogsStore } from "../../src/store/dogs";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { AppNotification, DogStatus, LostReport } from "../../src/types";

type ActionTileProps = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  href: string;
  tone?: "primary" | "neutral" | "danger";
};

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const dogs = useDogsStore((state) => state.dogs);
  const heroDog = dogs.find((d) => d.status === "lost") ?? dogs[0];

  const { data: lostReports = [] } = useQuery({
    queryKey: queryKeys.lostReports,
    queryFn: api.fetchLostReports,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.fetchNotifications,
  });

  const actions: ActionTileProps[] = [
    {
      title: "Trufa ID",
      subtitle: "Escanear nariz",
      icon: "fingerprint",
      href: "/(tabs)/scan",
      tone: "primary",
    },
    {
      title: "Registrar",
      subtitle: "Nuevo perfil",
      icon: "plus-circle-outline",
      href: "/dog/new",
      tone: "neutral",
    },
    {
      title: "Reportar",
      subtitle: "Perro perdido",
      icon: "alert-decagram",
      href: heroDog ? (`/dog/${heroDog.id}` as any) : "/dog/new",
      tone: "danger",
    },
    {
      title: "Encontre uno",
      subtitle: "Reportar hallazgo",
      icon: "dog",
      href: "/(tabs)/feed" as const,
      tone: "neutral",
    },
  ];

  const activities = buildActivities(notifications, lostReports, heroDog?.name);

  const defaultRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  const firstReport = lostReports[0]?.lastSeen;
  const mapRegion = firstReport
    ? { ...firstReport, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : defaultRegion;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero protection card */}
      <CardContainer style={styles.heroCard} mode="contained">
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <View style={styles.protectedBadge}>
              <MaterialCommunityIcons name="shield-check" size={14} color={colors.tertiary} />
              <Text style={styles.protectedText}>Protegido</Text>
            </View>
            <Text variant="titleMedium" style={styles.heroName}>
              {heroDog ? heroDog.name : "Registra tu primer perro"}
            </Text>
            <Text style={styles.muted}>
              {heroDog
                ? heroDog.breed ?? "Sin raza registrada"
                : "Crea un perfil para activarle un ID seguro"}
            </Text>
            {heroDog && (
              <View style={styles.statusRow}>
                <StatusPill status={heroDog.status} />
              </View>
            )}
            <Link asChild href={heroDog ? `/dog/${heroDog.id}` : "/dog/new"}>
              <PrimaryButton
                mode="contained"
                style={styles.heroButton}
                contentStyle={{ paddingVertical: spacing.sm }}
              >
                {heroDog ? "Ver perfil" : "Registrar perro"}
              </PrimaryButton>
            </Link>
          </View>
          <View style={styles.heroAvatar}>
            {heroDog?.photo ? (
              <Image source={{ uri: heroDog.photo }} style={styles.dogImage} />
            ) : (
              <Avatar.Icon
                icon="dog"
                size={86}
                style={{ backgroundColor: colors.primaryFixed }}
                color={colors.primary}
              />
            )}
          </View>
        </View>
      </CardContainer>

      {/* Quick actions */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Acciones rapidas</Text>
      </View>
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <Link key={action.title} asChild href={action.href as any}>
            <Pressable style={({ pressed }) => [styles.actionTile, tileTone(action.tone), pressed && styles.pressed]}>
              <View style={[styles.actionIcon, iconTone(action.tone)]}>
                <MaterialCommunityIcons
                  name={action.icon}
                  size={22}
                  color={action.tone === "danger" ? colors.error : colors.primary}
                />
              </View>
              <Text variant="titleSmall" style={styles.tileTitle}>{action.title}</Text>
              <Text style={styles.muted}>{action.subtitle}</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      {/* Lost dogs map */}
      <CardContainer style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <View>
            <Text variant="titleMedium" style={styles.sectionTitle}>Perros perdidos</Text>
            <Text style={styles.muted}>
              {lostReports.length > 0
                ? `${lostReports.length} alerta${lostReports.length > 1 ? "s" : ""} activas`
                : "Sin alertas por ahora"}
            </Text>
          </View>
          <Link asChild href="/(tabs)/feed">
            <PrimaryButton mode="outlined" variant="secondary" gradient={false}>
              Abrir mapa
            </PrimaryButton>
          </Link>
        </View>
        <View style={styles.mapShell}>
          <MapView style={styles.map} initialRegion={mapRegion}>
            {lostReports.map((report) => (
              <Marker
                key={report.id}
                coordinate={report.lastSeen}
                title={report.dogName}
                description={report.description}
                pinColor={colors.primary}
              />
            ))}
          </MapView>
        </View>
      </CardContainer>

      {/* Activity feed */}
      <CardContainer style={styles.activityCard}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Actividad reciente</Text>
        </View>
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="sleep" size={22} color={colors.textMuted} />
            <Text style={styles.muted}>Nada nuevo por ahora.</Text>
          </View>
        ) : (
          activities.map((activity, idx) => (
            <View key={activity.id}>
              <View style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <MaterialCommunityIcons name={activity.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyLarge" style={{ color: colors.onSurface }}>{activity.title}</Text>
                  <Text style={styles.muted}>{activity.message}</Text>
                  <Text style={styles.time}>{activity.timeAgo}</Text>
                </View>
              </View>
              {idx < activities.length - 1 && <View style={styles.separator} />}
            </View>
          ))
        )}
      </CardContainer>
    </ScrollView>
  );
}

const statusLabel: Record<DogStatus, { label: string; background: string; color: string }> = {
  normal: { label: "Seguro", background: "rgba(62, 172, 112, 0.12)", color: colors.tertiary },
  lost: { label: "Modo perdido", background: "rgba(186, 26, 26, 0.12)", color: colors.error },
};

const StatusPill = ({ status }: { status: DogStatus }) => {
  const config = statusLabel[status];
  return (
    <View style={[styles.statusPill, { backgroundColor: config.background }]}>
      <MaterialCommunityIcons
        name={status === "lost" ? "alert" : "check-circle"}
        color={config.color}
        size={14}
      />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const tileTone = (tone: ActionTileProps["tone"]) => {
  switch (tone) {
    case "primary":
      return styles.tilePrimary;
    case "danger":
      return styles.tileDanger;
    default:
      return styles.tileNeutral;
  }
};

const iconTone = (tone: ActionTileProps["tone"]) => {
  switch (tone) {
    case "primary":
      return styles.iconPrimary;
    case "danger":
      return styles.iconDanger;
    default:
      return styles.iconNeutral;
  }
};

const buildActivities = (
  notifications: AppNotification[],
  reports: LostReport[],
  dogName?: string
) => {
  const items = [
    ...notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      icon:
        notification.type === "match"
          ? "paw"
          : notification.type === "sighting"
            ? "map-marker"
            : "bell-outline",
      timeAgo: formatTimeAgo(notification.createdAt),
    })),
    ...reports.map((report) => ({
      id: `report-${report.id}`,
      title: `Alerta de ${report.dogName}`,
      message: report.description ?? "Avistamiento reciente.",
      icon: "alert",
      timeAgo: formatTimeAgo(report.lastSeen.time ?? new Date().toISOString()),
    })),
  ];

  if (dogName) {
    items.push({
      id: "status",
      title: "Perfil al dia",
      message: `${dogName} listo para ser identificado.`,
      icon: "shield-check",
      timeAgo: "hace unos minutos",
    });
  }

  return items.slice(0, 4);
};

const formatTimeAgo = (dateStr: string) => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMinutes = Math.max(0, Math.floor((now - date) / 60000));
  if (diffMinutes < 1) return "justo ahora";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  heroCard: {
    padding: spacing.lg,
    marginTop: 0,
    backgroundColor: colors.surfaceContainerLowest,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  heroName: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
  },
  protectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(62, 172, 112, 0.12)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: "flex-start",
  },
  protectedText: {
    color: colors.tertiary,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  heroButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    borderRadius: radii.full,
  },
  heroAvatar: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.xs,
    borderRadius: radii.xl,
  },
  dogImage: {
    width: 94,
    height: 94,
    borderRadius: radii.lg,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontFamily: fonts.headingMedium,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionTile: {
    flexBasis: "47%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  tileTitle: {
    color: colors.onSurface,
  },
  tilePrimary: {
    backgroundColor: colors.primaryFixed,
    borderWidth: 0,
  },
  tileNeutral: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  tileDanger: {
    backgroundColor: colors.errorContainer,
    borderWidth: 0,
  },
  iconPrimary: {
    backgroundColor: "rgba(162, 63, 0, 0.10)",
  },
  iconNeutral: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  iconDanger: {
    backgroundColor: "rgba(186, 26, 26, 0.10)",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  mapCard: {
    padding: spacing.lg,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  mapShell: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  map: {
    height: 180,
    width: "100%",
  },
  activityCard: {
    padding: spacing.lg,
  },
  activityRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surfaceContainerHigh,
    marginVertical: spacing.xs,
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});

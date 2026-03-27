import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Text, ProgressBar } from "react-native-paper";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { spacing, colors, radii, fonts } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { useDogsStore } from "../../src/store/dogs";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { AppNotification, Dog, DogStatus, LostReport } from "../../src/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  const activities = buildActivities(notifications, lostReports, heroDog?.name);

  // Protection checklist
  const checks = [
    { label: "Registro completo", done: true },
    { label: "Fotos de perfil", done: !!heroDog?.photo },
    { label: "Biometria Trufa", done: !!heroDog?.nosePhoto },
    { label: "Contacto de emergencia", done: false },
  ];
  const progress = checks.filter((c) => c.done).length / checks.length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── 1. HERO PROTECTION CARD ─── */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextBlock}>
            <View style={styles.protectedBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.tertiary} />
              <Text style={styles.protectedLabel}>Protegido</Text>
            </View>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              {heroDog?.name ?? "Peanut"} esta seguro
            </Text>
            <Text style={styles.heroDescription}>
              Su perfil biometrico esta activo y validado por nuestra red de guardianes
            </Text>
            <Pressable style={styles.bioLink}>
              <Text style={styles.bioLinkText}>Ver Perfil Biometrico</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Hero dog image — large, bleeding right */}
        <View style={styles.heroImageWrap}>
          {heroDog?.photo ? (
            <Image source={{ uri: heroDog.photo }} style={styles.heroImage} />
          ) : (
            <Avatar.Icon
              icon="dog"
              size={140}
              style={{ backgroundColor: colors.primaryFixed }}
              color={colors.primary}
            />
          )}
        </View>
      </View>

      {/* ─── 2. QUICK ACTION BUTTONS ─── */}
      <View style={styles.quickActionsRow}>
        <QuickAction
          icon="fingerprint"
          label="Trufa ID"
          detail="98.4% Match"
          href="/(tabs)/scan"
          accent={colors.primary}
        />
        <QuickAction
          icon="qrcode-scan"
          label="Escanear Trufa"
          href="/(tabs)/scan"
          accent={colors.secondary}
        />
        <QuickAction
          icon="alert-circle"
          label="Reportar Perdido"
          href={heroDog ? (`/dog/${heroDog.id}` as any) : "/dog/new"}
          accent={colors.error}
        />
        <QuickAction
          icon="dog"
          label="Encontre un perro"
          href="/(tabs)/feed"
          accent={colors.tertiary}
        />
        <QuickAction
          icon="account-group"
          label="Comunidad"
          href="/(tabs)/feed"
          accent={colors.secondary}
        />
      </View>

      {/* ─── 3. ZONE ALERT ─── */}
      {lostReports.length > 0 && (
        <View style={styles.alertCard}>
          <View style={styles.alertDot} />
          <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
          <Text style={styles.alertText} numberOfLines={2}>
            Posible coincidencia de {lostReports[0]?.dogName ?? "Golden Retriever"} a 2km
          </Text>
          <Pressable>
            <Text style={styles.alertAction}>Ver ahora</Text>
          </Pressable>
        </View>
      )}

      {/* ─── 4. PROTECTION STATUS ─── */}
      <View style={styles.sectionCard}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Estado de Proteccion</Text>
        <View style={styles.progressRow}>
          <ProgressBar
            progress={progress}
            color={colors.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressLabel}>{Math.round(progress * 100)}%</Text>
        </View>
        {checks.map((check) => (
          <View key={check.label} style={styles.checkRow}>
            <MaterialCommunityIcons
              name={check.done ? "check-circle" : "clock-outline"}
              size={18}
              color={check.done ? colors.tertiary : colors.textMuted}
            />
            <Text style={[styles.checkLabel, !check.done && styles.checkPending]}>
              {check.label}
            </Text>
          </View>
        ))}
        <Pressable style={styles.completeProfileBtn}>
          <Text style={styles.completeProfileText}>Completar perfil</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* ─── 5. RECENT ACTIVITY ─── */}
      <View style={styles.sectionCard}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Actividad Reciente</Text>
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="sleep" size={22} color={colors.textMuted} />
            <Text style={styles.muted}>Nada nuevo por ahora.</Text>
          </View>
        ) : (
          activities.map((activity, idx) => (
            <View key={activity.id}>
              <View style={styles.activityRow}>
                <View style={[styles.activityIcon, { backgroundColor: `${colors.primary}12` }]}>
                  <MaterialCommunityIcons name={activity.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityMeta}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.timeAgo}</Text>
                </View>
              </View>
              {idx < activities.length - 1 && <View style={styles.separator} />}
            </View>
          ))
        )}
      </View>

      {/* ─── 6. MY DOGS ─── */}
      <View style={styles.sectionCard}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Mis Perros</Text>
        {dogs.map((dog) => (
          <Link key={dog.id} href={`/dog/${dog.id}` as any} asChild>
            <Pressable style={styles.dogListItem}>
              <View style={styles.dogListAvatar}>
                {dog.photo ? (
                  <Image source={{ uri: dog.photo }} style={styles.dogListImage} />
                ) : (
                  <Avatar.Text
                    size={48}
                    label={dog.name.charAt(0)}
                    style={{ backgroundColor: colors.primaryFixed }}
                    labelStyle={{ color: colors.primary }}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={{ color: colors.onSurface }}>{dog.name}</Text>
                <View style={styles.dogStatusRow}>
                  {dog.status === "normal" ? (
                    <>
                      <MaterialCommunityIcons name="shield-check" size={14} color={colors.tertiary} />
                      <Text style={styles.dogStatusOk}>Protegido</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="alert" size={14} color={colors.error} />
                      <Text style={styles.dogStatusLost}>Perdido</Text>
                    </>
                  )}
                  {!dog.nosePhoto && (
                    <View style={styles.missingTrufaBadge}>
                      <MaterialCommunityIcons name="alert-circle" size={12} color={colors.primary} />
                      <Text style={styles.missingTrufaText}>Falta Trufa</Text>
                    </View>
                  )}
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </Pressable>
          </Link>
        ))}
      </View>

      {/* ─── 7. EDUCATIONAL CARD ─── */}
      <View style={styles.eduCard}>
        <MaterialCommunityIcons name="lightbulb-outline" size={28} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={{ color: colors.onSurface }}>
            Como funciona la Trufa?
          </Text>
          <Text style={styles.eduDescription}>
            La nariz de tu perro es unica. Usala como su huella digital
          </Text>
        </View>
        <Pressable style={styles.eduBtn}>
          <Text style={styles.eduBtnText}>Saber mas</Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
        </Pressable>
      </View>

      {/* ─── 8. NEARBY LOST DOGS ─── */}
      {lostReports.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.nearbyHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Cerca de ti</Text>
            <Link href="/(tabs)/feed">
              <Text style={styles.seeAllLink}>Ver todos</Text>
            </Link>
          </View>
          {lostReports.slice(0, 2).map((report) => (
            <Link key={report.id} href={`/dog/${report.dogId}` as any} asChild>
              <Pressable style={styles.nearbyCard}>
                <View style={styles.nearbyImageWrap}>
                  {report.images?.[0] ? (
                    <Image source={{ uri: report.images[0] }} style={styles.nearbyImage} />
                  ) : (
                    <View style={[styles.nearbyImage, { backgroundColor: colors.surfaceContainerHigh, alignItems: "center", justifyContent: "center" }]}>
                      <MaterialCommunityIcons name="dog" size={32} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.nearbyDistanceBadge}>
                    <MaterialCommunityIcons name="near-me" size={10} color={colors.onPrimary} />
                    <Text style={styles.nearbyDistanceText}>A 500m</Text>
                  </View>
                </View>
                <View style={styles.nearbyInfo}>
                  <Text variant="titleSmall" style={{ color: colors.onSurface }}>{report.dogName}</Text>
                  <View style={styles.nearbyLostBadge}>
                    <Text style={styles.nearbyLostText}>Perdido</Text>
                  </View>
                  <Text style={styles.nearbyTime}>Hace 40min</Text>
                </View>
                <MaterialCommunityIcons name="eye-outline" size={20} color={colors.textMuted} />
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

/* ─── QUICK ACTION BUTTON ─── */
type QuickActionProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  detail?: string;
  href: string;
  accent: string;
};

const QuickAction = ({ icon, label, detail, href, accent }: QuickActionProps) => (
  <Link href={href as any} asChild>
    <Pressable style={styles.quickAction}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${accent}14` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={accent} />
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={1}>{label}</Text>
      {detail && <Text style={styles.quickActionDetail}>{detail}</Text>}
    </Pressable>
  </Link>
);

/* ─── HELPERS ─── */
const buildActivities = (
  notifications: AppNotification[],
  reports: LostReport[],
  dogName?: string
) => {
  const items = [
    ...notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      icon: n.type === "match" ? "paw" : n.type === "sighting" ? "map-marker" : "bell-outline",
      timeAgo: formatTimeAgo(n.createdAt),
    })),
    ...reports.map((r) => ({
      id: `report-${r.id}`,
      title: `Alerta de ${r.dogName}`,
      message: r.description ?? "Avistamiento reciente.",
      icon: "alert",
      timeAgo: formatTimeAgo(r.lastSeen.time ?? new Date().toISOString()),
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
  return items.slice(0, 3);
};

const formatTimeAgo = (dateStr: string) => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const mins = Math.max(0, Math.floor((now - date) / 60000));
  if (mins < 1) return "justo ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
};

/* ─── STYLES ─── */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  // ── Hero
  heroCard: {
    backgroundColor: colors.surfaceContainerLowest,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    paddingBottom: 0,
    overflow: "hidden",
    shadowColor: colors.onSurface,
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  heroTextBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  protectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(62, 172, 112, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: "flex-start",
  },
  protectedLabel: {
    color: colors.tertiary,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  heroTitle: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    marginTop: spacing.xs,
  },
  heroDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  bioLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: spacing.xs,
  },
  bioLinkText: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  heroImageWrap: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  heroImage: {
    width: SCREEN_WIDTH - spacing.lg * 2 - spacing.xl * 2,
    height: 200,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
  },

  // ── Quick Actions (horizontal scroll row)
  quickActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  quickAction: {
    alignItems: "center",
    gap: 4,
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 4) / 5,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    textAlign: "center",
  },
  quickActionDetail: {
    fontSize: 9,
    fontFamily: fonts.body,
    color: colors.primary,
    textAlign: "center",
  },

  // ── Zone Alert
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.primaryFixed,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  alertText: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  alertAction: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },

  // ── Section Card (reused)
  sectionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    marginHorizontal: spacing.lg,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontFamily: fonts.headingMedium,
  },

  // ── Protection Progress
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressLabel: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkLabel: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  checkPending: {
    color: colors.textMuted,
  },
  completeProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  completeProfileText: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },

  // ── Activity
  activityRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  activityTitle: {
    color: colors.onSurface,
    fontFamily: fonts.bodyMedium,
  },
  activityMeta: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  activityTime: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2,
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
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.body,
  },

  // ── My Dogs
  dogListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  dogListAvatar: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  dogListImage: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
  },
  dogStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  dogStatusOk: {
    color: colors.tertiary,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  dogStatusLost: {
    color: colors.error,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  missingTrufaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginLeft: spacing.sm,
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  missingTrufaText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
  },

  // ── Educational Card
  eduCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xxl,
    padding: spacing.xl,
  },
  eduDescription: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  eduBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  eduBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },

  // ── Nearby Lost Dogs
  nearbyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllLink: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  nearbyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  nearbyImageWrap: {
    position: "relative",
  },
  nearbyImage: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
  },
  nearbyDistanceBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  nearbyDistanceText: {
    color: colors.onPrimary,
    fontSize: 8,
    fontFamily: fonts.bodySemiBold,
  },
  nearbyInfo: {
    flex: 1,
    gap: 2,
  },
  nearbyLostBadge: {
    backgroundColor: "rgba(186, 26, 26, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
    alignSelf: "flex-start",
  },
  nearbyLostText: {
    color: colors.error,
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
  },
  nearbyTime: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
  },
});

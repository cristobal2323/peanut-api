import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing, colors, fonts } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { useDogsStore } from "../../src/store/dogs";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";

// Local alias kept for readability in styles below.
// Mirrors the global theme primary so any palette change propagates.
const ACCENT = colors.primary;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const dogs = useDogsStore((s) => s.dogs);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const heroDog = dogs[selectedIdx] ?? dogs[0];
  const hasDogs = dogs.length > 0;

  const { data: lostReports = [] } = useQuery({
    queryKey: queryKeys.lostReports,
    queryFn: api.fetchLostReports,
  });

  const recentActivity = [
    {
      id: "1",
      message: heroDog
        ? `Trufa de ${heroDog.name} escaneada correctamente`
        : "Bienvenido a Peanut",
      time: "Hace 2 dias",
    },
    {
      id: "2",
      message: "Nuevo perro perdido cerca de ti",
      time: "Hace 5 horas",
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={[ACCENT, `${ACCENT}E6`]}
        style={[styles.header, { paddingTop: insets.top + spacing.lg }]}
      >
        <Text style={styles.greeting}>
          Hola, {user?.name?.split(" ")[0] ?? "amigo"}! 👋
        </Text>
        <Text style={styles.greetingSub}>
          Manten seguro a tu mejor amigo
        </Text>
      </LinearGradient>

      {/* ── Body (overlaps header slightly) ── */}
      <View style={styles.body}>
        {hasDogs ? (
          <>
            {/* Dog Card */}
            <View style={styles.dogCard}>
              <View style={styles.dogCardRow}>
                {heroDog.photo ? (
                  <Image
                    source={{ uri: heroDog.photo }}
                    style={styles.dogAvatar}
                  />
                ) : (
                  <View style={[styles.dogAvatar, styles.dogAvatarFallback]}>
                    <MaterialCommunityIcons
                      name="dog"
                      size={32}
                      color={colors.outlineVariant}
                    />
                  </View>
                )}
                <View style={styles.dogInfo}>
                  <View style={styles.dogNameRow}>
                    <Text style={styles.dogName}>{heroDog.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        heroDog.status === "lost"
                          ? styles.statusLost
                          : styles.statusSafe,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              heroDog.status === "lost"
                                ? colors.error
                                : "#fff",
                          },
                        ]}
                      >
                        {heroDog.status === "lost" ? "Perdido" : "Seguro"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dogBreed}>
                    {heroDog.breed ?? "Tu perro"}
                  </Text>
                </View>
                <Link href={`/dog/${heroDog.id}` as any} asChild>
                  <Pressable style={styles.dogArrow}>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color={ACCENT}
                    />
                  </Pressable>
                </Link>
              </View>
            </View>

            {/* Dog Selector (multiple dogs) */}
            {dogs.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsWrap}
              >
                {dogs.map((dog, i) => (
                  <Pressable
                    key={dog.id}
                    onPress={() => setSelectedIdx(i)}
                    style={[
                      styles.chip,
                      i === selectedIdx && styles.chipActive,
                    ]}
                  >
                    {dog.photo ? (
                      <Image
                        source={{ uri: dog.photo }}
                        style={styles.chipAvatar}
                      />
                    ) : (
                      <View style={styles.chipAvatarFb}>
                        <Text style={styles.chipInitial}>
                          {dog.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={
                        i === selectedIdx
                          ? styles.chipNameActive
                          : styles.chipName
                      }
                    >
                      {dog.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Quick Actions Grid */}
            <View style={styles.actionsGrid}>
              <Link href="/(tabs)/scan" asChild>
                <Pressable style={styles.actionCard}>
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: `${ACCENT}1A` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="line-scan"
                      size={24}
                      color={ACCENT}
                    />
                  </View>
                  <Text style={styles.actionTitle}>Escanear trufa</Text>
                  <Text style={styles.actionSub}>Actualizar registro</Text>
                </Pressable>
              </Link>

              <Link href={`/dog/${heroDog.id}` as any} asChild>
                <Pressable style={styles.actionCard}>
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: "rgba(239,68,68,0.1)" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={24}
                      color="#EF4444"
                    />
                  </View>
                  <Text style={styles.actionTitle}>Reportar perdido</Text>
                  <Text style={styles.actionSub}>Activar alerta</Text>
                </Pressable>
              </Link>
            </View>
          </>
        ) : (
          /* ── No dogs: registration CTA ── */
          <LinearGradient
            colors={[ACCENT, `${ACCENT}CC`]}
            style={styles.registerCard}
          >
            <View style={styles.registerIconWrap}>
              <MaterialCommunityIcons name="plus" size={32} color="#fff" />
            </View>
            <Text style={styles.registerTitle}>
              Registra a tu primer perro
            </Text>
            <Text style={styles.registerSub}>
              Protegelo con su huella digital unica: la trufa
            </Text>
            <Link href="/dog/new" asChild>
              <Pressable style={styles.registerBtn}>
                <Text style={styles.registerBtnText}>Comenzar registro</Text>
              </Pressable>
            </Link>
          </LinearGradient>
        )}

        {/* ── Cerca de ti ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cerca de ti</Text>
            <Link href="/(tabs)/feed">
              <Text style={styles.sectionLink}>Ver mapa</Text>
            </Link>
          </View>
          <Link href="/(tabs)/feed" asChild>
            <Pressable style={styles.nearbyRow}>
              <View style={styles.nearbyIcon}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#fff"
                />
              </View>
              <View style={styles.nearbyInfo}>
                <Text style={styles.nearbyCount}>
                  {lostReports.length} reportes activos
                </Text>
                <Text style={styles.nearbyDistance}>
                  A menos de 2 km de distancia
                </Text>
              </View>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={ACCENT}
              />
            </Pressable>
          </Link>
        </View>

        {/* ── Actividad reciente ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          <View style={styles.activityList}>
            {recentActivity.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityMsg}>{item.message}</Text>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ════════════════════ STYLES ════════════════════ */
const HP = spacing.lg;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },

  /* ── Header ── */
  header: {
    paddingHorizontal: HP + 4,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  greeting: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: "#fff",
    marginBottom: 4,
  },
  greetingSub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
  },

  /* ── Body ── */
  body: {
    paddingHorizontal: HP,
    marginTop: -16,
    gap: 16,
  },

  /* ── Dog Card ── */
  dogCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dogCardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  dogAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  dogAvatarFallback: {
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  dogInfo: {
    flex: 1,
    gap: 2,
  },
  dogNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dogName: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
  },
  statusSafe: {
    backgroundColor: colors.tertiaryContainer,
  },
  statusLost: {
    backgroundColor: colors.errorContainer,
  },
  statusText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  dogBreed: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  dogArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Dog chips ── */
  chipsWrap: { gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 6,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFixed,
  },
  chipAvatar: { width: 30, height: 30, borderRadius: 15 },
  chipAvatarFb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  chipInitial: {
    fontFamily: fonts.headingMedium,
    fontSize: 13,
    color: colors.primary,
  },
  chipName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  chipNameActive: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
  },

  /* ── Quick Actions ── */
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: 2,
  },
  actionSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
  },

  /* ── Register CTA ── */
  registerCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
  },
  registerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  registerTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  registerSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  registerBtn: {
    backgroundColor: "#fff",
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  registerBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: ACCENT,
  },

  /* ── Section card (shared) ── */
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.onSurface,
  },
  sectionLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: ACCENT,
  },

  /* ── Nearby ── */
  nearbyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4E6",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  nearbyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyInfo: {
    flex: 1,
    gap: 2,
  },
  nearbyCount: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
  nearbyDistance: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },

  /* ── Activity ── */
  activityList: {
    marginTop: 12,
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 4,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
    marginTop: 5,
  },
  activityInfo: {
    flex: 1,
    gap: 2,
  },
  activityMsg: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  activityTime: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
});

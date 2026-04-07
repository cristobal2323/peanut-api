import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Share,
  Dimensions,
  Linking,
  Alert,
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { SectionCard } from "../../src/components/SectionCard";
import { IconCircle } from "../../src/components/IconCircle";
import { StatusBadge } from "../../src/components/StatusBadge";
import { colors, fonts, spacing, radii } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";

const HERO_HEIGHT = 320;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: report, isLoading } = useQuery({
    queryKey: queryKeys.lostReport(id),
    queryFn: () => api.fetchLostReport(id),
  });

  if (isLoading || !report) {
    return (
      <View style={styles.center}>
        <ScreenHeader />
        <Text style={styles.loadingText}>Cargando reporte...</Text>
      </View>
    );
  }

  const heroPhoto = report.images?.[0];

  const shareReport = async () => {
    try {
      await Share.share({
        message: `🚨 ${report.dogName} está perdido. Por favor ayuda a difundir. — Vía Peanut`,
      });
    } catch {}
  };

  const callOwner = () => {
    Linking.openURL("tel:+56998765432").catch(() =>
      Alert.alert("Error", "No se pudo abrir el marcador.")
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          {heroPhoto ? (
            <Image source={{ uri: heroPhoto }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <MaterialCommunityIcons name="dog" size={80} color={colors.outlineVariant} />
            </View>
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.6)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroBottom}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{report.dogName}</Text>
              {report.lastSeen.address && (
                <View style={styles.heroLocationRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#ffffff" />
                  <Text style={styles.heroLocation}>{report.lastSeen.address}</Text>
                </View>
              )}
            </View>
            <StatusBadge variant="lost" size="lg" />
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Info */}
          <SectionCard title="Información">
            <View style={styles.grid}>
              <Tile icon="dog" label="Tipo" value="Mestizo" />
              <Tile icon="cake-variant-outline" label="Edad" value="2 años" />
              <Tile icon="palette-outline" label="Color" value="Negro / Blanco" />
              <Tile icon="ruler" label="Tamaño" value="Mediano" />
            </View>
            <View style={styles.divider} />
            <View style={styles.dateRow}>
              <MaterialCommunityIcons name="calendar-outline" size={18} color={colors.textMuted} />
              <Text style={styles.dateText}>
                Visto por última vez:{" "}
                {report.lastSeen.time
                  ? new Date(report.lastSeen.time).toLocaleString("es-CL")
                  : "—"}
              </Text>
            </View>
            {report.description && (
              <Text style={styles.description}>{report.description}</Text>
            )}
          </SectionCard>

          {/* Mini map */}
          <SectionCard title="Última ubicación">
            <View style={styles.mapWrap}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: report.lastSeen.latitude,
                  longitude: report.lastSeen.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                pitchEnabled={false}
                rotateEnabled={false}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={report.lastSeen}
                  pinColor={colors.error}
                />
              </MapView>
            </View>
            <Link href="/map" asChild>
              <Pressable style={styles.mapBtn}>
                <Text style={styles.mapBtnText}>Ver en mapa completo</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
              </Pressable>
            </Link>
          </SectionCard>

          {/* Sightings */}
          <SectionCard title={`Avistamientos (${report.sightings.length})`}>
            {report.sightings.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="map-marker-question" size={32} color={colors.textMuted} />
                <Text style={styles.emptyText}>Aún no hay avistamientos</Text>
              </View>
            ) : (
              <View style={{ gap: spacing.md }}>
                {report.sightings.map((s, i) => (
                  <View key={s.id} style={styles.sightingRow}>
                    <IconCircle icon="map-marker-outline" color={colors.primary} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sightingComment}>{s.comment}</Text>
                      <Text style={styles.sightingTime}>
                        {new Date(s.seenAt).toLocaleString("es-CL")}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </SectionCard>

          {/* Owner */}
          <SectionCard title="Contactar al dueño">
            <Pressable style={styles.ownerRow} onPress={callOwner}>
              <IconCircle icon="phone" color={colors.tertiary} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ownerName}>María González</Text>
                <Text style={styles.ownerPhone}>+56 9 8765 4321</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </Pressable>
          </SectionCard>
        </View>
      </ScrollView>

      {/* Footer CTAs */}
      <View style={styles.footer}>
        <Pressable
          style={styles.btnPrimary}
          onPress={() =>
            router.push({ pathname: "/found-dog", params: { reportId: id } })
          }
        >
          <MaterialCommunityIcons name="heart" size={18} color="#ffffff" />
          <Text style={styles.btnPrimaryText}>Creo que lo encontré</Text>
        </Pressable>
        <View style={styles.footerRow}>
          <Pressable style={styles.btnOutline} onPress={() => router.push("/scan/nose")}>
            <MaterialCommunityIcons name="line-scan" size={16} color={colors.primary} />
            <Text style={styles.btnOutlineText}>Escanear trufa</Text>
          </Pressable>
          <Link href="/report-sighting" asChild>
            <Pressable style={styles.btnGhost}>
              <Text style={styles.btnGhostText}>Reportar avistamiento</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <ScreenHeader
        variant="overlay"
        right={
          <Pressable style={styles.shareButton} onPress={shareReport}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#ffffff" />
          </Pressable>
        }
      />
    </View>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={tileStyles.tile}>
      <View style={tileStyles.iconBox}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={tileStyles.label}>{label}</Text>
        <Text style={tileStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const tileStyles = StyleSheet.create({
  tile: {
    flexBasis: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  value: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xxl,
  },
  content: {
    paddingBottom: 200,
  },

  // Hero
  hero: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surfaceContainerHigh,
  },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
  },
  heroName: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: "#ffffff",
  },
  heroLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  heroLocation: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: "#ffffff",
  },

  body: {
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: -spacing.md,
  },

  // Info grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.md,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.sm,
  },

  // Map
  mapWrap: {
    height: 180,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  mapBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },

  // Empty
  empty: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Sightings
  sightingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  sightingComment: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onPrimaryContainer,
  },
  sightingTime: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onPrimaryContainer,
    opacity: 0.7,
    marginTop: 2,
  },

  // Owner
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  ownerName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  ownerPhone: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Footer
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    gap: spacing.sm + 2,
    paddingBottom: spacing.lg + 8,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.tertiary,
    paddingVertical: 16,
    borderRadius: radii.md,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: "#ffffff",
  },
  footerRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  btnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnOutlineText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
  },
  btnGhost: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  btnGhostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
  },

  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
});

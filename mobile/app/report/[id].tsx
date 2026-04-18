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
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { SectionCard } from "../../src/components/SectionCard";
import { IconCircle } from "../../src/components/IconCircle";
import { StatusBadge } from "../../src/components/StatusBadge";
import { colors, fonts, spacing, radii } from "../../src/theme";
import { lostReportsApi, LostReportApi } from "../../src/api/lostReports";
import { computeAgeYears } from "../../src/api/dogs";
import { usePreferencesStore } from "../../src/store/preferences";
import { queryKeys } from "../../src/lib/queryClient";

const HERO_HEIGHT = 320;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const sizeLabel: Record<string, Record<string, string>> = {
  es: { SMALL: "Pequeño", MEDIUM: "Mediano", LARGE: "Grande" },
  en: { SMALL: "Small", MEDIUM: "Medium", LARGE: "Large" },
};

const sexLabel: Record<string, Record<string, string>> = {
  es: { MALE: "Macho", FEMALE: "Hembra", UNKNOWN: "—" },
  en: { MALE: "Male", FEMALE: "Female", UNKNOWN: "—" },
};

function statusVariant(status: string): "lost" | "found" | "safe" {
  if (status === "RESOLVED") return "found";
  if (status === "ACTIVE") return "lost";
  return "safe";
}

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const locale = usePreferencesStore((s) => s.locale);

  const { data: report, isLoading } = useQuery({
    queryKey: queryKeys.lostReport(id),
    queryFn: () => lostReportsApi.getById(id),
  });

  if (isLoading || !report) {
    return (
      <View style={styles.center}>
        <ScreenHeader />
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.xxl }}
        />
      </View>
    );
  }

  const dog = report.dog;
  const loc = report.lastSeenLocation;
  const owner = report.owner;
  const sightings = (report as any).sightings ?? [];

  const breedName = dog?.breed
    ? locale === "en"
      ? dog.breed.nameEn ?? dog.breed.nameEs
      : dog.breed.nameEs
    : dog?.mixedBreed
      ? locale === "es" ? "Mestizo" : "Mixed"
      : "—";

  const colorName = dog?.color
    ? locale === "en"
      ? dog.color.nameEn ?? dog.color.nameEs
      : dog.color.nameEs
    : "—";

  const age = computeAgeYears(dog?.birthDate);
  const ageText = age !== undefined
    ? age === 0
      ? locale === "es" ? "Cachorro" : "Puppy"
      : `${age} ${age === 1 ? (locale === "es" ? "año" : "year") : (locale === "es" ? "años" : "years")}`
    : "—";

  const heroPhoto = dog?.photoUrl;

  const shareReport = async () => {
    const name = dog?.name ?? "Perro";
    try {
      await Share.share({
        message: `🚨 ${name} está perdido. Por favor ayuda a difundir. — Vía Trufa ID`,
      });
    } catch {}
  };

  const callOwner = () => {
    const phone = owner?.phone;
    if (!phone) {
      Alert.alert("Sin teléfono", "El dueño no tiene teléfono registrado.");
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() =>
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
              <MaterialCommunityIcons
                name="dog"
                size={80}
                color={colors.outlineVariant}
              />
            </View>
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.6)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroBottom}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{dog?.name ?? "Perro"}</Text>
              {loc?.addressText && (
                <View style={styles.heroLocationRow}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color="#ffffff"
                  />
                  <Text style={styles.heroLocation}>{loc.addressText}</Text>
                </View>
              )}
            </View>
            <StatusBadge variant={statusVariant(report.status)} size="lg" />
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <SectionCard title="Información">
            <View style={styles.grid}>
              <Tile icon="dog" label="Raza" value={breedName} />
              <Tile icon="cake-variant-outline" label="Edad" value={ageText} />
              <Tile icon="palette-outline" label="Color" value={colorName} />
              <Tile
                icon="ruler"
                label="Tamaño"
                value={
                  dog?.size
                    ? (sizeLabel[locale] ?? sizeLabel.es)[dog.size] ?? "—"
                    : "—"
                }
              />
            </View>
            {dog?.sex && (
              <>
                <View style={styles.divider} />
                <View style={styles.dateRow}>
                  <MaterialCommunityIcons
                    name={dog.sex === "MALE" ? "gender-male" : "gender-female"}
                    size={18}
                    color={colors.textMuted}
                  />
                  <Text style={styles.dateText}>
                    {(sexLabel[locale] ?? sexLabel.es)[dog.sex] ?? "—"}
                  </Text>
                </View>
              </>
            )}
            <View style={styles.divider} />
            <View style={styles.dateRow}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={18}
                color={colors.textMuted}
              />
              <Text style={styles.dateText}>
                Visto por última vez:{" "}
                {report.lastSeenAt
                  ? new Date(report.lastSeenAt).toLocaleString("es-CL")
                  : "—"}
              </Text>
            </View>
            {report.description && (
              <Text style={styles.description}>{report.description}</Text>
            )}
          </SectionCard>

          {/* Mini map */}
          {loc && (
            <SectionCard title="Última ubicación">
              <View style={styles.mapWrap}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  pitchEnabled={false}
                  rotateEnabled={false}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                    }}
                    pinColor={colors.error}
                  />
                </MapView>
              </View>
            </SectionCard>
          )}

          {/* Sightings */}
          <SectionCard title={`Avistamientos (${sightings.length})`}>
            {sightings.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons
                  name="map-marker-question"
                  size={32}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyText}>
                  Aún no hay avistamientos
                </Text>
              </View>
            ) : (
              <View style={{ gap: spacing.md }}>
                {sightings.map((s: any) => (
                  <View key={s.id} style={styles.sightingCard}>
                    <View style={styles.sightingRow}>
                      <IconCircle
                        icon="map-marker-outline"
                        color={colors.primary}
                        size={40}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sightingComment}>
                          {s.notes ?? s.comment ?? "Avistamiento reportado"}
                        </Text>
                        {s.location?.addressText && (
                          <View style={styles.sightingLocationRow}>
                            <MaterialCommunityIcons
                              name="map-marker"
                              size={12}
                              color={colors.onPrimaryContainer}
                            />
                            <Text style={styles.sightingLocation} numberOfLines={1}>
                              {s.location.addressText}
                            </Text>
                          </View>
                        )}
                        <View style={styles.sightingMeta}>
                          {s.user?.name && (
                            <Text style={styles.sightingUser}>
                              {s.user.name}
                            </Text>
                          )}
                          <Text style={styles.sightingTime}>
                            {new Date(s.createdAt).toLocaleString("es-CL")}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {s.image?.url && (
                      <Image
                        source={{ uri: s.image.url }}
                        style={styles.sightingImage}
                      />
                    )}
                    {s.location && (
                      <View style={styles.sightingMapWrap}>
                        <MapView
                          style={styles.sightingMap}
                          initialRegion={{
                            latitude: s.location.latitude,
                            longitude: s.location.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                          }}
                          pitchEnabled={false}
                          rotateEnabled={false}
                          scrollEnabled={false}
                          zoomEnabled={false}
                        >
                          <Marker
                            coordinate={{
                              latitude: s.location.latitude,
                              longitude: s.location.longitude,
                            }}
                            pinColor={colors.primary}
                          />
                        </MapView>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </SectionCard>

          {/* Owner */}
          {owner && (
            <SectionCard title="Contactar al dueño">
              <Pressable style={styles.ownerRow} onPress={callOwner}>
                <IconCircle icon="phone" color={colors.tertiary} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ownerName}>{owner.name}</Text>
                  <Text style={styles.ownerPhone}>
                    {owner.phone ?? owner.email ?? "—"}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={colors.textMuted}
                />
              </Pressable>
            </SectionCard>
          )}
        </View>
      </ScrollView>

      {/* Footer CTAs */}
      {report.status === "ACTIVE" && (
        <View style={styles.footer}>
          <Pressable
            style={styles.btnPrimary}
            onPress={() =>
              router.push({
                pathname: "/report-sighting",
                params: { reportId: id },
              })
            }
          >
            <MaterialCommunityIcons name="eye-plus" size={18} color="#ffffff" />
            <Text style={styles.btnPrimaryText}>Reportar avistamiento</Text>
          </Pressable>
        </View>
      )}

      <ScreenHeader
        variant="overlay"
        right={
          <Pressable style={styles.shareButton} onPress={shareReport}>
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color="#ffffff"
            />
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
  content: {
    paddingBottom: 140,
  },

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

  mapWrap: {
    height: 180,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },

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

  sightingCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sightingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  sightingComment: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onPrimaryContainer,
    lineHeight: 18,
  },
  sightingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  sightingLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  sightingLocation: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onPrimaryContainer,
    opacity: 0.8,
    flex: 1,
  },
  sightingUser: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.onPrimaryContainer,
    opacity: 0.8,
  },
  sightingTime: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onPrimaryContainer,
    opacity: 0.7,
  },
  sightingImage: {
    width: "100%",
    height: 160,
    borderRadius: radii.sm,
  },
  sightingMapWrap: {
    height: 120,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  sightingMap: {
    flex: 1,
  },

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
    paddingBottom: spacing.lg + 8,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.md,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: "#ffffff",
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

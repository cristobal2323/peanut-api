import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ClusteredMapView from "react-native-map-clustering";
import MapView, { Marker, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { colors, fonts, spacing, radii } from "../src/theme";
import {
  lostReportsApi,
  mapApiLostReportToMapPin,
  haversineKm,
  PublicStatusParam,
} from "../src/api/lostReports";
import { usePreferencesStore } from "../src/store/preferences";
import { MapPin } from "../src/types";

type Filter = "all" | "lost" | "found";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "lost", label: "Perdidos" },
  { value: "found", label: "Encontrados" },
];

const WORLD_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 80,
  longitudeDelta: 80,
};

const MAX_LATITUDE_DELTA = 2;
const MAP_PAGE_SIZE = 200;
const CAROUSEL_MAX = 10;

const normLng = (x: number) => ((x + 540) % 360) - 180;

const statusParam = (f: Filter): PublicStatusParam =>
  f === "lost" ? "active" : f === "found" ? "resolved" : "any";

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const locale = usePreferencesStore((s) => s.locale);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<
    { latitude: number; longitude: number } | null
  >(null);
  const [region, setRegion] = useState<Region | null>(null);

  // Resolve initial region once: user position if granted, otherwise world view.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status === "granted") {
          const loc = await Location.getLastKnownPositionAsync({});
          if (!cancelled && loc) {
            const next = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            setUserCoords(next);
            setRegion({
              ...next,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            });
            return;
          }
        }
      } catch {}
      if (!cancelled) setRegion(WORLD_REGION);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const debouncedRegion = useDebouncedValue(region, 300);

  const zoomTooWide =
    !debouncedRegion || debouncedRegion.latitudeDelta > MAX_LATITUDE_DELTA;

  const bbox = useMemo(() => {
    if (!debouncedRegion || zoomTooWide) return null;
    const halfLat = debouncedRegion.latitudeDelta / 2;
    const halfLng = debouncedRegion.longitudeDelta / 2;
    const minLat = Math.max(-90, debouncedRegion.latitude - halfLat);
    const maxLat = Math.min(90, debouncedRegion.latitude + halfLat);
    const minLng = normLng(debouncedRegion.longitude - halfLng);
    const maxLng = normLng(debouncedRegion.longitude + halfLng);
    return { minLat, maxLat, minLng, maxLng };
  }, [debouncedRegion, zoomTooWide]);

  const statusParamValue = statusParam(filter);

  const { data: page } = useQuery({
    enabled: !!bbox,
    queryKey: [
      "lostReportsPublic",
      "map",
      bbox?.minLat,
      bbox?.maxLat,
      bbox?.minLng,
      bbox?.maxLng,
      statusParamValue,
    ],
    queryFn: () =>
      lostReportsApi.listPublic({
        ...(bbox ?? {}),
        status: statusParamValue,
        take: MAP_PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  const apiReports = page?.items ?? [];
  const exceededCap = page?.nextCursor != null;

  const pins = useMemo<MapPin[]>(
    () =>
      apiReports
        .map((r) => mapApiLostReportToMapPin(r, locale, userCoords))
        .filter((p): p is MapPin => p !== null),
    [apiReports, locale, userCoords]
  );

  const carouselPins = useMemo(() => {
    if (!region) return [];
    const center = { latitude: region.latitude, longitude: region.longitude };
    return [...pins]
      .map((p) => ({
        pin: p,
        d: haversineKm(center, { latitude: p.lat, longitude: p.lng }),
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, CAROUSEL_MAX)
      .map((x) => x.pin);
  }, [pins, region]);

  const selectPin = (pin: MapPin) => {
    setSelectedId(pin.id);
    mapRef.current?.animateToRegion(
      {
        latitude: pin.lat,
        longitude: pin.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      400
    );
  };

  const colorFor = (status: "lost" | "found") =>
    status === "lost" ? colors.error : colors.secondary;

  const headerSubtitle = zoomTooWide
    ? "Acerca el mapa para ver reportes"
    : exceededCap
      ? "Hay más reportes — acerca o filtra"
      : `${pins.length} en esta zona`;

  return (
    <View style={styles.screen}>
      {region && (
        <ClusteredMapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          showsUserLocation
          onRegionChangeComplete={(r: Region) => setRegion(r)}
          clusterColor={colors.primary}
          clusterTextColor="#fff"
          radius={40}
          minPoints={2}
        >
          {pins.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lng }}
              onPress={() => selectPin(p)}
              tracksViewChanges={false}
            >
              <View
                style={[
                  styles.markerWrap,
                  { borderColor: colorFor(p.status) },
                  selectedId === p.id && styles.markerSelected,
                ]}
              >
                {p.photo ? (
                  <Image source={{ uri: p.photo }} style={styles.markerImg} />
                ) : (
                  <MaterialCommunityIcons name="dog" size={20} color={colorFor(p.status)} />
                )}
              </View>
            </Marker>
          ))}
        </ClusteredMapView>
      )}

      {/* Floating header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerCard}>
          <Pressable
            style={styles.headerBack}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Mapa de reportes</Text>
            <Text style={styles.headerSub}>{headerSubtitle}</Text>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <Pressable
                key={f.value}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(f.value)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Bottom carousel */}
      {carouselPins.length > 0 && !zoomTooWide && (
        <View style={[styles.carouselWrap, { paddingBottom: insets.bottom + spacing.lg }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {carouselPins.map((p) => {
              const isSelected = selectedId === p.id;
              return (
                <Pressable
                  key={p.id}
                  style={[styles.miniCard, isSelected && styles.miniCardActive]}
                  onPress={() => selectPin(p)}
                >
                  {p.photo && (
                    <Image source={{ uri: p.photo }} style={styles.miniImg} />
                  )}
                  <View style={styles.miniInfo}>
                    <View style={styles.miniHeader}>
                      <Text style={styles.miniName} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <View
                        style={[
                          styles.miniBadge,
                          { backgroundColor: colorFor(p.status) },
                        ]}
                      >
                        <Text style={styles.miniBadgeText}>
                          {p.status === "lost" ? "Perdido" : "Encontrado"}
                        </Text>
                      </View>
                    </View>
                    {p.breed && <Text style={styles.miniBreed}>{p.breed}</Text>}
                    <View style={styles.miniMeta}>
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={12}
                        color={colors.textMuted}
                      />
                      <Text style={styles.miniDistance}>{p.distanceKm} km</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.miniArrow}
                    onPress={() =>
                      router.push({ pathname: "/report/[id]", params: { id: p.id } })
                    }
                  >
                    <MaterialCommunityIcons name="arrow-right" size={18} color={colors.primary} />
                  </Pressable>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* FAB */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 200 }]}
        onPress={() => router.push("/found-dog")}
      >
        <MaterialCommunityIcons name="plus" size={26} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Markers
  markerWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  markerSelected: {
    transform: [{ scale: 1.15 }],
    borderWidth: 4,
  },
  markerImg: {
    width: "100%",
    height: "100%",
  },

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.onSurface,
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  chipsRow: {
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chipActive: {
    backgroundColor: colors.primary,
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

  // Carousel
  carouselWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  carouselContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm + 2,
  },
  miniCard: {
    width: 280,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    backgroundColor: "#ffffff",
    borderRadius: radii.lg,
    padding: spacing.sm + 2,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  miniCardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  miniImg: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerHigh,
  },
  miniInfo: {
    flex: 1,
  },
  miniHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  miniName: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  miniBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: "#ffffff",
  },
  miniBreed: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  miniMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  miniDistance: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  miniArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryContainer,
  },

  // FAB
  fab: {
    position: "absolute",
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});

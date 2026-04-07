import React, { useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, spacing, radii } from "../src/theme";
import { api } from "../src/api/mockApi";
import { queryKeys } from "../src/lib/queryClient";
import { MapPin } from "../src/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Filter = "all" | "lost" | "found";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "lost", label: "Perdidos" },
  { value: "found", label: "Encontrados" },
];

const DEFAULT_REGION = {
  latitude: -33.4378,
  longitude: -70.6505,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: pins = [] } = useQuery({
    queryKey: queryKeys.mapPins,
    queryFn: api.fetchAllPinsOnMap,
  });

  const filtered = useMemo(() => {
    if (filter === "all") return pins;
    return pins.filter((p) => p.status === filter);
  }, [pins, filter]);

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

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
      >
        {filtered.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            onPress={() => selectPin(p)}
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
      </MapView>

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
            <Text style={styles.headerSub}>{filtered.length} en tu zona</Text>
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
      {filtered.length > 0 && (
        <View style={[styles.carouselWrap, { paddingBottom: insets.bottom + spacing.lg }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {filtered.map((p) => {
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
                      router.push({ pathname: "/report/[id]", params: { id: "lr1" } })
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

import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native-paper";
import * as Location from "expo-location";
import { EmptyState } from "../../src/components/EmptyState";
import { DogCard } from "../../src/components/DogCard";
import { spacing, colors, radii, fonts } from "../../src/theme";
import {
  lostReportsApi,
  mapApiLostReportToCommunityReport,
} from "../../src/api/lostReports";
import { queryKeys } from "../../src/lib/queryClient";
import { usePreferencesStore } from "../../src/store/preferences";

type FilterValue = "all" | "lost" | "found" | "recent";
type DateFilter = "today" | "week" | "month";

const DATE_CUTOFFS: Record<DateFilter, number> = {
  today: 86400000,
  week: 604800000,
  month: 2592000000,
};

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "lost", label: "Perdidos" },
  { value: "found", label: "Encontrados" },
  { value: "recent", label: "Recientes" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Hace un momento";
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hace 1 día";
  return `Hace ${days} días`;
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const locale = usePreferencesStore((s) => s.locale);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);
  const [breedFilter, setBreedFilter] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [userCoords, setUserCoords] = useState<
    { latitude: number; longitude: number } | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== "granted") return;
        const loc = await Location.getLastKnownPositionAsync({});
        if (loc) {
          setUserCoords({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch {}
    })();
  }, []);

  const activeExtraCount =
    (distanceFilter != null ? 1 : 0) +
    (dateFilter != null ? 1 : 0) +
    (breedFilter != null ? 1 : 0);

  const { data: apiReports = [], isLoading } = useQuery({
    queryKey: queryKeys.lostReports,
    queryFn: lostReportsApi.getActive,
  });

  const reports = useMemo(
    () =>
      apiReports.map((r) =>
        mapApiLostReportToCommunityReport(r, locale, userCoords)
      ),
    [apiReports, locale, userCoords]
  );

  const breeds = useMemo(
    () => [...new Set(reports.map((r) => r.breed))].sort(),
    [reports],
  );

  const filtered = useMemo(() => {
    let result = [...reports];

    // Categoria
    if (activeFilter === "lost") result = result.filter((r) => r.reportType === "lost");
    else if (activeFilter === "found") result = result.filter((r) => r.reportType === "found");

    // Texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.dogName.toLowerCase().includes(q) ||
          r.breed.toLowerCase().includes(q) ||
          (r.description?.toLowerCase().includes(q) ?? false) ||
          r.location.toLowerCase().includes(q),
      );
    }

    // Distancia
    if (distanceFilter != null) {
      result = result.filter((r) => r.distanceKm <= distanceFilter);
    }

    // Fecha
    if (dateFilter) {
      const now = Date.now();
      result = result.filter(
        (r) => now - new Date(r.createdAt).getTime() <= DATE_CUTOFFS[dateFilter],
      );
    }

    // Raza
    if (breedFilter) {
      result = result.filter((r) => r.breed === breedFilter);
    }

    // Ordenar recientes
    if (activeFilter === "recent")
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [reports, activeFilter, searchQuery, distanceFilter, dateFilter, breedFilter]);

  return (
    <View style={styles.container}>
      {/* ── Sticky header ── */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Comunidad</Text>
            <Text style={styles.subtitle}>
              Ayuda a reunir a las familias con sus mascotas
            </Text>
          </View>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              setShowFilters((v) => !v);
              if (showFilters) {
                setActiveFilter("all");
                setSearchQuery("");
                setDistanceFilter(null);
                setDateFilter(null);
                setBreedFilter(null);
              }
            }}
          >
            <MaterialCommunityIcons
              name={showFilters ? "filter-variant-remove" : "filter-variant"}
              size={22}
              color={colors.onSurface}
            />
          </Pressable>
        </View>

        {/* Search bar + Filtros button */}
        {showFilters && (
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre, raza..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => setShowSheet(true)}
              style={[styles.filtrosBtn, activeExtraCount > 0 && styles.filtrosBtnActive]}
            >
              <MaterialCommunityIcons
                name="tune-variant"
                size={20}
                color={activeExtraCount > 0 ? colors.onPrimary : colors.onSurface}
              />
              {activeExtraCount > 0 && (
                <View style={styles.filtrosBadge}>
                  <Text style={styles.filtrosBadgeText}>{activeExtraCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        )}

        {/* Category chips */}
        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
            style={styles.filtersScroll}
          >
            {FILTERS.map((f) => {
              const active = activeFilter === f.value;
              return (
                <Pressable
                  key={f.value}
                  onPress={() => setActiveFilter(f.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

      </View>

      {/* ── Bottom sheet modal ── */}
      <Modal
        visible={showSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSheet(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setShowSheet(false)}>
          <Pressable style={styles.sheetContent} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filtros</Text>

            {/* Distance */}
            <Text style={styles.sheetSectionTitle}>Distancia</Text>
            <View style={styles.sheetChipsWrap}>
              {([1, 5, 10] as const).map((km) => {
                const active = distanceFilter === km;
                return (
                  <Pressable
                    key={`d-${km}`}
                    onPress={() => setDistanceFilter(active ? null : km)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <MaterialCommunityIcons
                      name="map-marker-distance"
                      size={14}
                      color={active ? colors.onPrimary : colors.textMuted}
                    />
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {"< "}{km} km
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Date */}
            <Text style={styles.sheetSectionTitle}>Fecha</Text>
            <View style={styles.sheetChipsWrap}>
              {([
                { value: "today" as DateFilter, label: "Hoy" },
                { value: "week" as DateFilter, label: "Semana" },
                { value: "month" as DateFilter, label: "Mes" },
              ]).map((d) => {
                const active = dateFilter === d.value;
                return (
                  <Pressable
                    key={`t-${d.value}`}
                    onPress={() => setDateFilter(active ? null : d.value)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={14}
                      color={active ? colors.onPrimary : colors.textMuted}
                    />
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Breed */}
            <Text style={styles.sheetSectionTitle}>Raza</Text>
            <View style={styles.sheetChipsWrap}>
              {breeds.map((breed) => {
                const active = breedFilter === breed;
                return (
                  <Pressable
                    key={`b-${breed}`}
                    onPress={() => setBreedFilter(active ? null : breed)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {breed}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.sheetActions}>
              {activeExtraCount > 0 && (
                <Pressable
                  style={styles.sheetClearBtn}
                  onPress={() => {
                    setDistanceFilter(null);
                    setDateFilter(null);
                    setBreedFilter(null);
                  }}
                >
                  <Text style={styles.sheetClearText}>Limpiar</Text>
                </Pressable>
              )}
              <Pressable
                style={styles.sheetApplyBtn}
                onPress={() => setShowSheet(false)}
              >
                <Text style={styles.sheetApplyText}>Aplicar filtros</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Scrollable content ── */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Active reports banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={24}
              color={colors.primaryContainer}
            />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              {filtered.length} reportes activos
            </Text>
            <Text style={styles.bannerSubtitle}>En tu área (radio de 5 km)</Text>
          </View>
        </View>

        {/* Report cards */}
        {isLoading ? (
          <Text style={styles.loading}>Cargando...</Text>
        ) : filtered.length === 0 ? (
          <EmptyState icon="map-marker-off" message="No hay reportes en esta categoría" />
        ) : (
          filtered.map((report) => (
            <DogCard
              key={report.id}
              photo={report.photo}
              name={report.dogName}
              breed={report.breed}
              description={report.description}
              status={report.reportType === "found" ? "found" : "lost"}
              distanceKm={report.distanceKm}
              date={timeAgo(report.createdAt)}
              location={report.location}
              style={styles.cardSpacing}
            />
          ))
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stickyHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.heading,
    color: colors.onSurface,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  // Filters
  filtersScroll: {
    marginBottom: spacing.md,
  },
  filtersRow: {
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
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
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurface,
  },
  chipTextActive: {
    color: colors.onPrimary,
    fontFamily: fonts.bodySemiBold,
  },

  // Search row
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurface,
    padding: 0,
  },

  // Filtros button
  filtrosBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filtrosBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filtrosBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  filtrosBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: "#fff",
  },

  // Bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: fonts.heading,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontFamily: fonts.headingMedium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sheetChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sheetActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  sheetClearBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  sheetClearText: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  sheetApplyBtn: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  sheetApplyText: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onPrimary,
  },

  // Filter chips (used inside sheet)
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurface,
  },
  filterChipTextActive: {
    color: colors.onPrimary,
    fontFamily: fonts.bodySemiBold,
  },
  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontFamily: fonts.headingMedium,
    color: colors.onSurface,
  },
  bannerSubtitle: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Cards
  cardSpacing: {
    marginBottom: spacing.md,
  },

  loading: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.xl,
    fontFamily: fonts.body,
  },
});

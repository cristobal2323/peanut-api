import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Text } from "react-native-paper";
import * as Location from "expo-location";
import { EmptyState } from "../../src/components/EmptyState";
import { DogCard } from "../../src/components/DogCard";
import { MultiSelectField } from "../../src/components/MultiSelectField";
import {
  LocationSearchField,
  SelectedLocation,
} from "../../src/components/LocationSearchField";
import type { SelectOption } from "../../src/components/SearchableSelect";
import { spacing, colors, radii, fonts } from "../../src/theme";
import {
  lostReportsApi,
  mapApiLostReportToCommunityReport,
  PublicStatusParam,
} from "../../src/api/lostReports";
import { breedsApi, BreedOption } from "../../src/api/breeds";
import { colorsApi, ColorOption } from "../../src/api/colors";
import { queryKeys } from "../../src/lib/queryClient";
import { usePreferencesStore } from "../../src/store/preferences";

type FilterValue = "all" | "lost" | "found";
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
];

const PAGE_SIZE = 20;

function timeAgo(dateStr: string): string {
  const ts = new Date(dateStr).getTime();
  if (isNaN(ts)) return "";
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Hace un momento";
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hace 1 día";
  return `Hace ${days} días`;
}

const statusParam = (f: FilterValue): PublicStatusParam =>
  f === "lost" ? "active" : f === "found" ? "resolved" : "any";

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const locale = usePreferencesStore((s) => s.locale);
  const listRef = useRef<FlatList>(null);

  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);
  const [breedFilters, setBreedFilters] = useState<string[]>([]);
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [searchLocation, setSearchLocation] = useState<SelectedLocation | null>(
    null
  );
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

  const debouncedSearch = useDebouncedValue(searchQuery, 350);

  const sinceIso = useMemo(() => {
    if (!dateFilter) return undefined;
    return new Date(Date.now() - DATE_CUTOFFS[dateFilter]).toISOString();
  }, [dateFilter]);

  const activeCenter = searchLocation ?? userCoords;
  const effectiveDistance = distanceFilter ?? (searchLocation ? 50 : null);
  const canFilterByDistance = !!activeCenter && effectiveDistance != null;

  const activeExtraCount =
    (distanceFilter != null ? 1 : 0) +
    (dateFilter != null ? 1 : 0) +
    (breedFilters.length > 0 ? 1 : 0) +
    (colorFilters.length > 0 ? 1 : 0) +
    (searchLocation ? 1 : 0);

  const filterKey = useMemo(
    () => ({
      status: statusParam(activeFilter),
      search: debouncedSearch.trim() || undefined,
      maxKm: canFilterByDistance ? effectiveDistance ?? undefined : undefined,
      lat: canFilterByDistance ? activeCenter?.latitude : undefined,
      lng: canFilterByDistance ? activeCenter?.longitude : undefined,
      since: sinceIso,
      breedIds: breedFilters.length ? breedFilters : undefined,
      colorIds: colorFilters.length ? colorFilters : undefined,
    }),
    [
      activeFilter,
      debouncedSearch,
      distanceFilter,
      activeCenter?.latitude,
      activeCenter?.longitude,
      sinceIso,
      breedFilters,
      colorFilters,
      canFilterByDistance,
      searchLocation,
    ]
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: [...queryKeys.lostReportsPublic, filterKey],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      lostReportsApi.listPublic({ ...filterKey, skip: pageParam, take: PAGE_SIZE }),
    getNextPageParam: (last) => last.nextCursor,
  });

  const reports = useMemo(() => {
    const items = data?.pages.flatMap((p) => p.items) ?? [];
    return items.map((r) =>
      mapApiLostReportToCommunityReport(r, locale, activeCenter)
    );
  }, [data, locale, activeCenter]);

  const { data: breeds = [] } = useQuery({
    queryKey: queryKeys.breeds(),
    queryFn: () => breedsApi.list(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: colorOptions = [] } = useQuery({
    queryKey: queryKeys.colors(),
    queryFn: () => colorsApi.list(),
    staleTime: 1000 * 60 * 10,
  });

  const clearAllFilters = () => {
    setDistanceFilter(null);
    setDateFilter(null);
    setBreedFilters([]);
    setColorFilters([]);
    setSearchLocation(null);
  };

  const breedOptions = useMemo<SelectOption[]>(
    () => breeds.map((b) => ({ id: b.id, label: b.name })),
    [breeds]
  );

  const colorOptionItems = useMemo<SelectOption[]>(
    () =>
      colorOptions.map((c) => ({
        id: c.id,
        label: c.name,
        hint: c.hex ?? undefined,
      })),
    [colorOptions]
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
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
            {reports.length} {reports.length === 1 ? "reporte" : "reportes"}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {canFilterByDistance
              ? `Dentro de ${effectiveDistance} km de ${searchLocation ? searchLocation.name.split(",")[0].trim() : "ti"}`
              : "Comunidad completa"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
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
                clearAllFilters();
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

        {showFilters && (
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre, descripción..."
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
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

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

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
              {/* Location search */}
              <View style={{ marginTop: spacing.xs }}>
                <LocationSearchField
                  label="Ubicación"
                  value={searchLocation}
                  onChange={setSearchLocation}
                  placeholder="Centrar búsqueda en una dirección"
                  searchPlaceholder="Ej: Santiago, Madrid..."
                />
              </View>

              {/* Distance */}
              <Text style={styles.sheetSectionTitle}>Distancia</Text>
              {!activeCenter && (
                <Text style={styles.sheetHint}>
                  Activa la ubicación o busca una dirección para usar este filtro
                </Text>
              )}
              <View style={styles.sheetChipsWrap}>
                {([1, 5, 10, 25] as const).map((km) => {
                  const active = distanceFilter === km;
                  const disabled = !activeCenter;
                  return (
                    <Pressable
                      key={`d-${km}`}
                      onPress={() =>
                        !disabled && setDistanceFilter(active ? null : km)
                      }
                      disabled={disabled}
                      style={[
                        styles.filterChip,
                        active && styles.filterChipActive,
                        disabled && styles.filterChipDisabled,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="map-marker-distance"
                        size={14}
                        color={active ? colors.onPrimary : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          active && styles.filterChipTextActive,
                        ]}
                      >
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
                      <Text
                        style={[
                          styles.filterChipText,
                          active && styles.filterChipTextActive,
                        ]}
                      >
                        {d.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Breed */}
              <View style={{ marginTop: spacing.md }}>
                <MultiSelectField
                  label="Raza"
                  placeholder="Todas las razas"
                  searchPlaceholder="Buscar raza..."
                  values={breedFilters}
                  options={breedOptions}
                  onChange={setBreedFilters}
                />
              </View>

              {/* Color */}
              <View style={{ marginTop: spacing.md }}>
                <MultiSelectField
                  label="Color"
                  placeholder="Todos los colores"
                  searchPlaceholder="Buscar color..."
                  values={colorFilters}
                  options={colorOptionItems}
                  onChange={setColorFilters}
                  renderOptionLeading={(opt) =>
                    opt.hint ? (
                      <View
                        style={[styles.colorDot, { backgroundColor: opt.hint }]}
                      />
                    ) : null
                  }
                />
              </View>
            </ScrollView>

            <View style={styles.sheetActions}>
              {activeExtraCount > 0 && (
                <Pressable style={styles.sheetClearBtn} onPress={clearAllFilters}>
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

      <FlatList
        ref={listRef}
        data={reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <DogCard
            photo={item.photo}
            name={item.dogName}
            breed={item.breed}
            description={item.description}
            status={item.reportType === "found" ? "found" : "lost"}
            distanceKm={item.distanceKm}
            date={timeAgo(item.createdAt)}
            location={item.location}
            style={styles.cardSpacing}
          />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerFeedback}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <EmptyState icon="map-marker-off" message="No hay reportes en esta categoría" />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={{ height: spacing.xxl }} />
          )
        }
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: spacing.lg,
  },
  listHeader: {
    paddingTop: spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerLeft: { flex: 1 },
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

  filtersScroll: { marginBottom: spacing.md },
  filtersRow: { gap: spacing.sm },
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
    maxHeight: "80%",
  },
  sheetScroll: {
    marginBottom: spacing.md,
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
  sheetHint: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  sheetChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sheetActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
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
  filterChipDisabled: {
    opacity: 0.4,
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
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },

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
  bannerText: { flex: 1 },
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

  cardSpacing: { marginBottom: spacing.md },

  centerFeedback: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
});

import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native-paper";
import { EmptyState } from "../../src/components/EmptyState";
import { spacing, colors, radii, fonts } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { CommunityReport, ReportType } from "../../src/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_IMAGE_HEIGHT = 220;

type FilterValue = "all" | "lost" | "found" | "recent";

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
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const { data: reports = [], isLoading } = useQuery({
    queryKey: queryKeys.communityReports,
    queryFn: api.fetchCommunityReports,
  });

  const filtered = useMemo(() => {
    let result = [...reports];
    if (activeFilter === "lost") result = result.filter((r) => r.reportType === "lost");
    else if (activeFilter === "found") result = result.filter((r) => r.reportType === "found");
    else if (activeFilter === "recent")
      result = result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return result;
  }, [reports, activeFilter]);

  const activeCount = reports.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Comunidad</Text>
          <Text style={styles.subtitle}>
            Ayuda a reunir a las familias con sus mascotas
          </Text>
        </View>
        <Pressable style={styles.filterButton}>
          <MaterialCommunityIcons
            name="tune-variant"
            size={22}
            color={colors.onSurface}
          />
        </Pressable>
      </View>

      {/* Filter chips */}
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
            {activeCount} reportes activos
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
          <ReportCard key={report.id} report={report} />
        ))
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const ReportCard = ({ report }: { report: CommunityReport }) => {
  const badgeLabel = report.reportType === "found" ? "Encontrado" : "Perdido";
  const badgeColor =
    report.reportType === "found" ? colors.primaryContainer : colors.error;

  return (
    <View style={styles.card}>
      {/* Image section */}
      <View style={styles.cardImageWrapper}>
        <Image source={{ uri: report.photo }} style={styles.cardImage} />

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.statusBadgeText}>{badgeLabel}</Text>
        </View>

        {/* Distance badge */}
        <View style={styles.distanceBadge}>
          <MaterialCommunityIcons
            name="map-marker"
            size={14}
            color={colors.onPrimary}
          />
          <Text style={styles.distanceBadgeText}>
            {report.distanceKm} km
          </Text>
        </View>
      </View>

      {/* Info section */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{report.dogName}</Text>
        <Text style={styles.cardBreed}>{report.breed}</Text>
        {report.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {report.description}
          </Text>
        ) : null}
        <View style={styles.cardMeta}>
          <View style={styles.cardMetaItem}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={styles.cardMetaText}>{timeAgo(report.createdAt)}</Text>
          </View>
          <View style={styles.cardMetaItem}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={styles.cardMetaText}>{report.location}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
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
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    overflow: "hidden",
    shadowColor: colors.onSurface,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  cardImageWrapper: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: colors.surfaceContainerHigh,
  },
  statusBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  statusBadgeText: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.onPrimary,
  },
  distanceBadge: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(30, 27, 19, 0.6)",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radii.full,
  },
  distanceBadgeText: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.onPrimary,
  },
  cardInfo: {
    padding: spacing.md,
  },
  cardName: {
    fontSize: 18,
    fontFamily: fonts.heading,
    color: colors.onSurface,
  },
  cardBreed: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm + 2,
  },
  cardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardMetaText: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },

  loading: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.xl,
    fontFamily: fonts.body,
  },
});

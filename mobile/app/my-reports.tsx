import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { EmptyState } from "../src/components/EmptyState";
import { colors, fonts, spacing, radii } from "../src/theme";
import {
  lostReportsApi,
  LostReportApi,
  LostReportStatusApi,
} from "../src/api/lostReports";
import {
  sightingsApi,
  SightingApi,
  SightingStatusApi,
} from "../src/api/sightings";
import { queryKeys } from "../src/lib/queryClient";
import { useAuthStore } from "../src/store/auth";
import { usePreferencesStore } from "../src/store/preferences";

type Tab = "all" | "lost" | "sightings";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "lost", label: "Mis perdidos" },
  { value: "sightings", label: "Mis avistamientos" },
];

const PAGE_SIZE = 20;

type UnifiedReport = {
  id: string;
  kind: "lost-report" | "sighting";
  name: string;
  photo: string;
  location: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  createdAt: string;
  canMarkFound: boolean;
  canClose: boolean;
  rawId: string;
};

function mapLostReport(r: LostReportApi, locale: string): UnifiedReport {
  const dog = r.dog;
  const breedName =
    locale === "es"
      ? (dog?.breed as any)?.nameEs ?? (dog?.breed as any)?.name
      : (dog?.breed as any)?.name;
  const loc = r.lastSeenLocation;
  const statusMap: Record<LostReportStatusApi, { label: string; color: string }> = {
    ACTIVE: { label: "Perdido", color: colors.error },
    RESOLVED: { label: "Encontrado", color: colors.secondary },
    CANCELLED: { label: "Cancelado", color: colors.textMuted },
  };
  const st = statusMap[r.status];
  return {
    id: `lr-${r.id}`,
    kind: "lost-report",
    name: dog?.name ?? "Perro",
    photo: dog?.photoUrl ?? "",
    location:
      loc?.addressText ??
      (loc ? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}` : ""),
    status: r.status,
    statusLabel: st.label,
    statusColor: st.color,
    createdAt: r.createdAt,
    canMarkFound: r.status === "ACTIVE",
    canClose: false,
    rawId: r.id,
  };
}

function mapSighting(s: SightingApi, locale: string): UnifiedReport {
  const loc = s.location;
  const dogName =
    s.dog?.name ?? (locale === "es" ? "Perro encontrado" : "Found dog");
  const statusMap: Record<SightingStatusApi, { label: string; color: string }> = {
    ACTIVE: { label: "Activo", color: colors.primary },
    FOUND: { label: "Encontrado", color: colors.secondary },
    CLOSED: { label: "Cerrado", color: colors.textMuted },
  };
  const st = statusMap[s.status];
  return {
    id: `sg-${s.id}`,
    kind: "sighting",
    name: dogName,
    photo: s.image?.url ?? "",
    location:
      loc?.addressText ??
      (loc ? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}` : ""),
    status: s.status,
    statusLabel: st.label,
    statusColor: st.color,
    createdAt: s.createdAt,
    canMarkFound: s.status === "ACTIVE",
    canClose: s.status === "ACTIVE",
    rawId: s.id,
  };
}

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

export default function MyReportsScreen() {
  const qc = useQueryClient();
  const locale = usePreferencesStore((s) => s.locale);
  const [tab, setTab] = useState<Tab>("all");

  const showLR = tab !== "sightings";
  const showSG = tab !== "lost";

  const {
    data: lrData,
    fetchNextPage: fetchNextLR,
    hasNextPage: hasMoreLR,
    isFetchingNextPage: fetchingLR,
    isLoading: loadingLR,
  } = useInfiniteQuery({
    queryKey: [...queryKeys.lostReportsMine, "myReports"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      lostReportsApi.listMine({ skip: pageParam, take: PAGE_SIZE }),
    getNextPageParam: (last) => last.nextCursor,
    enabled: showLR,
  });

  const {
    data: sgData,
    fetchNextPage: fetchNextSG,
    hasNextPage: hasMoreSG,
    isFetchingNextPage: fetchingSG,
    isLoading: loadingSG,
  } = useInfiniteQuery({
    queryKey: ["sightings", "mine", "myReports"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      sightingsApi.listMine({ skip: pageParam, take: PAGE_SIZE }),
    getNextPageParam: (last) => last.nextCursor,
    enabled: showSG,
  });

  const reports = useMemo(() => {
    const lr = showLR
      ? (lrData?.pages.flatMap((p) => p.items) ?? []).map((r) =>
          mapLostReport(r, locale)
        )
      : [];
    const sg = showSG
      ? (sgData?.pages.flatMap((p) => p.items) ?? []).map((s) =>
          mapSighting(s, locale)
        )
      : [];
    return [...lr, ...sg].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [lrData, sgData, locale, showLR, showSG]);

  const isLoading = (showLR && loadingLR) || (showSG && loadingSG);
  const isFetchingMore = fetchingLR || fetchingSG;

  const loadMore = () => {
    if (hasMoreLR && showLR && !fetchingLR) fetchNextLR();
    if (hasMoreSG && showSG && !fetchingSG) fetchNextSG();
  };

  const handleMarkFound = async (item: UnifiedReport) => {
    const title =
      item.kind === "lost-report"
        ? "Marcar como encontrado"
        : "Marcar como encontrado";
    const body =
      item.kind === "lost-report"
        ? "¿Tu perro fue reunido contigo?"
        : "¿El perro fue reunido con su dueño?";

    Alert.alert(title, body, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, encontrado",
        onPress: async () => {
          try {
            if (item.kind === "lost-report") {
              await lostReportsApi.resolve(item.rawId);
              qc.invalidateQueries({ queryKey: queryKeys.lostReportsMine });
              qc.invalidateQueries({ queryKey: queryKeys.lostReportsPublic });
              qc.invalidateQueries({ queryKey: queryKeys.dogs });
            } else {
              await sightingsApi.markFound(item.rawId);
              qc.invalidateQueries({ queryKey: ["sightings", "mine"] });
              qc.invalidateQueries({ queryKey: queryKeys.sightingsPublic });
            }
          } catch {
            Alert.alert("Error", "No se pudo actualizar el reporte");
          }
        },
      },
    ]);
  };

  const handleClose = async (item: UnifiedReport) => {
    Alert.alert(
      "Cerrar reporte",
      "El reporte dejará de mostrarse en la comunidad.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar",
          style: "destructive",
          onPress: async () => {
            try {
              await sightingsApi.close(item.rawId);
              qc.invalidateQueries({ queryKey: ["sightings", "mine"] });
              qc.invalidateQueries({ queryKey: queryKeys.sightingsPublic });
            } catch {
              Alert.alert("Error", "No se pudo cerrar el reporte");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Mis reportes" />

      <View style={styles.tabsRow}>
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <Pressable
              key={t.value}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(t.value)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <EmptyState
              icon="clipboard-text-outline"
              message="No tienes reportes aún"
            />
          )
        }
        ListFooterComponent={
          isFetchingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={{ height: spacing.xxl }} />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.cardImg} />
              ) : (
                <View style={[styles.cardImg, styles.cardImgFb]}>
                  <MaterialCommunityIcons
                    name={item.kind === "sighting" ? "eye" : "dog"}
                    size={22}
                    color={colors.outlineVariant}
                  />
                </View>
              )}
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: item.statusColor },
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.statusLabel}</Text>
                  </View>
                </View>
                {item.location ? (
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={12}
                      color={colors.textMuted}
                    />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.dateText}>{timeAgo(item.createdAt)}</Text>
              </View>
            </View>

            {(item.canMarkFound || item.canClose) && (
              <View style={styles.actions}>
                {item.canMarkFound && (
                  <Pressable
                    style={styles.foundBtn}
                    onPress={() => handleMarkFound(item)}
                  >
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={16}
                      color={colors.secondary}
                    />
                    <Text style={styles.foundBtnText}>Encontrado</Text>
                  </Pressable>
                )}
                {item.canClose && (
                  <Pressable
                    style={styles.closeBtn}
                    onPress={() => handleClose(item)}
                  >
                    <MaterialCommunityIcons
                      name="close-circle-outline"
                      size={16}
                      color={colors.error}
                    />
                    <Text style={styles.closeBtnText}>Cerrar</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  tabTextActive: {
    color: colors.onPrimary,
    fontFamily: fonts.bodySemiBold,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cardImg: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
  },
  cardImgFb: {
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardName: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: "#fff",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  dateText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  foundBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: colors.secondaryContainer,
  },
  foundBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.secondary,
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: colors.errorContainer,
  },
  closeBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.error,
  },
  center: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
});

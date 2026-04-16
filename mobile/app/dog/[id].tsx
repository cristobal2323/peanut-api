import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { StatusBadge } from "../../src/components/StatusBadge";
import { SectionCard } from "../../src/components/SectionCard";
import { IconCircle } from "../../src/components/IconCircle";
import { spacing, colors, fonts, radii } from "../../src/theme";
import { dogsApi, mapApiDogToDog } from "../../src/api/dogs";
import { lostReportsApi } from "../../src/api/lostReports";
import { queryKeys } from "../../src/lib/queryClient";
import { usePreferencesStore } from "../../src/store/preferences";
import { useTranslation } from "../../src/i18n";

const HERO_HEIGHT = 320;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const locale = usePreferencesStore((s) => s.locale);
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [resolving, setResolving] = useState(false);

  const { data: apiDog, isLoading } = useQuery({
    queryKey: queryKeys.dog(id),
    queryFn: () => dogsApi.getById(id),
  });

  const dog = apiDog ? mapApiDogToDog(apiDog, locale) : undefined;

  const confirmResolve = () => {
    Alert.alert(
      t("reportLost.markAsFoundConfirmTitle"),
      t("reportLost.markAsFoundConfirmBody"),
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: t("reportLost.markAsFoundConfirmCta"),
          onPress: async () => {
            setResolving(true);
            try {
              const { items: mine } = await lostReportsApi.listMine({ take: 100 });
              const active = mine.find(
                (r) => r.dogId === id && r.status === "ACTIVE"
              );
              if (!active) {
                Alert.alert("Error", t("reportLost.markAsFoundErrorNoReport"));
                return;
              }
              await lostReportsApi.resolve(active.id);
              qc.invalidateQueries({ queryKey: queryKeys.dogs });
              qc.invalidateQueries({ queryKey: queryKeys.dog(id) });
              qc.invalidateQueries({ queryKey: queryKeys.lostReports });
              qc.invalidateQueries({ queryKey: queryKeys.lostReportsMine });
              Alert.alert("Listo", t("reportLost.markAsFoundSuccess"));
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "No pudimos actualizar la alerta");
            } finally {
              setResolving(false);
            }
          },
        },
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      "Eliminar perro",
      `¿Seguro que quieres eliminar a ${dog?.name ?? "este perro"}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await dogsApi.remove(id);
              qc.invalidateQueries({ queryKey: queryKeys.dogs });
              qc.removeQueries({ queryKey: queryKeys.dog(id) });
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "No pudimos eliminar el perro");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !dog) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Cargando perro...</Text>
      </View>
    );
  }

  const isLost = dog.status === "lost";
  const status = isLost ? "lost" : "safe";

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          {dog.photo ? (
            <Image source={{ uri: dog.photo }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <MaterialCommunityIcons name="dog" size={80} color={colors.outlineVariant} />
            </View>
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.1)"]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* ── White overlap card ── */}
        <View style={styles.overlapCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={styles.dogName}>{dog.name}</Text>
              <Text style={styles.dogBreed}>{dog.breed}</Text>
            </View>
            <StatusBadge variant={status} size="lg" />
          </View>

          {/* 2x2 grid */}
          <View style={styles.grid}>
            <GridItem icon="gender-male-female" label="Sexo" value={dog.sex === "male" ? "Macho" : dog.sex === "female" ? "Hembra" : "—"} />
            <GridItem icon="cake-variant-outline" label="Edad" value={dog.age != null ? `${dog.age} años` : "—"} />
            <GridItem icon="palette-outline" label="Color" value={dog.color ?? "—"} />
            <GridItem icon="ruler" label="Tamaño" value={
              dog.size === "small" ? "Pequeño" :
              dog.size === "medium" ? "Mediano" :
              dog.size === "large" ? "Grande" : "—"
            } />
          </View>

          {/* Microchip pill */}
          {dog.microchip && (
            <View style={styles.microchipRow}>
              <MaterialCommunityIcons name="chip" size={18} color={colors.primary} />
              <Text style={styles.microchipText}>Microchip: {dog.microchip}</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Link href={{ pathname: "/scan/nose", params: { dogId: dog.id } }} asChild>
              <Pressable style={styles.btnPrimary}>
                <MaterialCommunityIcons name="line-scan" size={18} color="#ffffff" />
                <Text style={styles.btnPrimaryText}>Actualizar trufa</Text>
              </Pressable>
            </Link>
            {isLost ? (
              <Pressable
                style={[styles.btnSuccess, resolving && styles.btnDisabled]}
                onPress={confirmResolve}
                disabled={resolving}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={18}
                  color="#ffffff"
                />
                <Text style={styles.btnSuccessText}>
                  {resolving
                    ? t("reportLost.markAsFoundUpdating")
                    : t("reportLost.markAsFound")}
                </Text>
              </Pressable>
            ) : (
              <Link href={{ pathname: "/report-lost/[dogId]", params: { dogId: dog.id } }} asChild>
                <Pressable style={styles.btnDanger}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.error} />
                  <Text style={styles.btnDangerText}>Reportar perdido</Text>
                </Pressable>
              </Link>
            )}
          </View>
        </View>

        {/* ── Información adicional ── */}
        <View style={styles.body}>
          <SectionCard title="Información adicional">
            <InfoRow icon="calendar-outline" label="Registrado el" value="hace 2 meses" color={colors.primary} />
            <InfoRow icon="line-scan" label="Última escaneada" value="hace 5 días" color={colors.tertiary} />
            <InfoRow icon="phone-outline" label="Contacto" value="+56 9 1234 5678" color={colors.secondary} last />
          </SectionCard>

          <SectionCard title="Rasgos distintivos">
            <Text style={styles.paragraph}>
              Mancha blanca en la frente, cola con punta blanca y un colmillo más
              corto que el otro. Le encantan los snacks y responde a su nombre.
            </Text>
          </SectionCard>

          <SectionCard title="Historial de escaneos">
            <View style={styles.timeline}>
              <TimelineItem date="2026-04-01" text="Trufa actualizada" first />
              <TimelineItem date="2026-02-15" text="Perfil completado" />
              <TimelineItem date="2026-02-15" text="Cuenta creada" last />
            </View>
          </SectionCard>

          <Pressable
            style={[styles.deleteRow, deleting && styles.deleteRowDisabled]}
            onPress={confirmDelete}
            disabled={deleting}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={18}
              color={colors.error}
            />
            <Text style={styles.deleteRowText}>
              {deleting ? "Eliminando..." : "Eliminar este perro"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <ScreenHeader
        variant="overlay"
        right={
          <View style={styles.headerActions}>
            <Link href={{ pathname: "/dog/edit/[id]", params: { id: dog.id } }} asChild>
              <Pressable style={styles.editButton}>
                <MaterialCommunityIcons name="pencil" size={20} color="#ffffff" />
              </Pressable>
            </Link>
            <Pressable
              style={styles.deleteHeaderButton}
              onPress={confirmDelete}
              disabled={deleting}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="#ffffff"
              />
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

// ─── Sub-components ─────────────────────────────────
function GridItem({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.gridItem}>
      <View style={styles.gridIconBox}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.gridLabel}>{label}</Text>
        <Text style={styles.gridValue}>{value}</Text>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  color,
  last,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  color: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider]}>
      <IconCircle icon={icon} color={color} size={36} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function TimelineItem({ date, text, first, last }: { date: string; text: string; first?: boolean; last?: boolean }) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineBar}>
        {!first && <View style={styles.timelineLine} />}
        <View style={styles.timelineDot} />
        {!last && <View style={[styles.timelineLine, { flex: 1 }]} />}
      </View>
      <View style={styles.timelineText}>
        <Text style={styles.timelineTextLabel}>{text}</Text>
        <Text style={styles.timelineTextDate}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  content: {
    paddingBottom: 60,
  },

  // Hero
  hero: {
    height: HERO_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: colors.surfaceContainerHigh,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    marginTop: spacing.sm,
  },
  deleteRowDisabled: {
    opacity: 0.5,
  },
  deleteRowText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
  },

  // Overlap card
  overlapCard: {
    backgroundColor: colors.surfaceContainerLowest,
    marginTop: -32,
    marginHorizontal: spacing.lg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleCol: {
    flex: 1,
  },
  dogName: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.onSurface,
    lineHeight: 32,
  },
  dogBreed: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },
  gridItem: {
    flexBasis: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
  },
  gridIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  gridValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
  microchipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    alignSelf: "flex-start",
  },
  microchipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.onPrimaryContainer,
  },

  // Actions
  actionRow: {
    gap: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },
  btnDanger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  btnDangerText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.error,
  },
  btnSuccess: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.tertiary,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  btnSuccessText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // Body sections
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },

  // InfoRow
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  infoRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  infoLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurface,
    marginTop: 1,
  },

  paragraph: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Timeline
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 56,
  },
  timelineBar: {
    width: 16,
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    backgroundColor: colors.outlineVariant,
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginVertical: 4,
  },
  timelineText: {
    flex: 1,
    paddingVertical: 2,
  },
  timelineTextLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurface,
  },
  timelineTextDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});

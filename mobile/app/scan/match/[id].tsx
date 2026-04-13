import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../../../src/components/ScreenHeader";
import { SectionCard } from "../../../src/components/SectionCard";
import { StatusBadge } from "../../../src/components/StatusBadge";
import {
  ScoreCircle,
  ConfidenceBar,
  getConfidenceColor,
} from "../../../src/components/ConfidenceBar";
import { IconCircle } from "../../../src/components/IconCircle";
import { api } from "../../../src/api/mockApi";
import { queryKeys } from "../../../src/lib/queryClient";
import { colors, fonts, spacing, radii } from "../../../src/theme";

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: match, isLoading } = useQuery({
    queryKey: queryKeys.match(id!),
    queryFn: () => api.fetchMatch(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ScreenHeader title="Resultado" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.center}>
        <ScreenHeader title="Resultado" />
        <Text style={styles.emptyText}>No se encontró el resultado</Text>
      </View>
    );
  }

  const dog = match.registeredDog;
  const confidenceColor = getConfidenceColor(match.confidence);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Resultado" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          {dog.photo ? (
            <Image source={{ uri: dog.photo }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <MaterialCommunityIcons
                name="dog"
                size={64}
                color={colors.textMuted}
              />
            </View>
          )}
          <StatusBadge variant="match" size="lg" style={styles.heroBadge} />
        </View>

        {/* Score */}
        <View style={styles.scoreSection}>
          <ScoreCircle value={match.confidence} size={90} />
          <Text style={[styles.scoreLabel, { color: confidenceColor }]}>
            {match.confidence >= 80
              ? "Coincidencia alta"
              : match.confidence >= 60
              ? "Coincidencia probable"
              : "Coincidencia baja"}
          </Text>
        </View>

        {/* Dog info */}
        <SectionCard title={dog.name}>
          <Text style={styles.breed}>{dog.breed}</Text>
          <View style={styles.grid}>
            <GridItem icon="gender-male-female" label="Sexo" value={dog.sex === "male" ? "Macho" : dog.sex === "female" ? "Hembra" : "—"} />
            <GridItem icon="calendar" label="Edad" value={dog.age ? `${dog.age} años` : "—"} />
            <GridItem icon="palette" label="Color" value={dog.color ?? "—"} />
            <GridItem icon="ruler" label="Tamaño" value={dog.size === "small" ? "Pequeño" : dog.size === "medium" ? "Mediano" : dog.size === "large" ? "Grande" : "—"} />
          </View>
        </SectionCard>

        {/* Breakdown */}
        <SectionCard title="Desglose de coincidencia">
          <View style={styles.breakdownList}>
            {match.breakdown.map((item) => (
              <View key={item.label} style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <ConfidenceBar value={item.value} height={10} showScore={false} />
                <Text
                  style={[
                    styles.breakdownValue,
                    { color: getConfidenceColor(item.value) },
                  ]}
                >
                  {item.value}%
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* Owner */}
        {match.owner && (
          <SectionCard title="Dueño">
            <View style={styles.ownerRow}>
              {match.owner.avatar ? (
                <Image
                  source={{ uri: match.owner.avatar }}
                  style={styles.ownerAvatar}
                />
              ) : (
                <IconCircle icon="account" color={colors.primary} size={48} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.ownerName}>{match.owner.name}</Text>
                {match.owner.phone && (
                  <Text style={styles.ownerPhone}>{match.owner.phone}</Text>
                )}
              </View>
            </View>
            {match.owner.phone && (
              <Pressable
                style={styles.contactBtn}
                onPress={() =>
                  Linking.openURL(`tel:${match.owner!.phone!.replace(/\s/g, "")}`)
                }
              >
                <MaterialCommunityIcons
                  name="phone"
                  size={18}
                  color="#ffffff"
                />
                <Text style={styles.contactBtnText}>Contactar</Text>
              </Pressable>
            )}
          </SectionCard>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.btnPrimary}
            onPress={() =>
              router.push({ pathname: "/dog/[id]", params: { id: dog.id } })
            }
          >
            <Text style={styles.btnPrimaryText}>Ver perfil completo</Text>
          </Pressable>
          <Pressable
            style={styles.btnGhost}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.btnGhostText}>Volver al inicio</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function GridItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.gridItem}>
      <MaterialCommunityIcons
        name={icon as any}
        size={18}
        color={colors.textMuted}
      />
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={styles.gridValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },

  // Hero
  heroWrap: { borderRadius: radii.xl, overflow: "hidden" },
  heroImage: { width: "100%", height: 220, backgroundColor: colors.surfaceContainer },
  heroPlaceholder: { alignItems: "center", justifyContent: "center" },
  heroBadge: { position: "absolute", top: spacing.md, right: spacing.md },

  // Score
  scoreSection: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  scoreLabel: { fontFamily: fonts.headingMedium, fontSize: 16 },

  // Dog info
  breed: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gridItem: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  gridLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  gridValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.onSurface,
    marginLeft: "auto",
  },

  // Breakdown
  breakdownList: { gap: spacing.md },
  breakdownItem: { gap: 4 },
  breakdownLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  breakdownValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    textAlign: "right",
  },

  // Owner
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainer,
  },
  ownerName: {
    fontFamily: fonts.headingMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  ownerPhone: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.tertiary,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  contactBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },

  // Actions
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: "center",
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },
  btnGhost: {
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  btnGhostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
});

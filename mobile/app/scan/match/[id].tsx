import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../../../src/components/ScreenHeader";
import { SectionCard } from "../../../src/components/SectionCard";
import { IconCircle } from "../../../src/components/IconCircle";
import { InfoTip } from "../../../src/components/InfoTip";
import {
  ConfidenceBar,
  ScoreCircle,
  getConfidenceColor,
} from "../../../src/components/ConfidenceBar";
import { StatusBadge } from "../../../src/components/StatusBadge";
import { colors, fonts, spacing, radii } from "../../../src/theme";
import { api } from "../../../src/api/mockApi";
import { queryKeys } from "../../../src/lib/queryClient";

export default function MatchResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: match, isLoading } = useQuery({
    queryKey: queryKeys.match(id),
    queryFn: () => api.fetchMatch(id),
  });

  if (isLoading || !match) {
    return (
      <View style={styles.center}>
        <ScreenHeader title="Resultado" />
        <Text style={{ color: colors.textMuted, padding: spacing.lg }}>
          Cargando...
        </Text>
      </View>
    );
  }

  const confidenceColor = getConfidenceColor(match.confidence);
  const callOwner = () => {
    if (!match.owner?.phone) return;
    Linking.openURL(`tel:${match.owner.phone.replace(/\s/g, "")}`).catch(() =>
      Alert.alert("Error", "No se pudo abrir el marcador.")
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Resultado de coincidencia" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Purple banner */}
        <LinearGradient
          colors={[colors.accentPurple, "rgba(139,92,246,0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerIconWrap}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={28}
              color="#ffffff"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>¡Posible coincidencia!</Text>
            <Text style={styles.bannerBody}>
              Encontramos un perro registrado que coincide con tu escaneo.
            </Text>
          </View>
        </LinearGradient>

        {/* Visual comparison */}
        <SectionCard title="Comparación visual">
          <View style={styles.compareGrid}>
            <CompareCard
              label="Encontrado"
              labelColor={colors.secondary}
              imageUri={match.foundReport.photo}
            />
            <CompareCard
              label="Registrado"
              labelColor={colors.primary}
              imageUri={match.registeredDog.photo}
            />
          </View>
        </SectionCard>

        {/* Confidence */}
        <SectionCard title="Nivel de coincidencia">
          <View style={styles.confidenceWrap}>
            <ScoreCircle value={match.confidence} size={92} />
            <View style={{ flex: 1, gap: spacing.sm }}>
              <Text style={styles.confidenceLabel}>
                {match.confidence >= 80
                  ? "Coincidencia muy alta"
                  : match.confidence >= 60
                  ? "Coincidencia probable"
                  : "Coincidencia baja"}
              </Text>
              <ConfidenceBar value={match.confidence} showScore={false} />
            </View>
          </View>

          <View style={styles.breakdownList}>
            {match.breakdown.map((item, i) => (
              <View key={i} style={styles.breakdownRow}>
                <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={[styles.breakdownValue, { color: item.color }]}>
                  {item.value}%
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* Registered dog */}
        <SectionCard title="Perro registrado">
          <View style={styles.dogRow}>
            {match.registeredDog.photo && (
              <Image
                source={{ uri: match.registeredDog.photo }}
                style={styles.dogAvatar}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.dogName}>{match.registeredDog.name}</Text>
              <Text style={styles.dogBreed}>{match.registeredDog.breed}</Text>
              <View style={{ marginTop: 4 }}>
                <StatusBadge variant="lost" size="sm" />
              </View>
            </View>
          </View>

          {match.owner && (
            <View style={styles.ownerRow}>
              {match.owner.avatar && (
                <Image
                  source={{ uri: match.owner.avatar }}
                  style={styles.ownerAvatar}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.ownerLabel}>Dueño</Text>
                <Text style={styles.ownerName}>{match.owner.name}</Text>
              </View>
            </View>
          )}

          <View style={styles.alertRow}>
            <IconCircle icon="alert-circle" color={colors.error} size={36} />
            <Text style={styles.alertText}>
              Este perro está reportado como perdido. Por favor contacta a su
              dueño.
            </Text>
          </View>
        </SectionCard>

        <InfoTip
          tone="orange"
          emoji="🛡️"
          title="¿Qué hacer ahora?"
          body="Mantén al perro en un lugar seguro y contacta al dueño lo antes posible. Si no puedes localizarlo, ofrécele agua y comida."
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.btnPrimary} onPress={callOwner}>
          <MaterialCommunityIcons name="phone" size={18} color="#ffffff" />
          <Text style={styles.btnPrimaryText}>Notificar al dueño</Text>
        </Pressable>
        <View style={styles.footerRow}>
          <Pressable
            style={styles.btnOutline}
            onPress={() =>
              router.push({
                pathname: "/report/[id]",
                params: { id: "lr1" },
              })
            }
          >
            <Text style={styles.btnOutlineText}>Ver reporte</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={colors.primary}
            />
          </Pressable>
          <Pressable style={styles.btnGhost} onPress={() => router.back()}>
            <MaterialCommunityIcons name="close-circle" size={16} color={colors.error} />
            <Text style={styles.btnGhostText}>No coincide</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CompareCard({
  label,
  labelColor,
  imageUri,
}: {
  label: string;
  labelColor: string;
  imageUri?: string;
}) {
  return (
    <View style={compareStyles.card}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={compareStyles.image} />
      ) : (
        <View style={[compareStyles.image, compareStyles.placeholder]}>
          <MaterialCommunityIcons name="dog" size={36} color={colors.outlineVariant} />
        </View>
      )}
      <View style={[compareStyles.tag, { backgroundColor: labelColor }]}>
        <Text style={compareStyles.tagText}>{label}</Text>
      </View>
    </View>
  );
}

const compareStyles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surfaceContainerHigh,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  tag: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  tagText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: "#ffffff",
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
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  bannerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: "#ffffff",
  },
  bannerBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },

  compareGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  confidenceWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  confidenceLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  breakdownList: {
    marginTop: spacing.md,
    gap: spacing.sm + 2,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },

  // Registered dog
  dogRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dogAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainerHigh,
  },
  dogName: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.onSurface,
  },
  dogBreed: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  ownerLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  ownerName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurface,
    marginTop: 1,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.errorContainer,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  alertText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onErrorContainer,
    lineHeight: 18,
  },

  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
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
    gap: spacing.xs,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnOutlineText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  btnGhost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  btnGhostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
  },
});

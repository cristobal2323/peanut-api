import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../../../src/components/ScreenHeader";
import { ConfidenceBar } from "../../../src/components/ConfidenceBar";
import { InfoTip } from "../../../src/components/InfoTip";
import { api } from "../../../src/api/mockApi";
import { AppearanceCandidate } from "../../../src/types";
import { colors, fonts, spacing, radii } from "../../../src/theme";

export default function AppearanceResultsScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<AppearanceCandidate[]>([]);

  useEffect(() => {
    if (!imageUri) return;
    api.searchByAppearance(imageUri).then((res) => {
      setCandidates(res.candidates);
      setLoading(false);
    });
  }, [imageUri]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Resultados" />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Buscando coincidencias...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Uploaded image preview */}
          {imageUri && (
            <View style={styles.previewRow}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <Text style={styles.previewLabel}>Imagen analizada</Text>
            </View>
          )}

          {candidates.length > 0 ? (
            <>
              <Text style={styles.resultsTitle}>
                Encontramos {candidates.length} posible
                {candidates.length > 1 ? "s" : ""} coincidencia
                {candidates.length > 1 ? "s" : ""}
              </Text>

              {candidates.map((c) => (
                <Pressable
                  key={c.matchId}
                  style={styles.candidateCard}
                  onPress={() =>
                    router.push({
                      pathname: "/scan/match/[id]",
                      params: { id: c.matchId },
                    })
                  }
                >
                  <View style={styles.candidateRow}>
                    {c.dog.photo ? (
                      <Image
                        source={{ uri: c.dog.photo }}
                        style={styles.candidatePhoto}
                      />
                    ) : (
                      <View
                        style={[styles.candidatePhoto, styles.photoPlaceholder]}
                      >
                        <MaterialCommunityIcons
                          name="dog"
                          size={28}
                          color={colors.textMuted}
                        />
                      </View>
                    )}
                    <View style={styles.candidateInfo}>
                      <Text style={styles.candidateName}>{c.dog.name}</Text>
                      <Text style={styles.candidateBreed}>{c.dog.breed}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={22}
                      color={colors.textMuted}
                    />
                  </View>
                  <ConfidenceBar value={c.confidence} height={10} />
                </Pressable>
              ))}

              <InfoTip
                tone="orange"
                emoji="💡"
                title="Mayor precisión"
                body="Para una identificación más precisa, intenta escanear la trufa del perro."
              />
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="dog"
                  size={48}
                  color={colors.textMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>
                No encontramos coincidencias
              </Text>
              <Text style={styles.emptyBody}>
                Intenta escanear la trufa del perro para mayor precisión
              </Text>

              <Pressable
                style={styles.btnPrimary}
                onPress={() => router.replace("/scan/identify")}
              >
                <Text style={styles.btnPrimaryText}>
                  Intentar con escaneo de trufa
                </Text>
              </Pressable>
              <Pressable
                style={styles.btnGhost}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.btnGhostText}>Volver al inicio</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textMuted,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  // Preview
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  previewImage: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainer,
  },
  previewLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Results
  resultsTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 16,
    color: colors.onSurface,
  },

  // Candidate card
  candidateCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  candidateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  candidatePhoto: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainer,
  },
  photoPlaceholder: { alignItems: "center", justifyContent: "center" },
  candidateInfo: { flex: 1 },
  candidateName: {
    fontFamily: fonts.headingMedium,
    fontSize: 16,
    color: colors.onSurface,
  },
  candidateBreed: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.onSurface,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    alignItems: "center",
    width: "100%",
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },
  btnGhost: {
    paddingVertical: 14,
    alignItems: "center",
  },
  btnGhostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
});

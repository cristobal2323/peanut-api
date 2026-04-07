import React from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { Link } from "expo-router";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { GradientHeader } from "../../src/components/GradientHeader";
import { SectionCard } from "../../src/components/SectionCard";
import { IconCircle } from "../../src/components/IconCircle";
import { InfoTip } from "../../src/components/InfoTip";
import { spacing, colors, fonts, radii } from "../../src/theme";

export default function ScanScreen() {
  const pickFromGallery = async () => {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    // Future: route to scan with the picked image as initial preview.
  };

  return (
    <View style={styles.screen}>
      <GradientHeader
        title="Escanear Trufa"
        subtitle="La nariz de tu perro es su identificador único"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Science explanation ── */}
        <SectionCard>
          <View style={styles.scienceRow}>
            <IconCircle
              icon="dna"
              color={colors.primary}
              size={48}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.scienceTitle}>
                Tecnología biométrica única
              </Text>
              <Text style={styles.scienceBody}>
                Cada nariz canina tiene un patrón único de líneas y manchas, como
                una huella digital. Peanut analiza ese patrón para identificar a
                tu perro en segundos.
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Main CTA ── */}
        <Link href="/scan/nose" asChild>
          <Pressable style={styles.bigCta}>
            <View style={styles.bigCtaIcon}>
              <MaterialCommunityIcons name="camera" size={32} color="#ffffff" />
            </View>
            <View style={styles.bigCtaText}>
              <Text style={styles.bigCtaTitle}>Tomar foto</Text>
              <Text style={styles.bigCtaSub}>Abrir cámara de escaneo</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={26} color="#ffffff" />
          </Pressable>
        </Link>

        {/* ── Secondary actions ── */}
        <View style={styles.row}>
          <Pressable style={styles.smallCard} onPress={pickFromGallery}>
            <IconCircle icon="image-outline" color={colors.secondary} size={48} />
            <Text style={styles.smallCardTitle}>Galería</Text>
            <Text style={styles.smallCardSub}>Subir desde fotos</Text>
          </Pressable>
          <Link href="/found-dog" asChild>
            <Pressable style={styles.smallCard}>
              <IconCircle icon="paw" color={colors.accentPurple} size={48} />
              <Text style={styles.smallCardTitle}>Encontré un perro</Text>
              <Text style={styles.smallCardSub}>Ayuda a su familia</Text>
            </Pressable>
          </Link>
        </View>

        {/* ── Tips ── */}
        <SectionCard title="Consejos para un buen escaneo">
          <View style={styles.tipsList}>
            {[
              "Asegúrate de tener buena luz natural",
              "Mantén la cámara a 10–15 cm de la nariz",
              "El perro debe estar tranquilo y quieto",
              "La nariz debe estar limpia y húmeda",
              "Captura desde un ángulo frontal",
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={colors.tertiary}
                />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <InfoTip
          tone="orange"
          emoji="💡"
          title="¿Sabías que?"
          body="El patrón de la nariz no cambia con el tiempo, a diferencia del pelaje o la edad."
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  scienceRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  scienceTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 4,
  },
  scienceBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  bigCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  bigCtaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bigCtaText: {
    flex: 1,
  },
  bigCtaTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: "#ffffff",
  },
  bigCtaSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  smallCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs + 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  smallCardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
    textAlign: "center",
    marginTop: 4,
  },
  smallCardSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
  },
  tipsList: {
    gap: spacing.sm + 2,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
});

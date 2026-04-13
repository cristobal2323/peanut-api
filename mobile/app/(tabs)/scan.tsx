import React from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { Link } from "expo-router";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GradientHeader } from "../../src/components/GradientHeader";
import { InfoTip } from "../../src/components/InfoTip";
import { spacing, colors, fonts, radii } from "../../src/theme";

export default function ScanScreen() {
  return (
    <View style={styles.screen}>
      <GradientHeader
        title="Escanear"
        subtitle="Identifica o encuentra perros con tecnología biométrica"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Identificar perro ── */}
        <Link href="/scan/identify" asChild>
          <Pressable style={styles.identifyCta}>
            <View style={styles.bigCtaIcon}>
              <MaterialCommunityIcons
                name="magnify-scan"
                size={32}
                color="#ffffff"
              />
            </View>
            <View style={styles.bigCtaText}>
              <Text style={styles.bigCtaTitle}>Identificar perro</Text>
              <Text style={styles.bigCtaSub}>
                Escanea la trufa o sube una foto
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={26}
              color="#ffffff"
            />
          </Pressable>
        </Link>

        {/* ── Encontrar perro ── */}
        <Link href="/found-dog" asChild>
          <Pressable style={styles.findCta}>
            <View style={styles.bigCtaIcon}>
              <MaterialCommunityIcons name="paw" size={32} color="#ffffff" />
            </View>
            <View style={styles.bigCtaText}>
              <Text style={styles.bigCtaTitle}>Encontrar perro</Text>
              <Text style={styles.bigCtaSub}>
                Reporta un perro que encontraste en la calle
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={26}
              color="#ffffff"
            />
          </Pressable>
        </Link>

        <InfoTip
          tone="orange"
          emoji="💡"
          title="¿Sabías que?"
          body="El patrón de la nariz no cambia con el tiempo, a diferencia del pelaje o la edad. Es como una huella digital única para cada perro."
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
  identifyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  findCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.accentPurple,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.15,
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
});

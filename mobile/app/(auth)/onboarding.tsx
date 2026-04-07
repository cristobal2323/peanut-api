import React, { useState } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { colors, fonts, spacing, radii } from "../../src/theme";
import { OnboardingDots } from "../../src/components/OnboardingDots";
import { usePreferencesStore } from "../../src/store/preferences";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Slide = {
  emoji: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    emoji: "🐾",
    icon: "paw",
    title: "Identifica con la huella nasal",
    subtitle:
      "La nariz de cada perro es única, como una huella digital. Usa Peanut para registrarla y proteger a tu mejor amigo.",
  },
  {
    emoji: "🔍",
    icon: "magnify",
    title: "Encuentra perros perdidos",
    subtitle:
      "Si encuentras un perro perdido, escanea su trufa y descubre al instante si está registrado en Peanut.",
  },
  {
    emoji: "❤️",
    icon: "account-group",
    title: "Una comunidad que ayuda",
    subtitle:
      "Únete a miles de personas que reportan, comparten y reúnen perros con sus familias todos los días.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setOnboardingDone = usePreferencesStore((s) => s.setOnboardingDone);
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  const finish = () => {
    setOnboardingDone(true);
    router.replace("/(auth)/login");
  };

  const next = () => {
    if (isLast) finish();
    else setStep((s) => s + 1);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.primary, "rgba(245,158,66,0.95)"]}
        style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
      >
        <View style={styles.topRow}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>Peanut</Text>
          </View>
          {!isLast && (
            <Pressable onPress={finish} hitSlop={10}>
              <Text style={styles.skip}>Saltar</Text>
            </Pressable>
          )}
        </View>

        <Animated.View
          key={`hero-${step}`}
          entering={FadeInRight.duration(350)}
          exiting={FadeOutLeft.duration(200)}
          style={styles.heroIconWrap}
        >
          <View style={styles.heroIconCircle}>
            <Text style={styles.heroEmoji}>{slide.emoji}</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Animated.View
          key={`text-${step}`}
          entering={FadeInRight.duration(350).delay(80)}
          exiting={FadeOutLeft.duration(200)}
          style={styles.textWrap}
        >
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </Animated.View>

        <View style={styles.footer}>
          <OnboardingDots total={SLIDES.length} active={step} />
          <Pressable onPress={next} style={styles.cta}>
            <Text style={styles.ctaText}>
              {isLast ? "Comenzar" : "Continuar"}
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#ffffff"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingHorizontal: spacing.lg + 4,
    paddingBottom: spacing.xl + spacing.md,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    minHeight: 360,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: "#ffffff",
  },
  skip: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
  },
  heroIconWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  heroIconCircle: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: {
    fontSize: 80,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg + 4,
    paddingTop: spacing.xl,
    justifyContent: "space-between",
  },
  textWrap: {
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.onSurface,
    textAlign: "center",
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  footer: {
    gap: spacing.lg,
    alignItems: "center",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignSelf: "stretch",
  },
  ctaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: "#ffffff",
  },
});

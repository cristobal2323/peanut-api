import React, { useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SectionCard } from "../../src/components/SectionCard";
import { IconCircle } from "../../src/components/IconCircle";
import { colors, fonts, spacing, radii } from "../../src/theme";

export default function ConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    checkOpacity.value = withTiming(1, { duration: 300 });
    checkScale.value = withSpring(1, { damping: 8, stiffness: 100 });
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["rgba(16,185,129,0.12)", colors.background, colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>
        {/* Big check circle */}
        <Animated.View style={[styles.checkWrap, checkStyle]}>
          <View style={styles.checkCircle}>
            <MaterialCommunityIcons name="check" size={72} color="#ffffff" />
          </View>
        </Animated.View>

        <Text style={styles.title}>¡Trufa registrada!</Text>
        <Text style={styles.subtitle}>
          La huella biométrica de tu perro está protegida y lista para usarse.
        </Text>

        <View style={styles.cards}>
          <SectionCard>
            <Row icon="shield-check-outline" color={colors.tertiary} title="Seguridad biométrica activa">
              Tu perro ahora tiene un identificador único e irrepetible.
            </Row>
          </SectionCard>

          <SectionCard>
            <Row icon="map-marker-outline" color={colors.secondary} title="Comunidad alerta">
              Si lo encuentran, podrán identificarlo en segundos con Peanut.
            </Row>
          </SectionCard>
        </View>
      </View>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <Pressable
          style={styles.btnPrimary}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.btnPrimaryText}>Ir al inicio</Text>
        </Pressable>
        <Pressable
          style={styles.btnGhost}
          onPress={() => router.replace("/dog/new")}
        >
          <Text style={styles.btnGhostText}>Registrar otro perro</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({
  icon,
  color,
  title,
  children,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  title: string;
  children: string;
}) {
  return (
    <View style={rowStyles.row}>
      <IconCircle icon={icon} color={color} size={44} />
      <View style={{ flex: 1 }}>
        <Text style={rowStyles.title}>{title}</Text>
        <Text style={rowStyles.body}>{children}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  checkWrap: {
    marginBottom: spacing.xl,
  },
  checkCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.tertiary,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  cards: {
    gap: spacing.md,
    width: "100%",
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm + 2,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: "center",
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: "#ffffff",
  },
  btnGhost: {
    paddingVertical: 14,
    alignItems: "center",
  },
  btnGhostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },
});

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../../../src/components/ScreenHeader";
import { colors, fonts, spacing, radii } from "../../../src/theme";

export default function NoMatchScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Sin resultado" />

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="magnify-close"
            size={56}
            color={colors.textMuted}
          />
        </View>
        <Text style={styles.title}>No encontramos coincidencias</Text>
        <Text style={styles.subtitle}>
          Este perro no parece estar registrado en Trufa ID
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.btnPrimary}
          onPress={() => router.replace("/found-dog")}
        >
          <MaterialCommunityIcons name="paw" size={18} color="#ffffff" />
          <Text style={styles.btnPrimaryText}>Reportar como encontrado</Text>
        </Pressable>

        <Pressable
          style={styles.btnOutline}
          onPress={() => router.replace("/scan/identify")}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.btnOutlineText}>Volver a intentar</Text>
        </Pressable>

        <Pressable
          style={styles.btnGhost}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.btnGhostText}>Ir al inicio</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.onSurface,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
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
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnOutlineText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.primary,
  },
  btnGhost: {
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: "center",
  },
  btnGhostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
});

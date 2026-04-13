import React from "react";
import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { IconCircle } from "../../src/components/IconCircle";
import { InfoTip } from "../../src/components/InfoTip";
import { colors, fonts, spacing, radii } from "../../src/theme";

export default function IdentifyScreen() {
  const router = useRouter();

  const pickImageAndSearch = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: "/scan/match/results",
        params: { imageUri: result.assets[0].uri },
      });
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Identificar perro" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>
          Elige cómo quieres identificar al perro
        </Text>

        {/* Option 1: Nose scan */}
        <Link href="/scan/nose?fromIdentify=true" asChild>
          <Pressable style={styles.optionCard}>
            <View style={styles.optionHeader}>
              <IconCircle icon="line-scan" color={colors.primary} size={48} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Escanear trufa</Text>
                <Text style={styles.optionSub}>
                  Captura la nariz del perro con la cámara
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.textMuted}
              />
            </View>
            <View style={styles.tipInline}>
              <MaterialCommunityIcons
                name="shield-check"
                size={16}
                color={colors.tertiary}
              />
              <Text style={styles.tipInlineText}>
                Mayor precisión. Si el perro está registrado, lo identificaremos
                al instante.
              </Text>
            </View>
          </Pressable>
        </Link>

        {/* Option 2: Gallery upload */}
        <Pressable style={styles.optionCard} onPress={pickImageAndSearch}>
          <View style={styles.optionHeader}>
            <IconCircle
              icon="image-outline"
              color={colors.secondary}
              size={48}
            />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Subir imagen</Text>
              <Text style={styles.optionSub}>
                Selecciona una foto de tu galería
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textMuted}
            />
          </View>
          <View style={styles.tipInline}>
            <MaterialCommunityIcons
              name="image-search"
              size={16}
              color={colors.secondary}
            />
            <Text style={styles.tipInlineText}>
              Buscaremos perros similares por apariencia.
            </Text>
          </View>
        </Pressable>

        <InfoTip
          tone="orange"
          emoji="💡"
          title="¿Cuál elegir?"
          body="La identificación por trufa es más precisa que por imagen, pero ambos métodos pueden ayudar a encontrar al dueño."
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  instruction: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textSecondary,
  },
  optionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  optionText: { flex: 1 },
  optionTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.onSurface,
  },
  optionSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  tipInline: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.sm,
    padding: spacing.sm + 2,
  },
  tipInlineText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});

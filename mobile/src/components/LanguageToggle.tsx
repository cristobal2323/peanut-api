import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, fonts, radii } from "../theme";
import { usePreferencesStore } from "../store/preferences";
import { useTranslation } from "../i18n";

type Props = {
  style?: any;
};

export const LanguageToggle: React.FC<Props> = ({ style }) => {
  const { locale } = useTranslation();
  const toggleLocale = usePreferencesStore((state) => state.toggleLocale);

  return (
    <Pressable onPress={toggleLocale} style={[styles.container, style]}>
      <View style={[styles.pill, locale === "es" && styles.active]}>
        <Text style={[styles.text, locale === "es" && styles.activeText]}>ES</Text>
      </View>
      <View style={[styles.pill, locale === "en" && styles.active]}>
        <Text style={[styles.text, locale === "en" && styles.activeText]}>EN</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.full,
    alignSelf: "flex-end",
    gap: 4,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  active: {
    backgroundColor: colors.primary,
  },
  text: {
    fontWeight: "700",
    fontFamily: fonts.bodySemiBold,
    color: colors.textSecondary,
    fontSize: 12,
  },
  activeText: {
    color: colors.onPrimary,
  },
});

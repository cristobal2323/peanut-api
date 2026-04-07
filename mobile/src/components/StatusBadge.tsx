import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { colors, fonts } from "../theme";

export type StatusVariant = "safe" | "lost" | "found" | "match";
export type StatusSize = "sm" | "md" | "lg";

type Props = {
  variant: StatusVariant;
  size?: StatusSize;
  label?: string;
  style?: ViewStyle;
};

const VARIANT_STYLES: Record<
  StatusVariant,
  { bg: string; fg: string; defaultLabel: string }
> = {
  safe: { bg: colors.tertiary, fg: "#ffffff", defaultLabel: "Seguro" },
  lost: { bg: colors.error, fg: "#ffffff", defaultLabel: "Perdido" },
  found: { bg: colors.secondary, fg: "#ffffff", defaultLabel: "Encontrado" },
  match: { bg: colors.accentPurple, fg: "#ffffff", defaultLabel: "Coincidencia" },
};

const SIZE_STYLES: Record<StatusSize, { paddingV: number; paddingH: number; fontSize: number }> = {
  sm: { paddingV: 3, paddingH: 8, fontSize: 11 },
  md: { paddingV: 4, paddingH: 10, fontSize: 12 },
  lg: { paddingV: 6, paddingH: 14, fontSize: 13 },
};

export function StatusBadge({ variant, size = "md", label, style }: Props) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          paddingVertical: s.paddingV,
          paddingHorizontal: s.paddingH,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: v.fg, fontSize: s.fontSize }]}>
        {label ?? v.defaultLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: fonts.bodySemiBold,
  },
});

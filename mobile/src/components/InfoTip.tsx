import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { colors, fonts, spacing, radii } from "../theme";

export type InfoTipTone = "orange" | "blue" | "red" | "green" | "purple";

type Props = {
  tone?: InfoTipTone;
  emoji?: string;
  title?: string;
  children?: ReactNode;
  body?: string;
  style?: ViewStyle;
};

const TONES: Record<InfoTipTone, { bg: string; border: string; fg: string }> = {
  orange: {
    bg: colors.primaryContainer,
    border: "rgba(245,158,66,0.20)",
    fg: colors.onPrimaryContainer,
  },
  blue: {
    bg: colors.secondaryContainer,
    border: "rgba(59,130,246,0.20)",
    fg: colors.onSecondaryContainer,
  },
  red: {
    bg: colors.errorContainer,
    border: "rgba(239,68,68,0.20)",
    fg: colors.onErrorContainer,
  },
  green: {
    bg: colors.tertiaryContainer,
    border: "rgba(16,185,129,0.20)",
    fg: colors.onTertiaryContainer,
  },
  purple: {
    bg: colors.accentPurpleContainer,
    border: "rgba(139,92,246,0.20)",
    fg: "#5B21B6",
  },
};

export function InfoTip({
  tone = "orange",
  emoji,
  title,
  body,
  children,
  style,
}: Props) {
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.tip,
        { backgroundColor: t.bg, borderColor: t.border },
        style,
      ]}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <View style={styles.content}>
        {title && <Text style={[styles.title, { color: t.fg }]}>{title}</Text>}
        {body && <Text style={[styles.body, { color: t.fg }]}>{body}</Text>}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tip: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});

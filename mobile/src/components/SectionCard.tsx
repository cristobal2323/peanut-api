import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { colors, fonts, spacing, radii, cardShadow } from "../theme";

type Props = {
  children: ReactNode;
  title?: string;
  rightLabel?: string;
  onRightPress?: () => void;
  style?: ViewStyle;
  padding?: number;
};

export function SectionCard({
  children,
  title,
  rightLabel,
  onRightPress,
  style,
  padding = spacing.lg,
}: Props) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {rightLabel && (
            <Pressable onPress={onRightPress}>
              <Text style={styles.rightLabel}>{rightLabel}</Text>
            </Pressable>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    ...cardShadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.onSurface,
  },
  rightLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
  },
});

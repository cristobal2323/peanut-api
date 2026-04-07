import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, spacing, radii } from "../theme";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  height?: number;
  style?: ViewStyle;
};

export function GradientHeader({ title, subtitle, right, height, style }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[colors.primary, "rgba(245,158,66,0.9)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradient,
        {
          paddingTop: insets.top + spacing.lg,
          minHeight: height,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {right && <View style={styles.right}>{right}</View>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: spacing.lg + 4,
    paddingBottom: spacing.xl + 12,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 20,
  },
  right: {
    marginLeft: spacing.md,
  },
});

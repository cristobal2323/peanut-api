import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { colors, fonts, spacing } from "../theme";

type Props = {
  value: number; // 0..100
  showScore?: boolean;
  height?: number;
};

/**
 * Returns the color band for a confidence percentage:
 * ≥80 green, ≥60 orange, <60 red.
 */
export function getConfidenceColor(value: number): string {
  if (value >= 80) return colors.tertiary;
  if (value >= 60) return colors.primary;
  return colors.error;
}

export function ConfidenceBar({ value, showScore = true, height = 12 }: Props) {
  const progress = useSharedValue(0);
  const color = getConfidenceColor(value);

  useEffect(() => {
    progress.value = withDelay(100, withTiming(value, { duration: 800 }));
  }, [value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
    backgroundColor: color,
  }));

  return (
    <View style={styles.wrap}>
      {showScore && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Confianza</Text>
          <Text style={[styles.scoreValue, { color }]}>{value}%</Text>
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[styles.fill, fillStyle, { borderRadius: height / 2 }]}
        />
      </View>
    </View>
  );
}

/** Circular score display (used in MatchResult). */
export function ScoreCircle({ value, size = 80 }: { value: number; size?: number }) {
  const color = getConfidenceColor(value);
  return (
    <View
      style={[
        circleStyles.outer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
      ]}
    >
      <Text style={[circleStyles.value, { color, fontSize: size * 0.32 }]}>
        {value}
      </Text>
      <Text style={[circleStyles.percent, { color }]}>%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  scoreValue: {
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  track: {
    backgroundColor: colors.surfaceContainer,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});

const circleStyles = StyleSheet.create({
  outer: {
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: fonts.heading,
    lineHeight: undefined,
  },
  percent: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    marginTop: -2,
  },
});

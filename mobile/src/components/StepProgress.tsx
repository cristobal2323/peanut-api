import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { colors, fonts, spacing } from "../theme";

type Props = {
  variant?: "bar" | "stepped";
  current: number;
  total: number;
  labels?: string[];
};

export function StepProgress({ variant = "bar", current, total, labels }: Props) {
  if (variant === "stepped") {
    return (
      <View style={styles.steppedWrap}>
        <View style={styles.steppedRow}>
          {Array.from({ length: total }).map((_, i) => {
            const filled = i < current;
            return (
              <View
                key={i}
                style={[
                  styles.steppedBar,
                  filled ? styles.steppedBarActive : styles.steppedBarIdle,
                ]}
              />
            );
          })}
        </View>
        {labels && labels.length === total && (
          <View style={styles.labelsRow}>
            {labels.map((l, i) => {
              const active = i < current;
              return (
                <Text
                  key={i}
                  style={[
                    styles.label,
                    { color: active ? colors.primary : colors.textMuted },
                  ]}
                >
                  {l}
                </Text>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  // bar variant
  const pct = Math.min(100, Math.max(0, (current / total) * 100));
  return <BarProgress pct={pct} />;
}

function BarProgress({ pct }: { pct: number }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${pct}%`, { duration: 300 }),
  }));

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Bar variant
  barTrack: {
    height: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  // Stepped variant
  steppedWrap: {
    gap: 8,
  },
  steppedRow: {
    flexDirection: "row",
    gap: 6,
  },
  steppedBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  steppedBarActive: {
    backgroundColor: colors.primary,
  },
  steppedBarIdle: {
    backgroundColor: colors.surfaceContainer,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    flex: 1,
    textAlign: "center",
  },
});

import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme";

type Props = {
  total: number;
  active: number;
};

export function OnboardingDots({ total, active }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === active;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              isActive && styles.dotActive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineVariant,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
});

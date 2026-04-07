import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme";

type Props = {
  size?: number;
  color?: string;
};

/**
 * Dashed circle guide + corner brackets used by ScanNose and FoundDog step 2.
 * Centered in its parent.
 */
export function CameraGuideOverlay({ size = 240, color = colors.primary }: Props) {
  return (
    <View
      style={[
        styles.container,
        { width: size + 40, height: size + 40 },
      ]}
      pointerEvents="none"
    >
      {/* Dashed circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
          },
        ]}
      />
      {/* Corner brackets */}
      <View style={[styles.corner, styles.cornerTL, { borderColor: color }]} />
      <View style={[styles.corner, styles.cornerTR, { borderColor: color }]} />
      <View style={[styles.corner, styles.cornerBL, { borderColor: color }]} />
      <View style={[styles.corner, styles.cornerBR, { borderColor: color }]} />
    </View>
  );
}

const BRACKET = 28;
const BRACKET_THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circle: {
    borderWidth: 3,
    borderStyle: "dashed",
  },
  corner: {
    position: "absolute",
    width: BRACKET,
    height: BRACKET,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderBottomRightRadius: 8,
  },
});

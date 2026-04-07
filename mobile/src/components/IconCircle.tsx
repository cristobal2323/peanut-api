import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  size?: number;
  background?: string;
  style?: ViewStyle;
};

/**
 * Colored circle with an icon centered.
 * Background defaults to color@10% opacity (hex with alpha).
 */
export function IconCircle({ icon, color, size = 40, background, style }: Props) {
  const bg = background ?? hexToRgba(color, 0.1);
  const iconSize = Math.round(size * 0.5);
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={color} />
    </View>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  // Accept #RGB / #RRGGBB / rgba(...)
  if (hex.startsWith("rgba")) return hex;
  if (hex.startsWith("rgb(")) {
    return hex.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});

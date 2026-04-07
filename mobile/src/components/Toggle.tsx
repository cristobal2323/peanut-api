import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { colors } from "../theme";

type Props = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
};

export function Toggle({ value, onValueChange, disabled }: Props) {
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      interpolateColor(
        value ? 1 : 0,
        [0, 1],
        [colors.surfaceContainerHigh, colors.primary]
      ) as string,
      { duration: 200 }
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(value ? 22 : 2, { duration: 200 }) }],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <Animated.View
        style={[styles.track, trackStyle, disabled && styles.disabled]}
      >
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

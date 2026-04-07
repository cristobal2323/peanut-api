import React, { ReactNode } from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, spacing } from "../theme";

type Variant = "default" | "overlay";

type Props = {
  title?: string;
  variant?: Variant;
  right?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  style?: ViewStyle;
};

export function ScreenHeader({
  title,
  variant = "default",
  right,
  onBack,
  showBack = true,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isOverlay = variant === "overlay";

  const back = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View
      style={[
        styles.header,
        isOverlay ? styles.overlayHeader : styles.defaultHeader,
        { paddingTop: insets.top + spacing.sm },
        style,
      ]}
    >
      <View style={styles.leftSlot}>
        {showBack && (
          <Pressable
            style={[styles.iconButton, isOverlay && styles.iconButtonOverlay]}
            onPress={back}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={26}
              color={isOverlay ? "#ffffff" : colors.onSurface}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.titleSlot}>
        {title && (
          <Text
            style={[
              styles.title,
              { color: isOverlay ? "#ffffff" : colors.onSurface },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
      </View>

      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: 56,
  },
  defaultHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  overlayHeader: {
    backgroundColor: "transparent",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  leftSlot: {
    width: 48,
    alignItems: "flex-start",
  },
  titleSlot: {
    flex: 1,
    alignItems: "center",
  },
  rightSlot: {
    width: 48,
    alignItems: "flex-end",
  },
  title: {
    fontFamily: fonts.headingMedium,
    fontSize: 17,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});

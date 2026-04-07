import React, { ReactNode } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, spacing } from "../theme";
import { IconCircle } from "./IconCircle";

type Props = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  label: string;
  sublabel?: string;
  rightLabel?: string;
  rightLabelColor?: string;
  accessory?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  divider?: boolean;
  destructive?: boolean;
};

export function SettingsRow({
  icon,
  iconColor,
  label,
  sublabel,
  rightLabel,
  rightLabelColor,
  accessory,
  onPress,
  showChevron = true,
  divider = true,
  destructive = false,
}: Props) {
  const labelColor = destructive ? colors.error : colors.onSurface;
  const Wrapper: any = onPress ? Pressable : View;

  return (
    <Wrapper onPress={onPress} style={[styles.row, divider && styles.divider]}>
      {icon && (
        <IconCircle
          icon={icon}
          color={iconColor ?? (destructive ? colors.error : colors.primary)}
          size={36}
        />
      )}
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
      {rightLabel && (
        <Text
          style={[
            styles.rightLabel,
            { color: rightLabelColor ?? colors.tertiary },
          ]}
        >
          {rightLabel}
        </Text>
      )}
      {accessory}
      {!accessory && onPress && showChevron && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.textMuted}
        />
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
  },
  sublabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  rightLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
});

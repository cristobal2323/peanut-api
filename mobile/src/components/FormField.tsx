import React, { ReactNode, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TextInputProps,
  Pressable,
  ViewStyle,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, spacing, radii } from "../theme";

type Props = TextInputProps & {
  label?: string;
  required?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightAccessory?: ReactNode;
  error?: string;
  helper?: string;
  multiline?: boolean;
  containerStyle?: ViewStyle;
  onIconPress?: () => void;
};

export function FormField({
  label,
  required,
  icon,
  rightAccessory,
  error,
  helper,
  multiline,
  containerStyle,
  onIconPress,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputBox,
          multiline && styles.inputBoxMultiline,
          focused && styles.inputBoxFocused,
          !!error && styles.inputBoxError,
        ]}
      >
        {icon && (
          <Pressable onPress={onIconPress} disabled={!onIconPress}>
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={focused ? colors.primary : colors.textMuted}
            />
          </Pressable>
        )}
        <TextInput
          {...inputProps}
          multiline={multiline}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputProps.style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
        {rightAccessory}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {!error && helper && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs + 2,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  required: {
    color: colors.error,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputBoxMultiline: {
    height: undefined,
    minHeight: 100,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    alignItems: "flex-start",
  },
  inputBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: "#ffffff",
  },
  inputBoxError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
  },
  helper: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});

import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { colors, radii, fonts } from "../theme";

type Variant = "primary" | "secondary" | "danger";

type Props = React.ComponentProps<typeof Button> & {
  variant?: Variant;
  gradient?: boolean;
};

export const PrimaryButton = forwardRef<React.ComponentRef<typeof Button>, Props>(
  (
    { variant = "primary", gradient = true, mode = "contained", disabled, loading, style, children, ...rest },
    ref
  ) => {
    const bgColor =
      variant === "secondary"
        ? colors.secondaryContainer
        : variant === "danger"
          ? colors.error
          : colors.primary;

    const textColor =
      variant === "secondary"
        ? colors.onSecondaryContainer
        : colors.onPrimary;

    return (
      <Button
        ref={ref}
        mode={mode}
        disabled={disabled}
        loading={loading}
        style={[styles.button, { backgroundColor: bgColor }, style]}
        textColor={textColor}
        contentStyle={styles.content}
        labelStyle={styles.label}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.full,
  },
  content: {
    paddingVertical: 8,
  },
  label: {
    fontFamily: fonts.headingMedium,
    letterSpacing: 0.2,
  },
});

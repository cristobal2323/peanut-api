import React, { forwardRef } from "react";
import { Button } from "react-native-paper";
import { StyleSheet } from "react-native";
import { PeanutTheme } from "../theme";

type Variant = "primary" | "secondary" | "danger";

type Props = React.ComponentProps<typeof Button> & {
  variant?: Variant;
};

export const PrimaryButton = forwardRef<React.ComponentRef<typeof Button>, Props>(
  (
    { variant = "primary", mode = "contained", disabled, loading, style, children, ...rest },
    ref
  ) => {
    const backgroundColor =
      variant === "secondary"
        ? PeanutTheme.colors.secondary
        : variant === "danger"
          ? PeanutTheme.colors.error
          : PeanutTheme.colors.primary;

    const textColor =
      variant === "secondary"
        ? PeanutTheme.colors.onSecondary
        : PeanutTheme.colors.onPrimary;

    return (
      <Button
        ref={ref}
        mode={mode}
        disabled={disabled}
        loading={loading}
        style={[styles.button, { backgroundColor }, style]}
        textColor={textColor}
        contentStyle={styles.content}
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
    borderRadius: 14
  },
  content: {
    paddingVertical: 8
  }
});

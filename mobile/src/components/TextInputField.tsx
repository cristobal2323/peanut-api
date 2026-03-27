import React from "react";
import { StyleSheet } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import { colors, radii, fonts } from "../theme";

type Props = React.ComponentProps<typeof TextInput> & {
  errorMessage?: string;
  secure?: boolean;
};

export const TextInputField: React.FC<Props> = ({
  label,
  errorMessage,
  secure,
  style,
  ...rest
}) => {
  const hasError = Boolean(errorMessage);
  return (
    <>
      <TextInput
        label={label}
        secureTextEntry={secure}
        mode="flat"
        error={hasError}
        autoCapitalize="none"
        style={[styles.input, style]}
        underlineColor="transparent"
        activeUnderlineColor={colors.primary}
        textColor={colors.onSurface}
        {...rest}
      />
      {hasError && <HelperText type="error">{errorMessage}</HelperText>}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.md,
    marginBottom: 4,
  },
});

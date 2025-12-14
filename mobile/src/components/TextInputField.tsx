import React from "react";
import { HelperText, TextInput } from "react-native-paper";

type Props = React.ComponentProps<typeof TextInput> & {
  errorMessage?: string;
  secure?: boolean;
};

export const TextInputField: React.FC<Props> = ({
  label,
  errorMessage,
  secure,
  ...rest
}) => {
  const hasError = Boolean(errorMessage);
  return (
    <>
      <TextInput
        label={label}
        secureTextEntry={secure}
        mode="outlined"
        error={hasError}
        autoCapitalize="none"
        style={{ marginBottom: 4 }}
        {...rest}
      />
      {hasError && <HelperText type="error">{errorMessage}</HelperText>}
    </>
  );
};

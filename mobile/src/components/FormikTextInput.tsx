import React from "react";
import { useFormikContext } from "formik";
import { TextInputField } from "./TextInputField";

type Props = React.ComponentProps<typeof TextInputField> & {
  name: string;
};

// Generic Formik-aware text field to reduce boilerplate in forms.
export const FormikTextInput: React.FC<Props> = ({ name, ...rest }) => {
  const { values, handleChange, handleBlur, errors, touched } = useFormikContext<
    Record<string, any>
  >();

  const errorMessage =
    touched?.[name] && errors?.[name] ? String(errors[name]) : undefined;

  return (
    <TextInputField
      value={(values as any)?.[name] ?? ""}
      onChangeText={handleChange(name)}
      onBlur={handleBlur(name)}
      errorMessage={errorMessage}
      {...rest}
    />
  );
};

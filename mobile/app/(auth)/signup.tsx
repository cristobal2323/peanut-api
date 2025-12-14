import React from "react";
import { View, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { FormikTextInput } from "../../src/components/FormikTextInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { spacing } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { authApi } from "../../src/api/auth";

export default function SignupScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      phone: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().min(2, "Ingresa tu nombre").required("Requerido"),
      email: Yup.string().email("Correo inválido").required("Requerido"),
      password: Yup.string().min(8, "Mínimo 8 caracteres").required("Requerido"),
      phone: Yup.string()
        .matches(/^\+?\d{7,15}$/, "Incluye código de país, solo dígitos")
        .required("Requerido")
    }),
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(null);
      try {
        // Enviamos teléfono completo (incluye código de país).
        await authApi.signup({
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone
        });
        const data = await authApi.login({
          email: values.email,
          password: values.password
        });
        login(data.user, data.token);
        router.replace("/(tabs)");
      } catch (err: any) {
        setStatus(err?.message || "No pudimos crear tu cuenta");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <FormikProvider value={formik}>
      <View style={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          Crea tu cuenta
        </Text>
        <FormikTextInput name="name" label="Nombre" />
        <FormikTextInput
          name="email"
          label="Email"
          keyboardType="email-address"
        />
        <FormikTextInput name="password" label="Contraseña" secure />
        <FormikTextInput
          name="phone"
          label="Teléfono (incluye código de país)"
          keyboardType="phone-pad"
        />
        {formik.status && (
          <Text style={styles.error} variant="bodyMedium">
            {formik.status}
          </Text>
        )}
        <PrimaryButton
          onPress={() => formik.handleSubmit()}
          loading={formik.isSubmitting}
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Crear cuenta
        </PrimaryButton>
        <Link href="/(auth)/login" style={styles.link}>
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </View>
    </FormikProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing.md
  },
  title: {
    marginBottom: spacing.md
  },
  link: {
    marginTop: spacing.md,
    textAlign: "center"
  },
  error: {
    color: "red",
    marginTop: spacing.xs
  }
});

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { useMutation } from "@tanstack/react-query";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { FormikTextInput } from "../../src/components/FormikTextInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { spacing } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { authApi } from "../../src/api/auth";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [recovering, setRecovering] = useState(false);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user, data.token);
      router.replace("/(tabs)");
    },
    onError: () => {},
  });

  const schema = Yup.object({
    email: Yup.string().email("Correo inválido").required("Requerido"),
    password: Yup.string().required("Contraseña requerida"),
  });

  const formik = useFormik({
    initialValues: { email: "cri.maturana@gmail.com", password: "8194c0c0" },
    validationSchema: schema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(null);
      try {
        const data = await mutation.mutateAsync(values);
        login(data.user, data.token);
        router.replace("/(tabs)");
      } catch (err: any) {
        setStatus(err?.message || "Error de autenticación");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <FormikProvider value={formik}>
      <View style={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          Bienvenido a Peanut
        </Text>
        <FormikTextInput
          name="email"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormikTextInput name="password" label="Contraseña" secure />
        {formik.status && (
          <Text style={styles.error} variant="bodyMedium">
            {formik.status}
          </Text>
        )}
        <PrimaryButton
          onPress={() => formik.handleSubmit()}
          loading={formik.isSubmitting}
          disabled={!formik.isValid || formik.isSubmitting || recovering}
        >
          Iniciar sesión
        </PrimaryButton>
        <PrimaryButton
          mode="outlined"
          onPress={() => {
            if (!formik.values.email) {
              formik.setStatus("Ingresa tu correo para recuperar");
              return;
            }
            formik.setStatus(null);
            setRecovering(true);
            authApi
              .recoverPassword(formik.values.email)
              .then(() => formik.setStatus("Te enviamos un correo con los pasos"))
              .catch((err) =>
                formik.setStatus(err?.message || "No pudimos enviar el correo")
              )
              .finally(() => setRecovering(false));
          }}
          loading={recovering}
          disabled={formik.isSubmitting || recovering}
        >
          Recuperar contraseña
        </PrimaryButton>
        <Link href="/(auth)/signup" style={styles.link}>
          ¿No tienes cuenta? Crear una
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
    gap: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: "left",
  },
  error: {
    color: "red",
    marginBottom: spacing.sm,
  },
  link: {
    marginTop: spacing.md,
    textAlign: "center",
  },
});

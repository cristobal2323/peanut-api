import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { FormikTextInput } from "../../src/components/FormikTextInput";
import { spacing, colors, radii, fonts } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { Dog } from "../../src/types";

const defaultForm = {
  name: "",
  breed: "",
  age: "",
  sex: "male",
  color: "",
  size: "medium",
  microchip: "",
  photo: "",
  nosePhoto: "",
};

export default function NewDogScreen() {
  const router = useRouter();
  return (
    <Formik
      initialValues={defaultForm}
      validationSchema={Yup.object({
        name: Yup.string().required("Requerido"),
        breed: Yup.string().required("Requerido"),
        age: Yup.string().optional(),
        sex: Yup.string().oneOf(["male", "female"], "male/female").required("Requerido"),
        color: Yup.string().required("Requerido"),
        size: Yup.string().oneOf(["small", "medium", "large"], "small/medium/large"),
        microchip: Yup.string().optional(),
        photo: Yup.string().optional(),
        nosePhoto: Yup.string().optional(),
      })}
      onSubmit={async (values, { setStatus, setSubmitting }) => {
        setStatus(null);
        const payload: Dog = {
          id: "",
          name: values.name,
          breed: values.breed,
          age: values.age ? Number(values.age) : undefined,
          sex: values.sex as Dog["sex"],
          color: values.color,
          size: values.size as Dog["size"],
          microchip: values.microchip,
          photo: values.photo,
          nosePhoto: values.nosePhoto,
          status: "normal",
        };
        try {
          await api.saveDog(payload);
          router.back();
        } catch (err: any) {
          setStatus(err?.message || "No pudimos guardar el perro");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ handleSubmit, isSubmitting, isValid, setFieldValue, status }) => (
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="headlineSmall" style={styles.title}>
            Nuevo perfil de perro
          </Text>
          <Text style={styles.subtitle}>Paso 1 de 3 — Cuentanos sobre tu mejor amigo</Text>

          <FormikTextInput name="name" label="Nombre" />
          <FormikTextInput name="breed" label="Raza / Mestizo" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormikTextInput name="age" label="Edad" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <FormikTextInput name="sex" label="Sexo (male/female)" autoCapitalize="none" />
            </View>
          </View>
          <FormikTextInput name="color" label="Color" />
          <FormikTextInput name="size" label="Tamano (small/medium/large)" autoCapitalize="none" />
          <FormikTextInput name="microchip" label="Microchip (opcional)" />

          <PrimaryButton
            mode="outlined"
            gradient={false}
            icon="camera"
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
              });
              if (!result.canceled) {
                setFieldValue("photo", result.assets[0].uri);
              }
            }}
          >
            Subir foto de perfil
          </PrimaryButton>
          <PrimaryButton
            mode="outlined"
            gradient={false}
            icon="fingerprint"
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
              });
              if (!result.canceled) {
                setFieldValue("nosePhoto", result.assets[0].uri);
              }
            }}
          >
            Subir foto de nariz (opcional)
          </PrimaryButton>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="shield-lock" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ color: colors.onSurface }}>Seguridad Biometrica</Text>
              <Text style={styles.infoText}>La nariz de tu perro es unica. Escanearla en el siguiente paso.</Text>
            </View>
          </View>

          {status && (
            <Text style={styles.error} variant="bodyMedium">
              {status}
            </Text>
          )}
          <PrimaryButton
            onPress={() => handleSubmit()}
            loading={isSubmitting}
            disabled={!isValid}
            icon="arrow-right"
          >
            Continuar al escaneo de trufa
          </PrimaryButton>
        </ScrollView>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    marginBottom: spacing.xs,
    color: colors.onSurface,
    fontFamily: fonts.heading,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    backgroundColor: colors.primaryFixed,
    padding: spacing.lg,
    borderRadius: radii.xl,
  },
  infoText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  error: {
    color: colors.error,
    marginTop: spacing.xs,
  },
});

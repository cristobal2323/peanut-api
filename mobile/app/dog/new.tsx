import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { FormikTextInput } from "../../src/components/FormikTextInput";
import { spacing } from "../../src/theme";
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
  nosePhoto: ""
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
        nosePhoto: Yup.string().optional()
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
          status: "normal"
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
            Registrar perro
          </Text>
          <FormikTextInput name="name" label="Nombre" />
          <FormikTextInput name="breed" label="Raza / Mestizo" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormikTextInput
                name="age"
                label="Edad"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormikTextInput
                name="sex"
                label="Sexo (male/female)"
                autoCapitalize="none"
              />
            </View>
          </View>
          <FormikTextInput name="color" label="Color" />
          <FormikTextInput
            name="size"
            label="Tamaño (small/medium/large)"
            autoCapitalize="none"
          />
          <FormikTextInput
            name="microchip"
            label="Microchip (opcional)"
          />
          <PrimaryButton
            mode="outlined"
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8
              });
              if (!result.canceled) {
                setFieldValue("photo", result.assets[0].uri);
              }
            }}
          >
            Subir foto
          </PrimaryButton>
          <PrimaryButton
            mode="outlined"
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8
              });
              if (!result.canceled) {
                setFieldValue("nosePhoto", result.assets[0].uri);
              }
            }}
          >
            Subir foto de nariz (opcional)
          </PrimaryButton>
          {status && (
            <Text style={styles.error} variant="bodyMedium">
              {status}
            </Text>
          )}
          <PrimaryButton
            onPress={() => handleSubmit()}
            loading={isSubmitting}
            disabled={!isValid}
          >
            Guardar
          </PrimaryButton>
        </ScrollView>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.md
  },
  title: {
    marginBottom: spacing.sm
  },
  row: {
    flexDirection: "row",
    gap: spacing.md
  },
  error: {
    color: "red",
    marginTop: spacing.xs
  }
});

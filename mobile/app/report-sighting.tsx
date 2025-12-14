import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import * as Yup from "yup";
import { Text } from "react-native-paper";
import { FormikTextInput } from "../src/components/FormikTextInput";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { spacing } from "../src/theme";
import { api } from "../src/api/mockApi";

export default function ReportSightingScreen() {
  const router = useRouter();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
      }
    })();
  }, []);

  const mutation = useMutation({
    mutationFn: api.submitSighting,
    onSuccess: () => router.back()
  });

  return (
    <Formik
      initialValues={{ comment: "", image: "" }}
      validationSchema={Yup.object({
        comment: Yup.string().min(4, "Comparte más detalles").required("Requerido"),
        image: Yup.string().optional()
      })}
      onSubmit={(values, { setStatus }) => {
        setStatus(null);
        if (!coords) {
          setStatus("Activa la ubicación para enviar el reporte");
          return;
        }
        mutation.mutate({
          id: "",
          dogId: "",
          comment: values.comment,
          image: values.image,
          seenAt: new Date().toISOString(),
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude
          }
        }, {
          onError: (err: any) =>
            setStatus(err?.message || "No pudimos enviar el reporte")
        });
      }}
    >
      {({ handleSubmit, isSubmitting, isValid, setFieldValue, status }) => (
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="headlineSmall" style={styles.title}>
            Reportar avistamiento
          </Text>
          <PrimaryButton
            mode="outlined"
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images
              });
              if (!result.canceled) {
                setFieldValue("image", result.assets[0].uri);
              }
            }}
          >
            Subir foto (opcional)
          </PrimaryButton>
          <FormikTextInput name="comment" label="Comentario" multiline />
          {status && (
            <Text style={styles.error} variant="bodyMedium">
              {status}
            </Text>
          )}
          <PrimaryButton
            onPress={() => handleSubmit()}
            loading={isSubmitting || mutation.isPending}
            disabled={!isValid}
          >
            Enviar
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
  error: {
    color: "red"
  }
});

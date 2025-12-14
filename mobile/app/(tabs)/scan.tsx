import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { CardContainer } from "../../src/components/CardContainer";
import { spacing, PeanutTheme } from "../../src/theme";
import { EmptyState } from "../../src/components/EmptyState";

type ScanResult = "match" | "possible" | "none" | null;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const startScan = (mode: "nose" | "appearance") => {
    if (!permission?.granted) {
      requestPermission();
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setResult(mode === "nose" ? "match" : "possible");
    }, 1200);
  };

  const pickImage = async () => {
    const resultPicker = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    });
    if (!resultPicker.canceled) {
      setPreview(resultPicker.assets[0].uri);
      setResult("possible");
    }
  };

  const renderResult = () => {
    if (processing) {
      return <Text style={styles.processing}>Analizando con IA…</Text>;
    }
    if (result === "match") {
      return <Text style={styles.match}>¡Coincidencia encontrada!</Text>;
    }
    if (result === "possible") {
      return (
        <View style={styles.possible}>
          <Text variant="titleMedium">Posibles coincidencias</Text>
          <Text variant="bodyMedium" style={{ color: PeanutTheme.colors.tertiary }}>
            Luna · Border Collie
          </Text>
          <Text variant="bodyMedium" style={{ color: PeanutTheme.colors.tertiary }}>
            Max · Pastor Alemán
          </Text>
        </View>
      );
    }
    if (result === "none") {
      return <EmptyState icon="magnify-close" message="No encontramos coincidencias" />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Escanear perro
      </Text>
      <CardContainer>
        <View style={styles.cameraBox}>
          {preview ? (
            <Image source={{ uri: preview }} style={styles.preview} />
          ) : (
            <CameraView
              style={styles.camera}
              facing="back"
              autofocus="on"
              {...(permission?.granted ? {} : { onCameraReady: requestPermission })}
            />
          )}
        </View>
        <View style={styles.actions}>
          <PrimaryButton onPress={() => startScan("nose")} loading={processing}>
            Escanear nariz
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            onPress={() => startScan("appearance")}
            loading={processing}
          >
            Escanear apariencia
          </PrimaryButton>
          <PrimaryButton mode="outlined" onPress={pickImage}>
            Subir foto de galería
          </PrimaryButton>
          {renderResult()}
        </View>
      </CardContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl
  },
  title: {
    marginBottom: spacing.md
  },
  cameraBox: {
    height: 260,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: PeanutTheme.colors.surfaceVariant
  },
  camera: {
    flex: 1
  },
  preview: {
    width: "100%",
    height: "100%"
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md
  },
  processing: {
    textAlign: "center",
    color: PeanutTheme.colors.tertiary
  },
  match: {
    textAlign: "center",
    fontWeight: "600",
    color: PeanutTheme.colors.secondary
  },
  possible: {
    gap: spacing.xs
  }
});

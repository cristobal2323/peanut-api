import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { CardContainer } from "../../src/components/CardContainer";
import { spacing, colors, radii, fonts } from "../../src/theme";
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!resultPicker.canceled) {
      setPreview(resultPicker.assets[0].uri);
      setResult("possible");
    }
  };

  const renderResult = () => {
    if (processing) {
      return (
        <View style={styles.statusRow}>
          <MaterialCommunityIcons name="loading" size={18} color={colors.primary} />
          <Text style={styles.processing}>Analizando textura...</Text>
        </View>
      );
    }
    if (result === "match") {
      return (
        <View style={styles.matchCard}>
          <MaterialCommunityIcons name="check-circle" size={24} color={colors.tertiary} />
          <Text style={styles.matchText}>Coincidencia encontrada — 98.4%</Text>
        </View>
      );
    }
    if (result === "possible") {
      return (
        <View style={styles.possible}>
          <Text variant="titleSmall" style={{ color: colors.onSurface }}>Posibles coincidencias</Text>
          <Text style={styles.possibleItem}>Luna · Border Collie</Text>
          <Text style={styles.possibleItem}>Max · Pastor Aleman</Text>
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
        Escanear Trufa
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
          {/* Scan overlay hints */}
          <View style={styles.scanOverlay}>
            <View style={styles.scanHint}>
              <MaterialCommunityIcons name="white-balance-sunny" size={16} color={colors.onPrimary} />
              <Text style={styles.hintText}>Buena luz</Text>
            </View>
            <View style={styles.scanHint}>
              <MaterialCommunityIcons name="cellphone" size={16} color={colors.onPrimary} />
              <Text style={styles.hintText}>Estable</Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <PrimaryButton onPress={() => startScan("nose")} loading={processing} icon="fingerprint">
            Escanear nariz
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            gradient={false}
            onPress={() => startScan("appearance")}
            loading={processing}
            icon="dog"
          >
            Escanear apariencia
          </PrimaryButton>
          <PrimaryButton mode="outlined" gradient={false} onPress={pickImage} icon="image">
            Subir foto de galeria
          </PrimaryButton>
          {renderResult()}
        </View>
      </CardContainer>

      <View style={styles.techInfo}>
        <Text style={styles.techLabel}>SCAN_MODE: TRUFA_BIOMETRIC</Text>
        <Text style={styles.techLabel}>Noseprint ID v2.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
    color: colors.onSurface,
    fontFamily: fonts.heading,
  },
  cameraBox: {
    height: 280,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerHigh,
  },
  camera: {
    flex: 1,
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  scanOverlay: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
  },
  scanHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(30, 27, 19, 0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  hintText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  processing: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(62, 172, 112, 0.12)",
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  matchText: {
    color: colors.tertiary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  possible: {
    gap: spacing.xs,
  },
  possibleItem: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  techInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    opacity: 0.5,
  },
  techLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.body,
  },
});

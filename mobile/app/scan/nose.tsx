import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraGuideOverlay } from "../../src/components/CameraGuideOverlay";
import { colors, fonts, spacing, radii } from "../../src/theme";
import { api } from "../../src/api/mockApi";

type Phase = "permission" | "framing" | "captured" | "saving";

export default function ScanNoseScreen() {
  const router = useRouter();
  const { dogId, fromRegister, fromIdentify } = useLocalSearchParams<{
    dogId?: string;
    fromRegister?: string;
    fromIdentify?: string;
  }>();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>("framing");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [quality, setQuality] = useState<"good" | "poor" | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  const requestCameraPerm = async () => {
    const res = await requestPermission();
    if (!res.granted) {
      Alert.alert(
        "Cámara denegada",
        "Necesitamos acceso a la cámara para escanear la trufa."
      );
    }
  };

  const onCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (!photo) return;
      setCapturedUri(photo.uri);
      const result = await api.runBiometricScan(photo.uri, dogId);
      setQuality(result.quality);
      setMatchId(result.matchId);
      setPhase("captured");
    } catch (e) {
      Alert.alert("Error", "No pudimos capturar la imagen.");
    }
  };

  const retake = () => {
    setCapturedUri(null);
    setQuality(null);
    setMatchId(null);
    setPhase("framing");
  };

  const confirm = async () => {
    setPhase("saving");
    setTimeout(() => {
      if (fromIdentify === "true") {
        if (matchId) {
          router.replace({
            pathname: "/scan/match/[id]",
            params: { id: matchId },
          });
        } else {
          router.replace("/scan/match/no-match");
        }
      } else {
        router.replace({
          pathname: "/scan/confirmation",
          params: { dogId: dogId ?? "" },
        });
      }
    }, 500);
  };

  if (!permission) {
    return (
      <View style={styles.permWrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permWrap}>
        <View style={styles.permCard}>
          <MaterialCommunityIcons name="camera-outline" size={48} color={colors.primary} />
          <Text style={styles.permTitle}>Permiso de cámara</Text>
          <Text style={styles.permBody}>
            Necesitamos acceso a tu cámara para capturar la trufa de tu perro.
          </Text>
          <Pressable style={styles.btnPrimary} onPress={requestCameraPerm}>
            <Text style={styles.btnPrimaryText}>Permitir cámara</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.iconBtnDark} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={26} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Escanear trufa</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Camera or captured photo */}
      {phase === "framing" && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          autofocus="on"
        />
      )}
      {(phase === "captured" || phase === "saving") && capturedUri && (
        <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} />
      )}

      {/* Guide overlay (framing only) */}
      {phase === "framing" && (
        <View style={styles.guideWrap} pointerEvents="none">
          <CameraGuideOverlay size={260} color={colors.primary} />
        </View>
      )}

      {/* Bottom panel */}
      <View
        style={[
          styles.bottomPanel,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        {phase === "framing" && (
          <>
            <View style={styles.instructionsBox}>
              <View style={styles.dot} />
              <Text style={styles.instructionsText}>
                Centra la nariz dentro del círculo y mantén la cámara estable
              </Text>
            </View>
            <Pressable style={styles.shutterBtn} onPress={onCapture}>
              <View style={styles.shutterInner} />
            </Pressable>
          </>
        )}

        {phase === "captured" && (
          <>
            {quality === "good" && (
              <View style={styles.qualityBadge}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#ffffff" />
                <Text style={styles.qualityText}>Excelente captura</Text>
              </View>
            )}
            <View style={styles.confirmRow}>
              <Pressable style={styles.btnRetake} onPress={retake}>
                <MaterialCommunityIcons name="camera-retake" size={18} color="#ffffff" />
                <Text style={styles.btnRetakeText}>Tomar otra</Text>
              </Pressable>
              <Pressable style={styles.btnConfirm} onPress={confirm}>
                <MaterialCommunityIcons name="check" size={18} color="#ffffff" />
                <Text style={styles.btnConfirmText}>Confirmar</Text>
              </Pressable>
            </View>
          </>
        )}

        {phase === "saving" && (
          <View style={styles.savingRow}>
            <ActivityIndicator color="#ffffff" />
            <Text style={styles.savingText}>Guardando...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  permWrap: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  permCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
    maxWidth: 360,
  },
  permTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.onSurface,
  },
  permBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },

  // Header
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
    zIndex: 10,
  },
  iconBtnDark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: "#ffffff",
  },

  // Guide
  guideWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  // Bottom panel
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    gap: spacing.lg,
  },
  instructionsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  instructionsText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#ffffff",
    flexShrink: 1,
  },
  shutterBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },

  // Quality
  qualityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  qualityText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: "#ffffff",
  },
  confirmRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  btnRetake: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  btnRetakeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },
  btnConfirm: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: colors.tertiary,
  },
  btnConfirmText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },

  // Saving
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  savingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: "#ffffff",
  },
});

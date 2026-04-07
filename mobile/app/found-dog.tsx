import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { StepProgress } from "../src/components/StepProgress";
import { CameraGuideOverlay } from "../src/components/CameraGuideOverlay";
import { FormField } from "../src/components/FormField";
import { InfoTip } from "../src/components/InfoTip";
import { colors, fonts, spacing, radii } from "../src/theme";
import { api } from "../src/api/mockApi";

const STEPS = ["Foto", "Trufa", "Ubicación", "Publicar"];
const TOTAL = STEPS.length;

export default function FoundDogScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [noseScanned, setNoseScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setNoseScanned(true);
    }, 1500);
  };

  const useMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sin permiso", "Activa la ubicación.");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;
    setCoords({ latitude, longitude });
    try {
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (places.length > 0) {
        const p = places[0];
        setAddress(`${p.street ?? ""} ${p.city ?? ""}`.trim() || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch {
      setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  const canContinue = (() => {
    if (step === 1) return !!photo;
    if (step === 2) return true; // Step 2 is skippable
    if (step === 3) return !!address.trim();
    if (step === 4) return true;
    return false;
  })();

  const goNext = async () => {
    if (step < TOTAL) {
      setStep((s) => s + 1);
      return;
    }
    // Final submit
    setSubmitting(true);
    try {
      const result = await api.createFoundDogReport({
        photo: photo ?? undefined,
        noseScanned,
        location: {
          latitude: coords?.latitude ?? 0,
          longitude: coords?.longitude ?? 0,
          address,
        },
        comment,
      });
      if (result.matchId) {
        router.replace({
          pathname: "/scan/match/[id]",
          params: { id: result.matchId },
        });
      } else {
        Alert.alert(
          "Reporte publicado",
          "Tu hallazgo ya está visible para la comunidad."
        );
        router.replace("/(tabs)/feed");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No pudimos crear el reporte");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenHeader title="Encontré un perro" onBack={goBack} />

      <View style={styles.progressWrap}>
        <StepProgress
          variant="stepped"
          current={step}
          total={TOTAL}
          labels={STEPS}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(150)}
            style={styles.stepWrap}
          >
            <Text style={styles.stepTitle}>Sube una foto</Text>
            <Text style={styles.stepSub}>
              Una foto clara ayuda a identificar al perro más rápido
            </Text>

            <Pressable style={styles.dropZone} onPress={pickPhoto}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.dropImage} />
              ) : (
                <View style={styles.dropEmpty}>
                  <View style={styles.dropIconWrap}>
                    <MaterialCommunityIcons name="camera-plus" size={40} color={colors.primary} />
                  </View>
                  <Text style={styles.dropTitle}>Toca para subir</Text>
                  <Text style={styles.dropSub}>JPG, PNG hasta 5MB</Text>
                </View>
              )}
            </Pressable>

            <InfoTip
              tone="orange"
              emoji="📸"
              title="Tips para una buena foto"
              body="Captura al perro de cuerpo completo, con buena luz y un ángulo claro de su cara."
            />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(150)}
            style={styles.stepWrap}
          >
            <Text style={styles.stepTitle}>Escanea su trufa</Text>
            <Text style={styles.stepSub}>
              Si el perro está calmado, escanear su nariz aumenta la precisión
            </Text>

            <View style={styles.scanCard}>
              <CameraGuideOverlay size={180} color={colors.primary} />
              {scanning && (
                <View style={styles.scanningOverlay}>
                  <ActivityIndicator color="#ffffff" size="large" />
                </View>
              )}
              {noseScanned && !scanning && (
                <View style={styles.scanDoneOverlay}>
                  <View style={styles.scanDoneCheck}>
                    <MaterialCommunityIcons name="check" size={36} color="#ffffff" />
                  </View>
                </View>
              )}
            </View>

            <Pressable
              style={[styles.btnPrimary, noseScanned && styles.btnSuccess]}
              onPress={simulateScan}
              disabled={scanning || noseScanned}
            >
              <MaterialCommunityIcons
                name={noseScanned ? "check-circle" : "line-scan"}
                size={18}
                color="#ffffff"
              />
              <Text style={styles.btnPrimaryText}>
                {noseScanned ? "Trufa escaneada" : scanning ? "Escaneando..." : "Escanear trufa"}
              </Text>
            </Pressable>

            <Pressable onPress={() => setStep(3)} style={styles.skipBtn}>
              <Text style={styles.skipText}>Omitir este paso</Text>
            </Pressable>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(150)}
            style={styles.stepWrap}
          >
            <Text style={styles.stepTitle}>¿Dónde lo encontraste?</Text>
            <Text style={styles.stepSub}>
              Esta información ayuda a notificar a la familia más cercana
            </Text>

            <FormField
              label="Ubicación"
              required
              icon="map-marker"
              placeholder="Ej. Parque Forestal"
              value={address}
              onChangeText={setAddress}
            />
            <Pressable style={styles.locateBtn} onPress={useMyLocation}>
              <MaterialCommunityIcons name="crosshairs-gps" size={16} color={colors.secondary} />
              <Text style={styles.locateText}>Usar mi ubicación actual</Text>
            </Pressable>

            <FormField
              label="Comentario (opcional)"
              placeholder="Estado del perro, comportamiento, dónde lo dejarás, etc."
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />
          </Animated.View>
        )}

        {step === 4 && (
          <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(150)}
            style={styles.stepWrap}
          >
            <Text style={styles.stepTitle}>Listo para publicar</Text>
            <Text style={styles.stepSub}>
              Revisa los datos y publica para activar la búsqueda
            </Text>

            <View style={styles.summaryCard}>
              {photo && <Image source={{ uri: photo }} style={styles.summaryPhoto} />}
              <View style={{ flex: 1 }}>
                <SummaryItem
                  icon="image"
                  label="Foto"
                  ok={!!photo}
                />
                <SummaryItem
                  icon="line-scan"
                  label="Trufa escaneada"
                  ok={noseScanned}
                />
                <SummaryItem
                  icon="map-marker"
                  label="Ubicación"
                  ok={!!address}
                />
              </View>
            </View>

            {submitting && (
              <View style={styles.searchingBox}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.searchingText}>Buscando coincidencias...</Text>
              </View>
            )}

            <InfoTip
              tone="purple"
              emoji="✨"
              title="¿Qué pasará?"
              body={
                noseScanned
                  ? "Compararemos la trufa con todos los perros registrados. Si hay coincidencia, te avisaremos al instante."
                  : "Tu reporte aparecerá en la comunidad y notificaremos a usuarios cercanos."
              }
            />
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Pressable style={styles.btnGhostBtn} onPress={goBack}>
            <Text style={styles.btnGhostBtnText}>Atrás</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.btnContinue,
            step === TOTAL && noseScanned && styles.btnContinuePurple,
            (!canContinue || submitting) && styles.btnDisabled,
          ]}
          onPress={goNext}
          disabled={!canContinue || submitting}
        >
          <Text style={styles.btnContinueText}>
            {submitting
              ? "Procesando..."
              : step === TOTAL
              ? noseScanned
                ? "Buscar coincidencia"
                : "Publicar como encontrado"
              : "Continuar"}
          </Text>
          {!submitting && (
            <MaterialCommunityIcons
              name={
                step === TOTAL
                  ? noseScanned
                    ? "magnify"
                    : "send"
                  : "arrow-right"
              }
              size={18}
              color="#ffffff"
            />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function SummaryItem({
  icon,
  label,
  ok,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  ok: boolean;
}) {
  return (
    <View style={summaryStyles.row}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={ok ? colors.tertiary : colors.textMuted}
      />
      <Text
        style={[
          summaryStyles.label,
          { color: ok ? colors.onSurface : colors.textMuted },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          summaryStyles.dot,
          { backgroundColor: ok ? colors.tertiary : colors.outlineVariant },
        ]}
      />
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 6,
  },
  label: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

const styles = StyleSheet.create({
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  stepWrap: {
    gap: spacing.lg,
  },
  stepTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.onSurface,
  },
  stepSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: -spacing.md,
  },

  // Drop zone
  dropZone: {
    height: 280,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primaryFixed,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  dropImage: {
    width: "100%",
    height: "100%",
  },
  dropEmpty: {
    alignItems: "center",
    gap: spacing.sm,
  },
  dropIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  dropTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.onSurface,
  },
  dropSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },

  // Scan card
  scanCard: {
    height: 280,
    borderRadius: radii.lg,
    backgroundColor: "#1a1a1f",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanDoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanDoneCheck: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Buttons
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  btnSuccess: {
    backgroundColor: colors.tertiary,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  locateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radii.full,
    alignSelf: "flex-start",
    marginTop: -spacing.sm,
  },
  locateText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.secondary,
  },

  // Summary
  summaryCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  summaryPhoto: {
    width: 100,
    height: 100,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerHigh,
  },
  searchingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  searchingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.primary,
  },

  // Footer
  footer: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  btnGhostBtn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
  btnGhostBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  btnContinue: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  btnContinuePurple: {
    backgroundColor: colors.accentPurple,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnContinueText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },
});

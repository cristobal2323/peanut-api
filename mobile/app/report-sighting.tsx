import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { FormField } from "../src/components/FormField";
import { InfoTip } from "../src/components/InfoTip";
import {
  LocationPickerField,
  LocationValue,
} from "../src/components/LocationPickerField";
import { LocationSearchField } from "../src/components/LocationSearchField";
import { spacing, colors, fonts, radii } from "../src/theme";
import { sightingsApi } from "../src/api/sightings";
import { uploadDogPhoto } from "../src/lib/supabase";
import { useAuthStore } from "../src/store/auth";
import { queryKeys } from "../src/lib/queryClient";

export default function ReportSightingScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { reportId } = useLocalSearchParams<{ reportId?: string }>();

  const [location, setLocation] = useState<LocationValue | undefined>();
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const useCurrentLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Activa la ubicación en los ajustes del dispositivo."
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }).catch(() => [null]);

      const address = geo
        ? [geo.street, geo.city, geo.region].filter(Boolean).join(", ")
        : undefined;

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address,
      });
    } catch {
      Alert.alert("Error", "No se pudo obtener la ubicación.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const submit = async () => {
    setError(null);
    if (!photo) {
      setError("Sube una foto del perro que viste");
      return;
    }
    if (comment.trim().length < 4) {
      setError("Comparte más detalles sobre el avistamiento");
      return;
    }
    if (!location) {
      setError("Selecciona dónde viste al perro");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (photo && user?.id) {
        try {
          imageUrl = await uploadDogPhoto(photo, user.id);
        } catch {}
      }

      await sightingsApi.create({
        latitude: location.latitude,
        longitude: location.longitude,
        addressText: location.address,
        imageUrl,
        notes: comment,
        lostReportId: reportId || undefined,
      });

      qc.invalidateQueries({ queryKey: queryKeys.sightingsPublic });
      if (reportId) {
        qc.invalidateQueries({ queryKey: queryKeys.lostReport(reportId) });
      }

      Alert.alert(
        "Avistamiento enviado",
        "Gracias por ayudar a la comunidad."
      );
      router.back();
    } catch {
      setError("No pudimos enviar el reporte");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenHeader title="Reportar avistamiento" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <InfoTip
          tone="orange"
          emoji="👀"
          title="Ayuda a una familia"
          body="Tu reporte aparecerá en la búsqueda y notificará al dueño en tiempo real."
        />

        <Pressable style={styles.photoBtn} onPress={pickPhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoImg} />
          ) : (
            <View style={styles.photoEmpty}>
              <MaterialCommunityIcons
                name="camera-plus"
                size={32}
                color={colors.primary}
              />
              <Text style={styles.photoLabel}>Subir foto *</Text>
            </View>
          )}
        </Pressable>

        <FormField
          label="¿Qué viste?"
          required
          placeholder="Ej. Lo vi cerca del parque, parecía perdido y asustado..."
          multiline
          numberOfLines={5}
          value={comment}
          onChangeText={setComment}
        />

        {/* Location section */}
        <Text style={styles.sectionLabel}>¿Dónde lo viste? *</Text>

        <Pressable
          style={[
            styles.currentLocBtn,
            location && styles.currentLocBtnActive,
          ]}
          onPress={useCurrentLocation}
          disabled={detectingLocation}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={20}
            color={location ? colors.tertiary : colors.primary}
          />
          <Text
            style={[
              styles.currentLocText,
              location && styles.currentLocTextActive,
            ]}
          >
            {detectingLocation
              ? "Detectando..."
              : location?.address
                ? location.address
                : "Usar mi ubicación actual"}
          </Text>
          {location && (
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color={colors.tertiary}
            />
          )}
        </Pressable>

        <View style={styles.orDivider}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>o</Text>
          <View style={styles.orLine} />
        </View>

        <LocationPickerField
          label="Seleccionar en el mapa"
          placeholder="Toca para abrir el mapa"
          value={location}
          onChange={setLocation}
        />

        <View style={styles.orDivider}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>o</Text>
          <View style={styles.orLine} />
        </View>

        <LocationSearchField
          label="Buscar dirección"
          value={
            location
              ? {
                  name:
                    location.address ??
                    `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
                  latitude: location.latitude,
                  longitude: location.longitude,
                }
              : null
          }
          onChange={(loc) => {
            if (loc) {
              setLocation({
                latitude: loc.latitude,
                longitude: loc.longitude,
                address: loc.name,
              });
            } else {
              setLocation(undefined);
            }
          }}
          placeholder="Ej: Parque Forestal, Santiago"
        />

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btnPrimary, submitting && styles.btnDisabled]}
          onPress={submit}
          disabled={submitting}
        >
          <MaterialCommunityIcons name="send" size={18} color="#ffffff" />
          <Text style={styles.btnPrimaryText}>
            {submitting ? "Enviando..." : "Enviar reporte"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  photoBtn: {
    height: 180,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primaryFixed,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  photoImg: {
    width: "100%",
    height: "100%",
  },
  photoEmpty: {
    alignItems: "center",
    gap: spacing.sm,
  },
  photoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.primary,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
    marginTop: spacing.sm,
  },
  currentLocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  currentLocBtnActive: {
    backgroundColor: colors.tertiaryContainer,
    borderColor: colors.tertiary,
  },
  currentLocText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.primary,
  },
  currentLocTextActive: {
    color: colors.tertiary,
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
  },
  orText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.md,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: "#ffffff",
  },
});

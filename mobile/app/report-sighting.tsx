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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { FormField } from "../src/components/FormField";
import { InfoTip } from "../src/components/InfoTip";
import { spacing, colors, fonts, radii } from "../src/theme";
import { api } from "../src/api/mockApi";
import { queryKeys } from "../src/lib/queryClient";

export default function ReportSightingScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { reportId } = useLocalSearchParams<{ reportId?: string }>();

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  const mutation = useMutation({
    mutationFn: api.submitSighting,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.lostReports });
      Alert.alert("Avistamiento enviado", "Gracias por ayudar a la comunidad.");
      router.back();
    },
    onError: (err: any) => setError(err?.message ?? "No pudimos enviar el reporte"),
  });

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const submit = () => {
    setError(null);
    if (comment.trim().length < 4) {
      setError("Comparte más detalles sobre el avistamiento");
      return;
    }
    if (!coords) {
      setError("Activa la ubicación para enviar el reporte");
      return;
    }
    mutation.mutate({
      dogId: reportId ?? "",
      comment,
      image: photo ?? undefined,
      seenAt: new Date().toISOString(),
      location: coords,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenHeader title="Reportar avistamiento" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
              <MaterialCommunityIcons name="camera-plus" size={32} color={colors.primary} />
              <Text style={styles.photoLabel}>Subir foto (opcional)</Text>
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

        {coords && (
          <View style={styles.locationBox}>
            <MaterialCommunityIcons name="map-marker-check" size={18} color={colors.tertiary} />
            <Text style={styles.locationText}>Ubicación detectada</Text>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btnPrimary, mutation.isPending && styles.btnDisabled]}
          onPress={submit}
          disabled={mutation.isPending}
        >
          <MaterialCommunityIcons name="send" size={18} color="#ffffff" />
          <Text style={styles.btnPrimaryText}>
            {mutation.isPending ? "Enviando..." : "Enviar reporte"}
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
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.tertiaryContainer,
    borderRadius: radii.md,
    alignSelf: "flex-start",
  },
  locationText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.tertiary,
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

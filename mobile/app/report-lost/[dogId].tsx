import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { FormField } from "../../src/components/FormField";
import { InfoTip } from "../../src/components/InfoTip";
import { colors, fonts, spacing, radii } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";

export default function ReportLostScreen() {
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [whenText, setWhenText] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [dogName, setDogName] = useState("tu perro");

  useEffect(() => {
    api.fetchDog(dogId).then((d) => {
      if (d?.name) setDogName(d.name);
    });
  }, [dogId]);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Sin permiso", "Activa la ubicación para usar tu posición actual.");
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
        } else {
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch {
        setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    if (!address.trim()) {
      Alert.alert("Falta ubicación", "Ingresa o detecta una ubicación.");
      return;
    }
    setSubmitting(true);
    try {
      await api.createLostReport(dogId, {
        description,
        lastSeen: {
          latitude: coords?.latitude ?? 0,
          longitude: coords?.longitude ?? 0,
          address,
          time: whenText || new Date().toISOString(),
        },
      });
      qc.invalidateQueries({ queryKey: queryKeys.dogs });
      qc.invalidateQueries({ queryKey: queryKeys.dog(dogId) });
      qc.invalidateQueries({ queryKey: queryKeys.lostReports });
      Alert.alert("Alerta activada", "Tu comunidad ya está notificada.");
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No pudimos crear el reporte");
    } finally {
      setSubmitting(false);
    }
  };

  const shareReport = async () => {
    try {
      await Share.share({
        message: `🚨 ${dogName} está perdido en ${address || "ubicación desconocida"}. Si lo ves, ayúdame a contactar. — Vía Peanut`,
      });
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenHeader title="Reportar perdido" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <InfoTip
          tone="red"
          emoji="🚨"
          title="Alerta comunitaria"
          body={`Estamos a punto de notificar a tu comunidad sobre la desaparición de ${dogName}. Asegúrate de incluir información clara.`}
        />

        <View style={styles.fieldGroup}>
          <FormField
            label="Última ubicación conocida"
            required
            icon="map-marker"
            placeholder="Ej. Parque Bicentenario, Vitacura"
            value={address}
            onChangeText={setAddress}
          />
          <Pressable style={styles.locateBtn} onPress={useMyLocation} disabled={locating}>
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={16}
              color={colors.secondary}
            />
            <Text style={styles.locateText}>
              {locating ? "Detectando..." : "Usar mi ubicación actual"}
            </Text>
          </Pressable>
        </View>

        <FormField
          label="¿Cuándo se perdió?"
          icon="clock-outline"
          placeholder="DD/MM/YYYY HH:mm"
          value={whenText}
          onChangeText={setWhenText}
        />

        <FormField
          label="Descripción"
          placeholder="Cómo iba vestido, comportamiento, recompensa, etc."
          multiline
          numberOfLines={5}
          value={description}
          onChangeText={setDescription}
        />

        <InfoTip
          tone="blue"
          emoji="💡"
          title="¿Qué sucederá después?"
          body="Notificaremos a usuarios cercanos, mostraremos a tu perro en el mapa y en la comunidad. Recibirás avisos cuando alguien lo vea."
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btnDanger, submitting && styles.btnDisabled]}
          onPress={submit}
          disabled={submitting}
        >
          <MaterialCommunityIcons name="alert-circle" size={18} color="#ffffff" />
          <Text style={styles.btnDangerText}>
            {submitting ? "Activando..." : "Activar alerta ahora"}
          </Text>
        </Pressable>
        <Pressable style={styles.btnOutline} onPress={shareReport}>
          <MaterialCommunityIcons name="share-variant" size={18} color={colors.onSurface} />
          <Text style={styles.btnOutlineText}>Compartir en redes sociales</Text>
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
  fieldGroup: {
    gap: spacing.sm,
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
  },
  locateText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.secondary,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  btnDanger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: radii.md,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnDangerText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: "#ffffff",
  },
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  btnOutlineText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
});

import React, { useState } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { FormField } from "../../src/components/FormField";
import { InfoTip } from "../../src/components/InfoTip";
import { DatePickerField } from "../../src/components/DatePickerField";
import {
  LocationPickerField,
  LocationValue,
} from "../../src/components/LocationPickerField";
import { LocationSearchField } from "../../src/components/LocationSearchField";
import { colors, fonts, spacing, radii } from "../../src/theme";
import { dogsApi } from "../../src/api/dogs";
import { lostReportsApi, CreateLostReportPayload } from "../../src/api/lostReports";
import { queryKeys } from "../../src/lib/queryClient";
import { useTranslation } from "../../src/i18n";

export default function ReportLostScreen() {
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useTranslation();

  const [location, setLocation] = useState<LocationValue | undefined>(undefined);
  const [whenDate, setWhenDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: apiDog } = useQuery({
    queryKey: queryKeys.dog(dogId),
    queryFn: () => dogsApi.getById(dogId),
    enabled: !!dogId,
  });

  const dogName = apiDog?.name ?? "tu perro";

  const submit = async () => {
    if (!location) {
      Alert.alert("Falta ubicación", "Selecciona la última ubicación conocida.");
      return;
    }
    setSubmitting(true);
    try {
      const rewardNumber = reward ? Number(reward) : undefined;
      const payload: CreateLostReportPayload = {
        dogId,
        description: description || undefined,
        lastSeenLatitude: location.latitude,
        lastSeenLongitude: location.longitude,
        lastSeenAddress: location.address,
        lastSeenAt: whenDate ? whenDate.toISOString() : undefined,
        rewardOffered:
          rewardNumber !== undefined && !isNaN(rewardNumber) ? rewardNumber : undefined,
      };
      await lostReportsApi.create(payload);
      qc.invalidateQueries({ queryKey: queryKeys.dogs });
      qc.invalidateQueries({ queryKey: queryKeys.dog(dogId) });
      qc.invalidateQueries({ queryKey: queryKeys.lostReports });
      qc.invalidateQueries({ queryKey: queryKeys.lostReportsMine });
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
        message: `🚨 ${dogName} está perdido en ${location?.address || "ubicación desconocida"}. Si lo ves, ayúdame a contactar. — Vía Trufa ID`,
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

        <LocationPickerField
          label="Última ubicación conocida"
          required
          placeholder="Selecciona en el mapa"
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
          placeholder="Ej: Parque O'Higgins, Santiago"
        />

        <DatePickerField
          label="¿Cuándo se perdió?"
          placeholder="Selecciona fecha y hora"
          mode="datetime"
          value={whenDate}
          onChange={setWhenDate}
        />

        <FormField
          label="Descripción"
          placeholder="Cómo iba vestido, comportamiento, etc."
          multiline
          numberOfLines={5}
          value={description}
          onChangeText={setDescription}
        />

        <FormField
          label={t("reportLost.form.rewardLabel")}
          icon="cash"
          keyboardType="numeric"
          placeholder={t("reportLost.form.rewardPlaceholder")}
          value={reward}
          onChangeText={setReward}
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
});

import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { SectionCard } from "../src/components/SectionCard";
import { SettingsRow } from "../src/components/SettingsRow";
import { Toggle } from "../src/components/Toggle";
import {
  usePreferencesStore,
  NotificationPrefs,
} from "../src/store/preferences";
import { useAuthStore } from "../src/store/auth";
import { notificationsApi } from "../src/api/notifications";
import { http } from "../src/api/http";
import { colors, fonts, spacing, radii } from "../src/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const notifications = usePreferencesStore((s) => s.notifications);
  const setNotificationPref = usePreferencesStore((s) => s.setNotificationPref);
  const logout = useAuthStore((s) => s.logout);

  const settingsKeyMap: Partial<Record<keyof NotificationPrefs, string>> = {
    nearby: "nearbyEnabled",
    matches: "matchesEnabled",
    sightings: "sightingsEnabled",
    emailDigest: "emailEnabled",
  };

  const handleNotifPref = (key: keyof NotificationPrefs, value: boolean) => {
    setNotificationPref(key, value);
    const apiKey = settingsKeyMap[key];
    if (apiKey) {
      notificationsApi.updateSettings({ [apiKey]: value }).catch(() => {});
    }
  };

  const radiusOptions = [5, 10, 15, 25, 50];
  const [radius, setRadius] = React.useState(10);

  React.useEffect(() => {
    notificationsApi.getSettings().then((s) => {
      if (!s) return;
      if (s.lostAlertsRadiusKm) setRadius(s.lostAlertsRadiusKm);
      if (s.nearbyEnabled !== undefined) setNotificationPref("nearby", s.nearbyEnabled);
      if (s.matchesEnabled !== undefined) setNotificationPref("matches", s.matchesEnabled);
      if (s.sightingsEnabled !== undefined) setNotificationPref("sightings", s.sightingsEnabled);
      if (s.emailEnabled !== undefined) setNotificationPref("emailDigest", s.emailEnabled);
    }).catch(() => {});
  }, []);

  const handleRadiusChange = () => {
    Alert.alert(
      "Radio de alertas",
      "Recibirás alertas de perros perdidos dentro de este radio.",
      radiusOptions.map((km) => ({
        text: `${km} km`,
        onPress: () => {
          setRadius(km);
          notificationsApi
            .updateSettings({ lostAlertsRadiusKm: km })
            .catch(() => {});
        },
      })),
    );
  };

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
            await http("/notifications/push-token", {
              method: "DELETE",
              body: JSON.stringify({ token: pushToken.data }),
            });
          } catch {}
          logout();
          qc.clear();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción es irreversible. Tus perros y reportes serán eliminados.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive" },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Ajustes" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cuenta */}
        <Text style={styles.sectionLabel}>CUENTA</Text>
        <SectionCard padding={spacing.sm + 2}>
          <SettingsRow
            icon="account-outline"
            label="Editar perfil"
            sublabel="Nombre, foto, contacto"
            onPress={() => router.push("/profile/edit")}
          />
          <SettingsRow
            icon="lock-outline"
            iconColor={colors.secondary}
            label="Seguridad"
            sublabel="Contraseña, autenticación"
            onPress={() => Alert.alert("Próximamente", "Esta sección está en desarrollo.")}
          />
          <SettingsRow
            icon="shield-outline"
            iconColor={colors.tertiary}
            label="Privacidad"
            sublabel="Datos compartidos"
            divider={false}
            onPress={() => Alert.alert("Próximamente", "Esta sección está en desarrollo.")}
          />
        </SectionCard>

        {/* Notificaciones */}
        <Text style={styles.sectionLabel}>NOTIFICACIONES</Text>
        <SectionCard padding={spacing.sm + 2}>
          <NotifRow
            label="Alertas cercanas"
            sub="Perros perdidos en tu zona"
            value={notifications.nearby}
            onChange={(v) => handleNotifPref("nearby", v)}
          />
          <NotifRow
            label="Coincidencias"
            sub="Posibles matches con tu perro"
            value={notifications.matches}
            onChange={(v) => handleNotifPref("matches", v)}
          />
          <NotifRow
            label="Avistamientos"
            sub="Reportes en tu radio"
            value={notifications.sightings}
            onChange={(v) => handleNotifPref("sightings", v)}
          />
          <NotifRow
            label="Resumen por email"
            sub="Newsletter semanal"
            value={notifications.emailDigest}
            onChange={(v) => handleNotifPref("emailDigest", v)}
            last
          />
        </SectionCard>

        {/* Ubicación */}
        <Text style={styles.sectionLabel}>UBICACIÓN</Text>
        <SectionCard padding={spacing.sm + 2}>
          <SettingsRow
            icon="map-marker-outline"
            label="Acceso de ubicación"
            rightLabel="Activado"
            rightLabelColor={colors.tertiary}
            showChevron={false}
            onPress={() => Alert.alert("Permisos", "Gestiona los permisos en los ajustes del dispositivo.")}
          />
          <SettingsRow
            icon="map-marker-radius"
            iconColor={colors.secondary}
            label="Radio de alertas"
            rightLabel={`${radius} km`}
            divider={false}
            onPress={handleRadiusChange}
          />
        </SectionCard>

        {/* Soporte */}
        <Text style={styles.sectionLabel}>SOPORTE</Text>
        <SectionCard padding={spacing.sm + 2}>
          <SettingsRow
            icon="help-circle-outline"
            iconColor={colors.accentAmber}
            label="Centro de ayuda"
            onPress={() => Alert.alert("Ayuda", "Pronto disponible.")}
          />
          <SettingsRow
            icon="email-outline"
            iconColor={colors.secondary}
            label="Contáctanos"
            sublabel="hola@peanut.app"
            divider={false}
            onPress={() => Alert.alert("Contacto", "hola@peanut.app")}
          />
        </SectionCard>

        {/* Zona de peligro */}
        <Text style={[styles.sectionLabel, styles.dangerLabel]}>ZONA DE PELIGRO</Text>
        <SectionCard padding={spacing.sm + 2}>
          <SettingsRow
            icon="trash-can-outline"
            iconColor={colors.error}
            label="Eliminar cuenta"
            sublabel="Acción irreversible"
            destructive
            divider={false}
            onPress={handleDeleteAccount}
          />
        </SectionCard>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <Text style={styles.version}>Trufa ID v0.1.0</Text>
      </ScrollView>
    </View>
  );
}

function NotifRow({
  label,
  sub,
  value,
  onChange,
  last,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[notifStyles.row, !last && notifStyles.divider]}>
      <View style={{ flex: 1 }}>
        <Text style={notifStyles.label}>{label}</Text>
        <Text style={notifStyles.sub}>{sub}</Text>
      </View>
      <Toggle value={value} onValueChange={onChange} />
    </View>
  );
}

const notifStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: 2,
    paddingHorizontal: spacing.sm,
  },
  dangerLabel: {
    color: colors.error,
  },
  logoutBtn: {
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: "center",
    marginTop: spacing.md,
  },
  logoutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
  },
  version: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});

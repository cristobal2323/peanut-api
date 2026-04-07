import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { FormField } from "../../src/components/FormField";
import { colors, fonts, spacing, radii } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { api } from "../../src/api/mockApi";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "",
    country: user?.country ?? "",
    avatarUrl: user?.avatarUrl ?? "",
  });
  const [saving, setSaving] = useState(false);

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) update("avatarUrl", result.assets[0].uri);
  };

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert("Faltan datos", "Nombre y email son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateUserProfile({ ...user, ...form });
      setUser({ ...(user as any), ...updated });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No pudimos guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenHeader title="Editar perfil" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.avatarBtn} onPress={pickAvatar}>
          {form.avatarUrl ? (
            <Image source={{ uri: form.avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="camera-plus" size={32} color={colors.primary} />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <MaterialCommunityIcons name="pencil" size={14} color="#ffffff" />
          </View>
        </Pressable>
        <Text style={styles.avatarHint}>Toca para cambiar tu foto</Text>

        <FormField
          label="Nombre completo"
          required
          value={form.name}
          onChangeText={(v) => update("name", v)}
        />
        <FormField
          label="Email"
          required
          icon="email-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => update("email", v)}
        />
        <FormField
          label="Teléfono"
          icon="phone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => update("phone", v)}
        />
        <FormField
          label="Ciudad"
          value={form.city}
          onChangeText={(v) => update("city", v)}
        />
        <FormField
          label="País"
          value={form.country}
          onChangeText={(v) => update("country", v)}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btnPrimary, saving && styles.btnDisabled]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.btnPrimaryText}>
            {saving ? "Guardando..." : "Guardar cambios"}
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
    alignItems: "stretch",
  },
  avatarBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceContainerLow,
    alignSelf: "center",
    overflow: "hidden",
    position: "relative",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: "center",
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

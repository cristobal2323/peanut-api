import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "../../../src/components/ScreenHeader";
import { FormField } from "../../../src/components/FormField";
import { colors, fonts, spacing, radii } from "../../../src/theme";
import { api } from "../../../src/api/mockApi";
import { queryKeys } from "../../../src/lib/queryClient";
import { Dog } from "../../../src/types";

export default function EditDogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Dog>>({});

  useEffect(() => {
    (async () => {
      const dog = await api.fetchDog(id);
      if (dog) setForm(dog);
      setLoading(false);
    })();
  }, [id]);

  const update = <K extends keyof Dog>(key: K, value: Dog[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) update("photo", result.assets[0].uri);
  };

  const save = async () => {
    if (!form.name || !form.breed) {
      Alert.alert("Faltan datos", "Nombre y raza son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await api.updateDog(id, form);
      qc.invalidateQueries({ queryKey: queryKeys.dog(id) });
      qc.invalidateQueries({ queryKey: queryKeys.dogs });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No pudimos guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ScreenHeader title="Editar perro" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenHeader title="Editar perro" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.photoUpload} onPress={pickPhoto}>
          {form.photo ? (
            <Image source={{ uri: form.photo }} style={styles.photoImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialCommunityIcons name="camera-plus" size={36} color={colors.primary} />
              <Text style={styles.photoLabel}>Cambiar foto</Text>
            </View>
          )}
        </Pressable>

        <FormField
          label="Nombre"
          required
          value={form.name ?? ""}
          onChangeText={(v) => update("name", v)}
        />
        <FormField
          label="Raza"
          required
          value={form.breed ?? ""}
          onChangeText={(v) => update("breed", v)}
        />
        <FormField
          label="Edad (años)"
          keyboardType="numeric"
          value={form.age != null ? String(form.age) : ""}
          onChangeText={(v) => update("age", v ? Number(v) : undefined)}
        />
        <FormField
          label="Color"
          value={form.color ?? ""}
          onChangeText={(v) => update("color", v)}
        />
        <FormField
          label="Microchip"
          value={form.microchip ?? ""}
          onChangeText={(v) => update("microchip", v)}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btnPrimary, saving && styles.btnPrimaryDisabled]}
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
  center: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    flex: 1,
    textAlign: "center",
    paddingTop: spacing.xxl,
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  photoUpload: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surfaceContainerLow,
    alignSelf: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    marginBottom: spacing.md,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  photoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.primary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: "center",
  },
  btnPrimaryDisabled: {
    opacity: 0.4,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#ffffff",
  },
});

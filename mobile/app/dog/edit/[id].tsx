import React, { useEffect, useMemo, useState } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "../../../src/components/ScreenHeader";
import { FormField } from "../../../src/components/FormField";
import { DatePickerField } from "../../../src/components/DatePickerField";
import {
  SearchableSelect,
  SelectOption,
} from "../../../src/components/SearchableSelect";
import { InfoTip } from "../../../src/components/InfoTip";
import { colors, fonts, spacing, radii } from "../../../src/theme";
import { dogsApi, UpdateDogPayload } from "../../../src/api/dogs";
import { breedsApi } from "../../../src/api/breeds";
import { colorsApi } from "../../../src/api/colors";
import { queryKeys } from "../../../src/lib/queryClient";
import { uploadDogPhoto } from "../../../src/lib/supabase";
import { useAuthStore } from "../../../src/store/auth";
import { usePreferencesStore } from "../../../src/store/preferences";
import { useTranslation } from "../../../src/i18n";

type EditForm = {
  photo?: string;
  photoRemote?: string;
  photoDirty: boolean;
  name: string;
  breedId?: string;
  breedLabel?: string;
  mixedBreed: boolean;
  sex: "male" | "female";
  birthDate?: Date;
  colorId?: string;
  colorLabel?: string;
  size: "small" | "medium" | "large";
  notes: string;
  hasMicrochip: boolean;
  microchip: string;
  passportId: string;
};

export default function EditDogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const locale = usePreferencesStore((s) => s.locale);
  const { t } = useTranslation();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);

  const { data: dog, isLoading } = useQuery({
    queryKey: queryKeys.dog(id),
    queryFn: () => dogsApi.getById(id),
  });

  const { data: breedsData, isLoading: breedsLoading } = useQuery({
    queryKey: queryKeys.breeds(),
    queryFn: () => breedsApi.list(),
    staleTime: 1000 * 60 * 60,
  });
  const { data: colorsData, isLoading: colorsLoading } = useQuery({
    queryKey: queryKeys.colors(),
    queryFn: () => colorsApi.list(),
    staleTime: 1000 * 60 * 60,
  });

  const breedOptions: SelectOption[] = useMemo(
    () => (breedsData ?? []).map((b) => ({ id: b.id, label: b.name })),
    [breedsData]
  );
  const colorOptions: SelectOption[] = useMemo(
    () => (colorsData ?? []).map((c) => ({ id: c.id, label: c.name })),
    [colorsData]
  );

  useEffect(() => {
    if (!dog) return;
    setForm({
      photo: dog.photoUrl ?? undefined,
      photoRemote: dog.photoUrl ?? undefined,
      photoDirty: false,
      name: dog.name,
      breedId: dog.breed?.id ?? dog.breedId ?? undefined,
      breedLabel: dog.breed
        ? locale === "en"
          ? dog.breed.nameEn
          : dog.breed.nameEs
        : undefined,
      mixedBreed: dog.mixedBreed,
      sex: dog.sex === "FEMALE" ? "female" : "male",
      birthDate: dog.birthDate ? new Date(dog.birthDate) : undefined,
      colorId: dog.color?.id ?? dog.colorId ?? undefined,
      colorLabel: dog.color
        ? locale === "en"
          ? dog.color.nameEn
          : dog.color.nameEs
        : undefined,
      size:
        dog.size === "SMALL"
          ? "small"
          : dog.size === "LARGE"
            ? "large"
            : "medium",
      notes: dog.notes ?? "",
      hasMicrochip: !!dog.microchip,
      microchip: dog.microchip ?? "",
      passportId: dog.passportId ?? "",
    });
  }, [dog, locale]);

  const update = <K extends keyof EditForm>(key: K, value: EditForm[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && form) {
      update("photo", result.assets[0].uri);
      update("photoDirty", true);
    }
  };

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) {
      Alert.alert("Faltan datos", "El nombre es obligatorio");
      return;
    }
    if (!user?.id) {
      Alert.alert("Sesión", "Debes iniciar sesión");
      return;
    }
    setSaving(true);
    try {
      let photoUrl = form.photoRemote;
      if (form.photoDirty && form.photo) {
        try {
          photoUrl = await uploadDogPhoto(form.photo, user.id);
        } catch (e) {
          console.warn("Photo upload failed", e);
          Alert.alert(
            t("dogs.form.photoUploadErrorTitle"),
            t("dogs.form.photoUploadErrorBody")
          );
        }
      }

      const payload: UpdateDogPayload = {
        name: form.name.trim(),
        breedId: form.breedId,
        mixedBreed: form.mixedBreed,
        birthDate: form.birthDate
          ? form.birthDate.toISOString().slice(0, 10)
          : undefined,
        sex: form.sex === "male" ? "MALE" : "FEMALE",
        colorId: form.colorId,
        size:
          form.size === "small"
            ? "SMALL"
            : form.size === "large"
              ? "LARGE"
              : "MEDIUM",
        microchip: form.hasMicrochip ? form.microchip.trim() || undefined : undefined,
        passportId: form.passportId.trim() || undefined,
        notes: form.notes.trim() || undefined,
        photoUrl,
      };

      await dogsApi.update(id, payload);
      qc.invalidateQueries({ queryKey: queryKeys.dog(id) });
      qc.invalidateQueries({ queryKey: queryKeys.dogs });
      router.back();
    } catch (e: any) {
      Alert.alert(
        t("dogs.form.saveErrorTitle"),
        e?.message ?? t("dogs.form.saveErrorDefault")
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !form) {
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
              <MaterialCommunityIcons
                name="camera-plus"
                size={36}
                color={colors.primary}
              />
              <Text style={styles.photoLabel}>Cambiar foto</Text>
            </View>
          )}
        </Pressable>

        <FormField
          label={t("dogs.form.nameLabel")}
          required
          placeholder={t("dogs.form.namePlaceholder")}
          value={form.name}
          onChangeText={(v) => update("name", v)}
        />

        <SearchableSelect
          label={t("dogs.form.breedLabel")}
          placeholder={t("dogs.form.breedPlaceholder")}
          searchPlaceholder={t("dogs.form.breedSearchPlaceholder")}
          emptyLabel={t("dogs.form.emptySearch")}
          value={form.breedId}
          valueLabel={form.breedLabel}
          options={breedOptions}
          loading={breedsLoading}
          onChange={(id, opt) => {
            update("breedId", id);
            update("breedLabel", opt.label);
          }}
        />

        <Pressable
          style={styles.checkboxRow}
          onPress={() => update("mixedBreed", !form.mixedBreed)}
        >
          <View
            style={[
              styles.checkbox,
              form.mixedBreed && styles.checkboxChecked,
            ]}
          >
            {form.mixedBreed && (
              <MaterialCommunityIcons name="check" size={14} color="#ffffff" />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            {t("dogs.form.mixedBreedLabel")}
          </Text>
        </Pressable>

        <DatePickerField
          label={t("dogs.form.birthDateLabel")}
          placeholder={t("dogs.form.birthDatePlaceholder")}
          cancelLabel={t("dogs.form.birthDateCancel")}
          confirmLabel={t("dogs.form.birthDateConfirm")}
          value={form.birthDate}
          onChange={(d) => update("birthDate", d)}
          maximumDate={new Date()}
        />

        <View style={styles.fieldLabelWrap}>
          <Text style={styles.fieldLabel}>{t("dogs.form.sexLabel")}</Text>
          <View style={pillStyles.row}>
            {(
              [
                { label: t("dogs.form.sexMale"), value: "male", icon: "gender-male" },
                {
                  label: t("dogs.form.sexFemale"),
                  value: "female",
                  icon: "gender-female",
                },
              ] as const
            ).map((opt) => {
              const active = opt.value === form.sex;
              return (
                <Pressable
                  key={opt.value}
                  style={[pillStyles.pill, active && pillStyles.pillActive]}
                  onPress={() => update("sex", opt.value)}
                >
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={18}
                    color={active ? "#ffffff" : colors.textMuted}
                  />
                  <Text
                    style={[pillStyles.text, active && pillStyles.textActive]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <SearchableSelect
          label={t("dogs.form.colorLabel")}
          placeholder={t("dogs.form.colorPlaceholder")}
          searchPlaceholder={t("dogs.form.colorSearchPlaceholder")}
          emptyLabel={t("dogs.form.emptySearch")}
          value={form.colorId}
          valueLabel={form.colorLabel}
          options={colorOptions}
          loading={colorsLoading}
          onChange={(id, opt) => {
            update("colorId", id);
            update("colorLabel", opt.label);
          }}
        />

        <View style={styles.fieldLabelWrap}>
          <Text style={styles.fieldLabel}>{t("dogs.form.sizeLabel")}</Text>
          <View style={pillStyles.row}>
            {(
              [
                { label: t("dogs.form.sizeSmall"), value: "small" },
                { label: t("dogs.form.sizeMedium"), value: "medium" },
                { label: t("dogs.form.sizeLarge"), value: "large" },
              ] as const
            ).map((opt) => {
              const active = opt.value === form.size;
              return (
                <Pressable
                  key={opt.value}
                  style={[pillStyles.pill, active && pillStyles.pillActive]}
                  onPress={() => update("size", opt.value)}
                >
                  <Text
                    style={[pillStyles.text, active && pillStyles.textActive]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <FormField
          label={t("dogs.form.notesLabel")}
          placeholder={t("dogs.form.notesPlaceholder")}
          multiline
          numberOfLines={4}
          value={form.notes}
          onChangeText={(v) => update("notes", v)}
        />

        <FormField
          label={t("dogs.form.passportLabel")}
          icon="passport"
          placeholder={t("dogs.form.passportPlaceholder")}
          value={form.passportId}
          onChangeText={(v) => update("passportId", v)}
        />

        <InfoTip tone="orange" emoji="🔖">
          <Pressable
            style={styles.checkboxRow}
            onPress={() => update("hasMicrochip", !form.hasMicrochip)}
          >
            <View
              style={[
                styles.checkbox,
                form.hasMicrochip && styles.checkboxChecked,
              ]}
            >
              {form.hasMicrochip && (
                <MaterialCommunityIcons
                  name="check"
                  size={14}
                  color="#ffffff"
                />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              {t("dogs.form.microchipLabel")}
            </Text>
          </Pressable>
          {form.hasMicrochip && (
            <FormField
              placeholder={t("dogs.form.microchipPlaceholder")}
              value={form.microchip}
              onChangeText={(v) => update("microchip", v)}
              containerStyle={{ marginTop: spacing.sm }}
            />
          )}
        </InfoTip>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.btnPrimary, saving && styles.btnPrimaryDisabled]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.btnPrimaryText}>
            {saving ? t("dogs.form.submitting") : "Guardar cambios"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const pillStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: "transparent",
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurface,
  },
  textActive: {
    color: "#ffffff",
    fontFamily: fonts.bodySemiBold,
  },
});

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
    marginBottom: spacing.sm,
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
  fieldLabelWrap: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onPrimaryContainer,
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

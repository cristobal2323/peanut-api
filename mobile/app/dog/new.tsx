import React, { useMemo, useState } from "react";
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
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { StepProgress } from "../../src/components/StepProgress";
import { FormField } from "../../src/components/FormField";
import { InfoTip } from "../../src/components/InfoTip";
import {
  SearchableSelect,
  SelectOption,
} from "../../src/components/SearchableSelect";
import { DatePickerField } from "../../src/components/DatePickerField";
import { colors, fonts, spacing, radii } from "../../src/theme";
import { dogsApi, CreateDogPayload } from "../../src/api/dogs";
import { breedsApi } from "../../src/api/breeds";
import { colorsApi } from "../../src/api/colors";
import { queryKeys } from "../../src/lib/queryClient";
import { uploadDogPhoto } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/auth";
import { useTranslation } from "../../src/i18n";

type DogForm = {
  photo?: string;
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

const initialForm: DogForm = {
  name: "",
  mixedBreed: false,
  sex: "male",
  size: "medium",
  notes: "",
  hasMicrochip: false,
  microchip: "",
  passportId: "",
};

const TOTAL_STEPS = 2;

export default function NewDogScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DogForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof DogForm>(key: K, value: DogForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

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

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) update("photo", result.assets[0].uri);
  };

  const canContinue = (() => {
    if (step === 1) {
      const breedOk = form.mixedBreed || !!form.breedId;
      return !!form.name.trim() && !!form.birthDate && breedOk;
    }
    if (step === 2) return !!form.size;
    return false;
  })();

  const submit = async () => {
    if (!user?.id) {
      Alert.alert(t("dogs.form.saveErrorTitle"), t("dogs.form.sessionError"));
      return;
    }
    setSubmitting(true);
    try {
      let photoUrl: string | undefined;
      if (form.photo) {
        try {
          photoUrl = await uploadDogPhoto(form.photo, user.id);
        } catch (e: any) {
          console.warn("Photo upload failed", e);
          Alert.alert(
            t("dogs.form.photoUploadErrorTitle"),
            t("dogs.form.photoUploadErrorBody")
          );
        }
      }

      const payload: CreateDogPayload = {
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

      const saved = await dogsApi.create(payload);
      qc.invalidateQueries({ queryKey: queryKeys.dogs });
      router.replace({
        pathname: "/scan/nose",
        params: { dogId: saved.id, fromRegister: "1" },
      });
    } catch (e: any) {
      Alert.alert(
        t("dogs.form.saveErrorTitle"),
        e?.message ?? t("dogs.form.saveErrorDefault")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    await submit();
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
      <ScreenHeader title={t("dogs.form.title")} onBack={goBack} />

      <View style={styles.progressWrap}>
        <StepProgress current={step} total={TOTAL_STEPS} />
        <Text style={styles.stepLabel}>
          {t("dogs.form.stepLabel")
            .replace("{current}", String(step))
            .replace("{total}", String(TOTAL_STEPS))}
        </Text>
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
            <Text style={styles.stepTitle}>{t("dogs.form.step1Title")}</Text>
            <Text style={styles.stepSub}>{t("dogs.form.step1Sub")}</Text>

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
                  <Text style={styles.photoLabel}>
                    {t("dogs.form.photoLabel")}
                  </Text>
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
              required={!form.mixedBreed}
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
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color="#ffffff"
                  />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {t("dogs.form.mixedBreedLabel")}
              </Text>
            </Pressable>

            <View style={styles.fieldLabelWrap}>
              <Text style={styles.fieldLabel}>
                {t("dogs.form.sexLabel")} <Text style={styles.required}>*</Text>
              </Text>
              <PillGroup
                value={form.sex}
                options={[
                  {
                    label: t("dogs.form.sexMale"),
                    value: "male",
                    icon: "gender-male",
                  },
                  {
                    label: t("dogs.form.sexFemale"),
                    value: "female",
                    icon: "gender-female",
                  },
                ]}
                onChange={(v) => update("sex", v as "male" | "female")}
              />
            </View>

            <DatePickerField
              label={t("dogs.form.birthDateLabel")}
              required
              placeholder={t("dogs.form.birthDatePlaceholder")}
              value={form.birthDate}
              onChange={(d) => update("birthDate", d)}
              cancelLabel={t("dogs.form.birthDateCancel")}
              confirmLabel={t("dogs.form.birthDateConfirm")}
              maximumDate={new Date()}
            />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(150)}
            style={styles.stepWrap}
          >
            <Text style={styles.stepTitle}>{t("dogs.form.step2Title")}</Text>
            <Text style={styles.stepSub}>{t("dogs.form.step2Sub")}</Text>

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
              <Text style={styles.fieldLabel}>
                {t("dogs.form.sizeLabel")} <Text style={styles.required}>*</Text>
              </Text>
              <PillGroup
                value={form.size}
                options={[
                  { label: t("dogs.form.sizeSmall"), value: "small" },
                  { label: t("dogs.form.sizeMedium"), value: "medium" },
                  { label: t("dogs.form.sizeLarge"), value: "large" },
                ]}
                onChange={(v) => update("size", v as DogForm["size"])}
              />
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

            <InfoTip
              tone="blue"
              emoji="📷"
              title={t("dogs.form.infoNextTitle")}
              body={t("dogs.form.infoNextBody")}
            />
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Pressable style={styles.btnGhost} onPress={goBack}>
            <Text style={styles.btnGhostText}>{t("dogs.form.back")}</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.btnPrimary,
            (!canContinue || submitting) && styles.btnPrimaryDisabled,
          ]}
          onPress={goNext}
          disabled={!canContinue || submitting}
        >
          <Text style={styles.btnPrimaryText}>
            {step < TOTAL_STEPS
              ? t("dogs.form.continue")
              : submitting
                ? t("dogs.form.submitting")
                : t("dogs.form.submit")}
          </Text>
          <MaterialCommunityIcons
            name={step < TOTAL_STEPS ? "arrow-right" : "line-scan"}
            size={20}
            color="#ffffff"
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── PillGroup helper ───────────────────────────────────────
type PillOption = {
  label: string;
  value: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};
type PillGroupProps = {
  value: string;
  options: PillOption[];
  onChange: (next: string) => void;
};

function PillGroup({ value, options, onChange }: PillGroupProps) {
  return (
    <View style={pillStyles.row}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            style={[pillStyles.pill, active && pillStyles.pillActive]}
            onPress={() => onChange(opt.value)}
          >
            {opt.icon && (
              <MaterialCommunityIcons
                name={opt.icon}
                size={18}
                color={active ? "#ffffff" : colors.textMuted}
              />
            )}
            <Text style={[pillStyles.text, active && pillStyles.textActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
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

// ─── Screen styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  stepLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
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
  photoUpload: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surfaceContainerLow,
    alignSelf: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.primaryContainer,
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
  required: {
    color: colors.error,
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
    flexDirection: "row",
    gap: spacing.sm + 2,
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  btnGhost: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
  btnGhostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
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

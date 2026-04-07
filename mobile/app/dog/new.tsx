import React, { useState } from "react";
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
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { StepProgress } from "../../src/components/StepProgress";
import { FormField } from "../../src/components/FormField";
import { InfoTip } from "../../src/components/InfoTip";
import { colors, fonts, spacing, radii } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { Dog } from "../../src/types";

type DogForm = {
  photo?: string;
  name: string;
  breed: string;
  sex: "male" | "female";
  age: string;
  color: string;
  size: "small" | "medium" | "large";
  traits: string;
  hasMicrochip: boolean;
  microchip: string;
  phonePrimary: string;
  phoneAlt: string;
};

const initialForm: DogForm = {
  name: "",
  breed: "",
  sex: "male",
  age: "",
  color: "",
  size: "medium",
  traits: "",
  hasMicrochip: false,
  microchip: "",
  phonePrimary: "",
  phoneAlt: "",
};

const TOTAL_STEPS = 3;

export default function NewDogScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DogForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof DogForm>(key: K, value: DogForm[K]) =>
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

  const canContinue = (() => {
    if (step === 1) return form.name.trim() && form.breed.trim() && form.age.trim();
    if (step === 2) return form.color.trim();
    if (step === 3) return form.phonePrimary.trim();
    return false;
  })();

  const goNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    // Final submit
    setSubmitting(true);
    try {
      const payload: Dog = {
        id: "",
        name: form.name,
        breed: form.breed,
        age: form.age ? Number(form.age) : undefined,
        sex: form.sex,
        color: form.color,
        size: form.size,
        microchip: form.hasMicrochip ? form.microchip : undefined,
        photo: form.photo,
        status: "normal",
      };
      const saved = await api.saveDog(payload);
      router.replace({
        pathname: "/scan/nose",
        params: { dogId: saved.id, fromRegister: "1" },
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No pudimos guardar el perro");
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
      <ScreenHeader title="Registrar Perro" onBack={goBack} />

      <View style={styles.progressWrap}>
        <StepProgress current={step} total={TOTAL_STEPS} />
        <Text style={styles.stepLabel}>
          Paso {step} de {TOTAL_STEPS}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <Animated.View entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(150)} style={styles.stepWrap}>
            <Text style={styles.stepTitle}>Información básica</Text>
            <Text style={styles.stepSub}>Cuéntanos lo esencial sobre tu mejor amigo</Text>

            <Pressable style={styles.photoUpload} onPress={pickPhoto}>
              {form.photo ? (
                <Image source={{ uri: form.photo }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={36} color={colors.primary} />
                  <Text style={styles.photoLabel}>Subir foto</Text>
                </View>
              )}
            </Pressable>

            <FormField
              label="Nombre"
              required
              placeholder="Ej. Peanut"
              value={form.name}
              onChangeText={(v) => update("name", v)}
            />

            <FormField
              label="Raza o mestizo"
              required
              placeholder="Ej. Beagle Mix"
              value={form.breed}
              onChangeText={(v) => update("breed", v)}
            />

            <View style={styles.fieldLabelWrap}>
              <Text style={styles.fieldLabel}>
                Sexo <Text style={styles.required}>*</Text>
              </Text>
              <PillGroup
                value={form.sex}
                options={[
                  { label: "Macho", value: "male", icon: "gender-male" },
                  { label: "Hembra", value: "female", icon: "gender-female" },
                ]}
                onChange={(v) => update("sex", v as "male" | "female")}
              />
            </View>

            <FormField
              label="Edad (años)"
              required
              placeholder="Ej. 4"
              keyboardType="numeric"
              value={form.age}
              onChangeText={(v) => update("age", v)}
            />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(150)} style={styles.stepWrap}>
            <Text style={styles.stepTitle}>Rasgos y detalles</Text>
            <Text style={styles.stepSub}>Más información que ayuda a identificarlo</Text>

            <FormField
              label="Color"
              required
              placeholder="Ej. Marrón / Blanco"
              value={form.color}
              onChangeText={(v) => update("color", v)}
            />

            <View style={styles.fieldLabelWrap}>
              <Text style={styles.fieldLabel}>
                Tamaño <Text style={styles.required}>*</Text>
              </Text>
              <PillGroup
                value={form.size}
                options={[
                  { label: "Pequeño", value: "small" },
                  { label: "Mediano", value: "medium" },
                  { label: "Grande", value: "large" },
                ]}
                onChange={(v) => update("size", v as DogForm["size"])}
              />
            </View>

            <FormField
              label="Rasgos distintivos"
              placeholder="Cicatrices, manchas únicas, comportamiento..."
              multiline
              numberOfLines={4}
              value={form.traits}
              onChangeText={(v) => update("traits", v)}
            />

            <InfoTip tone="orange" emoji="🔖">
              <Pressable
                style={styles.checkboxRow}
                onPress={() => update("hasMicrochip", !form.hasMicrochip)}
              >
                <View style={[styles.checkbox, form.hasMicrochip && styles.checkboxChecked]}>
                  {form.hasMicrochip && (
                    <MaterialCommunityIcons name="check" size={14} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Tiene microchip</Text>
              </Pressable>
              {form.hasMicrochip && (
                <FormField
                  placeholder="Número de microchip"
                  value={form.microchip}
                  onChangeText={(v) => update("microchip", v)}
                  containerStyle={{ marginTop: spacing.sm }}
                />
              )}
            </InfoTip>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(150)} style={styles.stepWrap}>
            <Text style={styles.stepTitle}>Información de contacto</Text>
            <Text style={styles.stepSub}>Para que puedan contactarte si encuentran a tu perro</Text>

            <FormField
              label="Teléfono principal"
              required
              icon="phone"
              placeholder="+56 9 1234 5678"
              keyboardType="phone-pad"
              value={form.phonePrimary}
              onChangeText={(v) => update("phonePrimary", v)}
            />

            <FormField
              label="Teléfono alternativo"
              icon="phone-plus"
              placeholder="Opcional"
              keyboardType="phone-pad"
              value={form.phoneAlt}
              onChangeText={(v) => update("phoneAlt", v)}
            />

            <InfoTip
              tone="blue"
              emoji="🔒"
              title="Tus datos están protegidos"
              body="Solo se mostrarán cuando alguien encuentre a tu perro y necesite contactarte."
            />

            <InfoTip
              tone="orange"
              emoji="📷"
              title="Próximo paso: escanear la trufa"
              body="Te llevaremos a la cámara para capturar el patrón único de la nariz de tu perro."
            />
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Pressable style={styles.btnGhost} onPress={goBack}>
            <Text style={styles.btnGhostText}>Atrás</Text>
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
            {step < TOTAL_STEPS ? "Continuar" : "Escanear trufa"}
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
type PillOption = { label: string; value: string; icon?: keyof typeof MaterialCommunityIcons.glyphMap };
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

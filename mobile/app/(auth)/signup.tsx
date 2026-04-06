import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Link, useRouter } from "expo-router";

import { Checkbox, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { FormikTextInput } from "../../src/components/FormikTextInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { colors, spacing, radii, fonts } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { authApi } from "../../src/api/auth";
import { LanguageToggle } from "../../src/components/LanguageToggle";
import { useTranslation } from "../../src/i18n";

export default function SignupScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      Yup.object({
        name: Yup.string()
          .min(2, t("auth.signup.errorMinName"))
          .required(t("auth.signup.errorRequiredName")),
        email: Yup.string()
          .email(t("auth.signup.errorInvalidEmail"))
          .required(t("auth.signup.errorRequiredEmail")),
        password: Yup.string()
          .min(8, t("auth.signup.errorMinPassword"))
          .required(t("auth.signup.errorRequiredPassword")),
        phone: Yup.string()
          .matches(/^\+?\d{7,15}$/, t("auth.signup.errorInvalidPhone"))
          .required(t("auth.signup.errorRequiredPhone")),
      }),
    [t]
  );

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
    validationSchema: schema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(null);
      try {
        await authApi.signup({
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone,
        });
        const data = await authApi.login({
          email: values.email,
          password: values.password,
        });
        login(data.user, data.token, data.refreshToken);
        router.replace("/(tabs)");
      } catch (err: any) {
        setStatus(err?.message || t("auth.signup.defaultError"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <FormikProvider value={formik}>
            <View style={styles.card}>
              <Text variant="headlineSmall" style={styles.title}>
                {t("auth.signup.title")}
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {t("auth.signup.subtitle")}
              </Text>

              <View style={styles.fieldGroup}>
                <FormikTextInput
                  name="name"
                  label={t("auth.signup.nameLabel")}
                  placeholder={t("auth.signup.namePlaceholder")}
                  mode="outlined"
                  outlineColor={colors.outlineVariant}
                  activeOutlineColor={colors.primary}
                  style={styles.input}
                />
                <FormikTextInput
                  name="email"
                  label={t("auth.signup.emailLabel")}
                  placeholder={t("auth.signup.emailPlaceholder")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  outlineColor={colors.outlineVariant}
                  activeOutlineColor={colors.primary}
                  style={styles.input}
                />
                <FormikTextInput
                  name="password"
                  label={t("auth.signup.passwordLabel")}
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  secure={!showPassword}
                  mode="outlined"
                  outlineColor={colors.outlineVariant}
                  activeOutlineColor={colors.primary}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off-outline" : "eye-outline"}
                      onPress={() => setShowPassword((prev) => !prev)}
                    />
                  }
                />
                <FormikTextInput
                  name="phone"
                  label={t("auth.signup.phoneLabel")}
                  placeholder={t("auth.signup.phonePlaceholder")}
                  keyboardType="phone-pad"
                  mode="outlined"
                  outlineColor={colors.outlineVariant}
                  activeOutlineColor={colors.primary}
                  style={styles.input}
                />
              </View>

              <Pressable
                style={styles.termsRow}
                onPress={() => setAcceptTerms((prev) => !prev)}
              >
                <Checkbox
                  status={acceptTerms ? "checked" : "unchecked"}
                  onPress={() => setAcceptTerms((prev) => !prev)}
                  color={colors.primary}
                  uncheckedColor={colors.outlineVariant}
                />
                <Text style={styles.termsText}>
                  {t("auth.signup.termsLabel")}
                </Text>
              </Pressable>

              {formik.status && (
                <Text style={styles.error} variant="bodySmall">
                  {formik.status}
                </Text>
              )}

              <PrimaryButton
                onPress={() => formik.handleSubmit()}
                loading={formik.isSubmitting}
                disabled={
                  !formik.isValid || formik.isSubmitting || !acceptTerms
                }
                style={styles.primaryButton}
                contentStyle={styles.primaryButtonContent}
              >
                {t("auth.signup.submit")}
              </PrimaryButton>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>
                  {t("auth.signup.divider")}
                </Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialRow}>
                <SocialIcon name="google" color="#DB4437" />
                <SocialIcon name="apple" color={colors.onSurface} />
              </View>

              <View style={styles.footerLinks}>
                <Text style={styles.footerText}>
                  {t("auth.signup.footerText")}
                </Text>
                <Link href="/(auth)/login" style={styles.link}>
                  {t("auth.signup.footerLink")}
                </Link>
              </View>

              <View style={styles.securityNote}>
                <MaterialCommunityIcons name="lock-outline" size={14} color={colors.textMuted} />
                <Text style={styles.securityText}>
                  Tus datos y los de tu perro estan protegidos
                </Text>
              </View>

              <LanguageToggle style={styles.language} />
            </View>
          </FormikProvider>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type SocialIconProps = {
  name: "apple" | "google";
  color: string;
};

const SocialIcon: React.FC<SocialIconProps> = ({ name, color }) => (
  <Pressable style={styles.socialButton} disabled>
    <FontAwesome name={name} size={18} color={color} />
  </Pressable>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  card: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.xl,
    borderRadius: radii.xl,
    gap: spacing.md,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  language: {
    alignSelf: "flex-end",
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
    color: colors.onSurface,
  },
  subtitle: {
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  fieldGroup: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  termsText: {
    color: colors.textSecondary,
    flex: 1,
    fontFamily: fonts.body,
  },
  error: {
    color: colors.error,
    marginTop: -spacing.sm,
  },
  primaryButton: {
    borderRadius: radii.full,
    marginTop: spacing.sm,
  },
  primaryButtonContent: {
    paddingVertical: spacing.sm,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow,
    shadowColor: colors.onSurface,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  footerText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
    fontFamily: fonts.headingMedium,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  securityText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
  },
});

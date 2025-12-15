import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Checkbox, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { FormikTextInput } from "../../src/components/FormikTextInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { PeanutTheme, spacing } from "../../src/theme";
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
        login(data.user, data.token);
        router.replace("/(tabs)");
      } catch (err: any) {
        setStatus(err?.message || t("auth.signup.defaultError"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <LinearGradient colors={["#f7f6ff", "#ffffff"]} style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#8e7bff", "#7c6ff9"]}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.blobLarge}
            pointerEvents="none"
          />
          <View style={styles.blobSmall} pointerEvents="none" />

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
                  outlineColor="#E5E7EB"
                  activeOutlineColor={PeanutTheme.colors.primary}
                  style={styles.input}
                />
                <FormikTextInput
                  name="email"
                  label={t("auth.signup.emailLabel")}
                  placeholder={t("auth.signup.emailPlaceholder")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  outlineColor="#E5E7EB"
                  activeOutlineColor={PeanutTheme.colors.primary}
                  style={styles.input}
                />
                <FormikTextInput
                  name="password"
                  label={t("auth.signup.passwordLabel")}
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  secure={!showPassword}
                  mode="outlined"
                  outlineColor="#E5E7EB"
                  activeOutlineColor={PeanutTheme.colors.primary}
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
                  outlineColor="#E5E7EB"
                  activeOutlineColor={PeanutTheme.colors.primary}
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
                  color={PeanutTheme.colors.primary}
                  uncheckedColor="#CBD5E1"
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
                <SocialIcon name="apple" color="#000000" />
                <SocialIcon name="google" color="#DB4437" />
                <SocialIcon name="facebook" color="#1877F2" />
              </View>

              <View style={styles.footerLinks}>
                <Text style={styles.footerText}>
                  {t("auth.signup.footerText")}
                </Text>
                <Link href="/(auth)/login" style={styles.link}>
                  {t("auth.signup.footerLink")}
                </Link>
              </View>
              <LanguageToggle style={styles.language} />
            </View>
          </FormikProvider>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

type SocialIconProps = {
  name: "apple" | "google" | "facebook";
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
    backgroundColor: PeanutTheme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  blobLarge: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -100,
    right: -90,
    opacity: 0.2,
    transform: [{ rotate: "-12deg" }],
  },
  blobSmall: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#7c6ff9",
    opacity: 0.2,
    top: 70,
    left: 28,
  },
  card: {
    marginHorizontal: spacing.xl,
    backgroundColor: PeanutTheme.colors.surface,
    padding: spacing.xl,
    borderRadius: 24,
    gap: spacing.md,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  language: {
    alignSelf: "flex-end",
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: spacing.sm,
  },
  fieldGroup: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  termsText: {
    color: "#475569",
    flex: 1,
  },
  linkStrong: {
    color: PeanutTheme.colors.primary,
    fontWeight: "700",
  },
  error: {
    color: "#EF4444",
    marginTop: -spacing.sm,
  },
  primaryButton: {
    borderRadius: 24,
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
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    color: "#94A3B8",
    fontSize: 13,
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  footerText: {
    color: "#94A3B8",
  },
  link: {
    color: PeanutTheme.colors.primary,
    fontWeight: "700",
  },
});

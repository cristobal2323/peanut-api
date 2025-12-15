import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { FormikTextInput } from "../../src/components/FormikTextInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { PeanutTheme, spacing } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { authApi } from "../../src/api/auth";
import { LanguageToggle } from "../../src/components/LanguageToggle";
import { useTranslation } from "../../src/i18n";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user, data.token);
      router.replace("/(tabs)");
    },
    onError: () => {},
  });

  const validationSchema = useMemo(
    () =>
      Yup.object({
        email: Yup.string()
          .email(t("auth.login.errorInvalidEmail"))
          .required(t("auth.login.errorRequiredEmail")),
        password: Yup.string().required(t("auth.login.errorRequiredPassword")),
      }),
    [t]
  );

  const formik = useFormik({
    initialValues: { email: "cri.maturana@gmail.com", password: "2da4104a" },
    validationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(null);
      try {
        const data = await mutation.mutateAsync(values);
        login(data.user, data.token);
        router.replace("/(tabs)");
      } catch (err: any) {
        setStatus(err?.message || t("auth.login.defaultError"));
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

          <View style={styles.heroLogo}>
            <Image
              source={require("../../assets/logo-peanut.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <FormikProvider value={formik}>
            <View style={styles.card}>
              <Text variant="headlineSmall" style={styles.title}>
                {t("auth.login.title")}
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {t("auth.login.subtitle")}
              </Text>

              <View style={styles.fieldGroup}>
                <FormikTextInput
                  name="email"
                  label={t("auth.login.emailLabel")}
                  placeholder={t("auth.login.emailPlaceholder")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  outlineColor="#E5E7EB"
                  activeOutlineColor={PeanutTheme.colors.primary}
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldGroup}>
                <FormikTextInput
                  name="password"
                  label={t("auth.login.passwordLabel")}
                  placeholder={t("auth.login.passwordPlaceholder")}
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
                <Link href="/(auth)/recover" style={styles.forgot}>
                  {t("auth.login.forgot")}
                </Link>
              </View>

              {formik.status && (
                <Text style={styles.error} variant="bodySmall">
                  {formik.status}
                </Text>
              )}

              <PrimaryButton
                onPress={() => formik.handleSubmit()}
                loading={formik.isSubmitting}
                disabled={!formik.isValid || formik.isSubmitting}
                style={styles.primaryButton}
                contentStyle={styles.primaryButtonContent}
              >
                {t("auth.login.submit")}
              </PrimaryButton>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>
                  {t("auth.login.divider")}
                </Text>
                <View style={styles.divider} />
              </View>

              {/* <View style={styles.socialRow}>
                <SocialIcon name="apple" color="#000000" />
                <SocialIcon name="google" color="#DB4437" />
                <SocialIcon name="facebook" color="#1877F2" />
              </View> */}

              <View style={styles.footerLinks}>
                <Text style={styles.footerText}>
                  {t("auth.login.footerText")}
                </Text>
                <Link href="/(auth)/signup" style={styles.link}>
                  {t("auth.login.footerLink")}
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
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -90,
    right: -70,
    opacity: 0.2,
    transform: [{ rotate: "-15deg" }],
  },
  blobSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#7c6ff9",
    opacity: 0.2,
    top: 40,
    left: 24,
  },
  heroLogo: {
    alignItems: "center",
    marginBottom: spacing.md,
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
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  forgot: {
    alignSelf: "flex-end",
    color: PeanutTheme.colors.primary,
    fontWeight: "600",
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

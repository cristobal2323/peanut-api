import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { FormikTextInput } from "../../src/components/FormikTextInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { colors, spacing, radii, fonts } from "../../src/theme";
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
        login(data.user, data.token, data.refreshToken);
        router.replace("/(tabs)");
      } catch (err: any) {
        setStatus(err?.message || t("auth.login.defaultError"));
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
          {/* Warm decorative blobs */}
          <LinearGradient
            colors={[colors.primaryContainer, colors.primary]}
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
                  outlineColor={colors.outlineVariant}
                  activeOutlineColor={colors.primary}
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

              <View style={styles.socialRow}>
                <SocialIcon name="google" color="#DB4437" />
                <SocialIcon name="apple" color={colors.onSurface} />
              </View>

              <View style={styles.footerLinks}>
                <Text style={styles.footerText}>
                  {t("auth.login.footerText")}
                </Text>
                <Link href="/(auth)/signup" style={styles.link}>
                  {t("auth.login.footerLink")}
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
  blobLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -90,
    right: -70,
    opacity: 0.15,
    transform: [{ rotate: "-15deg" }],
  },
  blobSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryContainer,
    opacity: 0.15,
    top: 40,
    left: 24,
  },
  heroLogo: {
    alignItems: "center",
    marginBottom: spacing.md,
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
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
    color: colors.onSurface,
  },
  subtitle: {
    textAlign: "center",
    color: colors.textSecondary,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
  },
  forgot: {
    alignSelf: "flex-end",
    color: colors.primary,
    fontWeight: "600",
    fontFamily: fonts.bodySemiBold,
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

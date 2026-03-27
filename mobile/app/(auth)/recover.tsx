import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { FormikTextInput } from "../../src/components/FormikTextInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { colors, spacing, radii, fonts } from "../../src/theme";
import { authApi } from "../../src/api/auth";
import { LanguageToggle } from "../../src/components/LanguageToggle";
import { useTranslation } from "../../src/i18n";

type StatusMessage = { type: "success" | "error"; message: string } | null;

export default function RecoverScreen() {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      Yup.object({
        email: Yup.string()
          .email(t("auth.recover.errorInvalidEmail"))
          .required(t("auth.recover.errorRequiredEmail")),
      }),
    [t]
  );

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: schema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(null);
      try {
        await authApi.recoverPassword(values.email);
        setStatus({
          type: "success",
          message: t("auth.recover.success"),
        } as StatusMessage);
      } catch (err: any) {
        setStatus({
          type: "error",
          message: err?.message || t("auth.recover.error"),
        } as StatusMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const status = formik.status as StatusMessage;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[colors.primaryContainer, colors.primary]}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.blobLarge}
            pointerEvents="none"
          />
          <View style={styles.blobSmall} pointerEvents="none" />

          <FormikProvider value={formik}>
            <View style={styles.card}>
              <Text variant="headlineSmall" style={styles.title}>
                {t("auth.recover.title")}
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {t("auth.recover.subtitle")}
              </Text>

              <View style={styles.fieldGroup}>
                <FormikTextInput
                  name="email"
                  label={t("auth.recover.emailLabel")}
                  placeholder={t("auth.recover.emailPlaceholder")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  outlineColor={colors.outlineVariant}
                  activeOutlineColor={colors.primary}
                  style={styles.input}
                />
              </View>

              {status && (
                <Text
                  style={[
                    styles.status,
                    status.type === "success" ? styles.success : styles.error,
                  ]}
                  variant="bodySmall"
                >
                  {status.message}
                </Text>
              )}

              <PrimaryButton
                onPress={() => formik.handleSubmit()}
                loading={formik.isSubmitting}
                disabled={!formik.isValid || formik.isSubmitting}
                style={styles.primaryButton}
                contentStyle={styles.primaryButtonContent}
              >
                {t("auth.recover.submit")}
              </PrimaryButton>

              <View style={styles.footerLinks}>
                <Text style={styles.footerText}>
                  {t("auth.recover.footerText")}
                </Text>
                <Link href="/(auth)/login" style={styles.link}>
                  {t("auth.recover.footerLink")}
                </Link>
              </View>
              <LanguageToggle style={styles.language} />
            </View>
          </FormikProvider>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

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
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -80,
    right: -70,
    opacity: 0.15,
    transform: [{ rotate: "-12deg" }],
  },
  blobSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryContainer,
    opacity: 0.15,
    top: 60,
    left: 32,
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
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
  },
  status: {
    marginTop: -spacing.sm,
  },
  success: {
    color: colors.tertiary,
  },
  error: {
    color: colors.error,
  },
  primaryButton: {
    borderRadius: radii.full,
    marginTop: spacing.sm,
  },
  primaryButtonContent: {
    paddingVertical: spacing.sm,
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
});

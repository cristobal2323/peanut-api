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
import { PeanutTheme, spacing } from "../../src/theme";
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
                  outlineColor="#E5E7EB"
                  activeOutlineColor={PeanutTheme.colors.primary}
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
    </LinearGradient>
  );
}

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
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -80,
    right: -70,
    opacity: 0.2,
    transform: [{ rotate: "-12deg" }],
  },
  blobSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#7c6ff9",
    opacity: 0.2,
    top: 60,
    left: 32,
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
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  status: {
    marginTop: -spacing.sm,
  },
  success: {
    color: "#16A34A",
  },
  error: {
    color: "#EF4444",
  },
  primaryButton: {
    borderRadius: 24,
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
    color: "#94A3B8",
  },
  link: {
    color: PeanutTheme.colors.primary,
    fontWeight: "700",
  },
});

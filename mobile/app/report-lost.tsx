import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, spacing } from "../src/theme";
import { dogsApi, mapApiDogToDog } from "../src/api/dogs";
import { queryKeys } from "../src/lib/queryClient";
import { useAuthStore } from "../src/store/auth";
import { usePreferencesStore } from "../src/store/preferences";
import { useTranslation } from "../src/i18n";

export default function ReportLostPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const locale = usePreferencesStore((s) => s.locale);
  const { t } = useTranslation();

  const { data: apiDogs = [] } = useQuery({
    queryKey: queryKeys.dogs,
    queryFn: dogsApi.listMine,
    enabled: !!user?.id,
  });

  const dogs = apiDogs.map((d) => mapApiDogToDog(d, locale));

  const chooseDog = (dogId: string) => {
    router.replace({ pathname: "/report-lost/[dogId]", params: { dogId } });
  };

  const goOtherDog = () => {
    router.replace("/found-dog");
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={22} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <MaterialCommunityIcons name="alert-circle" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{t("reportLost.pickerTitle")}</Text>
            <Text style={styles.bannerSub}>{t("reportLost.pickerSubtitle")}</Text>
          </View>
        </View>

        {dogs.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{t("reportLost.myDogsHeader")}</Text>
            {dogs.map((dog) => {
              const isLost = dog.status === "lost";
              return (
                <Pressable
                  key={dog.id}
                  style={[styles.dogCard, isLost && styles.dogCardDisabled]}
                  onPress={() => !isLost && chooseDog(dog.id)}
                  disabled={isLost}
                >
                  {dog.photo ? (
                    <Image source={{ uri: dog.photo }} style={styles.dogAvatar} />
                  ) : (
                    <View style={[styles.dogAvatar, styles.dogAvatarFb]}>
                      <MaterialCommunityIcons
                        name="dog"
                        size={24}
                        color={colors.outlineVariant}
                      />
                    </View>
                  )}
                  <View style={styles.dogInfo}>
                    <Text style={styles.dogName}>{dog.name}</Text>
                    <Text style={styles.dogBreed}>{dog.breed || "—"}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isLost ? styles.statusBadgeLost : styles.statusBadgeSafe,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: isLost ? colors.error : "#fff" },
                      ]}
                    >
                      {isLost ? t("reportLost.alreadyReported") : t("reportLost.safeBadge")}
                    </Text>
                  </View>
                  {!isLost && (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={22}
                      color={colors.textMuted}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyTitle}>{t("reportLost.emptyDogsTitle")}</Text>
            <Text style={styles.emptySub}>{t("reportLost.emptyDogsSubtitle")}</Text>
          </View>
        )}

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t("reportLost.dividerOr")}</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable style={styles.otherCard} onPress={goOtherDog}>
          <View style={styles.otherIcon}>
            <MaterialCommunityIcons
              name="line-scan"
              size={22}
              color={colors.secondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.otherTitle}>{t("reportLost.otherDogTitle")}</Text>
            <Text style={styles.otherSub}>{t("reportLost.otherDogSubtitle")}</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.textMuted}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: "flex-end",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.error,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: "#fff",
  },
  bannerSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },

  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },

  dogCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  dogCardDisabled: {
    opacity: 0.55,
  },
  dogAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  dogAvatarFb: {
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  dogInfo: {
    flex: 1,
  },
  dogName: {
    fontFamily: fonts.headingMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  dogBreed: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  statusBadgeSafe: {
    backgroundColor: colors.tertiary,
  },
  statusBadgeLost: {
    backgroundColor: colors.errorContainer,
  },
  statusBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },

  emptySection: {
    padding: spacing.lg,
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 15,
    color: colors.onSurface,
    textAlign: "center",
  },
  emptySub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  dividerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },

  otherCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radii.lg,
  },
  otherIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(59,130,246,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  otherTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  otherSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});

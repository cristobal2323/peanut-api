import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, colors, radii, fonts } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { useDogsStore } from "../../src/store/dogs";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { LostReport } from "../../src/types";

const SCREEN_W = Dimensions.get("window").width;
const CARD_H = 380;

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const dogs = useDogsStore((state) => state.dogs);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const heroDog = dogs[selectedIdx] ?? dogs[0];
  const hasDogs = dogs.length > 0;

  const { data: lostReports = [] } = useQuery({
    queryKey: queryKeys.lostReports,
    queryFn: api.fetchLostReports,
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ════════════════════════════════════════════
          HERO CARD
         ════════════════════════════════════════════ */}
      <View style={styles.heroCard}>
        {/* Full-bleed dog image */}
        {heroDog?.photo ? (
          <HeroImage uri={heroDog.photo} />
        ) : (
          <View style={styles.heroImgPlaceholder}>
            <MaterialCommunityIcons name="dog" size={80} color={colors.outlineVariant} />
          </View>
        )}

        {/* Bottom gradient for text readability */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.75)"]}
          locations={[0, 0.4, 1]}
          style={styles.heroGradient}
          pointerEvents="none"
        />

        {/* Content overlay */}
        <View style={styles.heroBody}>
          {hasDogs ? (
            <>
              <View style={styles.badgeGreen}>
                <MaterialCommunityIcons name="shield-check" size={12} color="#fff" />
                <Text style={styles.badgeGreenText}>PROTEGIDO</Text>
              </View>
              <Text style={styles.heroHeadline}>{heroDog.name}</Text>
              <Text style={styles.heroParagraph}>
                {heroDog.breed ?? "Tu perro"} · Trufa verificada
              </Text>
              <Link href={`/dog/${heroDog.id}` as any} asChild>
                <Pressable style={styles.heroCta}>
                  <Text style={styles.heroCtaText}>Ver perfil biometrico</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
                </Pressable>
              </Link>
            </>
          ) : (
            <>
              <View style={styles.badgeOrange}>
                <Text style={styles.badgeOrangeText}>NUEVO EN PEANUT</Text>
              </View>
              <Text style={styles.heroHeadline}>Registra a tu{"\n"}perro</Text>
              <Text style={styles.heroParagraph}>
                Crea su perfil y registra su trufa para identificarlo de forma unica y segura.
              </Text>
              <Link href="/dog/new" asChild>
                <Pressable style={styles.heroCta}>
                  <Text style={styles.heroCtaText}>Registrar perro</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
                </Pressable>
              </Link>
            </>
          )}
        </View>
      </View>

      {/* ════════════════════════════════════════════
          DOG SELECTOR (only when >1 dog)
         ════════════════════════════════════════════ */}
      {hasDogs && dogs.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dogChipsWrap}
        >
          {dogs.map((dog, i) => (
            <Pressable
              key={dog.id}
              onPress={() => setSelectedIdx(i)}
              style={[styles.dogChip, i === selectedIdx && styles.dogChipActive]}
            >
              {dog.photo ? (
                <Image source={{ uri: dog.photo }} style={styles.dogChipAvatar} />
              ) : (
                <View style={styles.dogChipAvatarFallback}>
                  <Text style={styles.dogChipInitial}>{dog.name.charAt(0)}</Text>
                </View>
              )}
              <Text style={i === selectedIdx ? styles.dogChipNameActive : styles.dogChipName}>
                {dog.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* ════════════════════════════════════════════
          QUICK ACTIONS
         ════════════════════════════════════════════ */}
      <View style={styles.actions}>
        <ActionItem
          icon="qrcode-scan"
          bg="#2d6482"
          label="Escanear trufa"
          href="/(tabs)/scan"
        />
        <ActionItem
          icon="alert-circle-outline"
          bg="#ba1a1a"
          label="Reportar perdido"
          href={heroDog ? (`/dog/${heroDog.id}` as any) : "/dog/new"}
        />
        <ActionItem
          icon="paw"
          bg="#006d3f"
          label="Encontre un perro"
          href="/(tabs)/feed"
        />
      </View>

      {/* ════════════════════════════════════════════
          COMMUNITY NEARBY
         ════════════════════════════════════════════ */}
      <View style={styles.community}>
        <View style={styles.commHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.commHeading}>Comunidad cerca de ti</Text>
            <Text style={styles.commSub}>Alertas activas en tu zona</Text>
          </View>
          <Link href="/(tabs)/feed">
            <Text style={styles.commSeeAll}>Ver todo</Text>
          </Link>
        </View>

        {lostReports.length === 0 ? (
          <View style={styles.commEmpty}>
            <MaterialCommunityIcons name="map-marker-check-outline" size={32} color={colors.outlineVariant} />
            <Text style={styles.commEmptyText}>Todo tranquilo por aqui</Text>
          </View>
        ) : (
          <View style={styles.commList}>
            {lostReports.slice(0, 3).map((r) => (
              <ReportRow key={r.id} report={r} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/* ── HERO IMAGE with loading state ── */
const HeroImage = ({ uri }: { uri: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={styles.heroImgPlaceholder}>
        <MaterialCommunityIcons name="dog" size={80} color={colors.outlineVariant} />
      </View>
    );
  }

  return (
    <>
      {loading && (
        <View style={styles.heroImgPlaceholder}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <Image
        source={{ uri }}
        style={[styles.heroImg, loading && { position: "absolute", opacity: 0 }]}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </>
  );
};

/* ── ACTION ITEM ── */
const ActionItem = ({
  icon,
  bg,
  label,
  href,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  bg: string;
  label: string;
  href: string;
}) => (
  <Link href={href as any} asChild>
    <Pressable style={styles.actionRow}>
      <View style={[styles.actionCircle, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={icon} size={20} color="#fff" />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outlineVariant} />
    </Pressable>
  </Link>
);

/* ── REPORT ROW ── */
const ReportRow = ({ report }: { report: LostReport }) => {
  const isLost = true;
  return (
    <Link href={`/dog/${report.dogId}` as any} asChild>
      <Pressable style={styles.reportCard}>
        {/* Photo */}
        <View style={styles.reportImgWrap}>
          {report.images?.[0] ? (
            <Image source={{ uri: report.images[0] }} style={styles.reportImg} />
          ) : (
            <View style={[styles.reportImg, styles.reportImgFallback]}>
              <MaterialCommunityIcons name="dog-side" size={30} color={colors.outlineVariant} />
            </View>
          )}
        </View>
        {/* Info */}
        <View style={styles.reportInfo}>
          <View style={styles.reportBadgeRow}>
            <View style={[styles.reportBadge, isLost ? styles.reportBadgeLost : styles.reportBadgeFound]}>
              <View style={[styles.reportDot, { backgroundColor: isLost ? colors.error : colors.tertiary }]} />
              <Text style={[styles.reportBadgeText, { color: isLost ? colors.error : colors.tertiary }]}>
                {isLost ? "PERDIDO" : "ENCONTRADO"}
              </Text>
            </View>
          </View>
          <Text style={styles.reportName}>{report.dogName}</Text>
          <View style={styles.reportMeta}>
            <MaterialCommunityIcons name="map-marker" size={13} color={colors.textMuted} />
            <Text style={styles.reportMetaText} numberOfLines={1}>
              {report.lastSeen.address ?? "Cerca de ti"}
            </Text>
          </View>
          <Text style={styles.reportTime}>
            {formatTimeAgo(report.lastSeen.time ?? new Date().toISOString())}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

const formatTimeAgo = (dateStr: string) => {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const m = Math.max(0, Math.floor((now - d) / 60000));
  if (m < 1) return "Justo ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} horas`;
  return `Hace ${Math.floor(h / 24)} dias`;
};

/* ════════════════════ STYLES ════════════════════ */
const HP = spacing.lg; // horizontal page padding

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40, gap: 24 },

  /* ── Hero ── */
  heroCard: {
    marginHorizontal: HP,
    marginTop: 8,
    height: CARD_H,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: "hidden",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  heroImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroImgPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerHigh,
  },
  heroBody: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingBottom: 24,
    paddingHorizontal: 24,
    gap: 4,
  },
  badgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(62,172,112,0.85)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 4,
  },
  badgeGreenText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.8,
  },
  badgeOrange: {
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 4,
  },
  badgeOrangeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.8,
  },
  heroHeadline: {
    fontFamily: fonts.heading,
    fontSize: 32,
    lineHeight: 38,
    color: "#fff",
  },
  heroParagraph: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  heroCta: {
    alignSelf: "flex-start",
    marginTop: 12,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroCtaText: {
    color: "#fff",
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },

  /* ── Dog chips ── */
  dogChipsWrap: {
    paddingHorizontal: HP,
    gap: 8,
  },
  dogChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 6,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  dogChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFixed,
  },
  dogChipAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  dogChipAvatarFallback: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  dogChipInitial: {
    fontFamily: fonts.headingMedium,
    fontSize: 13,
    color: colors.primary,
  },
  dogChipName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  dogChipNameActive: {
    fontSize: 13,
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
  },

  /* ── Action rows ── */
  actions: {
    paddingHorizontal: HP,
    gap: 10,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onSurface,
  },

  /* ── Community ── */
  community: {
    paddingHorizontal: HP,
    gap: 14,
  },
  commHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commHeading: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.onSurface,
  },
  commSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  commSeeAll: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
  },
  commEmpty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  commEmptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  commList: {
    gap: 10,
  },

  /* ── Report card ── */
  reportCard: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 22,
    padding: 12,
    gap: 12,
    alignItems: "center",
  },
  reportImgWrap: {
    borderRadius: 16,
    overflow: "hidden",
  },
  reportImg: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  reportImgFallback: {
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  reportInfo: {
    flex: 1,
    gap: 2,
  },
  reportBadgeRow: {
    flexDirection: "row",
  },
  reportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  reportBadgeLost: {
    backgroundColor: "rgba(186,26,26,0.10)",
  },
  reportBadgeFound: {
    backgroundColor: "rgba(0,109,63,0.10)",
  },
  reportDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reportBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.6,
  },
  reportName: {
    fontFamily: fonts.headingMedium,
    fontSize: 15,
    color: colors.onSurface,
    marginTop: 1,
  },
  reportMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  reportMetaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  reportTime: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
});

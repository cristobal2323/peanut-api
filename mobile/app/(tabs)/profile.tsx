import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GradientHeader } from "../../src/components/GradientHeader";
import { SectionCard } from "../../src/components/SectionCard";
import { IconCircle } from "../../src/components/IconCircle";
import { StatusBadge } from "../../src/components/StatusBadge";
import { useAuthStore } from "../../src/store/auth";
import { useDogsStore } from "../../src/store/dogs";
import { spacing, colors, fonts, radii } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const dogs = useDogsStore((state) => state.dogs);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: queryKeys.userStats(user?.id ?? "guest"),
    queryFn: () => api.fetchUserStats(user?.id ?? "guest"),
  });

  const handleLogout = () => {
    logout();
    qc.clear();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.screen}>
      <GradientHeader
        title="Mi Perfil"
        subtitle="Gestiona tu cuenta y tus perros"
        right={
          <Link href="/settings" asChild>
            <Pressable style={styles.settingsBtn}>
              <MaterialCommunityIcons name="cog-outline" size={22} color="#ffffff" />
            </Pressable>
          </Link>
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Overlap user card */}
        <View style={styles.body}>
          <View style={styles.userCard}>
            <View style={styles.userRow}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>
                    {(user?.name?.charAt(0) ?? "P").toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user?.name ?? "Invitado"}</Text>
                <Text style={styles.userEmail}>{user?.email ?? "—"}</Text>
              </View>
              <Link href="/profile/edit" asChild>
                <Pressable style={styles.editBtn}>
                  <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
                </Pressable>
              </Link>
            </View>

            <View style={styles.statsRow}>
              <Stat value={stats?.dogs ?? dogs.length} label="Perros" />
              <View style={styles.statDivider} />
              <Pressable onPress={() => router.push("/my-reports")}>
                <Stat value={stats?.reports ?? 0} label="Reportes" />
              </Pressable>
              <View style={styles.statDivider} />
              <Stat value={stats?.helps ?? 0} label="Ayudas" />
            </View>
          </View>

          {/* My dogs */}
          <SectionCard
            title="Mis perros"
            rightLabel="+ Agregar"
            onRightPress={() => router.push("/dog/new")}
          >
            {dogs.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="dog" size={40} color={colors.textMuted} />
                <Text style={styles.emptyText}>No tienes perros registrados</Text>
              </View>
            ) : (
              <View style={{ gap: spacing.sm + 2 }}>
                {dogs.map((dog) => (
                  <Pressable
                    key={dog.id}
                    style={styles.dogRow}
                    onPress={() => router.push({ pathname: "/dog/[id]", params: { id: dog.id } })}
                  >
                    {dog.photo ? (
                      <Image source={{ uri: dog.photo }} style={styles.dogAvatar} />
                    ) : (
                      <View style={[styles.dogAvatar, styles.dogAvatarFb]}>
                        <MaterialCommunityIcons name="dog" size={22} color={colors.outlineVariant} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={styles.dogNameRow}>
                        <Text style={styles.dogName}>{dog.name}</Text>
                        <StatusBadge variant={dog.status === "lost" ? "lost" : "safe"} size="sm" />
                      </View>
                      <Text style={styles.dogBreed}>{dog.breed}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            )}
          </SectionCard>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <QuickAction
              icon="map-marker-radius"
              color={colors.secondary}
              title="Zonas de interés"
              sub="Mapa cercano"
              onPress={() => router.push("/map")}
            />
            <QuickAction
              icon="phone-in-talk"
              color={colors.tertiary}
              title="Contactos"
              sub="Emergencia"
              onPress={() => {}}
            />
            <QuickAction
              icon="help-circle-outline"
              color={colors.accentAmber}
              title="Soporte"
              sub="Ayuda"
              onPress={() => {}}
            />
          </View>

          {/* Logout */}
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={18} color={colors.error} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>

          <Text style={styles.version}>Trufa ID v0.1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={statStyles.col}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  color,
  title,
  sub,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={quickStyles.card} onPress={onPress}>
      <IconCircle icon={icon} color={color} size={44} />
      <Text style={quickStyles.title}>{title}</Text>
      <Text style={quickStyles.sub}>{sub}</Text>
    </Pressable>
  );
}

const statStyles = StyleSheet.create({
  col: {
    flex: 1,
    alignItems: "center",
  },
  value: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.primary,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});

const quickStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.onSurface,
    textAlign: "center",
    marginTop: 4,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },

  // User card
  userCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.primary,
  },
  userName: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.onSurface,
  },
  userEmail: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: colors.outlineVariant,
  },

  // Dogs
  dogRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
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
  dogNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dogName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  dogBreed: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Quick actions
  quickRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    marginTop: spacing.md,
  },
  logoutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
  },
  version: {
    textAlign: "center",
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

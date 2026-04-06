import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Avatar, Button, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../src/store/auth";
import { useDogsStore } from "../../src/store/dogs";
import { spacing, colors, radii, fonts } from "../../src/theme";
import { CardContainer } from "../../src/components/CardContainer";
import { DogAvatar } from "../../src/components/DogAvatar";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const dogs = useDogsStore((state) => state.dogs);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* User profile card */}
      <CardContainer style={styles.profileCard}>
        <View style={styles.header}>
          {user?.avatarUrl ? (
            <Avatar.Image source={{ uri: user.avatarUrl }} size={72} />
          ) : (
            <Avatar.Icon
              icon="account"
              size={72}
              style={{ backgroundColor: colors.primaryFixed }}
              color={colors.primary}
            />
          )}
          <View style={styles.userInfo}>
            <Text variant="titleLarge" style={styles.userName}>{user?.name ?? "Invitado"}</Text>
            <Text style={styles.meta}>{user?.email}</Text>
            {(user?.city || user?.country) && (
              <Text style={styles.meta}>
                {user?.city}, {user?.country}
              </Text>
            )}
          </View>
        </View>
      </CardContainer>

      {/* My dogs */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Mis perros</Text>
        <Pressable onPress={() => router.push("/dog/new")}>
          <Text style={styles.addLink}>Anadir nuevo</Text>
        </Pressable>
      </View>
      {dogs.map((dog) => (
        <Pressable key={dog.id} onPress={() => router.push(`/dog/${dog.id}`)} style={styles.dogRow}>
          <DogAvatar dog={dog} size={48} />
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ color: colors.onSurface }}>{dog.name}</Text>
            <Text style={styles.meta}>{dog.breed} · {dog.age} anos</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
        </Pressable>
      ))}

      {/* Menu items */}
      <View style={styles.menuSection}>
        <MenuItem icon="bell-outline" label="Notificaciones" />
        <MenuItem icon="lock-outline" label="Privacidad" />
        <MenuItem icon="map-marker-outline" label="Permisos de Ubicacion" />
        <MenuItem icon="help-circle-outline" label="Ayuda y Soporte" />
        <MenuItem icon="file-document-outline" label="Terminos y Condiciones" />
      </View>

      <Button
        mode="outlined"
        textColor={colors.error}
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        Cerrar sesion
      </Button>

      <Text style={styles.version}>Peanut v2.4.0</Text>
    </ScrollView>
  );
}

const MenuItem = ({ icon, label }: { icon: string; label: string }) => (
  <Pressable style={styles.menuItem}>
    <MaterialCommunityIcons name={icon as any} size={22} color={colors.textSecondary} />
    <Text style={styles.menuLabel}>{label}</Text>
    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  profileCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontFamily: fonts.headingMedium,
  },
  addLink: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  dogRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  menuSection: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuLabel: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  logoutButton: {
    marginTop: spacing.xl,
    borderRadius: radii.full,
    borderColor: colors.error,
  },
  version: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.md,
    fontFamily: fonts.body,
  },
});

import React from "react";
import { View, StyleSheet } from "react-native";
import { Avatar, Button, List, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../src/store/auth";
import { spacing, PeanutTheme } from "../../src/theme";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {user?.avatarUrl ? (
          <Avatar.Image source={{ uri: user.avatarUrl }} size={72} />
        ) : (
          <Avatar.Icon icon="account" size={72} />
        )}
        <View>
          <Text variant="titleLarge">{user?.name ?? "Invitado"}</Text>
          <Text style={styles.meta}>{user?.email}</Text>
          <Text style={styles.meta}>
            {user?.city}, {user?.country}
          </Text>
        </View>
      </View>
      <List.Section>
        <List.Item title="Mis perros" left={(props) => <List.Icon {...props} icon="dog" />} />
        <List.Item
          title="Alertas y seguridad"
          left={(props) => <List.Icon {...props} icon="shield-account" />}
        />
        <List.Item
          title="Centro de ayuda"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
        />
      </List.Section>
      <Button mode="outlined" textColor={PeanutTheme.colors.error} onPress={handleLogout}>
        Cerrar sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  meta: {
    color: PeanutTheme.colors.tertiary
  }
});

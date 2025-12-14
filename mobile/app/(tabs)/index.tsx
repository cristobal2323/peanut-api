import React from "react";
import { View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Text, Chip } from "react-native-paper";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { CardContainer } from "../../src/components/CardContainer";
import { spacing, PeanutTheme } from "../../src/theme";
import { useAuthStore } from "../../src/store/auth";
import { useDogsStore } from "../../src/store/dogs";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const dogs = useDogsStore((state) => state.dogs);
  const hasLostDog = dogs.some((d) => d.status === "lost");

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.greeting}>
        Hola {user?.name ?? "amigo"} 👋
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Encuentra, registra y protege a tus perros con IA.
      </Text>

      <CardContainer>
        <View style={styles.actions}>
          <Link asChild href="/(tabs)/scan">
            <PrimaryButton style={styles.fullWidth}>Escanear perro</PrimaryButton>
          </Link>
          <Link asChild href="/dog/new">
            <PrimaryButton variant="secondary" style={styles.fullWidth}>
              Registrar perro
            </PrimaryButton>
          </Link>
          {hasLostDog && (
            <Chip icon="alert" style={styles.chip} textStyle={{ color: "white" }}>
              Modo perdido activo
            </Chip>
          )}
          <Link asChild href="/(tabs)/feed">
            <PrimaryButton mode="outlined" style={styles.fullWidth}>
              Ver reportes cercanos
            </PrimaryButton>
          </Link>
        </View>
      </CardContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl
  },
  greeting: {
    marginBottom: spacing.xs
  },
  subtitle: {
    color: PeanutTheme.colors.tertiary,
    marginBottom: spacing.lg
  },
  actions: {
    gap: spacing.md,
    padding: spacing.lg
  },
  fullWidth: {
    width: "100%"
  },
  chip: {
    backgroundColor: PeanutTheme.colors.error,
    alignSelf: "flex-start"
  }
});

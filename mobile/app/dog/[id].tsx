import React from "react";
import { ScrollView, StyleSheet, View, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CardContainer } from "../../src/components/CardContainer";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { DogAvatar } from "../../src/components/DogAvatar";
import { EmptyState } from "../../src/components/EmptyState";
import { spacing, colors, radii, fonts } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { Dog } from "../../src/types";

export default function DogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: dog, isLoading } = useQuery({
    queryKey: queryKeys.dog(id),
    queryFn: () => api.fetchDog(id),
  });

  const { data: sightings = [] } = useQuery({
    queryKey: queryKeys.sightings(id),
    queryFn: () => api.fetchSightings(id),
  });

  const toggleLostMutation = useMutation({
    mutationFn: (status: Dog["status"]) => api.toggleLostMode(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dog(id) });
    },
  });

  if (isLoading || !dog) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: colors.textMuted }}>Cargando perro...</Text>
      </View>
    );
  }

  const isLost = dog.status === "lost";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CardContainer>
        <View style={styles.header}>
          <DogAvatar dog={dog} size={86} />
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={{ color: colors.onSurface }}>{dog.name}</Text>
            <Text style={styles.meta}>{dog.breed}</Text>
            <View style={[styles.statusChip, { backgroundColor: isLost ? "rgba(186, 26, 26, 0.12)" : "rgba(62, 172, 112, 0.12)" }]}>
              <MaterialCommunityIcons
                name={isLost ? "alert" : "shield-check"}
                size={14}
                color={isLost ? colors.error : colors.tertiary}
              />
              <Text style={{ color: isLost ? colors.error : colors.tertiary, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>
                {isLost ? "Perdido" : "Seguro"}
              </Text>
            </View>
            <View style={styles.badges}>
              <Chip icon="calendar" style={styles.chip} textStyle={styles.chipText}>Edad: {dog.age ?? "N/A"}</Chip>
              <Chip icon="gender-male-female" style={styles.chip} textStyle={styles.chipText}>{dog.sex}</Chip>
              <Chip icon="ruler" style={styles.chip} textStyle={styles.chipText}>{dog.size}</Chip>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <PrimaryButton
            variant={isLost ? "secondary" : "danger"}
            gradient={!isLost}
            onPress={() => toggleLostMutation.mutate(isLost ? "normal" : "lost")}
            loading={toggleLostMutation.isPending}
          >
            {isLost ? "Desactivar modo perdido" : "Reportar como perdido"}
          </PrimaryButton>
          <View style={styles.actionsRow}>
            <PrimaryButton mode="outlined" gradient={false} style={{ flex: 1 }}>Editar</PrimaryButton>
            <PrimaryButton mode="outlined" gradient={false} variant="secondary" style={{ flex: 1 }}>
              Coincidencias
            </PrimaryButton>
          </View>
        </View>
      </CardContainer>

      {isLost ? (
        <CardContainer style={styles.lostCard}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Zona de busqueda
          </Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: dog.lastSeen?.latitude ?? 37.78825,
              longitude: dog.lastSeen?.longitude ?? -122.4324,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {dog.lastSeen && (
              <Marker
                coordinate={dog.lastSeen}
                title="Ultima vez visto"
                pinColor={colors.primary}
              />
            )}
          </MapView>
          <View style={styles.qrRow}>
            {dog.photo && <Image source={{ uri: dog.photo }} style={styles.dogPhoto} />}
            <Image
              source={{
                uri:
                  dog.nosePhoto ??
                  "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Peanut",
              }}
              style={styles.qr}
            />
            <PrimaryButton style={{ flex: 1 }} mode="outlined" gradient={false}>
              Compartir alerta
            </PrimaryButton>
          </View>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Avistamientos
          </Text>
          {sightings.length === 0 ? (
            <EmptyState icon="map-marker-question" message="Sin avistamientos aun" />
          ) : (
            sightings.map((sighting) => (
              <View key={sighting.id} style={styles.sighting}>
                <Text variant="bodyLarge" style={{ color: colors.onSurface }}>{sighting.comment}</Text>
                <Text style={styles.meta}>{sighting.seenAt}</Text>
              </View>
            ))
          )}
        </CardContainer>
      ) : (
        <CardContainer style={styles.safeCard}>
          <MaterialCommunityIcons name="shield-check" size={32} color={colors.tertiary} />
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Tu perro esta seguro
          </Text>
          <Text style={styles.meta}>Trufa ID verificada y activa.</Text>
        </CardContainer>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceContainerLow,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  actionButtons: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  lostCard: {
    padding: spacing.lg,
  },
  safeCard: {
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: colors.onSurface,
    fontFamily: fonts.headingMedium,
  },
  map: {
    height: 200,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
  },
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  qr: {
    width: 120,
    height: 120,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerHigh,
  },
  dogPhoto: {
    width: 90,
    height: 90,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerHigh,
  },
  sighting: {
    paddingVertical: spacing.sm,
    gap: 2,
    borderBottomWidth: 0,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
});

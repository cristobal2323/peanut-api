import React from "react";
import { ScrollView, StyleSheet, View, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Text, Chip } from "react-native-paper";
import { CardContainer } from "../../src/components/CardContainer";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { DogAvatar } from "../../src/components/DogAvatar";
import { EmptyState } from "../../src/components/EmptyState";
import { spacing, PeanutTheme } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { Dog } from "../../src/types";

export default function DogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: dog, isLoading } = useQuery({
    queryKey: queryKeys.dog(id),
    queryFn: () => api.fetchDog(id)
  });

  const { data: sightings = [] } = useQuery({
    queryKey: queryKeys.sightings(id),
    queryFn: () => api.fetchSightings(id)
  });

  const toggleLostMutation = useMutation({
    mutationFn: (status: Dog["status"]) => api.toggleLostMode(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dog(id) });
    }
  });

  if (isLoading || !dog) {
    return (
      <View style={styles.loading}>
        <Text>Cargando perro...</Text>
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
            <Text variant="headlineSmall">{dog.name}</Text>
            <Text style={styles.meta}>{dog.breed}</Text>
            <Chip
              style={styles.status}
              icon={isLost ? "alert" : "check"}
              textStyle={{ color: "white" }}
            >
              {isLost ? "Perdido" : "Normal"}
            </Chip>
            <View style={styles.badges}>
              <Chip icon="calendar">Edad: {dog.age ?? "N/A"}</Chip>
              <Chip icon="gender-male-female">{dog.sex}</Chip>
              <Chip icon="ruler">{dog.size}</Chip>
            </View>
          </View>
        </View>
        <PrimaryButton
          variant={isLost ? "secondary" : "danger"}
          onPress={() => toggleLostMutation.mutate(isLost ? "normal" : "lost")}
          loading={toggleLostMutation.isPending}
        >
          {isLost ? "Desactivar modo perdido" : "Activar modo perdido"}
        </PrimaryButton>
        <View style={styles.actionsRow}>
          <PrimaryButton mode="outlined">Editar perro</PrimaryButton>
          <PrimaryButton mode="outlined" variant="secondary">
            Ver coincidencias
          </PrimaryButton>
        </View>
      </CardContainer>

      {isLost ? (
        <CardContainer>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Modo perdido
          </Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: dog.lastSeen?.latitude ?? 37.78825,
              longitude: dog.lastSeen?.longitude ?? -122.4324,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            }}
          >
            {dog.lastSeen && (
              <Marker
                coordinate={dog.lastSeen}
                title="Última vez visto"
                pinColor={PeanutTheme.colors.primary}
              />
            )}
          </MapView>
          <View style={styles.qrRow}>
            {dog.photo && <Image source={{ uri: dog.photo }} style={styles.dogPhoto} />}
            <Image
              source={{
                uri:
                  dog.nosePhoto ??
                  "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Peanut"
              }}
              style={styles.qr}
            />
            <PrimaryButton style={{ flex: 1 }} mode="outlined">
              Compartir alerta
            </PrimaryButton>
          </View>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Avistamientos
          </Text>
          {sightings.length === 0 ? (
            <EmptyState icon="map-marker-question" message="Sin avistamientos aún" />
          ) : (
            sightings.map((sighting) => (
              <View key={sighting.id} style={styles.sighting}>
                <Text variant="bodyLarge">{sighting.comment}</Text>
                <Text style={styles.meta}>{sighting.seenAt}</Text>
              </View>
            ))
          )}
        </CardContainer>
      ) : (
        <CardContainer>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Estado
          </Text>
          <Text style={styles.meta}>Tu perro está seguro.</Text>
        </CardContainer>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.md
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  meta: {
    color: PeanutTheme.colors.tertiary
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  status: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: PeanutTheme.colors.primary
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  sectionTitle: {
    marginBottom: spacing.sm
  },
  map: {
    height: 200,
    borderRadius: 18,
    marginBottom: spacing.md
  },
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md
  },
  qr: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: PeanutTheme.colors.surfaceVariant
  },
  dogPhoto: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: PeanutTheme.colors.surfaceVariant
  },
  sighting: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PeanutTheme.colors.outline
  }
});

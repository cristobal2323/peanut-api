import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Text, SegmentedButtons } from "react-native-paper";
import { CardContainer } from "../../src/components/CardContainer";
import { DogAvatar } from "../../src/components/DogAvatar";
import { EmptyState } from "../../src/components/EmptyState";
import { spacing, colors, radii, fonts } from "../../src/theme";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { LostReport } from "../../src/types";

export default function FeedScreen() {
  const [distance, setDistance] = useState<string>("5");
  const { data: reports = [], isLoading } = useQuery({
    queryKey: queryKeys.lostReports,
    queryFn: api.fetchLostReports,
  });

  const filtered = reports.filter(() => true);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Perros perdidos cerca
      </Text>

      <SegmentedButtons
        style={styles.filters}
        value={distance}
        onValueChange={setDistance}
        buttons={[
          { value: "5", label: "5 km" },
          { value: "10", label: "10 km" },
          { value: "25", label: "25 km" },
        ]}
      />

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {filtered.map((report) => (
          <Marker
            key={report.id}
            coordinate={report.lastSeen}
            title={report.dogName}
            description={report.description}
            pinColor={colors.primary}
          />
        ))}
      </MapView>

      {isLoading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : filtered.length === 0 ? (
        <EmptyState icon="map-marker-off" message="No hay reportes cercanos" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReportCard report={item} />}
          style={styles.list}
        />
      )}
    </View>
  );
}

const ReportCard = ({ report }: { report: LostReport }) => (
  <Link href={`/dog/${report.dogId}`} asChild>
    <CardContainer>
      <View style={styles.cardContent}>
        <DogAvatar
          dog={{ name: report.dogName, photo: report.images?.[0], status: "lost" }}
        />
        <View style={styles.cardText}>
          <Text variant="titleMedium" style={{ color: colors.onSurface }}>{report.dogName}</Text>
          <Text variant="bodyMedium" style={styles.meta}>
            Ultima vez: {report.lastSeen.address ?? "Cerca de ti"}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            {report.description}
          </Text>
          <Link href="/report-sighting" style={styles.sightingLink}>
            Reportar avistamiento
          </Link>
        </View>
      </View>
    </CardContainer>
  </Link>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
    color: colors.onSurface,
    fontFamily: fonts.heading,
  },
  filters: {
    marginBottom: spacing.sm,
  },
  map: {
    height: 220,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
  },
  list: {
    marginTop: spacing.sm,
  },
  loading: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  sightingLink: {
    color: colors.secondary,
    fontFamily: fonts.bodySemiBold,
    marginTop: 4,
  },
});

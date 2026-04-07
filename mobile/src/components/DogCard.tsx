import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ViewStyle,
  ImageSourcePropType,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, spacing, radii, ambientShadow } from "../theme";
import { StatusBadge, StatusVariant } from "./StatusBadge";

type Props = {
  photo?: string;
  name: string;
  breed?: string;
  description?: string;
  status?: StatusVariant;
  distanceKm?: number;
  date?: string;
  location?: string;
  onPress?: () => void;
  variant?: "default" | "compact";
  imageHeight?: number;
  style?: ViewStyle;
};

export function DogCard({
  photo,
  name,
  breed,
  description,
  status,
  distanceKm,
  date,
  location,
  onPress,
  variant = "default",
  imageHeight = 220,
  style,
}: Props) {
  const Wrapper: any = onPress ? Pressable : View;
  const isCompact = variant === "compact";

  return (
    <Wrapper
      onPress={onPress}
      style={[styles.card, isCompact && styles.cardCompact, style]}
    >
      <View style={styles.imageWrap}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={[styles.image, { height: isCompact ? 140 : imageHeight }]}
          />
        ) : (
          <View
            style={[
              styles.image,
              styles.imagePlaceholder,
              { height: isCompact ? 140 : imageHeight },
            ]}
          >
            <MaterialCommunityIcons
              name="dog"
              size={48}
              color={colors.outlineVariant}
            />
          </View>
        )}

        {status && (
          <StatusBadge
            variant={status}
            size={isCompact ? "sm" : "md"}
            style={styles.statusBadge}
          />
        )}

        {distanceKm != null && (
          <View style={styles.distanceBadge}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#ffffff"
            />
            <Text style={styles.distanceText}>{distanceKm} km</Text>
          </View>
        )}
      </View>

      <View style={[styles.info, isCompact && styles.infoCompact]}>
        <Text style={[styles.name, isCompact && styles.nameCompact]}>
          {name}
        </Text>
        {breed && <Text style={styles.breed}>{breed}</Text>}
        {description && !isCompact && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        {(date || location) && (
          <View style={styles.metaRow}>
            {date && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.metaText}>{date}</Text>
              </View>
            )}
            {location && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...ambientShadow,
  },
  cardCompact: {
    width: 260,
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    backgroundColor: colors.surfaceContainerHigh,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
  },
  distanceBadge: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(3,2,19,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: "#ffffff",
  },
  info: {
    padding: spacing.md,
  },
  infoCompact: {
    padding: spacing.sm + 2,
  },
  name: {
    fontSize: 18,
    fontFamily: fonts.heading,
    color: colors.onSurface,
  },
  nameCompact: {
    fontSize: 15,
  },
  breed: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm + 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  metaText: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
});

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PeanutTheme, spacing } from "../theme";

type Props = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  message: string;
};

export const EmptyState: React.FC<Props> = ({ icon, message }) => (
  <View style={styles.container}>
    <MaterialCommunityIcons
      name={icon}
      size={48}
      color={PeanutTheme.colors.primary}
    />
    <Text variant="bodyLarge" style={styles.message}>
      {message}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm
  },
  message: {
    textAlign: "center",
    color: PeanutTheme.colors.tertiary
  }
});

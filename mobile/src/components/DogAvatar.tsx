import React from "react";
import { View, StyleSheet } from "react-native";
import { Avatar, Badge } from "react-native-paper";
import { Dog } from "../types";
import { PeanutTheme } from "../theme";

type Props = {
  dog: Pick<Dog, "name" | "photo" | "status">;
  size?: number;
};

export const DogAvatar: React.FC<Props> = ({ dog, size = 56 }) => {
  const initials = dog.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      {dog.photo ? (
        <Avatar.Image size={size} source={{ uri: dog.photo }} />
      ) : (
        <Avatar.Text size={size} label={initials} />
      )}
      {dog.status === "lost" && (
        <Badge
          style={styles.badge}
          size={18}
          theme={{ colors: { secondary: PeanutTheme.colors.error } }}
        >
          !
        </Badge>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative"
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4
  }
});

import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { List, Text, Badge, Divider } from "react-native-paper";
import { api } from "../../src/api/mockApi";
import { queryKeys } from "../../src/lib/queryClient";
import { AppNotification } from "../../src/types";
import { EmptyState } from "../../src/components/EmptyState";
import { spacing, PeanutTheme } from "../../src/theme";

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.fetchNotifications
  });

  const mutation = useMutation({
    mutationFn: api.markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
  });

  const renderIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "match":
        return "paw";
      case "sighting":
        return "map-marker";
      default:
        return "information";
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Notificaciones
      </Text>
      {notifications.length === 0 ? (
        <EmptyState icon="bell-outline" message="Sin alertas nuevas" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.title}
              description={item.message}
              onPress={() => mutation.mutate(item.id)}
              left={(props) => <List.Icon {...props} icon={renderIcon(item.type)} />}
              right={() =>
                !item.read ? <Badge style={styles.badge}>•</Badge> : null
              }
            />
          )}
          ItemSeparatorComponent={() => <Divider />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl
  },
  title: {
    marginBottom: spacing.md
  },
  badge: {
    alignSelf: "center",
    backgroundColor: PeanutTheme.colors.primary,
    color: "white"
  }
});

import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useAuthStore } from "../store/auth";
import { usePreferencesStore } from "../store/preferences";
import { http } from "../api/http";
import { queryClient, queryKeys } from "../lib/queryClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const locale = usePreferencesStore((s) => s.locale);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (registeredRef.current) return;

    let mounted = true;

    (async () => {
      if (!Device.isDevice) return;

      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") return;
      if (!mounted) return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      if (!mounted) return;

      registeredRef.current = true;

      await http("/notifications/push-token", {
        method: "POST",
        body: JSON.stringify({
          token: pushToken.data,
          platform: Platform.OS,
          locale,
        }),
      }).catch(() => {});

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, locale]);

  useEffect(() => {
    const responseSub =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data ?? {};
        handleNotificationNavigation(data as Record<string, unknown>, router);
      });

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    });

    return () => {
      responseSub.remove();
      receivedSub.remove();
    };
  }, [router]);
}

function handleNotificationNavigation(
  data: Record<string, unknown>,
  router: ReturnType<typeof useRouter>
) {
  const type = data?.type as string;
  switch (type) {
    case "NEW_SIGHTING":
    case "LOST_REPORT_UPDATED":
      if (data.lostReportId) {
        router.push({
          pathname: "/report/[id]",
          params: { id: data.lostReportId as string },
        });
      }
      break;
    default:
      router.push("/(tabs)/notifications");
  }
}

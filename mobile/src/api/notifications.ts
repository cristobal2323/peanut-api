import { http } from "./http";
import type { AppNotification, NotificationKind } from "../types";

type NotificationApi = {
  id: string;
  userId: string;
  type: "SCAN_MATCH" | "NEW_SIGHTING" | "LOST_REPORT_UPDATED" | "SYSTEM";
  payload: Record<string, string>;
  read: boolean;
  createdAt: string;
};

type PaginatedResponse = {
  items: NotificationApi[];
  nextCursor: number | null;
};

const typeMap: Record<NotificationApi["type"], NotificationKind> = {
  SCAN_MATCH: "match",
  NEW_SIGHTING: "sighting",
  LOST_REPORT_UPDATED: "system",
  SYSTEM: "system",
};

function mapNotification(n: NotificationApi): AppNotification {
  return {
    id: n.id,
    title: n.payload?.title ?? "",
    message: n.payload?.body ?? "",
    createdAt: n.createdAt,
    read: n.read,
    type: typeMap[n.type] ?? "system",
    data: n.payload,
  };
}

export const notificationsApi = {
  listPaginated: (params: { skip?: number; take?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.skip != null) qs.set("skip", String(params.skip));
    if (params.take != null) qs.set("take", String(params.take));
    const q = qs.toString();
    return http<PaginatedResponse>(
      `/notifications/mine${q ? `?${q}` : ""}`
    ).then((res) => ({
      items: res.items.map(mapNotification),
      nextCursor: res.nextCursor,
    }));
  },

  list: async (): Promise<AppNotification[]> => {
    const res = await http<PaginatedResponse>("/notifications/mine?take=100");
    return res.items.map(mapNotification);
  },

  markRead: (ids: string[]) =>
    http("/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({ notificationIds: ids }),
    }),

  markAllRead: () =>
    http("/notifications/mark-all-read", { method: "POST" }),

  getUnreadCount: () =>
    http<{ count: number }>("/notifications/unread-count"),

  getSettings: () =>
    http<{
      pushEnabled: boolean;
      emailEnabled: boolean;
      smsEnabled: boolean;
      lostAlertsRadiusKm: number;
    }>("/notifications/settings"),

  updateSettings: (data: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    lostAlertsRadiusKm?: number;
  }) =>
    http("/notifications/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

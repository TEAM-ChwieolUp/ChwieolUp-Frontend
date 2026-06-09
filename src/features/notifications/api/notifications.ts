import { api } from '@/lib/api';
import type { ApiSuccessResponse } from '@/lib/api';

type NotificationReadValue = boolean | null | undefined;

interface NotificationResponse {
  id: number;
  title?: string | null;
  message?: string | null;
  content?: string | null;
  notificationType?: string | null;
  type?: string | null;
  isRead?: NotificationReadValue;
  read?: NotificationReadValue;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface NotificationListEnvelope {
  notifications?: NotificationResponse[];
  items?: NotificationResponse[];
  content?: NotificationResponse[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  createdAt: string | null;
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
};

function unwrapNotificationList(
  response: ApiSuccessResponse<NotificationResponse[] | NotificationListEnvelope>,
) {
  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.notifications ?? payload.items ?? payload.content ?? [];
}

function mapNotification(notification: NotificationResponse): NotificationItem {
  const message = notification.message ?? notification.content ?? '';

  return {
    id: String(notification.id),
    title: notification.title ?? message,
    message,
    type: notification.notificationType ?? notification.type ?? null,
    read: notification.isRead ?? notification.read ?? false,
    createdAt: notification.createdAt ?? notification.updatedAt ?? null,
  };
}

export async function listNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<
    ApiSuccessResponse<NotificationResponse[] | NotificationListEnvelope>
  >('/api/notifications');

  return unwrapNotificationList(response).map(mapNotification);
}

export async function markNotificationAsRead(notificationId: string) {
  await api.patch(`/api/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead() {
  await api.patch('/api/notifications/read-all');
}

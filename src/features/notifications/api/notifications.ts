import { api } from '@/lib/api';
import type { ApiSuccessResponse, QueryParams } from '@/lib/api';

type NotificationReadValue = boolean | null | undefined;

interface NotificationResponse {
  id: number;
  sourceType?: string | null;
  sourceId?: number | null;
  remindType?: string | null;
  title?: string | null;
  message?: string | null;
  content?: string | null;
  notificationType?: string | null;
  type?: string | null;
  isRead?: NotificationReadValue;
  read?: NotificationReadValue;
  scheduledAt?: string | null;
  readAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface NotificationListEnvelope {
  notifications?: NotificationResponse[];
  items?: NotificationResponse[];
  content?: NotificationResponse[];
  nextCursor?: number | null;
}

export interface NotificationItem {
  id: string;
  sourceType: string | null;
  sourceId: string | null;
  remindType: string | null;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  readAt: string | null;
  scheduledAt: string | null;
  createdAt: string | null;
}

export interface ListNotificationsParams extends QueryParams {
  unreadOnly?: boolean;
  limit?: number;
  cursor?: number;
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: ListNotificationsParams) => ['notifications', 'list', params ?? {}] as const,
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
  const readAt = notification.readAt ?? null;

  return {
    id: String(notification.id),
    sourceType: notification.sourceType ?? null,
    sourceId:
      notification.sourceId === undefined || notification.sourceId === null
        ? null
        : String(notification.sourceId),
    remindType: notification.remindType ?? null,
    title: notification.title ?? message,
    message,
    type: notification.sourceType ?? notification.notificationType ?? notification.type ?? null,
    read: notification.isRead ?? notification.read ?? Boolean(readAt),
    readAt,
    scheduledAt: notification.scheduledAt ?? null,
    createdAt:
      notification.createdAt ??
      notification.scheduledAt ??
      notification.updatedAt ??
      null,
  };
}

export async function listNotifications(
  params?: ListNotificationsParams
): Promise<NotificationItem[]> {
  const response = await api.get<
    ApiSuccessResponse<NotificationResponse[] | NotificationListEnvelope>
  >('/api/notifications', { params });

  return unwrapNotificationList(response).map(mapNotification);
}

export async function markNotificationAsRead(notificationId: string) {
  await api.patch(`/api/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead() {
  await api.patch('/api/notifications/read-all');
}

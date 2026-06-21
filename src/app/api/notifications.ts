import { httpClient } from "./httpClient";
import type {
  NotificationResponse,
  SaveNotificationRequest,
  SpringPage,
  SpringPageRequest,
} from "./types";

/**
 * 알림(Notification) 도메인 API
 *
 * 백엔드 라우트
 *   GET    /api/v2/notifications                   - 내 알림 목록
 *   POST   /api/v2/notifications                   - 알림 생성 (관리자)
 *   PATCH  /api/v2/notifications/{id}/read         - 단건 읽음 처리
 *   PATCH  /api/v2/notifications/read-all          - 전체 읽음 처리
 *   DELETE /api/v2/notifications/{id}              - 알림 삭제
 */

export function findNotifications(params: SpringPageRequest = {}) {
  const { page = 0, size = 20, sort = "notificationId,desc" } = params;
  return httpClient.get<SpringPage<NotificationResponse>>("/api/v2/notifications", {
    query: { page, size, sort },
  });
}

export function markAsRead(id: number) {
  return httpClient.patch<void>(`/api/v2/notifications/${id}/read`);
}

export function markAllAsRead() {
  return httpClient.patch<void>("/api/v2/notifications/read-all");
}

export function deleteNotification(id: number) {
  return httpClient.delete<void>(`/api/v2/notifications/${id}`);
}

export function saveNotification(payload: SaveNotificationRequest) {
  return httpClient.post<void>("/api/v2/notifications", payload);
}

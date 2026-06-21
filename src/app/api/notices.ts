import { httpClient } from "./httpClient";
import type {
  FindNoticeDetailResponse,
  FindNoticeRequest,
  FindNoticeResponse,
  SaveNoticeRequest,
  SpringPage,
  SpringPageRequest,
  UpdateNoticeRequest,
} from "./types";

/**
 * 게시글(Notice) 도메인 API
 *
 * 백엔드 라우트
 *   GET    /api/v2/notice                - 페이지 조회 (category, keyword + Pageable)
 *   GET    /api/v2/notice/{id}           - 게시글 상세 (likeCount 포함)
 *   POST   /api/v2/notice                - 작성 (인증 필요)
 *   PUT    /api/v2/notice/{id}           - 수정
 *   DELETE /api/v2/notice/{id}           - 삭제
 *   POST   /api/v2/notice/{id}/like      - 좋아요 (인증 필요)
 *   DELETE /api/v2/notice/{id}/like      - 좋아요 취소 (인증 필요)
 */

export interface FindNoticesParams extends FindNoticeRequest, SpringPageRequest {}

export function findNotices(params: FindNoticesParams = {}) {
  const { category, keyword, page, size, sort } = params;
  return httpClient.get<SpringPage<FindNoticeResponse>>("/api/v2/notice", {
    auth: false,
    query: { category, keyword, page, size, sort },
  });
}

export function findNoticeDetail(id: number) {
  return httpClient.get<FindNoticeDetailResponse>(`/api/v2/notice/${id}`, {
    auth: false,
  });
}

export function saveNotice(payload: SaveNoticeRequest) {
  return httpClient.post<void>("/api/v2/notice", payload);
}

export function updateNotice(id: number, payload: UpdateNoticeRequest) {
  return httpClient.put<void>(`/api/v2/notice/${id}`, payload);
}

export function deleteNotice(id: number) {
  return httpClient.delete<void>(`/api/v2/notice/${id}`);
}

export function likeNotice(id: number) {
  return httpClient.post<void>(`/api/v2/notice/${id}/like`);
}

export function unlikeNotice(id: number) {
  return httpClient.delete<void>(`/api/v2/notice/${id}/like`);
}

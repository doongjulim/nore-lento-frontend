import { httpClient } from "./httpClient";
import type {
  ReviewEligibilityResponse,
  ReviewResponse,
  SaveReviewRequest,
  SpringPage,
  SpringPageRequest,
  UpdateReviewRequest,
} from "./types";

/**
 * 리뷰(Review) 도메인 API
 *
 * 백엔드 라우트
 *   GET    /api/v2/products/{productId}/reviews     - 상품 리뷰 목록
 *   POST   /api/v2/reviews                          - 리뷰 작성
 *   PUT    /api/v2/reviews/{id}                     - 리뷰 수정
 *   DELETE /api/v2/reviews/{id}                     - 리뷰 삭제
 *   GET    /api/v2/reviews/eligibility/{productId}  - 리뷰 작성 가능 여부
 */

export function findReviews(productId: number, params: SpringPageRequest = {}) {
  const { page = 0, size = 10, sort = "reviewId,desc" } = params;
  return httpClient.get<SpringPage<ReviewResponse>>(
    `/api/v2/products/${productId}/reviews`,
    { auth: false, query: { page, size, sort } },
  );
}

export function saveReview(payload: SaveReviewRequest) {
  return httpClient.post<void>("/api/v2/reviews", payload);
}

export function updateReview(id: number, payload: UpdateReviewRequest) {
  return httpClient.put<void>(`/api/v2/reviews/${id}`, payload);
}

export function deleteReview(id: number) {
  return httpClient.delete<void>(`/api/v2/reviews/${id}`);
}

export function checkReviewEligibility(productId: number) {
  return httpClient.get<ReviewEligibilityResponse>(
    `/api/v2/reviews/eligibility/${productId}`,
  );
}

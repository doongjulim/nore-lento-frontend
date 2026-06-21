import { httpClient } from "./httpClient";
import type {
  CouponResponse,
  PointHistoryResponse,
  PointResponse,
  SpringPage,
  SpringPageRequest,
} from "./types";

/**
 * 포인트/쿠폰 도메인 API
 *
 * 백엔드 라우트
 *   GET /api/v2/point             - 내 포인트 잔액
 *   GET /api/v2/point/history     - 포인트 사용 내역
 *   GET /api/v2/coupons/my        - 내 쿠폰 목록
 */

export function findMyPoint() {
  return httpClient.get<PointResponse>("/api/v2/point");
}

export function findPointHistory(params: SpringPageRequest = {}) {
  const { page = 0, size = 20, sort = "historyId,desc" } = params;
  return httpClient.get<SpringPage<PointHistoryResponse>>("/api/v2/point/history", {
    query: { page, size, sort },
  });
}

export function findMyCoupons() {
  return httpClient.get<CouponResponse[]>("/api/v2/coupons/my");
}

import { httpClient } from "./httpClient";
import type {
  MyCouponResponse,
  PointHistoryResponse,
  PointResponse,
  SpringPage,
  SpringPageRequest,
} from "./types";

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
  return httpClient.get<MyCouponResponse[]>("/api/v2/coupons/mine");
}

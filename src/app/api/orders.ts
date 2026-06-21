import { httpClient } from "./httpClient";
import type {
  FindOrderDetailResponse,
  OrderResponse,
  SaveOrderRequest,
  SpringPage,
  SpringPageRequest,
} from "./types";

/**
 * 주문(Order) 도메인 API
 *
 * 백엔드 라우트
 *   GET    /api/v2/orders            - 내 주문 목록 (페이지네이션)
 *   GET    /api/v2/orders/{id}       - 주문 상세
 *   POST   /api/v2/orders            - 주문 생성
 *   POST   /api/v2/orders/cart       - 장바구니 전체 주문
 *   PATCH  /api/v2/orders/{id}/status - 주문 상태 변경 (관리자)
 *   DELETE /api/v2/orders/{id}       - 주문 취소
 */

export function findOrders(params: SpringPageRequest = {}) {
  const { page = 0, size = 10, sort = "orderId,desc" } = params;
  return httpClient.get<SpringPage<OrderResponse>>("/api/v2/orders", {
    query: { page, size, sort },
  });
}

export function findOrderDetail(id: number) {
  return httpClient.get<FindOrderDetailResponse>(`/api/v2/orders/${id}`);
}

export function saveOrder(payload: SaveOrderRequest) {
  return httpClient.post<void>("/api/v2/orders", payload);
}

export function orderFromCart() {
  return httpClient.post<void>("/api/v2/orders/cart");
}

export function cancelOrder(id: number) {
  return httpClient.delete<void>(`/api/v2/orders/${id}`);
}

import { httpClient } from "./httpClient";
import type {
  FindPaymentResponse,
  PaymentResponse,
  PayOrderRequest,
  SpringPage,
  SpringPageRequest,
} from "./types";

/**
 * 결제(Payment) 도메인 API
 *
 * 백엔드 라우트
 *   POST   /api/v2/payments/{orderId}      - 결제 처리
 *   GET    /api/v2/payments                - 내 결제 목록
 *   GET    /api/v2/payments/{id}           - 결제 상세
 *   DELETE /api/v2/payments/{id}/refund    - 환불
 */

export function payOrder(orderId: number, payload: PayOrderRequest) {
  return httpClient.post<void>(`/api/v2/payments/${orderId}`, payload);
}

export function findPayments(params: SpringPageRequest = {}) {
  const { page = 0, size = 10, sort = "paymentId,desc" } = params;
  return httpClient.get<SpringPage<PaymentResponse>>("/api/v2/payments", {
    query: { page, size, sort },
  });
}

export function findPaymentDetail(id: number) {
  return httpClient.get<FindPaymentResponse>(`/api/v2/payments/${id}`);
}

export function refundPayment(id: number) {
  return httpClient.delete<void>(`/api/v2/payments/${id}/refund`);
}

import { httpClient } from "./httpClient";
import type {
  AddCartItemRequest,
  FindCartResponse,
  UpdateCartItemRequest,
} from "./types";

/**
 * 장바구니(Cart) 도메인 API – 모두 인증 필요.
 *
 * 백엔드 라우트
 *   GET    /api/v2/cart                       - 내 장바구니 조회
 *   POST   /api/v2/cart/items                 - 장바구니에 상품 추가
 *   PUT    /api/v2/cart/items/{cartItemId}    - 수량 변경
 *   DELETE /api/v2/cart/items?ids=1&ids=2     - 일부 항목 삭제
 *   DELETE /api/v2/cart                       - 전체 비우기
 */

export function findCart() {
  return httpClient.get<FindCartResponse>("/api/v2/cart");
}

export function addCartItem(payload: AddCartItemRequest) {
  return httpClient.post<void>("/api/v2/cart/items", payload);
}

export function updateCartItem(cartItemId: number, payload: UpdateCartItemRequest) {
  return httpClient.put<void>(`/api/v2/cart/items/${cartItemId}`, payload);
}

export function removeCartItems(ids: number[]) {
  return httpClient.delete<void>("/api/v2/cart/items", {
    query: { ids },
  });
}

export function clearCart() {
  return httpClient.delete<void>("/api/v2/cart");
}

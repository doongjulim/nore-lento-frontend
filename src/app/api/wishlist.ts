import { httpClient } from "./httpClient";
import type { WishlistResponse } from "./types";

/**
 * 위시리스트(Wishlist) 도메인 API
 *
 * 백엔드 라우트
 *   GET    /api/v2/wishlists             - 내 위시리스트 조회
 *   POST   /api/v2/wishlists/{productId} - 위시리스트 추가
 *   DELETE /api/v2/wishlists/{productId} - 위시리스트 제거
 */

export function findWishlists() {
  return httpClient.get<WishlistResponse[]>("/api/v2/wishlists");
}

export function addWishlist(productId: number) {
  return httpClient.post<void>(`/api/v2/wishlists/${productId}`);
}

export function removeWishlist(productId: number) {
  return httpClient.delete<void>(`/api/v2/wishlists/${productId}`);
}

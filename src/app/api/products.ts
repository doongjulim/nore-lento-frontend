import { httpClient } from "./httpClient";
import type {
  FindProductDetailResponse,
  FindProductRequest,
  FindProductResponse,
  SaveProductRequest,
  SpringPage,
  SpringPageRequest,
  UpdateProductRequest,
} from "./types";

/**
 * 상품(Product) 도메인 API
 *
 * 백엔드 라우트
 *   GET    /api/v2/product            - 페이지 조회 (category, keyword + Pageable)
 *   GET    /api/v2/product/{id}       - 상품 상세
 *   POST   /api/v2/product            - 상품 등록 (인증 필요, 판매자=현재 로그인)
 *   PUT    /api/v2/product/{id}       - 상품 수정
 *   DELETE /api/v2/product/{id}       - 상품 삭제
 */

export interface FindProductsParams extends FindProductRequest, SpringPageRequest {}

export function findProducts(params: FindProductsParams = {}) {
  const { category, keyword, page, size, sort } = params;
  return httpClient.get<SpringPage<FindProductResponse>>("/api/v2/product", {
    auth: false,
    query: { category, keyword, page, size, sort },
  });
}

export function findProductDetail(id: number) {
  return httpClient.get<FindProductDetailResponse>(`/api/v2/product/${id}`, {
    auth: false,
  });
}

export function saveProduct(payload: SaveProductRequest) {
  return httpClient.post<void>("/api/v2/product", payload);
}

export function updateProduct(id: number, payload: UpdateProductRequest) {
  return httpClient.put<void>(`/api/v2/product/${id}`, payload);
}

export function deleteProduct(id: number) {
  return httpClient.delete<void>(`/api/v2/product/${id}`);
}

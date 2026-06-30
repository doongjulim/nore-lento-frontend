/**
 * nore-lento-backend 호출용 API 레이어 배럴 export.
 *
 * 사용 예
 *   import { authApi, productApi, ApiError } from "@/app/api";
 *   await authApi.login({ username: "u", password: "p" });
 *   const products = await productApi.findProducts({ page: 0, size: 20 });
 */

export * as authApi from "./auth";
export * as userApi from "./users";
export * as productApi from "./products";
export * as noticeApi from "./notices";
export * as cartApi from "./cart";
export * as orderApi from "./orders";
export * as paymentApi from "./payments";
export * as reviewApi from "./reviews";
export * as notificationApi from "./notifications";
export * as wishlistApi from "./wishlist";
export * as pointApi from "./points";
export * as couponApi from "./coupons";
export * as shippingAddressApi from "./shippingAddresses";

export {
  httpClient,
  request,
  ApiError,
  setOnUnauthorized,
} from "./httpClient";
export type { HttpMethod, RequestOptions, QueryValue } from "./httpClient";

export { tokenStorage } from "./tokenStorage";

export type {
  // 공통
  SpringPage,
  SpringPageRequest,
  // Enums
  Role,
  Grade,
  ProductCategory,
  NoticeCategory,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  DeliveryStatus,
  PointHistoryType,
  // Auth
  LoginRequest,
  LoginResponse,
  // User
  FindUserResponse,
  FindUserDetailResponse,
  SaveUserRequest,
  UpdateUserRequest,
  // Product
  FindProductRequest,
  FindProductResponse,
  FindProductDetailResponse,
  SaveProductRequest,
  UpdateProductRequest,
  // Notice
  FindNoticeRequest,
  FindNoticeResponse,
  FindNoticeDetailResponse,
  SaveNoticeRequest,
  UpdateNoticeRequest,
  // Cart
  CartItemResponse,
  FindCartResponse,
  AddCartItemRequest,
  UpdateCartItemRequest,
  // Order
  OrderItemResponse,
  OrderResponse,
  DeliveryResponse,
  FindOrderDetailResponse,
  SaveOrderRequest,
  // Payment
  PayOrderRequest,
  PaymentResponse,
  FindPaymentResponse,
  // Review
  ReviewResponse,
  SaveReviewRequest,
  UpdateReviewRequest,
  ReviewEligibilityResponse,
  // Notification
  NotificationResponse,
  SaveNotificationRequest,
  // Wishlist
  WishlistResponse,
  // Point / Coupon
  PointResponse,
  PointHistoryResponse,
  CouponResponse,
  MyCouponResponse,
  IssueCouponRequest,
  UpdateCouponRequest,
  DiscountType,
  // ShippingAddress
  ShippingAddressResponse,
  SaveShippingAddressRequest,
  UpdateShippingAddressRequest,
} from "./types";

/**
 * 백엔드 DTO 와 1:1로 대응되는 API 타입 정의.
 *
 * 프론트 도메인 모델(`src/app/types.ts`)과는 분리해서, 응답 형태가 그대로 보이게 둡니다.
 * 매핑이 필요할 경우 각 도메인 모듈에서 어댑터 함수를 작성하세요.
 */

// ───── 공통 ─────

export interface SpringPageRequest {
  page?: number;        // 0부터 시작
  size?: number;        // 기본 10
  sort?: string;        // 예: "id,desc"
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // 현재 페이지 인덱스 (0-base)
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable?: unknown;
  sort?: unknown;
}

// ───── Auth ─────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// ───── Enums (백엔드 enum name과 동일한 string literal) ─────

export type Role = "USER" | "ADMIN" | "MASTER";
export type Grade = "NORMAL" | "VIP" | "VVIP";
export type ProductCategory = "FOOD" | "CLOTHING" | "ELECTRONICS";
export type NoticeCategory = "NOTICE" | "QA" | "FREE";

// ───── User ─────

export interface FindUserResponse {
  id: number;
  username: string;
  name: string;
  role: Role;
  grade: Grade;
}

export interface FindUserDetailResponse extends FindUserResponse {
  createAt: string;
  createBy: string;
  updateAt: string;
  updateBy: string;
}

export interface SaveUserRequest {
  username: string;
  password: string;
  name: string;
}

export interface UpdateUserRequest {
  username: string;
  name: string;
  role: Role;
  grade: Grade;
}

// ───── Product ─────

export interface FindProductRequest {
  category?: ProductCategory;
  keyword?: string;
}

export interface FindProductResponse {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  sellerName: string;
  createAt: string;
}

export interface FindProductDetailResponse {
  id: number;
  name: string;
  price: number;
  description: string;
  category: ProductCategory;
  createAt: string;
  createBy: string;
  updateAt: string;
  updateBy: string;
}

export interface SaveProductRequest {
  name: string;
  price: number;
  description?: string;
  category: ProductCategory;
}

export interface UpdateProductRequest extends SaveProductRequest {}

// ───── Notice ─────

export interface FindNoticeRequest {
  category?: NoticeCategory;
  keyword?: string;
}

export interface FindNoticeResponse {
  id: number;
  title: string;
  content: string;
  category: NoticeCategory;
  name: string;        // 작성자 이름
  createAt: string;
}

export interface FindNoticeDetailResponse {
  id: number;
  title: string;
  content: string;
  category: NoticeCategory;
  likeCount: number;
  createAt: string;
  createBy: string;
  updateAt: string;
  updateBy: string;
}

export interface SaveNoticeRequest {
  title: string;
  content: string;
  category: NoticeCategory;
}

export interface UpdateNoticeRequest extends SaveNoticeRequest {}

// ───── Cart ─────

export interface CartItemResponse {
  cartItemId: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface FindCartResponse {
  cartId: number | null;
  items: CartItemResponse[];
  totalAmount: number;
}

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ───── Enums (추가) ─────

export type OrderStatus = "PENDING" | "PAID" | "SHIPPING" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "VIRTUAL_ACCOUNT";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type DeliveryStatus = "PREPARING" | "SHIPPED" | "DELIVERED" | "RETURNED";
export type PointHistoryType = "EARN" | "USE" | "EXPIRE" | "REFUND";

// ───── Order ─────

export interface OrderItemResponse {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  priceSnapshot: number;
  totalPrice: number;
}

export interface OrderResponse {
  orderId: number;
  status: OrderStatus;
  totalPrice: number;
  itemCount: number;
  createAt: string;
}

export interface DeliveryResponse {
  deliveryId: number;
  address: string;
  trackingNumber: string | null;
  status: DeliveryStatus;
}

export interface FindOrderDetailResponse {
  orderId: number;
  status: OrderStatus;
  totalPrice: number;
  createAt: string;
  items: OrderItemResponse[];
  delivery: DeliveryResponse | null;
}

export interface SaveOrderRequest {
  items: { productId: number; quantity: number }[];
  deliveryAddress: string;
}

// ───── Payment ─────

export interface PayOrderRequest {
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  paymentId: number;
  orderId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  createAt: string;
}

export interface FindPaymentResponse extends PaymentResponse {}

// ───── Review ─────

export interface ReviewResponse {
  reviewId: number;
  userId: number;
  userName: string;
  productId: number;
  content: string;
  rating: number;
  createAt: string;
}

export interface SaveReviewRequest {
  productId: number;
  content: string;
  rating: number;
}

export interface UpdateReviewRequest {
  content: string;
  rating: number;
}

export interface ReviewEligibilityResponse {
  eligible: boolean;
  reason: string | null;
}

// ───── Notification ─────

export interface NotificationResponse {
  notificationId: number;
  title: string;
  content: string;
  isRead: boolean;
  createAt: string;
}

export interface SaveNotificationRequest {
  userId: number;
  title: string;
  content: string;
}

// ───── Wishlist ─────

export interface WishlistResponse {
  wishlistId: number;
  productId: number;
  productName: string;
  productPrice: number;
  productCategory: ProductCategory;
  createAt: string;
}

// ───── Point ─────

export interface PointResponse {
  point: number;
}

export interface PointHistoryResponse {
  historyId: number;
  type: PointHistoryType;
  amount: number;
  description: string;
  createAt: string;
}

// ───── Coupon ─────

export type DiscountType = "FIXED" | "RATE";

/** 어드민용 쿠폰 목록 응답 (GET /api/v2/coupons) */
export interface CouponResponse {
  id: number;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  expiresAt: string | null;
}

/** 내 쿠폰 응답 (GET /api/v2/coupons/mine) */
export interface MyCouponResponse {
  id: number;
  couponId: number;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  expiresAt: string | null;
  isUsed: boolean;
}

export interface IssueCouponRequest {
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  expiresAt?: string;
}

export interface UpdateCouponRequest {
  name?: string;
  discountValue?: number;
  minOrderAmount?: number;
  expiresAt?: string;
}

// ───── ShippingAddress ─────

export interface ShippingAddressResponse {
  id: number;
  recipientName: string;
  phone: string;
  address: string;
  detailAddress: string | null;
  zipCode: string;
  isDefault: boolean;
}

export interface SaveShippingAddressRequest {
  recipientName: string;
  phone: string;
  address: string;
  detailAddress?: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UpdateShippingAddressRequest {
  recipientName: string;
  phone: string;
  address: string;
  detailAddress?: string;
  zipCode: string;
}

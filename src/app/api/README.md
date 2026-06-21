# API Layer

`nore-lento-backend` 호출용 fetch 기반 API 모듈.

## 구조

```
src/app/api/
├── README.md          이 문서
├── index.ts           배럴 export
├── httpClient.ts      fetch 래퍼 (JWT 자동 부착, 에러 통일)
├── tokenStorage.ts    JWT localStorage 저장소
├── types.ts           백엔드 DTO 와 1:1 대응 타입
├── auth.ts            POST /api/v2/login, logout
├── users.ts           /api/v2/user(s)
├── products.ts        /api/v2/product
├── notices.ts         /api/v2/notice (+ like)
└── cart.ts            /api/v2/cart
```

## 환경변수

`.env` 또는 `.env.local`

```
VITE_API_BASE_URL=http://127.0.0.1:8080
```

백엔드 SecurityConfig 의 CORS 허용 origin 이 `http://localhost:5173` 이므로,
프론트는 그 포트로 띄워야 합니다 (Vite 기본).

## 사용 예시

### 로그인 / 로그아웃

```ts
import { authApi, ApiError } from "@/app/api";

try {
  await authApi.login({ username: "dj", password: "pw" });
  // 토큰은 localStorage 에 자동 저장 → 이후 요청에 Bearer 헤더 자동 부착
} catch (e) {
  if (e instanceof ApiError && e.status === 401) {
    alert("아이디 또는 비밀번호가 잘못되었습니다.");
  }
}

authApi.logout(); // 토큰 삭제
```

### 게시글 페이지 조회

```ts
import { noticeApi } from "@/app/api";

const page = await noticeApi.findNotices({
  category: "NOTICE",
  keyword: "공지",
  page: 0,
  size: 10,
  sort: "id,desc",
});
console.log(page.content, page.totalPages);
```

### 게시글 좋아요 토글

```ts
import { noticeApi } from "@/app/api";

await noticeApi.likeNotice(42);
await noticeApi.unlikeNotice(42);
```

### 장바구니

```ts
import { cartApi } from "@/app/api";

await cartApi.addCartItem({ productId: 1, quantity: 2 });
const cart = await cartApi.findCart();
await cartApi.updateCartItem(cart.items[0].cartItemId, { quantity: 3 });
await cartApi.removeCartItems([cart.items[0].cartItemId]);
await cartApi.clearCart();
```

### 401 핸들링 훅

라우터에서 자동으로 로그인 페이지로 이동시키고 싶다면:

```ts
import { setOnUnauthorized } from "@/app/api";
import { router } from "@/app/routes";

setOnUnauthorized(() => router.navigate("/login"));
```

## 백엔드 라우트 한눈에

| Method | Path                              | 인증 | 함수                              |
|--------|-----------------------------------|------|-----------------------------------|
| POST   | /api/v2/login                     | -    | `authApi.login`                   |
| GET    | /api/v2/user                      | -    | `userApi.findUsers`               |
| GET    | /api/v2/user/{id}                 | ✓    | `userApi.findUserDetail`          |
| POST   | /api/v2/user                      | -    | `userApi.saveUser` (회원가입)     |
| PUT    | /api/v2/user/{id}                 | ✓    | `userApi.updateUser`              |
| DELETE | /api/v2/users/{id}                | ✓    | `userApi.deleteUser`              |
| GET    | /api/v2/product                   | -    | `productApi.findProducts`         |
| GET    | /api/v2/product/{id}              | -    | `productApi.findProductDetail`    |
| POST   | /api/v2/product                   | ✓    | `productApi.saveProduct`          |
| PUT    | /api/v2/product/{id}              | ✓    | `productApi.updateProduct`        |
| DELETE | /api/v2/product/{id}              | ✓    | `productApi.deleteProduct`        |
| GET    | /api/v2/notice                    | -    | `noticeApi.findNotices`           |
| GET    | /api/v2/notice/{id}               | -    | `noticeApi.findNoticeDetail`      |
| POST   | /api/v2/notice                    | ✓    | `noticeApi.saveNotice`            |
| PUT    | /api/v2/notice/{id}               | ✓    | `noticeApi.updateNotice`          |
| DELETE | /api/v2/notice/{id}               | ✓    | `noticeApi.deleteNotice`          |
| POST   | /api/v2/notice/{id}/like          | ✓    | `noticeApi.likeNotice`            |
| DELETE | /api/v2/notice/{id}/like          | ✓    | `noticeApi.unlikeNotice`          |
| GET    | /api/v2/cart                      | ✓    | `cartApi.findCart`                |
| POST   | /api/v2/cart/items                | ✓    | `cartApi.addCartItem`             |
| PUT    | /api/v2/cart/items/{cartItemId}   | ✓    | `cartApi.updateCartItem`          |
| DELETE | /api/v2/cart/items?ids=…          | ✓    | `cartApi.removeCartItems`         |
| DELETE | /api/v2/cart                      | ✓    | `cartApi.clearCart`               |

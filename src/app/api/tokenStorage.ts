/**
 * JWT 토큰 저장소 (localStorage 기반)
 *
 * - 백엔드 SecurityConfig가 Authorization 헤더의 "Bearer <token>" 으로 인증
 * - 로그인 응답: { token: string }
 */

const ACCESS_TOKEN_KEY = "nore-lento.accessToken";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  set(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.get();
  },
};

import { httpClient } from "./httpClient";
import { tokenStorage } from "./tokenStorage";
import type { LoginRequest, LoginResponse } from "./types";

/**
 * 로그인. 성공 시 토큰을 localStorage 에 자동 저장.
 *
 * 백엔드: POST /api/v2/login  (SecurityConfig.AUTHENTICATION_URL)
 *   요청 본문: { username, password }
 *   응답:   { token }
 */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await httpClient.post<LoginResponse>("/api/v2/login", payload, {
    auth: false,
  });
  if (res?.token) {
    tokenStorage.set(res.token);
  }
  return res;
}

/** 토큰 제거. (백엔드에 별도 logout 엔드포인트는 없음) */
export function logout(): void {
  tokenStorage.clear();
}

/** 토큰 존재 여부로 판단하는 간단한 인증 상태. */
export function isAuthenticated(): boolean {
  return tokenStorage.isAuthenticated();
}

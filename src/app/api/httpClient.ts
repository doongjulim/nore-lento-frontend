import { API_BASE_URL } from "../config/api";
import { tokenStorage } from "./tokenStorage";

/**
 * 백엔드(Spring Boot) 호출용 fetch 래퍼
 *
 * - 기본 베이스 URL: VITE_API_BASE_URL
 * - JWT 토큰이 있으면 Authorization: Bearer <token> 자동 부착
 * - 응답이 JSON이면 파싱, 204/빈 본문이면 undefined 반환
 * - 비-2xx 응답은 ApiError 로 throw
 * - 401(Unauthorized) 시 토큰을 자동으로 비움 (옵션으로 끌 수 있음)
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

export interface RequestOptions {
  /** URL 쿼리스트링으로 직렬화될 객체 */
  query?: Record<string, QueryValue>;
  /** 요청 본문. 객체면 자동으로 JSON.stringify */
  body?: unknown;
  /** 추가 헤더 */
  headers?: Record<string, string>;
  /** 인증 헤더 부착 여부 (기본: true) */
  auth?: boolean;
  /** 요청 취소용 시그널 */
  signal?: AbortSignal;
  /** raw fetch 옵션 오버라이드 */
  fetchOptions?: RequestInit;
}

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data: unknown;

  constructor(status: number, statusText: string, data: unknown, message?: string) {
    super(message ?? `API ${status} ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/** 401 발생 시 추가로 부를 수 있는 훅 (예: 라우터에서 로그인 페이지로 보내기) */
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

function buildQueryString(query?: Record<string, QueryValue>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      // Spring 의 List<Long> 바인딩은 ?ids=1&ids=2 형식과 ?ids=1,2 둘 다 받음.
      // RemoveCartItemController 처럼 @RequestParam List<Long> ids 인 경우에도
      // 같은 키 반복이 가장 안전.
      for (const v of value) params.append(key, String(v));
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = (API_BASE_URL ?? "").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}${buildQueryString(query)}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  // 본문이 비어있는 경우 처리
  const text = await response.text();
  if (!text) return undefined;
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

export async function request<T = unknown>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, body, headers, auth = true, signal, fetchOptions } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers ?? {}),
  };

  let finalBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (
      typeof FormData !== "undefined" && body instanceof FormData
    ) {
      finalBody = body;
      // FormData 일 땐 Content-Type 을 fetch 가 직접 정함
    } else if (typeof body === "string") {
      finalBody = body;
      if (!finalHeaders["Content-Type"]) {
        finalHeaders["Content-Type"] = "text/plain;charset=UTF-8";
      }
    } else {
      finalBody = JSON.stringify(body);
      if (!finalHeaders["Content-Type"]) {
        finalHeaders["Content-Type"] = "application/json";
      }
    }
  }

  if (auth) {
    const token = tokenStorage.get();
    if (token && !finalHeaders["Authorization"]) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: finalHeaders,
    body: finalBody,
    signal,
    credentials: "include", // 백엔드 CORS 가 allowCredentials=true
    ...(fetchOptions ?? {}),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      tokenStorage.clear();
      if (onUnauthorized) onUnauthorized();
    }
    const message =
      (typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: unknown }).message ?? "")
        : "") || `${response.status} ${response.statusText}`;
    throw new ApiError(response.status, response.statusText, data, message);
  }

  return data as T;
}

export const httpClient = {
  get: <T = unknown>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("GET", path, options),
  post: <T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) =>
    request<T>("POST", path, { ...options, body }),
  put: <T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) =>
    request<T>("PUT", path, { ...options, body }),
  patch: <T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T = unknown>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("DELETE", path, options),
};

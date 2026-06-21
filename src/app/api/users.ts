import { httpClient } from "./httpClient";
import type {
  FindUserDetailResponse,
  FindUserResponse,
  SaveUserRequest,
  UpdateUserRequest,
} from "./types";

/**
 * 사용자(User) 도메인 API
 *
 * 백엔드 라우트
 *   GET    /api/v2/user           - 전체 사용자 목록
 *   GET    /api/v2/user/{id}      - 사용자 상세
 *   POST   /api/v2/user           - 회원가입
 *   PUT    /api/v2/user/{id}      - 사용자 수정 (role/grade 포함)
 *   DELETE /api/v2/users/{id}     - 사용자 삭제 (※ 경로가 'users' 복수형)
 */

/** 전체 사용자 목록 (백엔드 SecurityConfig 의 skip path 에 포함되어 인증 없이 호출 가능) */
export function findUsers() {
  return httpClient.get<FindUserResponse[]>("/api/v2/user", { auth: false });
}

export function findUserDetail(id: number) {
  return httpClient.get<FindUserDetailResponse>(`/api/v2/user/${id}`);
}

/** 회원가입. 인증 불필요. */
export function saveUser(payload: SaveUserRequest) {
  return httpClient.post<void>("/api/v2/user", payload, { auth: false });
}

export function updateUser(id: number, payload: UpdateUserRequest) {
  return httpClient.put<void>(`/api/v2/user/${id}`, payload);
}

/** 백엔드 매핑이 /api/v2/users/{id} (복수형) 로 되어 있음에 주의. */
export function deleteUser(id: number) {
  return httpClient.delete<void>(`/api/v2/users/${id}`);
}

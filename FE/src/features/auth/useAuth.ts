import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, api, setAccessToken } from "../../api/client";

/**
 * 간이 인증 상태.
 *
 * 정교한 인증이 목적이 아닙니다 — **로그인/로그아웃 구분**과 아바타·국가 배지 표시만
 * 하면 됩니다 (docs/design-spec.md §3). 토큰은 만료가 없고 localStorage 에 둡니다.
 */
export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isPending } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe(),
    // 비로그인이면 401 이 오는 게 정상이므로 재시도하지 않고 조용히 넘어갑니다.
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = useMutation({
    mutationFn: (userId: number) => api.login(userId),
    onSuccess: (result) => {
      setAccessToken(result.accessToken);
      // 로그인하면 좋아요·구독·신청 상태가 달라지므로 전부 다시 받아옵니다.
      void queryClient.invalidateQueries();
    },
  });

  const logout = () => {
    setAccessToken(null);
    void queryClient.invalidateQueries();
  };

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isPending,
    login,
    logout,
  };
}

/** 401 인지 판별. 쓰기 실패 시 "로그인이 필요합니다"로 안내하기 위해 씁니다. */
export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

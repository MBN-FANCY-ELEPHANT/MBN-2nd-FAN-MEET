import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../api/client";
import BottomSheet from "../../components/ui/BottomSheet";
import styles from "./LoginSheet.module.css";
import { useAuth } from "./useAuth";

/**
 * 데모 계정 원클릭 로그인.
 *
 * 회원가입·비밀번호 폼이 없습니다 — 이번 해커톤은 정교한 인증이 목적이 아닙니다
 * (docs/design-spec.md §3). 계정마다 국가가 다르게 시드돼 있어서, 어떤 계정으로
 * 로그인하느냐에 따라 내 댓글의 국가 배지가 달라집니다.
 */
export default function LoginSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { login } = useAuth();

  const { data: users } = useQuery({
    queryKey: ["demo-users"],
    queryFn: () => api.getDemoUsers(),
    staleTime: Infinity,
  });

  return (
    <BottomSheet title={t("auth.selectDemoUser")} onClose={onClose}>
      <p className={styles.hint}>{t("auth.demoHint")}</p>
      <div className={styles.list}>
        {users?.map((user) => (
          <button
            key={user.id}
            className={styles.user}
            onClick={() => {
              login.mutate(user.id);
              onClose();
            }}
          >
            <img className={styles.avatar} src={user.profileImageUrl} alt="" />
            <span>
              <span className={styles.name}>{user.nickname}</span>
              <span className={styles.country}>{user.country}</span>
            </span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

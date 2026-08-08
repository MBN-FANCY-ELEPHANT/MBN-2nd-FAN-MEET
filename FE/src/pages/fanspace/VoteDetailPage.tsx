import { useState } from "react";
import { useTranslation } from "react-i18next";

import voteBanner from "../../assets/example/example_banner_fanSpace.png";
import HeaderBack from "../../components/layout/HeaderBack";
import Icon from "../../components/ui/Icon";
import { useToast } from "../../components/ui/useToast";
import {
  CURRENT_VOTE,
  getVotedCandidateId,
  saveVote,
} from "../../data/vote";
import styles from "./VoteDetailPage.module.css";

/**
 * 팬공간 배너 → 투표 상세 (Figma 27:6676 미선택 / 27:6705 선택).
 *
 * 화면은 세 상태를 오갑니다.
 *  1. **미선택** — 라디오 전부 회색, 「투표하기」 비활성(회색)
 *  2. **선택** — 고른 항목만 주황, 「투표하기」 활성(주황)
 *  3. **투표 완료** — 배지가 "투표 완료"로 바뀌고 득표율이 열립니다 (Figma 에 없는 상태)
 *
 * ⚠️ **서버로 아무것도 보내지 않습니다.** BE 에 투표 도메인이 없어 선택은 이 기기의
 *    localStorage 에만 남고, 득표율은 시연용 고정값입니다 (`data/vote.ts`).
 *    "투표가 진행된 것처럼" 보여주기 위한 화면이지 실제 집계가 아닙니다.
 *
 * ⚠️ 배너와 **같은 이미지**를 씁니다 — 배너를 눌러 들어온 화면이라 그림이 바뀌면
 *    다른 곳으로 온 것처럼 보입니다.
 */
export default function VoteDetailPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [votedId, setVotedId] = useState<string | null>(getVotedCandidateId);
  const [picked, setPicked] = useState<string | null>(null);

  const done = votedId !== null;
  // 투표를 마쳤으면 저장된 선택이, 아직이면 방금 고른 항목이 강조됩니다.
  const selected = done ? votedId : picked;

  function submit() {
    if (!picked) return;
    saveVote(picked);
    setVotedId(picked);
    toast("success", t("vote.doneToast"));
  }

  return (
    <div className={styles.page}>
      <HeaderBack />

      <img className={styles.hero} src={voteBanner} alt="" aria-hidden />

      <div className={styles.body}>
        <span className={`${styles.badge} ${done ? styles.badgeDone : ""}`}>
          {t(done ? "vote.stateDone" : "vote.stateOpen")}
        </span>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{CURRENT_VOTE.title}</h1>
          <span className={styles.deadline}>
            {formatDeadline(CURRENT_VOTE.deadline)}
          </span>
        </div>

        <p className={styles.lead}>
          {t(done ? "vote.leadDone" : "vote.lead")}
        </p>

        <ul className={styles.options}>
          {CURRENT_VOTE.candidates.map((candidate) => {
            const active = selected === candidate.id;
            return (
              <li key={candidate.id}>
                <button
                  type="button"
                  className={`${styles.option} ${active ? styles.optionActive : ""}`}
                  // 투표를 마치면 바꿀 수 없습니다 — "투표 후 취소는 불가합니다".
                  disabled={done}
                  aria-pressed={active}
                  onClick={() => setPicked(candidate.id)}
                >
                  <Icon
                    name={active ? "radioOn" : "radioOff"}
                    size={24}
                    className={styles.radio}
                  />
                  <span className={styles.optionName}>{candidate.name}</span>
                  {done && (
                    <span className={styles.share}>{candidate.share}%</span>
                  )}
                </button>
                {done && (
                  <span className={styles.bar} aria-hidden>
                    <span
                      className={styles.barFill}
                      style={{ width: `${candidate.share}%` }}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <p className={styles.notice}>
          {done
            ? t("vote.tally", {
                count: CURRENT_VOTE.totalVotes.toLocaleString(),
              })
            : t("vote.noCancel")}
        </p>
      </div>

      <div className={styles.cta}>
        <button
          type="button"
          className={styles.submit}
          disabled={done || !picked}
          onClick={submit}
        >
          {t(done ? "vote.submitted" : "fanspace.voteAction")}
        </button>
      </div>
    </div>
  );
}

/** Figma 는 `~26.08.10` 형식입니다 — 연도 두 자리에 점 구분. */
function formatDeadline(iso: string): string {
  return `~${iso.slice(2).replace(/-/g, ".")}`;
}

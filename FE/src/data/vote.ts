/**
 * 팬공간 배너가 여는 투표 — **정적 더미 데이터**.
 *
 * ⚠️ BE 에 투표 도메인이 없습니다. 그래서 **FE 배포만으로 전부 동작**합니다 —
 *    배포 백엔드·DB 를 건드릴 수 없는 상황에서도 이 화면은 그대로 뜹니다.
 *
 * ⚠️ **세 아티스트가 같은 투표를 봅니다.** 실제 방송 투표(한일가왕전 16강전)는
 *    아티스트별로 갈리는 이벤트가 아니라 하나의 경연이기 때문입니다.
 *    선택 결과도 아티스트별이 아니라 **하나의 키**에 저장합니다.
 *
 * ⚠️ **집계 수치는 시연용 고정값입니다.** 실제 득표가 아니며 서버로 아무것도 보내지
 *    않습니다. 화면 흐름(투표 전 → 투표 후)을 보여주기 위한 값입니다.
 */

export type VoteCandidate = {
  id: string;
  name: string;
  /** 투표 후에만 노출하는 시연용 득표율(%) — 합이 100 이 되도록 맞춰둡니다. */
  share: number;
};

export type VoteEvent = {
  id: string;
  title: string;
  /** 마감일 — 화면에 `~26.08.10` 형태로 표시합니다. */
  deadline: string;
  candidates: VoteCandidate[];
  /** 투표 후 노출하는 시연용 총 참여 수. */
  totalVotes: number;
};

/** 팬공간 배너가 가리키는 현재 투표. Figma 27:6676 의 내용을 그대로 옮겼습니다. */
export const CURRENT_VOTE: VoteEvent = {
  id: "korea-japan-top16",
  title: "한일가왕전 16강전",
  deadline: "2026-08-10",
  totalVotes: 128_402,
  candidates: [
    { id: "kang", name: "강근우", share: 41 },
    { id: "lee", name: "이보연", share: 34 },
    { id: "im", name: "임수빈", share: 25 },
  ],
};

const STORAGE_KEY = "trot.vote.korea-japan-top16";

/**
 * 저장된 선택을 읽습니다. 없으면 null(=아직 투표 안 함).
 *
 * ⚠️ **이 기기에만 남습니다.** 계정에 붙는 값이 아니라 브라우저 저장소입니다
 * (공연 응모와 달리 BE 도메인이 없습니다). 다른 기기로 시연하면 초기 상태입니다.
 */
export function getVotedCandidateId(): string | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    // 후보 목록이 바뀌면 예전 값이 어디에도 안 맞습니다 — 그때는 미투표로 봅니다.
    return CURRENT_VOTE.candidates.some((c) => c.id === saved) ? saved : null;
  } catch {
    // 시크릿 모드 등에서 localStorage 접근이 막힐 수 있습니다 — 조용히 무시합니다.
    return null;
  }
}

/** 선택을 저장합니다. 투표 후 취소는 불가하므로 지우는 경로는 두지 않습니다. */
export function saveVote(candidateId: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, candidateId);
  } catch {
    // 저장에 실패해도 화면 흐름은 그대로 이어집니다.
  }
}

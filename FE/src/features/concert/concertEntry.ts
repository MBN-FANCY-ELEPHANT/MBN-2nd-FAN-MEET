/**
 * 공연 응모 상태 — **이 기기에만** 저장됩니다.
 *
 * ⚠️ BE 에 응모(Entry) 도메인이 없습니다. `Gathering` 의 신청과 달리 공연 티켓 응모는
 *    계약이 없어서, 화면 흐름(응모 → 응모 완료 → 응모 내역)을 보여주기 위한
 *    **로컬 저장**입니다. 다른 기기에서는 보이지 않습니다.
 *    응모 도메인이 생기면 이 모듈을 걷어내고 API 로 바꾸세요.
 *
 * ⚠️ 응모는 **추첨 신청일 뿐 결제가 아닙니다.** 당첨 이후 실제 예매는 공식 예매처에서
 *    이뤄지며 플랫폼은 금전 거래를 중개하지 않습니다 (기획서 정책). 화면에도 명시합니다.
 */

const STORAGE_KEY = "trot.concertEntries";

export type ConcertEntry = {
  scheduleId: number;
  /** 응모 시각 (ISO). 응모 내역 정렬과 "n일 전 응모" 표시에 씁니다. */
  entredAt: string;
  /** 응모 인원. 1~4매까지만 받습니다 (공식 티켓 정책과 같은 상한). */
  seats: number;
};

export const MAX_SEATS = 4;

function read(): ConcertEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ConcertEntry[]) : [];
  } catch {
    // 시크릿 모드 등에서 접근이 막히거나 값이 깨졌으면 응모가 없는 것으로 봅니다.
    return [];
  }
}

function write(entries: ConcertEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // 저장 실패해도 화면 흐름은 그대로 이어집니다.
  }
}

export function listEntries(): ConcertEntry[] {
  return read().sort((a, b) => b.entredAt.localeCompare(a.entredAt));
}

export function findEntry(scheduleId: number): ConcertEntry | undefined {
  return read().find((e) => e.scheduleId === scheduleId);
}

/** 이미 응모했으면 인원만 갱신합니다. */
export function enter(scheduleId: number, seats: number, now: string): void {
  const entries = read().filter((e) => e.scheduleId !== scheduleId);
  entries.push({ scheduleId, seats, entredAt: now });
  write(entries);
}

export function cancelEntry(scheduleId: number): void {
  write(read().filter((e) => e.scheduleId !== scheduleId));
}

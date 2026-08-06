import i18n from "../i18n";

/**
 * 화면 표시용 포맷터.
 *
 * ⚠️ 서버는 시간을 항상 **UTC ISO-8601** 로 보냅니다. 로컬 시각 변환은 FE 책임입니다
 * (docs/domain-model.md 공통 규약).
 */

/** `03:27` — 영상 재생 시간. */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** `2.7만회` / `27K` — 조회수. 만 단위는 한국어권 관습이라 로케일별로 나눕니다. */
export function formatCount(count: number | null | undefined): string {
  if (count == null) return "0";
  const lang = i18n.resolvedLanguage ?? "ko";

  if (lang === "ko" || lang === "ja" || lang === "zh") {
    if (count >= 100_000_000) return `${(count / 100_000_000).toFixed(1)}억`;
    if (count >= 10_000) return `${(count / 10_000).toFixed(1)}만`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}천`;
    return String(count);
  }

  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

/** `1시간 전` / `3주 전` — 상대 시각. `Intl.RelativeTimeFormat` 이 언어별 규칙을 처리합니다. */
export function formatRelativeTime(iso: string): string {
  const lang = i18n.resolvedLanguage ?? "ko";
  const diffMs = new Date(iso).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];

  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms) {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return rtf.format(0, "minute");
}

/** `2026.08.09` — 일정 날짜. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** `~26.08.25` — 모임 마감일. 서버가 `LocalDate` 문자열(`2026-08-25`)로 보냅니다. */
export function formatDeadline(date: string): string {
  const [y, m, d] = date.split("-");
  return `~${y.slice(2)}.${m}.${d}`;
}

/** `07:21 작성` 의 시각 부분. */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

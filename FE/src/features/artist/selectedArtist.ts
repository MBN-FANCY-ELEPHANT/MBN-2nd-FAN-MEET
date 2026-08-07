/**
 * 랜딩페이지에서 고른 아티스트 — **임시 연결 표시용**입니다.
 *
 * ⚠️ 지금은 이름 문자열만 들고 있습니다. 실제 팬덤 공간은 아직 `STAR_ID = 1` 하나뿐이라
 *    선택한 아티스트가 어느 스타 데이터에 매핑되는지가 정해져 있지 않습니다
 *    (다중 스타는 `docs/mvp-scope.md` 컷 목록에 있습니다).
 *
 *    기능 개편 방향이 확정되면(2단계) `Star` 엔티티에 프로그램·출연자를 연결하고
 *    이 모듈을 `starId` 기반으로 승격하세요. 그때까지는 메인 화면 상단에
 *    "선택됨" 배지만 띄워 흐름이 이어진다는 것을 보여줍니다.
 */

const STORAGE_KEY = "trot.selectedArtist";

/** 저장된 선택을 읽습니다. 없으면 null. */
export function getSelectedArtist(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // 시크릿 모드 등에서 localStorage 접근이 막힐 수 있습니다 — 조용히 무시합니다.
    return null;
  }
}

/** 선택을 저장합니다. null 이면 지웁니다. */
export function setSelectedArtist(name: string | null): void {
  try {
    if (name === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, name);
    }
  } catch {
    // 저장 실패해도 화면 흐름은 그대로 이어집니다.
  }
}

/**
 * MVP 는 스타 1명(임영웅)으로 운영합니다 (docs/mvp-scope.md 컷 목록).
 * 다중 스타로 확장할 때는 이 상수를 라우트 파라미터(`/stars/:starId/...`)로 승격하세요.
 *
 * ⚠️ `App.tsx` 가 아니라 별도 파일에 둡니다 — 페이지들이 App 에서 상수를 import 하면
 * App → Page → App 순환 참조가 생겨 런타임에 undefined 가 될 수 있습니다.
 */
export const STAR_ID = 1;

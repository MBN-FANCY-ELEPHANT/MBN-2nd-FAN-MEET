/**
 * LIVE 배너·가로 플레이어가 재생할 무대 영상 목록.
 *
 * ⚠️ **아티스트별 정적 데이터입니다.** BE 의 `Content.mediaUrl` 에 같은 영상이 들어 있지만
 *    여기서 BE 를 쓰지 않는 이유는 두 가지입니다.
 *    1. "24시간 라이브 플레이리스트" 계약이 아직 없습니다.
 *    2. **배포 백엔드의 시드를 바꿀 수 없는 상황**이라, BE 를 보면 옛 영상이 나옵니다.
 *       배너는 메인 첫 화면이라 여기가 틀리면 데모 시작부터 어긋납니다.
 *
 * ⚠️ `youtubeId` 만 있으면 됩니다 — **API 키가 필요 없습니다.** 재생은 IFrame Player API
 *    가 하고, 키가 필요한 건 메타데이터를 조회하는 Data API v3 인데 쓰지 않습니다.
 *
 * ⚠️ 영상을 교체할 때는 **임베드가 허용된 영상인지 반드시 확인**하세요. 소유자가 막아둔
 *    영상은 iframe 에서 검은 화면이 됩니다 (재생 오류가 아니라 정책 차단이라 조용히 실패).
 *    주소창에 embed URL 을 직접 여는 검증은 무의미합니다 — 최상위 탐색이면 정상 영상도
 *    오류 153 이 납니다. **iframe 안에서** 확인해야 합니다.
 *
 * 아래 영상은 전부 iframe 안에서 재생을 확인했습니다 (2026-08-08).
 */

import { getSelectedArtist } from "../features/artist/selectedArtist";
import { ARTISTS } from "./programs";

export type LiveVideo = {
  id: number;
  youtubeId: string;
  title: string;
  channelName: string;
};

/**
 * 아티스트 이름 → 재생목록.
 *
 * ⚠️ `id` 는 **전역에서 유일**해야 합니다. `/live/:id` 라우트가 이 값으로 영상을 찾는데,
 *    아티스트마다 1 부터 다시 매기면 다른 사람의 영상이 열립니다.
 *    성리 1~4 · 이찬원 11~14 · 박서진 21~24 로 대역을 나눠 씁니다.
 */
const PLAYLISTS: Record<string, LiveVideo[]> = {
  성리: [
    { id: 1, youtubeId: "BsJtZSa0MQo", title: "성리 무대", channelName: "MBN MUSIC" },
    { id: 2, youtubeId: "hnxX2cW8H20", title: "성리 무대", channelName: "MBN MUSIC" },
    { id: 3, youtubeId: "e229ghL4akE", title: "성리 무대", channelName: "MBN MUSIC" },
    { id: 4, youtubeId: "9MAUrWDvrng", title: "성리 무대", channelName: "MBN MUSIC" },
  ],
  이찬원: [
    { id: 11, youtubeId: "fJLnz27EjtA", title: "이찬원 무대", channelName: "MBN MUSIC" },
    { id: 12, youtubeId: "x-Oy_LGYLD4", title: "이찬원 무대", channelName: "MBN MUSIC" },
    { id: 13, youtubeId: "yaeG5iPP414", title: "이찬원 무대", channelName: "MBN MUSIC" },
    { id: 14, youtubeId: "68ShTNAwrLc", title: "이찬원 무대", channelName: "MBN MUSIC" },
  ],
  박서진: [
    { id: 21, youtubeId: "bbiFC7t7I_o", title: "박서진 무대", channelName: "MBN MUSIC" },
    { id: 22, youtubeId: "913chFsIyX8", title: "박서진 무대", channelName: "MBN MUSIC" },
    { id: 23, youtubeId: "EANBUNR9PTI", title: "박서진 무대", channelName: "MBN MUSIC" },
    { id: 24, youtubeId: "YafJY6AoVmY", title: "박서진 무대", channelName: "MBN MUSIC" },
  ],
};

/**
 * 영상의 유튜브 자동 썸네일.
 *
 * 배너는 재생이 시작되기 전까지 이 그림을 영상 **위에** 덮습니다. 고정 이미지를 쓰면
 * 아티스트를 바꿔도 포스터가 그대로라 "영상만 바뀐" 것처럼 보입니다.
 *
 * `maxresdefault` 는 업로더가 HD 로 올린 영상에만 있습니다. 없으면 `main.tsx` 의 전역
 * onError 가 `hqdefault` → 예시 이미지 순으로 폴백합니다.
 */
export function liveThumbnail(video: LiveVideo): string {
  return `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`;
}

/**
 * 선택한 아티스트의 재생목록.
 *
 * 아직 아무도 고르지 않았거나 명단에 없는 이름이면 **첫 아티스트**로 떨어집니다 —
 * 랜딩을 건너뛰고 딥링크로 들어와도 배너가 비지 않게 하려는 것입니다.
 */
export function livePlaylist(): LiveVideo[] {
  const name = getSelectedArtist();
  return PLAYLISTS[name ?? ""] ?? PLAYLISTS[ARTISTS[0].name];
}

/**
 * `/live/:id` 로 들어온 영상을 찾습니다.
 *
 * ⚠️ 선택한 아티스트뿐 아니라 **전체에서** 찾습니다. 링크를 공유받아 들어온 경우
 * 선택 아티스트가 달라도 그 영상이 열려야 합니다.
 */
export function findLiveVideo(id: number): LiveVideo | undefined {
  return Object.values(PLAYLISTS)
    .flat()
    .find((v) => v.id === id);
}

/**
 * LIVE 배너·가로 플레이어가 재생할 무대 영상 목록.
 *
 * ⚠️ **임시 정적 데이터입니다.** BE 의 `Content.mediaUrl` 에 이미 YouTube 임베드 URL 이
 *    들어 있지만(시드 `https://www.youtube.com/embed/Xv8DFvPMat0`), "24시간 라이브
 *    플레이리스트"는 아직 계약이 없습니다. 개편 3단계에서 엔드포인트를 추가하고
 *    이 파일을 걷어내세요.
 *
 * ⚠️ `youtubeId` 만 있으면 됩니다 — **API 키가 필요 없습니다.** 재생은 IFrame Player API
 *    가 하고, 키가 필요한 건 메타데이터를 조회하는 Data API v3 인데 쓰지 않습니다.
 *
 * ⚠️ 영상을 교체할 때는 **임베드가 허용된 영상인지 반드시 확인**하세요. 소유자가 막아둔
 *    영상은 iframe 에서 검은 화면이 됩니다 (재생 오류가 아니라 정책 차단이라 조용히 실패).
 */

export type LiveVideo = {
  id: number;
  youtubeId: string;
  title: string;
  channelName: string;
};

export const LIVE_PLAYLIST: LiveVideo[] = [
  {
    id: 1,
    // MBN MUSIC 공식 채널 업로드 — 임베드 허용을 실제로 확인했습니다.
    // (직전에 쓰던 시드 영상 `Xv8DFvPMat0` 은 KBS Kpop 채널이라 MBN 콘텐츠도 아니었습니다.)
    youtubeId: "d4pWjMsd0go",
    title: "박서진 - 비와 당신 | 한일톱텐쇼 65회",
    channelName: "MBN MUSIC",
  },
];

export function findLiveVideo(id: number): LiveVideo | undefined {
  return LIVE_PLAYLIST.find((v) => v.id === id);
}

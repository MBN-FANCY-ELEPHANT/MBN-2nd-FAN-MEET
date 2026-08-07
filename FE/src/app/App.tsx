import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { api } from "../api/client";
import AppShell from "../components/layout/AppShell";
import LoginSheet from "../features/auth/LoginSheet";
import VoiceAssistant from "../features/voice/VoiceAssistant";
import ArticleDetailPage from "../pages/ArticleDetailPage";
import BroadcastPage from "../pages/BroadcastPage";
import CommentPage from "../pages/CommentPage";
import ContentListPage from "../pages/ContentListPage";
import FanSpacePage from "../pages/FanSpacePage";
import FeedPage from "../pages/FeedPage";
import GatheringDetailPage from "../pages/GatheringDetailPage";
import LandingPage from "../pages/LandingPage";
import PlaceListPage from "../pages/PlaceListPage";
import ScheduleListPage from "../pages/ScheduleListPage";
import ShortformPage from "../pages/ShortformPage";
import FanSpaceCategoryPage from "../pages/fanspace/FanSpaceCategoryPage";
import SearchPage from "../pages/SearchPage";
import TipDetailPage from "../pages/TipDetailPage";
import TipListPage from "../pages/TipListPage";
import VideoDetailPage from "../pages/VideoDetailPage";
import { STAR_ID } from "./constants";

export default function App() {
  const { data: star } = useQuery({
    queryKey: ["star", STAR_ID],
    queryFn: () => api.getStar(STAR_ID),
    staleTime: 5 * 60 * 1000,
  });

  // 음성 오버레이와 로그인 시트는 라우트가 아니라 앱 전역 상태입니다 — 어느 화면에서 열어도
  // 현재 화면 위에 시트로 뜨고, 닫으면 원래 화면으로 돌아옵니다 (디자인과 동일).
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const starName = star?.name ?? "";

  return (
    <>
      <Routes>
        {/* 진입점은 랜딩페이지입니다 — 방송 프로그램에서 아티스트를 고른 뒤 팬덤 공간으로
            들어갑니다. */}
        <Route path="/" element={<LandingPage />} />

        {/* 3탭 셸. ⚠️ 디자인 2차본에서 IA 가 바뀌었습니다 —
            `HOME / COMMUNITY / PLAY` (상단 탭) → `팬공간 / 소식 / 방송` (하단 탭바).
            기본 탭은 **소식**입니다 (Figma 19:912 에서 활성 상태). */}
        <Route
          element={
            <AppShell
              starName={starName}
              onOpenVoice={() => setVoiceOpen(true)}
              onOpenLogin={() => setLoginOpen(true)}
            />
          }
        >
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/fanspace" element={<FanSpacePage />} />
          <Route path="/broadcast" element={<BroadcastPage />} />
        </Route>

        {/* 팬공간 활동 기록 — 공연/투표/굿즈/모집이 **한 화면의 밑줄 탭**입니다
            (Figma 22:4264 · 22:4214 · 23:4956 · 23:4710). 라우트 파라미터로 탭을 고릅니다. */}
        <Route path="/fanspace/:category" element={<FanSpaceCategoryPage />} />

        {/* 숏폼 세로 플레이어 (Figma 19:3365) */}
        <Route path="/shorts/:id" element={<ShortformPage />} />

        {/* 상세 화면들은 셸 밖에 둡니다 — 탭바·검색바 없이 Header(Back) 만 씁니다 */}
        <Route
          path="/community/gatherings/:id"
          element={<GatheringDetailPage />}
        />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="/videos/:id" element={<VideoDetailPage />} />
        {/* 댓글 화면은 기사·영상이 공유합니다 (서버 조회는 /contents/{id}/comments 하나) */}
        <Route path="/articles/:id/comments" element={<CommentPage />} />
        <Route path="/videos/:id/comments" element={<CommentPage />} />

        {/* `전체보기` 목적지 — 디자인에 없는 화면이라 기존 카드를 재사용해 채웠습니다 */}
        <Route path="/contents" element={<ContentListPage />} />
        <Route path="/schedules" element={<ScheduleListPage />} />
        <Route path="/play/places" element={<PlaceListPage />} />
        <Route path="/play/tips" element={<TipListPage />} />
        <Route path="/play/tips/:id" element={<TipDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>

      {voiceOpen && (
        <VoiceAssistant starId={STAR_ID} onClose={() => setVoiceOpen(false)} />
      )}
      {loginOpen && <LoginSheet onClose={() => setLoginOpen(false)} />}
    </>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { api } from "../api/client";
import AppShell from "../components/layout/AppShell";
import LoginSheet from "../features/auth/LoginSheet";
import VoiceAssistant from "../features/voice/VoiceAssistant";
import ArticleDetailPage from "../pages/ArticleDetailPage";
import CommentPage from "../pages/CommentPage";
import CommunityPage from "../pages/CommunityPage";
import ContentListPage from "../pages/ContentListPage";
import GatheringDetailPage from "../pages/GatheringDetailPage";
import HomePage from "../pages/HomePage";
import LandingPage from "../pages/LandingPage";
import PlaceListPage from "../pages/PlaceListPage";
import PlayPage from "../pages/PlayPage";
import ScheduleListPage from "../pages/ScheduleListPage";
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
  const greeting = star?.greeting ?? "";

  return (
    <>
      <Routes>
        {/* 진입점은 랜딩페이지입니다 — 방송 프로그램에서 아티스트를 고른 뒤 팬덤 공간으로
            들어갑니다. 그래서 기존 3탭 셸이 `/` 에서 `/home` 으로 내려왔습니다. */}
        <Route path="/" element={<LandingPage />} />

        <Route
          element={
            <AppShell
              starName={starName}
              greeting={greeting}
              onOpenVoice={() => setVoiceOpen(true)}
              onOpenLogin={() => setLoginOpen(true)}
            />
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/play" element={<PlayPage />} />
        </Route>

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

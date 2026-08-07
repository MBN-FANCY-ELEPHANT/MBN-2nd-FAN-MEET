import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import LoginSheet from "../features/auth/LoginSheet";
import VoiceAssistant from "../features/voice/VoiceAssistant";
import ArticleDetailPage from "../pages/ArticleDetailPage";
import BroadcastPage from "../pages/BroadcastPage";
import CommentPage from "../pages/CommentPage";
import ContentListPage from "../pages/ContentListPage";
import FeedPage from "../pages/FeedPage";
import GatheringDetailPage from "../pages/GatheringDetailPage";
import LandingPage from "../pages/LandingPage";
import FanSpacePage from "../pages/FanSpacePage";
import LivePlayerPage from "../pages/LivePlayerPage";
import MainPage from "../pages/MainPage";
import PlaceListPage from "../pages/PlaceListPage";
import ScheduleListPage from "../pages/ScheduleListPage";
import ShortformPage from "../pages/ShortformPage";
import FanSpaceCategoryPage from "../pages/fanspace/FanSpaceCategoryPage";
import ConcertEntryPage from "../pages/fanspace/ConcertEntryPage";
import GoodsDetailPage from "../pages/fanspace/GoodsDetailPage";
import NotificationKeywordPage from "../pages/NotificationKeywordPage";
import SearchPage from "../pages/SearchPage";
import TipDetailPage from "../pages/TipDetailPage";
import TipListPage from "../pages/TipListPage";
import VideoDetailPage from "../pages/VideoDetailPage";
import { STAR_ID } from "./constants";

export default function App() {
  // 음성 오버레이와 로그인 시트는 라우트가 아니라 앱 전역 상태입니다 — 어느 화면에서 열어도
  // 현재 화면 위에 시트로 뜨고, 닫으면 원래 화면으로 돌아옵니다 (디자인과 동일).
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <Routes>
        {/* 진입점은 랜딩페이지입니다 — 방송 프로그램에서 아티스트를 고른 뒤 팬덤 공간으로
            들어갑니다. */}
        <Route path="/" element={<LandingPage />} />

        {/* 메인 — 기능 중심 홈. ⚠️ 하단 3탭 셸을 **걷어냈습니다**.
          주 사용자층이 중장년이라 뎁스를 줄이고, 큰 음성 버튼 + 큰 기능 버튼으로
        각 화면에 한 번에 들어갑니다. */}
        <Route
          path="/home"
          element={<MainPage onOpenVoice={() => setVoiceOpen(true)} />}
        />
        <Route
          path="/fanspace"
          element={<FanSpacePage onOpenVoice={() => setVoiceOpen(true)} />}
        />

        {/* LIVE 배너 → 가로 영상 플레이어 (Figma 27:6368) */}
        <Route path="/live/:id" element={<LivePlayerPage />} />

        {/* 기능 화면들 — 전부 Header(Back) 을 가진 독립 화면입니다 */}
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/broadcast" element={<BroadcastPage />} />

        {/* 팬공간 활동 기록 — 공연/투표/굿즈/모집이 **한 화면의 밑줄 탭**입니다
            (Figma 22:4264 · 22:4214 · 23:4956 · 23:4710). 라우트 파라미터로 탭을 고릅니다. */}
        {/* 굿즈 상세는 카테고리 라우트보다 먼저 둬야 합니다 — :category 가 "goods" 를
            먹어버리지 않도록 더 구체적인 경로를 위에 놓습니다. */}
        <Route path="/fanspace/goods/:id" element={<GoodsDetailPage />} />
        <Route path="/fanspace/concert/:id" element={<ConcertEntryPage />} />
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
        <Route
          path="/notifications/keywords"
          element={<NotificationKeywordPage />}
        />
      </Routes>

      {voiceOpen && (
        <VoiceAssistant starId={STAR_ID} onClose={() => setVoiceOpen(false)} />
      )}
      {loginOpen && <LoginSheet onClose={() => setLoginOpen(false)} />}
    </>
  );
}

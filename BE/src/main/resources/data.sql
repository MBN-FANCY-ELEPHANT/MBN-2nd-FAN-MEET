-- 로컬(H2) 시드 데이터. local 프로파일에서 매 기동 시 재적용됩니다.
--
-- ⚠️ 데모 품질은 시드 데이터 품질에 비례합니다. 새 엔티티를 추가하면 시드도 함께 추가하세요.
-- ⚠️ 날짜는 "오늘"보다 미래여야 HOME 의 다가오는 일정과 모집 중 모임이 비지 않습니다.
--    데모 당일 기준으로 과거가 되면 이 파일의 날짜를 미뤄주세요. (기준 작성일: 2026-08-07)
-- ⚠️ ID 를 명시적으로 넣으므로 각 테이블 끝에서 IDENTITY 를 RESTART 합니다.
-- ⚠️ ai_analysis 는 여기서 시드하지 않습니다. 기동 시 AiAnalysisWarmup 이 생성합니다.

-- ─────────────────────────────── Star ───────────────────────────────
INSERT INTO star (id, name, name_en, profile_image_url, cover_image_url, greeting, verified, follower_count)
VALUES (1, '임영웅', 'Lim Young-woong',
        'https://placehold.co/200x200/F58220/FFFFFF?text=YW',
        '/example_thumb.png',
        '오늘 하루도 즐거운 하루되세요!', TRUE, 128400);

ALTER TABLE star ALTER COLUMN id RESTART WITH 2;

-- ─────────────────────────────── User ───────────────────────────────
-- ⚠️ country 를 의도적으로 분산시킵니다. 댓글 화면에 여러 국기가 섞여 보이는 것이
--    "글로벌 팬덤"을 증명하는 가장 직접적인 장면입니다 (골든 패스 ④).
-- id=1 은 관리자라 데모 계정 목록(role=MEMBER)에 노출되지 않습니다.
INSERT INTO app_user (id, nickname, profile_image_url, country, role, locale) VALUES
 (1, 'MBN 운영팀',     'https://placehold.co/80x80/F58220/FFFFFF?text=MBN', 'KR', 'ADMIN',  'KO'),
 (2, '트롯덕후',       'https://placehold.co/80x80/F58220/FFFFFF?text=KR',  'KR', 'MEMBER', 'KO'),
 (3, '임영웅사랑',     'https://placehold.co/80x80/E4741A/FFFFFF?text=KR',  'KR', 'MEMBER', 'KO'),
 (4, 'TrotLover',      'https://placehold.co/80x80/4F46E5/FFFFFF?text=US',  'US', 'MEMBER', 'EN'),
 (5, 'ヒーロー推し',   'https://placehold.co/80x80/6366F1/FFFFFF?text=JP',  'JP', 'MEMBER', 'JA'),
 (6, 'Amélie',         'https://placehold.co/80x80/818CF8/FFFFFF?text=FR',  'FR', 'MEMBER', 'FR'),
 (7, '나의 영웅',      'https://placehold.co/80x80/EA580C/FFFFFF?text=HO',  'KR', 'MEMBER', 'KO');

ALTER TABLE app_user ALTER COLUMN id RESTART WITH 8;

-- ────────────────────────────── Channel ──────────────────────────────
INSERT INTO channel (id, name, logo_url, subscriber_count) VALUES
 (1, 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN', 412000),
 (2, 'MBN 트롯',  'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',  238000);

ALTER TABLE channel ALTER COLUMN id RESTART WITH 3;

-- ───────────────────────────── Schedule ─────────────────────────────
-- HOME 의 "다가오는 일정" 카드는 이 중 가장 가까운 미래 1건을 보여줍니다.
INSERT INTO schedule (id, star_id, title, type, start_at, end_at, venue, description, official, external_url) VALUES
 (1, 1, '임영웅의 팬미팅', 'FANMEETING',
     TIMESTAMP WITH TIME ZONE '2026-08-09 10:00:00+00', TIMESTAMP WITH TIME ZONE '2026-08-09 12:00:00+00',
     '서울 올림픽홀', '정규 3집 발매 기념 팬미팅입니다. 팬클럽 선예매 진행 중.', TRUE, NULL),
 (2, 1, 'MBN 트롯가왕 본선 3차', 'BROADCAST',
     TIMESTAMP WITH TIME ZONE '2026-08-13 11:00:00+00', NULL,
     'MBN', '본선 3차 경연 생방송.', TRUE, 'https://www.mbn.co.kr'),
 (3, 1, '전국투어 콘서트 [서울]', 'CONCERT',
     TIMESTAMP WITH TIME ZONE '2026-08-29 09:00:00+00', TIMESTAMP WITH TIME ZONE '2026-08-29 11:30:00+00',
     'KSPO DOME', '2026 전국투어 서울 공연.', TRUE, NULL),
 (4, 1, '신곡 쇼케이스', 'EVENT',
     TIMESTAMP WITH TIME ZONE '2026-09-05 08:00:00+00', NULL,
     '블루스퀘어', '신곡 [별빛] 쇼케이스.', TRUE, NULL),
 (5, 1, '전국투어 콘서트 [부산]', 'CONCERT',
     TIMESTAMP WITH TIME ZONE '2026-09-19 09:00:00+00', NULL,
     '부산 벡스코', '2026 전국투어 부산 공연.', TRUE, NULL);

ALTER TABLE schedule ALTER COLUMN id RESTART WITH 6;

-- ────────────────────────────── Place ───────────────────────────────
-- ⚠️ 정책: 이미 공개된 장소만 등록하며 source_url 은 필수입니다.
--    실시간 위치·사적 동선은 절대 등록하지 마세요. 지도는 임베드하지 않고 외부 링크로 대체합니다.
INSERT INTO place (id, star_id, name, type, address, latitude, longitude, image_url, visit_context, source_url, map_url) VALUES
 (1, 1, '충무로 옛날손칼국수', 'RESTAURANT', '서울 중구 충무로 12', 37.5613, 126.9942,
    '/example_thumb.png',
    '2026.06 MBN [트롯신이 떴다] 촬영 중 방문', 'https://www.mbn.co.kr/news/sample-1', 'https://map.kakao.com'),
 (2, 1, '동대문 야시장 먹자골목', 'RESTAURANT', '서울 중구 을지로6가', 37.5665, 127.0090,
    '/example_thumb.png',
    '2026.05 팬미팅 뒤풀이 공개 방문', 'https://www.mbn.co.kr/news/sample-2', 'https://map.kakao.com'),
 (3, 1, '한강 노을 카페', 'CAFE', '서울 영등포구 여의동로 330', 37.5285, 126.9326,
    '/example_thumb.png',
    '2026.04 뮤직비디오 촬영지', 'https://www.mbn.co.kr/news/sample-3', 'https://map.kakao.com'),
 (4, 1, 'KSPO DOME', 'VENUE', '서울 송파구 올림픽로 424', 37.5203, 127.1268,
    '/example_thumb.png',
    '2026 전국투어 서울 공연장', 'https://www.mbn.co.kr/news/sample-4', 'https://map.kakao.com'),
 (5, 1, '대구 방천시장 무대', 'FILMING_LOCATION', '대구 중구 달구벌대로', 35.8600, 128.5960,
    '/example_thumb.png',
    '2026.03 데뷔 10주년 다큐 촬영지', 'https://www.mbn.co.kr/news/sample-5', 'https://map.kakao.com');

ALTER TABLE place ALTER COLUMN id RESTART WITH 6;

-- ─────────────────────────────── Tip ────────────────────────────────
-- ⚠️ updated_at 은 화면에 항상 노출됩니다. 플랫폼 정책이 자주 바뀌기 때문입니다.
INSERT INTO tip (id, star_id, title, category, thumbnail_url, content, external_url, updated_at) VALUES
 (1, 1, '0729 멜론 스밍하는 방법', 'STREAMING', '/example_thumb.png',
    '## 스트리밍 기본 규칙' || CHR(10) || '1. 1시간 이상 간격을 두고 재생하세요.' || CHR(10) || '2. 볼륨은 0으로 두지 마세요.' || CHR(10) || '3. 같은 곡 연속 반복은 집계에서 제외됩니다.',
    'https://www.melon.com', TIMESTAMP WITH TIME ZONE '2026-08-01 09:00:00+00'),
 (2, 1, '트롯가왕 투표 방법', 'VOTE', '/example_thumb.png',
    '## 문자 투표' || CHR(10) || '방송 중 자막으로 안내되는 번호로 발송하세요.' || CHR(10) || '## 앱 투표' || CHR(10) || '하루 1회 무료 투표가 제공됩니다.',
    'https://www.mbn.co.kr', TIMESTAMP WITH TIME ZONE '2026-07-28 09:00:00+00'),
 (3, 1, '콘서트 티켓팅 준비물', 'TICKETING', '/example_thumb.png',
    '## 예매 전 체크리스트' || CHR(10) || '- 회원 가입과 본인 인증을 미리 마치세요.' || CHR(10) || '- 결제 수단을 등록해 두세요.' || CHR(10) || '- 서버 시간을 확인하세요.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-20 09:00:00+00'),
 (4, 1, '응원봉 사용 가이드', 'CHEER', '/example_thumb.png',
    '## 공연장 응원 매너' || CHR(10) || '- 발라드 구간에서는 응원봉을 낮춰주세요.' || CHR(10) || '- 촬영은 지정된 구간에서만 가능합니다.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-12 09:00:00+00'),
 (5, 1, '공식 팬클럽 가입 안내', 'FANCLUB', '/example_thumb.png',
    '## 가입 절차' || CHR(10) || '연 1회 모집합니다. 선예매 권한이 부여됩니다.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-02 09:00:00+00'),
 (6, 1, '해외 팬 응원 참여 방법', 'CHEER', '/example_thumb.png',
    '## For international fans' || CHR(10) || 'Global streaming and voting are supported. See the guide for regional details.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-06-25 09:00:00+00');

ALTER TABLE tip ALTER COLUMN id RESTART WITH 7;

-- ────────────────────────────── Content ─────────────────────────────
-- 기사(ARTICLE)와 영상(VIDEO)이 한 테이블에 섞여 있습니다. HOME 캐러셀이 둘을 섞어서 보여주기 때문입니다.
-- ⚠️ live=TRUE 는 LIVE 배지 표시용 플래그일 뿐 실시간 스트리밍 연동이 아닙니다.
-- ⚠️ 기사 본문의 [[용어|설명]] 은 FE 가 파싱해 툴팁으로 렌더합니다 (별도 API 없음).
INSERT INTO content (id, star_id, channel_id, type, title, thumbnail_url, published_at, view_count, like_count, comment_count, body, reporter_name, reporter_avatar_url, media_url, duration_sec, live, viewer_count) VALUES
 (1, 1, 1, 'ARTICLE', '"오래 전부터 오고 싶었어요"…임영웅, 전국투어 서울 공연 매진',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-08-06 10:00:00+00', 27400, 212, 3,
    '[ 앵커멘트 ]' || CHR(10) || '가수 임영웅의 2026 전국투어 서울 공연이 예매 시작 8분 만에 전석 매진됐습니다. 이번 공연은 [[스탠딩석|무대 앞 입석 구역으로, 좌석 없이 관람하는 자리]]을 포함해 총 1만 5천석 규모로 진행됩니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '소속사는 추가 회차 편성을 검토 중이라고 밝혔습니다. 지방 공연은 부산과 대구에서 이어집니다.' || CHR(10) || CHR(10) || '- 인터뷰 : 임영웅 / 가수' || CHR(10) || '"오래 전부터 팬 여러분을 직접 만나고 싶었습니다. 좋은 무대로 보답하겠습니다."',
    '심가현 기자', 'https://placehold.co/80x80/F58220/FFFFFF?text=SIM', NULL, NULL, FALSE, NULL),

 (2, 1, 2, 'VIDEO', '신곡 [별빛] 최초 라이브 무대',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-08-05 12:00:00+00', 121000, 3102, 2, NULL, NULL, NULL,
    'https://www.youtube.com/embed/Xv8DFvPMat0', 207, FALSE, NULL),

 (3, 1, 2, 'VIDEO', '트롯가왕 본선 2차 생중계',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-08-07 02:00:00+00', 8200, 431, 0, NULL, NULL, NULL,
    'https://www.youtube.com/embed/Xv8DFvPMat0', NULL, TRUE, 82),

 (4, 1, 1, 'ARTICLE', '임영웅 팬덤, 생일 맞아 아동복지시설에 5천만원 기부',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-08-04 09:00:00+00', 18300, 154, 1,
    '[ 앵커멘트 ]' || CHR(10) || '가수 임영웅의 팬덤이 생일을 기념해 아동복지시설에 5천만원을 기부했습니다. 이번 기부는 [[팬덤 모금|팬들이 자발적으로 모금해 스타의 이름으로 기부하는 문화]]의 대표 사례로 꼽힙니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '팬덤 측은 모금 내역과 기부 영수증을 전액 공개했습니다.',
    '박준영 기자', 'https://placehold.co/80x80/E4741A/FFFFFF?text=PARK', NULL, NULL, FALSE, NULL),

 (5, 1, 2, 'VIDEO', '0721 무대 콘서트 직관 영상',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-07-21 12:00:00+00', 88120, 2431, 0, NULL, NULL, NULL,
    'https://www.youtube.com/embed/Xv8DFvPMat0', 251, FALSE, NULL),

 (6, 1, 1, 'ARTICLE', '데뷔 10주년 임영웅, 다큐멘터리로 돌아본 발자취',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-07-18 09:00:00+00', 15600, 118, 0,
    '[ 앵커멘트 ]' || CHR(10) || '데뷔 10주년을 맞은 가수 임영웅의 다큐멘터리가 공개됐습니다. 대구 방천시장 [[버스킹|길거리에서 하는 즉흥 공연]] 시절부터 현재까지를 담았습니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '제작진은 미공개 영상 30여 분을 새로 담았다고 밝혔습니다.',
    '심가현 기자', 'https://placehold.co/80x80/F58220/FFFFFF?text=SIM', NULL, NULL, FALSE, NULL),

 (7, 1, 2, 'VIDEO', '트롯가왕 준결승 무대 직캠',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-07-15 12:00:00+00', 64300, 1980, 0, NULL, NULL, NULL,
    'https://www.youtube.com/embed/Xv8DFvPMat0', 312, FALSE, NULL),

 (8, 1, 1, 'ARTICLE', '해외 팬 유입 급증…트롯 한류 본격화',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-07-10 09:00:00+00', 22100, 176, 0,
    '[ 앵커멘트 ]' || CHR(10) || '트롯 콘텐츠의 해외 시청 비중이 1년 새 3배로 늘었습니다. 일본과 미국을 중심으로 [[K-트롯|해외에서 소비되는 한국 트로트 장르를 가리키는 표현]] 팬덤이 형성되고 있습니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '플랫폼 측은 다국어 자막 지원을 확대하겠다고 밝혔습니다.',
    '박준영 기자', 'https://placehold.co/80x80/E4741A/FFFFFF?text=PARK', NULL, NULL, FALSE, NULL),

 (9, 1, 2, 'VIDEO', '예능 [트롯신이 떴다] 하이라이트',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-06-30 12:00:00+00', 35800, 1201, 0, NULL, NULL, NULL,
    'https://www.youtube.com/embed/Xv8DFvPMat0', 428, FALSE, NULL),

 (10, 1, 2, 'VIDEO', '팬미팅 비하인드 Vlog',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-06-22 12:00:00+00', 22400, 990, 0, NULL, NULL, NULL,
    'https://www.youtube.com/embed/Xv8DFvPMat0', 536, FALSE, NULL),

 (11, 1, 1, 'ARTICLE', '임영웅 신곡 [별빛], 발매 첫 주 음원 차트 1위',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-06-15 09:00:00+00', 31200, 245, 0,
    '[ 앵커멘트 ]' || CHR(10) || '임영웅의 신곡 [별빛]이 발매 첫 주 주요 음원 차트에서 1위를 기록했습니다. [[퍼펙트 올킬|국내 모든 주요 음원 차트에서 동시에 1위를 차지하는 것]]도 함께 달성했습니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '음반 판매량도 초동 기준 역대 최고치를 경신했습니다.',
    '심가현 기자', 'https://placehold.co/80x80/F58220/FFFFFF?text=SIM', NULL, NULL, FALSE, NULL),

 (12, 1, 2, 'VIDEO', '대기실 비하인드 — 공연 당일의 하루',
    '/example_thumb.png',
    TIMESTAMP WITH TIME ZONE '2026-06-02 12:00:00+00', 15600, 754, 0, NULL, NULL, NULL,
    'https://www.youtube.com/embed/Xv8DFvPMat0', 389, FALSE, NULL);

ALTER TABLE content ALTER COLUMN id RESTART WITH 13;

-- ─────────────────────────── ContentPlace ───────────────────────────
-- 뉴스 상세 하단 "기사에 나온 그 곳" 캐러셀.
INSERT INTO content_place (id, content_id, place_id, sort_order) VALUES
 (1, 1, 4, 0),   -- 서울 공연 매진 기사 → KSPO DOME
 (2, 6, 5, 0),   -- 10주년 다큐 기사 → 대구 방천시장
 (3, 6, 1, 1),   -- 10주년 다큐 기사 → 충무로 손칼국수
 (4, 4, 2, 0);   -- 기부 기사 → 동대문 야시장

ALTER TABLE content_place ALTER COLUMN id RESTART WITH 5;

-- ───────────────────────────── Gathering ─────────────────────────────
-- ⚠️ fee 는 표시 전용입니다. 플랫폼은 결제를 중개하지 않습니다.
-- 데모 시나리오: id=1 (34/40) 에 참여 신청 → 35/40 으로 즉시 반영 (디자인 화면과 동일한 수치).
INSERT INTO gathering (id, star_id, host_id, title, type, cover_image_url, summary, description, status, current_count, capacity, deadline, event_at, meeting_point, fee, payment_info, refund_policy, notice, official) VALUES
 (1, 1, 7, '0829 관광 버스 대절 모집 (대전 출발)', 'BUS',
    '/example_thumb.png',
    '대전역에서 콘서트장까지 가는 버스입니다. 08:00까지 도착하시면 됩니다.',
    '서울 KSPO DOME 공연 관람을 위한 대전 출발 왕복 전세버스입니다. 공연 종료 후 대전역으로 복귀합니다.',
    'RECRUITING', 34, 40, DATE '2026-08-25', TIMESTAMP WITH TIME ZONE '2026-08-29 23:00:00+00',
    '대전역 동광장', 30000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    '환불은 불가하며, 지정 시간 14시까지 늦지 않게 모여주세요.', TRUE),

 (2, 1, 7, '생일 기념 기부금 모집', 'DONATION',
    '/example_thumb.png',
    '생일을 맞아 아동복지시설에 기부합니다. 1인 1만원부터 참여 가능합니다.',
    '팬덤 이름으로 아동복지시설에 기부합니다. 모금 내역과 기부 영수증은 모임 종료 후 전체 공개됩니다.',
    'RECRUITING', 128, 200, DATE '2026-08-31', TIMESTAMP WITH TIME ZONE '2026-09-01 00:00:00+00',
    '온라인', 10000, '모금 계좌는 공지사항 참조', '기부 특성상 환불 불가',
    '기부금 사용 내역은 종료 후 공개됩니다.', TRUE),

 (3, 1, 7, '지하철 응원 광고 공동 구매', 'AD',
    '/example_thumb.png',
    '2호선 홍대입구역 스크린도어 광고를 함께 진행합니다.',
    '데뷔 10주년 기념 지하철 응원 광고입니다. 2주간 게재되며 참여자 닉네임이 함께 표기됩니다.',
    'RECRUITING', 45, 60, DATE '2026-08-24', TIMESTAMP WITH TIME ZONE '2026-09-01 00:00:00+00',
    '온라인', 20000, '모임 확정 후 운영자 개별 안내', '광고 발주 전까지 전액 환불',
    '광고 시안은 참여자 투표로 결정합니다.', FALSE),

 (4, 1, 4, '서울 콘서트 단체 관람', 'GROUP_VIEWING',
    '/example_thumb.png',
    'Group seating for the Seoul concert. English-speaking fans welcome.',
    '해외 팬을 포함한 단체 관람 모임입니다. 공연 전 사전 모임과 통역 지원이 있습니다.',
    'RECRUITING', 18, 30, DATE '2026-08-26', TIMESTAMP WITH TIME ZONE '2026-08-29 09:00:00+00',
    'KSPO DOME 1번 게이트', 0, NULL, NULL,
    '티켓은 각자 예매하셔야 합니다.', FALSE),

 (5, 1, 7, '0810 부산 버스 대절', 'BUS',
    '/example_thumb.png',
    '부산 출발 전세버스입니다. 모집이 완료되었습니다.',
    '부산 출발 왕복 전세버스. 정원이 모두 찼습니다.',
    'FULL', 45, 45, DATE '2026-08-08', TIMESTAMP WITH TIME ZONE '2026-08-10 22:00:00+00',
    '부산역 광장', 45000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    NULL, TRUE),

 (6, 1, 7, '7월 팬클럽 정기 모임', 'ETC',
    '/example_thumb.png',
    '7월 정기 모임입니다. 종료되었습니다.',
    '월례 정기 모임. 다음 모임은 8월 말 공지 예정입니다.',
    'CLOSED', 22, 25, DATE '2026-07-30', TIMESTAMP WITH TIME ZONE '2026-07-31 09:00:00+00',
    '강남역 인근', 0, NULL, NULL, NULL, FALSE);

ALTER TABLE gathering ALTER COLUMN id RESTART WITH 7;

-- ────────────────────────────── Comment ─────────────────────────────
-- ⚠️ 작성자 국가를 섞어둡니다. 댓글 화면에서 국기가 섞여 보이는 것이 데모의 핵심 장면입니다.
INSERT INTO comment (id, content_id, author_id, body, like_count, created_at, deleted_at) VALUES
 (1, 1, 2, '드디어 매진이라니! 티켓 못 구한 분들 위해 추가 회차 꼭 열렸으면 좋겠어요.', 212, TIMESTAMP WITH TIME ZONE '2026-08-06 12:21:00+00', NULL),
 (2, 1, 4, 'Flew in from Chicago just for this. Cannot wait to finally see him live!', 187, TIMESTAMP WITH TIME ZONE '2026-08-06 13:40:00+00', NULL),
 (3, 1, 5, '日本からも応援しています。ソウル公演、絶対に行きます！', 143, TIMESTAMP WITH TIME ZONE '2026-08-06 15:02:00+00', NULL),
 (4, 2, 6, 'Sa voix est incroyable. Je découvre le trot grâce à lui.', 98, TIMESTAMP WITH TIME ZONE '2026-08-05 14:10:00+00', NULL),
 (5, 2, 3, '노래 왜 이리 잘함? 라이브가 음원이랑 똑같아요.', 254, TIMESTAMP WITH TIME ZONE '2026-08-05 16:33:00+00', NULL),
 (6, 4, 2, '기부 내역까지 공개하는 팬덤이라 더 자랑스럽습니다.', 176, TIMESTAMP WITH TIME ZONE '2026-08-04 10:15:00+00', NULL);

ALTER TABLE comment ALTER COLUMN id RESTART WITH 7;

-- ──────────────────────── CommentTranslation ────────────────────────
-- ⚠️ 스텁 AI provider 는 번역을 흉내 내지 않고 503 을 던집니다 (가짜 번역이 더 위험).
--    데모에서 번역 버튼이 동작하도록 시드 댓글의 번역을 미리 채워둡니다.
--    OpenAI 연결 후에는 캐시가 없는 댓글도 실시간 번역됩니다.
INSERT INTO comment_translation (id, comment_id, locale, translated_body, created_at) VALUES
 (1, 1, 'EN', 'Sold out already! I really hope they add more shows for those who missed out.', TIMESTAMP WITH TIME ZONE '2026-08-06 12:22:00+00'),
 (2, 2, 'KO', '이거 보려고 시카고에서 날아왔어요. 드디어 라이브로 볼 생각에 설렙니다!', TIMESTAMP WITH TIME ZONE '2026-08-06 13:41:00+00'),
 (3, 3, 'KO', '일본에서도 응원하고 있습니다. 서울 공연 꼭 갈게요!', TIMESTAMP WITH TIME ZONE '2026-08-06 15:03:00+00'),
 (4, 3, 'EN', 'Cheering from Japan. I am definitely going to the Seoul concert!', TIMESTAMP WITH TIME ZONE '2026-08-06 15:03:00+00'),
 (5, 4, 'KO', '목소리가 정말 놀라워요. 이 분 덕분에 트로트를 알게 됐어요.', TIMESTAMP WITH TIME ZONE '2026-08-05 14:11:00+00'),
 (6, 4, 'EN', 'His voice is incredible. I discovered trot because of him.', TIMESTAMP WITH TIME ZONE '2026-08-05 14:11:00+00'),
 (7, 5, 'EN', 'How is he this good? The live sounds exactly like the studio version.', TIMESTAMP WITH TIME ZONE '2026-08-05 16:34:00+00'),
 (8, 6, 'EN', 'A fandom that publishes its donation records — I am so proud.', TIMESTAMP WITH TIME ZONE '2026-08-04 10:16:00+00');

ALTER TABLE comment_translation ALTER COLUMN id RESTART WITH 9;

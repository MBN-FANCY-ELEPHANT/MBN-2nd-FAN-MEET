-- 로컬(H2) 시드 데이터. local 프로파일에서 매 기동 시 재적용됩니다.
--
-- ⚠️ 데모 품질은 시드 데이터 품질에 비례합니다. 새 엔티티를 추가하면 시드도 함께 추가하세요.
-- ⚠️ 날짜는 "오늘"보다 미래여야 HOME 의 다가오는 일정과 모집 중 모임이 비지 않습니다.
--    데모 당일 기준으로 과거가 되면 이 파일의 날짜를 미뤄주세요. (기준 작성일: 2026-08-08)
-- ⚠️ ID 를 명시적으로 넣으므로 각 테이블 끝에서 IDENTITY 를 RESTART 합니다.
-- ⚠️ ai_analysis 는 여기서 시드하지 않습니다. 기동 시 AiAnalysisWarmup 이 생성합니다.
--
-- ══════════════════════════════════════════════════════════════════════════════
-- ⚠️ **기사·영상·게시글 본문은 전부 데모용 가상 콘텐츠입니다.**
--    실제 보도나 실제 발언이 아니며, 곡명·수치·기자명도 시연을 위해 지어낸 값입니다.
--    외부에 실제 기록처럼 노출하지 마세요.
--
-- ⚠️ **아티스트 3명 구성입니다** — 성리(1) · 이찬원(2) · 박서진(3).
--    star.name 은 아래 세 곳과 **글자 하나까지 일치**해야 합니다:
--      · artist_stage.artist_name            (음성 "무대 보여줘")
--      · FE/src/data/programs.ts 의 ARTISTS   (랜딩 선택 목록)
--      · EvidenceFinder.DOMAIN_WORDS          (AI 스코프 판정)
--
-- ⚠️ **ID 대역을 아티스트별로 나눠 씁니다** — 성리 1~10 / 이찬원 21~30 / 박서진 41~50.
--    (schedule·place·tip 은 5~6건씩이라 1~10 / 11~20 / 21~30 을 씁니다.)
--    새 데이터를 끼워 넣을 때 다른 아티스트의 대역을 침범하지 마세요.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────── Star ───────────────────────────────
INSERT INTO star (id, name, name_en, profile_image_url, cover_image_url, greeting, verified, follower_count) VALUES
 (1, '성리',   'Sungri',        'https://placehold.co/200x200/F58220/FFFFFF?text=SR', '/example_thumb.png',
     '오늘도 제 노래로 잠깐 웃으셨으면 좋겠어요!', TRUE,  84200),
 (2, '이찬원', 'Lee Chan-won',  'https://placehold.co/200x200/E4741A/FFFFFF?text=CW', '/example_thumb.png',
     '언제나 좋은 노래로 찾아뵙겠습니다!',        TRUE,  96200),
 (3, '박서진', 'Park Seo-jin',  'https://placehold.co/200x200/EA580C/FFFFFF?text=SJ', '/example_thumb.png',
     '늘 응원해 주셔서 고맙습니다. 힘내서 노래할게요!', TRUE, 91500);

ALTER TABLE star ALTER COLUMN id RESTART WITH 4;

-- ─────────────────────────────── User ───────────────────────────────
-- ⚠️ country 를 의도적으로 분산시킵니다. 댓글 화면에 여러 국기가 섞여 보이는 것이
--    "글로벌 팬덤"을 증명하는 가장 직접적인 장면입니다 (골든 패스 ④).
--    7개 로케일 중 KR·US·JP·FR·ES·RU 6개국을 깔아 언어를 바꿔도 배지가 살아 있게 합니다.
-- id=1 은 관리자라 데모 계정 목록(role=MEMBER)에 노출되지 않습니다.
-- id=7 은 모든 모집의 host 입니다.
-- ⚠️ 닉네임에 특정 아티스트 이름을 넣지 않습니다 — 세 아티스트의 댓글에 함께 등장하기 때문입니다.
-- favorite_star_id/favorite_artist_name 은 새 게스트가 선택한 스타를 저장하며 기존 데모 계정은 비워 둡니다.
INSERT INTO app_user (id, nickname, profile_image_url, country, role, locale, favorite_star_id, favorite_artist_name) VALUES
 (1, 'MBN 운영팀',     'https://placehold.co/80x80/F58220/FFFFFF?text=MBN', 'KR', 'ADMIN',  'KO', NULL, NULL),
 (2, '트롯덕후',       'https://placehold.co/80x80/F58220/FFFFFF?text=KR',  'KR', 'MEMBER', 'KO', NULL, NULL),
 (3, '노래하는밤',     'https://placehold.co/80x80/E4741A/FFFFFF?text=KR',  'KR', 'MEMBER', 'KO', NULL, NULL),
 (4, 'TrotLover',      'https://placehold.co/80x80/4F46E5/FFFFFF?text=US',  'US', 'MEMBER', 'EN', NULL, NULL),
 (5, 'トロット大好き', 'https://placehold.co/80x80/6366F1/FFFFFF?text=JP',  'JP', 'MEMBER', 'JA', NULL, NULL),
 (6, 'Amélie',         'https://placehold.co/80x80/818CF8/FFFFFF?text=FR',  'FR', 'MEMBER', 'FR', NULL, NULL),
 (7, '팬클럽 운영자',  'https://placehold.co/80x80/EA580C/FFFFFF?text=HO',  'KR', 'MEMBER', 'KO', NULL, NULL),
 (8, 'Sofía',          'https://placehold.co/80x80/DC2626/FFFFFF?text=ES',  'ES', 'MEMBER', 'ES', NULL, NULL),
 (9, 'Ольга',          'https://placehold.co/80x80/0EA5E9/FFFFFF?text=RU',  'RU', 'MEMBER', 'RU', NULL, NULL);

ALTER TABLE app_user ALTER COLUMN id RESTART WITH 10;

-- ────────────────────────────── Channel ──────────────────────────────
-- ⚠️ content.channel_id 는 NOT NULL 입니다. 콘텐츠보다 반드시 먼저 들어가야 합니다.
INSERT INTO channel (id, name, logo_url, subscriber_count) VALUES
 (1, 'MBN NEWS',      'https://placehold.co/64x64/F58220/FFFFFF?text=MBN', 412000),
 (2, 'MBN 트롯',      'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',  238000),
 (3, 'MBN 한일톱텐쇼','https://placehold.co/64x64/EA580C/FFFFFF?text=T10', 176000);

ALTER TABLE channel ALTER COLUMN id RESTART WITH 4;

-- ───────────────────────────── Schedule ─────────────────────────────
-- HOME 의 "다가오는 일정" 카드는 이 중 가장 가까운 미래 1건을 보여줍니다.
--
-- ⚠️ **venue 에 지역명을 반드시 넣습니다.** 음성 "부산 공연 응모해줘" 가 title/venue 의
--    지역어로 대상을 고릅니다 (VoiceActionResolver.REGIONS).
-- ⚠️ **아티스트마다 CONCERT/FANMEETING 을 최소 2건** 둡니다. 응모 데모의 대상이고,
--    1건뿐이면 "다른 공연 응모해줘" 로 대상을 바꾸는 시연이 불가능합니다.
INSERT INTO schedule (id, star_id, title, type, start_at, end_at, venue, description, official, external_url) VALUES
 -- 성리
 (1, 1, '성리의 팬미팅', 'FANMEETING',
     TIMESTAMP WITH TIME ZONE '2026-08-14 10:00:00+00', TIMESTAMP WITH TIME ZONE '2026-08-14 12:00:00+00',
     '서울 올림픽홀', '미니앨범 발매 기념 팬미팅입니다. 팬클럽 선예매 진행 중.', TRUE, NULL),
 (2, 1, 'MBN 트롯가왕 본선 3차', 'BROADCAST',
     TIMESTAMP WITH TIME ZONE '2026-08-18 11:00:00+00', NULL,
     'MBN', '본선 3차 경연 생방송.', TRUE, 'https://www.mbn.co.kr'),
 (3, 1, '성리 전국투어 [서울]', 'CONCERT',
     TIMESTAMP WITH TIME ZONE '2026-08-30 09:00:00+00', TIMESTAMP WITH TIME ZONE '2026-08-30 11:30:00+00',
     'KSPO DOME (서울)', '2026 전국투어 서울 공연.', TRUE, NULL),
 (4, 1, '성리 신곡 쇼케이스', 'EVENT',
     TIMESTAMP WITH TIME ZONE '2026-09-05 08:00:00+00', NULL,
     '블루스퀘어 (서울)', '신곡 [첫사랑 편지] 쇼케이스.', TRUE, NULL),
 (5, 1, '성리 전국투어 [부산]', 'CONCERT',
     TIMESTAMP WITH TIME ZONE '2026-09-19 09:00:00+00', NULL,
     '부산 벡스코', '2026 전국투어 부산 공연.', TRUE, NULL),

 -- 이찬원
 (11, 2, '이찬원의 팬미팅', 'FANMEETING',
     TIMESTAMP WITH TIME ZONE '2026-08-16 09:00:00+00', TIMESTAMP WITH TIME ZONE '2026-08-16 11:00:00+00',
     '대구 엑스코', '팬클럽 정기 팬미팅입니다.', TRUE, NULL),
 (12, 2, 'MBN 한일톱텐쇼 출연', 'BROADCAST',
     TIMESTAMP WITH TIME ZONE '2026-08-20 11:00:00+00', NULL,
     'MBN', '한일톱텐쇼 본선 무대.', TRUE, 'https://www.mbn.co.kr'),
 (13, 2, '이찬원 팬사인회', 'EVENT',
     TIMESTAMP WITH TIME ZONE '2026-08-23 05:00:00+00', NULL,
     '코엑스 (서울)', '신보 구매자 대상 팬사인회.', TRUE, NULL),
 (14, 2, '이찬원 전국투어 [서울]', 'CONCERT',
     TIMESTAMP WITH TIME ZONE '2026-09-12 10:00:00+00', TIMESTAMP WITH TIME ZONE '2026-09-12 12:30:00+00',
     '서울 올림픽홀', '2026 전국투어 서울 공연.', TRUE, NULL),
 (15, 2, '이찬원 전국투어 [대구]', 'CONCERT',
     TIMESTAMP WITH TIME ZONE '2026-09-26 10:00:00+00', NULL,
     '대구 엑스코', '2026 전국투어 대구 공연.', TRUE, NULL),

 -- 박서진
 (21, 3, '박서진의 팬미팅', 'FANMEETING',
     TIMESTAMP WITH TIME ZONE '2026-08-15 08:00:00+00', TIMESTAMP WITH TIME ZONE '2026-08-15 10:00:00+00',
     '광주 김대중컨벤션센터', '신보 발매 기념 팬미팅입니다.', TRUE, NULL),
 (22, 3, 'MBN 현역가왕 특별무대', 'BROADCAST',
     TIMESTAMP WITH TIME ZONE '2026-08-22 11:00:00+00', NULL,
     'MBN', '특별무대 생방송.', TRUE, 'https://www.mbn.co.kr'),
 (23, 3, '박서진 신보 발매 기념 쇼케이스', 'EVENT',
     TIMESTAMP WITH TIME ZONE '2026-08-28 08:00:00+00', NULL,
     '블루스퀘어 (서울)', '정규 [항해] 발매 쇼케이스.', TRUE, NULL),
 (24, 3, '박서진 단독 콘서트 [서울]', 'CONCERT',
     TIMESTAMP WITH TIME ZONE '2026-09-06 09:00:00+00', TIMESTAMP WITH TIME ZONE '2026-09-06 11:30:00+00',
     '잠실실내체육관 (서울)', '2026 단독 콘서트 서울 공연.', TRUE, NULL),
 (25, 3, '박서진 단독 콘서트 [광주]', 'CONCERT',
     TIMESTAMP WITH TIME ZONE '2026-09-27 09:00:00+00', NULL,
     '광주 염주체육관', '2026 단독 콘서트 광주 공연.', TRUE, NULL);

ALTER TABLE schedule ALTER COLUMN id RESTART WITH 26;

-- ────────────────────────────── Place ───────────────────────────────
-- ⚠️ 정책: 이미 공개된 장소만 등록하며 source_url 은 필수입니다.
--    실시간 위치·사적 동선은 절대 등록하지 마세요. 지도는 임베드하지 않고 외부 링크로 대체합니다.
-- ⚠️ 좌표는 시연용 근사값입니다. 실제 서비스에서는 출처와 함께 검증된 값을 넣으세요.
-- ⚠️ source_url 의 sample-N 은 자리표시자입니다. 운영 투입 전 실제 기사·방송 링크로 교체하세요.
INSERT INTO place (id, star_id, name, type, address, latitude, longitude, image_url, visit_context, source_url, map_url) VALUES
 -- 성리 (서울 중심)
 (1, 1, '충무로 옛날손칼국수', 'RESTAURANT', '서울 중구 충무로 12', 37.5613, 126.9942,
    '/example_thumb.png', '2026.06 MBN [트롯신이 떴다] 촬영 중 방문',
    'https://www.mbn.co.kr/news/sample-1', 'https://map.kakao.com'),
 (2, 1, '한강 노을 카페', 'CAFE', '서울 영등포구 여의동로 330', 37.5285, 126.9326,
    '/example_thumb.png', '2026.04 뮤직비디오 촬영지',
    'https://www.mbn.co.kr/news/sample-2', 'https://map.kakao.com'),
 (3, 1, 'KSPO DOME', 'VENUE', '서울 송파구 올림픽로 424', 37.5203, 127.1268,
    '/example_thumb.png', '2026 전국투어 서울 공연장',
    'https://www.mbn.co.kr/news/sample-3', 'https://map.kakao.com'),
 (4, 1, '남산 케이블카 승강장', 'FILMING_LOCATION', '서울 중구 소파로 83', 37.5563, 126.9836,
    '/example_thumb.png', '2026.05 데뷔 다큐 촬영지',
    'https://www.mbn.co.kr/news/sample-4', 'https://map.kakao.com'),
 (5, 1, '성수동 골목 사진관', 'FILMING_LOCATION', '서울 성동구 연무장길 45', 37.5443, 127.0557,
    '/example_thumb.png', '2026.03 앨범 재킷 촬영지',
    'https://www.mbn.co.kr/news/sample-5', 'https://map.kakao.com'),

 -- 이찬원 (대구 중심)
 (11, 2, '대구 서문시장 칼국수 골목', 'RESTAURANT', '대구 중구 큰장로26길 8', 35.8693, 128.5824,
    '/example_thumb.png', '2026.06 방송 촬영 중 방문',
    'https://www.mbn.co.kr/news/sample-11', 'https://map.kakao.com'),
 (12, 2, '수성못 카페거리', 'CAFE', '대구 수성구 두산동 512', 35.8283, 128.6187,
    '/example_thumb.png', '2026.05 공개 방문',
    'https://www.mbn.co.kr/news/sample-12', 'https://map.kakao.com'),
 (13, 2, '대구 엑스코', 'VENUE', '대구 북구 엑스코로 10', 35.9204, 128.5804,
    '/example_thumb.png', '2026 전국투어 대구 공연장',
    'https://www.mbn.co.kr/news/sample-13', 'https://map.kakao.com'),
 (14, 2, '김광석 다시그리기 길', 'FILMING_LOCATION', '대구 중구 달구벌대로450길 27', 35.8657, 128.6012,
    '/example_thumb.png', '2026.04 다큐 촬영지',
    'https://www.mbn.co.kr/news/sample-14', 'https://map.kakao.com'),
 (15, 2, '서울 올림픽홀', 'VENUE', '서울 송파구 올림픽로 424', 37.5203, 127.1268,
    '/example_thumb.png', '2026 전국투어 서울 공연장',
    'https://www.mbn.co.kr/news/sample-15', 'https://map.kakao.com'),

 -- 박서진 (남해안 중심)
 (21, 3, '여수 낭만포차 거리', 'RESTAURANT', '전남 여수시 이순신광장로 30', 34.7370, 127.7376,
    '/example_thumb.png', '2026.06 방송 촬영 중 방문',
    'https://www.mbn.co.kr/news/sample-21', 'https://map.kakao.com'),
 (22, 3, '남해 다랭이마을', 'FILMING_LOCATION', '경남 남해군 남면 남면로 679', 34.7180, 127.9160,
    '/example_thumb.png', '2026.05 뮤직비디오 촬영지',
    'https://www.mbn.co.kr/news/sample-22', 'https://map.kakao.com'),
 (23, 3, '광주 양동시장 국밥골목', 'RESTAURANT', '광주 서구 천변좌하로 342', 35.1546, 126.9046,
    '/example_thumb.png', '2026.04 공개 방문',
    'https://www.mbn.co.kr/news/sample-23', 'https://map.kakao.com'),
 (24, 3, '잠실실내체육관', 'VENUE', '서울 송파구 올림픽로 25', 37.5117, 127.0730,
    '/example_thumb.png', '2026 단독 콘서트 서울 공연장',
    'https://www.mbn.co.kr/news/sample-24', 'https://map.kakao.com'),
 (25, 3, '돌산 바다뷰 카페', 'CAFE', '전남 여수시 돌산읍 진두민내길 25', 34.7040, 127.7570,
    '/example_thumb.png', '2026.03 앨범 재킷 촬영지',
    'https://www.mbn.co.kr/news/sample-25', 'https://map.kakao.com');

ALTER TABLE place ALTER COLUMN id RESTART WITH 26;

-- ─────────────────────────────── Tip ────────────────────────────────
-- ⚠️ updated_at 은 화면에 항상 노출됩니다. 플랫폼 정책이 자주 바뀌기 때문입니다.
-- ⚠️ 아티스트마다 VOTE·STREAMING·TICKETING·CHEER·FANCLUB 5종을 모두 채웁니다.
--    카테고리 필터가 비면 화면이 빈 상태로 보입니다.
INSERT INTO tip (id, star_id, title, category, thumbnail_url, content, external_url, updated_at) VALUES
 -- 성리
 (1, 1, '멜론 스밍하는 방법', 'STREAMING', '/example_thumb.png',
    '## 스트리밍 기본 규칙' || CHR(10) || '1. 1시간 이상 간격을 두고 재생하세요.' || CHR(10) || '2. 볼륨은 0으로 두지 마세요.' || CHR(10) || '3. 같은 곡 연속 반복은 집계에서 제외됩니다.',
    'https://www.melon.com', TIMESTAMP WITH TIME ZONE '2026-08-01 09:00:00+00'),
 (2, 1, '트롯가왕 투표 방법', 'VOTE', '/example_thumb.png',
    '## 문자 투표' || CHR(10) || '방송 중 자막으로 안내되는 번호로 발송하세요.' || CHR(10) || '## 앱 투표' || CHR(10) || '하루 1회 무료 투표가 제공됩니다.',
    'https://www.mbn.co.kr', TIMESTAMP WITH TIME ZONE '2026-07-28 09:00:00+00'),
 (3, 1, '전국투어 티켓팅 준비물', 'TICKETING', '/example_thumb.png',
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
    NULL, TIMESTAMP WITH TIME ZONE '2026-06-25 09:00:00+00'),

 -- 이찬원
 (11, 2, '음원 스트리밍 가이드', 'STREAMING', '/example_thumb.png',
    '## 스트리밍 기본 규칙' || CHR(10) || '1. 1시간 이상 간격을 두고 재생하세요.' || CHR(10) || '2. 볼륨은 0으로 두지 마세요.' || CHR(10) || '3. 무료 체험 계정은 집계에서 제외됩니다.',
    'https://www.melon.com', TIMESTAMP WITH TIME ZONE '2026-08-02 09:00:00+00'),
 (12, 2, '한일톱텐쇼 투표 방법', 'VOTE', '/example_thumb.png',
    '## 앱 투표' || CHR(10) || '하루 1회 무료 투표가 제공됩니다.' || CHR(10) || '## 문자 투표' || CHR(10) || '방송 중 안내되는 번호로 발송하세요.',
    'https://www.mbn.co.kr', TIMESTAMP WITH TIME ZONE '2026-07-30 09:00:00+00'),
 (13, 2, '대구 공연 티켓팅 팁', 'TICKETING', '/example_thumb.png',
    '## 예매 전 체크리스트' || CHR(10) || '- 팬클럽 선예매는 본인 인증이 선행되어야 합니다.' || CHR(10) || '- 좌석 배치도를 미리 확인하세요.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-22 09:00:00+00'),
 (14, 2, '떼창 구간 안내', 'CHEER', '/example_thumb.png',
    '## 공연장 응원 매너' || CHR(10) || '- 간주 구간에서만 함께 불러주세요.' || CHR(10) || '- 앞자리 관객의 시야를 가리지 않도록 주의해 주세요.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-14 09:00:00+00'),
 (15, 2, '공식 팬클럽 가입 안내', 'FANCLUB', '/example_thumb.png',
    '## 가입 절차' || CHR(10) || '상시 모집이며 가입 즉시 선예매 권한이 부여됩니다.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-04 09:00:00+00'),
 (16, 2, '해외 팬 투표 참여 방법', 'VOTE', '/example_thumb.png',
    '## For international fans' || CHR(10) || 'App voting is available worldwide. SMS voting is limited to Korean carriers.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-06-28 09:00:00+00'),

 -- 박서진
 (21, 3, '신보 [항해] 스트리밍 가이드', 'STREAMING', '/example_thumb.png',
    '## 스트리밍 기본 규칙' || CHR(10) || '1. 1시간 이상 간격을 두고 재생하세요.' || CHR(10) || '2. 전곡 재생이 타이틀곡 반복보다 유리합니다.',
    'https://www.melon.com', TIMESTAMP WITH TIME ZONE '2026-08-03 09:00:00+00'),
 (22, 3, '현역가왕 투표 방법', 'VOTE', '/example_thumb.png',
    '## 앱 투표' || CHR(10) || '하루 1회 무료 투표가 제공됩니다.' || CHR(10) || '## 유의사항' || CHR(10) || '중복 계정 투표는 무효 처리됩니다.',
    'https://www.mbn.co.kr', TIMESTAMP WITH TIME ZONE '2026-07-31 09:00:00+00'),
 (23, 3, '단독 콘서트 티켓팅 준비물', 'TICKETING', '/example_thumb.png',
    '## 예매 전 체크리스트' || CHR(10) || '- 예매처 계정을 미리 만들어 두세요.' || CHR(10) || '- 동시 접속이 몰리므로 유선 네트워크를 권장합니다.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-24 09:00:00+00'),
 (24, 3, '응원 슬로건 제작 안내', 'CHEER', '/example_thumb.png',
    '## 공연장 응원 매너' || CHR(10) || '- 슬로건은 A4 이하 크기를 권장합니다.' || CHR(10) || '- 발라드 구간에는 내려주세요.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-16 09:00:00+00'),
 (25, 3, '공식 팬클럽 가입 안내', 'FANCLUB', '/example_thumb.png',
    '## 가입 절차' || CHR(10) || '연 2회 모집하며 굿즈 선구매 권한이 부여됩니다.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-06 09:00:00+00'),
 (26, 3, '해외 팬 굿즈 배송 안내', 'FANCLUB', '/example_thumb.png',
    '## For international fans' || CHR(10) || 'Global shipping is available for official goods. Check the regional fee table.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-06-30 09:00:00+00');

ALTER TABLE tip ALTER COLUMN id RESTART WITH 27;

-- ────────────────────────────── Content ─────────────────────────────
-- 기사(ARTICLE), 영상(VIDEO), 게시글(POST)이 한 테이블에 섞여 있습니다.
--
-- ⚠️ **아티스트당 11건 고정 구성** — 이 조합이 화면 세 곳을 동시에 채웁니다.
--      ARTICLE ×3        방송 탭 기사 · AI 분석 대상
--      VIDEO   ×4        롱폼 목록 (그중 1건은 live=TRUE → LIVE 배너)
--      POST/STAR ×2      소식 스레드 — 아티스트가 직접 올린 글
--      POST/MANAGER ×2   소식 스레드 — 팬매니저 공지
-- ⚠️ live=TRUE 는 LIVE 배지 표시용 플래그일 뿐 실시간 스트리밍 연동이 아닙니다.
-- ⚠️ 기사 본문의 [[용어|설명]] 은 FE 가 파싱해 툴팁으로 렌더합니다 (별도 API 없음).
-- ⚠️ **comment_count 는 아래 comment 테이블의 실제 행 수와 일치해야 합니다.**
-- ⚠️ **published_at 은 반드시 과거**여야 합니다. 미래면 "6시간 후" 로 표시됩니다.
-- ⚠️ **워밍업 비용**: AiAnalysisWarmup 이 콘텐츠 33건 × 언어 2종 = 66건을 기동 시 생성합니다.
--    live provider 면 백그라운드로 1~3분 걸립니다. 데모 직전이 아니라 미리 기동해 두세요.
INSERT INTO content (id, star_id, channel_id, type, author_type, author_name, author_profile_image_url, title, thumbnail_url, published_at, view_count, like_count, comment_count, body, reporter_name, reporter_avatar_url, media_url, duration_sec, live, viewer_count) VALUES

 -- ══════════════════ 성리 (star 1) ══════════════════
 (1, 1, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN',
    '"팬 여러분 덕분이에요"…성리, 전국투어 서울 공연 전석 매진',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-06 10:00:00+00', 27400, 212, 3,
    '[ 앵커멘트 ]' || CHR(10) || '가수 성리의 2026 전국투어 서울 공연이 예매 시작 12분 만에 전석 매진됐습니다. 이번 공연은 [[스탠딩석|무대 앞 입석 구역으로, 좌석 없이 관람하는 자리]]을 포함해 총 1만 2천석 규모로 진행됩니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '소속사는 추가 회차 편성을 검토 중이라고 밝혔습니다. 지방 공연은 부산에서 이어집니다.' || CHR(10) || CHR(10) || '- 인터뷰 : 성리 / 가수' || CHR(10) || '"이렇게 많은 분들이 기다려 주실 줄 몰랐어요. 좋은 무대로 보답하겠습니다."',
    '심가현 기자', 'https://placehold.co/80x80/F58220/FFFFFF?text=SIM', NULL, NULL, FALSE, NULL),

 (2, 1, 2, 'VIDEO', 'CHANNEL', 'MBN 트롯', 'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',
    '신곡 [첫사랑 편지] 최초 라이브 무대',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-05 12:00:00+00', 121000, 3102, 2,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', 214, FALSE, NULL),

 (3, 1, 2, 'VIDEO', 'CHANNEL', 'MBN 트롯', 'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',
    '트롯가왕 본선 2차 생중계',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 02:00:00+00', 8200, 431, 0,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', NULL, TRUE, 82),

 (4, 1, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN',
    '성리 팬덤, 데뷔 기념일 맞아 아동복지시설에 3천만원 기부',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-04 09:00:00+00', 18300, 154, 1,
    '[ 앵커멘트 ]' || CHR(10) || '가수 성리의 팬덤이 데뷔 기념일을 맞아 아동복지시설에 3천만원을 기부했습니다. 이번 기부는 [[팬덤 모금|팬들이 자발적으로 모금해 스타의 이름으로 기부하는 문화]]의 사례로 꼽힙니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '팬덤 측은 모금 내역과 기부 영수증을 전액 공개했습니다.',
    '박준영 기자', 'https://placehold.co/80x80/E4741A/FFFFFF?text=PARK', NULL, NULL, FALSE, NULL),

 (5, 1, 2, 'VIDEO', 'CHANNEL', 'MBN 트롯', 'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',
    '0730 성리 콘서트 직관 영상',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-07-30 12:00:00+00', 88120, 2431, 0,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', 251, FALSE, NULL),

 (6, 1, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN',
    '성리 신곡 [첫사랑 편지], 발매 첫 주 음원 차트 1위',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-07-18 09:00:00+00', 31200, 245, 0,
    '[ 앵커멘트 ]' || CHR(10) || '성리의 신곡 [첫사랑 편지]가 발매 첫 주 주요 음원 차트에서 1위를 기록했습니다. [[퍼펙트 올킬|국내 모든 주요 음원 차트에서 동시에 1위를 차지하는 것]]도 함께 달성했습니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '음반 판매량도 초동 기준 자체 최고치를 경신했습니다.',
    '심가현 기자', 'https://placehold.co/80x80/F58220/FFFFFF?text=SIM', NULL, NULL, FALSE, NULL),

 (7, 1, 3, 'VIDEO', 'CHANNEL', 'MBN 한일톱텐쇼', 'https://placehold.co/64x64/EA580C/FFFFFF?text=T10',
    '성리 [찔레꽃] 무대 직캠',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-07-15 12:00:00+00', 64300, 1980, 0,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', 298, FALSE, NULL),

 (8, 1, 2, 'POST', 'STAR', '성리', 'https://placehold.co/200x200/F58220/FFFFFF?text=SR',
    '오늘도 연습실이에요 ^^',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 09:00:00+00', 0, 12300, 1,
    '오늘도 연습실이에요 ^^ 목 관리 잘하고 좋은 무대로 만나요!',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 (9, 1, 2, 'POST', 'STAR', '성리', 'https://placehold.co/200x200/F58220/FFFFFF?text=SR',
    '팬미팅 준비 중입니다',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 04:00:00+00', 0, 9800, 1,
    '팬미팅 준비 중입니다. 어떤 이야기 나눌지 고민이 많아요. 곧 만나요!',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 -- ⚠️ 팬매니저 공지 — 소식 스레드의 세 번째 종류입니다 (아티스트 글 / 공지 / 롱폼).
 --    `author_type='MANAGER'` 이면 FE 가 마스코트 아바타 + 종 아이콘 + 연한 오렌지
 --    말풍선으로 렌더합니다 (Figma 27:6288).
 -- ⚠️ **작성 주체는 AI 도우미 "비엔이" 이며 스타 본인이 아닙니다** (기획서 5-2).
 --    공지 문안에 아티스트 1인칭을 쓰지 마세요 — 그 순간 사칭이 됩니다.
 -- thumbnail_url 은 목록 폴백용이고, 공지 카드는 사진을 렌더하지 않습니다.
 (10, 1, 2, 'POST', 'MANAGER', '팬매니저', '/bienie-banner.png',
    '8월 30일 서울 공연 응모 안내',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 07:00:00+00', 0, 12300, 2,
    '8월 30일 KSPO DOME 공연 응모가 열렸습니다. 응모는 공연 화면에서 하실 수 있어요.',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 (11, 1, 2, 'POST', 'MANAGER', '팬매니저', '/bienie-banner.png',
    '대전 출발 버스 대절 모집 마감 안내',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 01:00:00+00', 0, 8100, 1,
    '대전 출발 버스 대절 모집이 8월 25일에 마감됩니다. 남은 자리는 모집 화면에서 확인해 주세요.',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 -- ══════════════════ 이찬원 (star 2) ══════════════════
 (21, 2, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN',
    '"고향에서 노래하고 싶었어요"…이찬원, 대구 공연 추가 편성',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-06 08:00:00+00', 29800, 231, 3,
    '[ 앵커멘트 ]' || CHR(10) || '가수 이찬원의 2026 전국투어에 대구 공연이 추가 편성됐습니다. 서울 공연이 [[선예매|팬클럽 회원에게 일반 예매보다 먼저 열리는 예매 회차]] 단계에서 매진된 데 따른 결정입니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '대구 공연은 9월 26일 엑스코에서 열립니다.' || CHR(10) || CHR(10) || '- 인터뷰 : 이찬원 / 가수' || CHR(10) || '"고향에서 노래하는 건 언제나 특별합니다. 꼭 좋은 무대 보여드릴게요."',
    '심가현 기자', 'https://placehold.co/80x80/F58220/FFFFFF?text=SIM', NULL, NULL, FALSE, NULL),

 (22, 2, 2, 'VIDEO', 'CHANNEL', 'MBN 트롯', 'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',
    '신곡 [진심 한 줄] 최초 라이브 무대',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-05 11:00:00+00', 143000, 3840, 2,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', 226, FALSE, NULL),

 (23, 2, 3, 'VIDEO', 'CHANNEL', 'MBN 한일톱텐쇼', 'https://placehold.co/64x64/EA580C/FFFFFF?text=T10',
    '한일톱텐쇼 본선 무대 생중계',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 03:00:00+00', 11400, 612, 0,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', NULL, TRUE, 141),

 (24, 2, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN',
    '이찬원 팬덤, 지역 아동센터에 도서 5천 권 기부',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-03 09:00:00+00', 16700, 142, 1,
    '[ 앵커멘트 ]' || CHR(10) || '가수 이찬원의 팬덤이 대구·경북 지역 아동센터 12곳에 도서 5천 권을 기부했습니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '팬덤 측은 [[기부 인증|모금액과 사용처를 영수증으로 공개해 검증받는 절차]] 자료를 함께 공개했습니다.',
    '박준영 기자', 'https://placehold.co/80x80/E4741A/FFFFFF?text=PARK', NULL, NULL, FALSE, NULL),

 (25, 2, 2, 'VIDEO', 'CHANNEL', 'MBN 트롯', 'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',
    '0812 이찬원 팬미팅 하이라이트',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-07-29 12:00:00+00', 76400, 2210, 0,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', 341, FALSE, NULL),

 (26, 2, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN',
    '데뷔 후 첫 단독 전국투어…이찬원, 8개 도시 순회',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-07-17 09:00:00+00', 24300, 189, 0,
    '[ 앵커멘트 ]' || CHR(10) || '가수 이찬원이 데뷔 후 첫 단독 전국투어에 나섭니다. 서울을 시작으로 8개 도시를 순회합니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '제작진은 도시마다 [[세트리스트|공연에서 부를 곡의 순서 목록]]를 다르게 구성한다고 밝혔습니다.',
    '심가현 기자', 'https://placehold.co/80x80/F58220/FFFFFF?text=SIM', NULL, NULL, FALSE, NULL),

 (27, 2, 2, 'VIDEO', 'CHANNEL', 'MBN 트롯', 'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',
    '이찬원 [편지] 무대 직캠',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-07-13 12:00:00+00', 58900, 1720, 0,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', 265, FALSE, NULL),

 (28, 2, 2, 'POST', 'STAR', '이찬원', 'https://placehold.co/200x200/E4741A/FFFFFF?text=CW',
    '대구 다녀왔어요',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 08:00:00+00', 0, 14100, 1,
    '대구 다녀왔어요. 시장 칼국수는 역시 최고입니다 ^^',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 (29, 2, 2, 'POST', 'STAR', '이찬원', 'https://placehold.co/200x200/E4741A/FFFFFF?text=CW',
    '연습실에서 인사드려요',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-06 23:00:00+00', 0, 10600, 1,
    '연습실에서 인사드려요. 투어 준비 열심히 하고 있습니다!',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 (30, 2, 2, 'POST', 'MANAGER', '팬매니저', '/bienie-banner.png',
    '9월 26일 대구 공연 일정 추가 안내',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 06:00:00+00', 0, 11700, 2,
    '9월 26일 대구 엑스코 공연이 추가로 열립니다. 응모는 공연 화면에서 하실 수 있어요.',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 (31, 2, 2, 'POST', 'MANAGER', '팬매니저', '/bienie-banner.png',
    '팬사인회 응모 방법 안내',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-06 22:00:00+00', 0, 7600, 1,
    '8월 23일 코엑스 팬사인회 응모 방법을 안내드립니다. 자세한 내용은 공연 화면을 확인해 주세요.',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 -- ══════════════════ 박서진 (star 3) ══════════════════
 (41, 3, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN',
    '"바다에서 배운 노래"…박서진, 단독 콘서트 서울 공연 매진',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-06 06:00:00+00', 26100, 204, 3,
    '[ 앵커멘트 ]' || CHR(10) || '가수 박서진의 단독 콘서트 서울 공연이 전석 매진됐습니다. 9월 6일 잠실실내체육관에서 열립니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '소속사는 [[리허설 공개|본 공연 전 일부 관객에게 준비 과정을 여는 행사]] 회차도 함께 검토 중이라고 밝혔습니다.' || CHR(10) || CHR(10) || '- 인터뷰 : 박서진 / 가수' || CHR(10) || '"무대에 설 수 있는 게 아직도 실감이 안 납니다. 끝까지 열심히 하겠습니다."',
    '심가현 기자', 'https://placehold.co/80x80/F58220/FFFFFF?text=SIM', NULL, NULL, FALSE, NULL),

 (42, 3, 2, 'VIDEO', 'CHANNEL', 'MBN 트롯', 'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',
    '신곡 [바다에 묻다] 최초 라이브 무대',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-04 12:00:00+00', 132000, 3510, 2,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', 238, FALSE, NULL),

 (43, 3, 3, 'VIDEO', 'CHANNEL', 'MBN 한일톱텐쇼', 'https://placehold.co/64x64/EA580C/FFFFFF?text=T10',
    '현역가왕 특별무대 생중계',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 01:30:00+00', 9600, 502, 0,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', NULL, TRUE, 97),

 (44, 3, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN',
    '박서진 팬덤, 어촌 청소년 장학금 4천만원 전달',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-02 09:00:00+00', 17900, 161, 1,
    '[ 앵커멘트 ]' || CHR(10) || '가수 박서진의 팬덤이 남해안 어촌 지역 청소년에게 장학금 4천만원을 전달했습니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '팬덤 측은 모금 내역과 전달 확인서를 전액 공개했습니다.',
    '박준영 기자', 'https://placehold.co/80x80/E4741A/FFFFFF?text=PARK', NULL, NULL, FALSE, NULL),

 (45, 3, 2, 'VIDEO', 'CHANNEL', 'MBN 트롯', 'https://placehold.co/64x64/E4741A/FFFFFF?text=TR',
    '0805 박서진 콘서트 직관 영상',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-07-27 12:00:00+00', 71200, 2080, 0,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', 274, FALSE, NULL),

 (46, 3, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', 'https://placehold.co/64x64/F58220/FFFFFF?text=MBN',
    '박서진, 정규 [항해] 발매…초동 판매량 자체 최고',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-07-16 09:00:00+00', 22800, 178, 0,
    '[ 앵커멘트 ]' || CHR(10) || '가수 박서진의 정규 앨범 [항해]가 발매 첫 주 [[초동|앨범 발매 후 첫 일주일 동안의 판매량]] 기준 자체 최고치를 기록했습니다.' || CHR(10) || CHR(10) || '[ 기자 ]' || CHR(10) || '수록곡 전곡이 주요 음원 차트에 진입했습니다.',
    '심가현 기자', 'https://placehold.co/80x80/F58220/FFFFFF?text=SIM', NULL, NULL, FALSE, NULL),

 (47, 3, 3, 'VIDEO', 'CHANNEL', 'MBN 한일톱텐쇼', 'https://placehold.co/64x64/EA580C/FFFFFF?text=T10',
    '박서진 트로트 메들리 무대 직캠',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-07-11 12:00:00+00', 61500, 1860, 0,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/d4pWjMsd0go', 312, FALSE, NULL),

 (48, 3, 2, 'POST', 'STAR', '박서진', 'https://placehold.co/200x200/EA580C/FFFFFF?text=SJ',
    '여수 다녀왔습니다',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 05:00:00+00', 0, 13400, 1,
    '여수 다녀왔습니다. 바다 보고 오니 목소리가 트이는 것 같아요 ^^',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 (49, 3, 2, 'POST', 'STAR', '박서진', 'https://placehold.co/200x200/EA580C/FFFFFF?text=SJ',
    '새 앨범 준비 중이에요',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-06 21:00:00+00', 0, 9200, 1,
    '새 앨범 준비 중이에요. 이번엔 바다 이야기를 많이 담았습니다.',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 (50, 3, 2, 'POST', 'MANAGER', '팬매니저', '/bienie-banner.png',
    '9월 6일 서울 공연 응모 안내',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-07 04:30:00+00', 0, 10800, 2,
    '9월 6일 잠실실내체육관 공연 응모가 열렸습니다. 응모는 공연 화면에서 하실 수 있어요.',
    NULL, NULL, NULL, NULL, FALSE, NULL),

 (51, 3, 2, 'POST', 'MANAGER', '팬매니저', '/bienie-banner.png',
    '여수 출발 버스 대절 모집 안내',
    '/example_thumb.png', TIMESTAMP WITH TIME ZONE '2026-08-06 20:00:00+00', 0, 6900, 1,
    '여수 출발 버스 대절 모집이 진행 중입니다. 남은 자리는 모집 화면에서 확인해 주세요.',
    NULL, NULL, NULL, NULL, FALSE, NULL);

ALTER TABLE content ALTER COLUMN id RESTART WITH 52;

-- ─────────────────────────── ContentPlace ───────────────────────────
-- 뉴스 상세 하단 "기사에 나온 그 곳" 캐러셀.
-- ⚠️ content 와 place 의 star_id 가 서로 달라지지 않도록 주의하세요.
INSERT INTO content_place (id, content_id, place_id, sort_order) VALUES
 -- 성리
 (1,  1,  3, 0),   -- 서울 공연 매진 기사 → KSPO DOME
 (2,  6,  5, 0),   -- 신곡 차트 1위 기사 → 성수동 사진관
 (3,  4,  1, 0),   -- 기부 기사 → 충무로 손칼국수
 -- 이찬원
 (11, 21, 13, 0),  -- 대구 공연 추가 기사 → 대구 엑스코
 (12, 26, 15, 0),  -- 전국투어 기사 → 서울 올림픽홀
 (13, 24, 11, 0),  -- 기부 기사 → 서문시장 칼국수 골목
 -- 박서진
 (21, 41, 24, 0),  -- 서울 공연 매진 기사 → 잠실실내체육관
 (22, 46, 22, 0),  -- 정규 앨범 기사 → 남해 다랭이마을
 (23, 44, 21, 0);  -- 기부 기사 → 여수 낭만포차 거리

ALTER TABLE content_place ALTER COLUMN id RESTART WITH 24;

-- ───────────────────────────── Gathering ─────────────────────────────
-- ⚠️ type 은 BUS / DONATION 두 가지뿐입니다 (광고·생일 등은 기획에서 제외됐습니다).
-- ⚠️ status 는 RECRUITING / FULL / CLOSED 입니다. OPEN 이 아닙니다.
-- ⚠️ current_count <= capacity 여야 합니다. 같으면 FULL 로 두세요.
-- ⚠️ fee 는 표시 전용입니다. 플랫폼은 결제를 중개하지 않습니다.
-- ⚠️ **제목에 출발지·도착지를 넣습니다.** 음성 "대전에서 서울 가는 버스 신청해줘" 가
--    제목의 지역어 일치 개수로 대상을 고릅니다.
-- ⚠️ summary·meeting_point·event_at·fee·notice 를 비우면 **모집 대화방의 AI 요약이 빈약해집니다.**
--    대화방 요약은 이 필드들을 그대로 읽습니다.
--
-- 데모 시나리오: id=1 (34/40) 에 참여 신청 → 35/40 으로 즉시 반영 (디자인 화면과 동일한 수치).
INSERT INTO gathering (id, star_id, host_id, title, type, cover_image_url, summary, description, status, current_count, capacity, deadline, event_at, meeting_point, fee, payment_info, refund_policy, notice, official) VALUES
 -- 성리
 (1, 1, 7, '0830 대전에서 서울로 가는 버스 대절 모집', 'BUS',
    '/example_thumb.png',
    '대전역에서 KSPO DOME 까지 가는 왕복 전세버스입니다. 08:00까지 도착하시면 됩니다.',
    '서울 KSPO DOME 공연 관람을 위한 대전 출발 왕복 전세버스입니다. 공연 종료 후 대전역으로 복귀합니다.',
    'RECRUITING', 34, 40, DATE '2026-08-25', TIMESTAMP WITH TIME ZONE '2026-08-30 23:00:00+00',
    '대전역 동광장', 30000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    '지정 시간 08:00까지 늦지 않게 모여주세요.', TRUE),

 (2, 1, 7, '아동복지시설 기부금 모금', 'DONATION',
    '/example_thumb.png',
    '팬덤 이름으로 아동복지시설에 기부합니다. 1인 1만원부터 참여 가능합니다.',
    '팬덤 이름으로 아동복지시설에 기부합니다. 모금 내역과 기부 영수증은 모임 종료 후 전체 공개됩니다.',
    'RECRUITING', 128, 200, DATE '2026-08-31', TIMESTAMP WITH TIME ZONE '2026-09-01 00:00:00+00',
    '온라인', 10000, '모금 계좌는 공지사항 참조', '기부 특성상 환불 불가',
    '기부금 사용 내역은 종료 후 공개됩니다.', TRUE),

 (3, 1, 7, '0919 서울에서 부산으로 가는 버스 대절 모집', 'BUS',
    '/example_thumb.png',
    '서울역에서 부산 벡스코까지 가는 왕복 전세버스입니다. 06:30까지 도착하시면 됩니다.',
    '부산 벡스코 공연 관람을 위한 서울 출발 왕복 전세버스입니다. 공연 종료 후 서울역으로 복귀합니다.',
    'RECRUITING', 12, 40, DATE '2026-09-14', TIMESTAMP WITH TIME ZONE '2026-09-19 23:30:00+00',
    '서울역 서부광장', 45000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    '왕복 8시간 이동이니 편한 복장으로 오세요.', TRUE),

 (4, 1, 7, '0814 팬미팅 버스 대절 (광주 출발)', 'BUS',
    '/example_thumb.png',
    '광주 출발 전세버스입니다. 모집이 완료되었습니다.',
    '서울 올림픽홀 팬미팅 관람을 위한 광주 출발 왕복 전세버스. 정원이 모두 찼습니다.',
    'FULL', 45, 45, DATE '2026-08-11', TIMESTAMP WITH TIME ZONE '2026-08-14 22:00:00+00',
    '광주송정역 광장', 40000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    NULL, TRUE),

 -- 이찬원
 (11, 2, 7, '0912 대구에서 서울로 가는 버스 대절 모집', 'BUS',
    '/example_thumb.png',
    '동대구역에서 올림픽홀까지 가는 왕복 전세버스입니다. 07:30까지 도착하시면 됩니다.',
    '서울 올림픽홀 공연 관람을 위한 대구 출발 왕복 전세버스입니다. 공연 종료 후 동대구역으로 복귀합니다.',
    'RECRUITING', 22, 40, DATE '2026-09-08', TIMESTAMP WITH TIME ZONE '2026-09-12 22:30:00+00',
    '동대구역 동광장', 32000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    '지정 시간 07:30까지 늦지 않게 모여주세요.', TRUE),

 (12, 2, 7, '지역 아동센터 도서 기부금 모금', 'DONATION',
    '/example_thumb.png',
    '대구·경북 아동센터에 도서를 기부합니다. 1인 5천원부터 참여 가능합니다.',
    '팬덤 이름으로 지역 아동센터에 도서를 기부합니다. 모금 내역과 전달 확인서는 종료 후 전체 공개됩니다.',
    'RECRUITING', 88, 150, DATE '2026-09-15', TIMESTAMP WITH TIME ZONE '2026-09-18 00:00:00+00',
    '온라인', 5000, '모금 계좌는 공지사항 참조', '기부 특성상 환불 불가',
    '도서 목록은 참여자 투표로 정합니다.', TRUE),

 (13, 2, 7, '0926 부산에서 대구로 가는 버스 대절 모집', 'BUS',
    '/example_thumb.png',
    '부산역에서 대구 엑스코까지 가는 왕복 전세버스입니다. 08:30까지 도착하시면 됩니다.',
    '대구 엑스코 공연 관람을 위한 부산 출발 왕복 전세버스입니다. 공연 종료 후 부산역으로 복귀합니다.',
    'RECRUITING', 9, 40, DATE '2026-09-21', TIMESTAMP WITH TIME ZONE '2026-09-26 22:30:00+00',
    '부산역 광장', 28000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    '지정 시간까지 늦지 않게 모여주세요.', FALSE),

 (14, 2, 7, '연탄 나눔 기부금 모금', 'DONATION',
    '/example_thumb.png',
    '지난 겨울 연탄 나눔 모금입니다. 모집이 종료되었습니다.',
    '팬덤 이름으로 연탄 5천 장을 전달했습니다. 사용 내역은 공지사항에 공개돼 있습니다.',
    'CLOSED', 150, 150, DATE '2026-07-20', TIMESTAMP WITH TIME ZONE '2026-07-25 00:00:00+00',
    '온라인', 10000, '모금 종료', '기부 특성상 환불 불가',
    '전달 완료. 영수증은 공지사항에서 확인하실 수 있습니다.', TRUE),

 -- 박서진
 (21, 3, 7, '0906 여수에서 서울로 가는 버스 대절 모집', 'BUS',
    '/example_thumb.png',
    '여수엑스포역에서 잠실실내체육관까지 가는 왕복 전세버스입니다. 06:00까지 도착하시면 됩니다.',
    '서울 잠실실내체육관 공연 관람을 위한 여수 출발 왕복 전세버스입니다. 공연 종료 후 여수로 복귀합니다.',
    'RECRUITING', 18, 40, DATE '2026-09-01', TIMESTAMP WITH TIME ZONE '2026-09-06 23:30:00+00',
    '여수엑스포역 광장', 48000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    '왕복 9시간 이동입니다. 편한 복장으로 오세요.', TRUE),

 (22, 3, 7, '어촌 청소년 장학금 모금', 'DONATION',
    '/example_thumb.png',
    '남해안 어촌 지역 청소년 장학금을 모읍니다. 1인 1만원부터 참여 가능합니다.',
    '팬덤 이름으로 어촌 지역 청소년에게 장학금을 전달합니다. 모금 내역과 전달 확인서는 종료 후 전체 공개됩니다.',
    'RECRUITING', 72, 120, DATE '2026-09-10', TIMESTAMP WITH TIME ZONE '2026-09-14 00:00:00+00',
    '온라인', 10000, '모금 계좌는 공지사항 참조', '기부 특성상 환불 불가',
    '전달식은 온라인으로 중계됩니다.', TRUE),

 (23, 3, 7, '0927 서울에서 광주로 가는 버스 대절 모집', 'BUS',
    '/example_thumb.png',
    '서울역에서 광주 염주체육관까지 가는 왕복 전세버스입니다. 07:00까지 도착하시면 됩니다.',
    '광주 염주체육관 공연 관람을 위한 서울 출발 왕복 전세버스입니다. 공연 종료 후 서울역으로 복귀합니다.',
    'RECRUITING', 7, 40, DATE '2026-09-22', TIMESTAMP WITH TIME ZONE '2026-09-27 23:00:00+00',
    '서울역 서부광장', 42000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    '지정 시간까지 늦지 않게 모여주세요.', FALSE),

 (24, 3, 7, '유기동물 보호소 수술비 모금', 'DONATION',
    '/example_thumb.png',
    '유기동물 보호소 수술비를 함께 모읍니다. 1인 5천원부터 참여 가능합니다.',
    '팬덤 이름으로 유기동물 보호소에 수술비를 지원합니다. 모금 내역은 종료 후 전체 공개됩니다.',
    'RECRUITING', 64, 150, DATE '2026-09-12', TIMESTAMP WITH TIME ZONE '2026-09-16 00:00:00+00',
    '온라인', 5000, '모금 계좌는 공지사항 참조', '기부 특성상 환불 불가',
    '모금 내역은 종료 후 공개됩니다.', FALSE);

ALTER TABLE gathering ALTER COLUMN id RESTART WITH 25;

-- ────────────────────────────── Comment ─────────────────────────────
-- ⚠️ 작성자 국가를 섞어둡니다. 댓글 화면에서 국기가 섞여 보이는 것이 데모의 핵심 장면입니다.
-- ⚠️ **content.comment_count 와 행 수가 정확히 일치해야 합니다.**
--    아티스트별 분포: content +1 에 3건, +2 에 2건, +4 에 1건, +8/+9 에 1건씩, +10 에 2건, +11 에 1건.
INSERT INTO comment (id, content_id, author_id, body, like_count, created_at, deleted_at) VALUES
 -- 성리
 (1,  1,  2, '드디어 매진이라니! 티켓 못 구한 분들 위해 추가 회차 꼭 열렸으면 좋겠어요.', 212, TIMESTAMP WITH TIME ZONE '2026-08-06 12:21:00+00', NULL),
 (2,  1,  4, 'Flew in from Chicago just for this. Cannot wait to finally see her live!',      187, TIMESTAMP WITH TIME ZONE '2026-08-06 13:40:00+00', NULL),
 (3,  1,  5, '日本からも応援しています。ソウル公演、絶対に行きます！',                          143, TIMESTAMP WITH TIME ZONE '2026-08-06 15:02:00+00', NULL),
 (4,  2,  6, 'Sa voix est incroyable. Je découvre le trot grâce à elle.',                      98, TIMESTAMP WITH TIME ZONE '2026-08-05 14:10:00+00', NULL),
 (5,  2,  3, '노래 왜 이리 잘함? 라이브가 음원이랑 똑같아요.',                                 254, TIMESTAMP WITH TIME ZONE '2026-08-05 16:33:00+00', NULL),
 (6,  4,  8, 'Un fandom que publica sus donaciones. ¡Qué orgullo!',                            176, TIMESTAMP WITH TIME ZONE '2026-08-04 10:15:00+00', NULL),
 (7,  8,  4, 'Take care of your voice! Looking forward to the next stage.',                     91, TIMESTAMP WITH TIME ZONE '2026-08-07 11:12:00+00', NULL),
 (8,  9,  5, '日本から応援しています。ファンミーティング楽しみです！',                           73, TIMESTAMP WITH TIME ZONE '2026-08-07 06:20:00+00', NULL),
 (9,  10, 2, '응모 열렸다니 너무 좋아요! 몇 시까지 가능한가요?',                               148, TIMESTAMP WITH TIME ZONE '2026-08-07 08:15:00+00', NULL),
 (10, 10, 9, 'Наконец-то! Уже отметила дату в календаре.',                                      96, TIMESTAMP WITH TIME ZONE '2026-08-07 08:41:00+00', NULL),
 (11, 11, 3, '대전 출발 아직 자리 남았나요? 마감 전에 신청할게요.',                             64, TIMESTAMP WITH TIME ZONE '2026-08-07 02:30:00+00', NULL),

 -- 이찬원
 (21, 21, 3, '대구 공연 추가라니! 고향 무대는 확실히 다르죠.',                                 231, TIMESTAMP WITH TIME ZONE '2026-08-06 09:20:00+00', NULL),
 (22, 21, 4, 'Adding a Daegu show was the right call. Hope I can get a ticket.',                158, TIMESTAMP WITH TIME ZONE '2026-08-06 10:05:00+00', NULL),
 (23, 21, 6, 'Enfin une date en province ! Je réserve mon vol.',                               121, TIMESTAMP WITH TIME ZONE '2026-08-06 11:44:00+00', NULL),
 (24, 22, 2, '이번 신곡 도입부 진짜 좋네요. 계속 듣게 돼요.',                                  268, TIMESTAMP WITH TIME ZONE '2026-08-05 12:30:00+00', NULL),
 (25, 22, 5, '生歌が音源と同じでびっくりしました。',                                           134, TIMESTAMP WITH TIME ZONE '2026-08-05 13:10:00+00', NULL),
 (26, 24, 8, 'Cinco mil libros… qué bonito proyecto.',                                         142, TIMESTAMP WITH TIME ZONE '2026-08-03 10:40:00+00', NULL),
 (27, 28, 2, '서문시장 칼국수 저도 좋아해요! 다음엔 납작만두도 드셔보세요.',                    112, TIMESTAMP WITH TIME ZONE '2026-08-07 09:30:00+00', NULL),
 (28, 29, 9, 'Удачи на репетициях! Ждём тур.',                                                  88, TIMESTAMP WITH TIME ZONE '2026-08-07 01:05:00+00', NULL),
 (29, 30, 3, '대구 공연 응모 언제부터 가능한가요? 알림 신청해 뒀어요.',                        155, TIMESTAMP WITH TIME ZONE '2026-08-07 07:10:00+00', NULL),
 (30, 30, 4, 'Another show! Counting the days.',                                                97, TIMESTAMP WITH TIME ZONE '2026-08-07 07:35:00+00', NULL),
 (31, 31, 5, 'ファンサイン会、応募方法が分かりやすくて助かります。',                             61, TIMESTAMP WITH TIME ZONE '2026-08-06 23:20:00+00', NULL),

 -- 박서진
 (41, 41, 2, '매진 축하드려요! 잠실에서 뵐게요.',                                              204, TIMESTAMP WITH TIME ZONE '2026-08-06 07:15:00+00', NULL),
 (42, 41, 5, 'ソウル公演、チケット取れました。今から楽しみです！',                              149, TIMESTAMP WITH TIME ZONE '2026-08-06 08:02:00+00', NULL),
 (43, 41, 9, 'Первый раз лечу в Сеул ради концерта. Очень волнуюсь!',                          118, TIMESTAMP WITH TIME ZONE '2026-08-06 09:31:00+00', NULL),
 (44, 42, 3, '가사가 바다 이야기라 그런지 더 뭉클하네요.',                                     241, TIMESTAMP WITH TIME ZONE '2026-08-04 13:20:00+00', NULL),
 (45, 42, 6, 'Cette chanson me donne des frissons. Magnifique.',                               126, TIMESTAMP WITH TIME ZONE '2026-08-04 14:05:00+00', NULL),
 (46, 44, 4, 'Scholarships for fishing village students — this is what fandom should be.',     161, TIMESTAMP WITH TIME ZONE '2026-08-02 10:20:00+00', NULL),
 (47, 48, 8, '¡Qué bonito el mar de Yeosu! Espero visitarlo algún día.',                       104, TIMESTAMP WITH TIME ZONE '2026-08-07 06:40:00+00', NULL),
 (48, 49, 2, '바다 이야기 담은 앨범이라니 벌써 기대돼요!',                                      95, TIMESTAMP WITH TIME ZONE '2026-08-06 22:15:00+00', NULL),
 (49, 50, 3, '잠실 공연 응모했어요! 꼭 당첨되면 좋겠네요.',                                    138, TIMESTAMP WITH TIME ZONE '2026-08-07 05:20:00+00', NULL),
 (50, 50, 5, '応募方法の案内、ありがとうございます。',                                           82, TIMESTAMP WITH TIME ZONE '2026-08-07 05:48:00+00', NULL),
 (51, 51, 2, '여수 출발이면 저희 동네예요! 바로 신청할게요.',                                   71, TIMESTAMP WITH TIME ZONE '2026-08-06 21:10:00+00', NULL);

ALTER TABLE comment ALTER COLUMN id RESTART WITH 52;

-- ──────────────────────── CommentTranslation ────────────────────────
-- ⚠️ 스텁 AI provider 는 번역을 흉내 내지 않고 503 을 던집니다 (가짜 번역이 더 위험).
--    데모에서 번역 버튼이 동작하도록 시드 댓글의 번역을 미리 채워둡니다.
--    OpenAI 연결 후에는 캐시가 없는 댓글도 실시간 번역됩니다.
-- ⚠️ 캐시 키는 (comment_id, locale) 입니다. 아티스트마다 최소 1건씩은 채워두세요.
INSERT INTO comment_translation (id, comment_id, locale, translated_body, created_at) VALUES
 -- 성리
 (1, 1, 'EN', 'Sold out already! I really hope they add more shows for those who missed out.', TIMESTAMP WITH TIME ZONE '2026-08-06 12:22:00+00'),
 (2, 2, 'KO', '이거 보려고 시카고에서 날아왔어요. 드디어 라이브로 볼 생각에 설렙니다!',        TIMESTAMP WITH TIME ZONE '2026-08-06 13:41:00+00'),
 (3, 3, 'KO', '일본에서도 응원하고 있습니다. 서울 공연 꼭 갈게요!',                            TIMESTAMP WITH TIME ZONE '2026-08-06 15:03:00+00'),
 (4, 3, 'EN', 'Cheering from Japan. I am definitely going to the Seoul concert!',              TIMESTAMP WITH TIME ZONE '2026-08-06 15:03:00+00'),
 (5, 4, 'KO', '목소리가 정말 놀라워요. 이분 덕분에 트로트를 알게 됐어요.',                     TIMESTAMP WITH TIME ZONE '2026-08-05 14:11:00+00'),
 (6, 4, 'EN', 'Her voice is incredible. I discovered trot because of her.',                    TIMESTAMP WITH TIME ZONE '2026-08-05 14:11:00+00'),
 (7, 5, 'EN', 'How is she this good? The live sounds exactly like the studio version.',        TIMESTAMP WITH TIME ZONE '2026-08-05 16:34:00+00'),
 (8, 6, 'KO', '기부 내역까지 공개하는 팬덤이라니. 정말 자랑스럽습니다!',                        TIMESTAMP WITH TIME ZONE '2026-08-04 10:16:00+00'),

 -- 이찬원
 (21, 21, 'EN', 'A Daegu show at last — hometown stages really do hit different.',             TIMESTAMP WITH TIME ZONE '2026-08-06 09:21:00+00'),
 (22, 22, 'KO', '대구 공연을 추가한 건 정말 잘한 결정이에요. 티켓 구할 수 있으면 좋겠네요.',    TIMESTAMP WITH TIME ZONE '2026-08-06 10:06:00+00'),
 (23, 23, 'KO', '드디어 지방 공연이네요! 비행기표 예약합니다.',                                TIMESTAMP WITH TIME ZONE '2026-08-06 11:45:00+00'),
 (24, 24, 'EN', 'The intro of this new song is so good. I keep it on repeat.',                 TIMESTAMP WITH TIME ZONE '2026-08-05 12:31:00+00'),
 (25, 25, 'KO', '라이브가 음원이랑 똑같아서 깜짝 놀랐어요.',                                   TIMESTAMP WITH TIME ZONE '2026-08-05 13:11:00+00'),
 (26, 26, 'KO', '도서 오천 권이라니… 정말 멋진 프로젝트예요.',                                 TIMESTAMP WITH TIME ZONE '2026-08-03 10:41:00+00'),
 (27, 28, 'KO', '연습 잘 하세요! 투어 기다리고 있습니다.',                                     TIMESTAMP WITH TIME ZONE '2026-08-07 01:06:00+00'),
 (28, 31, 'KO', '팬사인회 응모 방법이 알기 쉬워서 도움이 됐어요.',                             TIMESTAMP WITH TIME ZONE '2026-08-06 23:21:00+00'),

 -- 박서진
 (41, 41, 'EN', 'Congratulations on the sellout! See you at Jamsil.',                          TIMESTAMP WITH TIME ZONE '2026-08-06 07:16:00+00'),
 (42, 42, 'KO', '서울 공연 티켓 구했어요. 벌써부터 기대됩니다!',                               TIMESTAMP WITH TIME ZONE '2026-08-06 08:03:00+00'),
 (43, 43, 'KO', '공연 하나 보러 처음으로 서울에 갑니다. 너무 떨려요!',                         TIMESTAMP WITH TIME ZONE '2026-08-06 09:32:00+00'),
 (44, 44, 'EN', 'The lyrics are about the sea, which makes it hit even harder.',               TIMESTAMP WITH TIME ZONE '2026-08-04 13:21:00+00'),
 (45, 45, 'KO', '이 노래 들으면 소름이 돋아요. 정말 아름답습니다.',                            TIMESTAMP WITH TIME ZONE '2026-08-04 14:06:00+00'),
 (46, 46, 'KO', '어촌 학생들을 위한 장학금이라니, 팬덤은 이래야죠.',                           TIMESTAMP WITH TIME ZONE '2026-08-02 10:21:00+00'),
 (47, 47, 'KO', '여수 바다 정말 예쁘네요! 언젠가 가 보고 싶어요.',                             TIMESTAMP WITH TIME ZONE '2026-08-07 06:41:00+00'),
 (48, 50, 'KO', '응모 방법 안내해 주셔서 감사합니다.',                                         TIMESTAMP WITH TIME ZONE '2026-08-07 05:49:00+00');

ALTER TABLE comment_translation ALTER COLUMN id RESTART WITH 49;

-- ────────────────────────── ArtistStage ─────────────────────────────
-- "이찬원 무대 보여줘" 의 답. 랜딩에서 고를 수 있는 아티스트와 1:1 입니다
-- (FE/src/data/programs.ts 의 ARTISTS — 이름이 한 글자라도 다르면 매칭이 안 됩니다).
--
-- ⚠️ **주소를 LLM 에게 만들게 하지 않는 이유**가 이 표의 존재 이유입니다.
--    모델이 지어낸 YouTube ID 는 없는 영상이거나 임베드가 차단된 영상이고,
--    임베드 차단 영상은 오류 없이 **검은 화면 + 스피너**만 남기고 조용히 실패합니다.
--
-- ⚠️ **embed_url 은 전부 임베드 검증이 끝난 MBN MUSIC 업로드(d4pWjMsd0go) 한 개입니다.**
--    아티스트별 실제 무대 영상으로 교체하세요. 교체할 때는 반드시 **iframe 안에서**
--    재생을 확인해야 합니다 — 주소창에 embed URL 을 직접 여는 검증은 무의미합니다
--    (최상위 탐색이면 정상 영상도 오류 153 이 납니다).
INSERT INTO artist_stage (id, artist_name, title, embed_url, thumbnail_url) VALUES
 (1, '성리',   '성리 무대 - MBN 트롯 스페셜',   'https://www.youtube.com/embed/d4pWjMsd0go', '/example_thumb.png'),
 (2, '이찬원', '이찬원 무대 - MBN 한일톱텐쇼',  'https://www.youtube.com/embed/d4pWjMsd0go', '/example_thumb.png'),
 (3, '박서진', '박서진 무대 - MBN 현역가왕',    'https://www.youtube.com/embed/d4pWjMsd0go', '/example_thumb.png');

ALTER TABLE artist_stage ALTER COLUMN id RESTART WITH 4;

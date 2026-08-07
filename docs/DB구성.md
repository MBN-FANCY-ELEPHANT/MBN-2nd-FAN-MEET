# DB 구성 가이드 — 아티스트 3명

> **운영 DB에 아티스트 3명 데이터를 넣기 위해 무엇을 준비해야 하는지** 정리한 문서입니다.
>
> - 표의 필수/선택은 **엔티티의 `nullable` 실측**입니다 (추정 아님).
> - 로컬 시드는 `BE/src/main/resources/data.sql`, 스키마 정의는 `docs/domain-model.md`, 계약은 `docs/api-spec.yaml`.

---

## 현재 상태 (2026-08-08)

**3명 시드는 이미 `BE/src/main/resources/data.sql` 에 들어가 있습니다** — 성리(1) · 이찬원(2) · 박서진(3).
이 문서는 그 설계 근거이자, 데이터를 더 넣거나 운영 DB 로 옮길 때 보는 참조입니다.

| | 상태 |
|---|---|
| `data.sql` 3명 구성 (약 150행) | ✅ 완료 — 기동·API 검증 통과 (§6) |
| 이름 목록 3곳 정합 (`programs.ts` · `DOMAIN_WORDS` · 추천 질문) | ✅ 완료 |
| 단일 스타 shim 제거 (`STAR_ID` · `personalizeArtistNames` · `rewriteArtist`) | ❌ **미완 — §5** |

> ⚠️ **shim 이 남아 있는 동안은 앱에서 누구를 골라도 성리(star 1) 데이터만 보입니다.**
> 3명 데이터는 API 수준에서는 정상 분리돼 있지만 화면까지 닿지 않습니다. §5 가 남은 일입니다.

---

## 0. 시작 전에 — 먼저 읽어야 할 결론

**지금 코드는 "스타 1명" 전제로 돌아갑니다.** 랜딩에서 13명을 고를 수 있지만 실제 데이터는
`star_id = 1` 하나뿐이고, 그 간극을 **이름 치환 shim** 두 개가 가리고 있습니다.

아티스트를 3명으로 늘리면 **이 shim들이 오히려 데이터를 망가뜨립니다.** DB만 채우면 되는
작업이 아니라 §5의 코드 변경이 함께 가야 합니다.

| 지금 | 3명이 되면 |
|---|---|
| `FE/src/app/constants.ts` 의 `STAR_ID = 1` 고정 (20개 파일에서 사용) | 선택한 아티스트의 `starId` 를 따라가야 함 |
| `personalizeArtistNames()` 가 응답의 "임영웅" → 선택 아티스트로 **문자열 치환** | 진짜 데이터가 생기므로 **제거**. 안 지우면 A의 이름이 B로 바뀝니다 |
| `ChatService.rewriteArtist()` 가 AI 근거에 같은 치환 | 동일하게 **제거** |
| 랜딩 `programs.ts` 에 13명 | 데이터가 있는 **3명만** 남겨야 함 |

---

## 1. 준비해야 할 데이터 — 한눈에

### 공통 (아티스트와 무관, 1회만)

| 테이블 | 최소 | 실제 시드 | 내용 |
|---|---|---|---|
| `channel` | 2 | **3** | 콘텐츠 채널. `content.channel_id` 가 **필수**라 반드시 먼저 |
| `app_user` | 7 | **9** | 댓글 작성자·모임 주최자(id=7). **6개국**(KR·US·JP·FR·ES·RU)을 깔아 국기가 섞이게 |

### 아티스트 1명당 (× 3명)

| 테이블 | 최소 | 실제 시드 | 왜 이만큼 필요한가 |
|---|---|---|---|
| `star` | 1 | 1 | 프로필·인사말 |
| `schedule` | 3 | **5** | HOME "다가오는 일정" + 공연 응모 목록 + 음성 "가장 가까운 공연". **미래 날짜여야 함** |
| `content` (ARTICLE) | 2 | **3** | 방송 탭 기사, AI 분석 대상 |
| `content` (VIDEO) | 2 | **4** | 무대 롱폼 3 + LIVE 배너용 `live=TRUE` 1 |
| `content` (POST/STAR) | 2 | **2** | 소식 스레드 — 아티스트 글 |
| `content` (POST/MANAGER) | 1 | **2** | 소식 스레드 — 팬매니저 공지 |
| `comment` | 3 | **11** | 댓글 화면. **국가를 섞을 것** |
| `comment_translation` | 2 | **8** | 번역 버튼 데모 (ko↔en) |
| `place` | 3 | **5** | 성지순례. `source_url` **필수** |
| `tip` | 4 | **6** | 응원하기. 카테고리 5종 전부 |
| `gathering` | 2 | **4** | 모집. `RECRUITING` 최소 2건 |
| `artist_stage` | 1 | 1 | 음성 "무대 보여줘" |

> **3명 총합 약 150행.** 대부분 복붙 후 이름·날짜만 바꾸면 되지만, **일정 날짜와 무대 영상
> URL 두 가지는 아티스트마다 실제 값**이어야 데모가 성립합니다.
>
> ⚠️ 콘텐츠를 더 늘리면 **기동 시 AI 워밍업이 그만큼 길어집니다** — 현재 33건 × 2언어에
> 약 94초(백그라운드)입니다.

---

## 2. 테이블별 상세

### 2-1. `star` — 아티스트 본체

| 컬럼 | 필수 | 설명 |
|---|---|---|
| `id` | ✅ | 1, 2, 3. **이 값이 모든 `star_id` FK의 기준** |
| `name` | ✅ | 한글 이름. ⚠️ `artist_stage.artist_name`·랜딩 목록과 **글자 하나까지 동일**해야 합니다 |
| `verified` | ✅ | 공식 인증 배지 |
| `follower_count` | ✅ | 표시용 |
| `name_en` | | 영어 로케일 표시 |
| `profile_image_url` · `cover_image_url` | | 없으면 예시 이미지로 폴백 |
| `greeting` | | 메인 인사말 |

### 2-2. `schedule` — 일정 ★가장 중요

| 컬럼 | 필수 | 설명 |
|---|---|---|
| `star_id` `title` `type` `start_at` `official` | ✅ | |
| `type` | ✅ | `BROADCAST` · `CONCERT` · `FANMEETING` · `EVENT` |
| `end_at` `venue` `description` `external_url` | | `venue` 는 **지역명을 넣으세요** (아래) |

⚠️ **`start_at` 이 미래여야 합니다.** 과거가 되면 HOME "다가오는 일정"이 비고, 공연 응모가
전부 마감되며, 음성 "가장 가까운 공연 응모해줘" 가 `NOT_FOUND` 를 냅니다.

⚠️ **`venue` 에 지역명(서울·부산·대구…)을 넣으세요.** 음성이 "부산 공연 응모해줘" 를
`venue`/`title` 의 지역어로 찾습니다.

⚠️ 응모 대상은 `CONCERT`·`FANMEETING` 을 우선합니다. 아티스트마다 **최소 1건**은 둘 중 하나로.

### 2-3. `content` — 기사·영상·게시물

| 컬럼 | 필수 | 설명 |
|---|---|---|
| `star_id` `channel_id` `type` `author_type` `author_name` | ✅ | `channel_id` 는 미리 만든 채널 |
| `title` `thumbnail_url` `published_at` | ✅ | |
| `view_count` `like_count` `comment_count` `live` | ✅ | 0 이라도 넣어야 합니다 |
| `body` | 타입별 | `ARTICLE` 본문 / `POST` 본문 |
| `media_url` `duration_sec` | VIDEO | **YouTube 임베드 URL** (`embed/` 형식) |
| `reporter_name` `reporter_avatar_url` | ARTICLE | 기자 정보 |
| `viewer_count` | live=TRUE | |

**`type` × `author_type` 조합이 화면을 결정합니다:**

| 조합 | 화면 |
|---|---|
| `ARTICLE` + `CHANNEL` | 방송 탭 기사 · AI 분석 대상 |
| `VIDEO` + `CHANNEL` | 무대 롱폼 · LIVE 배너 |
| `POST` + `STAR` | 소식 스레드 — **아티스트가 올린 글** (사진 + 본문) |
| `POST` + `MANAGER` | 소식 스레드 — **팬매니저 공지** (오렌지 말풍선) |

⚠️ **`comment_count` 는 실제 `comment` 행 수와 맞추세요.** 안 맞으면 숫자와 목록이 어긋납니다.

⚠️ **`published_at` 이 미래면 "6시간 후" 로 표시됩니다.** 반드시 과거로.

⚠️ **`POST`+`MANAGER` 본문에 아티스트 1인칭을 쓰지 마세요.** 작성 주체는 AI 도우미
"비엔이" 이며 스타 본인이 아닙니다 (기획서 5-2). "제가 …했어요" 는 사칭이 됩니다.

⚠️ **YouTube 임베드가 막힌 영상은 오류 없이 검은 화면만 남깁니다.** 넣기 전에
**iframe 안에서** 재생을 확인하세요 — 주소창에 embed URL 을 직접 여는 검증은 무의미합니다
(정상 영상도 오류 153).

### 2-4. `place` — 성지순례

| 컬럼 | 필수 | 설명 |
|---|---|---|
| `star_id` `name` `type` `address` `image_url` `source_url` | ✅ | |
| `type` | ✅ | `RESTAURANT` · `CAFE` · `VENUE` · `FILMING_LOCATION` |
| `latitude` `longitude` `visit_context` `map_url` | | |

⚠️ **정책 — 협상 대상 아님.** 이미 **공개된 장소만** 등록하고 `source_url`(출처 기사·방송
링크)이 **필수**입니다. 실시간 위치나 사적 동선은 절대 넣지 마세요.

### 2-5. `tip` — 응원하기

| 컬럼 | 필수 | 설명 |
|---|---|---|
| `star_id` `title` `category` `thumbnail_url` `updated_at` | ✅ | |
| `category` | ✅ | `VOTE` · `STREAMING` · `TICKETING` · `CHEER` · `FANCLUB` |
| `content` | | 마크다운. 줄바꿈은 `CHR(10)` |

⚠️ `updated_at` 은 화면에 **항상 노출**됩니다 (플랫폼 정책이 자주 바뀌므로). 오래된 날짜를
넣으면 그대로 낡아 보입니다.

### 2-6. `gathering` — 모집

| 컬럼 | 필수 | 설명 |
|---|---|---|
| `star_id` `title` `type` `cover_image_url` `status` | ✅ | |
| `current_count` `capacity` `deadline` `event_at` `fee` `official` `host_id` | ✅ | `host_id` → `app_user` |
| `type` | ✅ | **`BUS` · `DONATION` 둘뿐** (광고·단체관람·기타는 제거됨) |
| `status` | ✅ | `RECRUITING` · `FULL` · `CLOSED`. ⚠️ `OPEN` 아닙니다 |
| `summary` `description` `meeting_point` `payment_info` `refund_policy` `notice` | | |

⚠️ **`current_count` ≤ `capacity`.** 같으면 `FULL` 로 두세요.

⚠️ **제목에 출발지·도착지를 넣으세요** — "부산에서 서울로 가는 버스 대절". 음성이
"대전에서 서울 가는 버스 신청해줘" 를 지역어 일치 개수로 찾습니다.

⚠️ **`fee` 는 표시 전용입니다.** 플랫폼은 금전 거래를 중개하지 않습니다 (정책).

⚠️ 모집 대화방의 AI 요약이 `summary` · `meeting_point` · `event_at` · `fee` · `notice` 를
그대로 읽습니다. **이 필드들을 비우면 요약이 빈약해집니다.**

### 2-7. `artist_stage` — 음성 "무대 보여줘"

| 컬럼 | 필수 | 설명 |
|---|---|---|
| `artist_name` | ✅ | **UNIQUE.** `star.name` 과 정확히 일치해야 합니다 |
| `title` `embed_url` | ✅ | `embed_url` 은 `https://www.youtube.com/embed/{id}` |
| `thumbnail_url` | | |

⚠️ **이 표가 존재하는 이유:** LLM 에게 YouTube 주소를 만들게 하면 없는 영상이나 임베드
차단 영상이 나오고, 차단 영상은 **조용히 검은 화면**이 됩니다. AI 는 "무대 보여줘" 의도와
아티스트 이름만 판정하고 주소는 여기서 옵니다.

### 2-8. `comment` · `comment_translation`

| 컬럼 | 필수 | 설명 |
|---|---|---|
| `content_id` `author_id` `body` `like_count` `created_at` | ✅ | |
| `deleted_at` | | 소프트 삭제 |

⚠️ **작성자 국가를 섞으세요.** 댓글 화면에 국기가 섞여 보이는 것이 "글로벌 팬덤" 을
증명하는 가장 직접적인 장면입니다. `app_user.country` 는 `KR` `US` `JP` `FR` `ES` `CN` `RU`.

⚠️ 번역은 `(comment_id, locale)` 로 캐시됩니다. **시드 댓글의 번역을 미리 넣어두면** AI
연결이 없어도 번역 버튼이 동작합니다.

### 2-9. 넣지 않는 것

| 테이블 | 이유 |
|---|---|
| `ai_analysis` · `ai_analysis_item` | **기동 시 `AiAnalysisWarmup` 이 생성합니다.** 직접 넣지 마세요 |
| `chat_session` · `chat_message` | 런타임 생성 |
| `concert_entry` · `gathering_application` · `reaction` · `subscription` | 사용자 행동으로 생성 |

---

## 3. 예시 — 아티스트 1명 풀세트

`star_id = 2`(이찬원)를 채우는 예시입니다. **날짜는 데모일 기준으로 조정하세요.**

> 📌 **실제 시드는 이미 이 형식으로 `BE/src/main/resources/data.sql` 에 들어가 있습니다.**
> 네 번째 아티스트를 추가하거나 운영 DB 에 옮길 때는 아래 예시보다 **`data.sql` 을 그대로
> 복사해 이름·날짜·지역만 바꾸는 편이 정확합니다** (실제 값과 주석이 함께 들어 있음).
> 아래는 어떤 테이블이 어떤 순서로 필요한지 한눈에 보기 위한 축약본입니다.

```sql
-- ① 스타
INSERT INTO star (id, name, name_en, profile_image_url, cover_image_url, greeting, verified, follower_count)
VALUES (2, '이찬원', 'Lee Chan-won', '/artists/chanwon/profile.png', '/artists/chanwon/cover.png',
        '오늘도 좋은 하루 보내세요!', TRUE, 96200);

-- ② 일정 — start_at 은 반드시 미래. venue 에 지역명.
INSERT INTO schedule (id, star_id, title, type, start_at, end_at, venue, description, official, external_url) VALUES
 (11, 2, '이찬원 전국투어 [서울]', 'CONCERT',
      TIMESTAMP WITH TIME ZONE '2026-09-12 10:00:00+00', TIMESTAMP WITH TIME ZONE '2026-09-12 12:30:00+00',
      '서울 올림픽홀', '2026 전국투어 서울 공연.', TRUE, NULL),
 (12, 2, '이찬원 전국투어 [대구]', 'CONCERT',
      TIMESTAMP WITH TIME ZONE '2026-09-26 10:00:00+00', NULL,
      '대구 엑스코', '2026 전국투어 대구 공연.', TRUE, NULL),
 (13, 2, 'MBN 한일톱텐쇼 출연', 'BROADCAST',
      TIMESTAMP WITH TIME ZONE '2026-09-02 11:00:00+00', NULL,
      'MBN', '한일톱텐쇼 본선 무대.', TRUE, 'https://www.mbn.co.kr'),
 (14, 2, '팬미팅 [찬스데이]', 'FANMEETING',
      TIMESTAMP WITH TIME ZONE '2026-09-19 09:00:00+00', NULL,
      '부산 벡스코', '팬클럽 정기 팬미팅.', TRUE, NULL);

-- ③ 콘텐츠 — 기사 / 영상 / 아티스트 글 / 팬매니저 공지
INSERT INTO content (id, star_id, channel_id, type, author_type, author_name, author_profile_image_url,
                     title, thumbnail_url, published_at, view_count, like_count, comment_count,
                     body, reporter_name, reporter_avatar_url, media_url, duration_sec, live, viewer_count) VALUES
 -- 기사
 (21, 2, 1, 'ARTICLE', 'CHANNEL', 'MBN NEWS', '/channels/mbn-news.png',
    '이찬원, 전국투어 서울 공연 전석 매진', '/artists/chanwon/news-1.jpg',
    TIMESTAMP WITH TIME ZONE '2026-08-20 01:00:00+00', 18200, 340, 2,
    '[ 앵커멘트 ]' || CHR(10) || '가수 이찬원의 전국투어 서울 공연이 예매 시작과 함께 매진됐습니다.',
    '심가현 기자', '/reporters/sim.png', NULL, NULL, FALSE, NULL),
 -- 무대 롱폼 (⚠️ 임베드 가능 영상인지 iframe 에서 먼저 확인)
 (22, 2, 2, 'VIDEO', 'CHANNEL', 'MBN 트롯', '/channels/mbn-trot.png',
    '이찬원 [진또배기] 무대', '/artists/chanwon/stage-1.jpg',
    TIMESTAMP WITH TIME ZONE '2026-08-18 01:00:00+00', 240100, 5120, 1,
    NULL, NULL, NULL, 'https://www.youtube.com/embed/XXXXXXXXXXX', 214, FALSE, NULL),
 -- 아티스트가 올린 글 (사진 + 본문)
 (23, 2, 2, 'POST', 'STAR', '이찬원', '/artists/chanwon/profile.png',
    '연습실에서', '/artists/chanwon/post-1.jpg',
    TIMESTAMP WITH TIME ZONE '2026-08-21 09:00:00+00', 0, 11200, 1,
    '오늘도 연습실입니다. 곧 좋은 무대로 만나요!', NULL, NULL, NULL, NULL, FALSE, NULL),
 -- 팬매니저 공지 (⚠️ 아티스트 1인칭 금지 — 작성 주체는 AI 도우미)
 (24, 2, 2, 'POST', 'MANAGER', '팬매니저', '/mascot/bienie.png',
    '대구 공연 일정 안내', '/artists/chanwon/notice.jpg',
    TIMESTAMP WITH TIME ZONE '2026-08-21 06:00:00+00', 0, 7400, 1,
    '9월 26일 대구 공연이 추가로 열립니다. 응모는 공연 화면에서 하실 수 있어요.',
    NULL, NULL, NULL, NULL, FALSE, NULL);

-- ④ 댓글 — 국가를 섞습니다
INSERT INTO comment (id, content_id, author_id, body, like_count, created_at, deleted_at) VALUES
 (21, 21, 2, '서울 공연 꼭 가고 싶어요!', 132, TIMESTAMP WITH TIME ZONE '2026-08-20 02:10:00+00', NULL),
 (22, 21, 4, 'Flying in from Chicago for this show.', 88, TIMESTAMP WITH TIME ZONE '2026-08-20 03:20:00+00', NULL),
 (23, 22, 5, '歌声が本当に素敵です。', 76, TIMESTAMP WITH TIME ZONE '2026-08-18 04:00:00+00', NULL),
 (24, 23, 3, '연습 많이 하셨네요, 응원합니다!', 54, TIMESTAMP WITH TIME ZONE '2026-08-21 10:00:00+00', NULL),
 (25, 24, 6, 'Merci pour l''information !', 41, TIMESTAMP WITH TIME ZONE '2026-08-21 07:00:00+00', NULL);

INSERT INTO comment_translation (id, comment_id, locale, translated_body, created_at) VALUES
 (21, 21, 'EN', 'I really want to go to the Seoul concert!', TIMESTAMP WITH TIME ZONE '2026-08-20 02:11:00+00'),
 (22, 22, 'KO', '이 공연 보려고 시카고에서 날아옵니다.', TIMESTAMP WITH TIME ZONE '2026-08-20 03:21:00+00');

-- ⑤ 성지순례 — source_url 필수 (정책)
INSERT INTO place (id, star_id, name, type, address, latitude, longitude, image_url, visit_context, source_url, map_url) VALUES
 (11, 2, '대구 서문시장 칼국수', 'RESTAURANT', '대구 중구 큰장로26길', 35.8693, 128.5824,
    '/artists/chanwon/place-1.jpg', '2026.05 MBN 방송 촬영 중 방문',
    'https://www.mbn.co.kr/news/sample-11', 'https://map.kakao.com'),
 (12, 2, '수성못 카페거리', 'CAFE', '대구 수성구 두산동', 35.8283, 128.6187,
    '/artists/chanwon/place-2.jpg', '2026.04 공개 방문',
    'https://www.mbn.co.kr/news/sample-12', 'https://map.kakao.com'),
 (13, 2, '올림픽홀', 'VENUE', '서울 송파구 올림픽로 424', 37.5203, 127.1268,
    '/artists/chanwon/place-3.jpg', '2026 전국투어 서울 공연장',
    'https://www.mbn.co.kr/news/sample-13', 'https://map.kakao.com');

-- ⑥ 응원하기 — 카테고리를 고루
INSERT INTO tip (id, star_id, title, category, thumbnail_url, content, external_url, updated_at) VALUES
 (11, 2, '멜론 스트리밍 방법', 'STREAMING', '/tips/streaming.jpg',
    '## 기본 규칙' || CHR(10) || '1. 1시간 이상 간격을 두세요.' || CHR(10) || '2. 볼륨 0 은 집계되지 않습니다.',
    'https://www.melon.com', TIMESTAMP WITH TIME ZONE '2026-08-15 09:00:00+00'),
 (12, 2, '한일톱텐쇼 투표 방법', 'VOTE', '/tips/vote.jpg',
    '## 앱 투표' || CHR(10) || '하루 1회 무료 투표가 제공됩니다.',
    'https://www.mbn.co.kr', TIMESTAMP WITH TIME ZONE '2026-08-14 09:00:00+00'),
 (13, 2, '콘서트 티켓팅 준비물', 'TICKETING', '/tips/ticketing.jpg',
    '## 체크리스트' || CHR(10) || '- 본인 인증과 결제 수단을 미리 등록하세요.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-08-10 09:00:00+00'),
 (14, 2, '응원봉 사용 가이드', 'CHEER', '/tips/cheer.jpg',
    '## 공연장 매너' || CHR(10) || '- 발라드 구간에서는 응원봉을 낮춰주세요.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-08-05 09:00:00+00'),
 (15, 2, '공식 팬클럽 가입 안내', 'FANCLUB', '/tips/fanclub.jpg',
    '## 가입 절차' || CHR(10) || '연 1회 모집하며 선예매 권한이 부여됩니다.',
    NULL, TIMESTAMP WITH TIME ZONE '2026-07-30 09:00:00+00');

-- ⑦ 모집 — BUS / DONATION 만. 제목에 출발지·도착지.
INSERT INTO gathering (id, star_id, host_id, title, type, cover_image_url, summary, description,
                       status, current_count, capacity, deadline, event_at, meeting_point,
                       fee, payment_info, refund_policy, notice, official) VALUES
 (11, 2, 7, '0912 대구에서 서울로 가는 버스 대절', 'BUS', '/gatherings/bus-1.jpg',
    '동대구역에서 올림픽홀까지 가는 왕복 전세버스입니다. 07:30까지 도착해 주세요.',
    '서울 올림픽홀 공연 관람을 위한 대구 출발 왕복 전세버스입니다. 공연 종료 후 동대구역으로 복귀합니다.',
    'RECRUITING', 22, 40, DATE '2026-09-08', TIMESTAMP WITH TIME ZONE '2026-09-12 22:30:00+00',
    '동대구역 동광장', 32000, '모임 확정 후 운영자 개별 안내', '출발 3일 전까지 전액 환불',
    '지정 시간까지 늦지 않게 모여주세요.', TRUE),
 (12, 2, 7, '아동복지시설 기부금 모금', 'DONATION', '/gatherings/donation-1.jpg',
    '팬덤 이름으로 아동복지시설에 기부합니다. 1인 1만원부터 참여 가능합니다.',
    '모금 내역과 기부 영수증은 종료 후 전체 공개됩니다.',
    'RECRUITING', 88, 150, DATE '2026-09-20', TIMESTAMP WITH TIME ZONE '2026-09-22 00:00:00+00',
    '온라인', 10000, '모금 계좌는 공지사항 참조', '기부 특성상 환불 불가',
    '기부금 사용 내역은 종료 후 공개됩니다.', TRUE);

-- ⑧ 무대 영상 — artist_name 은 star.name 과 정확히 일치
INSERT INTO artist_stage (id, artist_name, title, embed_url, thumbnail_url) VALUES
 (2, '이찬원', '이찬원 [진또배기] 무대 - MBN', 'https://www.youtube.com/embed/XXXXXXXXXXX', '/artists/chanwon/stage-1.jpg');
```

### ID 배분 제안

3명이 서로 안 겹치게 **아티스트별 대역**을 정해두면 관리가 쉽습니다.

| 아티스트 | `star.id` | 다른 테이블 id 대역 |
|---|---|---|
| A | 1 | 1~10 |
| B | 2 | 11~20 |
| C | 3 | 21~30 |

⚠️ id 를 명시적으로 넣었다면 **각 테이블 끝에서 IDENTITY 를 RESTART** 하세요
(`ALTER TABLE {table} ALTER COLUMN id RESTART WITH {마지막+1}`). 안 하면 이후 INSERT 가
기존 id 와 충돌합니다.

---

## 4. 준비물 체크리스트 (아티스트별로 복사해 쓰세요)

```
아티스트: ____________  star_id: ___

[ ] 이름 (한글) / 영문명            ← star.name = artist_stage.artist_name = 랜딩 목록
[ ] 프로필 이미지 / 커버 이미지
[ ] 인사말 한 줄
[ ] 팔로워 수

[ ] 일정 4~5건  (제목 / 종류 / 시작일시 / 장소=지역명 포함)   ★전부 미래 날짜
[ ] 기사 3건    (제목 / 본문 / 기자명 / 썸네일)
[ ] 무대 영상 3건 (제목 / YouTube embed URL / 재생시간 / 썸네일)  ★iframe 재생 확인
[ ] 아티스트 글 2건 (사진 / 본문)
[ ] 팬매니저 공지 2건 (본문)                                  ★아티스트 1인칭 금지
[ ] 댓글 5~8건 (여러 국가 사용자)
[ ] 성지순례 3~5곳 (이름 / 종류 / 주소 / 방문맥락 / 출처 URL)  ★출처 필수
[ ] 응원 팁 5건 (제목 / 카테고리 / 본문)
[ ] 모집 2~4건 (제목에 출발지·도착지 / 집결지 / 일시 / 참가비 / 정원 / 공지)
[ ] 대표 무대 영상 1건 (artist_stage)                         ★iframe 재생 확인
```

---

## 5. DB 와 함께 가야 하는 코드 변경

**DB만 채우면 3명이 동작하지 않습니다.** 아래는 필수입니다.

| # | 변경 | 파일 | 안 하면 | 상태 |
|---|---|---|---|---|
| 5 | 랜딩 목록을 **3명으로** 축소 | `FE/src/data/programs.ts` | 데이터 없는 아티스트를 고르면 빈 화면 | ✅ |
| 6 | `DOMAIN_WORDS` 의 `"임영웅"` → 3명 이름 | `BE/.../chat/service/EvidenceFinder.java` | 이름만 말한 질문이 스코프 밖으로 거절됩니다 | ✅ |
| 7 | `SUGGESTED_KO/EN` 의 예시 질문에서 이름 제거 | `BE/.../chat/service/ChatService.java` | 추천 질문에 남의 이름이 뜹니다 | ✅ |
| 1 | `STAR_ID` 상수 → **선택 아티스트의 starId** 로 대체 | `FE/src/app/constants.ts` + 사용처 20개 파일 | **누구를 골라도 1번(성리) 데이터만 보입니다** | ❌ |
| 2 | 아티스트 이름 → `starId` 매핑 저장 | `FE/src/features/artist/selectedArtist.ts` (지금은 **이름만** 저장) | starId 를 알 수 없습니다 | ❌ |
| 3 | **`personalizeArtistNames()` 제거** | `FE/src/api/client.ts` · `selectedArtist.ts` | A 의 데이터에 있는 이름이 B 로 치환돼 **틀린 정보**가 표시됩니다 | ❌ |
| 4 | **`ChatService.rewriteArtist()` 제거** | `BE/.../chat/service/ChatService.java` | AI 답변이 남의 일정을 내 아티스트 것처럼 말합니다 | ❌ |
| 8 | 게스트 등록 시 `starId` 를 선택 아티스트로 | `FE/.../NicknameDraw.tsx` (지금 `STAR_ID` 고정) | `favorite_star_id` 가 전부 1번이 됩니다 | ❌ |

> 3·4번이 특히 중요합니다. **이 shim들은 "데이터가 1명뿐"이라 존재하는 것**이고,
> 진짜 데이터가 생긴 지금은 **정확한 값을 틀린 값으로 바꾸는 코드**입니다.
> 예: 이찬원을 고른 사용자에게 성리의 일정이 "이찬원의 팬미팅"으로 표시됩니다.

**권장 순서: 2 → 1 → 8 → 3 → 4.**
`selectedArtist` 에 starId 를 저장하는 것(2)이 나머지 전부의 전제입니다.

---

## 6. 넣은 뒤 검증

```bash
# 1) 3명 모두 기본 조회가 되는가
for id in 1 2 3; do curl -s "http://localhost:8080/api/v1/stars/$id/home" | head -c 120; echo; done

# 2) 아티스트별 데이터가 섞이지 않는가 (각자 자기 것만 나와야 함)
for id in 1 2 3; do
  echo "star $id:"
  curl -s "http://localhost:8080/api/v1/schedules?starId=$id&upcoming=true" | grep -o '"title":"[^"]*"' | head -3
done

# 3) 다가오는 일정이 비지 않는가 (미래 날짜 확인)
# 4) 모집·성지순례·팁도 같은 방식으로
```

### API 검증 결과 (2026-08-08 실측)

| 항목 | 결과 |
|---|---|
| 기동 | ✅ 시드 오류 없음. `Started TrotFandomApiApplication in 6.7s` |
| AI 워밍업 | ✅ 콘텐츠 33건 × 2언어 = **66건 / 94초** (백그라운드) |
| 다가오는 일정 | ✅ 3명 각 5건, 전부 미래 |
| 콘텐츠 구성 | ✅ 3명 각 ARTICLE 3 · VIDEO 4 · POST 4 |
| `comment_count` ↔ 실제 댓글 | ✅ **33건 전수 일치, 불일치 0** |
| 모집 | ✅ 3명 각 4건, RECRUITING 최소 2건 |
| 성지·팁 | ✅ 각 5건 / 6건, 팁 카테고리 5종 전부 |
| 음성 "OOO 무대 보여줘" | ✅ 3명 각각 **자기** `artist_stage` 매칭 |
| 음성 "가장 가까운 공연 응모해줘" | ✅ 성리→1 · 이찬원→11 · 박서진→21 (교차 오염 없음) |
| 음성 "버스 대절 신청해줘" | ✅ 성리→1 · 이찬원→11 · 박서진→21 |

### 화면 확인 (§5 완료 후에 의미가 있습니다)

- [ ] 랜딩에서 3명이 모두 보이고, 각각 고르면 **자기 데이터**가 뜨는가
- [ ] HOME "다가오는 일정"이 비지 않는가
- [ ] 소식 스레드에 3종(아티스트 글·팬매니저 공지·롱폼)이 다 있는가
- [ ] 무대 영상이 **실제로 재생**되는가 (검은 화면이면 임베드 차단)
- [ ] 언어를 바꿔도 댓글 국가 배지가 함께 바뀌는가
- [ ] AI 답변이 **다른 아티스트 이름을 말하지 않는가** (shim 제거 확인)

---

## 7. 이미 배포된 운영 DB 에 반영하기

`prod` 프로파일(`BE/src/main/resources/application.yml`)의 실제 설정입니다.

```yaml
ddl-auto: ${DB_DDL_AUTO:update}   # 기본 update
sql.init.mode: ${DB_INIT_MODE:never}   # 기본 never — data.sql 을 실행하지 않음
```

**즉, `data.sql` 을 고쳐도 배포된 서버를 재시작하는 것만으로는 반영되지 않습니다.**
`DB_INIT_MODE` 기본값이 `never` 이기 때문입니다. 두 가지 길이 있습니다.

### 방법 A — 빈 DB 에 한 번 주입 (권장, 아직 데이터가 없다면)

1. `data.sql` 을 3명 기준으로 완성한다
2. 운영 DB 의 기존 데이터를 비운다
3. `DB_INIT_MODE=always` 로 **한 번만** 기동한다
4. **기동 성공을 확인한 뒤 환경변수를 `never` 로 되돌린다**

> ⚠️ 4번을 빼먹으면 **재시작마다 시드가 다시 INSERT 되어 PK 충돌로 기동이 실패**합니다.

### 방법 B — 운영 중이라면 SQL 을 직접 실행

`data.sql` 은 그대로 두고, 추가분만 담은 `.sql` 을 psql 로 실행합니다.
이 경우 §3 끝의 **IDENTITY RESTART 를 반드시 함께 실행**하세요.

### 그 외

- `ddl-auto` 기본값이 `update` 라 **컬럼 추가는 자동 반영**되지만 삭제·타입 변경은 안 됩니다.
- `app_user.favorite_star_id` · `favorite_artist_name` 은 nullable 입니다
  (게스트 흐름 — `docs/api-changes-guest-identity.md`).
- **`ai_analysis` 는 넣지 마세요.** 기동 시 `AiAnalysisWarmup` 이 생성합니다.
  콘텐츠가 3배가 되면 **기동 후 준비 시간도 그만큼 늘어납니다** (로컬 기준 콘텐츠 16건 ×
  로케일 2종에 수십 초). 데모 직전이 아니라 **여유를 두고 미리 기동**해 두세요.

---

## 부록 — 참고 문서

| 문서 | 내용 |
|---|---|
| `BE/src/main/resources/data.sql` | 로컬 시드. **형식과 주의사항의 실물 예시** |
| `docs/domain-model.md` | 엔티티 정의와 공통 규약 |
| `docs/api-spec.yaml` | enum 값의 단일 진실 공급원 |
| `docs/HANDOFF.md` §6 | 알려진 제약 (단일 스타 전제 포함) |

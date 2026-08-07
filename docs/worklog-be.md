# 백엔드 작업 로그

> `backend-dev` 서브에이전트와 백엔드 작업을 하는 세션이 **시작 시 읽고, 종료 시 갱신**하는 문서입니다.
> 전체 맥락은 `docs/HANDOFF.md` 를 먼저 보세요.

**최종 갱신:** 2026-08-08 · **게스트 인증(§2-2) + 음성 액션 5종·모집 중복 신청 버그 수정(§1-2·§1-3)**

> ⚠️ **먼저 읽으세요:** `docs/design-spec.md`(무엇을 만들지) · `docs/ai-stack.md`(AI 작업 시)

---

## 1. 구현 현황

| 도메인 | 엔드포인트 | 상태 |
|---|---|---|
| Star | `GET /api/v1/stars/{starId}` | ✅ |
| Home | `GET /api/v1/stars/{starId}/home` | ✅ 응답 필드 `contents` (기사·영상 혼합) |
| Home | `GET /api/v1/stars/{starId}/play` | ✅ 성지순례+응원하기 집계 |
| Schedule | `GET /api/v1/schedules`, `/{id}` | ✅ |
| **Content** | `GET /api/v1/contents`, `/{id}`, `/{id}/related` | ✅ ARTICLE·VIDEO·POST + 작성 주체 + **목록에도 `liked`** |
| **Reaction** | `POST·DELETE /api/v1/contents/{id}/like` | ✅ 멱등 |
| **Reaction** | `POST·DELETE /api/v1/comments/{id}/like` | ✅ 멱등 |
| **Comment** | `GET·POST /api/v1/contents/{id}/comments` | ✅ 국가 배지 포함 |
| **Comment** | `DELETE /api/v1/comments/{id}` | ✅ 소프트 삭제, 본인만 |
| **Comment** | `GET /api/v1/comments/{id}/translation` | ✅ `(commentId, locale)` 캐싱 |
| **Subscription** | `POST·DELETE /api/v1/channels/{id}/subscription` | ✅ 멱등 |
| **AiAnalysis** | `GET /api/v1/contents/{id}/ai-analysis` | ✅ 사전 생성 + DB 조회 (locale 폴백 KO) |
| **AiAnalysis** | `POST /api/v1/admin/ai-analysis/regenerate` | ✅ ADMIN 전용 |
| **AiAnalysis** | `GET /api/v1/stars/{starId}/news-digest` | ✅ 소식 스레드용 AI 소식 요약. `(starId, locale)` 메모리 캐시 |
| Gathering | `GET /api/v1/gatherings`, `/{id}` | ✅ 비로그인 조회 가능 |
| Gathering | `POST·DELETE .../applications` | ✅ 다중 사용자 경합 검증 완료. **중복 신청 버그 수정** (§1-3) |
| **Gathering** | `GET /api/v1/gatherings/mine?starId=` | ✅ 내가 신청 중인 모집. 비로그인이면 빈 배열 |
| **ConcertEntry** | `GET·POST·DELETE /api/v1/schedules/{id}/entry` | ✅ **1인 1공연 1매**. 본문 없음 |
| **ConcertEntry** | `GET /api/v1/entries?starId=` | ✅ 내 응모 목록. 비로그인이면 빈 배열 |
| **Chat** | `POST /api/v1/chat/sessions` | ✅ 비회원 허용. `gatheringId` 를 주면 **모집 대화방 세션** |
| **Chat** | `POST .../messages` (JSON + SSE) | ✅ 근거 검색·스코프 제한·딥링크 + **`action` 이벤트** |
| Place | `GET /api/v1/places`, `/{id}` | ✅ |
| Tip | `GET /api/v1/tips`, `/{id}` | ✅ |
| Search | `GET /api/v1/search` | ✅ 카테고리별 제목 LIKE 검색 |
| **Auth** | `POST /api/v1/auth/guest`, `PATCH /users/me/nickname` | ✅ 랜덤 닉네임·스타 선택 기반 게스트 인증 |
| **Auth** | `GET /api/v1/auth/demo-users`, `POST /login`, `GET /users/me` | ✅ 기존 데모 인증 호환 유지 |

**삭제된 계약**: `/api/v1/archives*`, `/api/v1/auth/signup`, `/api/v1/chat/tts`, `/api/v1/chat/stt`
(음성 입출력은 브라우저 Web Speech API 로 처리 — 서버 경유가 없습니다)
**삭제된 의존성**: `com.anthropic:anthropic-java`, `io.jsonwebtoken:jjwt-*`

---

## 1-1. 신규 엔티티 (`docs/domain-model.md` §2 참조)

`Channel` · `Content`(구 ArchiveContent) · `ContentPlace` · `Comment` ·
`CommentTranslation` · `AiAnalysis`(+`AiAnalysisItem`) · `Subscription` · `Reaction` ·
`ChatSession` · `ChatMessage`(+`ChatCitation`) · `Place` · `Tip` · `User.country` ·
**`ConcertEntry`**(공연 응모) · **`ArtistStage`**(아티스트별 무대 영상)

---

## 1-2. 음성 "기능 완료" 액션 (2026-08-08 신규)

`chat/service/VoiceActionResolver.java` 하나가 핵심입니다. 지금까지 도우미는
**안내까지만** 했는데("공연 화면에서 응모하실 수 있어요"), 중장년 사용자에게는 그 다음
두 번의 탭이 실제 이탈 지점이라 **끝까지 실행**하도록 바꿨습니다.

| 발화 | 액션 | 대상 해석 | 실행 |
|---|---|---|---|
| "MBN 트롯가왕 본선 3차 응모해줘" | `CONCERT_ENTRY` | **① 이름** → ② 지역 → ③ 최근접 (아래 참고) | `ConcertEntryService.enter` |
| "내가 응모한 공연 응모 취소해줘" | `CONCERT_ENTRY_CANCEL` | **내 응모 내역** 중 지역어 일치 → 없으면 가장 최근 응모 | `ConcertEntryService.cancel` |
| "대전에서 서울 가는 버스 대절 신청해줘" | `GATHERING_JOIN` | RECRUITING 모임 중 **지역어 일치 개수**로 채점, 동점이면 BUS 우선 | `GatheringService.apply` |
| "모집 신청 취소해줘" | `GATHERING_CANCEL` | **내 신청 내역** 중 지역어 일치 → 없으면 가장 최근 신청 | `GatheringService.cancel` |
| "이찬원 무대 보여줘" | `STAGE_VIDEO` | 발화 속 아티스트명(성 뗀 이름 포함), 없으면 세션 아티스트 | 조회 전용 |

**대상 고르기 — `이름 → 지역 → 기본값` 순입니다. 응모·취소·모집 신청·신청 취소 전부 같은 규칙입니다.**

⚠️ **네 경로가 같은 규칙을 쓰는지 항상 확인하세요.** 응모 쪽에만 이름 매칭을 넣고 취소
쪽을 빠뜨렸더니, "MBN 트롯가왕 본선 3차 응모 취소해줘" 가 "가장 최근 응모" 로 떨어져
<b>엉뚱한 팬미팅 응모를 취소</b>했습니다.

⚠️ **이름을 지목했는데 후보에 없으면 기본값으로 떨어지지 말고 `NOT_FOUND` 를 내세요.**
"부산 공연 응모 취소해줘" 인데 부산 응모가 없으면 <b>아무것도 취소하지 않아야</b> 합니다.


⚠️ **이름 매칭이 가장 먼저입니다.** 이게 없던 동안 "MBN 트롯가왕 본선 3차 응모해줘" 라고
말해도 지역어가 없다는 이유로 **최근접 일정(팬미팅)에 응모가 걸렸습니다.** 사용자는 자기가
말한 공연이 아닌 곳에 응모된 줄도 모릅니다.

발화를 토큰으로 쪼개고 조사를 뗀 뒤 아래를 버립니다. 남은 단서가 이름에 몇 개나 들어
있는지로 고릅니다 (부분 일치라 "가왕" ⊂ "트롯가왕").

1. **한 글자** — "탑"·"그"·"이" 는 아무 제목에나 걸립니다.
2. **`TITLE_STOPWORDS`** — 요청 표현·수식어·시간 표현·종류 이름(공연·콘서트·모집·모임).
   종류 이름을 안 빼면 "공연 응모해줘" 만으로 제목에 그 글자가 든 아무 일정이나 골라집니다.
3. **`REQUEST_STEMS` 로 시작하는 낱말** — ⚠️ **어간으로 걸러야 합니다.** 불용어에 "응모" 만
   넣으면 **"응모해"·"응모하고" 가 그대로 단서로 남아** 어느 일정과도 안 맞고,
   "가장 가까운 공연 응모해줘" 마저 "찾지 못했어요" 가 됩니다 (실제로 겪음).
   활용형을 하나씩 나열하는 것은 끝이 없습니다.
4. **응원 아티스트 이름** — "이찬원 공연 응모해줘" 는 특정 공연을 지목한 것이 아니라
   "내 아티스트의 공연" 이라는 뜻입니다. 단서로 두면 시드 제목(임영웅)과 안 맞아 실패합니다.

검증한 발화 → 대상:

| 발화 | 고른 대상 |
|---|---|
| "MBN 탑 가왕 3차 본선 응모하고 싶어 응모해 줘" | MBN 트롯가왕 본선 3차 ✅ |
| "MBN 탑 가왕 3차 본선 응모 취소해 줘" (팬미팅도 응모한 상태) | MBN 트롯가왕 본선 3차만 취소 ✅ |
| "신곡 쇼케이스 응모해줘" | 신곡 쇼케이스 ✅ |
| "부산 공연 응모해줘" | 전국투어 콘서트 [부산] ✅ (지역) |
| "가장 가까운 공연에 대한 표를 응모해줘" | 임영웅의 팬미팅 ✅ (기본값) |
| "이찬원 공연 응모해줘" / "우리 오빠 공연 응모해줘" | 기본값 ✅ (아티스트 이름은 단서 아님) |
| "송년회 콘서트 응모해줘" (없는 공연) | `NOT_FOUND` ✅ |
| "부산 공연 응모 취소해줘" (부산 응모 없음) | `NOT_FOUND`, **아무것도 취소 안 함** ✅ |
| "기부금 모금 신청 취소해줘" | 아동복지시설 기부금 모금 ✅ |

⚠️ **취소 판정이 신청 판정보다 먼저입니다.** 순서를 바꾸면 <b>"모집 신청 취소해줘" 가
다시 신청</b>이 됩니다 — "취소해줘" 의 "해줘" 가 요청형에, "모집" 이 모집 명사에 걸리기 때문입니다.

⚠️ 취소 대상은 **내 내역 안에서만** 고릅니다. 전체 목록에서 고르면 신청하지도 않은
모임을 취소 시도하게 되고, 사용자는 자기 신청이 사라진 줄 압니다.

**설계 제약 — 코드 주석에 전부 적어뒀지만 요약하면:**

1. **명령형(`IMPERATIVES`)이 없으면 액션이 아닙니다.** 이 조건을 풀면
   `"공연 응모는 어떻게 해?"` 라는 **질문에 진짜 응모가 걸립니다.** 되돌릴 수 없는 쓰기라
   오분류 비용이 안내 오분류와 비교가 안 됩니다.
2. **`"표"` 를 명사 키워드로 쓰지 마세요** — `"투표"` 가 `"표"` 를 포함합니다.
3. **모집을 공연보다 먼저 봅니다** — "서울 공연 가는 버스 대절 신청" 에서 원하는 건 버스입니다.
4. **실패를 예외로 올리지 않습니다.** "이미 신청하셨어요" 는 안내이지 에러가 아니라서
   `ChatActionStatus` 로 내려보냅니다.
5. **문안은 BE 에 없습니다.** `type` + `status` 만 주고 FE 가 7개 언어로 만듭니다.
6. **액션 턴은 LLM 을 호출하지 않습니다** — 지연 0, 그리고 "하지도 않은 일을 했다고
   말하는" 위험 0.

**⚠️ 밟은 함정 2개 (다시 밟지 말 것)**

- **SSE 스트리밍은 다른 스레드에서 돕니다.** `SecurityContextHolder` 는 ThreadLocal 이라
  그 안에서 로그인 사용자를 읽으면 **항상 비어 있습니다.** `ChatController` 의 요청
  스레드에서 미리 읽어 `ChatService.ask(..., userId)` 로 넘깁니다.
- **`ChatService.ask` 는 `Propagation.NOT_SUPPORTED` 입니다.** 트랜잭션 안에서
  `gatheringService.apply` 가 `GATHERING_FULL` 로 던지면, 그 예외를 잡아도 공용 트랜잭션이
  **rollback-only 로 마킹돼 대화 저장까지 통째로 실패**합니다. 쓰기는 각 도메인 서비스가
  자기 트랜잭션 안에서 처리합니다.

**모집 대화방 세션 (`ChatSession.gatheringId`).** 팬공간 「참여 중인 모집 채팅방」에서 연
세션은 그 모임에 묶입니다. 그러면:

- 그 모임의 **집결지·행사일·참가비·공지**가 모든 질문의 근거로 **맨 앞에** 들어갑니다
  (`EvidenceFinder.gatheringEvidence`). 맨 앞이어야 하는 이유는 citations 가 앞 3건만
  나가고 LLM 도 앞쪽을 먼저 읽기 때문입니다 — 뒤에 두면 다른 모임을 안내합니다.
- **스코프 판정이 느슨해집니다.** 방 안의 질문은 도메인 단어가 없는 경우가 많습니다
  ("몇 시까지 가면 되나요?" 에는 하나도 없습니다). `isBlocked` 로 금지 주제만 거르고
  나머지는 `GATHERING` 으로 받습니다.

⚠️ 이걸 안 하면 대화방 안에서 "집결지 어디예요?" 에도 **"정보를 제공할 수 없습니다"** 가
나갑니다 (실제로 겪음). 검증: "집결지는 대전역 동광장입니다… 14시까지" / "참가비는 30,000원이에요" ✅

**프롬프트·근거에도 손댈 곳이 있었습니다.** 도우미가 "공연 응모 취소는 이 앱에서 직접
할 수 없어요" 라고 답했습니다 — 이미 되는 기능인데도요. 원인은 **근거에 안 적혀 있어서**입니다.
`ServiceCatalog` 의 공연·모집 설명에 **취소도 되고 말로 바로 처리된다**는 사실을 적고,
시스템 프롬프트에 "말로 시키면 끝까지 처리하는 일 목록" 과 **"할 수 없다고 답하지 말 것"**,
**"사용자가 말한 이름을 다른 일정 이름으로 바꿔 말하지 말 것"** 을 추가했습니다.
지금은 "네, 공연 응모 취소는 이 앱에서 할 수 있어요" 라고 답합니다.

⚠️ **기능을 추가하면 `ServiceCatalog` 설명도 같이 고치세요.** 코드에만 넣고 근거를 안 고치면
도우미는 그 기능이 없다고 말합니다.

**무대 영상 URL 은 DB(`artist_stage`)에서만 옵니다.** LLM 에게 YouTube 주소를 생성시키면
없는 영상이나 임베드 차단 영상이 나오고, 차단 영상은 오류 없이 **검은 화면 + 스피너**만
남기고 조용히 실패합니다. 시스템 프롬프트의 "지어내지 마세요" 원칙과도 충돌합니다.
⚠️ 지금 13행이 **전부 같은 영상**(임베드 검증이 끝난 `d4pWjMsd0go`)이라 아티스트별 실제
영상으로 교체가 필요합니다.

---

## 1-3. 모집 중복 신청 버그 (2026-08-08 수정) ★다시 밟기 쉬운 함정

**증상:** 한 번 취소한 사용자가 **같은 모집에 무한히 다시 신청**할 수 있었고, 그때마다
참여 인원이 올라갔습니다. 실제로 한 명이 34/40 을 40/40 으로 만들었습니다.
화면에는 계속 "참여 신청하기" 로 보입니다 (신청한 것으로 기록되지 않으니까요).

**원인:** `GatheringRepository.incrementIfAvailable` 이
`@Modifying(clearAutomatically = true)` 입니다 — **영속성 컨텍스트를 비웁니다.**
그런데 `apply()` 는 증가 **전에** 읽어둔 신청 엔티티에 `reapply()` 를 호출하고 있었습니다.
그 엔티티는 이미 **준영속**이라 더티 체킹이 일어나지 않고 UPDATE 가 나가지 않습니다.
→ 인원만 +1, 신청 행은 `CANCELED` 로 남음 → `isApplied()` 가 영원히 false.

**수정:** 증가 **후에** 신청 행을 다시 조회해서 관리 상태로 만든 뒤 `reapply()` 합니다.

> **일반화해서 기억할 것:** `clearAutomatically = true` 인 벌크 UPDATE 앞에서 읽은
> 엔티티는 그 뒤로 **전부 준영속**입니다. 벌크 연산 뒤에 엔티티를 수정하려면 반드시
> 다시 조회하세요.

**검증** (`신청 → 취소 → 신청 → 신청 → 신청 → 취소`):
`201 → 204 → 201 → 409 → 409 → 204`, 인원 `34 → 35 → 34 → 35 → 35 → 35 → 34`. ✅

`User.favoriteStarId` · `User.favoriteArtistName` 추가 — 랜딩의 스타 선택을 서버 사용자와 연결합니다.

게스트 랜덤 닉네임은 숫자 접미사 없이 **한글 동물 이름만** 사용합니다. 현재 DB에서 이미 사용
중인 동물 이름을 후보에서 제외한 뒤 남은 이름 중 하나를 무작위 배정하며, 풀이 모두 소진되면
`409 NICKNAME_POOL_EXHAUSTED`를 반환합니다.

`ContentType.POST`와 `ContentAuthorType`을 추가했습니다. 아티스트 SNS형 게시물도 기존 Content 좋아요·댓글 API를 그대로 사용하며 대댓글은 두지 않습니다.

---

## 1-4. 소식 스레드 — 목록 응답의 `liked` (2026-08-08)

`ContentSummary` 에 `liked` 를 추가했습니다. 메인 소식 스레드에서 하트를 눌러도
**채워지지 않아 누른 티가 전혀 나지 않던** 문제 때문입니다 — `likeCount` 는 화면에서
만 단위로 반올림돼(12,300 → "1.2만") 1 증가가 보이지 않습니다.

⚠️ **건별 조회로 채우지 마세요.** `ContentService.likedContentIds()` 가 목록 id 를 모아
`findByUserIdAndTargetTypeAndTargetIdIn` **한 번**으로 가져옵니다. 건별로 돌면 N+1 입니다.

⚠️ 비로그인이면 빈 집합이라 전부 `false` 입니다 (401 이 아닙니다).

**팬매니저 공지 시드 추가** — `author_type='MANAGER'` 인 `POST` 콘텐츠가 하나도 없어서
소식 스레드의 세 번째 종류를 만들 수 없었습니다. `content` 15·16 + 댓글 3건을 넣었습니다.
공지 문안에 **아티스트 1인칭을 쓰지 마세요** — 작성 주체는 AI 도우미입니다 (기획서 5-2).

**소식 시드 시각을 과거로 조정** — 기존 `POST` 시드가 현재보다 미래라 화면에
"6시간 후" 로 표시됐습니다. 데모 날짜가 밀리면 다시 확인하세요.

---

## 2. 검증 완료 내역 (2026-08-07)

`./gradlew build` → `EXIT=0` (테스트 포함). 앱 기동 후 curl 로 확인:

| 검증 항목 | 결과 |
|---|---|
| HOME 집계 | 스타 + 일정 1건 + 콘텐츠 10건(기사·영상 혼합) + 모임 4건 ✅ |
| PLAY 집계 | 성지순례 5건 + 응원하기 6건 ✅ |
| 기사 상세 | 기자·본문·`기사에 나온 그 곳`(KSPO DOME) 정상 ✅ |
| LIVE 플래그 | `live=true` + `viewerCount=82` 카드가 최상단 ✅ |
| AI 분석 (KO/EN) | 사전 생성 24건. `[[용어\|설명]]` 마크업 제거 후 항목화 ✅ |
| 댓글 국가 배지 | KR / US / JP 가 섞여서 반환 ✅ |
| 댓글 번역 캐시 | 일본어 댓글 → EN 즉시 반환 ✅ |
| 데모 계정 목록 | MEMBER 6명, 국가 분산 ✅ |
| 비로그인 쓰기 | 401 `UNAUTHORIZED` (JSON 본문 포함) ✅ |
| **위조 토큰** | **401 — HMAC 서명 검증 동작** ✅ |
| 좋아요 멱등성 | 212 → 213 → (재요청) 213 → 취소 212 ✅ |
| 구독 토글 | 412000 → 412001 → 412000 ✅ |
| 비로그인 모임 상세 | 200 + `myApplication=null` ✅ |
| 참여 신청 골든 패스 | 34/40 → 201 → 35/40, 취소 → 204 → 34/40 ✅ |
| 중복 신청 / 정원 마감 | 409 / 422 ✅ |
| **다중 사용자 정원 경합** | **슬롯 3개에 신규 지원자 4명 동시 → 201×3, 422×1, 최종 정확히 40/40** ✅ |
| 챗봇 근거 답변 | 일정·모임·장소 질의에 실제 DB 근거 + citations 3건 ✅ |
| **챗봇 스코프 제한** | **"오늘 날씨", "파이썬 코드" → `outOfScope=true` 거절** ✅ |
| SSE 스트리밍 | `delta`×6 → `citations` → `done` (스펙과 일치) ✅ |
| 한글 저장/반환 | 시드·요청 본문 모두 정상 ✅ |

**이번에 해소된 미검증 항목**: 서로 다른 사용자의 정원 경계 경합 — 인증이 생기면서 실제로
검증했고 **정원 초과가 발생하지 않음**을 확인했습니다.

### 이번에 고친 실제 결함

`GET /gatherings/{id}` 가 비로그인 시 401 을 반환했습니다. 컨트롤러가 `myApplication` 계산에
`requireUserId()` 를 쓰고 있었기 때문입니다 (`findUserId().orElse(null)` 로 교체).
서비스 계층은 이미 null 을 처리하고 있었으므로 컨트롤러만 수정했습니다.

## 2-1. 전면 점검 (2026-08-07 후반)

### 치명 — 로그인이 전부 500 이었습니다

`POST /api/v1/auth/login` 이 **유효한 모든 userId 에 500** 을 반환했습니다.
존재하지 않는 id 는 정상적으로 404 가 나와서, 조회 이후 단계가 원인이었습니다.

원인은 `BE/.env` 의 `AUTH_SECRET=` (빈 값)입니다.
`${AUTH_SECRET:기본값}` 은 **환경변수가 없을 때만** 기본값을 씁니다 — 존재하되 비어 있으면
빈 문자열이 주입되고, `new SecretKeySpec(new byte[0], ...)` 가
`IllegalArgumentException: Empty key` 를 던집니다. 이 예외는 unchecked 라
`DemoTokenService.sign()` 의 `catch (GeneralSecurityException)` 에 잡히지 않고 500 으로 샜습니다.

`DemoTokenService` 생성자가 **공백을 "없는 값"으로 취급**하고 폴백 키로 대체하도록 고쳤습니다.
경고 로그도 함께 남깁니다.

⚠️ **화면상으로는 드러나지 않던 결함입니다.** 좋아요·구독·모임신청·댓글작성이 전부 막혀
있었는데, 비로그인 상태에서는 401 이 정상 동작이라 눈치채기 어려웠습니다.

### 재검증한 인증 플로우 (전부 통과)

```
로그인 200 → 내정보 200 → 좋아요 431↔432 → 댓글 작성 201·좋아요·번역·삭제 204
→ 채널 구독/취소 → 모임 신청 201 (18→19) · 취소 204 (→18, myApplication 정확히 반영)
→ 위조 토큰 401
```

### 그 외 수정

| 문제 | 조치 |
|---|---|
| "성지순례 어디로 가면 돼?" 가 **SERVICE 로 오분류** — `SERVICE_WORDS` 의 "어디로" 가 먼저 걸림 | `STRONG_PLACE_WORDS` 를 SERVICE 앞에서 검사 (§3 분류 순서 참고) |
| `GET /chat/sessions/{id}/messages` 가 **계약에 없고 아무도 안 씀** | 컨트롤러·서비스에서 제거 |
| 관리자 재생성 API 의 **403 이 스펙에 없음** | `api-spec.yaml` 에 403 추가 |
| 성지순례·응원이 **FE 네비에서 도달 불가** | `ServiceCatalog` 에 두 기능을 추가해 AI 안내로 진입 가능하게 |

### 점검했지만 문제 없던 것

컨트롤러 ↔ 스펙 1:1 일치 · 응답 required 필드 · 트랜잭션 경계(`readOnly` 위반 없음) ·
모임 정원 원자적 UPDATE · `OPENAI_API_KEY` 의 FE 노출 경로 없음 ·
AI 사칭 금지/스코프 제한 프롬프트 · 굿즈·참가비 표시 전용 정책.

---

## 2-2. 게스트 팬 식별 연결 (2026-08-08)

- 랜딩의 스타 선택을 `POST /api/v1/auth/guest`로 받아 실제 `User`와 Bearer 토큰을 발급합니다.
- 랜덤 닉네임은 서버가 중복 검사 후 생성하며 `PATCH /api/v1/users/me/nickname`으로 변경합니다.
- 선택 스타의 데이터 ID와 표시 이름을 사용자에 저장해 재접속과 AI 채팅에서 같은 정체성을 씁니다.
- 기존 좋아요·댓글·댓글 좋아요·모임 신청 API를 중복 구현하지 않고 새 게스트 토큰에 연결했습니다.
- API 계약 상세는 `docs/api-changes-guest-identity.md`에 별도로 기록했습니다.

`GuestFanFlowIntegrationTests`에서 게스트 생성 → 내 정보 → 닉네임 변경 → 모임 신청 → 채팅 세션 →
콘텐츠 좋아요 → 댓글 작성 → 상세 및 댓글 목록 카운트 확인을 한 흐름으로 검증했습니다.
`./gradlew clean build --no-daemon` 결과 테스트 3건, 실패 0건으로 `BUILD SUCCESSFUL`입니다.

**병합 후 확인**: 이 게스트 토큰으로 **공연 응모·응모 취소·모집 신청·신청 취소·음성 액션**이
전부 동작합니다 (`POST /schedules/{id}/entry` 201, 중복 409, `GET /entries`·`/gatherings/mine`
정상). 별도 데모 로그인 없이 랜딩만 통과하면 쓰기 기능이 열립니다.

---

## 3. AI 운영 메모

### provider 전환

```bash
# BE/.env
AI_PROVIDER=openai        # stub 이면 LLM 없이 템플릿으로 동작
OPENAI_API_KEY=sk-...
```

기동 로그에서 `provider=live` 를 확인하세요. `stub` 이면 `.env` 를 다시 보세요.

### 의도 분류 순서 (`EvidenceFinder.classify`)

순서가 곧 우선순위입니다. **BLOCKED → STRONG_PLACE → SERVICE → 도메인 의도** 입니다.

- `SERVICE` 가 도메인보다 앞인 이유: "공연 예매하고 싶어" 가 `SCHEDULE_WORDS` 의 "공연"에
  먼저 걸려 일정만 답하고 예매 화면을 못 알려줬습니다.
- `STRONG_PLACE` 가 `SERVICE` 보다 앞인 이유: `SERVICE_WORDS` 에 "어디서"·"어디로" 가 있어
  **"성지순례 어디로 가면 돼?" 가 SERVICE 로 분류**돼 성지순례와 무관한 공연·모집을
  안내했습니다. 순서를 바꾸면 이 두 증상이 되살아납니다.

### 소식 요약 (`NewsDigestService`)

`AiProvider.analyze()` 를 **재사용**합니다 — 새 provider 메서드를 만들지 않았습니다.
최근 콘텐츠 6건을 한 덩어리로 붙여 `kind = "NEWS_DIGEST"` 로 넘기고,
`OpenAiProvider.describeKind()` 가 "여러 건을 묶은 모아보기" 라고 모델에 알려줍니다.

⚠️ `kind` 를 그냥 넘기면 `ARTICLE` 이 아닌 모든 값이 "video" 로 해석돼 요약이 어긋납니다.
새 `kind` 를 추가할 때는 `describeKind()` 도 같이 고치세요.

⚠️ **캐시는 메모리입니다.** 서버를 재시작하면 첫 요청만 LLM 왕복(수 초)이 발생하고
FE 는 그동안 스켈레톤을 띄웁니다. 워밍업 대상에는 넣지 않았습니다 — 기동이 이미
AI 분석 워밍업으로 50초쯤 걸립니다.

### 실연결 시 겪은 것

| 항목 | 내용 |
|---|---|
| **언어 지시는 목표 언어로** | 한국어 프롬프트에 "English 로 답하세요"라고 쓰면 **모델이 한국어로 답합니다.** `languageDirective()` 가 목표 언어로 직접 지시문을 만듭니다 |
| 워밍업 50초 | 분석 24건 생성. **백그라운드 스레드**라 앱은 즉시 뜹니다 |
| 근거 선별 | 근거 3건을 주면 질문에 맞는 것만 골라 답합니다 — 스텁 대비 가장 큰 차이 |
| 비용 | 전체 개발·검증 통틀어 $1 미만 |

### 스텁의 한계 (`AI_PROVIDER=stub` 일 때)

| 기능 | 스텁 동작 |
|---|---|
| 챗봇 답변 | 의도별 **템플릿** 문장. 사실 값은 실제 DB 근거에서 옵니다 |
| AI 분석 | 본문에서 문장을 추출해 항목화 |
| 댓글 번역 | **503.** 가짜 번역이 진짜처럼 보이는 게 더 위험합니다. 시드 댓글 8건은 미리 번역돼 있습니다 |
| 언어 | KO/EN 만. 나머지는 EN 폴백 |

---

## 4. 코드 규약 요약

상세는 `BE/CLAUDE.md`. 핵심만:

- 패키지는 **도메인별 수직 분할**. `star` 가 표준 예시
- DTO 필드명은 `api-spec.yaml` 스키마와 **1:1**. 엔티티 직접 반환 금지
- 에러는 `ErrorCode` + `ApiException`. 컨트롤러에서 try/catch 금지
- 페이징 응답은 `PageResponse.from(page, Dto::from)`
- 서비스는 클래스에 `@Transactional(readOnly = true)`, 쓰기 메서드만 `@Transactional` 덮어쓰기
- `Gathering.currentCount` 는 **반드시** `GatheringRepository.incrementIfAvailable` 로만 변경
  (조회 후 저장하면 정원 초과)
- LAZY 연관은 목록 조회 시 `@EntityGraph` 로 fetch join (N+1 방지)
- 새 엔티티 추가 시 `data.sql` 시드도 함께 추가

## 5. 빌드 · 검증

```bash
cd BE && ./gradlew build; echo EXIT=${PIPESTATUS[0]}   # EXIT=0 을 눈으로 확인할 것
cd BE && ./gradlew bootRun > /tmp/boot.log 2>&1 &      # 로그가 필요하면 파일로
```

⚠️ `| tail` 만 붙이면 gradle 실패가 가려집니다. 한글 요청 본문은 파일로 저장 후
`curl --data-binary @file` (Git Bash 가 CP949 로 보냅니다).

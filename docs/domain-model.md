# 도메인 모델

`기획문서/기획안초안_기능명세초안.md` + **Figma 확정본 13화면**에서 도출한 엔티티 정의입니다.
**이 문서와 `api-spec.yaml`이 FE/BE 공통의 단일 진실 공급원(single source of truth)입니다.**

**최종 갱신:** 2026-08-08 · 게스트 팬 식별을 위한 선택 스타·표시 이름 필드 추가,
댓글·구독·AI분석·번역 엔티티 추가, 간이 인증으로 전환

---

## 1. 엔티티 관계 개요

```
Star ──< Schedule
     ──< Content ──< Comment >── User
     │        │  ──< AiAnalysis
     │        └──< ContentPlace >── Place
     ──< Place
     ──< Tip
     ──< Gathering ──< GatheringApplication >── User

Channel ──< Content
        ──< Subscription >── User

User ──< ChatSession ──< ChatMessage
     ──< Reaction        (LIKE — Content / Comment 대상)

Comment ──< CommentTranslation
```

MVP는 **스타 1명(임영웅) 고정**으로 운영하되, 모든 콘텐츠 테이블은 처음부터 `star_id` FK를 갖습니다.

> **`Post` 엔티티는 미사용입니다.** 디자인에 게시판 화면이 없습니다.
> 스키마 정의만 남기고 API·화면은 만들지 않습니다.

---

## 2. 엔티티 정의

### Star — 스타

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `name` / `nameEn` | String | 표시명 / 영문 표기 |
| `profileImageUrl` | String | |
| `greeting` | String | `오늘 하루도 즐거운 하루되세요!` |
| `verified` | boolean | MBN 공식 인증 |
| `followerCount` | int | |

---

### User — 사용자 (간이 인증)

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `nickname` | String UQ | 댓글 표시명 |
| `profileImageUrl` | String | **아바타 — 댓글에 필수 노출** |
| `country` | Enum | **신규.** `KR`/`US`/`JP`/`FR`/`ES`/`CN`/`RU` — 댓글 국가 배지 |
| `locale` | Enum | `KO`/`EN`/`FR`/`JA`/`ES`/`ZH`/`RU` |
| `role` | Enum | `MEMBER` / `ADMIN` |
| `favoriteStarId` | Long nullable | 게스트 시작 시 선택한 스타의 데이터 ID |
| `favoriteArtistName` | String nullable | 랜딩에서 선택한 스타의 표시 이름 |
| `createdAt` | Instant | |

**인증은 간소화합니다.** 이메일·비밀번호·소셜 로그인을 구현하지 않습니다.
스타를 선택하면 서버가 중복 없는 랜덤 닉네임의 게스트 계정을 만들고 만료 없는 단순 서명 토큰을
발급합니다. 기존 데모 계정 원클릭 로그인은 호환을 위해 유지합니다.

| 상태 | 가능한 것 |
|---|---|
| 비로그인 | 콘텐츠·모임 조회 전부 |
| 게스트 토큰 보유 | + 닉네임 변경 · 댓글 작성 · 좋아요 · 구독 · 모임 신청 |

> 시드 유저의 `country`를 **의도적으로 분산**시킵니다. 댓글 화면에 여러 국기가 섞여 보이는 것이
> "글로벌 팬덤"을 증명하는 가장 직접적인 장면입니다.

---

### Channel — 콘텐츠 채널

디자인의 `MBN 로고 + 구독` 버튼에 대응합니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `name` | String | `MBN NEWS` |
| `logoUrl` | String | |
| `subscriberCount` | int | 비정규화 캐시 |

---

### Content — MBN 콘텐츠 (기사 · 영상)

**기존 `ArchiveContent`를 대체합니다.** HOME `아카이브` 캐러셀이 기사와 영상을 **한 목록에
섞어서** 보여주므로 단일 테이블 + 타입 판별자 구조가 맞습니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `starId` | Long FK | |
| `channelId` | Long FK | `MBN NEWS` |
| `type` | Enum | **`ARTICLE` / `VIDEO`** |
| `title` | String | |
| `thumbnailUrl` | String | |
| `publishedAt` | Instant | 정렬 기준 (최신순) |
| `viewCount` | int | `조회 수 2.7만회` |
| `likeCount` | int | `❤️ 212` |
| `commentCount` | int | `댓글 2.8천` |
| **ARTICLE 전용** | | |
| `body` | Text | 본문. `[[용어\|설명]]` 마크업으로 용어 하이라이트 |
| `reporterName` | String? | `심가현 기자` |
| `reporterAvatarUrl` | String? | |
| **VIDEO 전용** | | |
| `mediaUrl` | String? | YouTube 임베드 URL |
| `durationSec` | int? | `03:27` |
| `live` | boolean | **LIVE 배지 표시 여부** |
| `viewerCount` | int? | LIVE일 때 `👁 82명` |

> ⚠️ **`live`는 실시간 연동이 아닙니다.** 플래그가 켜져 있으면 배지를 붙이고 `viewerCount`를
> 그대로 표시할 뿐입니다. 스트리밍·실시간 집계는 구현하지 않습니다 (`mvp-scope.md` 컷 유지).

**카드 표시 규칙** (`design-spec.md` §2 화면1)

| type | 하단 좌측 | 하단 우측 | 상세 라우트 |
|---|---|---|---|
| `ARTICLE` | `channel.name` | 상대 시각 | `/articles/:id` |
| `VIDEO` | `durationSec` | `viewCount` | `/videos/:id` |
| `VIDEO` + `live` | LIVE 배지 | `viewerCount` | `/videos/:id` |

---

### ContentPlace — 기사에 나온 그 곳

뉴스 상세 하단 `기사에 나온 그 곳` 캐러셀. `Content` ↔ `Place` 다대다.

`contentId` FK · `placeId` FK · `sortOrder` int
`(contentId, placeId)` **UNIQUE**

---

### Comment — 댓글

디자인의 `Reply` 컴포넌트. 대댓글은 없습니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `contentId` | Long FK → Content | |
| `authorId` | Long FK → User | |
| `body` | Text | |
| `likeCount` | int | |
| `createdAt` | Instant | `07:21 작성` |
| `deletedAt` | Instant? | 소프트 삭제 |

응답에는 작성자의 `nickname` · `profileImageUrl` · **`country`** 가 함께 내려갑니다.

---

### CommentTranslation — 댓글 번역 캐시

| 필드 | 타입 |
|---|---|
| `commentId` | Long FK |
| `locale` | Enum |
| `translatedBody` | Text |
| `createdAt` | Instant |

`(commentId, locale)` **UNIQUE**. 한 번 번역한 댓글은 재호출하지 않습니다.

---

### AiAnalysis — AI 분석 결과

기사·영상 상세의 인디고 패널. **사전 생성 후 DB에서 읽습니다** (`ai-stack.md` §4).

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `contentId` | Long FK | |
| `locale` | Enum | 언어별로 따로 저장 |
| `summary` | Text | 패널 상단 요약 문장 |
| `items` | JSON | `[{title, body}]` — 항목별 분석 |
| `generatedAt` | Instant | 패널 우측 상단 표시 |

`(contentId, locale)` **UNIQUE**

---

### Subscription — 채널 구독

`id` · `userId` FK · `channelId` FK · `createdAt`
`(userId, channelId)` **UNIQUE**

---

### Reaction — 좋아요

`id` · `userId` FK · `targetType`(`CONTENT`/`COMMENT`) · `targetId` · `createdAt`
`(userId, targetType, targetId)` **UNIQUE**

좋아요 취소는 행 삭제입니다. `likeCount`는 대상 테이블의 비정규화 캐시이며
**원자적 UPDATE로만 증감**시킵니다 (`Gathering.currentCount`와 같은 이유).

---

### Schedule — 공식 일정

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `starId` | Long FK | |
| `title` | String | `임영웅의 팬미팅` |
| `type` | Enum | `BROADCAST`/`CONCERT`/`FANMEETING`/`EVENT` |
| `startAt` / `endAt` | Instant / Instant? | |
| `venue` | String | |
| `description` | Text | |
| `official` | boolean | |
| `externalUrl` | String? | |

> HOME `다가오는 일정` 카드는 `startAt > now()` 중 가장 가까운 1건.

---

### Gathering — 팬 모임 (COMMUNITY 핵심)

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `starId` / `hostId` | Long FK | 호스트는 카드 하단 `나의 영웅` |
| `title` | String | |
| `type` | Enum | `BUS`/`DONATION`/`AD`/`GROUP_VIEWING`/`ETC` |
| `coverImageUrl` | String | |
| `summary` | String | 카드 1줄 노출 |
| `description` | Text | |
| `status` | Enum | `RECRUITING`/`FULL`/`CLOSED` |
| `currentCount` / `capacity` | int | `34/40` |
| `deadline` | LocalDate | `~26.08.10` |
| `eventAt` | Instant | `2026.08.06` |
| `meetingPoint` | String | `강남 아트홀` |
| `fee` | int | `30,000원` — **표시 전용** |
| `notice` | Text? | `환불은 불가하며, 지정 시간 14시까지…` |
| `official` | boolean | |

**진행률** = `currentCount / capacity`. 목록 카드와 **상세 화면 하단 모두**에 노출합니다.

> ⚠️ **금전 거래 리스크**: 결제를 구현하지 않습니다. `fee`는 표시 전용이며 실제 송금은
> 플랫폼 밖에서 이뤄집니다. 상세 화면에 **플랫폼이 거래를 중개하지 않는다는 고지**를
> 디자인 안내 문구와 함께 노출합니다.

---

### GatheringApplication — 모임 참여 신청

`id` · `gatheringId` FK · `userId` FK · `status`(`APPLIED`/`CANCELED`) · `note?` · `appliedAt`

`(gatheringId, userId)` **UNIQUE**.
`Gathering.currentCount`는 **반드시** `incrementIfAvailable` 원자적 UPDATE로만 변경합니다.

---

### Place — 성지순례 (PLAY)

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `starId` | Long FK | |
| `name` | String | `충무로` |
| `type` | Enum | `RESTAURANT`/`CAFE`/`VENUE`/`FILMING_LOCATION` |
| `address` | String | |
| `imageUrl` | String | |
| `visitContext` | String | 방문 프로그램/시점 |
| `sourceUrl` | String | **출처 필수** |
| `mapUrl` | String? | 카카오맵 외부 링크 |

> ⚠️ **정책**: 스타의 실시간 위치·사적 동선은 절대 제공하지 않습니다.
> 방송·공식 SNS 등으로 **이미 공개된** 장소만 등록하며 `sourceUrl`은 필수값입니다.

---

### Tip — 응원하기 (PLAY)

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long PK | |
| `starId` | Long FK | |
| `title` | String | `0729 멜론 스밍하는 방법`, `트롯가왕 투표 방법` |
| `category` | Enum | `VOTE`/`STREAMING`/`TICKETING`/`CHEER`/`FANCLUB` |
| `thumbnailUrl` | String | |
| `content` | Text | 마크다운 |
| `externalUrl` | String? | |
| `updatedAt` | Instant | **필수 노출** — 플랫폼 정책이 자주 바뀜 |

---

### ChatSession / ChatMessage — AI 도우미 "비엔이"

**ChatSession**: `id` · `userId?`(비회원 허용) · `starId` · `locale` · `createdAt`
**ChatMessage**: `id` · `sessionId` · `role`(`USER`/`ASSISTANT`) · `content` · `citations` JSON · `createdAt`

`citations` = 답변 근거로 사용한 내부 리소스. 답변 카드 하단에서 해당 화면으로 딥링크합니다.

```json
[{ "type": "SCHEDULE", "id": 12, "title": "임영웅의 팬미팅" },
 { "type": "CONTENT",  "id": 88, "title": "0721 무대 콘서트 직관 영상" }]
```

**AI 정책 (협상 대상 아님)**

- 이름은 **MBN AI 도우미 "비엔이"**. **스타 본인을 사칭하지 않습니다.**
- 답변 범위는 **MBN 방송 · 트롯 아티스트 · 플랫폼 내부 데이터**로 한정합니다.
  범위 밖 질문은 답하지 않고 정중히 안내합니다.
- DB에 근거가 없으면 지어내지 않고 모른다고 답합니다.
- 사용자 `locale`에 맞춰 응답 언어를 결정합니다 (7개 언어).

---

## 3. 공통 규약

- **ID**: `Long` auto-increment.
- **시간**: 서버 저장/전송 모두 **UTC ISO-8601** (`2026-08-07T10:00:00Z`). 표시 변환은 FE 책임.
- **페이징**: `?page=0&size=20` → `{ content: [], page, size, totalElements, totalPages, last }`
- **정렬 기본값**: 콘텐츠 `publishedAt DESC`, 모임 `deadline ASC`, 댓글 `createdAt DESC`
- **소프트 삭제**: `deletedAt` 컬럼.
- **언어**: `locale` 파라미터 또는 `Accept-Language` 헤더. 지원 7종
  `ko` `en` `fr` `ja` `es` `zh` `ru` — **번역 검수는 ko/en만** 합니다.
- **비정규화 카운트**(`likeCount`/`commentCount`/`currentCount`/`subscriberCount`)는
  **원자적 UPDATE로만** 변경합니다. 조회 후 저장하면 동시 요청에서 값이 어긋납니다.

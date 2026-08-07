# 게스트 팬 식별 API 변경사항

작성일: 2026-08-08

## 변경 목적

랜딩에서 스타와 랜덤 닉네임을 고른 사용자를 실제 백엔드 사용자로 구분합니다. 발급된 토큰은
모임 신청, AI 채팅 세션, 콘텐츠 좋아요, 댓글 작성 및 댓글 좋아요에 공통으로 사용합니다.

랜덤 닉네임은 유일성 검사가 필요한 사용자 식별값이므로 서버가 생성합니다. 화면에서는 서버가
반환한 값을 보여주고, 사용자가 직접 바꾸면 닉네임 변경 API를 호출하면 됩니다.

## 추가 API

### `POST /api/v1/auth/guest`

인증 없이 호출합니다.

```json
{
  "starId": 1,
  "artistName": "김용빈",
  "locale": "KO",
  "country": "KR"
}
```

응답은 기존 `AuthResponse`와 동일한 `{ "accessToken", "user" }` 형식입니다. 이후 쓰기 요청은
반드시 `Authorization: Bearer <accessToken>` 헤더를 포함해야 합니다.

### `PATCH /api/v1/users/me/nickname`

```json
{
  "nickname": "용빈바라기"
}
```

2~30자의 중복되지 않은 닉네임만 허용합니다. 중복이면 `409 NICKNAME_ALREADY_EXISTS`를 반환합니다.

## 응답 필드 추가

모든 `User` 응답에 다음 nullable 필드가 추가됩니다.

- `favoriteStarId`: 백엔드 데이터 조회에 사용할 스타 ID
- `favoriteArtistName`: 랜딩에서 선택한 스타의 표시 이름

기존 데모 계정은 두 필드가 `null`이며, 새 게스트 사용자는 생성 요청의 값을 가집니다.

## 운영 PostgreSQL 반영

운영 프로파일은 Hibernate `ddl-auto: validate`라 자동으로 컬럼을 만들지 않습니다. 배포 전에 운영
DB 마이그레이션 절차에서 아래 DDL을 먼저 적용해야 합니다.

```sql
ALTER TABLE app_user ADD COLUMN favorite_star_id BIGINT NULL;
ALTER TABLE app_user ADD COLUMN favorite_artist_name VARCHAR(60) NULL;
```

두 컬럼은 기존 데모 사용자와의 하위 호환을 위해 nullable입니다. 닉네임의 unique 제약은 기존
`app_user.nickname` 제약을 그대로 사용합니다.

## 기존 API 연결

다음 API의 URL이나 요청 형식은 바뀌지 않았습니다. 새 게스트 토큰을 Bearer 헤더로 전달하면 됩니다.

- `POST /api/v1/gatherings/{id}/applications`
- `POST /api/v1/chat/sessions`
- `POST|DELETE /api/v1/contents/{id}/like`
- `POST /api/v1/contents/{id}/comments`
- `GET /api/v1/contents/{id}/comments`
- `POST|DELETE /api/v1/comments/{id}/like`

콘텐츠 상세의 `likeCount`, `commentCount`, `liked`와 댓글 응답의 `likeCount`, `liked`가 화면의
개수 및 현재 사용자 상태를 구성합니다.

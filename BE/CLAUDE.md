# BE — Spring Boot 4.1 + Java 17

루트 `CLAUDE.md`의 규칙이 먼저 적용됩니다. 여기는 백엔드 전용 규약입니다.

## 패키지 구조 — 기능별 수직 분할

`kr.co.mbn.trot` 아래에 **도메인별로** 패키지를 두고, 각 도메인이 5개 레이어를 갖습니다.
`star` 패키지가 표준 예시입니다. 새 도메인은 이 구조를 그대로 따르세요.

```
kr.co.mbn.trot
├── config/            SecurityConfig 등 전역 설정
├── common/
│   ├── error/         ErrorCode, ApiException, ErrorResponse, GlobalExceptionHandler
│   └── dto/           PageResponse
└── {domain}/          star, schedule, archive, gathering, place, tip, chat, user
    ├── domain/        JPA 엔티티
    ├── repository/    Spring Data 리포지토리
    ├── service/       트랜잭션 경계, 비즈니스 규칙
    ├── dto/           요청/응답 record
    └── controller/    REST 컨트롤러 (얇게)
```

레이어별 패키지(`controller/`, `service/`를 최상위에 두는 방식)로 바꾸지 마세요.

## 규약

**컨트롤러는 얇게.** 검증은 `@Valid`, 예외 변환은 `GlobalExceptionHandler`에 맡깁니다.
컨트롤러에서 `try/catch`를 쓰지 마세요.

**엔티티를 그대로 반환하지 않습니다.** 항상 `dto/`의 `record`로 변환합니다.
DTO는 `docs/api-spec.yaml`의 스키마와 **필드명까지 1:1**로 맞춥니다.

**에러는 `ApiException`으로.** 새 에러 상황은 `ErrorCode`에 상수를 추가한 뒤 던집니다.
`ErrorCode` enum 이름이 그대로 API 응답의 `code` 필드가 되므로, 추가 시 `api-spec.yaml`도 갱신하세요.

**페이징 응답은 `PageResponse.from(page, Dto::from)`.**
Spring의 `Page`를 그대로 직렬화하면 스펙과 필드명이 달라집니다.

**서비스는 `@Transactional(readOnly = true)`를 클래스에 걸고, 쓰기 메서드에만 `@Transactional`을 덮어씁니다.**

**Lombok은 최소한으로.** 엔티티에 `@Data`/`@Setter`를 붙이지 마세요 (JPA에서 위험).
지금은 명시적 getter를 쓰고 있습니다.

## 동시성 주의 — 모임 참여 신청

`Gathering.currentCount` 증가는 **경합 지점**입니다. 단순 조회 후 저장(read-modify-write)은
정원 초과를 허용합니다. 원자적 UPDATE 또는 비관적 락(`@Lock(PESSIMISTIC_WRITE)`)을 쓰세요.
데모에서 동시 신청을 시연할 가능성이 있습니다.

## 설정

- 프로파일: `local`(기본, H2 인메모리 + `data.sql` 시드) / `prod`(PostgreSQL, `ddl-auto: validate`)
- 시크릿(`AUTH_SECRET`, `OPENAI_API_KEY`)은 **환경변수로만** 주입합니다. `application.yml`에 쓰지 마세요.
- 새 엔티티를 추가하면 `src/main/resources/data.sql`에 시드도 함께 추가합니다.
  **데모 품질은 시드 데이터 품질에 비례합니다.**

## AI 작업 시

**착수 전 `docs/ai-stack.md` 를 읽으세요.** 벤더는 **OpenAI 하나로 통일**했습니다
(TTS·STT를 Anthropic이 제공하지 않아서). `anthropic-java`/`jjwt` 의존성은 제거됐습니다.

**모든 AI 호출은 `ai/provider/AiProvider` 인터페이스를 통해서만 합니다.**
근거 검색·스코프 제한·citations·SSE·캐싱은 전부 이 인터페이스 *바깥*에 있어서,
API 키가 준비되면 `OpenAiProvider` 하나만 추가하면 됩니다 (`app.ai.provider=openai`).

- 기본 구현은 `StubAiProvider` 입니다. LLM 없이 실제 DB 근거로 답변을 만듭니다
- **요청마다 LLM을 호출하지 마세요.** AI 분석은 기동 시 `AiAnalysisWarmup` 이 사전 생성하고
  조회는 DB 에서만 합니다. 상세 화면을 열 때마다 3~8초 대기하면 시연이 망가집니다
- **벡터 DB를 도입하지 마세요.** 데이터가 30~50건이라 전부 컨텍스트에 넣는 편이 정확하고 빠릅니다
- **스코프 제한은 `EvidenceFinder.classify()` 에서 끝납니다.** `inScope=false` 면 LLM 을
  호출하지 않으므로 비용과 지연이 0 입니다
- 스트리밍(SSE) 이벤트 형식은 `docs/api-spec.yaml` 의 chat 엔드포인트 설명과 일치해야 합니다
- 답변은 DB에 실제로 존재하는 콘텐츠에 근거해야 하며, 근거를 `citations`로 함께 반환합니다
- **STT는 BE에 없습니다.** 브라우저(Web Speech API)에서 처리하고 텍스트만 넘어옵니다

## 검증

```bash
./gradlew build     # 컴파일 + 테스트 — 커밋 전 반드시 통과
./gradlew bootRun   # http://localhost:8080
```

빌드를 파이프(`| tail`)로 넘길 때는 `; echo EXIT=${PIPESTATUS[0]}`로 실제 종료 코드를 확인하세요.

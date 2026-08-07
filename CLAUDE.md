# MBN AI 트롯 팬덤 플랫폼

MBN AI 해커톤 출품작. 트롯 스타의 공식 콘텐츠 · 팬 커뮤니티 · AI 팬 매니저를 하나로 묶은
**글로벌 트롯 팬덤 플랫폼**입니다.

**정보구조** — 3탭 셸은 폐기됐습니다. 주 사용자층이 중장년이라 뎁스를 줄였습니다.

```
랜딩(아티스트 3명 선택: 성리·이찬원·박서진) → 닉네임 룰렛(로그인 대체) → 메인 /home
                                                      ├ 소식 /feed
                                                      ├ 방송 /broadcast
                                                      └ 팬공간 /fanspace  [모집|공연|굿즈]
어느 화면에서든 마이크 FAB → 음성 AI 도우미 "비엔이" (5단계)
```

## 구조

```
FE/     React 19 + TypeScript 6 + Vite 8   (모바일 퍼스트, 375px 캔버스)
BE/     Spring Boot 4.1 + Java 17 + JPA    (H2 로컬 / PostgreSQL 운영)
docs/   기획·계약 문서 — 여기가 단일 진실 공급원
기획문서/                원본 기획안 (수정 금지, 참조 전용)
(초안) 와이어프레임 및 UI 기초/   초안 와이어프레임 (참고용 — Figma 확정본이 우선)
```

## 작업 전 반드시 읽을 것

**새 세션이라면 `docs/HANDOFF.md` 를 가장 먼저 읽으세요.** 현재 진행 상태, 다음 작업,
이미 내린 결정, 임시 조치가 전부 거기에 있습니다.

| 파일 | 내용 |
|---|---|
| **`docs/HANDOFF.md`** | **재개 지점. §1에 현재 IA 트리, 진행률·결정 로그·점검 결과** |
| `docs/design-spec.md` | 화면별 기능 명세. ⚠️ **1차 IA(3탭) 기준** — 현재 구조는 HANDOFF §1 |
| `docs/component-map.md` | 컴포넌트 ↔ Figma 노드 ID 매핑. ⚠️ 일부 항목이 낡았습니다 |
| **`docs/ai-stack.md`** | **AI 4종의 모델 선정과 파이프라인. AI 작업 전 필독** |
| `docs/api-spec.yaml` | **API 계약.** FE/BE 모두 이 스펙을 따릅니다 |
| `docs/design-tokens.md` | Figma 실측 토큰 (추정치 아님) |
| `docs/domain-model.md` | 엔티티 정의, 공통 규약(시간·페이징·정렬) |
| `docs/mvp-scope.md` | 우선순위(P0/P1/P2)와 **하지 않기로 한 것** |
| `docs/worklog-be.md` | 백엔드 작업 시 — 엔드포인트별 구현 현황과 다음 작업 |
| `docs/worklog-fe.md` | 프론트 작업 시 — 화면별 구현 현황과 다음 작업 |

**Figma MCP는 연결·인증 완료 상태입니다.** `fileKey: 71R3xxvzqYiDB6vjpfZUKR`
화면을 구현할 때는 **스크린샷만 보지 말고** `component-map.md`의 노드 ID로
`get_design_context`를 호출하세요 (`figma-design-to-code` 스킬을 먼저 로드).

**작업을 마칠 때는 해당 worklog 와 `HANDOFF.md` 진행률을 갱신하세요.**
갱신하지 않으면 다음 세션(다른 PC 포함)이 같은 작업을 반복합니다.

## 개발 명령

```bash
# 백엔드 (http://localhost:8080, H2 콘솔 /h2-console)
cd BE && ./gradlew bootRun
cd BE && ./gradlew build          # 컴파일 + 테스트

# 프론트엔드 (http://localhost:5173, /api → :8080 프록시)
cd FE && npm run dev
cd FE && npm run build            # 타입체크 + 번들
cd FE && npm run api:types        # api-spec.yaml → src/api/schema.d.ts 재생성
cd FE && python scripts/check-i18n.py   # 7개 로케일 키 정합성 (PARITY OK 확인)
```

## 핵심 규칙

**1. API 계약을 먼저 고친다.**
엔드포인트나 필드를 바꿔야 하면 `docs/api-spec.yaml`을 수정한 뒤 FE/BE에 반영합니다.
스펙에 없는 엔드포인트를 컨트롤러에 임의로 추가하지 마세요.

**2. FE는 API 응답 타입을 손으로 쓰지 않는다.**
`npm run api:types`로 생성된 `src/api/schema.d.ts`를 사용합니다. 이 파일은 gitignore 대상입니다.

**3. 범위를 넘지 않는다.**
`docs/mvp-scope.md`의 "컷" 목록(실시간 채팅, 결제, 다중 스타, 소셜 로그인 등)은 구현하지 않습니다.
요청받지 않은 리팩터링·추상화·방어 코드를 추가하지 마세요. 해커톤은 시간이 제약입니다.

**4. 정책 제약 (기획서에서 온 것 — 협상 대상 아님)**
- AI 도우미는 **"MBN AI 도우미 비엔이"**이며 **스타 본인을 사칭하지 않습니다.**
- AI 답변 범위는 **MBN 방송·트롯 아티스트·플랫폼 데이터**로 제한합니다. 범용 챗봇이 아닙니다.
- 장소 데이터는 이미 공개된 것만 등록하고 `sourceUrl`이 필수입니다. 실시간 위치·사적 동선 금지.
- 모임의 참가 비용은 **표시 전용**입니다. 플랫폼은 금전 거래를 중개하지 않습니다.
- `OPENAI_API_KEY`는 **BE에서만** 사용합니다. FE에서 OpenAI를 직접 호출하지 마세요 (키 노출).

**5. 문구는 하드코딩하지 않는다.**
사용자에게 보이는 모든 문자열은 `FE/src/i18n/locales/` 의 **7개 언어 파일 전부**에 추가합니다
(`en` `ko` `fr` `ja` `es` `zh` `ru`). 번역 검수는 ko/en만 합니다.
글로벌 플랫폼이 주제이므로 언어 전환이 데모의 핵심 구간입니다.

## 이 환경에서 밟은 함정 (반복 금지)

- **경로에 한글·공백이 있습니다** (`바탕 화면`, `MBN해커톤`).
  `BE/gradle.properties`의 `org.gradle.jvmargs`에 `-Dfile.encoding`을 넣으면
  테스트 워커가 클래스패스를 못 찾아 `ClassNotFoundException`이 납니다. 넣지 마세요.
- **Spring Boot 4는 Jackson 3(`tools.jackson`)을 씁니다.**
  `spring.jackson.serialization.write-dates-as-timestamps`는 제거됐습니다. java.time은 기본 ISO-8601.
- **Spring Boot 4는 스타터 이름이 다릅니다** — `spring-boot-starter-web`이 아니라 `spring-boot-starter-webmvc`.
- **`spring.jpa.defer-datasource-initialization: true`가 필요합니다.**
  없으면 `data.sql`이 Hibernate DDL보다 먼저 실행돼 "Table not found"로 기동 실패합니다.
- **FE는 TypeScript 6 + `erasableSyntaxOnly`입니다.**
  생성자 파라미터 프로퍼티(`constructor(readonly x: T)`)를 쓸 수 없습니다. 필드를 따로 선언하세요.
- **`openapi-typescript`는 TS 6과 peer 충돌**이라 devDependency로 설치하지 않고 `npx`로 실행합니다.
- **Git Bash가 한글을 CP949로 전송합니다.** `curl -d '{"note":"한글"}'` 은 서버에서 400이 납니다
  (`Invalid UTF-8 start byte`). 한글 페이로드는 파일로 저장한 뒤 `curl --data-binary @파일`을 쓰세요.
  **쿼리 파라미터도 마찬가지입니다** — `--data-urlencode "q=한글"` 도 CP949로 나갑니다.
  UTF-8 퍼센트 인코딩을 직접 만드세요:
  `Q=$(python -c "import urllib.parse;print(urllib.parse.quote('콘서트'))")`
- **heredoc(`python - <<'PY'`)도 CP949로 전송됩니다.** 한글이 든 스크립트는 Write 도구로
  파일에 쓴 뒤 `python 파일.py` 로 실행하세요.
- **`.env`의 `KEY=` (빈 값)는 `${KEY:기본값}`을 무력화합니다.** 환경변수가 *존재하되 비어 있으면*
  기본값이 아니라 빈 문자열이 주입됩니다. `AUTH_SECRET`이 이래서 **로그인이 전부 500**이었고,
  비로그인 401은 정상 동작이라 한참 못 잡았습니다. 시크릿을 읽는 쪽에서 `isBlank()`를 한 번 더 거르세요.
- **Vite가 낡은 모듈을 계속 서빙합니다.** `does not provide an export named 'default'`인데
  `npm run build`는 EXIT=0이면 HMR 캐시입니다. 새로고침이 아니라
  **`rm -rf node_modules/.vite` + dev 서버 재시작**.
- **음성 액션이 엉뚱한 대상을 잡으면 프롬프트가 아니라 코드를 보세요.**
  `VoiceActionResolver` 의 액션 경로는 **LLM 을 호출하지 않습니다** — 대상 선택은 결정적
  키워드 매칭입니다. 응모·취소·신청·신청취소 **네 경로가 같은 규칙을 쓰는지** 확인하세요.
  한쪽만 고치면 다른 쪽에서 같은 사고가 되살아납니다.
- **한국어 불용어는 어간으로 걸러야 합니다.** `"응모"` 만 목록에 넣으면 `"응모해"`·`"응모하고"`
  가 그대로 남아 어느 대상과도 안 맞습니다. 활용형 나열은 끝이 없으니 `startsWith` 로 거르세요.
- **SSE 스트리밍 스레드에는 로그인 정보가 없습니다.** `SecurityContextHolder` 는 ThreadLocal 이라
  `streamExecutor.execute { ... }` 안에서 읽으면 항상 비어 있습니다. 요청 스레드(컨트롤러)에서
  `userId` 를 읽어 파라미터로 넘기세요.
- **트랜잭션 안에서 다른 서비스의 예외를 잡아도 전체가 롤백됩니다.** 참여 서비스가 던진
  `ApiException` 을 상위에서 catch 해도 공용 트랜잭션은 rollback-only 로 마킹됩니다.
  `ChatService.ask` 가 `Propagation.NOT_SUPPORTED` 인 이유입니다.
- **YAML `description` 에 `키: 값` 형태를 그냥 쓰면 파싱이 깨집니다.**
  `description: 비로그인이면 \`entered: false\` 입니다` → `npm run api:types` 실패. 따옴표로 감싸세요.
- **YouTube 임베드 차단 영상은 조용히 실패합니다** (검은 화면 + 스피너).
  ⚠️ `youtube.com/embed/...`를 **주소창에 직접 여는 검증은 무의미합니다** — 최상위 탐색이면
  정상 영상도 `오류 153`이 납니다. 반드시 iframe 안에서 확인하세요.

## 명령 실행 시 주의

`cmd | tail` 형태로 실행하면 파이프 마지막 명령의 종료 코드가 보고되어 **실패를 성공으로 착각**합니다.
빌드·테스트를 돌릴 때는 `; echo EXIT=${PIPESTATUS[0]}`를 붙여 실제 종료 코드를 확인하세요.

같은 이유로 `./gradlew bootRun | tail`은 로그를 버퍼에 가둬 서버 예외를 볼 수 없습니다.
서버 로그가 필요하면 `./gradlew bootRun > /tmp/boot.log 2>&1`로 파일에 받으세요.

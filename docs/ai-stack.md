# AI 스택 — 모델 선정과 파이프라인

**최종 갱신:** 2026-08-07 · 음성 입출력을 브라우저 내장 API 로 확정(무료), 텍스트 LLM 만 OpenAI

AI를 쓰는 곳은 다섯 군데입니다. 각각 요구사항이 다르므로 기술과 실행 위치를 따로 정합니다.

| # | 기능 | 실행 위치 | 모델 / 기술 | 비용 | 지연 |
|---|---|---|---|---|---|
| 1 | 음성 인식 (STT) | **브라우저** | Web Speech API | **무료** | 실시간 |
| 2 | 음성 합성 (TTS) | **브라우저** | `speechSynthesis` | **무료** | 즉시 |
| 3 | 챗봇 답변 | BE | `gpt-4o-mini` | 유료 | 1~3초 |
| 4 | 기사·영상 분석 | BE (사전 생성) | `gpt-4o-mini` | 유료 | **0초** (DB 조회) |
| 5 | 댓글 번역 | BE (캐싱) | `gpt-4o-mini` | 유료 | 0.5~2초 (최초 1회) |

**음성 입출력은 전부 브라우저 내장 기능입니다** — 키도, 비용도, 서버 왕복도 없습니다.
유료 호출은 3~5번뿐이고 그마저 캐싱과 스코프 제한으로 크게 줄여뒀습니다.

---

## 1. 유료 LLM 은 OpenAI 하나만

`com.anthropic:anthropic-java` 는 **제거했습니다.** 벤더를 둘로 나눌 이유가 없습니다 —
해커톤에서 API 키 2개·SDK 2개·에러 처리 2벌을 관리하는 것은 순손실입니다.

**음성(STT/TTS)에는 유료 API 를 아예 쓰지 않습니다.** 브라우저 내장 기능으로 충분하고,
무료인 데다 지연도 더 낮습니다. 유료 호출은 텍스트 LLM 3종(챗봇·분석·번역)뿐입니다.

**SDK 대신 `RestClient` 로 직접 호출합니다.** 쓰는 엔드포인트가 3개뿐인데 SDK 를 넣으면
버전 드리프트와 전이 의존성이 따라옵니다. 해커톤에서는 REST 형태를 고정하는 편이 예측
가능하고 디버깅도 쉽습니다. → `ai/provider/openai/OpenAiClient.java`

키는 **`BE/.env`** 로만 주입합니다 (gitignore 대상). `application.yml`이나 소스에 쓰지 마세요.

```bash
cp BE/.env.example BE/.env   # 그리고 값을 채웁니다
```

`bootRun` 이 `BE/.env` 를 읽어 환경변수로 넣습니다 (`build.gradle`).
파일이 없으면 조용히 스텁 모드로 동작합니다.

---

## 2. STT — 브라우저 Web Speech API

**결론: 프론트엔드에서 처리하는 것이 맞습니다.** 다만 이유가 "편해서"가 아닙니다.

디자인 화면 4(`말하는 중`)는 사용자가 말하는 도중에 `그.. 우리 임영웅이.. 콘서트가 언제야`가
**실시간으로 쌓이는** 연출입니다. 이건 **중간 결과(interim result)** 없이는 만들 수 없습니다.

| 방식 | 실시간 표시 | 지연 | 비용 | 판정 |
|---|:-:|---|---|:-:|
| **Web Speech API** | ✅ interim result | 0 | 무료 | **채택** |
| OpenAI `gpt-4o-transcribe` | ❌ 녹음 완료 후 | 1~3초 | 유료 | 폴백 |

Whisper 계열은 녹음이 끝나야 텍스트가 나오므로 화면 4가 **빈 화면으로 1~3초 멈춥니다.**
디자인이 요구하는 연출을 만들 수 없습니다.

```ts
// FE/src/features/voice/useSpeechRecognition.ts
const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
const recognition = new SR();
recognition.lang = localeToBcp47(currentLocale);  // ko-KR / en-US / ja-JP ...
recognition.interimResults = true;                // ← 화면 4의 핵심
recognition.continuous = false;

recognition.onresult = (e) => {
  const text = Array.from(e.results).map(r => r[0].transcript).join('');
  setTranscript(text);                            // 실시간 갱신
  if (e.results[e.results.length - 1].isFinal) submit(text);
};
```

### 폴백은 텍스트 입력 (구현됨)

| 순위 | 경로 | 실시간 표시 | 조건 |
|---|---|:-:|---|
| 1 | **Web Speech API** | ✅ | Chrome / Edge / Safari |
| 2 | **텍스트 입력** | — | 미지원 브라우저 또는 마이크 권한 거부 |

유료 STT 폴백은 두지 않습니다. 예산 문제도 있지만, 실시간 표시가 안 되는 순간
디자인이 요구하는 화면이 안 나오므로 텍스트 입력과 실질 차이가 크지 않습니다.

**제약과 대응**

| 제약 | 대응 |
|---|---|
| Firefox 미지원 | 텍스트 입력으로 자동 전환 |
| HTTPS 또는 localhost 필수 | 로컬 개발은 localhost, 배포는 HTTPS |
| 마이크 권한 거부 | 텍스트 입력으로 자동 전환 |
| 언어별 인식률 편차 | 데모는 ko/en으로 진행 |

> ⚠️ **시연 리스크**: 리허설에서 마이크 권한을 **미리 허용**해 두세요.
> 폴백이 있어도 심사 중 권한 팝업이 뜨는 것 자체가 흐름을 끊습니다.

---

## 3. TTS — 브라우저 `speechSynthesis`

**유료 TTS 를 쓰지 않습니다.** 키도 비용도 서버 왕복도 없고, 재생 지연이 사실상 0 입니다.

품질 걱정은 **음성 선택으로 해결됩니다.** Chrome 은 OS 기본 음성 외에 자체 고품질 음성
("Google 한국어" 등)을 함께 제공하는데, 이쪽이 훨씬 자연스럽습니다. 그래서 로케일이 맞는
음성 중 **Google 계열을 우선 선택**하도록 구현했습니다 (`FE/src/features/voice/useSpeech.ts`).

```ts
const candidates = voices.filter((v) => v.lang.startsWith(prefix));
utterance.voice = candidates.find((v) => v.name.includes('Google')) ?? candidates[0];
utterance.rate = 0.95;   // 기본값 1.0 은 안내 문구로는 다소 빠릅니다
utterance.pitch = 1.05;  // 마스코트의 밝은 톤
```

**제약과 대응**

| 제약 | 대응 |
|---|---|
| 음성 목록이 비동기로 채워짐 | `voiceschanged` 이벤트를 구독해 갱신 |
| OS/브라우저별 음성 품질 편차 | Google 계열 우선 선택. 데모는 Chrome 권장 |
| 자동재생 정책으로 차단될 수 있음 | 실패해도 **조용히 무시** — 답변 텍스트는 이미 화면에 있음 |

> 리허설에서 음성 품질이 아쉽다면 그때 유료 TTS 로 바꿀 수 있습니다.
> 그 경우 **반드시 BE 프록시**를 거쳐야 합니다 (FE 직접 호출 시 API 키 노출).
> 되돌리는 지점은 `OpenAiClient` 하단 주석에 남겨뒀습니다.

---

## 4. AI 분석 — 사전 생성 + DB 캐싱 (가장 중요한 결정)

**요청마다 LLM을 호출하지 마세요.** 기사 상세를 열 때마다 3~8초를 기다리는 화면은
심사 시연에서 치명적입니다. 네트워크가 흔들리면 화면이 아예 안 뜹니다.

### 채택 방식

```
시드 적재 시점 (또는 최초 요청 시 1회)
   └─► gpt-4o-mini 호출 ─► ai_analysis 테이블에 저장

기사/영상 상세 조회
   └─► DB에서 그대로 읽어 반환 (0초)
```

| 방식 | 첫 응답 | 재조회 | 데모 안정성 | 판정 |
|---|---|---|---|:-:|
| 매 요청 LLM 호출 | 3~8초 | 3~8초 | 낮음 | ❌ |
| **사전 생성 + 캐싱** | 0초 | 0초 | 높음 | **채택** |
| 최초 요청 시 생성 후 캐싱 | 3~8초 | 0초 | 중간 | 차선 |

"실시간으로 분석하는 것처럼" 보이게 하려면 **FE에서 타이핑 애니메이션**만 주면 됩니다.
사용자 입장에서는 구분되지 않으면서 실패 위험은 0입니다.

### 라이브 생성도 시연하고 싶다면

관리자용 재생성 엔드포인트를 하나 두세요. 심사 중 "지금 다시 분석해 볼까요?" 가 가능해집니다.

```
POST /api/v1/admin/ai-analysis/regenerate?targetType=ARTICLE&targetId=12
```

### 분석 결과 스키마

```json
{
  "summary": "AI가 기사를 분석한 내용입니다.",
  "items": [
    { "title": "주요 내용", "body": "크리스토퍼 놀란 감독이 신작 ..." },
    { "title": "팬 관점",   "body": "이번 내한은 ..." }
  ],
  "generatedAt": "2026-08-06T10:00:00Z"
}
```

디자인의 `AI Pannal`이 `요약 문장` + `{제목, 내용}` 반복 구조이므로 그대로 대응합니다.

---

## 5. 챗봇 "비엔이" — 스코프 제한

### 페르소나

- 이름: **MBN AI 도우미 "비엔이"**
- **스타 본인을 사칭하지 않습니다** (기획서 5-2 필수 정책, 협상 대상 아님)
- 응답 언어는 사용자의 현재 `locale`을 따릅니다 (7개 언어)

### 답변 범위

**허용**: MBN 방송 콘텐츠 · 트롯 아티스트 · 플랫폼 내부 데이터(일정/기사/영상/모임/장소/팁)
**거절**: 그 외 전부 (일반 상식, 코딩, 정치, 의료, 타사 연예인 등)

거절 시 문구는 하드코딩하지 말고 `t('chat.outOfScope')`를 씁니다.

### 근거 검색 — RAG 없이

데이터가 30~50건 수준입니다. **벡터 DB를 도입하지 마세요.** 전부 컨텍스트에 넣는 편이
정확하고 빠르며 디버깅도 쉽습니다.

```
질문 의도 분류 → 해당 서비스 호출 → 결과를 컨텍스트로 주입
  일정 질의   → ScheduleService.getSchedules(starId, upcoming=true)
  콘텐츠 추천 → ArticleService / VideoService
  팬 활동     → GatheringService.getGatherings(starId, RECRUITING)
  장소        → PlaceService
```

의도 분류도 별도 LLM 호출 없이 **함수 호출(tool use)** 로 처리하면 왕복이 한 번 줄어듭니다.

### 프롬프트 캐싱

시스템 프롬프트(페르소나 + 정책 + 스코프 규칙)는 매 호출 반복됩니다.
OpenAI는 1024토큰 이상 프롬프트에 **자동 캐싱**이 적용되므로, 고정 부분을 앞에 두고
가변 컨텍스트를 뒤에 배치하세요. 순서만 지키면 별도 설정이 없습니다.

### 실패 대비

`OPENAI_API_KEY`가 없거나 호출이 실패하면 **명확한 에러를 즉시 반환**합니다.
데모 중 무한 대기가 최악입니다. 타임아웃은 10초로 잡으세요.

---

## 6. 댓글 번역

온디맨드 호출 + `(commentId, targetLocale)` 캐싱. 한 번 번역한 댓글은 DB에 저장해
두 번째부터는 즉시 반환합니다. 시드 댓글은 미리 번역해 두면 데모가 매끄럽습니다.

---

## 7. 비용 — 예산 5~10달러 기준

### 단가 (2026-08 기준, gpt-4o-mini 계열)

| 항목 | 단가 |
|---|---|
| `gpt-4o-mini` 입력 | $0.15 / 1M 토큰 |
| `gpt-4o-mini` 출력 | $0.60 / 1M 토큰 |
| STT / TTS | **$0 — 브라우저 내장** |

### 실사용 추정

| 용도 | 호출 수 | 추정 비용 |
|---|---|---|
| AI 분석 사전 생성 | 콘텐츠 12 × 언어 2 = **24회 고정** | ~$0.01 |
| 댓글 번역 | 캐싱되어 댓글당 언어당 1회. ~30회 | ~$0.01 |
| 챗봇 답변 | 1,000회 (개발+리허설+심사 전부 포함한 넉넉한 추정) | ~$0.45 |
| STT / TTS | 브라우저 내장 | **$0** |
| 개발 중 재기동 워밍업 | 재기동 20회 × 24건 | ~$0.20 |
| **합계** | | **약 $0.7** |

**예산은 넉넉합니다.** 유일한 실질 리스크는 정상 사용이 아니라 **사고**입니다 —
재시도 루프나 useEffect 무한 호출 하나면 하룻밤에 샙니다.

### 비용 통제 장치 (구현됨)

| 장치 | 위치 | 효과 |
|---|---|---|
| **스코프 밖 질문은 호출 안 함** | `EvidenceFinder.classify()` | "날씨" 같은 질문은 비용 0 |
| **근거 없으면 호출 안 함** | `OpenAiProvider.answer()` | 지어낼 재료가 없으면 물어볼 이유도 없음 |
| **분석·번역 DB 캐싱** | `AiAnalysis` / `CommentTranslation` | 콘텐츠당 1회로 고정 |
| **일일 호출 상한** | `AiUsageGuard` (기본 800회/일) | 초과 시 **예외 대신 스텁 폴백** — 시연이 멈추지 않음 |
| **`max_tokens` 400** | `OpenAiClient` | 답변이 짧아 비용·지연 동시 감소. 음성으로 듣기에도 적당 |
| **본문 3,000자 절단** | `OpenAiProvider.analyze()` | 긴 기사의 입력 비용 억제 |
| **프롬프트 캐싱 정렬** | 시스템 프롬프트를 항상 앞에 | 반복되는 접두사가 자동 캐싱됨 |

> ⚠️ **상한에 걸려도 예외를 던지지 않습니다.** 스텁 응답으로 조용히 내려갑니다.
> 시연 중 화면이 죽는 것보다 답변 품질이 낮아지는 편이 낫기 때문입니다.
> 로그에 `일일 AI 호출 상한 도달` 이 찍히니 확인하세요.

### 사용량 확인

```bash
# 로그에서 50회마다 찍힙니다
grep "AI 호출" BE/logs/*.log
```

실제 청구액은 <https://platform.openai.com/usage> 에서 확인하고,
**Billing → Limits 에서 하드 상한($10)을 걸어두시길 권합니다.** 코드 레벨 가드보다 확실합니다.

---

## 8. 환경변수

전부 **`BE/.env`** 로 주입합니다. 템플릿은 `BE/.env.example`.

| 변수 | 기본값 | 용도 |
|---|---|---|
| `AI_PROVIDER` | `stub` | `stub` \| `openai` |
| `OPENAI_API_KEY` | — | `openai` 일 때만 필요 |
| `OPENAI_CHAT_MODEL` | `gpt-4o-mini` | |
| `OPENAI_MAX_OUTPUT_TOKENS` | `400` | 답변 길이 = 비용 |
| `OPENAI_DAILY_CALL_LIMIT` | `800` | 사고 방지 상한 |
| `AUTH_SECRET` | 로컬 기본값 | 간이 인증 토큰 서명 |

---

## 9. 전환 방법

```bash
cp BE/.env.example BE/.env
# BE/.env 에서 AI_PROVIDER=openai, OPENAI_API_KEY=sk-... 설정
cd BE && ./gradlew bootRun
```

기동 시 `BE/.env 로드됨` 로그가 뜨고, `AiAnalysisWarmup` 이 실제 분석을 생성합니다.
`provider=stub` 이 아니라 `provider=live` 로 찍히는지 확인하세요.

되돌리려면 `AI_PROVIDER=stub` 으로만 바꾸면 됩니다 — 코드 수정 불필요.

---

## 10. 구현 현황

| 항목 | 상태 |
|---|---|
| `AiProvider` 인터페이스 + 스텁 | ✅ |
| 근거 검색 · 스코프 제한 · citations | ✅ |
| AI 분석 사전 생성 + DB 캐싱 | ✅ |
| 댓글 번역 캐싱 | ✅ |
| SSE 스트리밍 | ✅ |
| `OpenAiProvider` (chat / analyze / translate) | ✅ 키만 넣으면 동작 |
| TTS — 브라우저 `speechSynthesis` | ✅ 무료 |
| STT — 브라우저 Web Speech API | ✅ 무료 |
| 예산 가드레일 (`AiUsageGuard`) | ✅ |

# 마스코트 "비엔이" 에셋

음성 AI 오버레이(Figma `7:1432` ~ `7:1605`)와 COMMUNITY 배너에서 씁니다.
현재 코드는 이 파일들이 없으면 이모지로 폴백합니다.

## 넣어야 할 파일

| 파일명 | 포즈 | 쓰이는 곳 | Figma 노드 |
|---|---|---|---|
| `bienie-listening.png` | 마이크를 든 모습 | 음성 오버레이 `LISTENING` / `TRANSCRIBING` | `7:1432` |
| `bienie-thinking.png` | 돋보기 + 태블릿을 든 모습 | 음성 오버레이 `THINKING` | `7:1548` |
| `bienie-banner.png` | COMMUNITY 배너용 포즈 | COMMUNITY 탭 배너 우측 | `6:751` |

**파일명을 그대로 맞춰주세요.** 코드가 이 이름으로 import 합니다.

## 권장 사양

- 포맷: **PNG (투명 배경)** — 오렌지 배너 위에도 올라가므로 배경이 있으면 안 됩니다
- 크기: **긴 변 기준 600px 이상**. 레티나 대응을 위해 표시 크기의 2배 이상
- 용량: 파일당 **300KB 이하** 권장. 넘으면 [squoosh.app](https://squoosh.app) 등으로 압축
- WebP 도 가능하지만, 그 경우 `.webp` 확장자로 넣고 알려주세요 (import 경로를 바꿔야 합니다)

## 넣는 방법

이 폴더(`FE/src/assets/mascot/`)에 그대로 복사하면 됩니다.
Vite 가 번들에 포함시키므로 별도 설정은 필요 없습니다.

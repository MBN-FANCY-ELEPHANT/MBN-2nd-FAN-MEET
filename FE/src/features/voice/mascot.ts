/**
 * 마스코트 "비엔이" 에셋 로더.
 *
 * `import.meta.glob` 을 쓰는 이유: 파일을 직접 import 하면 **파일이 없을 때 빌드가 깨집니다.**
 * glob 은 없으면 빈 객체를 돌려주므로, 이미지를 넣기 전에도 앱이 동작하고
 * `FE/src/assets/mascot/` 에 파일을 떨어뜨리는 순간 자동으로 잡힙니다.
 *
 * 넣어야 할 파일명은 `FE/src/assets/mascot/README.md` 참조.
 */
const files = import.meta.glob<string>("../../assets/mascot/*.{png,webp,svg}", {
  eager: true,
  import: "default",
});

function find(basename: string): string | null {
  const key = Object.keys(files).find((path) => path.includes(`/${basename}.`));
  return key ? files[key] : null;
}

export const MASCOT = {
  /** 마이크를 든 포즈 — LISTENING / TRANSCRIBING (Figma 7:1432) */
  listening: find("bienie-listening"),
  /** 돋보기 + 태블릿 포즈 — THINKING (Figma 7:1548) */
  thinking: find("bienie-thinking"),
  /** COMMUNITY 배너용 포즈 (Figma 6:751) */
  banner: find("bienie-banner"),
};

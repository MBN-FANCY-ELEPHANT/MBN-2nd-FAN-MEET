import { Fragment, useState } from "react";

import styles from "../../pages/ContentDetail.module.css";

/**
 * 기사 본문 렌더러 — 용어 하이라이트 포함 (Figma 6:267).
 *
 * 본문에 `[[용어|설명]]` 마크업이 들어 있고, 이를 파싱해 밑줄 친 용어로 렌더합니다.
 * 탭하면 검은 툴팁으로 설명이 뜹니다. **별도 API 가 없습니다** — 시드 데이터에
 * 마크업이 들어 있고 파싱은 여기서 끝납니다 (docs/design-spec.md §2 화면7).
 */

const TERM_PATTERN = /\[\[([^|\]]+)\|([^\]]*)\]\]/g;

type Segment =
  | { kind: "text"; value: string }
  | { kind: "term"; term: string; description: string };

function parse(body: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(TERM_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ kind: "text", value: body.slice(lastIndex, start) });
    }
    segments.push({ kind: "term", term: match[1], description: match[2] });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ kind: "text", value: body.slice(lastIndex) });
  }
  return segments;
}

export default function ArticleBody({ body }: { body: string }) {
  // 한 번에 하나의 툴팁만 엽니다. 여러 개가 겹치면 읽을 수 없습니다.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const segments = parse(body);

  return (
    <div className={styles.articleBody}>
      {segments.map((segment, index) =>
        segment.kind === "text" ? (
          <Fragment key={index}>{segment.value}</Fragment>
        ) : (
          <button
            key={index}
            className={styles.term}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
          >
            {segment.term}
            {openIndex === index && segment.description && (
              <span className={styles.tooltip}>{segment.description}</span>
            )}
          </button>
        ),
      )}
    </div>
  );
}

import Icon from "../ui/Icon";
import styles from "./AiPanel.module.css";

/**
 * AI 분석 패널의 **표현부** (Figma `AI Pannal` — 2:1066).
 *
 * 데이터 출처가 다른 두 곳이 **같은 생김새**를 써야 해서 분리했습니다:
 *  - `AiPanel` — 기사·영상 상세. `GET /contents/{id}/ai-analysis` 결과
 *  - `GatheringChatPage` — 모집 대화방 상단. 그 모임의 실제 정보로 만든 주제 요약
 *
 * ⚠️ 스타일은 `AiPanel.module.css` 를 그대로 씁니다. 한쪽만 고치면 두 화면의
 *    AI 패널이 서로 달라집니다 — 디자인에서는 같은 컴포넌트 인스턴스입니다.
 */
export type AiSummaryItem = { title: string; body: string };

export default function AiSummaryCard({
  title,
  time,
  summary,
  items,
}: {
  title: string;
  /** 상대 시각 등 우측 상단 보조 문구. 없으면 생략합니다 */
  time?: string;
  summary: string;
  items: AiSummaryItem[];
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.label}>
          <Icon name="aiSquare" size={24} />
          {title}
        </span>
        {time && <span className={styles.time}>{time}</span>}
      </div>

      <div className={styles.divider} />

      <p className={styles.summary}>{summary}</p>

      <div className={styles.items}>
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className={styles.item}>
            <p className={styles.itemTitle}>{item.title}</p>
            <p className={styles.itemBody}>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

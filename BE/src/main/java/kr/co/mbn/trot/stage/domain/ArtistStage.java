package kr.co.mbn.trot.stage.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 아티스트별 대표 무대 영상 — "이찬원 무대 보여줘" 의 답입니다.
 *
 * <p><b>왜 DB 에 두는가 (결정 로그 · 다시 논의하지 말 것):</b> LLM 에게 YouTube 주소를
 * 생성시키면 <b>존재하지 않는 영상이나 임베드가 차단된 영상</b>이 나옵니다. 이 프로젝트는
 * 이미 그 함정을 밟았습니다 — 임베드 차단 영상은 오류 없이 <b>검은 화면 + 스피너</b>만
 * 남기고 조용히 실패합니다. 시스템 프롬프트의 "근거에 없는 사실은 지어내지 마세요" 원칙과도
 * 정면으로 충돌합니다.
 *
 * <p>그래서 <b>AI 는 "무대 보여줘"라는 의도와 아티스트 이름만 판정</b>하고, 주소는 여기서
 * 옵니다. 지연 0 · 비용 0 · 결정적이며, 임베드 가능 여부를 시드 시점에 한 번만 검증하면 됩니다.
 *
 * <p>⚠️ {@code embedUrl} 을 교체할 때는 <b>반드시 iframe 안에서</b> 재생을 확인하세요.
 * 주소창에 {@code youtube.com/embed/...} 를 직접 여는 검증은 무의미합니다 (최상위 탐색이면
 * 정상 영상도 오류 153 이 납니다).
 */
@Entity
@Table(name = "artist_stage")
public class ArtistStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 랜딩의 아티스트 이름과 정확히 같아야 합니다 (`FE/src/data/programs.ts`). */
    @Column(name = "artist_name", nullable = false, unique = true, length = 50)
    private String artistName;

    @Column(nullable = false, length = 200)
    private String title;

    /** YouTube **임베드** URL. `watch?v=` 가 아니라 `embed/` 형식입니다. */
    @Column(name = "embed_url", nullable = false, length = 300)
    private String embedUrl;

    @Column(name = "thumbnail_url", length = 300)
    private String thumbnailUrl;

    protected ArtistStage() {
        // JPA
    }

    public Long getId() {
        return id;
    }

    public String getArtistName() {
        return artistName;
    }

    public String getTitle() {
        return title;
    }

    public String getEmbedUrl() {
        return embedUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }
}

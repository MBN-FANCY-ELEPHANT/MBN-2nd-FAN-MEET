package kr.co.mbn.trot.content.domain;

/**
 * 콘텐츠 종류.
 *
 * <p>기사·영상·아티스트 게시물을 한 콘텐츠 흐름에서 다룹니다.
 * 그래서 별도 테이블이 아니라 단일 테이블 + 타입 판별자 구조입니다.
 * 타입에 따라 카드 하단 메타와 상세 라우트가 갈립니다 (docs/design-spec.md §2 화면1).
 */
public enum ContentType {
    /** 기사 — 카드 하단에 채널명 + 상대 시각. 상세는 /articles/:id */
    ARTICLE,
    /** 영상 — 카드 하단에 재생 시간 + 조회수. 상세는 /videos/:id */
    VIDEO,
    /** 아티스트가 직접 작성한 SNS형 게시물. 댓글은 기존 Content 댓글 API를 공유합니다. */
    POST
}

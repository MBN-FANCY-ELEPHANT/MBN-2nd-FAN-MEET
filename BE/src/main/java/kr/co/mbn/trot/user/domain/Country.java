package kr.co.mbn.trot.user.domain;

/**
 * 사용자 국가. 댓글의 국가 배지에 사용합니다.
 *
 * <p>시드 유저의 국가를 <b>의도적으로 분산</b>시킵니다. 댓글 화면에 여러 국기가 섞여 보이는 것이
 * "글로벌 팬덤"을 증명하는 가장 직접적인 장면입니다 (docs/mvp-scope.md 골든 패스 ④).
 */
public enum Country {
    KR,
    US,
    JP,
    FR,
    ES,
    CN,
    RU
}

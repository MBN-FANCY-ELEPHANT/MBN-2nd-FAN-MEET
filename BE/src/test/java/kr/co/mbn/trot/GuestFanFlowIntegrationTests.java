package kr.co.mbn.trot;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** 게스트가 발급받은 하나의 토큰으로 팬 참여 기능 전체를 사용할 수 있는지 확인합니다. */
@SpringBootTest(properties = "app.ai.provider=stub")
@AutoConfigureMockMvc
class GuestFanFlowIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("게스트 닉네임은 숫자 없는 한글 동물 이름이며 이미 배정된 이름을 제외한다")
    void guestNicknameUsesUniqueKoreanAnimalName() throws Exception {
        String firstRegistration = registerGuest("김용빈");
        String secondRegistration = registerGuest("김용빈");

        String firstNickname = JsonPath.read(firstRegistration, "$.user.nickname");
        String secondNickname = JsonPath.read(secondRegistration, "$.user.nickname");

        assertTrue(firstNickname.matches("^[가-힣]+$"));
        assertTrue(secondNickname.matches("^[가-힣]+$"));
        assertNotEquals(firstNickname, secondNickname);
    }

    private String registerGuest(String artistName) throws Exception {
        return mockMvc.perform(post("/api/v1/auth/guest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"starId\":1,\"artistName\":\"" + artistName + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    @DisplayName("스타 선택 게스트가 닉네임 변경, 모임, 채팅, 좋아요와 댓글을 모두 사용한다")
    void guestTokenConnectsAllFanInteractions() throws Exception {
        // 1. 랜딩의 스타 선택으로 서버 사용자와 토큰을 새로 발급받습니다.
        String registration = mockMvc.perform(post("/api/v1/auth/guest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "starId": 1,
                                  "artistName": "김용빈",
                                  "locale": "KO",
                                  "country": "KR"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.user.nickname").isNotEmpty())
                .andExpect(jsonPath("$.user.favoriteStarId").value(1))
                .andExpect(jsonPath("$.user.favoriteArtistName").value("김용빈"))
                .andReturn().getResponse().getContentAsString();

        String token = JsonPath.read(registration, "$.accessToken");
        String authorization = "Bearer " + token;

        // 2. 같은 토큰으로 내 정보를 읽고 룰렛 닉네임을 직접 정한 값으로 변경합니다.
        mockMvc.perform(get("/api/v1/users/me").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.favoriteArtistName").value("김용빈"));

        mockMvc.perform(patch("/api/v1/users/me/nickname")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"용빈바라기\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("용빈바라기"));

        // 3. 401이 발생하던 모임 신청과 채팅 세션도 동일 토큰으로 정상 생성되어야 합니다.
        mockMvc.perform(post("/api/v1/gatherings/1/applications")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note\":\"통합 테스트 신청\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("APPLIED"));

        mockMvc.perform(post("/api/v1/chat/sessions")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "starId": 1,
                                  "artistName": "김용빈",
                                  "locale": "KO"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionId").isNotEmpty());

        // 4. 스타 콘텐츠 좋아요와 댓글 작성 뒤 상세·댓글 목록의 개수와 작성자를 확인합니다.
        mockMvc.perform(post("/api/v1/contents/1/like")
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likeCount").value(213));

        String createdComment = mockMvc.perform(post("/api/v1/contents/1/comments")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"새 글 정말 기다렸어요!\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.author.nickname").value("용빈바라기"))
                .andExpect(jsonPath("$.body").value("새 글 정말 기다렸어요!"))
                .andReturn().getResponse().getContentAsString();

        // 5. 방금 작성한 댓글에도 좋아요를 누르고 목록에서 개수와 내 상태가 함께 보이는지 확인합니다.
        Number commentId = JsonPath.read(createdComment, "$.id");
        mockMvc.perform(post("/api/v1/comments/{id}/like", commentId.longValue())
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likeCount").value(1));

        mockMvc.perform(get("/api/v1/contents/1")
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likeCount").value(213))
                .andExpect(jsonPath("$.commentCount").value(4));

        mockMvc.perform(get("/api/v1/contents/1/comments")
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].author.nickname").value("용빈바라기"))
                .andExpect(jsonPath("$.content[0].body").value("새 글 정말 기다렸어요!"))
                .andExpect(jsonPath("$.content[0].liked").value(true))
                .andExpect(jsonPath("$.content[0].likeCount").value(1));
    }

    @Test
    @DisplayName("Vite 대체 포트의 모임 신청 preflight를 허용한다")
    void localViteFallbackPortCanPreflightGatheringApplication() throws Exception {
        // 5173이 사용 중일 때 Vite가 선택하는 다음 포트에서도 신청 POST가 CORS를 통과해야 합니다.
        mockMvc.perform(options("/api/v1/gatherings/1/applications")
                        .header("Origin", "http://localhost:5174")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5174"));
    }

    @Test
    @DisplayName("게스트 인증 API가 validation과 HTTP 오류 계약을 지킨다")
    void guestValidationAndAuthenticationErrorsMatchContract() throws Exception {
        // 존재하지 않는 스타와 공백 이름은 각각 리소스 오류와 요청 검증 오류로 구분합니다.
        mockMvc.perform(post("/api/v1/auth/guest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"starId\":999,\"artistName\":\"없는 스타\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("STAR_NOT_FOUND"));

        mockMvc.perform(post("/api/v1/auth/guest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"starId\":1,\"artistName\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));

        // 닉네임 변경은 쓰기 API이므로 토큰이 없으면 표준 JSON 401을 반환해야 합니다.
        mockMvc.perform(patch("/api/v1/users/me/nickname")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"새닉네임\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        String registration = mockMvc.perform(post("/api/v1/auth/guest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"starId\":1,\"artistName\":\"김용빈\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String authorization = "Bearer " + JsonPath.read(registration, "$.accessToken");

        // 시드 사용자의 닉네임과 겹치면 DB 예외가 아니라 명시적인 409 계약으로 응답합니다.
        mockMvc.perform(patch("/api/v1/users/me/nickname")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"트롯덕후\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("NICKNAME_ALREADY_EXISTS"));
    }
}

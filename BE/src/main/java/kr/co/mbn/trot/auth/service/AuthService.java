package kr.co.mbn.trot.auth.service;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.mbn.trot.auth.dto.AuthResponse;
import kr.co.mbn.trot.auth.dto.GuestRegistrationRequest;
import kr.co.mbn.trot.common.error.ApiException;
import kr.co.mbn.trot.common.error.ErrorCode;
import kr.co.mbn.trot.common.security.CurrentUserProvider;
import kr.co.mbn.trot.star.repository.StarRepository;
import kr.co.mbn.trot.user.domain.Country;
import kr.co.mbn.trot.user.domain.Locale;
import kr.co.mbn.trot.user.domain.User;
import kr.co.mbn.trot.user.domain.UserRole;
import kr.co.mbn.trot.user.dto.UserResponse;
import kr.co.mbn.trot.user.repository.UserRepository;

/**
 * 간이 인증. 스타 선택 게스트 또는 기존 데모 계정에 비밀번호 없이 서명 토큰을 발급합니다.
 * 회원가입 마찰을 줄이되 쓰기 API에서는 사용자를 안정적으로 구분하기 위한 흐름입니다.
 */
@Service
@Transactional(readOnly = true)
public class AuthService {

    // 숫자나 수식어를 붙이지 않습니다. 댓글에서 짧고 또렷하게 보이는 한글 동물 이름만 배정합니다.
    private static final List<String> ANIMAL_NICKNAMES = List.of(
            "부엉이", "코끼리", "다람쥐", "고슴도치", "햄스터", "펭귄", "곰", "토끼",
            "수달", "여우", "고양이", "강아지", "병아리", "너구리", "판다", "알파카",
            "오리너구리", "카피바라", "미어캣", "쿼카", "친칠라", "라쿤", "사막여우", "북극곰",
            "돌고래", "해달", "물개", "바다사자", "고래", "범고래", "상어", "가오리",
            "기린", "얼룩말", "하마", "코뿔소", "사자", "호랑이", "표범", "치타",
            "캥거루", "코알라", "원숭이", "고릴라", "낙타", "라마", "사슴", "순록",
            "독수리", "참새", "앵무새", "공작", "플라밍고", "두루미", "백조", "오리",
            "거북이", "도마뱀", "개구리", "도롱뇽", "나비", "무당벌레", "꿀벌", "반딧불이");
    private static final String DEFAULT_PROFILE_IMAGE =
            "https://placehold.co/80x80/F58220/FFFFFF?text=FAN";

    private final UserRepository userRepository;
    private final StarRepository starRepository;
    private final DemoTokenService tokenService;
    private final CurrentUserProvider currentUser;

    public AuthService(
            UserRepository userRepository,
            StarRepository starRepository,
            DemoTokenService tokenService,
            CurrentUserProvider currentUser) {
        this.userRepository = userRepository;
        this.starRepository = starRepository;
        this.tokenService = tokenService;
        this.currentUser = currentUser;
    }

    /**
     * 스타 선택만으로 쓰기 API를 사용할 수 있는 팬 계정과 토큰을 한 번에 발급합니다.
     * 랜덤 닉네임은 DB에서 중복을 확인하므로 프론트의 기기별 랜덤값보다 사용자 식별에 안전합니다.
     */
    @Transactional
    public AuthResponse registerGuest(GuestRegistrationRequest request) {
        if (!starRepository.existsById(request.starId())) {
            throw new ApiException(ErrorCode.STAR_NOT_FOUND);
        }

        Locale locale = request.locale() == null ? Locale.KO : request.locale();
        Country country = request.country() == null ? defaultCountry(locale) : request.country();
        User user = userRepository.save(User.guest(
                generateUniqueNickname(),
                DEFAULT_PROFILE_IMAGE,
                country,
                locale,
                request.starId(),
                request.artistName().trim()));

        return new AuthResponse(tokenService.issue(user.getId()), UserResponse.from(user));
    }

    /** 사용자가 직접 고른 닉네임은 앞뒤 공백을 제거하고 전체 사용자 기준으로 중복 검사합니다. */
    @Transactional
    public UserResponse updateNickname(String requestedNickname) {
        Long userId = currentUser.requireUserId();
        String nickname = requestedNickname.trim();

        // Bean Validation은 원문 길이를 보므로 공백 제거 뒤의 실제 표시 길이도 다시 확인합니다.
        if (nickname.length() < 2 || nickname.length() > 30) {
            throw new ApiException(ErrorCode.INVALID_REQUEST, "닉네임은 2~30자로 입력해 주세요.");
        }

        if (userRepository.existsByNicknameAndIdNot(nickname, userId)) {
            throw new ApiException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        user.changeNickname(nickname);
        return UserResponse.from(user);
    }

    /** 이미 사용 중인 이름을 제외한 한글 동물 이름 중 하나를 무작위로 반환합니다. */
    private String generateUniqueNickname() {
        Set<String> usedNicknames = userRepository.findNicknamesIn(ANIMAL_NICKNAMES).stream()
                .collect(Collectors.toSet());
        List<String> availableNicknames = ANIMAL_NICKNAMES.stream()
                .filter(nickname -> !usedNicknames.contains(nickname))
                .toList();

        if (availableNicknames.isEmpty()) {
            throw new ApiException(ErrorCode.NICKNAME_POOL_EXHAUSTED);
        }

        return availableNicknames.get(ThreadLocalRandom.current().nextInt(availableNicknames.size()));
    }

    /** 국가를 따로 보내지 않은 경우 선택 언어에 가장 자연스러운 기본 국가 배지를 정합니다. */
    private Country defaultCountry(Locale locale) {
        return switch (locale) {
            case EN -> Country.US;
            case FR -> Country.FR;
            case JA -> Country.JP;
            case ES -> Country.ES;
            case ZH -> Country.CN;
            case RU -> Country.RU;
            case KO -> Country.KR;
        };
    }

    /** 로그인 화면에 노출할 데모 계정 목록. 국가가 서로 다르게 시드돼 있습니다. */
    public List<UserResponse> getDemoUsers() {
        return userRepository.findByRoleOrderByIdAsc(UserRole.MEMBER).stream()
                .map(UserResponse::from)
                .toList();
    }

    public AuthResponse login(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        return new AuthResponse(tokenService.issue(user.getId()), UserResponse.from(user));
    }

    public UserResponse getMe() {
        return userRepository.findById(currentUser.requireUserId())
                .map(UserResponse::from)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }
}

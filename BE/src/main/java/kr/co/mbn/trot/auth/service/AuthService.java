package kr.co.mbn.trot.auth.service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

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

    // 화면의 룰렛 느낌은 유지하되 숫자 접미사로 실제 사용자 간 충돌 가능성을 낮춥니다.
    private static final List<String> NICKNAME_PREFIXES =
            List.of("다정한", "빛나는", "신나는", "든든한", "설레는", "행복한");
    private static final List<String> NICKNAME_NOUNS =
            List.of("햄스터", "별사탕", "응원봉", "해바라기", "꿀벌", "구름");
    private static final String DEFAULT_PROFILE_IMAGE =
            "https://placehold.co/80x80/F58220/FFFFFF?text=FAN";
    private static final int NICKNAME_ATTEMPTS = 30;

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

    /** 짧고 읽기 쉬운 팬 닉네임을 만들고 시드·게스트 계정과 겹치지 않는 값만 반환합니다. */
    private String generateUniqueNickname() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int attempt = 0; attempt < NICKNAME_ATTEMPTS; attempt++) {
            String nickname = NICKNAME_PREFIXES.get(random.nextInt(NICKNAME_PREFIXES.size()))
                    + NICKNAME_NOUNS.get(random.nextInt(NICKNAME_NOUNS.size()))
                    + random.nextInt(1000, 10000);
            if (!userRepository.existsByNickname(nickname)) {
                return nickname;
            }
        }
        throw new ApiException(ErrorCode.INTERNAL_ERROR, "랜덤 닉네임 생성에 실패했습니다.");
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

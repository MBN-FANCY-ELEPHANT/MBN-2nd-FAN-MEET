package kr.co.mbn.trot.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.user.domain.User;
import kr.co.mbn.trot.user.domain.UserRole;

public interface UserRepository extends JpaRepository<User, Long> {

    /** 로그인 화면의 데모 계정 목록. 국가가 서로 다르게 시드돼 있습니다. */
    List<User> findByRoleOrderByIdAsc(UserRole role);

    /** 서버가 만든 랜덤 닉네임과 사용자가 직접 정한 닉네임 모두 같은 유일성 규칙을 적용합니다. */
    boolean existsByNickname(String nickname);

    /** 현재 사용자가 자기 닉네임을 그대로 저장하는 경우는 중복으로 보지 않습니다. */
    boolean existsByNicknameAndIdNot(String nickname, Long id);
}

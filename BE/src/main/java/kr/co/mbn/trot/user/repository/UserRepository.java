package kr.co.mbn.trot.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.user.domain.User;
import kr.co.mbn.trot.user.domain.UserRole;

public interface UserRepository extends JpaRepository<User, Long> {

    /** 로그인 화면의 데모 계정 목록. 국가가 서로 다르게 시드돼 있습니다. */
    List<User> findByRoleOrderByIdAsc(UserRole role);
}

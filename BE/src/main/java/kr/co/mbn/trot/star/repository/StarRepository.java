package kr.co.mbn.trot.star.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.star.domain.Star;

public interface StarRepository extends JpaRepository<Star, Long> {
}

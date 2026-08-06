package kr.co.mbn.trot.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.mbn.trot.chat.domain.ChatSession;

public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
}

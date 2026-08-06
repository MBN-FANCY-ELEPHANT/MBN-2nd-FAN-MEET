package kr.co.mbn.trot.ai.provider.openai;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 예산 가드레일 — 하루 LLM 호출 횟수 상한.
 *
 * <p><b>왜 필요한가:</b> 이번 프로젝트의 예산은 5~10달러입니다. gpt-4o-mini 단가상 정상적인
 * 데모로는 절대 도달할 수 없는 금액이지만, <b>무한 루프나 잘못된 재시도 하나면 하룻밤에 샙니다.</b>
 * 정상 사용을 막지 않으면서 사고만 차단하는 선에서 상한을 둡니다.
 *
 * <p>상한에 걸리면 예외를 던지지 않고 <b>스텁 응답으로 폴백</b>합니다 —
 * 시연 중에 화면이 죽는 것보다 답변 품질이 낮아지는 편이 낫습니다.
 */
@Component
public class AiUsageGuard {

    private static final Logger log = LoggerFactory.getLogger(AiUsageGuard.class);

    private final int dailyLimit;
    private final AtomicInteger callsToday = new AtomicInteger();
    private volatile LocalDate windowDate = LocalDate.now(ZoneOffset.UTC);

    public AiUsageGuard(@Value("${app.ai.openai.daily-call-limit:800}") int dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    /** 호출 가능하면 true 를 돌려주고 카운트를 올립니다. 상한 초과면 false. */
    public synchronized boolean tryAcquire() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        if (!today.equals(windowDate)) {
            windowDate = today;
            callsToday.set(0);
        }

        if (callsToday.get() >= dailyLimit) {
            log.warn("일일 AI 호출 상한({}) 도달 — 스텁 응답으로 폴백합니다.", dailyLimit);
            return false;
        }

        int used = callsToday.incrementAndGet();
        if (used % 50 == 0) {
            log.info("AI 호출 {}/{} 사용", used, dailyLimit);
        }
        return true;
    }

    public int used() {
        return callsToday.get();
    }

    public int limit() {
        return dailyLimit;
    }
}

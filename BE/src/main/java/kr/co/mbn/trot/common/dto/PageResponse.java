package kr.co.mbn.trot.common.dto;

import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;

/**
 * docs/api-spec.yaml 의 {@code PageMeta + content} 형태와 1:1 대응합니다.
 * Spring 의 {@code Page} 를 그대로 직렬화하면 스펙과 필드명이 달라지므로 반드시 이 타입으로 감싸세요.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {

    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast());
    }
}

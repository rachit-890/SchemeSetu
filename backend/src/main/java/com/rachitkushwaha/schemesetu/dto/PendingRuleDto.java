package com.rachitkushwaha.schemesetu.dto;

import java.time.LocalDateTime;

public record PendingRuleDto(
    Long id,
    Long schemeId,
    String schemeName,
    String field,
    String operator,
    String value,
    String status,
    LocalDateTime createdAt
) {}

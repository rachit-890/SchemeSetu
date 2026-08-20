package com.rachitkushwaha.schemesetu.dto;

public record RejectedRuleDto(
    ExtractedRuleDto rawRule,
    String reason
) {}

package com.rachitkushwaha.schemesetu.dto;

public record MatchedCriterionDto(
    String field,
    String operator,
    String ruleValue,
    String actualValue
) {}

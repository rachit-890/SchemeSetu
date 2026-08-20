package com.rachitkushwaha.schemesetu.dto;

import java.util.List;

public record RuleValidationResult(
    List<ExtractedRuleDto> validRules,
    List<RejectedRuleDto> rejectedRules
) {}

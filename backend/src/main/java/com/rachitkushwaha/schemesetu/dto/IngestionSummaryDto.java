package com.rachitkushwaha.schemesetu.dto;

import java.util.List;

public record IngestionSummaryDto(
    Long schemeId,
    int rulesPersistedCount,
    List<RejectedRuleDto> rejectedRules,
    int embeddedChunkCount
) {}

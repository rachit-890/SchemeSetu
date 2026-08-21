package com.rachitkushwaha.schemesetu.dto;

import java.util.List;

public record SchemeMatchResponse(
    Long schemeId,
    String schemeName,
    String category,
    String issuingBody,
    String sourceUrl,
    List<String> matchedCriteria,
    ExplanationDto explanation
) {}

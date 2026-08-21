package com.rachitkushwaha.schemesetu.dto;

import java.util.List;

public record QuestionnaireAnswerResponse(
    Long sessionId,
    String status,
    QuestionDto question,
    List<SchemeMatchResponse> results
) {}

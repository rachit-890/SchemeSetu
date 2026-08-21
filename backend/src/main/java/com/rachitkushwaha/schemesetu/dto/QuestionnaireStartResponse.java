package com.rachitkushwaha.schemesetu.dto;

public record QuestionnaireStartResponse(
    Long sessionId,
    String status,
    QuestionDto question
) {}

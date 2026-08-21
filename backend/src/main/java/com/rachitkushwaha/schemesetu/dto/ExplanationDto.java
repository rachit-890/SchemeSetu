package com.rachitkushwaha.schemesetu.dto;

import java.util.List;

public record ExplanationDto(
    String reasoning,
    List<String> applicationSteps,
    boolean usedFallback
) {
    public ExplanationDto(String reasoning, List<String> applicationSteps) {
        this(reasoning, applicationSteps, false);
    }
}

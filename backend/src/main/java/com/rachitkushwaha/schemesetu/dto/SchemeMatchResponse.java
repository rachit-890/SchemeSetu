package com.rachitkushwaha.schemesetu.dto;

import com.rachitkushwaha.schemesetu.entity.Scheme;

import java.util.List;
import java.util.Map;

public record SchemeMatchResponse(
    Long schemeId,
    String schemeName,
    String description,
    String category,
    String issuingBody,
    String sourceUrl,
    String applicationProcess,
    List<String> matchedCriteria,
    ExplanationDto explanation,
    boolean translationAvailable
) {
    public static SchemeMatchResponse from(Scheme scheme, List<String> matchedCriteria, ExplanationDto explanation, String lang) {
        String langKey = (lang != null && !lang.isBlank()) ? lang.trim().toLowerCase() : "en";
        boolean isEn = "en".equals(langKey);

        Map<String, String> langTranslation = null;
        if (!isEn && scheme.getTranslations() != null) {
            langTranslation = scheme.getTranslations().get(langKey);
        }

        boolean translationAvailable = isEn || (langTranslation != null);

        String name = (langTranslation != null && langTranslation.get("name") != null)
                ? langTranslation.get("name") : scheme.getName();
        String description = (langTranslation != null && langTranslation.get("description") != null)
                ? langTranslation.get("description") : scheme.getDescription();
        String applicationProcess = (langTranslation != null && langTranslation.get("applicationProcess") != null)
                ? langTranslation.get("applicationProcess") : scheme.getApplicationProcess();

        return new SchemeMatchResponse(
                scheme.getId(),
                name,
                description,
                scheme.getCategory(),
                scheme.getIssuingBody(),
                scheme.getSourceUrl(),
                applicationProcess,
                matchedCriteria,
                explanation,
                translationAvailable
        );
    }
}
